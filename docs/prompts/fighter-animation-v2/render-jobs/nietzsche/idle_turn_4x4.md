---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 1
character_id: "nietzsche"
character_title: "Friedrich Nietzsche"
prompt_id: "idle_turn_4x4"
status: pending_render
output_image: "assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_idle_turn_4x4.png"
reference_images:
  - "assets/sprites/roster/nietzsche/source/nietzsche_core_4x4.png"
source_character: "characters/nietzsche/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Friedrich Nietzsche — `idle_turn_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_idle_turn_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/nietzsche/source/nietzsche_core_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `idle_v2` | `0, 1, 2, 3, 4, 5, 6, 7` | `loop` | 7 |
| `turn_left_v2` | `8, 9, 10, 11` | `once` | 3 |
| `turn_right_v2` | `12, 13, 14, 15` | `once` | 3 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Friedrich Nietzsche.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom.
Every cell must be the same size, perfectly aligned, with no gutters, no margins, no border, no labels, no text.
Use true alpha transparency. Keep the same character identity, costume, palette, scale, camera angle, lighting, and pixel density in all 16 cells.
Right-facing side-view fighter poses unless a frame explicitly says left-facing recovery. Keep the full body inside every cell.
Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Prioritize body pose clarity over large magical effects.

Friedrich Nietzsche — The Abyssal Bruiser; role: high-risk bruiser.
Biography: German philosopher of critique, aphorism, eternal recurrence, the abyss, self-overcoming, and will to power recast as a stormy hammer bruiser. He fights as dangerous becoming: risk first, proof after impact.
Appearance: wild unmistakable moustache, intense eyes, swept hair, dark nineteenth-century coat, high collar, boots, compact philosopher hammer, storm-lit edges.
Palette: dark coat #1B1A20, moustache #4A2B19, hammer steel #80858A, abyss violet #3B235A, storm gold #F0C13B, fire orange #D85A24.
Animation identity: coiled hammer idle, swaggering walk, reckless forward run, aggressive hammer jump, abyss-ring block, dramatic but defiant hurt.
Normals: Hammer Aphorism: short low hammer snap, tiny gold crack, fast bruiser opener; Eternal Return Counter: torso curls around hammer, violet abyss loop, risky counter beat; Overman Rush: reckless shoulder-hammer drive, gold lightning and orange sparks, committal heavy rush
Specials: B>A Hammer Aphorism: startup hammer drawn back low, active forward smash sends ground crack, impact storm-gold crack orange edge, recovery hammer rebounds; B<A Eternal Return Counter: startup leans into danger, active violet abyss ring around hammer, impact ring snaps outward, recovery defiant twist; B>J Overman Rush: startup boots dig in coat lifts, active storm-lit hammer dash, impact gold lightning at shoulder, recovery skids exposed; BvJ Will-to-Power Storm: startup raises hammer abyss opens, active contained fire-lightning column, impact jagged arcs within cell, recovery storm collapses
Appearance continuity: wild unmistakable moustache, intense eyes, swept hair, dark nineteenth-century coat, high collar, boots, compact philosopher hammer, storm-lit edges
Palette anchors: dark coat #1B1A20, moustache #4A2B19, hammer steel #80858A, abyss violet #3B235A, storm gold #F0C13B, fire orange #D85A24
Animation identity: coiled hammer idle, swaggering walk, reckless forward run, aggressive hammer jump, abyss-ring block, dramatic but defiant hurt

Create EXACTLY one square RGBA sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, read left-to-right and top-to-bottom.
Use at least 1024x1024 pixels and dimensions divisible by four. No gutters, margins, borders, labels, captions, numbers, UI, or scenery.
True alpha transparency only. One full-body fighter in every cell. Orthographic side-view arcade camera. Stable ground baseline.
Keep character identity, face, costume, prop, palette, scale, lighting, outline weight, and pixel density identical in all cells.
Crisp deliberate pixel art with a limited palette and readable silhouette. Do not paint intermediate blur; each cell is a clean animation drawing.
Root-lock every grounded frame: keep the pelvis/root near the same cell coordinate. Show movement through stride, compression, weight transfer,
overlap, and counter-swing. Do not move the character progressively across the sheet. The game engine supplies screen translation.
Keep feet inside the cell, keep effects compact, and never connect marks across cell boundaries.

SHEET: FINE IDLE AND TURN CYCLE.
Frames 1-8 are one seamless right-facing idle loop:
1 neutral contact pose and inhale start;
2 chest/shoulders expand subtly, cloth and hair lag by one beat;
3 weight moves toward the front foot, hands remain combat-ready;
4 lowest settling pose, knees compress slightly;
5 exhale and smallest upward recovery;
6 weight moves toward the rear foot, head counterbalances;
7 micro-adjustment of guard, prop, coat, robe, or hair according to character identity;
8 loop bridge, almost frame 1 but with enough follow-through that 8-to-1 is fluid.

Frames 9-12 are a controlled right-to-left turn in place:
9 anticipate by loading the near foot;
10 narrow mid-turn silhouette, shoulders and hips crossing at different times;
11 plant facing left, trailing cloth/hair/prop catches up;
12 settle into the same idle guard while facing left.

Frames 13-16 return left-to-right:
13 load the opposite foot;
14 narrow mid-turn silhouette;
15 plant facing right;
16 settle into the frame-1 stance.

Motion must be subtle and readable, never comedic bouncing. The character must not translate across the cells.
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
