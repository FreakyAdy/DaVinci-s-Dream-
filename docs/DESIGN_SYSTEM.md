# Design System & Visual Identity
## Da Vinci's Dream

### 1. Visual Philosophy: The Renaissance Laboratory
Da Vinci's Dream merges the tangible authenticity of a 15th-century Tuscan polymath's workshop with the precision of contemporary experimental software. It is characterized by:
- Editorial typography with classical serif headers and modern technical mono/sans body text.
- Aged parchment and deep iron-gall ink contrast.
- Blueprint grid lines, compass calibration marks, and draftsmanship annotations.
- Clean negative space and rich chiaroscuro lighting.
- Purposeful motion: wing flapping, subtle parchment grain, flight paths.

---

### 2. Color Palette & Tokens

| Token Name | Hex Code | Purpose & Usage |
| :--- | :--- | :--- |
| `--color-deep-ink` | `#171714` | Primary text, deep backdrop accents, borders |
| `--color-aged-parchment` | `#E8DDC3` | Warm card backdrops, secondary backgrounds |
| `--color-warm-ivory` | `#F7F2E8` | Primary surface background, manuscript canvas |
| `--color-parchment-light` | `#FAF6EF` | Elevated card surfaces, input fields |
| `--color-oxidized-bronze` | `#9A7447` | Accent borders, brass instruments, active indicators |
| `--color-muted-vermilion` | `#A94330` | Warnings, crash alerts, energy drain, vital callouts |
| `--color-blueprint-blue` | `#3A5A78` | Trajectory paths, engineering overlays, wireframes |
| `--color-verdigris` | `#4B7B6B` | Successful landings, reward gains, positive status |
| `--color-graphite` | `#34332E` | Secondary technical labels, subtle borders |

---

### 3. Typography Hierarchy

- **Editorial Serif (Headlines & Title Banners)**:
  - Font Families: `Cinzel`, `Playfair Display`, `EB Garamond`, `Georgia`, serif
  - Used for: Hero titles, machine names, section titles, Latin mottos (`Volatilio Meccanica`).
- **Technical UI & Interface Sans**:
  - Font Families: `Inter`, `Outfit`, `-apple-system`, `BlinkMacSystemFont`, sans-serif
  - Used for: Navigation labels, button controls, telemetry cards, explanations.
- **Scientific Monospace**:
  - Font Families: `JetBrains Mono`, `Fira Code`, `SFMono-Regular`, monospace
  - Used for: Numeric readings, flight velocities, angles, rewards, coordinates.

---

### 4. Component Conventions & Micro-interactions
- **Buttons**:
  - Primary: Bronze-trimmed parchment button with fine border and subtle sepia hover lift.
  - Secondary: Outlined ink button with subtle ivory fill on hover.
  - Destructive / Reset: Vermilion border with soft crimson tint.
- **Telemetry Meters**:
  - Clean borders, fine crosshairs, and live numeric tickers.
- **3D Canvas Viewport**:
  - Framed with drafting corner marks (`+` and `L` brackets) reminiscent of architectural drafting tables.
  - Floating controls for wireframe/blueprint mode, camera reset, and perspective/orthographic toggle.
- **Status Badges**:
  - Supported: Verdigris tint with checkmark.
  - Untrained / Concept: Bronze/Amber tint with informational badge.
  - Unsupported: Graphite muted badge with clear diagnostic explanation.
