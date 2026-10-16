# ANTIGRAVITY MASTER BUILD PROMPT
# DA VINCI'S DREAM — An AI-Powered Renaissance Invention Laboratory

## ROLE

Act as a senior full-stack engineer, reinforcement learning researcher, simulation engineer, creative technologist, 3D artist, UI/UX designer, technical writer, and product architect.

Your task is to inspect the existing repository, understand its current state, and turn it into a functional, visually exceptional application called **Da Vinci's Dream**.

Do not stop at generating a plan, writing documentation, creating mockups, or producing starter files. Implement the application, run it, test it, and fix the problems you discover.

Work autonomously wherever reasonable. Make sensible engineering decisions, document important assumptions, and prioritize a complete working product over a large collection of unfinished features.

---

# 1. PRODUCT VISION

Da Vinci's Dream is an interactive laboratory where people can explore historical and Renaissance-inspired inventions, investigate how they work, reconstruct their mechanisms, simulate their behavior, and use AI and reinforcement learning to improve their designs.

Its central question is:

**What if the inventions imagined centuries ago could be brought into a digital workshop where we could understand them, experiment with them, and teach intelligent agents to improve their behavior?**

The platform should combine:

- Historical invention exploration.
- Drawing and sketch intake.
- Interactive 3D machine visualization.
- Simplified but functioning engineering simulation.
- Reinforcement learning experiments.
- AI-assisted interpretation and explanation.
- Visual experimentation and measurable results.
- A distinctive Renaissance-inspired artistic identity.

The application must not become a static museum, a conventional chatbot, an image gallery, or a decorative 3D website.

The essential interaction is:

**Discover → Inspect → Experiment → Simulate → Learn → Compare → Improve**

The visual experience should feel like entering an extraordinary Renaissance inventor's workshop powered by modern computational intelligence.

---

# 2. CORE SCOPE AND GENERALIZATION

The long-term platform must support different types of historical and technical drawings, not only flying machines.

Potential future machine categories include:

- Ornithopters and flying machines.
- Mechanical arms and automata.
- Gears, linkages, pulleys, and lifting devices.
- Water pumps and hydraulic mechanisms.
- Bridges and structural mechanisms.
- Wheeled machines and mechanical transport.
- Other Renaissance inventions and engineering sketches.

However, build only ONE complete, functioning simulation for the initial milestone:

**The Ornithopter Flight Lab.**

The application architecture must make it possible to add other simulation modules without rewriting the entire product.

Implement a machine registry and a capability system. Each machine record should identify what the application can do with it: display the drawing, show a 3D reconstruction, explain its mechanism, run a simulation, or train a controller.

Do not claim that arbitrary uploaded drawings can automatically become physically accurate simulations.

For an unsupported drawing, provide an honest experience: accept and display the image, save its metadata, let the user annotate it, offer a preliminary interpretation when available, and explicitly identify which capabilities are not yet implemented.

The user must still be able to interact with the first supported simulation without requiring an AI API key.

---

# 3. START BY AUDITING THE REPOSITORY

Before changing code:

1. Inspect the repository structure and existing files.
2. Read README files, package manifests, dependency definitions, environment examples, and existing documentation.
3. Identify the existing framework, programming languages, architecture, commands, and implemented features.
4. Identify existing reusable components, assets, working modules, and unfinished implementations.
5. Check available dependencies and runtime capabilities before selecting new technologies.
6. Determine whether there are existing application constraints or useful code that should be preserved.

Do not blindly replace an existing application with a newly generated template.

Preserve working features, avoid destructive file operations, and reuse suitable dependencies.

Create or update a root-level `IMPLEMENTATION_PLAN.md` and the documentation described below.

After recording the initial plan, proceed directly to implementation. Do not wait for approval at every phase.

If the repository is empty, scaffold the application using the stack recommended in this prompt, subject to the available environment.

---

# 4. REQUIRED MARKDOWN DOCUMENTATION

Create and maintain the following files in the repository.

## Root files

### `README.md`
Include:

- Project overview.
- Main features.
- Screenshots or image placeholders until real screenshots exist.
- Technology stack.
- Prerequisites.
- Installation and startup commands.
- How to launch the frontend and backend.
- How to train the RL agent.
- How to evaluate the controllers.
- Project structure.
- Current limitations.
- Troubleshooting.

Every command documented here must match the actual implementation.

### `IMPLEMENTATION_PLAN.md`
Maintain a task checklist with:

- Completed tasks.
- In-progress tasks.
- Remaining tasks.
- Testing status.
- Known blockers.
- A clear definition of completion.

Update this file as work progresses.

### `AGENTS.md`
Document instructions for future coding agents:

- Architecture and conventions.
- Directory responsibilities.
- Development and test commands.
- Asset-generation rules.
- Simulation and RL correctness requirements.
- Documentation requirements.
- Restrictions against fabricating scientific results.
- How to add another machine type.

## Documentation directory

Create `docs/PRD.md` containing the product requirements, target users, user journeys, MVP boundaries, feature priorities, success criteria, and deferred functionality.

Create `docs/ARCHITECTURE.md` containing the system architecture, module boundaries, machine registry, APIs, data flow, and a Mermaid architecture diagram.

Create `docs/DESIGN_SYSTEM.md` defining the visual identity, color tokens, typography, spacing, interaction states, component conventions, responsive behavior, accessibility, and motion principles.

Create `docs/AI_AND_RL.md` describing the Gymnasium environment, state observations, action space, reward design, physics assumptions, training configuration, baseline controller, checkpoint management, evaluation methodology, and current limitations.

Create `docs/PHYSICS_MODEL.md` specifying the flight equations, integration method, parameters, units, assumptions, stability limits, collision rules, and known inaccuracies.

Create `docs/ASSET_MANIFEST.md` listing generated images, 3D models, textures, icons, their purpose, formats, paths, provenance, and licenses where relevant.

Create `docs/RESEARCH_AND_ATTRIBUTION.md` documenting the historical references, open-source projects consulted, actual reused dependencies or assets, licensing considerations, and the distinction between historical facts and modern speculative engineering.

Create `docs/API.md` documenting backend routes, request and response schemas, error handling, and model availability.

Create `docs/TEST_PLAN.md` with frontend tests, backend tests, simulation validation, RL evaluation, asset checks, and end-to-end acceptance scenarios.

Create `docs/DEMO_SCRIPT.md` with a 60–90 second demonstration, the narrative, actions to perform, expected visible results, and contingency procedures if live training is slow.

Keep documentation aligned with the actual implementation. Do not claim a feature is complete merely because its documentation describes it.

---

# 5. VISUAL IDENTITY AND ART DIRECTION

Create a distinctive Renaissance-inspired editorial design.

The website should feel like a combination of:

- A Renaissance engineer's private workshop.
- An illuminated historical manuscript.
- A modern scientific research laboratory.
- A premium experimental software interface.
- A cinematic interactive invention exhibition.

Avoid generic AI startup layouts, excessive glassmorphism, generic purple gradients, cartoonish steampunk styling, and dashboards crowded with unnecessary cards.

## Recommended palette

Use these as initial design tokens:

- Deep ink: `#171714`
- Aged parchment: `#E8DDC3`
- Warm ivory: `#F7F2E8`
- Oxidized bronze: `#9A7447`
- Muted vermilion: `#A94330`
- Blueprint blue: `#647C91`
- Graphite: `#34332E`

The interface should maintain excellent contrast and readability.

## Typography

Use an expressive classical serif for large editorial headlines and a highly readable modern sans-serif for controls, technical measurements, and interface text.

Use locally available or properly licensed fonts. Provide sensible fallbacks.

## Composition

Create an editorial layout with:

- Oversized typographic headlines.
- Fine technical annotations.
- Small manuscript-inspired labels and serial numbers.
- Deliberate asymmetry.
- Blueprint grids and construction lines.
- Selective use of hand-drawn diagrams.
- Large areas of negative space.
- Restrained motion and subtle atmospheric effects.

The design must look intentional at both desktop and mobile sizes.

The interface should be beautiful, but no animation may interfere with the usability of the flight simulation.

---

# 6. IMAGE GENERATION AND ORIGINAL VISUAL ASSETS

Use the image-generation capabilities available in the Antigravity environment to create original, coherent visual assets.

Do not skip image generation merely because CSS gradients or stock images are easier.

Generate multiple separate assets, rather than one giant image intended to become the entire interface.

## Required asset set

### A. Hero artwork

Generate a sophisticated Renaissance-inspired ornithopter blueprint illustration.

Desired characteristics:

- Detailed mechanical wing structure.
- Hand-drafted construction lines.
- Subtle parchment grain.
- Ink annotations and mechanical callouts.
- Historically inspired but clearly identified as an artistic reconstruction.
- Strong composition with room for interface text.
- No embedded titles, logos, watermarks, or fake interface controls.

Use this as a decorative hero image, not as the interactive model.

### B. Ornithopter cutout

Generate a side-view, isolated ornithopter design suitable for a foreground visual.

Request a transparent background when supported.

The subject should have distinct body, wing, and tail shapes that inspire the real 3D model.

The generated image must not be presented as a real 3D model or used as the only representation of the simulated machine.

### C. Manuscript details

Generate or create separate visual assets for:

- Small mechanical sketches.
- Wing construction diagrams.
- Gear and linkage studies.
- Paper and ink textures.
- Historical workshop still-life details.

Use them sparingly.

### D. Laboratory environment

Generate an atmospheric supporting illustration of a Renaissance workshop with scientific instruments, unfinished drawings, wooden construction surfaces, and dramatic directional lighting.

Keep this as a background or decorative layer. Do not place text inside it.

## Image-generation rules

- Save assets under a documented `public/assets/` or equivalent directory.
- Generate at suitable resolutions and aspect ratios.
- Prefer transparent backgrounds for isolated cutouts.
- Use each asset according to its actual visual purpose.
- Optimize file sizes and avoid unnecessary duplication.
- Document the generated assets in `docs/ASSET_MANIFEST.md`.
- Keep all important text as real HTML.
- Do not invent historical quotations, annotations, or purported authentic documents.
- Do not use generated artwork to fake scientific evidence.

If image generation is unavailable, create high-quality SVG illustrations and procedural textures as a fallback. Document the limitation and continue implementing the application.

---

# 7. 3D MODELLING REQUIREMENT

Use actual 3D geometry where practical.

Inspect the installed stack before adding dependencies. Prefer Three.js with React Three Fiber if the application already uses React and the environment supports it.

Otherwise, use Three.js directly or an appropriate existing 3D solution.

## Build a lightweight ornithopter model

The initial machine can be a stylized engineering reconstruction consisting of:

- A central fuselage.
- Left and right wings.
- Visible wing joints.
- A tail assembly.
- A cockpit or central mechanical structure.
- Simple connecting rods or linkage details.
- A launch platform.

Construct the model from actual 3D meshes, shapes, curves, and materials.

Use the generated artwork as a design reference, not as a replacement for geometry.

## Required 3D interactions

- Orbit the camera.
- Zoom in and out.
- Reset the camera.
- Toggle a side engineering view.
- Toggle a blueprint or wireframe-like view.
- Start and stop the flight animation.
- Show visible wing movement.
- Display the approximate flight path.

The wing animation must respond to actual simulation state or controller actions.

The 3D machine and the simulation must share a clearly defined data interface. Do not animate the visual model independently while pretending it represents the current physics state.

## Performance

- Keep geometry lightweight.
- Use a sensible shadow strategy.
- Avoid unnecessary post-processing.
- Provide loading and failure states.
- Respect reduced-motion preferences where possible.
- Provide a functional 2D or simplified visual fallback if WebGL is unavailable.

Do not add 3D merely for decoration if the result becomes slow or unstable.

---

# 8. APPLICATION EXPERIENCE

Create a complete web application with four main areas.

## A. Discover

A premium landing page introducing Da Vinci's Dream.

The hero should contain:

- The project name.
- A compelling, concise description.
- A prominent entry point to the laboratory.
- The ornithopter artwork or 3D preview.
- A short explanation of the experiment.
- A visible distinction between historical inspiration and modern simulation.

Avoid excessive marketing copy.

## B. The Invention Archive

Create an archive of Renaissance-inspired invention records.

Each record should contain:

- Name.
- Machine category.
- Historical or conceptual description.
- Source references where available.
- Available capabilities.
- Associated artwork or sketch.
- Simulation availability.
- A button to inspect the invention.

The ornithopter must be the first supported, fully functional example.

Include several sample archive records for future machine types if useful, but label them as concepts or unsupported examples rather than claiming that their simulations work.

## C. Sketch Explorer

Create an image-upload workflow that accepts common image formats.

Users should be able to:

1. Upload a drawing or photograph of a historical invention.
2. Preview and inspect the image.
3. Add a title, notes, and optional machine category.
4. Select an existing compatible simulation when one exists.
5. Save the artifact in the session or through available persistent storage.
6. View a clear support-status label.

Provide a machine registry that connects drawings with their implemented simulators.

If a vision model or external API is available, optionally use it to suggest machine categories and identify visible components.

Do not make the application depend on API credentials to upload, view, annotate, or explore a drawing.

Never claim that visual recognition has produced verified mechanical specifications.

For unsupported drawings, show a useful explanation and a route back to the archive rather than a broken simulator.

## D. The Flight Laboratory

This is the primary interactive experience.

Provide a two-column or similarly effective laboratory interface, with the simulation as the visual focus.

Include:

- 3D ornithopter viewport.
- Current flight status.
- Start, pause, reset, and run-comparison controls.
- Wind controls.
- Launch and landing configuration.
- Manual control mode.
- Rule-based baseline mode.
- RL controller mode.
- Training status.
- Evaluation results.
- Flight trajectory.
- Velocity and altitude information.
- Energy-cost estimate.
- Reward history.
- Simulation event log.
- Clear warnings when the policy is not trained or unavailable.

Do not turn every measurement into a separate oversized card.

---

# 9. FLIGHT PHYSICS ENGINE

Implement a genuinely functioning simplified two-dimensional flight simulation.

Do not simulate flight through arbitrary screen-position animations alone.

Represent the aircraft state with at least:

- Horizontal position and velocity.
- Vertical position and velocity.
- Pitch and angular velocity.
- Wingbeat phase.
- Wind conditions.
- Relevant control inputs.

Use consistent units and a documented integration method.

Include simplified models of:

- Gravity.
- Air-relative motion.
- Lift.
- Drag.
- Flapping-related lift and thrust.
- Pitch response.
- Wind disturbances.
- Ground collision.
- Landing-zone detection.
- Simulation termination.

Use established aerodynamic equations as a starting point where appropriate, but clearly document all approximations.

For example, a simplified lift model may use:

L = 0.5 * density * airspeed² * wing_area * lift_coefficient

A corresponding drag model may be used, with bounded or approximate coefficients appropriate to the simplified environment.

The flapping contribution must be explicit in the model. Do not pretend that a conventional fixed-wing model accurately represents all the effects of flapping-wing aerodynamics.

Use a fixed simulation timestep where practical, separate simulation time from rendering time, and prevent frame-rate variation from silently changing the physics.

## Calibration and validation

Add basic tests proving that:

- Gravity affects vertical motion.
- Drag reduces motion appropriately.
- Wind changes the resulting trajectory.
- The controller can influence flight.
- Ground collisions are detected.
- Successful arrival in the landing zone is detected.
- Repeating a deterministic test with the same inputs produces reproducible results, within the limits of the numerical implementation.

The simulation must not allow arbitrary velocity or teleportation to count as successful flight.

Launch from a predefined elevated platform for the initial crossing experiment. Do not claim that Leonardo's original human-powered ornithopter could independently take off or sustain powered flight.

---

# 10. REINFORCEMENT LEARNING IMPLEMENTATION

Use Python, Gymnasium, NumPy, PyTorch, and Stable-Baselines3 PPO if compatible with the environment.

Implement a custom Gymnasium environment for the simplified ornithopter simulation.

Suggested backend structure:

backend/
  app/
    main.py
    api/
      routes_simulation.py
      routes_training.py
      routes_artifacts.py
    simulation/
      dynamics.py
      ornithopter_env.py
      configuration.py
      events.py
    agents/
      baseline_controller.py
      train_ppo.py
      policy.py
      evaluation.py
    schemas/
      simulation.py
      training.py
    tests/

Adapt this structure to the existing repository instead of creating unnecessary nested directories.

## Observation space

Include relevant elements such as:

- Altitude.
- Horizontal speed.
- Vertical speed.
- Pitch.
- Pitch rate.
- Distance to the target.
- Wingbeat phase.
- Wind.
- Other variables required for stable control.

Normalize observations where appropriate.

## Action space

Use bounded continuous actions or a justified simpler action representation.

Possible controls:

- Wingbeat amplitude.
- Wingbeat frequency.
- Tail or pitch control.

Ensure the physical model responds to these controls.

Do not create observation or action dimensions that are never used.

## Reward function

Use a documented reward combining:

- Forward progress.
- Maintaining controllable flight.
- Progress toward the landing target.
- Safe landing.
- Energy efficiency.
- Penalties for crashes, dangerous attitudes, and unstable flight.

Prevent trivial reward exploitation. For example, an agent should not obtain a high reward by remaining indefinitely on a launch platform.

Test the reward using scripted trajectories and edge cases before training.

## Baseline

Build a simple rule-based controller first.

It should attempt to maintain an appropriate pitch and wingbeat configuration using documented rules.

Evaluate the same scenario using both the rule-based controller and PPO.

## Training

Implement:

- A runnable training command.
- Configurable training timesteps.
- Checkpoint saving.
- Progress logging.
- Training curve export.
- Policy loading.
- Evaluation against baseline.
- Clear policy-availability status.

Do not block the frontend while PPO trains.

Run training as a background task or separate process where appropriate.

Use deterministic seeds for controlled comparisons. Include multiple evaluation runs when practical.

If trained policies are saved locally, verify that they can actually be loaded and used.

Do not fabricate successful training runs or numerical improvements.

If training fails to converge within the available time, keep the working simulator and baseline functional, explain that the RL result is inconclusive, and preserve the training scripts so the experiment can continue.

---

# 11. EVALUATION AND RESULTS

Every displayed result must come from actual simulation data.

The evaluation page or laboratory panel should show:

- Controller type.
- Number of evaluation episodes.
- Successful crossings.
- Success rate.
- Average flight distance.
- Average time to landing, when applicable.
- Estimated energy consumption.
- Average reward.
- Failure categories.
- Training progress, when real logs are available.

Show a direct comparison between the baseline and the learned controller.

Use identical scenario definitions and comparable starting conditions.

Allow wind conditions to be varied to test robustness.

Display the actual number of evaluation episodes next to any reported rate.

Do not label a result as scientifically validated merely because it was produced by a deterministic simulator.

Do not generate fake training graphs, fake benchmark scores, or fabricated scientific conclusions.

When no training run has occurred, clearly show that training has not yet been completed.

---

# 12. BACKEND AND API

Create a clean backend API only to the extent required by the chosen application architecture.

Suggested capabilities:

- Health and readiness status.
- Create or reset a simulation.
- Submit control actions.
- Retrieve current state and trajectory.
- Start training.
- Check training progress.
- Load an available policy.
- Evaluate a controller.
- Retrieve evaluation results.
- Save or retrieve machine-artifact metadata if persistence is implemented.

Use typed request and response schemas, input validation, structured errors, and sensible timeout handling.

Ensure API calls cannot accidentally start duplicate training jobs.

Keep simulation state handling simple and reliable.

If the local application can run more reliably with a direct simulation service, use that rather than introducing unnecessary microservices.

Do not commit API keys, credentials, large unlicensed assets, or sensitive files.

Provide an example environment configuration without actual secret values.

---

# 13. FRONTEND INTERACTION AND VISUAL QUALITY

All visible controls must perform real actions.

The application must not contain:

- Dead buttons.
- Fake training progress.
- Simulated loading states that never finish.
- Placeholder links masquerading as working features.
- Decorative charts presented as actual measurements.
- Upload controls that do nothing.
- UI elements that imply a model is trained when it is not.

Required states:

- Initial application loading.
- Ready to simulate.
- Running simulation.
- Paused simulation.
- Training in progress.
- Training completed.
- Training failed.
- Policy unavailable.
- Evaluation completed.
- Unsupported drawing.
- Upload failure.
- Backend unavailable.

Use subtle motion for:

- Blueprint construction lines.
- Wing movement.
- Flight-trail progression.
- Event transitions.
- Focused micro-interactions.

Avoid animation that obscures measurement labels or slows the simulation.

Ensure keyboard navigation, readable labels, visible focus states, and reasonable contrast.

Test the layout at desktop, tablet, and mobile sizes.

---

# 14. SUGGESTED ROOT PROJECT STRUCTURE

Adapt to the existing repository and avoid unnecessary duplication.

A reasonable target structure is:

/
  README.md
  AGENTS.md
  IMPLEMENTATION_PLAN.md
  package.json                    # only if appropriate for the existing stack
  frontend/
    src/
      components/
      pages/
      hooks/
      services/
      types/
      styles/
  backend/
    app/
      api/
      simulation/
      agents/
      schemas/
    tests/
    requirements.txt
  public/
    assets/
      hero/
      illustrations/
      textures/
      models/
  models/
    .gitkeep
  results/
    .gitkeep
  docs/
    PRD.md
    ARCHITECTURE.md
    DESIGN_SYSTEM.md
    AI_AND_RL.md
    PHYSICS_MODEL.md
    ASSET_MANIFEST.md
    RESEARCH_AND_ATTRIBUTION.md
    API.md
    TEST_PLAN.md
    DEMO_SCRIPT.md

Do not save generated checkpoints, evaluation outputs, or temporary training data in public directories.

Document the model and result storage locations.

---

# 15. IMPLEMENTATION ORDER

Execute these phases in order.

## Phase 1: Repository and documentation

- Inspect the repository.
- Establish the architecture and constraints.
- Create the required Markdown documentation.
- Record the implementation plan.

## Phase 2: Design and assets

- Create the design system.
- Generate the original visual assets.
- Build the landing page and application shell.
- Create the archive and sketch explorer.

## Phase 3: Simulation

- Implement aircraft dynamics.
- Implement the simulation environment.
- Add the baseline controller.
- Create deterministic scenarios.
- Write physics and behavior tests.

## Phase 4: Reinforcement learning

- Integrate Gymnasium and PPO.
- Create training and evaluation commands.
- Test policy loading and inference.
- Evaluate against baseline.
- Record results honestly.

## Phase 5: Visualization and integration

- Implement the interactive 3D machine.
- Connect its movement to simulation state.
- Build the controls, trajectory display, and metrics.
- Connect the frontend and backend.
- Handle unavailable-model and error states.

## Phase 6: Verification

- Run the application.
- Run tests and linting.
- Fix runtime errors.
- Verify all buttons and interaction paths.
- Test responsive layouts.
- Validate that displayed data originates from actual executions.
- Capture actual screenshots where supported.
- Update the documentation to reflect the completed implementation.

Do not stop after Phase 1 or Phase 2.

If a later phase exposes a fundamental issue, fix it before adding visual polish.

---

# 16. ACCEPTANCE CRITERIA

The initial milestone is complete only when the following conditions hold:

1. The application can be installed and launched using documented instructions.
2. The landing page and invention archive are implemented.
3. The user can upload and preview a drawing.
4. Unsupported machine types are handled honestly.
5. The ornithopter has an interactive 3D representation if WebGL is supported, with a functional fallback where practical.
6. The aircraft moves according to the functioning simulation engine.
7. Wind and control inputs affect simulation results.
8. The rule-based baseline can complete a flight test or produce a measurable failure.
9. PPO training can be started using a documented command.
10. A trained policy, when available, can be loaded and evaluated.
11. Baseline and PPO evaluation results come from actual runs.
12. The interface distinguishes simulation, training, and evaluation states.
13. The project includes the requested Markdown documentation.
14. The design contains original Renaissance-inspired assets where image generation is available.
15. The main user journey works without requiring an external AI API key.
16. Known scientific and historical limitations are documented.
17. No major visible controls are inert or misleading.
18. Existing repository functionality has not been unnecessarily destroyed.

If full PPO improvement cannot be demonstrated within the available runtime, report that limitation explicitly instead of claiming completion of the RL success criterion.

---

# 17. FINAL EXECUTION INSTRUCTIONS

Begin by inspecting the repository and existing runtime environment.

Then create the documentation and proceed to implement the application.

Use the available image-generation functionality to produce original assets. Build actual 3D geometry where practical. Make the simulation, RL environment, and frontend agree on the same machine state and control definitions.

Prefer a complete, testable, visually polished vertical slice over ten incomplete modules.

Keep the first working machine narrowly scoped while making the architecture extensible for future drawings and simulator plugins.

Do not ask for approval for ordinary engineering choices. Make decisions, document them, and keep progressing.

When finished, provide a concise implementation report that includes:

- What was implemented.
- The repository structure.
- The commands required to run it.
- The commands required to train and evaluate PPO.
- Which features are genuinely working.
- Which image and 3D assets were generated.
- The actual test results.
- The actual RL evaluation results, if training was completed.
- Remaining limitations and the most valuable next steps.

**Build Da Vinci's Dream as a functioning computational invention laboratory, not a static concept page.**
