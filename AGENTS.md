# AGENTS.md: Developer & Coding Agent Guidelines

## 1. Architectural Philosophy
Da Vinci's Dream is an interactive scientific laboratory combining Renaissance history, 2D flight aerodynamics, Gymnasium continuous RL, and WebGL 3D visualization.

### Non-Negotiable Rules:
1. **Never Fabricate Data**: Every metric, trajectory point, reward score, and evaluation percentage displayed in the UI must originate from actual numerical simulation or evaluation.
2. **Deterministic & Reproducible**: Scenarios must accept seed parameters for repeatable scientific comparisons.
3. **Decoupled Architecture**: The machine registry (`machines.json`) dictates capabilities (`drawing_display`, `3d_model`, `mechanism_explanation`, `simulation`, `rl_training`). Future machines (e.g. Automaton Knight, Hydraulic Screw) can be registered without altering core application wiring.
4. **Honest Fallbacks**: Unsupported uploaded drawings must clearly state what is supported and what is not. Never pretend a random image was converted into an aeroelastic simulation.

---

## 2. Directory Responsibilities

- `backend/app/simulation/`: Contains purely deterministic physics dynamics, integrator, and Gymnasium environments. No HTTP or UI concerns.
- `backend/app/agents/`: Baseline rule-based controllers, Stable-Baselines3 PPO training logic, checkpoint managers, and evaluation benchmarks.
- `backend/app/api/`: FastAPI REST endpoints, routing, error handling, background task orchestration.
- `backend/app/schemas/`: Pydantic V2 request and response contracts.
- `backend/tests/`: Pytest unit and integration test suite.
- `frontend/src/components/`: Reusable UI components, 3D Canvas viewports, charts, telemetry meters.
- `frontend/src/pages/`: Main application areas (Discover, Archive, Sketch Explorer, Flight Lab).
- `public/assets/`: Generated Renaissance artwork, blueprints, manuscript illustrations, and textures.
- `models/`: Saved neural network policy checkpoints (`.zip`).
- `results/`: Benchmark evaluations and training telemetry logs (`.json`).
- `docs/`: Comprehensive technical, design, and scientific documentation.

---

## 3. Development and Test Commands

### Backend:
```bash
# Run FastAPI Backend Server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload

# Run Pytest Suite
python -m pytest backend/tests -v

# Train PPO Agent Headless
python -m backend.app.agents.train_ppo --timesteps 50000 --save-path models/ornithopter_ppo.zip

# Run Evaluation Benchmark
python -m backend.app.agents.evaluation --episodes 20 --policy-path models/ornithopter_ppo.zip
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
npm run build
```

---

## 4. How to Register a New Machine Type
1. Add an entry to the machine registry in `backend/app/simulation/configuration.py` and frontend registry constants.
2. Define its capabilities map:
   ```json
   {
     "id": "hydraulic_screw",
     "name": "Archimedean Water Screw",
     "category": "hydraulic",
     "capabilities": {
       "drawing": true,
       "reconstruction_3d": true,
       "mechanism_explanation": true,
       "simulation": false,
       "rl_training": false
     }
   }
   ```
3. If implementing simulation, create a new dynamics model inheriting from `BaseDynamics` and expose it through the simulation router.

---

## 5. Physical Modeling Guidelines
- Always use SI units (meters, seconds, radians, kg, Newtons).
- Clearly separate simulation fixed step ($dt = 0.02s$, 50 Hz) from UI animation frame rates.
- Wing flapping physics must compute dynamic relative airspeed including flapping velocity ($v_{flap} = A \cdot \omega \cdot \cos(\omega t)$).
- Avoid arbitrary position teleportation; constrain accelerations via Newton's second law ($\Sigma F = m \cdot a$).
