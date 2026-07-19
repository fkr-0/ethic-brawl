---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 1
character_id: "stirner"
character_title: "Max Stirner"
prompt_id: "run_start_loop_stop_4x4"
status: pending_render
output_image: "assets/sprites/roster/stirner/source/animation-v2/stirner_run_start_loop_stop_4x4.png"
reference_images:
  - "assets/sprites/roster/stirner/source/stirner_core_4x4.png"
source_character: "characters/stirner/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Max Stirner — `run_start_loop_stop_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/stirner/source/animation-v2/stirner_run_start_loop_stop_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/stirner/source/stirner_core_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `run_start_v2` | `0, 1, 2, 3` | `once` | 3 |
| `run_v2` | `4, 5, 6, 7, 8, 9, 10, 11` | `loop` | 3 |
| `run_stop_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Max Stirner.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom. Every cell must be same size, perfectly aligned, no gutters, no margins, no border, no labels, no text. Use true alpha transparency only. Keep the same character identity, costume, palette, scale, side-view camera, lighting, and pixel density in all 16 cells. Right-facing side-view fighter poses unless explicitly stated. Full body inside every cell. Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Compact VFX secondary to body pose clarity.

Max Stirner — The Unique; role: egoist trickster; mechanic: unique/ridiculous moves that break design rules.
Biography/combat fantasy: Egoist provocateur recast as a rule-breaking trickster. Stirner attacks concepts as “spooks,” steals pose language from other fighters for a frame, and treats the arena like property to be appropriated.
Appearance: sharp mischievous face, high forehead, unruly dark hair, small glasses or glinting eyes, dark shabby academic coat, mismatched gloves, torn manifesto scraps, chalk outlines and absurd little prop switches.
Palette: ego black #101014, paper yellow #D8C171, chalk white #EDE6D0, spook violet #8C4DFF, absurd lime #A6FF3D, trick red #D94A4A.
Animation identity: fidgety self-owned idle, lopsided walk, sudden zigzag run, ridiculous but readable jump, shrugging anti-guard block, mocking victory pose.
Normals: Unique Jab: odd off-angle jab from too-relaxed stance, lime chalk tick, awkward opener; Spook Slap: backhand through a ghostly concept outline, violet pop, anti-guard pressure; Ownness Kick: self-satisfied sideways kick, red-lime spark, trick ender
Specials: B>A Egoist Appropriation: startup reaches as if taking ownership of space, active snatches a small lime-violet arc forward, impact target space gets a chalk ownership bracket with no text, recovery pockets the stolen arc; B<A Spook Reversal: startup points at an imaginary authority, active violet spook mask appears as counter guard, impact mask bursts backward into riposte, recovery shrugs as if nothing happened; B>J Ownness Dash: startup leans the wrong way first, active zigzag dash violates normal anticipation, impact afterimage briefly mocks another stance, recovery lands with smug off-balance pose; BvJ Union of Egoists Domain: startup drops torn paper scraps around feet, active absurd lime/violet domain forms from mismatched shapes, impact tiny autonomous scraps orbit as temporary allies, recovery domain folds into coat pocket
Appearance continuity: sharp mischievous face, high forehead, unruly dark hair, small glasses or glinting eyes, dark shabby academic coat, mismatched gloves, torn manifesto scraps, chalk outlines and absurd little prop switches
Palette anchors: ego black #101014, paper yellow #D8C171, chalk white #EDE6D0, spook violet #8C4DFF, absurd lime #A6FF3D, trick red #D94A4A
Animation identity: fidgety self-owned idle, lopsided walk, sudden zigzag run, ridiculous but readable jump, shrugging anti-guard block, mocking victory pose

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
