---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "camus"
character_title: "Albert Camus"
prompt_id: "reactions_knockdown_4x4"
job_id: "camus__reactions_knockdown_4x4"
status: pending_render
output_image: "assets/sprites/roster/camus/source/animation-v2/camus_damage_recovery_4x4.png"
frames: 16
grid:
  columns: 4
  rows: 4
cell_size: [256, 256]
output_size: [1024, 1024]
reference_images:
  - "assets/sprites/roster/camus/source/camus_core_4x4.png"
  - "assets/sprites/roster/camus/source/camus_extended_4x4.png"
source_character: "characters/camus/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Albert Camus — `reactions_knockdown_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/camus/source/animation-v2/camus_damage_recovery_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/camus/source/camus_core_4x4.png`
- `assets/sprites/roster/camus/source/camus_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `hitstun_light_v2` | `0, 1, 2, 3` | `once` | 3 |
| `hitstun_heavy_v2` | `4, 5, 6, 7` | `once` | 4 |
| `knockdown_v2` | `8, 9, 10, 11` | `once` | 5 |
| `getup_v2` | `12, 13, 14, 15` | `once` | 4 |

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
True alpha transparency only. One complete full-body fighter in every cell. Orthographic side-view arcade camera. Stable grounded baseline.
Keep character identity, face, costume, permanent prop, palette, scale, lighting, outline weight, and pixel density identical in all cells.
Crisp deliberate pixel art with a limited palette and readable silhouette. Every cell is one clean animation drawing, never a blurred in-between.
Root-lock every grounded frame: keep the pelvis/root near the same cell coordinate. Show motion through stride, compression, weight transfer,
overlap, recoil, and counter-swing. Never bake progressive screen translation into a sheet; the game engine owns world movement.
Keep feet, hair, cloth, props, weapons, particles, projectiles, and effect trails fully inside their cell. Never connect marks across boundaries.
Temporary items or special props may appear only in the rows that explicitly require them. They must not alter the reusable idle silhouette.
Only the named fighter may appear. Hit-reaction and throw frames must not include a second complete opponent body.

SHEET: DAMAGE REACTIONS, KNOCKDOWN, AND GET-UP. No attacker appears.
Row 1, frames 1-4: light hitstun — first contact recoil, smallest readable stagger, balance catch, guarded recovery.
Row 2, frames 5-8: heavy hitstun — stronger impact fold, displaced upper body, stumbling catch, vulnerable recovery.
Row 3, frames 9-12: knockdown — launch or collapse start, falling body, ground contact, stable downed pose. Complete body inside every cell.
Row 4, frames 13-16: get-up — downed readiness, push or roll to knees, rise with protected head, restored combat guard.

Permanent props remain attached or visibly retained. Tiny hit sparks are allowed only in frames 1 and 5.
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, equations, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing permanent prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, giant projectiles, detached limbs, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
