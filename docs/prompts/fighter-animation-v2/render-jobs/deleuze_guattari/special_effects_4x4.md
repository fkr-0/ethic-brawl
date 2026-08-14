---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "deleuze_guattari"
character_title: "Gilles Deleuze / Félix Guattari"
prompt_id: "special_effects_4x4"
job_id: "deleuze_guattari__special_effects_4x4"
status: pending_render
output_image: "assets/sprites/roster/deleuze_guattari/source/animation-v2/deleuze_guattari_special_effects_4x4.png"
frames: 16
grid:
  columns: 4
  rows: 4
cell_size: [256, 256]
output_size: [1024, 1024]
reference_images:
  - "assets/sprites/roster/deleuze_guattari/source/deleuze_guattari_core_4x4.png"
  - "assets/sprites/roster/deleuze_guattari/source/deleuze_guattari_extended_4x4.png"
source_character: "characters/deleuze_guattari/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Gilles Deleuze / Félix Guattari — `special_effects_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/deleuze_guattari/source/animation-v2/deleuze_guattari_special_effects_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/deleuze_guattari/source/deleuze_guattari_core_4x4.png`
- `assets/sprites/roster/deleuze_guattari/source/deleuze_guattari_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `special_effect_slot_1_v2` | `0, 1, 2, 3` | `once` | 3 |
| `special_effect_slot_2_v2` | `4, 5, 6, 7` | `once` | 3 |
| `special_effect_slot_3_v2` | `8, 9, 10, 11` | `once` | 3 |
| `special_effect_slot_4_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art VFX sprite sheet for ETHIC BRAWL: deleuze_guattari.

Character identity reference: Gilles Deleuze / Félix Guattari — The Rhizome Engine; role: swarm / field chaos; mechanic: rhizome chains, assemblage cyclones.
Biography/combat fantasy: A duo reimagined as one playable assemblage: two thinkers expressed as a single unstable fighter silhouette of scarf, coat, masks, papers, and living rhizome lines. Their combat dissolves clean categories into swarms, chains, and fields of becoming.
Appearance: duo-as-one silhouette, one main body with a secondary shoulder-mask/echo rather than two independent characters, layered coats and scarves, wild hair outlines, notebooks, rhizome root-vines and machine-cog motes.
Palette: ink black #15151A, paper cream #E7DCC4, rhizome green #39FF14, machine magenta #FF4DCC, plateau blue #4AA3FF, cyclone violet #6B4DFF.
Animation identity: restless double-beat idle, skittering sideways walk, line-of-flight dash run, scarf-and-root aerial shapes, tangled assemblage block, chaotic but readable victory swirl.
Normals: Concept Jab: two-beat asymmetrical jab from main hand and echo shoulder, green rhizome tick, trick opener; Assemblage Sweep: scarf-and-root side sweep, magenta-green arc, chaos pressure; Plateau Kick: rising knee with paper burst, blue plateau spark, launcher-flavored ender
Specials: B>A Rhizome Lash: startup root-lines coil around the lead arm, active green chain lashes forward in one clear strand, impact small branching roots bite the floor, recovery root strand retracts into sleeve; B^A Thousand Plateaus Rise: startup papers and roots gather under feet, active vertical layered platform/rhizome lift rises, impact blue-green staircase burst pops upward, recovery falls back into unstable stance; B>J Line-of-Flight Dash: startup body leans toward escape vector, active fast diagonal dash with scarf-root afterimage, impact magenta/green line cuts across cell, recovery reassembles as one fighter silhouette; BvJ Body-without-Organs Domain: startup silhouette loosens as root-cog motes orbit, active flat violet-green field spreads under feet, impact assemblage cyclone forms behind but body stays readable, recovery motes collapse into coat folds
Palette anchors: ink black #15151A, paper cream #E7DCC4, rhizome green #39FF14, machine magenta #FF4DCC, plateau blue #4AA3FF, cyclone violet #6B4DFF

Create EXACTLY one square RGBA effect-sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, row-major.
Use at least 1024x1024 pixels and dimensions divisible by four. True alpha transparency only; no scenery, floor, UI, labels, or text.
Each cell contains one isolated character-specific effect phase without the fighter body. Keep palette, pixel density, lighting, and outline language consistent.
Center every effect on a stable origin. Keep the complete effect, projectile, field edge, particles, and dissipating fragments fully inside its cell.
Never connect pixels across cells. Do not draw generic fireballs when the move description calls for a beam, counter plane, dash trail, summon, field, or physical shock.
Effects must remain readable at gameplay scale and visually match the character bible without relying on readable symbols, letters, or equations.

CHARACTER SPECIAL DEFINITIONS, in exact row order:
1. B>A — Rhizome Lash: startup — root-lines coil around the lead arm; active — green chain lashes forward in one clear strand; impact or sustain — small branching roots bite the floor; recovery — root strand retracts into sleeve.
2. B^A — Thousand Plateaus Rise: startup — papers and roots gather under feet; active — vertical layered platform/rhizome lift rises; impact or sustain — blue-green staircase burst pops upward; recovery — falls back into unstable stance.
3. B>J — Line-of-Flight Dash: startup — body leans toward escape vector; active — fast diagonal dash with scarf-root afterimage; impact or sustain — magenta/green line cuts across cell; recovery — reassembles as one fighter silhouette.
4. BvJ — Body-without-Organs Domain: startup — silhouette loosens as root-cog motes orbit; active — flat violet-green field spreads under feet; impact or sustain — assemblage cyclone forms behind but body stays readable; recovery — motes collapse into coat folds.

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
