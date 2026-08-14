---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "aquinas"
character_title: "Thomas Aquinas"
prompt_id: "walk_forward_backward_4x4"
job_id: "aquinas__walk_forward_backward_4x4"
status: rendered_unreviewed
output_image: "assets/sprites/roster/aquinas/source/animation-v2/aquinas_walk_forward_backward_4x4.png"
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

# Thomas Aquinas — `walk_forward_backward_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/aquinas/source/animation-v2/aquinas_walk_forward_backward_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `rendered_unreviewed`

## Suggested reference images

- `assets/sprites/roster/aquinas/source/aquinas_core_4x4.png`
- `assets/sprites/roster/aquinas/source/aquinas_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `walk_forward_v2` | `0, 1, 2, 3, 4, 5, 6, 7` | `loop` | 4 |
| `walk_backward_v2` | `8, 9, 10, 11, 12, 13, 14, 15` | `loop` | 5 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Thomas Aquinas.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom.
Every cell must be the same size, perfectly aligned, with no gutters, no margins, no border, no labels, no text.
Use true alpha transparency. Keep the same character identity, costume, palette, scale, camera angle, lighting, and pixel density in all 16 cells.
Right-facing side-view fighter poses unless a frame explicitly says left-facing recovery. Keep the full body inside every cell.
Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Prioritize body pose clarity over large magical effects.

Thomas Aquinas — The Angelic Doctor; role: holy tank.
Biography: Medieval scholastic theologian and philosopher recast as a cathedral made mobile. He absorbs objections as pressure, answers with radiant proofs, and turns the floor beneath him into consecrated ground.
Appearance: broad monk face under Dominican hood, black-and-white habit, rope belt, chained codex, heavy grounded frame, serene immovable expression.
Palette: habit black #17171A, habit white #F1EFE4, cloth shadow #BAB7A8, codex brown #6B4E2E, divine gold #F3D36B, ivory #FFF4C8.
Animation identity: deep cloth-settling breath, heavy walk, unstoppable slow run, short heavy jump, codex shield block.
Normals: Summa Strike: planted forearm/codex shove, ivory impact square, armored light bash; Scholastic Hammer: codex gavel overhead, gold page flash, medium punish; Cathedral Charge: shoulder and codex rush, stone dust and gold edge, heavy knockback
Specials: B>A Five Ways Ray: startup opens codex five sparks align, active five chunky gold rays fan forward, impact narrow rays reveal body, recovery codex half-closes; B<A Scholastic Shield: startup codex lifted vertically, active ivory-gold shield wall, impact square cathedral tiles absorb, recovery aura contracts; BvA Basilica Consecration: startup lowers codex to ground, active gold basilica sigil appears, impact floor pulse expands, recovery rises slowly; BvJ Prime Cause Field: startup codex raised both hands, active contained cathedral aura, impact gold rings stabilize, recovery immovable stance
Appearance continuity: broad monk face under Dominican hood, black-and-white habit, rope belt, chained codex, heavy grounded frame, serene immovable expression
Palette anchors: habit black #17171A, habit white #F1EFE4, cloth shadow #BAB7A8, codex brown #6B4E2E, divine gold #F3D36B, ivory #FFF4C8
Animation identity: deep cloth-settling breath, heavy walk, unstoppable slow run, short heavy jump, codex shield block

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

SHEET: EIGHT-FRAME FORWARD WALK AND EIGHT-FRAME BACKWARD WALK. Character faces right in all cells.

Frames 1-8, advancing walk loop:
1 right heel contact and left toe push;
2 weight accepts onto right leg, body at lowest point;
3 left leg passes under pelvis, arms counter-swing;
4 right leg supports, body at highest point;
5 left heel contact and right toe push;
6 weight accepts onto left leg, body at lowest point;
7 right leg passes under pelvis, opposite arm counter-swing;
8 left leg supports, body at highest point and loops cleanly to frame 1.

Frames 9-16, guarded backward walk while still facing right:
9 rear or left toe reaches back cautiously, guard tightens;
10 weight shifts onto rear leg, torso remains toward the opponent;
11 front foot passes back beneath pelvis, shoulders counter-rotate less than the forward walk;
12 rear leg supports, body rises slightly;
13 front toe reaches back;
14 weight shifts onto front leg without turning away;
15 rear foot passes beneath pelvis;
16 front leg supports and loops cleanly to frame 9.

Forward and backward cycles must be distinct. The retreat is shorter, guarded, and never a mirrored advance.
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, equations, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing permanent prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, giant projectiles, detached limbs, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
