---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 1
character_id: "foucault"
character_title: "Michel Foucault"
prompt_id: "lane_guard_crouch_4x4"
status: pending_render
output_image: "assets/sprites/roster/foucault/source/animation-v2/foucault_lane_guard_crouch_4x4.png"
reference_images:
  - "assets/sprites/roster/foucault/source/foucault_core_4x4.png"
source_character: "characters/foucault/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Michel Foucault — `lane_guard_crouch_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/foucault/source/animation-v2/foucault_lane_guard_crouch_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/foucault/source/foucault_core_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `lane_away_v2` | `0, 1, 2, 3` | `once` | 3 |
| `lane_toward_v2` | `4, 5, 6, 7` | `once` | 3 |
| `crouch_v2` | `8, 9, 10, 11` | `once` | 4 |
| `guard_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Michel Foucault.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom. Every cell must be same size, perfectly aligned, no gutters, no margins, no border, no labels, no text. Use true alpha transparency only. Keep the same character identity, costume, palette, scale, side-view camera, lighting, and pixel density in all 16 cells. Right-facing side-view fighter poses unless explicitly stated. Full body inside every cell. Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Compact VFX secondary to body pose clarity.

Michel Foucault — The Panopticon Archivist; role: control zoner; mechanic: beams, grids, reveal/silence.
Biography/combat fantasy: Historian of power, discipline, clinics, prisons, sexuality, and discourse recast as a control zoner who turns the arena into an archive of visible bodies. He does not overpower opponents; he frames them, reveals them, silences their options, and lets the grid do the punishment.
Appearance: bald head, round glasses, severe eyes, black turtleneck and long academic coat, narrow trousers, gloved or ink-stained hands, file-folder or archive cards, thin surveillance grid VFX.
Palette: black coat #101114, clinic white #DDE6E8, archive paper #C9B88A, panopticon teal #39C5BB, surveillance blue #4A7DFF, warning red #C23B3B.
Animation identity: still analytical idle, clipped institutional walk, sliding grid-step run, compact vertical jump, forearm-plus-grid block, cold reveal gesture victory.
Normals: Disciplinary Tap: short baton-like finger or folder jab, tiny teal grid tick, fast spacing poke; Archive Hook: hooking forearm with file-card fan, paper-teal crescent, mid pressure; Clinic Sweep: low precise kick through floor grid, blue-white diagnostic spark, control ender
Specials: B>A Discipline Beam: startup lens/glasses catch a teal light, active thin horizontal blue-teal beam fires from pointing hand, impact target framed by small grid brackets, recovery hand lowers as beam line fades; BvA Prison Grid Field: startup steps down and stamps an archive card, active floor grid rises as square prison bars, impact short boxed field locks space without covering body, recovery grid retracts to the floor; B<J Discourse Escape: startup coat folds inward like a file closing, active backstep slide through a broken sentence-like line with no readable text, impact afterimage becomes a torn archive silhouette, recovery reappears calm and angled away; BvJ Biopower Zone: startup raises both hands as measuring marks appear, active large transparent clinic grid forms around feet, impact pulse reveals bodies with teal brackets and red warning ticks, recovery stands at center of fading institution grid
Appearance continuity: bald head, round glasses, severe eyes, black turtleneck and long academic coat, narrow trousers, gloved or ink-stained hands, file-folder or archive cards, thin surveillance grid VFX
Palette anchors: black coat #101114, clinic white #DDE6E8, archive paper #C9B88A, panopticon teal #39C5BB, surveillance blue #4A7DFF, warning red #C23B3B
Animation identity: still analytical idle, clipped institutional walk, sliding grid-step run, compact vertical jump, forearm-plus-grid block, cold reveal gesture victory

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
