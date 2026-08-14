---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "hegel"
character_title: "G.W.F. Hegel"
prompt_id: "specials_4x4"
job_id: "hegel__specials_4x4"
status: pending_render
output_image: "assets/sprites/roster/hegel/source/animation-v2/hegel_specials_4x4.png"
frames: 16
grid:
  columns: 4
  rows: 4
cell_size: [256, 256]
output_size: [1024, 1024]
reference_images:
  - "assets/sprites/roster/hegel/source/hegel_core_4x4.png"
  - "assets/sprites/roster/hegel/source/hegel_extended_4x4.png"
source_character: "characters/hegel/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# G.W.F. Hegel — `specials_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/hegel/source/animation-v2/hegel_specials_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/hegel/source/hegel_core_4x4.png`
- `assets/sprites/roster/hegel/source/hegel_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `special_slot_1_v2` | `0, 1, 2, 3` | `once` | 3 |
| `special_slot_2_v2` | `4, 5, 6, 7` | `once` | 3 |
| `special_slot_3_v2` | `8, 9, 10, 11` | `once` | 3 |
| `special_slot_4_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: G.W.F. Hegel.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom.
Every cell must be the same size, perfectly aligned, with no gutters, no margins, no border, no labels, no text.
Use true alpha transparency. Keep the same character identity, costume, palette, scale, camera angle, lighting, and pixel density in all 16 cells.
Right-facing side-view fighter poses unless a frame explicitly says left-facing recovery. Keep the full body inside every cell.
Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Prioritize body pose clarity over large magical effects.

G.W.F. Hegel — The Dialectician; role: evolving combo engine.
Biography: German idealist of dialectic, history, contradiction, and Geist recast as a three-beat combo professor. One motion asserts, the next negates, the third resolves into synthesis.
Appearance: stern professor face, heavy brow, dark academic coat, warm waistcoat, cravat, book-and-cane hybrid weapon, formal shoes.
Palette: academic coat #2A2625, shadow #141212, waistcoat #6B4A35, book ivory #D8C7A1, dialectic blue #4F7DB5, synthesis gold #E0B84D.
Animation identity: three-beat torso sway, deliberate lecturing walk, accelerating argumentative march, heavy professor leap, book-and-cane contradiction block.
Normals: Thesis Tap: short cane assertion, blue thesis spark, starter; Antithesis Break: cross-body cane/book strike, blue-gold crossing slash, advancing pressure; Synthesis Crown: cane rises book opens, small crown flash, launcher ender
Specials: B>A Thesis Bolt: startup book opens to blue point, active cane releases compact bolt, impact simple moving node, recovery book half-closes; B<A Antithesis Reversal: startup book raised cane back, active blue counter pulse crosses body, impact gold flash snaps outward, recovery twist resolves; B>J Synthesis Dash: startup three motes align at feet, active dash in three beats, impact third beat gold hit, recovery cane planted; BvJ World-Spirit Domain: startup book opens both hands, active blue-gold spiral field, impact three linked nodes orbit, recovery crown glint fades
Appearance continuity: stern professor face, heavy brow, dark academic coat, warm waistcoat, cravat, book-and-cane hybrid weapon, formal shoes
Palette anchors: academic coat #2A2625, shadow #141212, waistcoat #6B4A35, book ivory #D8C7A1, dialectic blue #4F7DB5, synthesis gold #E0B84D
Animation identity: three-beat torso sway, deliberate lecturing walk, accelerating argumentative march, heavy professor leap, book-and-cane contradiction block

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

CHARACTER SPECIAL DEFINITIONS, in exact row order:
1. B>A — Thesis Bolt: startup — book opens to blue point; active — cane releases compact bolt; impact or sustain — simple moving node; recovery — book half-closes.
2. B<A — Antithesis Reversal: startup — book raised cane back; active — blue counter pulse crosses body; impact or sustain — gold flash snaps outward; recovery — twist resolves.
3. B>J — Synthesis Dash: startup — three motes align at feet; active — dash in three beats; impact or sustain — third beat gold hit; recovery — cane planted.
4. BvJ — World-Spirit Domain: startup — book opens both hands; active — blue-gold spiral field; impact or sustain — three linked nodes orbit; recovery — crown glint fades.

SHEET: FOUR CURRENT COMMAND SPECIALS, ONE INDEPENDENT ROW PER MOVE.
Row 1, frames 1-4: first listed special — startup, active release, impact or sustain, recovery.
Row 2, frames 5-8: second listed special — startup, active release, impact or sustain, recovery.
Row 3, frames 9-12: third listed special — startup, active release, impact or sustain, recovery.
Row 4, frames 13-16: fourth listed special — startup, active release, impact or sustain, recovery.

Each row is a separate caster animation. Effects must remain compact, never blend between rows, and never hide the character's action.
Projectiles may begin inside the active cell but should not stretch to the cell edge; effect-only sheets can be authored later.
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, equations, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing permanent prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, giant projectiles, detached limbs, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
