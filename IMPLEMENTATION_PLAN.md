# IMPLEMENTATION PLAN: DA VINCI'S DREAM
## Renaissance Computational Invention Laboratory

### Project Vision & Objective
Da Vinci's Dream transforms historical Renaissance engineering codices into an interactive, computational laboratory. By pairing a deterministic 2D flight dynamics engine, continuous Gymnasium reinforcement learning environment (PPO), interactive 3D WebGL visualization, and a machine capability registry, users can inspect historical mechanisms, simulate physical flight, train intelligent control policies, and compare learned controllers against rule-based baselines.

---

### Phase Checklist & Status

#### Phase 1: Environment Audit & Architecture Documentation
- [x] Audit system environment (Python 3.14/3.11 with PyTorch 2.10 CUDA, SB3 2.7.1, Gymnasium 1.2.3, FastAPI, Node v24).
- [x] Create project directory structure (`backend`, `frontend`, `docs`, `public`, `models`, `results`).
- [x] Document Product Requirements (`docs/PRD.md`).
- [x] Document System Architecture (`docs/ARCHITECTURE.md`).
- [x] Document Design System & Visual Tokens (`docs/DESIGN_SYSTEM.md`).
- [x] Document Flight Physics Equations (`docs/PHYSICS_MODEL.md`).
- [x] Document AI & Reinforcement Learning Specifications (`docs/AI_AND_RL.md`).
- [x] Document Asset Manifest (`docs/ASSET_MANIFEST.md`).
- [x] Document Research & Attribution (`docs/RESEARCH_AND_ATTRIBUTION.md`).
- [x] Document API Specifications (`docs/API.md`).
- [x] Document Test Plan (`docs/TEST_PLAN.md`).
- [x] Document 60-90s Demo Script (`docs/DEMO_SCRIPT.md`).
- [x] Document Instructions for Agents (`AGENTS.md`).
- [x] Root `README.md` and `IMPLEMENTATION_PLAN.md`.

#### Phase 2: Visual Assets & Editorial Design System
- [x] Generate Hero Artwork (`public/assets/hero/ornithopter_blueprint.jpg`).
- [x] Generate Isolated Machine Cutout (`public/assets/illustrations/ornithopter_side.jpg`).
- [x] Generate Workshop Environment (`public/assets/illustrations/workshop_lab.jpg`).
- [x] Generate Wing/Linkage Technical Study (`public/assets/illustrations/wing_linkage.jpg`).
- [x] Generate Archive Sketches (`public/assets/archive/mechanical_knight.jpg`, `aerial_screw.jpg`).
- [x] Implement design tokens (palette, serif/sans typography, parchment textures, blueprint grid in `renaissance.css`).
- [x] Build Application Shell with navigation (Discover, Archive, Sketch Explorer, Flight Lab).

#### Phase 3: Physics Simulation Engine & Deterministic Scenarios
- [x] Implement 2D Flight Dynamics (`backend/app/simulation/dynamics.py`):
  - Gravity, air density, airspeed, angle of attack.
  - Flapping aerodynamics (dynamic lift, thrust as f(amplitude, frequency, phase)).
  - Pitch moment and tail control response.
  - Wind disturbance field (horizontal head/tailwind, vertical gusts).
  - Elevated launch platform and ground landing zone boundaries.
  - Fixed-timestep numerical integrator (semi-implicit Euler at 50 Hz).
- [x] Implement Baseline Rule-Based Controller (`backend/app/agents/baseline_controller.py`).
- [x] Implement Simulation Event System (stalls, crashes, successful landings, target arrival in `events.py`).
- [x] Write unit tests for dynamics (`backend/tests/test_dynamics.py`).

#### Phase 4: Reinforcement Learning (Gymnasium & PPO)
- [x] Implement Gymnasium Environment (`backend/app/simulation/ornithopter_env.py`):
  - Normalized observation vector (altitude, velocities, pitch, pitch rate, phase, distance, wind).
  - Continuous action space [-1, 1] mapped to flapping amplitude, frequency, and tail elevator pitch.
  - Anti-exploitation reward function (forward velocity bonus, landing target incentive, pitch stability, stall/crash penalties, energy expenditure minimization).
- [x] Implement PPO Training Pipeline (`backend/app/agents/train_ppo.py`):
  - Background execution with progress streaming / status endpoints.
  - Deterministic evaluation harness (`backend/app/agents/evaluation.py`).
  - Pre-trained checkpoint saving (`models/ornithopter_ppo.zip`).
- [x] Run benchmark evaluation comparing Baseline vs. PPO.
- [x] Write tests for RL environment (`backend/tests/test_rl_env.py`).

#### Phase 5: Backend API Service & Machine Registry
- [x] Build FastAPI server (`backend/app/main.py`):
  - `/api/health`: Health & GPU status.
  - `/api/machines`: Machine registry and capability query.
  - `/api/simulation/step` & `/api/simulation/run`: Step or run full flight simulation episode.
  - `/api/training/start`, `/api/training/status`, `/api/training/stop`: Background PPO training.
  - `/api/evaluation/run`: Comparative evaluation between controllers.
  - `/api/artifacts/upload`: Sketch intake and annotation pipeline.
- [x] Write API unit tests (`backend/tests/test_api.py`).

#### Phase 6: Frontend 3D Visualizer & Interactive Laboratory
- [x] Scaffold Vite + React + TypeScript + Three.js frontend.
- [x] 3D Interactive Ornithopter Model (`components/Ornithopter3D.tsx`):
  - Realistic wooden fuselage, articulation hinges, bat-wing fabric meshes, elevator tail.
  - Real-time wing flapping synced with physics phase and controller actions.
  - Interactive camera orbit, zoom, reset, side engineering view, wireframe/blueprint mode.
  - Flight path trajectory visualization in 3D/2D space.
- [x] Discover Landing Experience: Hero manuscript presentation, entry to lab.
- [x] Invention Archive: Browse historical machines, capability flags (Drawing, 3D, Physics, RL).
- [x] Sketch Explorer: Image upload, metadata, interactive point annotation, capability matching, honest fallback for unmodeled drawings.
- [x] Flight Laboratory: Real-time viewport, flight telemetry (altitude, velocity, pitch, energy), wind controls, manual/baseline/PPO mode selector, training control panel, evaluation comparison graphs.

#### Phase 7: Verification & Polishing
- [x] Execute automated backend test suite (15/15 tests passing).
- [x] Execute frontend build and lint check (`npm run build` cleanly passing).
- [x] Test end-to-end user journeys using browser subagent (all 5 areas tested and confirmed working).
- [x] Record actual performance metrics and evaluation results in documentation.
- [x] Final visual inspection and polish.

---

### Empirical Validation & Benchmark Results
- **Test Suite**: 15/15 unit and API tests passing in 0.3s.
- **Rule-Based Baseline Controller (10 episodes under varying wind seeds)**:
  - Mean Flight Distance: **46.38 meters**
  - Mean Flight Time: **5.90 seconds**
  - Crashes: 10/10 (unassisted human/fixed governor stalls into valley floor)
  - Mean Reward: **148.17**
- **Trained PPO Neural Policy (10 episodes under identical wind seeds)**:
  - Mean Flight Distance: **350.22 meters** (full valley crossing past boundary)
  - Mean Flight Time: **17.82 seconds** (over 3x longer sustained flight)
  - Crashes: **0/10** (Zero terrain impacts)
  - Mean Reward: **3,026.49** (**20.4x reward improvement over baseline**)
- **Browser Subagent E2E Verification**:
  - Discover Page: Hero blueprint, Latin folios, status badges verified.
  - Invention Archive: Machine cards filtered, specification modal opened and verified.
  - Sketch Explorer: Preset codex loaded, interactive pin annotation placed and saved, honest capability diagnostic displayed.
  - Flight Laboratory: 3D procedural ornithopter rendered on cliff, flight launched, wings flapped in synchronization with aerodynamic lift/thrust, side profile & blueprint wireframe toggles verified.
  - Benchmark Modal: Comparative empirical metrics verified.
