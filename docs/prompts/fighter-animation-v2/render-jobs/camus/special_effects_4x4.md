---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "camus"
character_title: "Albert Camus"
prompt_id: "special_effects_4x4"
job_id: "camus__special_effects_4x4"
status: pending_render
output_image: "assets/sprites/roster/camus/source/animation-v2/camus_special_effects_4x4.png"
frames: 16
grid:
  columns: 4
  rows: 4
cell_size: [256, 256]
output_size: [1024, 1024]
reference_images:
  - "assets/sprites/roster/camus/source/camus_core_4x4.png"
  - "assets/sprites/roster/camus/source/camus_extended_4x4.png"
source_character: "characters/camus/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Albert Camus — `special_effects_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/camus/source/animation-v2/camus_special_effects_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/camus/source/camus_core_4x4.png`
- `assets/sprites/roster/camus/source/camus_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `special_effect_slot_1_v2` | `0, 1, 2, 3` | `once` | 3 |
| `special_effect_slot_2_v2` | `4, 5, 6, 7` | `once` | 3 |
| `special_effect_slot_3_v2` | `8, 9, 10, 11` | `once` | 3 |
| `special_effect_slot_4_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art VFX sprite sheet for ETHIC BRAWL: camus.

Character identity reference: Albert Camus — The Absurdist; role: evasive counter duelist.
Biography: French-Algerian absurdist writer and moral rebel recast as a calm cigarette-lit duelist. He fights not because the universe gives meaning, but because revolt is the only honest answer to meaninglessness. His round arc moves from detached observer, to precise counter-rebel, to a quiet victory gesture that refuses melodrama.
Appearance: sharp jaw, short dark hair, tired eyes, charcoal mid-century suit, off-white shirt, loosened tie, rolled sleeves, polished shoes, thin cigarette and controlled smoke ribbons.
Palette: charcoal #24272B, off-white #E8E1D2, smoke #AEB5B8, sun gold #F6C453, void teal #00F5FF.
Animation identity: elegant dancer balance, small cigarette inhale idle, compact sidestep run, composed airborne tuck, forearm smoke-veil block.
Normals: Absurd Jab: economical lead jab, tiny smoke snap, fast interrupting poke; Rebel Backfist: half-turn backfist with smoke crescent, gray arc with void-teal edge, mid pressure and whiff punish; Sisyphus Heel: precise lateral heel or heel-drop, sun glint at heel, heavy chain finisher
Specials: B>A Absurd Revolt Wave: startup smoke gathers in palm, active low void-teal shockwave with sun rim, impact ground ribbon wave, recovery exhale recovery; B<A Rebel Reversal: startup exposed shoulder bait, active smoke crescent mirror guard, impact compact riposte flash, recovery shield dissolves; B>J Invincible Summer Dash: startup low loaded sunlit step, active thin dash with smoke afterimages, impact reappears balanced, recovery tie settles; BvJ The Absurd Domain: startup ash drops to ground, active void-teal ring expands, impact quiet sun motes orbit, recovery open-palm sustain
Palette anchors: charcoal #24272B, off-white #E8E1D2, smoke #AEB5B8, sun gold #F6C453, void teal #00F5FF

Create EXACTLY one square RGBA effect-sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, row-major.
Use at least 1024x1024 pixels and dimensions divisible by four. True alpha transparency only; no scenery, floor, UI, labels, or text.
Each cell contains one isolated character-specific effect phase without the fighter body. Keep palette, pixel density, lighting, and outline language consistent.
Center every effect on a stable origin. Keep the complete effect, projectile, field edge, particles, and dissipating fragments fully inside its cell.
Never connect pixels across cells. Do not draw generic fireballs when the move description calls for a beam, counter plane, dash trail, summon, field, or physical shock.
Effects must remain readable at gameplay scale and visually match the character bible without relying on readable symbols, letters, or equations.

CHARACTER SPECIAL DEFINITIONS, in exact row order:
1. B>A — Absurd Revolt Wave: startup — smoke gathers in palm; active — low void-teal shockwave with sun rim; impact or sustain — ground ribbon wave; recovery — exhale recovery.
2. B<A — Rebel Reversal: startup — exposed shoulder bait; active — smoke crescent mirror guard; impact or sustain — compact riposte flash; recovery — shield dissolves.
3. B>J — Invincible Summer Dash: startup — low loaded sunlit step; active — thin dash with smoke afterimages; impact or sustain — reappears balanced; recovery — tie settles.
4. BvJ — The Absurd Domain: startup — ash drops to ground; active — void-teal ring expands; impact or sustain — quiet sun motes orbit; recovery — open-palm sustain.

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
