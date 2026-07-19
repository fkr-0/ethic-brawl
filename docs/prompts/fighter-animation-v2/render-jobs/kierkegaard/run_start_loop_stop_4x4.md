---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 1
character_id: "kierkegaard"
character_title: "Søren Kierkegaard"
prompt_id: "run_start_loop_stop_4x4"
status: pending_render
output_image: "assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_run_start_loop_stop_4x4.png"
reference_images:
  - "assets/sprites/roster/kierkegaard/source/kierkegaard_core_4x4.png"
source_character: "characters/kierkegaard/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Søren Kierkegaard — `run_start_loop_stop_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_run_start_loop_stop_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/kierkegaard/source/kierkegaard_core_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `run_start_v2` | `0, 1, 2, 3` | `once` | 3 |
| `run_v2` | `4, 5, 6, 7, 8, 9, 10, 11` | `loop` | 3 |
| `run_stop_v2` | `12, 13, 14, 15` | `once` | 4 |

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

SHEET: RUN ACCELERATION, EIGHT-FRAME RUN LOOP, AND BRAKING. Character faces right throughout.

Frames 1-4, acceleration from idle:
1 anticipation, hips lower and torso loads slightly forward;
2 rear foot drives, first committed push-off;
3 first long step, arms begin stronger counter-swing;
4 reaches the same rhythm and body height as run-loop frame 5.

Frames 5-12, seamless eight-frame run loop:
5 right foot contact, left leg extended behind;
6 compression/weight acceptance, lowest body point;
7 left leg passes quickly under pelvis;
8 airborne or light-support phase, highest body point;
9 left foot contact, right leg extended behind;
10 compression/weight acceptance;
11 right leg passes quickly under pelvis;
12 airborne or light-support phase that loops cleanly to frame 5.

Frames 13-16, braking to idle:
13 long braking contact ahead of the body;
14 deep compression, torso counter-leans without losing balance;
15 rebound and short corrective step;
16 restored combat idle matching the approved idle sheet.

Preserve character-specific run personality, but keep the biomechanics legible. No root translation and no speed-line background.
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters unless the character is explicitly a duo-as-one silhouette, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
