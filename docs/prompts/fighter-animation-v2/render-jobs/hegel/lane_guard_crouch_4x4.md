---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 1
character_id: "hegel"
character_title: "G.W.F. Hegel"
prompt_id: "lane_guard_crouch_4x4"
status: pending_render
output_image: "assets/sprites/roster/hegel/source/animation-v2/hegel_lane_guard_crouch_4x4.png"
reference_images:
  - "assets/sprites/roster/hegel/source/hegel_core_4x4.png"
  - "assets/sprites/roster/hegel/source/hegel_extended_4x4.png"
source_character: "characters/hegel/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# G.W.F. Hegel — `lane_guard_crouch_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/hegel/source/animation-v2/hegel_lane_guard_crouch_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/hegel/source/hegel_core_4x4.png`
- `assets/sprites/roster/hegel/source/hegel_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `lane_away_v2` | `0, 1, 2, 3` | `once` | 3 |
| `lane_toward_v2` | `4, 5, 6, 7` | `once` | 3 |
| `crouch_v2` | `8, 9, 10, 11` | `once` | 4 |
| `guard_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: G.W.F. Hegel.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom.
Every cell must be the same size, perfectly aligned, with no gutters, no margins, no border, no labels, no text.
Use true alpha transparency. Keep the same character identity, costume, palette, scale, camera angle, lighting, and pixel density in all 16 cells.
Right-facing side-view fighter poses unless a frame explicitly says left-facing recovery. Keep the full body inside every cell.
Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Prioritize body pose clarity over large magical effects.

G.W.F. Hegel — The Dialectician; role: evolving combo engine.
Biography: German idealist of dialectic, history, contradiction, and Geist recast as a three-beat combo professor. One motion asserts, the next negates, the third resolves into synthesis.
Appearance: stern professor face, heavy brow, dark academic coat, warm waistcoat, cravat, book-and-cane hybrid weapon, formal shoes.
Palette: academic coat #2A2625, shadow #141212, waistcoat #6B4A35, book ivory #D8C7A1, dialectic blue #4F7DB5, synthesis gold #E0B84D.
Animation identity: three-beat torso sway, deliberate lecturing walk, accelerating argumentative march, heavy professor leap, book-and-cane contradiction block.
Normals: Thesis Tap: short cane assertion, blue thesis spark, starter; Antithesis Break: cross-body cane/book strike, blue-gold crossing slash, advancing pressure; Synthesis Crown: cane rises book opens, small crown flash, launcher ender
Specials: B>A Thesis Bolt: startup book opens to blue point, active cane releases compact bolt, impact simple moving node, recovery book half-closes; B<A Antithesis Reversal: startup book raised cane back, active blue counter pulse crosses body, impact gold flash snaps outward, recovery twist resolves; B>J Synthesis Dash: startup three motes align at feet, active dash in three beats, impact third beat gold hit, recovery cane planted; BvJ World-Spirit Domain: startup book opens both hands, active blue-gold spiral field, impact three linked nodes orbit, recovery crown glint fades
Appearance continuity: stern professor face, heavy brow, dark academic coat, warm waistcoat, cravat, book-and-cane hybrid weapon, formal shoes
Palette anchors: academic coat #2A2625, shadow #141212, waistcoat #6B4A35, book ivory #D8C7A1, dialectic blue #4F7DB5, synthesis gold #E0B84D
Animation identity: three-beat torso sway, deliberate lecturing walk, accelerating argumentative march, heavy professor leap, book-and-cane contradiction block

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
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
