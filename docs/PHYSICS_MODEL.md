# Flight Physics Engine & Aerodynamic Model
## Da Vinci's Dream: 2D Flapping Ornithopter Simulation

### 1. Mathematical Formulation

The simulation models a semi-rigid articulated flapping ornithopter moving in a vertical planar field $(x, y)$ subject to gravity, aerodynamic lift and drag, quasi-steady flapping-induced thrust and lift, pitch moments, and ambient wind disturbances.

#### Coordinate System & State Vector
- $x$: Horizontal position (meters), positive forward.
- $y$: Altitude above ground (meters), positive upward.
- $u = \dot{x}$: Horizontal ground velocity ($m/s$).
- $v = \dot{y}$: Vertical ground velocity ($m/s$).
- $\theta$: Pitch angle (radians), positive pitch up (nose up).
- $q = \dot{\theta}$: Pitch rate ($rad/s$).
- $\phi$: Flapping phase (radians, $[0, 2\pi)$).

State Vector:
$$\mathbf{s} = [x, y, u, v, \theta, q, \phi]^T$$

---

### 2. Relative Airspeed and Angle of Attack

Given horizontal wind $W_x$ and vertical wind $W_y$:
$$u_{rel} = u - W_x$$
$$v_{rel} = v - W_y$$
$$V_\infty = \sqrt{u_{rel}^2 + v_{rel}^2}$$
$$\gamma = \text{atan2}(v_{rel}, u_{rel}) \quad (\text{Flight path angle relative to air})$$
$$\alpha = \theta - \gamma \quad (\text{Angle of attack})$$

To model stall realistically, the lift coefficient $C_L(\alpha)$ and drag coefficient $C_D(\alpha)$ incorporate stall limits:
$$C_L(\alpha) = C_{L0} + C_{L\alpha} \cdot \sin(2\alpha) \cdot e^{-(\alpha/\alpha_{stall})^4}$$
$$C_D(\alpha) = C_{D0} + C_{Di} \cdot \sin^2(\alpha) + C_{D,stall} \cdot (1 - \cos(\alpha))$$

---

### 3. Flapping Kinematics and Dynamic Aerodynamics

Leonardo's ornithopter harnesses reciprocal wing flapping. Let $A$ be flapping amplitude (radians) and $f$ be flapping frequency ($Hz$), driven by action input:
$$\omega = 2\pi f$$
$$\dot{\phi} = \omega$$
$$\beta(t) = A \cdot \sin(\phi) \quad (\text{Wing stroke angle})$$
$$\dot{\beta}(t) = A \cdot \omega \cdot \cos(\phi) \quad (\text{Wing angular velocity})$$

The flapping motion induces an effective normal velocity across the wing span $b$:
$$v_{flap} = \frac{1}{2} b \cdot \dot{\beta}(t)$$

During the downstroke ($\dot{\beta} < 0$), the wing compresses air downward, generating upward lift and a forward propulsive thrust component through passive aeroelastic wing pitch twist $\psi_{wing}$:
$$L_{flap} = \frac{1}{2} \rho S_{wing} \cdot C_{L,flap} \cdot \left| \dot{\beta} \right| \cdot \max(0, -\dot{\beta}) \cdot \frac{b}{2}$$
$$T_{flap} = \eta_{prop} \cdot L_{flap} \cdot \cos(\theta)$$

Total aerodynamic forces in body and wind axes are projected to inertial axes:
$$F_x = T_{flap} - D \cdot \cos(\gamma) - L \cdot \sin(\gamma)$$
$$F_y = L_{flap} + L \cdot \cos(\gamma) - D \cdot \sin(\gamma) - m \cdot g$$

Where:
- $L = \frac{1}{2} \rho V_\infty^2 S_{wing} C_L(\alpha)$
- $D = \frac{1}{2} \rho V_\infty^2 S_{wing} C_D(\alpha)$

---

### 4. Pitch Dynamics & Tail Stabilizer

The ornithopter's pitch is governed by aerodynamic pitching moment, tail elevator deflection $\delta_{tail}$, and damping:
$$M_{pitch} = \frac{1}{2} \rho V_\infty^2 S_{wing} c_{chord} \cdot \left( C_{M0} + C_{M\alpha} \cdot \alpha + C_{M\delta} \cdot \delta_{tail} \right) - d_{pitch} \cdot q$$
$$\dot{q} = \frac{M_{pitch}}{I_{yy}}$$
$$\dot{\theta} = q$$

---

### 5. Numerical Integration

The system uses a fixed timestep $\Delta t = 0.02$ s (50 Hz) integrated via semi-implicit symplectic Euler or Runge-Kutta 2nd order (RK2):
$$u(t+\Delta t) = u(t) + \frac{F_x}{m} \Delta t$$
$$v(t+\Delta t) = v(t) + \frac{F_y}{m} \Delta t$$
$$x(t+\Delta t) = x(t) + u(t+\Delta t) \Delta t$$
$$y(t+\Delta t) = y(t) + v(t+\Delta t) \Delta t$$
$$q(t+\Delta t) = q(t) + \frac{M_{pitch}}{I_{yy}} \Delta t$$
$$\theta(t+\Delta t) = \theta(t) + q(t+\Delta t) \Delta t$$
$$\phi(t+\Delta t) = (\phi(t) + \omega \Delta t) \pmod{2\pi}$$

---

### 6. Ground Collision & Landing Detection
- **Elevated Launch Platform**: $x \in [0, 15]$ meters, height $y_{launch} = 25$ meters.
- **Valley Ground**: $y = 0$ meters for $x > 15$.
- **Target Landing Zone**: $x \in [180, 220]$ meters, $y \approx 0$ meters.
- **Crash Condition**: $y \le 0$ with $|v| > 3.0$ m/s or $|\theta| > 35^\circ$ or $u < 1.0$ m/s.
- **Successful Landing**: $x \ge 180$, $y \le 1.0$, $|v| \le 2.5$ m/s, and $|\theta| \le 20^\circ$.
