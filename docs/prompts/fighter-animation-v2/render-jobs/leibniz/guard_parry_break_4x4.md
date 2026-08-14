---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "leibniz"
character_title: "Gottfried Wilhelm Leibniz"
prompt_id: "guard_parry_break_4x4"
job_id: "leibniz__guard_parry_break_4x4"
status: pending_render
output_image: "assets/sprites/roster/leibniz/source/animation-v2/leibniz_advanced_guard_4x4.png"
frames: 16
grid:
  columns: 4
  rows: 4
cell_size: [256, 256]
output_size: [1024, 1024]
reference_images:
  - "assets/sprites/roster/leibniz/source/leibniz_core_4x4.png"
  - "assets/sprites/roster/leibniz/source/leibniz_extended_4x4.png"
source_character: "characters/leibniz/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Gottfried Wilhelm Leibniz — `guard_parry_break_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/leibniz/source/animation-v2/leibniz_advanced_guard_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/leibniz/source/leibniz_core_4x4.png`
- `assets/sprites/roster/leibniz/source/leibniz_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `guard_hold_v2` | `0, 1, 2, 3` | `loop` | 5 |
| `parry_v2` | `4, 5, 6, 7` | `once` | 3 |
| `guard_break_v2` | `8, 9, 10, 11` | `once` | 4 |
| `counter_v2` | `12, 13, 14, 15` | `once` | 3 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Gottfried Wilhelm Leibniz.

Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom.
Every cell must be the same size and perfectly aligned, with no gutters, margins, border, labels, captions, or text.
Use true alpha transparency. Keep character identity, costume, palette, scale, camera angle, lighting, and pixel density identical in all 16 cells.
Use a right-facing orthographic side-view fighter camera unless a frame explicitly turns or falls. Keep the complete body and every effect inside its cell.
Crisp readable 2D arcade pixel art, limited palette, hard-edged clusters, and a strong silhouette. Prioritize exact body mechanics over decorative equations.

Gottfried Wilhelm Leibniz — The Optimist; role: methodical orb and logic projectile mage.

Biography: baroque polymath, diplomat, logician, and co-inventor of calculus recast as a precise technical duelist. His combat language treats motion as a proof: measured setup, exact contact, and elegant return. Monads appear as small luminous geometric orbs rather than floating text or equations.

Appearance: mature composed face, prominent dark eyebrows, large powdered white-gray curled wig, deep burgundy long coat with gold trim and layered cuffs, parchment-cream waistcoat and cravat, dark breeches, white stockings, buckle shoes, small brass calculation instrument or compass motif integrated at belt or hand.

Palette: burgundy #67243A, dark wine #321923, parchment #E8DDBF, powdered wig #D8D2C5, gold trim #C9A23A, brass #9A6A2E, monad cyan #59DDE8, possible-world violet #8665C5.

Animation identity: upright refined posture, rhythmic geometric cadence, symmetrical foot timing, restrained coat tails, compass-arc hand paths, exact straight jabs, centered technical kicks, and small monad orbs that orbit on controlled curves without obscuring the body.

Normals: Monad Jab, Calculus Palm, and Possible Worlds Arc. Specials: Monad Bolt, Possible World Mirror, Monad Orbit, and Best-World Engine.
Appearance continuity: mature baroque polymath with large powdered curled wig, burgundy gold-trim coat, parchment waistcoat and cravat, dark breeches, white stockings, buckle shoes, compact brass compass or calculation motif
Palette anchors: burgundy #67243A, dark wine #321923, parchment #E8DDBF, powdered wig #D8D2C5, gold trim #C9A23A, brass #9A6A2E, monad cyan #59DDE8, possible-world violet #8665C5
Animation identity: upright methodical duelist with rhythmic symmetrical timing, compass-arc hand paths, exact straight jabs, centered technical kicks, restrained coat-tail follow-through, and compact geometric monad orbs

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
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters, busy background, non-transparent background, checkerboard background, text, letters, equations, readable formulas, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, cross-cell motion trails, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, changing wig, changing coat length, modern suit, wizard robe, giant orbit effects, floating readable mathematics, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, equations, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing permanent prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, giant projectiles, detached limbs, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
