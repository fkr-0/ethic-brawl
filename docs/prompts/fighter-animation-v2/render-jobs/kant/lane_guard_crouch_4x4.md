---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 1
character_id: "kant"
character_title: "Immanuel Kant"
prompt_id: "lane_guard_crouch_4x4"
status: pending_render
output_image: "assets/sprites/roster/kant/source/animation-v2/kant_lane_guard_crouch_4x4.png"
reference_images:
  - "assets/sprites/roster/kant/source/kant_core_4x4.png"
  - "assets/sprites/roster/kant/source/kant_extended_4x4.png"
source_character: "characters/kant/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Immanuel Kant — `lane_guard_crouch_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/kant/source/animation-v2/kant_lane_guard_crouch_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/kant/source/kant_core_4x4.png`
- `assets/sprites/roster/kant/source/kant_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `lane_away_v2` | `0, 1, 2, 3` | `once` | 3 |
| `lane_toward_v2` | `4, 5, 6, 7` | `once` | 3 |
| `crouch_v2` | `8, 9, 10, 11` | `once` | 4 |
| `guard_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Immanuel Kant.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom. Every cell must be same size, perfectly aligned, no gutters, no margins, no border, no labels, no text. Use true alpha transparency only. Keep the same character identity, costume, palette, scale, side-view camera, lighting, and pixel density in all 16 cells. Right-facing side-view fighter poses unless explicitly stated. Full body inside every cell. Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Compact VFX secondary to body pose clarity.

Immanuel Kant — The Categorical Lawgiver; role: lawful control mage; mechanic: beams, constraints, reflective duty.
Biography/combat fantasy: Prussian critical philosopher recast as a lawful control mage. Kant constrains motion with duty sigils, reflects phenomena at the noumenal boundary, and fires universal law as clean geometric beams.
Appearance: small precise professor silhouette, powdered wig or tied white hair, dark Prussian coat, waistcoat, cane or book, starry-heavens lining and law-sigil geometry.
Palette: prussian navy #17223B, wig white #E7E4DA, waistcoat gray #8A8F99, duty gold #DAB85C, noumenal violet #6E5BFF, law blue #4FA3FF.
Animation identity: clockwork idle, tiny exact walk, stiff controlled run, small precise jump, reflective book/cane block, starry-heavens victory glance.
Normals: Maxim Jab: small exact cane poke, blue law tick, precise opener; Duty Palm: rigid palm/book push, gold constraint bracket, control pressure; Sublime Kick: stiff upward kick with coat flare, violet star spark, anti-air ender
Specials: B>A Universal Law Beam: startup cane/book aligns with perfect posture, active straight law-blue beam fires forward, impact gold duty brackets frame beam, recovery returns to clockwork stance; B<A Noumenal Reflect: startup book closes over chest, active violet reflective plane appears, impact incoming force bends off invisible boundary, recovery plane folds into book; BvA Duty Sigil: startup sets cane tip to floor, active gold duty sigil appears under target lane, impact constraint lines lock low space, recovery cane lifts precisely; BvJ Kingdom of Ends: startup raises book toward starry lining, active blue-gold moral geometry field expands, impact starry duty nodes orbit once, recovery field resolves into calm stance
Appearance continuity: small precise professor silhouette, powdered wig or tied white hair, dark Prussian coat, waistcoat, cane or book, starry-heavens lining and law-sigil geometry
Palette anchors: prussian navy #17223B, wig white #E7E4DA, waistcoat gray #8A8F99, duty gold #DAB85C, noumenal violet #6E5BFF, law blue #4FA3FF
Animation identity: clockwork idle, tiny exact walk, stiff controlled run, small precise jump, reflective book/cane block, starry-heavens victory glance

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
