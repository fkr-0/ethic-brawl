---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "aquinas"
character_title: "Thomas Aquinas"
prompt_id: "special_effects_4x4"
job_id: "aquinas__special_effects_4x4"
status: pending_render
output_image: "assets/sprites/roster/aquinas/source/animation-v2/aquinas_special_effects_4x4.png"
frames: 16
grid:
  columns: 4
  rows: 4
cell_size: [256, 256]
output_size: [1024, 1024]
reference_images:
  - "assets/sprites/roster/aquinas/source/aquinas_core_4x4.png"
  - "assets/sprites/roster/aquinas/source/aquinas_extended_4x4.png"
source_character: "characters/aquinas/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Thomas Aquinas — `special_effects_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/aquinas/source/animation-v2/aquinas_special_effects_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/aquinas/source/aquinas_core_4x4.png`
- `assets/sprites/roster/aquinas/source/aquinas_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `special_effect_slot_1_v2` | `0, 1, 2, 3` | `once` | 3 |
| `special_effect_slot_2_v2` | `4, 5, 6, 7` | `once` | 3 |
| `special_effect_slot_3_v2` | `8, 9, 10, 11` | `once` | 3 |
| `special_effect_slot_4_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art VFX sprite sheet for ETHIC BRAWL: aquinas.

Character identity reference: Thomas Aquinas — The Angelic Doctor; role: holy tank.
Biography: Medieval scholastic theologian and philosopher recast as a cathedral made mobile. He absorbs objections as pressure, answers with radiant proofs, and turns the floor beneath him into consecrated ground.
Appearance: broad monk face under Dominican hood, black-and-white habit, rope belt, chained codex, heavy grounded frame, serene immovable expression.
Palette: habit black #17171A, habit white #F1EFE4, cloth shadow #BAB7A8, codex brown #6B4E2E, divine gold #F3D36B, ivory #FFF4C8.
Animation identity: deep cloth-settling breath, heavy walk, unstoppable slow run, short heavy jump, codex shield block.
Normals: Summa Strike: planted forearm/codex shove, ivory impact square, armored light bash; Scholastic Hammer: codex gavel overhead, gold page flash, medium punish; Cathedral Charge: shoulder and codex rush, stone dust and gold edge, heavy knockback
Specials: B>A Five Ways Ray: startup opens codex five sparks align, active five chunky gold rays fan forward, impact narrow rays reveal body, recovery codex half-closes; B<A Scholastic Shield: startup codex lifted vertically, active ivory-gold shield wall, impact square cathedral tiles absorb, recovery aura contracts; BvA Basilica Consecration: startup lowers codex to ground, active gold basilica sigil appears, impact floor pulse expands, recovery rises slowly; BvJ Prime Cause Field: startup codex raised both hands, active contained cathedral aura, impact gold rings stabilize, recovery immovable stance
Palette anchors: habit black #17171A, habit white #F1EFE4, cloth shadow #BAB7A8, codex brown #6B4E2E, divine gold #F3D36B, ivory #FFF4C8

Create EXACTLY one square RGBA effect-sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, row-major.
Use at least 1024x1024 pixels and dimensions divisible by four. True alpha transparency only; no scenery, floor, UI, labels, or text.
Each cell contains one isolated character-specific effect phase without the fighter body. Keep palette, pixel density, lighting, and outline language consistent.
Center every effect on a stable origin. Keep the complete effect, projectile, field edge, particles, and dissipating fragments fully inside its cell.
Never connect pixels across cells. Do not draw generic fireballs when the move description calls for a beam, counter plane, dash trail, summon, field, or physical shock.
Effects must remain readable at gameplay scale and visually match the character bible without relying on readable symbols, letters, or equations.

CHARACTER SPECIAL DEFINITIONS, in exact row order:
1. B>A — Five Ways Ray: startup — opens codex five sparks align; active — five chunky gold rays fan forward; impact or sustain — narrow rays reveal body; recovery — codex half-closes.
2. B<A — Scholastic Shield: startup — codex lifted vertically; active — ivory-gold shield wall; impact or sustain — square cathedral tiles absorb; recovery — aura contracts.
3. BvA — Basilica Consecration: startup — lowers codex to ground; active — gold basilica sigil appears; impact or sustain — floor pulse expands; recovery — rises slowly.
4. BvJ — Prime Cause Field: startup — codex raised both hands; active — contained cathedral aura; impact or sustain — gold rings stabilize; recovery — immovable stance.

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
