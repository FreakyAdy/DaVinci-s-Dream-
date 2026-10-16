# Quality Assurance & Test Plan
## Da Vinci's Dream

### 1. Backend Physics & RL Testing (Automated via Pytest)
- **`test_dynamics.py`**:
  - Test gravity effect: Freefall with zero lift demonstrates downward acceleration $a_y = -9.81$ m/s$^2$.
  - Test aerodynamic drag: Forward gliding with zero thrust experiences velocity decay proportional to $V_\infty^2$.
  - Test flapping lift and thrust: Active flapping generates measurable positive vertical lift force and forward thrust.
  - Test pitch damping & elevator control: Positive elevator deflection induces nose-up pitching moment.
  - Test wind disturbances: Tailwind increases ground speed; headwind increases relative airspeed and lift.
  - Test ground collision: Ground impact ($y \le 0$) flags crash termination if velocity or pitch exceeds tolerance.
  - Test landing zone arrival: Low vertical speed and shallow pitch at $x \ge 180$ flags successful landing.
  - Test deterministic reproducibility: Identical seeds and control sequences generate bit-for-bit identical trajectories.
- **`test_rl_env.py`**:
  - Validates Gymnasium observation bounds $[-1, 1]$ and action clipping.
  - Checks reset state invariants.
  - Verifies reward penalties for stalls, crashes, and excessive energy.
- **`test_api.py`**:
  - Validates FastAPI endpoints (`/api/health`, `/api/machines`, `/api/simulation/run`, `/api/training/status`).

---

### 2. Frontend & Visual Testing
- **3D WebGL Rendering**:
  - Verifies Three.js canvas mounts without WebGL context loss.
  - Verifies wing flapping mesh articulation responds to phase changes.
  - Validates camera controls (Orbit, Zoom, Reset, Side View, Wireframe).
- **UI State Verification**:
  - Verifies all buttons perform real actions (no dead controls).
  - Handles untrained RL policy gracefully with informative status alert.
  - Validates drawing upload with immediate local preview and capability status badge.
- **Responsive Layout**:
  - Validates layout on Desktop (1920x1080), Tablet (768x1024), and Mobile (375x812).
