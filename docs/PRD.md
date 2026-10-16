# Product Requirements Document (PRD)
## Da Vinci's Dream: Renaissance Computational Invention Laboratory

### 1. Executive Summary
**Da Vinci's Dream** bridges the visionary imagination of Renaissance polymath Leonardo da Vinci and modern computational intelligence. While Leonardo sketched elaborate flying machines, automata, and hydraulic engines in his codices, materials of the 15th century and the human power-to-weight ratio prevented physical sustained flight. Da Vinci's Dream recreates an authentic Renaissance digital workshop where users discover historical inventions, inspect interactive 3D reconstructions, run realistic 2D aerodynamic simulations, train reinforcement learning agents (PPO) to learn stable flapping flight, and compare intelligent autonomous policies with rule-based baselines.

---

### 2. Target Users & Personas
1. **Curious Technologists & Learners**: Fascinated by science history and eager to experiment with physics and AI in a tangible, visually captivating environment.
2. **AI & RL Researchers / Students**: Interested in seeing continuous control reinforcement learning applied to non-standard aerodynamic platforms (flapping ornithopters) rather than toy inverted pendulums.
3. **Creative Technologists & 3D Enthusiasts**: Passionate about editorial Renaissance aesthetics, historical draftsmanship, and interactive WebGL experiences.

---

### 3. Core User Journeys
```
[Discover Hero] ──> [Invention Archive] ──> [Sketch Explorer (Upload/Annotate)]
      │                     │
      └─────────────────────┴───> [Flight Laboratory]
                                         │
                   ┌─────────────────────┼─────────────────────┐
                   ▼                     ▼                     ▼
          [Manual Control]     [Rule-Based Baseline]    [PPO RL Policy]
                   │                     │                     │
                   └─────────────────────┴─────────────────────┘
                                         │
                                [Evaluation & Telemetry]
```

1. **Discover**: Land in the Renaissance workshop, view authentic codex blueprints, understand the historical vision and modern computational experiment.
2. **Explore Inventions**: Browse the historical archive of Renaissance mechanisms (Ornithopter, Mechanical Knight Automaton, Aerial Screw, Hydraulic Pump). Inspect capability matrices.
3. **Intake Drawing / Sketch**: Upload a historical or custom technical sketch, preview it, annotate components, and match with the capability registry. Provide honest fallback if an unsupported machine type is uploaded.
4. **Flight Experiment**: Enter the 3D Flight Laboratory. Choose flight controller (Manual, Baseline, or RL Policy), adjust wind conditions, trigger elevated launch, observe 3D ornithopter flapping motion synced to aerodynamics, and review real telemetry (altitude, velocity, pitch, reward, energy).
5. **Train & Compare**: Launch PPO training, observe policy optimization, and run automated scientific benchmarks comparing success rate, flight distance, and energy consumption.

---

### 4. Milestone Boundaries (MVP vs. Future)
- **In-Scope (Initial Milestone)**:
  - Complete 2D Ornithopter flight physics simulation engine with aerodynamic forces, flapping lift/thrust, ground collision, and target landing zone.
  - Continuous Gymnasium environment with PPO policy training via Stable-Baselines3.
  - Deterministic rule-based baseline controller.
  - Interactive 3D WebGL ornithopter with real-time flapping animation synced to physics phase.
  - Camera orbit, zoom, reset, side engineering view, wireframe/blueprint mode.
  - Invention archive with machine capability registry.
  - Sketch explorer with upload, preview, annotation, and capability reporting.
  - Comprehensive telemetry, event logging, and comparative evaluation dashboard.
  - Renaissance editorial aesthetic with original AI-generated assets.
  - No mandatory AI API key required for core simulation, 3D, and RL.
- **Deferred / Future Scope**:
  - Full 3D aeroelastic computational fluid dynamics (CFD).
  - Automaton mechanical arm and hydraulic screw dynamic simulations.
  - Multi-agent aerodynamic formation flying.

---

### 5. Success Criteria
1. Sub-millisecond step execution for physics engine ($dt = 0.02s$).
2. 3D WebGL viewport running at 60 FPS on standard desktop hardware.
3. True synchronization between physics state and 3D mesh articulation.
4. Measurable trajectory divergence under varied wind vectors.
5. Zero placeholder buttons, broken links, or simulated fake data.
