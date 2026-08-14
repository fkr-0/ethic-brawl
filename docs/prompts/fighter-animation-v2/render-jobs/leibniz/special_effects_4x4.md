---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "leibniz"
character_title: "Gottfried Wilhelm Leibniz"
prompt_id: "special_effects_4x4"
job_id: "leibniz__special_effects_4x4"
status: pending_render
output_image: "assets/sprites/roster/leibniz/source/animation-v2/leibniz_special_effects_4x4.png"
frames: 16
grid:
  columns: 4
  rows: 4
cell_size: [256, 256]
output_size: [1024, 1024]
reference_images:
  - "assets/sprites/roster/leibniz/source/leibniz_core_4x4.png"
  - "assets/sprites/roster/leibniz/source/leibniz_extended_4x4.png"
source_character: "characters/leibniz/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Gottfried Wilhelm Leibniz — `special_effects_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/leibniz/source/animation-v2/leibniz_special_effects_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/leibniz/source/leibniz_core_4x4.png`
- `assets/sprites/roster/leibniz/source/leibniz_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `special_effect_slot_1_v2` | `0, 1, 2, 3` | `once` | 3 |
| `special_effect_slot_2_v2` | `4, 5, 6, 7` | `once` | 3 |
| `special_effect_slot_3_v2` | `8, 9, 10, 11` | `once` | 3 |
| `special_effect_slot_4_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art VFX sprite sheet for ETHIC BRAWL: leibniz.

Character identity reference: Gottfried Wilhelm Leibniz — The Optimist; role: methodical orb and logic projectile mage.

Biography: baroque polymath, diplomat, logician, and co-inventor of calculus recast as a precise technical duelist. His combat language treats motion as a proof: measured setup, exact contact, and elegant return. Monads appear as small luminous geometric orbs rather than floating text or equations.

Appearance: mature composed face, prominent dark eyebrows, large powdered white-gray curled wig, deep burgundy long coat with gold trim and layered cuffs, parchment-cream waistcoat and cravat, dark breeches, white stockings, buckle shoes, small brass calculation instrument or compass motif integrated at belt or hand.

Palette: burgundy #67243A, dark wine #321923, parchment #E8DDBF, powdered wig #D8D2C5, gold trim #C9A23A, brass #9A6A2E, monad cyan #59DDE8, possible-world violet #8665C5.

Animation identity: upright refined posture, rhythmic geometric cadence, symmetrical foot timing, restrained coat tails, compass-arc hand paths, exact straight jabs, centered technical kicks, and small monad orbs that orbit on controlled curves without obscuring the body.

Normals: Monad Jab, Calculus Palm, and Possible Worlds Arc. Specials: Monad Bolt, Possible World Mirror, Monad Orbit, and Best-World Engine.
Palette anchors: burgundy #67243A, dark wine #321923, parchment #E8DDBF, powdered wig #D8D2C5, gold trim #C9A23A, brass #9A6A2E, monad cyan #59DDE8, possible-world violet #8665C5

Create EXACTLY one square RGBA effect-sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, row-major.
Use at least 1024x1024 pixels and dimensions divisible by four. True alpha transparency only; no scenery, floor, UI, labels, or text.
Each cell contains one isolated character-specific effect phase without the fighter body. Keep palette, pixel density, lighting, and outline language consistent.
Center every effect on a stable origin. Keep the complete effect, projectile, field edge, particles, and dissipating fragments fully inside its cell.
Never connect pixels across cells. Do not draw generic fireballs when the move description calls for a beam, counter plane, dash trail, summon, field, or physical shock.
Effects must remain readable at gameplay scale and visually match the character bible without relying on readable symbols, letters, or equations.

CHARACTER SPECIAL DEFINITIONS, in exact row order:
1. B>A — Monad Bolt: startup — gathers one small cyan-gold orb between precise fingertips; active — extends the arm and releases the orb along a straight measured line; impact or sustain — compact monad pulse with one concentric geometric ring; recovery — fingers close, coat cuff settles, and the guard returns without flourish.
2. B<A — Possible World Mirror: startup — turns one palm inward while a thin violet-gold plane forms near the forearm; active — presents a compact reflective geometric shield at chest height; impact or sustain — mirrored pulse folds back toward the opponent in one sharp angle; recovery — plane collapses into two points and the torso unwinds to neutral.
3. B^J — Monad Orbit: startup — raises both hands as two or three tiny monads appear close to the shoulders; active — controlled orbs circle the torso on small non-overlapping paths; impact or sustain — orbit tightens into a protective cyan-gold ring while the body remains visible; recovery — orbs return to the leading hand and wink out one by one.
4. BvJ — Best-World Engine: startup — plants both feet and opens a compact brass geometric mechanism near the ground; active — a small field of interlocking gold and violet rings turns around the lower body; impact or sustain — the rings align into one optimal bright configuration without readable equations; recovery — mechanism folds shut, light drains inward, and Leibniz resumes exact guard.

SHEET: FOUR CHARACTER-SPECIFIC SPECIAL EFFECT SEQUENCES, ONE INDEPENDENT ROW PER CURRENT SPECIAL.
Row 1, frames 1-4: first listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 2, frames 5-8: second listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 3, frames 9-12: third listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 4, frames 13-16: fourth listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.

For physical or movement specials, render the compact trail, dust, shock, counter flash, or field component rather than inventing a projectile.
No fighter body, opponent, scenery, readable text, equations, or effect crossing a cell boundary.
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters, busy background, non-transparent background, checkerboard background, text, letters, equations, readable formulas, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, cross-cell motion trails, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, changing wig, changing coat length, modern suit, wizard robe, giant orbit effects, floating readable mathematics, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, equations, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing permanent prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, giant projectiles, detached limbs, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
