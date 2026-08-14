---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "kant"
character_title: "Immanuel Kant"
prompt_id: "special_effects_4x4"
job_id: "kant__special_effects_4x4"
status: pending_render
output_image: "assets/sprites/roster/kant/source/animation-v2/kant_special_effects_4x4.png"
frames: 16
grid:
  columns: 4
  rows: 4
cell_size: [256, 256]
output_size: [1024, 1024]
reference_images:
  - "assets/sprites/roster/kant/source/kant_core_4x4.png"
  - "assets/sprites/roster/kant/source/kant_extended_4x4.png"
source_character: "characters/kant/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Immanuel Kant — `special_effects_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/kant/source/animation-v2/kant_special_effects_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/kant/source/kant_core_4x4.png`
- `assets/sprites/roster/kant/source/kant_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `special_effect_slot_1_v2` | `0, 1, 2, 3` | `once` | 3 |
| `special_effect_slot_2_v2` | `4, 5, 6, 7` | `once` | 3 |
| `special_effect_slot_3_v2` | `8, 9, 10, 11` | `once` | 3 |
| `special_effect_slot_4_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art VFX sprite sheet for ETHIC BRAWL: kant.

Character identity reference: Immanuel Kant — The Categorical Lawgiver; role: lawful control mage; mechanic: beams, constraints, reflective duty.
Biography/combat fantasy: Prussian critical philosopher recast as a lawful control mage. Kant constrains motion with duty sigils, reflects phenomena at the noumenal boundary, and fires universal law as clean geometric beams.
Appearance: small precise professor silhouette, powdered wig or tied white hair, dark Prussian coat, waistcoat, cane or book, starry-heavens lining and law-sigil geometry.
Palette: prussian navy #17223B, wig white #E7E4DA, waistcoat gray #8A8F99, duty gold #DAB85C, noumenal violet #6E5BFF, law blue #4FA3FF.
Animation identity: clockwork idle, tiny exact walk, stiff controlled run, small precise jump, reflective book/cane block, starry-heavens victory glance.
Normals: Maxim Jab: small exact cane poke, blue law tick, precise opener; Duty Palm: rigid palm/book push, gold constraint bracket, control pressure; Sublime Kick: stiff upward kick with coat flare, violet star spark, anti-air ender
Specials: B>A Universal Law Beam: startup cane/book aligns with perfect posture, active straight law-blue beam fires forward, impact gold duty brackets frame beam, recovery returns to clockwork stance; B<A Noumenal Reflect: startup book closes over chest, active violet reflective plane appears, impact incoming force bends off invisible boundary, recovery plane folds into book; BvA Duty Sigil: startup sets cane tip to floor, active gold duty sigil appears under target lane, impact constraint lines lock low space, recovery cane lifts precisely; BvJ Kingdom of Ends: startup raises book toward starry lining, active blue-gold moral geometry field expands, impact starry duty nodes orbit once, recovery field resolves into calm stance
Palette anchors: prussian navy #17223B, wig white #E7E4DA, waistcoat gray #8A8F99, duty gold #DAB85C, noumenal violet #6E5BFF, law blue #4FA3FF

Create EXACTLY one square RGBA effect-sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, row-major.
Use at least 1024x1024 pixels and dimensions divisible by four. True alpha transparency only; no scenery, floor, UI, labels, or text.
Each cell contains one isolated character-specific effect phase without the fighter body. Keep palette, pixel density, lighting, and outline language consistent.
Center every effect on a stable origin. Keep the complete effect, projectile, field edge, particles, and dissipating fragments fully inside its cell.
Never connect pixels across cells. Do not draw generic fireballs when the move description calls for a beam, counter plane, dash trail, summon, field, or physical shock.
Effects must remain readable at gameplay scale and visually match the character bible without relying on readable symbols, letters, or equations.

CHARACTER SPECIAL DEFINITIONS, in exact row order:
1. B>A — Universal Law Beam: startup — cane/book aligns with perfect posture; active — straight law-blue beam fires forward; impact or sustain — gold duty brackets frame beam; recovery — returns to clockwork stance.
2. B<A — Noumenal Reflect: startup — book closes over chest; active — violet reflective plane appears; impact or sustain — incoming force bends off invisible boundary; recovery — plane folds into book.
3. BvA — Duty Sigil: startup — sets cane tip to floor; active — gold duty sigil appears under target lane; impact or sustain — constraint lines lock low space; recovery — cane lifts precisely.
4. BvJ — Kingdom of Ends: startup — raises book toward starry lining; active — blue-gold moral geometry field expands; impact or sustain — starry duty nodes orbit once; recovery — field resolves into calm stance.

SHEET: FOUR CHARACTER-SPECIFIC SPECIAL EFFECT SEQUENCES, ONE INDEPENDENT ROW PER CURRENT SPECIAL.
Row 1, frames 1-4: first listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 2, frames 5-8: second listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 3, frames 9-12: third listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 4, frames 13-16: fourth listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.

For physical or movement specials, render the compact trail, dust, shock, counter flash, or field component rather than inventing a projectile.
No fighter body, opponent, scenery, readable text, equations, or effect crossing a cell boundary.
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters unless the character is explicitly a duo-as-one silhouette, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, equations, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing permanent prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, giant projectiles, detached limbs, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
