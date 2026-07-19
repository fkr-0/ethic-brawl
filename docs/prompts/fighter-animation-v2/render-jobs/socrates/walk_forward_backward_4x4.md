---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 1
character_id: "socrates"
character_title: "Socrates"
prompt_id: "walk_forward_backward_4x4"
status: pending_render
output_image: "assets/sprites/roster/socrates/source/animation-v2/socrates_walk_forward_backward_4x4.png"
reference_images:
  - "assets/sprites/roster/socrates/source/socrates_core_4x4.png"
  - "assets/sprites/roster/socrates/source/socrates_extended_4x4.png"
source_character: "characters/socrates/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Socrates — `walk_forward_backward_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/socrates/source/animation-v2/socrates_walk_forward_backward_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/socrates/source/socrates_core_4x4.png`
- `assets/sprites/roster/socrates/source/socrates_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `walk_forward_v2` | `0, 1, 2, 3, 4, 5, 6, 7` | `loop` | 4 |
| `walk_backward_v2` | `8, 9, 10, 11, 12, 13, 14, 15` | `loop` | 5 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Socrates.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom. Every cell must be same size, perfectly aligned, no gutters, no margins, no border, no labels, no text. Use true alpha transparency only. Keep the same character identity, costume, palette, scale, side-view camera, lighting, and pixel density in all 16 cells. Right-facing side-view fighter poses unless explicitly stated. Full body inside every cell. Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Compact VFX secondary to body pose clarity.

Socrates — The Gadfly Questioner; role: question/counter trickster; mechanic: reflection, stun, dialogue trap.
Biography/combat fantasy: Athenian gadfly recast as a question/counter trickster. Socrates wins by making the opponent answer: he reflects certainty, stuns with elenchus, traps the arena as an agora, and backs away with infuriating calm.
Appearance: balding head, pug nose, short beard, simple white himation/tunic, bare feet or sandals, small cup and scroll, warm ironic smile, dialogue-ring VFX without readable text.
Palette: linen white #E9E0CA, skin bronze #B9855A, scroll tan #D1B276, hemlock green #6FAE5F, agora gold #E2B84D, question blue #57A6FF.
Animation identity: barefoot questioning idle, casual walk, nimble conversational shuffle run, compact hop, open-palm reflective block, shrugging victory.
Normals: Gadfly Jab: annoying open-finger poke, tiny blue question spark, poke starter; Elenchus Palm: open palm presses forward, gold-blue dialogue ring, stun pressure; Agora Trip: barefoot low sweep, dust and question spark, trick ender
Specials: B>A Elenchus Bolt: startup raises one questioning finger, active small blue-gold bolt shoots from fingertip, impact stun spark pops like a dialogue bubble without text, recovery finger lowers with smirk; B<A Question Reversal: startup leans in as if inviting an answer, active open palm mirror catches attack, impact reversal flash bends back toward opponent, recovery shrugs into stance; BvA Agora Trap: startup taps ground with bare foot, active small circular debate mark appears on floor, impact trap glows gold-blue and waits, recovery hands open in invitation; B<J Apology Backstep: startup steps back with cup/scroll close, active slips backward under a faint dialogue arc, impact afterimage shrugs in place, recovery settles calm and irritating
Appearance continuity: balding head, pug nose, short beard, simple white himation/tunic, bare feet or sandals, small cup and scroll, warm ironic smile, dialogue-ring VFX without readable text
Palette anchors: linen white #E9E0CA, skin bronze #B9855A, scroll tan #D1B276, hemlock green #6FAE5F, agora gold #E2B84D, question blue #57A6FF
Animation identity: barefoot questioning idle, casual walk, nimble conversational shuffle run, compact hop, open-palm reflective block, shrugging victory

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
Root remains centered in every cell. Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters unless the character is explicitly a duo-as-one silhouette, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
