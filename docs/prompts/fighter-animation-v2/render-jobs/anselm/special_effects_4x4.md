---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "anselm"
character_title: "Anselm of Canterbury"
prompt_id: "special_effects_4x4"
job_id: "anselm__special_effects_4x4"
status: pending_render
output_image: "assets/sprites/roster/anselm/source/animation-v2/anselm_special_effects_4x4.png"
frames: 16
grid:
  columns: 4
  rows: 4
cell_size: [256, 256]
output_size: [1024, 1024]
reference_images:
  - "assets/sprites/roster/anselm/source/anselm_core_4x4.png"
  - "assets/sprites/roster/anselm/source/anselm_extended_4x4.png"
source_character: "characters/anselm/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Anselm of Canterbury — `special_effects_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/anselm/source/animation-v2/anselm_special_effects_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/anselm/source/anselm_core_4x4.png`
- `assets/sprites/roster/anselm/source/anselm_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `special_effect_slot_1_v2` | `0, 1, 2, 3` | `once` | 3 |
| `special_effect_slot_2_v2` | `4, 5, 6, 7` | `once` | 3 |
| `special_effect_slot_3_v2` | `8, 9, 10, 11` | `once` | 3 |
| `special_effect_slot_4_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art VFX sprite sheet for ETHIC BRAWL: anselm.

Character identity reference: Anselm of Canterbury — The Ontological Proof; role: proof mage.
Biography: Medieval monk and philosopher of the Proslogion recast as a narrow proof-mage. His combat rhythm is premise, gesture, conclusion: quiet prayer-hand starts become unavoidable lines of manuscript light.
Appearance: narrow hooded monk face, intent eyes, brown robe, cord belt, illuminated manuscript talisman, prayer-hand posture, parchment seal glow.
Palette: monk brown #4B3325, robe shadow #2D1F19, parchment #DCC99B, manuscript red #A33A32, holy ivory #F8EDC6, logic blue #7FA9D8.
Animation identity: prayer-hand idle, restrained gliding walk, compact robe-ribbon run, seal-flash jump, crossed-hand proof shield.
Normals: Proslogion Pierce: two-finger or talisman thrust, tiny ivory-blue point, precise opener; Ontological Ray: hands open from prayer, thin ivory ray with red fleck, linear control; Credo Dive: descending prayer-hand strike, small seal burst, aerial ender
Specials: B>A Ontological Ray: startup talisman brightens, active narrow ivory-blue beam, impact glyph flecks no text, recovery hands close; B<A Greater-Than Counter: startup humble exposed stance, active proof seal unfolds, impact riposte pulse snaps, recovery robe settles; B^J Proslogion Rise: startup knees dip talisman up, active vertical manuscript seal lifts, impact rising shoulder ring, recovery hands close overhead; BvJ That-Than-Which Field: startup talisman near ground, active parchment ring expands, impact ivory-blue ticks pulse, recovery prayer at center
Palette anchors: monk brown #4B3325, robe shadow #2D1F19, parchment #DCC99B, manuscript red #A33A32, holy ivory #F8EDC6, logic blue #7FA9D8

Create EXACTLY one square RGBA effect-sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, row-major.
Use at least 1024x1024 pixels and dimensions divisible by four. True alpha transparency only; no scenery, floor, UI, labels, or text.
Each cell contains one isolated character-specific effect phase without the fighter body. Keep palette, pixel density, lighting, and outline language consistent.
Center every effect on a stable origin. Keep the complete effect, projectile, field edge, particles, and dissipating fragments fully inside its cell.
Never connect pixels across cells. Do not draw generic fireballs when the move description calls for a beam, counter plane, dash trail, summon, field, or physical shock.
Effects must remain readable at gameplay scale and visually match the character bible without relying on readable symbols, letters, or equations.

CHARACTER SPECIAL DEFINITIONS, in exact row order:
1. B>A — Ontological Ray: startup — talisman brightens; active — narrow ivory-blue beam; impact or sustain — glyph flecks no text; recovery — hands close.
2. B<A — Greater-Than Counter: startup — humble exposed stance; active — proof seal unfolds; impact or sustain — riposte pulse snaps; recovery — robe settles.
3. B^J — Proslogion Rise: startup — knees dip talisman up; active — vertical manuscript seal lifts; impact or sustain — rising shoulder ring; recovery — hands close overhead.
4. BvJ — That-Than-Which Field: startup — talisman near ground; active — parchment ring expands; impact or sustain — ivory-blue ticks pulse; recovery — prayer at center.

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
