# Visual Asset Manifest
## Da Vinci's Dream: Renaissance Laboratory Assets

| Asset Name | Relative Path | Format | Aspect Ratio / Res | Purpose & Usage | Provenance |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Ornithopter Blueprint** | `public/assets/hero/ornithopter_blueprint.jpg` | JPEG | 16:9 (1024x576) | Primary hero banner illustration, editorial codex header | Generated via Antigravity Imagen model |
| **Ornithopter Side Profile** | `public/assets/illustrations/ornithopter_side.jpg` | JPEG | 16:9 (1024x576) | Cutout technical illustration for 3D model reference & lab card | Generated via Antigravity Imagen model |
| **Renaissance Workshop Environment** | `public/assets/illustrations/workshop_lab.jpg` | JPEG | 16:9 (1024x576) | Atmospheric laboratory background, Tuscan landscape window | Generated via Antigravity Imagen model |
| **Wing & Linkage Anatomical Study** | `public/assets/illustrations/wing_linkage.jpg` | JPEG | 4:3 (1024x768) | Codex Atlanticus comparative anatomy of bat wing vs. mechanical hinge | Generated via Antigravity Imagen model |
| **Automaton Knight Sketch** | `public/assets/archive/mechanical_knight.jpg` | JPEG | 4:3 (1024x768) | Invention archive entry for Leonardo's articulated mechanical knight | Generated via Antigravity Imagen model |
| **Aerial Screw Manuscript** | `public/assets/archive/aerial_screw.jpg` | JPEG | 4:3 (1024x768) | Invention archive entry for helical rotor helicopter design | Generated via Antigravity Imagen model |

### Asset Management Notes:
- All generated assets are stored directly in `public/assets/` under semantic categories (`hero/`, `illustrations/`, `archive/`).
- 3D models are built procedurally with Three.js meshes and materials rather than static opaque glTF blobs, allowing real-time morphing, wing joint bending, wireframe shader modes, and zero external network download latency.
