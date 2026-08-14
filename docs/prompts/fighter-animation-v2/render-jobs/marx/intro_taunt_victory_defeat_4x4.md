---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "marx"
character_title: "Karl Marx"
prompt_id: "intro_taunt_victory_defeat_4x4"
job_id: "marx__intro_taunt_victory_defeat_4x4"
status: pending_render
output_image: "assets/sprites/roster/marx/source/animation-v2/marx_intro_taunt_victory_defeat_4x4.png"
frames: 16
grid:
  columns: 4
  rows: 4
cell_size: [256, 256]
output_size: [1024, 1024]
reference_images:
  - "assets/sprites/roster/marx/source/marx_core_4x4.png"
  - "assets/sprites/roster/marx/source/marx_extended_4x4.png"
source_character: "characters/marx/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Karl Marx — `intro_taunt_victory_defeat_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/marx/source/animation-v2/marx_intro_taunt_victory_defeat_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/marx/source/marx_core_4x4.png`
- `assets/sprites/roster/marx/source/marx_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `intro_v2` | `0, 1, 2, 3` | `once` | 5 |
| `taunt_v2` | `4, 5, 6, 7` | `once` | 6 |
| `victory_v2` | `8, 9, 10, 11` | `loop` | 8 |
| `defeat_v2` | `12, 13, 14, 15` | `once` | 6 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Karl Marx.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom. Every cell must be same size, perfectly aligned, no gutters, no margins, no border, no labels, no text. Use true alpha transparency only. Keep the same character identity, costume, palette, scale, side-view camera, lighting, and pixel density in all 16 cells. Right-facing side-view fighter poses unless explicitly stated. Full body inside every cell. Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Compact VFX secondary to body pose clarity.

Karl Marx — The Revolutionary Pressure Engine; role: pressure scaler; mechanic: shockwaves, factory hazards, revolution buffs.
Biography/combat fantasy: Critic of capital and theorist of class struggle recast as a pressure scaler. Marx advances with manifesto shockwaves, factory-floor hazards, and collective red-banner momentum that grows more threatening the longer he controls space.
Appearance: large iconic beard, heavy brow, dark coat, red scarf or sash, rolled manuscript, sturdy boots, factory soot edges, red banner fragments and gear silhouettes.
Palette: coat black #1B1B1D, beard gray #B7B0A6, manuscript tan #D6C39A, revolution red #D21F2B, factory iron #666B70, ember orange #D86A28.
Animation identity: heavy lecturing idle with manuscript hand, trudging worker march walk, pressure-forward run, weighty jump, crossed-arm red guard, banner-raised victory.
Normals: Manifesto Jab: rolled paper straight punch, small red paper spark, pressure starter; Dialectic Hook: broad coat-and-beard hook, red/iron crescent, mid pressure; Factory Stomp: heavy boot stomp, soot and gear spark, grounded ender
Specials: B>A Manifesto Shockwave: startup unrolls manifesto with red flash, active forward shout/palm sends red ground shockwave, impact paper-and-soot wave rolls low, recovery manuscript snaps back; BvA Factory Floor Hazard: startup stomps boot into floor, active iron gear hazard sparks under opponent lane, impact low factory plate glows red-orange, recovery steps forward through soot; B^J Red Banner Rise: startup grips invisible banner pole low, active red banner surges upward behind body, impact banner lift buff pulse rises vertically, recovery banner folds into scarf; BvJ Revolution Field: startup raises fist and manifesto, active large red circular field spreads at feet, impact gear silhouettes and banner motes pulse, recovery stands in collective momentum aura
Appearance continuity: large iconic beard, heavy brow, dark coat, red scarf or sash, rolled manuscript, sturdy boots, factory soot edges, red banner fragments and gear silhouettes
Palette anchors: coat black #1B1B1D, beard gray #B7B0A6, manuscript tan #D6C39A, revolution red #D21F2B, factory iron #666B70, ember orange #D86A28
Animation identity: heavy lecturing idle with manuscript hand, trudging worker march walk, pressure-forward run, weighty jump, crossed-arm red guard, banner-raised victory

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

SHEET: MATCH PRESENTATION AND END STATES.
Row 1, frames 1-4: intro — enter or ready gesture, character-defining reveal, settle, reusable combat-ready finish.
Row 2, frames 5-8: taunt — anticipation, iconic gesture, held readable peak, return toward guard.
Row 3, frames 9-12: victory — realization, strongest character-specific victory pose, held variation, loop-ready settle.
Row 4, frames 13-16: defeat or KO — final stagger, collapse, ground contact, stable full-body defeated pose.

No speech text, quote cards, podiums, scenery, other characters, or giant celebratory effects.
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters unless the character is explicitly a duo-as-one silhouette, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, equations, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing permanent prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, giant projectiles, detached limbs, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
