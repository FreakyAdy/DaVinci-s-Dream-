# Reinforcement Learning Specification
## Da Vinci's Dream: Continuous Control Flapping Policy

### 1. Gymnasium Environment: `OrnithopterEnv`

The reinforcement learning agent interacts with the custom Gymnasium environment `OrnithopterEnv-v0`.

#### Observation Space (Continuous, $\mathbb{R}^{10}$)
Normalized observation vector bounded in $[-1, 1]$:
1. Normalized altitude: $\tilde{y} = \frac{y - 12.5}{15.0}$
2. Normalized forward velocity: $\tilde{u} = \frac{u - 8.0}{8.0}$
3. Normalized vertical velocity: $\tilde{v} = \frac{v}{5.0}$
4. Normalized pitch angle: $\tilde{\theta} = \frac{\theta}{\pi / 4}$
5. Normalized pitch rate: $\tilde{q} = \frac{q}{2.0}$
6. Wingbeat phase sine: $\sin(\phi)$
7. Wingbeat phase cosine: $\cos(\phi)$
8. Normalized target distance: $\tilde{d}_{target} = \frac{x_{target} - x}{x_{target}}$
9. Ambient horizontal wind: $\frac{W_x}{5.0}$
10. Ambient vertical wind: $\frac{W_y}{5.0}$

#### Action Space (Continuous, $\mathbb{R}^3$, $[-1, 1]$)
The agent produces continuous actions mapped via linear transformations to mechanical actuators:
1. **Flapping Amplitude ($a_0 \in [-1, 1]$)**: Mapped to $A \in [0.1, 0.65]$ radians ($\sim 6^\circ$ to $37^\circ$).
2. **Flapping Frequency ($a_1 \in [-1, 1]$)**: Mapped to $f \in [0.5, 3.5]$ Hz.
3. **Tail Pitch Elevator ($\delta_{tail} \in [-1, 1]$)**: Mapped to $\delta \in [-0.35, 0.35]$ radians ($\sim \pm 20^\circ$).

---

### 2. Reward Design & Anti-Exploitation Formulations

The multi-objective reward function balances forward range progress, flight stability, energy efficiency, and safe landing incentives:

$$R_t = R_{progress} + R_{alive} + R_{stability} - R_{energy} + R_{terminal}$$

1. **Progress Reward**:
   $$R_{progress} = 1.5 \cdot \frac{u}{V_{ref}} \cdot \Delta t$$
2. **Alive & Target Distance Reward**:
   $$R_{alive} = 0.05 \cdot \Delta t$$
   $$R_{target} = 0.5 \cdot \left(1 - \frac{|x_{target} - x|}{x_{target}}\right)$$
3. **Attitude Stability Penalty**:
   Penalizes steep stalls or inverted dives:
   $$R_{stability} = -0.5 \cdot \theta^2 - 0.2 \cdot q^2$$
4. **Energy Cost**:
   Flapping at high amplitude and frequency consumes human/mechanical power:
   $$R_{energy} = 0.08 \cdot (A \cdot f)^2$$
5. **Terminal Incentives**:
   - Successful landing in target zone: $+100.0$
   - Soft landing (decent distance): $+20.0$
   - Crash or severe stall: $-50.0$
   - Out of bounds / retreat: $-30.0$

---

### 3. Baseline Rule-Based Controller

To validate the RL policy against a known engineering control law, the laboratory provides an automated proportional pitch governor with altitude-adaptive flapping:
- **Pitch Control**: $\delta_{tail} = -K_p (\theta - \theta_{target}) - K_d q$, where $\theta_{target} = 0.05$ rad ($\approx 3^\circ$ nose-up glide angle).
- **Flapping Amplitude**: $A = 0.45$ rad if altitude drops below reference or airspeed $u < 7.0$ m/s; otherwise glides at $A = 0.1$ rad.
- **Flapping Frequency**: $f = 2.0$ Hz.

---

### 4. PPO Training Configuration

- **Framework**: PyTorch + Stable-Baselines3 (SB3) PPO.
- **Policy Architecture**: Actor-Critic MLP with $[128, 128]$ hidden layers and `Tanh` activations.
- **Hyperparameters**:
  - Timesteps: Default 50,000 to 100,000 steps.
  - Learning rate: $3 \times 10^{-4}$ with linear schedule.
  - $\gamma$ (Discount factor): $0.99$
  - $\lambda$ (GAE parameter): $0.95$
  - Clip range: $0.2$
  - Batch size: 64
  - Entropy coefficient: $0.01$
- **Checkpoint Location**: `models/ornithopter_ppo.zip`
- **Telemetry Log**: `results/training_history.json` and `results/evaluation_benchmark.json`
