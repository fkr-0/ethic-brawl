---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "diogenes"
character_title: "Diogenes of Sinope"
prompt_id: "mobility_evasion_throw_4x4"
job_id: "diogenes__mobility_evasion_throw_4x4"
status: pending_render
output_image: "assets/sprites/roster/diogenes/source/animation-v2/diogenes_mobility_throw_4x4.png"
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

# Diogenes of Sinope — `mobility_evasion_throw_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/diogenes/source/animation-v2/diogenes_mobility_throw_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/diogenes/source/diogenes_core_4x4.png`
- `assets/sprites/roster/diogenes/source/diogenes_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `dash_forward_v2` | `0, 1, 2, 3` | `once` | 3 |
| `dash_backward_v2` | `4, 5, 6, 7` | `once` | 3 |
| `evade_v2` | `8, 9, 10, 11` | `once` | 3 |
| `throw_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Diogenes of Sinope.

Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom.
Every cell must be the same size and perfectly aligned, with no gutters, margins, border, labels, captions, or text.
Use true alpha transparency. Keep character identity, costume, palette, scale, camera angle, lighting, and pixel density identical in all 16 cells.
Use a right-facing orthographic side-view fighter camera unless a frame explicitly turns or falls. Keep the complete body and every prop inside its cell.
Crisp readable 2D arcade pixel art, limited palette, hard-edged clusters, and a strong silhouette. Prioritize body mechanics over decorative effects.

Diogenes of Sinope — The Cynic; role: scrappy defensive disruptor.

Biography: an old ascetic philosopher who rejects status, comfort, and polite hypocrisy. He fights from a low feral stance, exposes pretension with a lantern, and uses a battered storage tub or barrel only during named special moves.

Appearance: elderly lean wiry body, weathered face, long rough gray beard and gray hair, bare lower legs, simple light Greek tunic, sun-bleached cream himation or tattered cloak, rope belt, worn leather sandals or bare feet. A small bronze lantern is the permanent readable prop. Keep the clothes traditional, pale, practical, and visibly patched rather than modern or armored.

Palette: linen cream #D8C9A5, weathered ochre #9A6B35, olive brown #5E5038, beard gray #9A9488, bronze #A86F32, lantern gold #F4C95D, tiny truth-cyan accent #59DDE8.

Animation identity: hunched low center of gravity, abrupt dog-like cadence, long forward lean, asymmetric cloak drag, suspicious head turns, scrappy hooking swats, shoulder checks, and short rising kicks. The lantern follows the wrist with delayed secondary motion but never changes size.

Normals: Barrel Flick, Lantern Swipe, and Dog's Kick. Specials: Lantern Truth Flash, Barrel Roll Quake, Beggar's Scramble, and Tub Retreat.
Appearance continuity: elderly lean ascetic with weathered face, long rough gray beard and hair, pale traditional Greek tunic and patched himation, rope belt, worn sandals or bare feet, one small bronze lantern; tub or barrel appears only in named specials
Palette anchors: linen cream #D8C9A5, weathered ochre #9A6B35, olive brown #5E5038, beard gray #9A9488, bronze #A86F32, lantern gold #F4C95D, truth cyan #59DDE8
Animation identity: hunched low center, abrupt feral cadence, asymmetric cloak drag, scrappy hooking swats, shoulder checks, short rising kicks, lantern wrist-lag and suspicious head movement

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

SHEET: COMBAT MOBILITY, EVASION, AND THROW MOTION.
Row 1, frames 1-4: forward dash — load, explosive first step, longest dash pose, planted brake. Root remains centered.
Row 2, frames 5-8: backward dash — guarded recoil step, committed retreat, widest retreat pose, stable recovery while facing right.
Row 3, frames 9-12: evasive dodge or roll appropriate to this character — anticipation, smallest target silhouette, passing phase, punish-ready recovery.
Row 4, frames 13-16: empty-hand grab and throw caster motion — reach, secure grip pose without showing a full opponent, directional throw release, recovery.

No baked translation, no second complete person, and no afterimage crossing a cell boundary.
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, cross-cell motion trails, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, young face, black modern clothing, red superhero costume, polished armor, giant lantern, permanent barrel, costume changes, beard changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, equations, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing permanent prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, giant projectiles, detached limbs, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
