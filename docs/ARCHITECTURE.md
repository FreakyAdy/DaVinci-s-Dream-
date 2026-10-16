# System Architecture
## Da Vinci's Dream

### 1. High-Level Architecture Overview

Da Vinci's Dream couples a high-performance Python simulation and machine learning backend with a responsive, editorial React 3D frontend.

```mermaid
graph TD
    subgraph Frontend ["Frontend (React 18 + Vite + Three.js + Tailwind/CSS)"]
        UI[Editorial Application Shell]
        Router[View Navigator: Discover | Archive | Sketch | Lab]
        LabView[Flight Laboratory Controller]
        Canvas3D[3D WebGL Viewport (Three.js)]
        TelemetryUI[Real-time Telemetry & Trajectory Plotter]
        EvalUI[Comparative Evaluation Dashboard]
        UploadUI[Sketch Intake & Annotation Tool]
        ClientService[API Client Service]
    end

    subgraph Backend ["Backend (FastAPI + Gymnasium + PyTorch + SB3)"]
        API[FastAPI Router]
        SimEngine[2D Flight Dynamics Engine]
        GymEnv[OrnithopterEnv (Gymnasium)]
        Baseline[Rule-Based Pitch & Flap Controller]
        PPO[Stable-Baselines3 PPO Policy]
        Trainer[Background Async Training Worker]
        Evaluator[Deterministic Benchmarking Harness]
        Registry[Machine Capability Registry]
        Storage[Local Checkpoint & Artifact Manager]
    end

    UI --> Router
    Router --> LabView
    Router --> UploadUI
    LabView --> Canvas3D
    LabView --> TelemetryUI
    LabView --> EvalUI
    LabView --> ClientService
    UploadUI --> ClientService

    ClientService -->|REST HTTP / Streaming| API
    API --> SimEngine
    API --> GymEnv
    API --> Baseline
    API --> PPO
    API --> Trainer
    API --> Evaluator
    API --> Registry
    Trainer --> Storage
    PPO --> Storage
```

---

### 2. Module Boundaries & Data Flow

#### A. Frontend Core Modules:
- **`App.tsx` & Navigation**: Orchestrates views, loads capability registry, provides sound and visual theme contexts.
- **`Ornithopter3D.tsx`**: Three.js WebGL rendering layer. Creates procedural wooden lattice fuselage, articulated wing spars with double-hinge joints, translucent silk/linen membrane textures, and an elevator tail. Directly updates wing rotation $\theta_{wing}(t) = \text{amplitude} \cdot \sin(\text{phase})$ and aircraft attitude from physics state.
- **`TelemetryPanel.tsx`**: Displays real-time airspeed, climb rate, altitude, pitch angle, lift/drag forces, and energy consumed.
- **`EvaluationDashboard.tsx`**: Renders real comparison charts between the Baseline controller and the trained PPO policy across standardized evaluation seeds.
- **`SketchExplorer.tsx`**: Allows image upload, component labeling, and queries the machine registry.

#### B. Backend Core Modules:
- **`backend/app/simulation/dynamics.py`**:
  Pure numerical computation of flight dynamics using Newtonian mechanics and quasi-steady flapping aerodynamic formulation.
- **`backend/app/simulation/ornithopter_env.py`**:
  Standardized Gymnasium environment encapsulating state observation, action clipping, reward computation, and step integration.
- **`backend/app/agents/baseline_controller.py`**:
  Proportional pitch-attitude stabilizer and altitude-regulated flapping rate governor.
- **`backend/app/agents/train_ppo.py`**:
  Asynchronous PPO training pipeline using PyTorch with CUDA acceleration.
- **`backend/app/agents/evaluation.py`**:
  Deterministic multi-episode evaluation harness outputting verifiable success rates, mean flight distances, and flight stability statistics.
- **`backend/app/simulation/configuration.py`**:
  Central machine capability registry, aerodynamic constants, environment boundaries, and scenario definitions.

---

### 3. Machine Registry & Capability System

Each historical machine is described in the registry with a strict capability contract:

```json
{
  "id": "ornithopter_codex_on_flight",
  "name": "Ornithopter (Codice sul volo degli uccelli)",
  "category": "flight",
  "historical_period": "c. 1505",
  "source_folio": "Codex on the Flight of Birds, Folio 8v",
  "description": "Articulated mechanical flapping wing aircraft designed to harness human muscle power with stirrup pulleys.",
  "image_url": "/assets/hero/ornithopter_blueprint.jpg",
  "capabilities": {
    "drawing_display": true,
    "reconstruction_3d": true,
    "mechanism_explanation": true,
    "simulation": true,
    "rl_training": true
  },
  "flight_parameters": {
    "wingspan_m": 10.5,
    "mass_kg": 85.0,
    "wing_area_m2": 16.0
  }
}
```

If an uploaded sketch matches an unsupported machine category, the application gracefully flags missing capabilities and explains the physical and modeling requirements needed to activate simulation.
