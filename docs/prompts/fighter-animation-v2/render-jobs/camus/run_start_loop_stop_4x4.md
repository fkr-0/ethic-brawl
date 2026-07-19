---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 1
character_id: "camus"
character_title: "Albert Camus"
prompt_id: "run_start_loop_stop_4x4"
status: pending_render
output_image: "assets/sprites/roster/camus/source/animation-v2/camus_run_start_loop_stop_4x4.png"
reference_images: []
source_character: "characters/camus/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Albert Camus — `run_start_loop_stop_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/camus/source/animation-v2/camus_run_start_loop_stop_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Review state: `pending_render`

## Suggested reference images

- No approved source sheet was found automatically; provide the closest approved character reference manually.

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `run_start_v2` | `0, 1, 2, 3` | `once` | 3 |
| `run_v2` | `4, 5, 6, 7, 8, 9, 10, 11` | `loop` | 3 |
| `run_stop_v2` | `12, 13, 14, 15` | `once` | 4 |

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
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
