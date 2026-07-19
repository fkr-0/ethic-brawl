---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 1
character_id: "camus"
character_title: "Albert Camus"
prompt_id: "walk_forward_backward_4x4"
status: pending_render
output_image: "assets/sprites/roster/camus/source/animation-v2/camus_walk_forward_backward_4x4.png"
reference_images: []
source_character: "characters/camus/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Albert Camus — `walk_forward_backward_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/camus/source/animation-v2/camus_walk_forward_backward_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Review state: `pending_render`

## Suggested reference images

- No approved source sheet was found automatically; provide the closest approved character reference manually.

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `walk_forward_v2` | `0, 1, 2, 3, 4, 5, 6, 7` | `loop` | 4 |
| `walk_backward_v2` | `8, 9, 10, 11, 12, 13, 14, 15` | `loop` | 5 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Albert Camus.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom.
Every cell must be the same size, perfectly aligned, with no gutters, no margins, no border, no labels, no text.
Use true alpha transparency. Keep the same character identity, costume, palette, scale, camera angle, lighting, and pixel density in all 16 cells.
Right-facing side-view fighter poses unless a frame explicitly says left-facing recovery. Keep the full body inside every cell.
Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Prioritize body pose clarity over large magical effects.

Albert Camus — The Absurdist; role: evasive counter duelist.
Biography: French-Algerian absurdist writer and moral rebel recast as a calm cigarette-lit duelist. He fights not because the universe gives meaning, but because revolt is the only honest answer to meaninglessness. His round arc moves from detached observer, to precise counter-rebel, to a quiet victory gesture that refuses melodrama.
Appearance: sharp jaw, short dark hair, tired eyes, charcoal mid-century suit, off-white shirt, loosened tie, rolled sleeves, polished shoes, thin cigarette and controlled smoke ribbons.
Palette: charcoal #24272B, off-white #E8E1D2, smoke #AEB5B8, sun gold #F6C453, void teal #00F5FF.
Animation identity: elegant dancer balance, small cigarette inhale idle, compact sidestep run, composed airborne tuck, forearm smoke-veil block.
Normals: Absurd Jab: economical lead jab, tiny smoke snap, fast interrupting poke; Rebel Backfist: half-turn backfist with smoke crescent, gray arc with void-teal edge, mid pressure and whiff punish; Sisyphus Heel: precise lateral heel or heel-drop, sun glint at heel, heavy chain finisher
Specials: B>A Absurd Revolt Wave: startup smoke gathers in palm, active low void-teal shockwave with sun rim, impact ground ribbon wave, recovery exhale recovery; B<A Rebel Reversal: startup exposed shoulder bait, active smoke crescent mirror guard, impact compact riposte flash, recovery shield dissolves; B>J Invincible Summer Dash: startup low loaded sunlit step, active thin dash with smoke afterimages, impact reappears balanced, recovery tie settles; BvJ The Absurd Domain: startup ash drops to ground, active void-teal ring expands, impact quiet sun motes orbit, recovery open-palm sustain
Appearance continuity: sharp jaw, short dark hair, tired eyes, charcoal mid-century suit, off-white shirt, loosened tie, rolled sleeves, polished shoes, thin cigarette and controlled smoke ribbons
Palette anchors: charcoal #24272B, off-white #E8E1D2, smoke #AEB5B8, sun gold #F6C453, void teal #00F5FF
Animation identity: elegant dancer balance, small cigarette inhale idle, compact sidestep run, composed airborne tuck, forearm smoke-veil block

Create EXACTLY one square RGBA sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, read left-to-right and top-to-bottom.
Use at least 1024x1024 pixels and dimensions divisible by four. No gutters, margins, borders, labels, captions, numbers, UI, or scenery.
True alpha transparency only. One full-body fighter in every cell. Orthographic side-view arcade camera. Stable ground baseline.
Keep character identity, face, costume, prop, palette, scale, lighting, outline weight, and pixel density identical in all cells.
Crisp deliberate pixel art with a limited palette and readable silhouette. Do not paint intermediate blur; each cell is a clean animation drawing.
Root-lock every grounded frame: keep the pelvis/root near the same cell coordinate. Show movement through stride, compression, weight transfer,
overlap, and counter-swing. Do not move the character progressively across the sheet. The game engine supplies screen translation.
Keep feet inside the cell, keep effects compact, and never connect marks across cell boundaries.

SHEET: EIGHT-FRAME FORWARD WALK AND EIGHT-FRAME BACKWARD WALK. Character faces right in all 16 cells.

Frames 1-8, advancing walk loop:
1 right heel contact / left toe push;
2 weight accepts onto right leg, body at lowest point;
3 left leg passes under pelvis, arms counter-swing;
4 right leg supports, body at highest point;
5 left heel contact / right toe push;
6 weight accepts onto left leg, body at lowest point;
7 right leg passes under pelvis, opposite arm counter-swing;
8 left leg supports, body at highest point and loops cleanly to frame 1.

Frames 9-16, guarded backward walk loop while still facing right:
9 rear/left toe reaches back cautiously, guard tightens;
10 weight shifts onto rear leg, torso stays oriented toward opponent;
11 front/right foot passes back beneath pelvis, shoulders counter-rotate less than forward walk;
12 rear leg supports, body rises slightly;
13 front/right toe reaches back;
14 weight shifts onto front/right leg without turning away;
15 rear/left foot passes beneath pelvis;
16 front/right leg supports and loops cleanly to frame 9.

Forward and backward cycles must be visually distinct. Backward movement is defensive, shorter-stride, and never a mirrored forward walk.
Root remains centered in every cell. Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
