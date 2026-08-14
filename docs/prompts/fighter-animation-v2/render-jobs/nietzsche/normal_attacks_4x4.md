---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "nietzsche"
character_title: "Friedrich Nietzsche"
prompt_id: "normal_attacks_4x4"
job_id: "nietzsche__normal_attacks_4x4"
status: rendered_unreviewed
output_image: "assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_normal_attacks_4x4.png"
frames: 16
grid:
  columns: 4
  rows: 4
cell_size: [256, 256]
output_size: [1024, 1024]
reference_images:
  - "assets/sprites/roster/nietzsche/source/nietzsche_core_4x4.png"
source_character: "characters/nietzsche/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Friedrich Nietzsche — `normal_attacks_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_normal_attacks_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `rendered_unreviewed`

## Suggested reference images

- `assets/sprites/roster/nietzsche/source/nietzsche_core_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `attack_light_v2` | `0, 1, 2, 3` | `once` | 3 |
| `attack_medium_v2` | `4, 5, 6, 7` | `once` | 3 |
| `attack_heavy_v2` | `8, 9, 10, 11` | `once` | 4 |
| `air_attack_v2` | `12, 13, 14, 15` | `once` | 3 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Friedrich Nietzsche.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom.
Every cell must be the same size, perfectly aligned, with no gutters, no margins, no border, no labels, no text.
Use true alpha transparency. Keep the same character identity, costume, palette, scale, camera angle, lighting, and pixel density in all 16 cells.
Right-facing side-view fighter poses unless a frame explicitly says left-facing recovery. Keep the full body inside every cell.
Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Prioritize body pose clarity over large magical effects.

Friedrich Nietzsche — The Abyssal Bruiser; role: high-risk bruiser.
Biography: German philosopher of critique, aphorism, eternal recurrence, the abyss, self-overcoming, and will to power recast as a stormy hammer bruiser. He fights as dangerous becoming: risk first, proof after impact.
Appearance: wild unmistakable moustache, intense eyes, swept hair, dark nineteenth-century coat, high collar, boots, compact philosopher hammer, storm-lit edges.
Palette: dark coat #1B1A20, moustache #4A2B19, hammer steel #80858A, abyss violet #3B235A, storm gold #F0C13B, fire orange #D85A24.
Animation identity: coiled hammer idle, swaggering walk, reckless forward run, aggressive hammer jump, abyss-ring block, dramatic but defiant hurt.
Normals: Hammer Aphorism: short low hammer snap, tiny gold crack, fast bruiser opener; Eternal Return Counter: torso curls around hammer, violet abyss loop, risky counter beat; Overman Rush: reckless shoulder-hammer drive, gold lightning and orange sparks, committal heavy rush
Specials: B>A Hammer Aphorism: startup hammer drawn back low, active forward smash sends ground crack, impact storm-gold crack orange edge, recovery hammer rebounds; B<A Eternal Return Counter: startup leans into danger, active violet abyss ring around hammer, impact ring snaps outward, recovery defiant twist; B>J Overman Rush: startup boots dig in coat lifts, active storm-lit hammer dash, impact gold lightning at shoulder, recovery skids exposed; BvJ Will-to-Power Storm: startup raises hammer abyss opens, active contained fire-lightning column, impact jagged arcs within cell, recovery storm collapses
Appearance continuity: wild unmistakable moustache, intense eyes, swept hair, dark nineteenth-century coat, high collar, boots, compact philosopher hammer, storm-lit edges
Palette anchors: dark coat #1B1A20, moustache #4A2B19, hammer steel #80858A, abyss violet #3B235A, storm gold #F0C13B, fire orange #D85A24
Animation identity: coiled hammer idle, swaggering walk, reckless forward run, aggressive hammer jump, abyss-ring block, dramatic but defiant hurt

Create EXACTLY one square RGBA sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, read left-to-right and top-to-bottom.
Use at least 1024x1024 pixels and dimensions divisible by four. No gutters, margins, borders, labels, captions, numbers, UI, or scenery.
True alpha transparency only. One complete full-body fighter in every cell. Orthographic side-view arcade camera. Stable grounded baseline.
Keep character identity, face, costume, permanent prop, palette, scale, lighting, outline weight, and pixel density identical in all cells.
Crisp deliberate pixel art with a limited palette and readable silhouette. Every cell is one clean animation drawing, never a blurred in-between.
Root-lock every grounded frame: keep the pelvis/root near the same cell coordinate. Show motion through stride, compression, weight transfer,
overlap, recoil, and counter-swing. Never bake progressive screen translation into a sheet; the game engine owns world movement.
Keep feet, hair, cloth, props, weapons, particles, projectiles, and effect trails fully inside their cell. Never connect marks across boundaries.
Temporary items or special props may appear only in the rows that explicitly require them. They must not alter the reusable idle silhouette.
Only the named fighter may appear. Hit-reaction and throw frames must not include a second complete opponent body.

CHARACTER NORMAL MOVE DEFINITIONS, in exact row order:
1. Hammer Aphorism: pose — short low hammer snap; compact VFX — tiny gold crack; gameplay read — fast bruiser opener.
2. Eternal Return Counter: pose — torso curls around hammer; compact VFX — violet abyss loop; gameplay read — risky counter beat.
3. Overman Rush: pose — reckless shoulder-hammer drive; compact VFX — gold lightning and orange sparks; gameplay read — committal heavy rush.

SHEET: THREE GROUNDED NORMAL ATTACKS AND ONE AIR ATTACK. Character faces right.
Row 1, frames 1-4: first listed normal — anticipation or startup, clearest active contact pose, follow-through, recovery toward idle.
Row 2, frames 5-8: second listed normal — startup, active contact, follow-through, recovery. Give it more commitment than row 1.
Row 3, frames 9-12: third listed normal — heavy startup, strongest active silhouette, weighted follow-through, longer recovery.
Row 4, frames 13-16: character-specific air attack — airborne anticipation, active strike, aerial follow-through, landing-ready recovery.

Do not include an opponent. VFX is compact and secondary to limb contact. Adjacent attack phases must be visibly distinct.
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, equations, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing permanent prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, giant projectiles, detached limbs, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
