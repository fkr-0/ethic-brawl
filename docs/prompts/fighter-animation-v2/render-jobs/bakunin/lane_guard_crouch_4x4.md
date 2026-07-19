---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 1
character_id: "bakunin"
character_title: "Mikhail Bakunin"
prompt_id: "lane_guard_crouch_4x4"
status: pending_render
output_image: "assets/sprites/roster/bakunin/source/animation-v2/bakunin_lane_guard_crouch_4x4.png"
reference_images:
  - "assets/sprites/roster/bakunin/source/bakunin_core_4x4.png"
  - "assets/sprites/roster/bakunin/source/bakunin_extended_4x4.png"
source_character: "characters/bakunin/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Mikhail Bakunin — `lane_guard_crouch_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/bakunin/source/animation-v2/bakunin_lane_guard_crouch_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/bakunin/source/bakunin_core_4x4.png`
- `assets/sprites/roster/bakunin/source/bakunin_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `lane_away_v2` | `0, 1, 2, 3` | `once` | 3 |
| `lane_toward_v2` | `4, 5, 6, 7` | `once` | 3 |
| `crouch_v2` | `8, 9, 10, 11` | `once` | 4 |
| `guard_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Mikhail Bakunin.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom. Every cell must be same size, perfectly aligned, no gutters, no margins, no border, no labels, no text. Use true alpha transparency only. Keep the same character identity, costume, palette, scale, side-view camera, lighting, and pixel density in all 16 cells. Right-facing side-view fighter poses unless explicitly stated. Full body inside every cell. Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Compact VFX secondary to body pose clarity.

Mikhail Bakunin — The Black-Flag Firebrand; role: explosive rushdown; mechanic: bombs, firestorm, armor break.
Biography/combat fantasy: Anarchist revolutionary recast as explosive rushdown: wild beard, black flag, bombs, molotov trails, and reckless forward momentum. Bakunin breaks armor and authority by getting close before the opponent can organize.
Appearance: wild hair and beard, black revolutionary coat, red-black scarf, heavy boots, black flag strip, round bomb or molotov bottle, ember sparks and smoke.
Palette: coat black #141218, flag black #050507, anarch red #D21F2B, fire orange #FF7A1A, bomb iron #4B4F55, smoke gray #858078.
Animation identity: volatile bouncing idle, charging walk, explosive forward run, reckless leap, crossed bomb-arm block, black-flag victory shout.
Normals: Riot Jab: short brawling punch, red ember snap, rush opener; Authority Breaker: overhand coat-swing smash, orange armor-crack flash, guard pressure; Black-Flag Kick: forward boot kick with flag trail, smoke-orange hit spark, heavy ender
Specials: B>A Anarch Bomb: startup pulls a small round bomb from coat, active quick bomb toss with short fuse, impact contained orange blast puff, recovery leans into next rush; BvA Molotov Groundfire: startup crouches with bottle and flame, active slashes bottle low across floor, impact short orange fire strip ignites, recovery steps through smoke; B>J Insurrection Dash: startup front boot digs in, flag strip snaps back, active explosive forward dash shoulder-first, impact red-orange burst at leading foot, recovery skids still aggressive; BvJ No-Masters Firestorm: startup raises black flag and bomb spark, active vertical contained firestorm blooms around him, impact embers spiral without hiding body, recovery flag smoke collapses into stance
Appearance continuity: wild hair and beard, black revolutionary coat, red-black scarf, heavy boots, black flag strip, round bomb or molotov bottle, ember sparks and smoke
Palette anchors: coat black #141218, flag black #050507, anarch red #D21F2B, fire orange #FF7A1A, bomb iron #4B4F55, smoke gray #858078
Animation identity: volatile bouncing idle, charging walk, explosive forward run, reckless leap, crossed bomb-arm block, black-flag victory shout

Create EXACTLY one square RGBA sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, read left-to-right and top-to-bottom.
Use at least 1024x1024 pixels and dimensions divisible by four. No gutters, margins, borders, labels, captions, numbers, UI, or scenery.
True alpha transparency only. One full-body fighter in every cell. Orthographic side-view arcade camera. Stable ground baseline.
Keep character identity, face, costume, prop, palette, scale, lighting, outline weight, and pixel density identical in all cells.
Crisp deliberate pixel art with a limited palette and readable silhouette. Do not paint intermediate blur; each cell is a clean animation drawing.
Root-lock every grounded frame: keep the pelvis/root near the same cell coordinate. Show movement through stride, compression, weight transfer,
overlap, and counter-swing. Do not move the character progressively across the sheet. The game engine supplies screen translation.
Keep feet inside the cell, keep effects compact, and never connect marks across cell boundaries.

SHEET: 2.5D LANE SHIFTS, CROUCH TRANSITION, AND GUARD TRANSITION.

Frames 1-4, sidestep away from camera into the rear lane: load, diagonal push, crossing/passing step, planted recovery.
Frames 5-8, sidestep toward camera into the front lane: load, diagonal push, crossing/passing step, planted recovery.
Keep the side-view fighting silhouette; suggest depth through foreshortened feet, shoulder overlap, and small scale cues, not a camera turn.

Frames 9-12, crouch transition: standing guard, descent, stable crouch, rise toward standing. Keep the head protected and feet planted.
Frames 13-16, guard transition: neutral guard, guard raise, firm held block, controlled guard release toward neutral.

Defensive poses must remain character-specific. No shield unless the character owns one. No perspective background or floor grid.
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters unless the character is explicitly a duo-as-one silhouette, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
