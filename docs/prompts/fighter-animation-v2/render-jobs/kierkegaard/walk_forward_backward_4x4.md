---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 1
character_id: "kierkegaard"
character_title: "Søren Kierkegaard"
prompt_id: "walk_forward_backward_4x4"
status: pending_render
output_image: "assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_walk_forward_backward_4x4.png"
reference_images:
  - "assets/sprites/roster/kierkegaard/source/kierkegaard_core_4x4.png"
source_character: "characters/kierkegaard/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Søren Kierkegaard — `walk_forward_backward_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_walk_forward_backward_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/kierkegaard/source/kierkegaard_core_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `walk_forward_v2` | `0, 1, 2, 3, 4, 5, 6, 7` | `loop` | 4 |
| `walk_backward_v2` | `8, 9, 10, 11, 12, 13, 14, 15` | `loop` | 5 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Søren Kierkegaard.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom. Every cell must be same size, perfectly aligned, no gutters, no margins, no border, no labels, no text. Use true alpha transparency only. Keep the same character identity, costume, palette, scale, side-view camera, lighting, and pixel density in all 16 cells. Right-facing side-view fighter poses unless explicitly stated. Full body inside every cell. Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Compact VFX secondary to body pose clarity.

Søren Kierkegaard — The Knight of Faith; role: risk / leap specialist; mechanic: anxiety pools, faith leaps.
Biography/combat fantasy: Danish existential writer recast as a risk/leap specialist. Kierkegaard weaponizes anxiety, irony, and the impossible leap: hesitant in posture, sudden in commitment, fragile unless faith carries him through.
Appearance: melancholy dandy silhouette, swept hair, long dark coat, high collar, narrow trousers, walking cane or small book, ink-blue anxiety pools and white-gold faith sparks.
Palette: copenhagen black #171820, coat blue #202A44, paper cream #E5D8BA, anxiety ink #263B8F, faith gold #F3D66B, irony pink #C85C9E.
Animation identity: nervous fidget idle, hesitant walk, sudden leap-run, dramatic airborne faith arc, cane/book guarded block, relieved hand-to-heart victory.
Normals: Irony Jab: small hesitant cane poke that commits late, pink irony tick, tricky opener; Anxiety Cut: quick diagonal coat-and-cane slash, ink-blue smear, risk pressure; Faith Heel: sudden committed leap kick, gold spark at foot, leap ender
Specials: B>A Leap-of-Faith Strike: startup hesitates with cane/book close, active sudden forward faith-lit strike, impact gold spark at committed impact, recovery lands fragile but resolved; B^A Either/Or Upper: startup two ghosted choices split around him, active chooses upward cane/book uppercut, impact blue-pink fork collapses into hit, recovery recovers with hand to chest; B>J Faith Dash: startup low anxious crouch, active white-gold dash leap forward, impact body crosses a small abyss gap inside cell, recovery lands in resolved stance; BvJ Knight of Faith: startup anxiety pool forms under shoes, active gold light rises through dark pool, impact protective faith aura stabilizes body, recovery aura fades to trembling calm
Appearance continuity: melancholy dandy silhouette, swept hair, long dark coat, high collar, narrow trousers, walking cane or small book, ink-blue anxiety pools and white-gold faith sparks
Palette anchors: copenhagen black #171820, coat blue #202A44, paper cream #E5D8BA, anxiety ink #263B8F, faith gold #F3D66B, irony pink #C85C9E
Animation identity: nervous fidget idle, hesitant walk, sudden leap-run, dramatic airborne faith arc, cane/book guarded block, relieved hand-to-heart victory

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
