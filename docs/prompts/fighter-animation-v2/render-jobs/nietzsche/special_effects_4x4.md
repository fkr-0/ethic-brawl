---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "nietzsche"
character_title: "Friedrich Nietzsche"
prompt_id: "special_effects_4x4"
job_id: "nietzsche__special_effects_4x4"
status: rendered_unreviewed
output_image: "assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_special_effects_4x4.png"
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

# Friedrich Nietzsche — `special_effects_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_special_effects_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `rendered_unreviewed`

## Suggested reference images

- `assets/sprites/roster/nietzsche/source/nietzsche_core_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `special_effect_slot_1_v2` | `0, 1, 2, 3` | `once` | 3 |
| `special_effect_slot_2_v2` | `4, 5, 6, 7` | `once` | 3 |
| `special_effect_slot_3_v2` | `8, 9, 10, 11` | `once` | 3 |
| `special_effect_slot_4_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art VFX sprite sheet for ETHIC BRAWL: nietzsche.

Character identity reference: Friedrich Nietzsche — The Abyssal Bruiser; role: high-risk bruiser.
Biography: German philosopher of critique, aphorism, eternal recurrence, the abyss, self-overcoming, and will to power recast as a stormy hammer bruiser. He fights as dangerous becoming: risk first, proof after impact.
Appearance: wild unmistakable moustache, intense eyes, swept hair, dark nineteenth-century coat, high collar, boots, compact philosopher hammer, storm-lit edges.
Palette: dark coat #1B1A20, moustache #4A2B19, hammer steel #80858A, abyss violet #3B235A, storm gold #F0C13B, fire orange #D85A24.
Animation identity: coiled hammer idle, swaggering walk, reckless forward run, aggressive hammer jump, abyss-ring block, dramatic but defiant hurt.
Normals: Hammer Aphorism: short low hammer snap, tiny gold crack, fast bruiser opener; Eternal Return Counter: torso curls around hammer, violet abyss loop, risky counter beat; Overman Rush: reckless shoulder-hammer drive, gold lightning and orange sparks, committal heavy rush
Specials: B>A Hammer Aphorism: startup hammer drawn back low, active forward smash sends ground crack, impact storm-gold crack orange edge, recovery hammer rebounds; B<A Eternal Return Counter: startup leans into danger, active violet abyss ring around hammer, impact ring snaps outward, recovery defiant twist; B>J Overman Rush: startup boots dig in coat lifts, active storm-lit hammer dash, impact gold lightning at shoulder, recovery skids exposed; BvJ Will-to-Power Storm: startup raises hammer abyss opens, active contained fire-lightning column, impact jagged arcs within cell, recovery storm collapses
Palette anchors: dark coat #1B1A20, moustache #4A2B19, hammer steel #80858A, abyss violet #3B235A, storm gold #F0C13B, fire orange #D85A24

Create EXACTLY one square RGBA effect-sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, row-major.
Use at least 1024x1024 pixels and dimensions divisible by four. True alpha transparency only; no scenery, floor, UI, labels, or text.
Each cell contains one isolated character-specific effect phase without the fighter body. Keep palette, pixel density, lighting, and outline language consistent.
Center every effect on a stable origin. Keep the complete effect, projectile, field edge, particles, and dissipating fragments fully inside its cell.
Never connect pixels across cells. Do not draw generic fireballs when the move description calls for a beam, counter plane, dash trail, summon, field, or physical shock.
Effects must remain readable at gameplay scale and visually match the character bible without relying on readable symbols, letters, or equations.

CHARACTER SPECIAL DEFINITIONS, in exact row order:
1. B>A — Hammer Aphorism: startup — hammer drawn back low; active — forward smash sends ground crack; impact or sustain — storm-gold crack orange edge; recovery — hammer rebounds.
2. B<A — Eternal Return Counter: startup — leans into danger; active — violet abyss ring around hammer; impact or sustain — ring snaps outward; recovery — defiant twist.
3. B>J — Overman Rush: startup — boots dig in coat lifts; active — storm-lit hammer dash; impact or sustain — gold lightning at shoulder; recovery — skids exposed.
4. BvJ — Will-to-Power Storm: startup — raises hammer abyss opens; active — contained fire-lightning column; impact or sustain — jagged arcs within cell; recovery — storm collapses.

SHEET: FOUR CHARACTER-SPECIFIC SPECIAL EFFECT SEQUENCES, ONE INDEPENDENT ROW PER CURRENT SPECIAL.
Row 1, frames 1-4: first listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 2, frames 5-8: second listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 3, frames 9-12: third listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 4, frames 13-16: fourth listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.

For physical or movement specials, render the compact trail, dust, shock, counter flash, or field component rather than inventing a projectile.
No fighter body, opponent, scenery, readable text, equations, or effect crossing a cell boundary.
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, equations, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing permanent prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, giant projectiles, detached limbs, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
