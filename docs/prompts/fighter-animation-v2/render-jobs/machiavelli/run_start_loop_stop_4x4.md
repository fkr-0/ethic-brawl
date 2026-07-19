---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 1
character_id: "machiavelli"
character_title: "Niccolò Machiavelli"
prompt_id: "run_start_loop_stop_4x4"
status: pending_render
output_image: "assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_run_start_loop_stop_4x4.png"
reference_images: []
source_character: "characters/machiavelli/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Niccolò Machiavelli — `run_start_loop_stop_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_run_start_loop_stop_4x4.png`
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
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Niccolò Machiavelli.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom.
Every cell must be the same size, perfectly aligned, with no gutters, no margins, no border, no labels, no text.
Use true alpha transparency. Keep the same character identity, costume, palette, scale, camera angle, lighting, and pixel density in all 16 cells.
Right-facing side-view fighter poses unless a frame explicitly says left-facing recovery. Keep the full body inside every cell.
Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Prioritize body pose clarity over large magical effects.

Niccolò Machiavelli — The Strategist; role: feint assassin.
Biography: Florentine diplomat and author of The Prince recast as a courtly assassin of tactics. He treats combat as statecraft: a retreat is a lunge, a bow hides a blade, and a trap is simply policy made visible. His arc is observation, conspiracy, execution.
Appearance: slick dark hair, pointed beard, narrow calculating eyes, dark renaissance doublet, black cloak wedges, oxblood trim, gloves, hard boots, hidden dagger and parchment seal.
Palette: black #111014, cloak #07070A, oxblood #6E1720, steel #6F7880, parchment #D4B48C, trap magenta #FF00FF.
Animation identity: predatory stillness, stalking walk, sudden low burst run, compact tactical jump, cloak-curtain block.
Normals: Court Feint: false bow into hidden-hand poke, tiny oxblood slash, deceptive opener; Prince's Edict: diagonal cloak slash plus thrust, oxblood slash and steel glint, launcher pressure; Palace Coup: low-to-high cloak-banner strike, magenta crack, heavy launcher
Specials: B>A Prince's Gambit Lunge: startup false retreat cloak hides arm, active abrupt diagonal blade lunge, impact magenta exposed mark, recovery slides past line; B<A Court Intrigue Parry: startup smug exposed shoulder, active cloak curtain shield, impact dagger riposte from darkness, recovery cloak closes; BvA Coup Trap: startup kneeling gloved setup, active small magenta floor sigil, impact root spark arms, recovery withdraws without looking; B>J Opportunist Dash: startup low loaded boot, active black afterimage cross-up, impact reappears behind-angle, recovery cloak settles
Appearance continuity: slick dark hair, pointed beard, narrow calculating eyes, dark renaissance doublet, black cloak wedges, oxblood trim, gloves, hard boots, hidden dagger and parchment seal
Palette anchors: black #111014, cloak #07070A, oxblood #6E1720, steel #6F7880, parchment #D4B48C, trap magenta #FF00FF
Animation identity: predatory stillness, stalking walk, sudden low burst run, compact tactical jump, cloak-curtain block

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
