---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 1
character_id: "anselm"
character_title: "Anselm of Canterbury"
prompt_id: "walk_forward_backward_4x4"
status: pending_render
output_image: "assets/sprites/roster/anselm/source/animation-v2/anselm_walk_forward_backward_4x4.png"
reference_images:
  - "assets/sprites/roster/anselm/source/anselm_core_4x4.png"
  - "assets/sprites/roster/anselm/source/anselm_extended_4x4.png"
source_character: "characters/anselm/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Anselm of Canterbury — `walk_forward_backward_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/anselm/source/animation-v2/anselm_walk_forward_backward_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/anselm/source/anselm_core_4x4.png`
- `assets/sprites/roster/anselm/source/anselm_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `walk_forward_v2` | `0, 1, 2, 3, 4, 5, 6, 7` | `loop` | 4 |
| `walk_backward_v2` | `8, 9, 10, 11, 12, 13, 14, 15` | `loop` | 5 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Anselm of Canterbury.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom.
Every cell must be the same size, perfectly aligned, with no gutters, no margins, no border, no labels, no text.
Use true alpha transparency. Keep the same character identity, costume, palette, scale, camera angle, lighting, and pixel density in all 16 cells.
Right-facing side-view fighter poses unless a frame explicitly says left-facing recovery. Keep the full body inside every cell.
Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Prioritize body pose clarity over large magical effects.

Anselm of Canterbury — The Ontological Proof; role: proof mage.
Biography: Medieval monk and philosopher of the Proslogion recast as a narrow proof-mage. His combat rhythm is premise, gesture, conclusion: quiet prayer-hand starts become unavoidable lines of manuscript light.
Appearance: narrow hooded monk face, intent eyes, brown robe, cord belt, illuminated manuscript talisman, prayer-hand posture, parchment seal glow.
Palette: monk brown #4B3325, robe shadow #2D1F19, parchment #DCC99B, manuscript red #A33A32, holy ivory #F8EDC6, logic blue #7FA9D8.
Animation identity: prayer-hand idle, restrained gliding walk, compact robe-ribbon run, seal-flash jump, crossed-hand proof shield.
Normals: Proslogion Pierce: two-finger or talisman thrust, tiny ivory-blue point, precise opener; Ontological Ray: hands open from prayer, thin ivory ray with red fleck, linear control; Credo Dive: descending prayer-hand strike, small seal burst, aerial ender
Specials: B>A Ontological Ray: startup talisman brightens, active narrow ivory-blue beam, impact glyph flecks no text, recovery hands close; B<A Greater-Than Counter: startup humble exposed stance, active proof seal unfolds, impact riposte pulse snaps, recovery robe settles; B^J Proslogion Rise: startup knees dip talisman up, active vertical manuscript seal lifts, impact rising shoulder ring, recovery hands close overhead; BvJ That-Than-Which Field: startup talisman near ground, active parchment ring expands, impact ivory-blue ticks pulse, recovery prayer at center
Appearance continuity: narrow hooded monk face, intent eyes, brown robe, cord belt, illuminated manuscript talisman, prayer-hand posture, parchment seal glow
Palette anchors: monk brown #4B3325, robe shadow #2D1F19, parchment #DCC99B, manuscript red #A33A32, holy ivory #F8EDC6, logic blue #7FA9D8
Animation identity: prayer-hand idle, restrained gliding walk, compact robe-ribbon run, seal-flash jump, crossed-hand proof shield

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
