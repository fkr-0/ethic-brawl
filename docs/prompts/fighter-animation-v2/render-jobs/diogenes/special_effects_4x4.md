---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "diogenes"
character_title: "Diogenes of Sinope"
prompt_id: "special_effects_4x4"
job_id: "diogenes__special_effects_4x4"
status: pending_render
output_image: "assets/sprites/roster/diogenes/source/animation-v2/diogenes_special_effects_4x4.png"
frames: 16
grid:
  columns: 4
  rows: 4
cell_size: [256, 256]
output_size: [1024, 1024]
reference_images:
  - "assets/sprites/roster/diogenes/source/diogenes_core_4x4.png"
  - "assets/sprites/roster/diogenes/source/diogenes_extended_4x4.png"
source_character: "characters/diogenes/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Diogenes of Sinope — `special_effects_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/diogenes/source/animation-v2/diogenes_special_effects_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/diogenes/source/diogenes_core_4x4.png`
- `assets/sprites/roster/diogenes/source/diogenes_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `special_effect_slot_1_v2` | `0, 1, 2, 3` | `once` | 3 |
| `special_effect_slot_2_v2` | `4, 5, 6, 7` | `once` | 3 |
| `special_effect_slot_3_v2` | `8, 9, 10, 11` | `once` | 3 |
| `special_effect_slot_4_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art VFX sprite sheet for ETHIC BRAWL: diogenes.

Character identity reference: Diogenes of Sinope — The Cynic; role: scrappy defensive disruptor.

Biography: an old ascetic philosopher who rejects status, comfort, and polite hypocrisy. He fights from a low feral stance, exposes pretension with a lantern, and uses a battered storage tub or barrel only during named special moves.

Appearance: elderly lean wiry body, weathered face, long rough gray beard and gray hair, bare lower legs, simple light Greek tunic, sun-bleached cream himation or tattered cloak, rope belt, worn leather sandals or bare feet. A small bronze lantern is the permanent readable prop. Keep the clothes traditional, pale, practical, and visibly patched rather than modern or armored.

Palette: linen cream #D8C9A5, weathered ochre #9A6B35, olive brown #5E5038, beard gray #9A9488, bronze #A86F32, lantern gold #F4C95D, tiny truth-cyan accent #59DDE8.

Animation identity: hunched low center of gravity, abrupt dog-like cadence, long forward lean, asymmetric cloak drag, suspicious head turns, scrappy hooking swats, shoulder checks, and short rising kicks. The lantern follows the wrist with delayed secondary motion but never changes size.

Normals: Barrel Flick, Lantern Swipe, and Dog's Kick. Specials: Lantern Truth Flash, Barrel Roll Quake, Beggar's Scramble, and Tub Retreat.
Palette anchors: linen cream #D8C9A5, weathered ochre #9A6B35, olive brown #5E5038, beard gray #9A9488, bronze #A86F32, lantern gold #F4C95D, truth cyan #59DDE8

Create EXACTLY one square RGBA effect-sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, row-major.
Use at least 1024x1024 pixels and dimensions divisible by four. True alpha transparency only; no scenery, floor, UI, labels, or text.
Each cell contains one isolated character-specific effect phase without the fighter body. Keep palette, pixel density, lighting, and outline language consistent.
Center every effect on a stable origin. Keep the complete effect, projectile, field edge, particles, and dissipating fragments fully inside its cell.
Never connect pixels across cells. Do not draw generic fireballs when the move description calls for a beam, counter plane, dash trail, summon, field, or physical shock.
Effects must remain readable at gameplay scale and visually match the character bible without relying on readable symbols, letters, or equations.

CHARACTER SPECIAL DEFINITIONS, in exact row order:
1. B>A — Lantern Truth Flash: startup — shelters the lantern near the chest while harsh light gathers behind the shutter; active — lunges and thrusts the lantern forward, opening a compact white-gold truth beam; impact or sustain — cyan-edged flare exposes the target without hiding Diogenes' silhouette; recovery — arm recoils, lantern swings once, and the hunched guard returns.
2. BvA — Barrel Roll Quake: startup — braces low and shoves a battered tub or small barrel from beside the body; active — rolling barrel leaves the hands while Diogenes follows with a grounded push; impact or sustain — compact ochre shock ring and barrel bounce remain inside the cell; recovery — straightens only slightly, dust settles, barrel is no longer part of the idle silhouette.
3. B>J — Beggar's Scramble: startup — drops onto the front foot with cloak and free hand close to the ground; active — armored low scramble-dash with elbows tucked and lantern protected; impact or sustain — shoulder or hip check with a brief gold contact flash; recovery — short skid, suspicious look back, and return to low guard.
4. B<J — Tub Retreat: startup — twists backward and pulls the battered tub between himself and the opponent; active — retreats in a low sliding defensive motion behind the tub rim; impact or sustain — bronze counter flash at the rim while the body remains readable; recovery — emerges from cover, tub vanishes from the reusable neutral silhouette, lantern settles.

SHEET: FOUR CHARACTER-SPECIFIC SPECIAL EFFECT SEQUENCES, ONE INDEPENDENT ROW PER CURRENT SPECIAL.
Row 1, frames 1-4: first listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 2, frames 5-8: second listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 3, frames 9-12: third listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 4, frames 13-16: fourth listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.

For physical or movement specials, render the compact trail, dust, shock, counter flash, or field component rather than inventing a projectile.
No fighter body, opponent, scenery, readable text, equations, or effect crossing a cell boundary.
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, cross-cell motion trails, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, young face, black modern clothing, red superhero costume, polished armor, giant lantern, permanent barrel, costume changes, beard changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, equations, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing permanent prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, giant projectiles, detached limbs, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
