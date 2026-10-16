# Backend REST API Specification
## Da Vinci's Dream

Base URL: `http://127.0.0.1:8000`

### 1. General & Health

#### `GET /api/health`
Returns system health, PyTorch CUDA capability, and active worker status.
- **Response `200 OK`**:
```json
{
  "status": "healthy",
  "cuda_available": true,
  "device_name": "NVIDIA GeForce RTX ...",
  "policy_loaded": true,
  "timestamp": "2026-10-16T11:30:00Z"
}
```

---

### 2. Machine Registry

#### `GET /api/machines`
Returns the list of historical machines with their capability matrices.
- **Response `200 OK`**:
```json
[
  {
    "id": "ornithopter_codex",
    "name": "Ornithopter (Flapping Wing)",
    "category": "flight",
    "description": "Flapping wing aircraft from the Codex on the Flight of Birds.",
    "capabilities": {
      "drawing_display": true,
      "reconstruction_3d": true,
      "mechanism_explanation": true,
      "simulation": true,
      "rl_training": true
    }
  }
]
```

---

### 3. Simulation Endpoints

#### `POST /api/simulation/reset`
Initializes a new flight simulation episode with custom wind and elevation parameters.
- **Request Body**:
```json
{
  "wind_x": 1.5,
  "wind_y": 0.0,
  "launch_altitude": 25.0,
  "seed": 42
}
```
- **Response `200 OK`**:
```json
{
  "state": {
    "x": 0.0,
    "y": 25.0,
    "u": 6.5,
    "v": 0.0,
    "pitch": 0.05,
    "pitch_rate": 0.0,
    "wingbeat_phase": 0.0,
    "energy_consumed": 0.0
  },
  "status": "in_flight"
}
```

#### `POST /api/simulation/step`
Advances the physics engine by one fixed timestep ($dt = 0.02s$).
- **Request Body**:
```json
{
  "amplitude": 0.45,
  "frequency": 2.2,
  "tail_pitch": -0.05
}
```

#### `POST /api/simulation/run`
Runs an entire episode deterministically using either `manual`, `baseline`, or `rl` controller.
- **Request Body**:
```json
{
  "controller": "baseline",
  "wind_x": 2.0,
  "wind_y": -0.5,
  "max_steps": 1000,
  "seed": 42
}
```
- **Response `200 OK`**: Returns full trajectory, summary statistics, termination reason (`landed`, `crashed`, `timeout`).

---

### 4. Reinforcement Learning Endpoints

#### `POST /api/training/start`
Starts a background PPO training session. Prevents duplicate concurrent jobs.
- **Request Body**:
```json
{
  "timesteps": 50000,
  "learning_rate": 0.0003
}
```

#### `GET /api/training/status`
Returns live progress, current timestep, training reward, and policy readiness.

#### `POST /api/training/stop`
Gracefully interrupts training and saves the best checkpoint.

#### `POST /api/evaluation/run`
Executes a multi-episode benchmark comparing Baseline and PPO across standard seeds.
- **Response `200 OK`**: Includes success rates, mean flight distances, mean flight durations, energy expenditures, and statistical distributions.

---

### 5. Artifact & Sketch Intake

#### `POST /api/artifacts/upload`
Uploads drawing image file, stores metadata, and returns category analysis and capability report.
