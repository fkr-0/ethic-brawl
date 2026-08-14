---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "aristotle"
character_title: "Aristotle"
prompt_id: "guard_parry_break_4x4"
job_id: "aristotle__guard_parry_break_4x4"
status: pending_render
output_image: "assets/sprites/roster/aristotle/source/animation-v2/aristotle_advanced_guard_4x4.png"
frames: 16
grid:
  columns: 4
  rows: 4
cell_size: [256, 256]
output_size: [1024, 1024]
reference_images:
  - "assets/sprites/roster/aristotle/source/aristotle_core_4x4.png"
  - "assets/sprites/roster/aristotle/source/aristotle_extended_4x4.png"
source_character: "characters/aristotle/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Aristotle — `guard_parry_break_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/aristotle/source/animation-v2/aristotle_advanced_guard_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/aristotle/source/aristotle_core_4x4.png`
- `assets/sprites/roster/aristotle/source/aristotle_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `guard_hold_v2` | `0, 1, 2, 3` | `loop` | 5 |
| `parry_v2` | `4, 5, 6, 7` | `once` | 3 |
| `guard_break_v2` | `8, 9, 10, 11` | `once` | 4 |
| `counter_v2` | `12, 13, 14, 15` | `once` | 3 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Aristotle.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom.
Every cell must be the same size, perfectly aligned, with no gutters, no margins, no border, no labels, no text.
Use true alpha transparency. Keep the same character identity, costume, palette, scale, camera angle, lighting, and pixel density in all 16 cells.
Right-facing side-view fighter poses unless a frame explicitly says left-facing recovery. Keep the full body inside every cell.
Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Prioritize body pose clarity over large magical effects.

Aristotle — The Peripatetic; role: balanced adaptive fighter.
Biography: Greek system-builder of logic, ethics, rhetoric, and classification recast as the grounded all-rounder. Every strike has a cause, every guard has a category, and every field seeks the golden mean between offense and defense.
Appearance: short curled beard, calm teacher expression, white robe/chiton with bronze trim, leather scroll strap, short staff, parchment scroll, simple sandals.
Palette: robe #EEE8D8, robe shadow #CFC7B2, bronze #B8873A, scroll #C9A96A, lyceum gold #F0C04A, logic blue #5F8FBF.
Animation identity: teacherly staff-rest idle, calm procession walk, deliberate forceful run, disciplined compact hop, staff category-guard.
Normals: Golden Mean Jab: short centered staff jab, gold dot at staff tip, safe opener; Syllogism Lance: phalanx-like staff drive, bronze triangle line, mid-range punish; Prime Mover Drop: overhead falling staff strike, gold ring crack, heavy anti-air ender
Specials: B>A Golden Mean Palm: startup staff draws centerline, active palm and staff strike together, impact two gold impacts, recovery exact centered recovery; B<A Teleology Counter: startup staff crosses chest, active bronze category bracket guard, impact pushback logic pulse, recovery staff vertical rest; B^A Prime Mover Lift: startup knees dip staff down, active upward staff lift, impact gold ring lifts from floor, recovery overhead follow-through; BvJ Virtue Balance Field: startup plants staff opens scroll hand, active gold circle and triangle form, impact symmetrical rings pulse, recovery stands centered
Appearance continuity: short curled beard, calm teacher expression, white robe/chiton with bronze trim, leather scroll strap, short staff, parchment scroll, simple sandals
Palette anchors: robe #EEE8D8, robe shadow #CFC7B2, bronze #B8873A, scroll #C9A96A, lyceum gold #F0C04A, logic blue #5F8FBF
Animation identity: teacherly staff-rest idle, calm procession walk, deliberate forceful run, disciplined compact hop, staff category-guard

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

SHEET: HELD DEFENSE, PERFECT BLOCK OR PARRY, GUARD BREAK, AND COUNTER EXIT.
Row 1, frames 1-4: held guard loop — settle into block, absorb pressure, small recoil, loop bridge. Feet remain planted.
Row 2, frames 5-8: perfect block or parry — bait, exact interception, compact contact flash, immediate balanced recovery.
Row 3, frames 9-12: guard break or exhausted defense — pressure lands, arms open, torso staggers, vulnerable recovery.
Row 4, frames 13-16: character-specific counter exit — defensive load, counter startup, clear counter contact pose, return to guard.

Defensive silhouettes must differ clearly from hitstun and knockdown. No generic shield unless owned by the character.
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, equations, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing permanent prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, giant projectiles, detached limbs, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
