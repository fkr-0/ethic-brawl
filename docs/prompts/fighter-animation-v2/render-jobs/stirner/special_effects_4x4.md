---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "stirner"
character_title: "Max Stirner"
prompt_id: "special_effects_4x4"
job_id: "stirner__special_effects_4x4"
status: rendered_unreviewed
output_image: "assets/sprites/roster/stirner/source/animation-v2/stirner_special_effects_4x4.png"
frames: 16
grid:
  columns: 4
  rows: 4
cell_size: [256, 256]
output_size: [1024, 1024]
reference_images:
  - "assets/sprites/roster/stirner/source/stirner_core_4x4.png"
  - "assets/sprites/roster/stirner/source/stirner_extended_4x4.png"
source_character: "characters/stirner/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Max Stirner — `special_effects_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/stirner/source/animation-v2/stirner_special_effects_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `rendered_unreviewed`

## Suggested reference images

- `assets/sprites/roster/stirner/source/stirner_core_4x4.png`
- `assets/sprites/roster/stirner/source/stirner_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `special_effect_slot_1_v2` | `0, 1, 2, 3` | `once` | 3 |
| `special_effect_slot_2_v2` | `4, 5, 6, 7` | `once` | 3 |
| `special_effect_slot_3_v2` | `8, 9, 10, 11` | `once` | 3 |
| `special_effect_slot_4_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art VFX sprite sheet for ETHIC BRAWL: stirner.

Character identity reference: Max Stirner — The Unique; role: egoist trickster; mechanic: unique/ridiculous moves that break design rules.
Biography/combat fantasy: Egoist provocateur recast as a rule-breaking trickster. Stirner attacks concepts as “spooks,” steals pose language from other fighters for a frame, and treats the arena like property to be appropriated.
Appearance: sharp mischievous face, high forehead, unruly dark hair, small glasses or glinting eyes, dark shabby academic coat, mismatched gloves, torn manifesto scraps, chalk outlines and absurd little prop switches.
Palette: ego black #101014, paper yellow #D8C171, chalk white #EDE6D0, spook violet #8C4DFF, absurd lime #A6FF3D, trick red #D94A4A.
Animation identity: fidgety self-owned idle, lopsided walk, sudden zigzag run, ridiculous but readable jump, shrugging anti-guard block, mocking victory pose.
Normals: Unique Jab: odd off-angle jab from too-relaxed stance, lime chalk tick, awkward opener; Spook Slap: backhand through a ghostly concept outline, violet pop, anti-guard pressure; Ownness Kick: self-satisfied sideways kick, red-lime spark, trick ender
Specials: B>A Egoist Appropriation: startup reaches as if taking ownership of space, active snatches a small lime-violet arc forward, impact target space gets a chalk ownership bracket with no text, recovery pockets the stolen arc; B<A Spook Reversal: startup points at an imaginary authority, active violet spook mask appears as counter guard, impact mask bursts backward into riposte, recovery shrugs as if nothing happened; B>J Ownness Dash: startup leans the wrong way first, active zigzag dash violates normal anticipation, impact afterimage briefly mocks another stance, recovery lands with smug off-balance pose; BvJ Union of Egoists Domain: startup drops torn paper scraps around feet, active absurd lime/violet domain forms from mismatched shapes, impact tiny autonomous scraps orbit as temporary allies, recovery domain folds into coat pocket
Palette anchors: ego black #101014, paper yellow #D8C171, chalk white #EDE6D0, spook violet #8C4DFF, absurd lime #A6FF3D, trick red #D94A4A

Create EXACTLY one square RGBA effect-sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, row-major.
Use at least 1024x1024 pixels and dimensions divisible by four. True alpha transparency only; no scenery, floor, UI, labels, or text.
Each cell contains one isolated character-specific effect phase without the fighter body. Keep palette, pixel density, lighting, and outline language consistent.
Center every effect on a stable origin. Keep the complete effect, projectile, field edge, particles, and dissipating fragments fully inside its cell.
Never connect pixels across cells. Do not draw generic fireballs when the move description calls for a beam, counter plane, dash trail, summon, field, or physical shock.
Effects must remain readable at gameplay scale and visually match the character bible without relying on readable symbols, letters, or equations.

CHARACTER SPECIAL DEFINITIONS, in exact row order:
1. B>A — Egoist Appropriation: startup — reaches as if taking ownership of space; active — snatches a small lime-violet arc forward; impact or sustain — target space gets a chalk ownership bracket with no text; recovery — pockets the stolen arc.
2. B<A — Spook Reversal: startup — points at an imaginary authority; active — violet spook mask appears as counter guard; impact or sustain — mask bursts backward into riposte; recovery — shrugs as if nothing happened.
3. B>J — Ownness Dash: startup — leans the wrong way first; active — zigzag dash violates normal anticipation; impact or sustain — afterimage briefly mocks another stance; recovery — lands with smug off-balance pose.
4. BvJ — Union of Egoists Domain: startup — drops torn paper scraps around feet; active — absurd lime/violet domain forms from mismatched shapes; impact or sustain — tiny autonomous scraps orbit as temporary allies; recovery — domain folds into coat pocket.

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
