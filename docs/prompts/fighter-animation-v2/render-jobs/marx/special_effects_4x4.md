---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "marx"
character_title: "Karl Marx"
prompt_id: "special_effects_4x4"
job_id: "marx__special_effects_4x4"
status: pending_render
output_image: "assets/sprites/roster/marx/source/animation-v2/marx_special_effects_4x4.png"
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

# Karl Marx — `special_effects_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/marx/source/animation-v2/marx_special_effects_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/marx/source/marx_core_4x4.png`
- `assets/sprites/roster/marx/source/marx_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `special_effect_slot_1_v2` | `0, 1, 2, 3` | `once` | 3 |
| `special_effect_slot_2_v2` | `4, 5, 6, 7` | `once` | 3 |
| `special_effect_slot_3_v2` | `8, 9, 10, 11` | `once` | 3 |
| `special_effect_slot_4_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art VFX sprite sheet for ETHIC BRAWL: marx.

Character identity reference: Karl Marx — The Revolutionary Pressure Engine; role: pressure scaler; mechanic: shockwaves, factory hazards, revolution buffs.
Biography/combat fantasy: Critic of capital and theorist of class struggle recast as a pressure scaler. Marx advances with manifesto shockwaves, factory-floor hazards, and collective red-banner momentum that grows more threatening the longer he controls space.
Appearance: large iconic beard, heavy brow, dark coat, red scarf or sash, rolled manuscript, sturdy boots, factory soot edges, red banner fragments and gear silhouettes.
Palette: coat black #1B1B1D, beard gray #B7B0A6, manuscript tan #D6C39A, revolution red #D21F2B, factory iron #666B70, ember orange #D86A28.
Animation identity: heavy lecturing idle with manuscript hand, trudging worker march walk, pressure-forward run, weighty jump, crossed-arm red guard, banner-raised victory.
Normals: Manifesto Jab: rolled paper straight punch, small red paper spark, pressure starter; Dialectic Hook: broad coat-and-beard hook, red/iron crescent, mid pressure; Factory Stomp: heavy boot stomp, soot and gear spark, grounded ender
Specials: B>A Manifesto Shockwave: startup unrolls manifesto with red flash, active forward shout/palm sends red ground shockwave, impact paper-and-soot wave rolls low, recovery manuscript snaps back; BvA Factory Floor Hazard: startup stomps boot into floor, active iron gear hazard sparks under opponent lane, impact low factory plate glows red-orange, recovery steps forward through soot; B^J Red Banner Rise: startup grips invisible banner pole low, active red banner surges upward behind body, impact banner lift buff pulse rises vertically, recovery banner folds into scarf; BvJ Revolution Field: startup raises fist and manifesto, active large red circular field spreads at feet, impact gear silhouettes and banner motes pulse, recovery stands in collective momentum aura
Palette anchors: coat black #1B1B1D, beard gray #B7B0A6, manuscript tan #D6C39A, revolution red #D21F2B, factory iron #666B70, ember orange #D86A28

Create EXACTLY one square RGBA effect-sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, row-major.
Use at least 1024x1024 pixels and dimensions divisible by four. True alpha transparency only; no scenery, floor, UI, labels, or text.
Each cell contains one isolated character-specific effect phase without the fighter body. Keep palette, pixel density, lighting, and outline language consistent.
Center every effect on a stable origin. Keep the complete effect, projectile, field edge, particles, and dissipating fragments fully inside its cell.
Never connect pixels across cells. Do not draw generic fireballs when the move description calls for a beam, counter plane, dash trail, summon, field, or physical shock.
Effects must remain readable at gameplay scale and visually match the character bible without relying on readable symbols, letters, or equations.

CHARACTER SPECIAL DEFINITIONS, in exact row order:
1. B>A — Manifesto Shockwave: startup — unrolls manifesto with red flash; active — forward shout/palm sends red ground shockwave; impact or sustain — paper-and-soot wave rolls low; recovery — manuscript snaps back.
2. BvA — Factory Floor Hazard: startup — stomps boot into floor; active — iron gear hazard sparks under opponent lane; impact or sustain — low factory plate glows red-orange; recovery — steps forward through soot.
3. B^J — Red Banner Rise: startup — grips invisible banner pole low; active — red banner surges upward behind body; impact or sustain — banner lift buff pulse rises vertically; recovery — banner folds into scarf.
4. BvJ — Revolution Field: startup — raises fist and manifesto; active — large red circular field spreads at feet; impact or sustain — gear silhouettes and banner motes pulse; recovery — stands in collective momentum aura.

SHEET: FOUR CHARACTER-SPECIFIC SPECIAL EFFECT SEQUENCES, ONE INDEPENDENT ROW PER CURRENT SPECIAL.
Row 1, frames 1-4: first listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 2, frames 5-8: second listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 3, frames 9-12: third listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 4, frames 13-16: fourth listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.

For physical or movement specials, render the compact trail, dust, shock, counter flash, or field component rather than inventing a projectile.
No fighter body, opponent, scenery, readable text, equations, or effect crossing a cell boundary.
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters unless the character is explicitly a duo-as-one silhouette, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, equations, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing permanent prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, giant projectiles, detached limbs, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
