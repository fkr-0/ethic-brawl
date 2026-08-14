---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "socrates"
character_title: "Socrates"
prompt_id: "special_effects_4x4"
job_id: "socrates__special_effects_4x4"
status: rendered_unreviewed
output_image: "assets/sprites/roster/socrates/source/animation-v2/socrates_special_effects_4x4.png"
frames: 16
grid:
  columns: 4
  rows: 4
cell_size: [256, 256]
output_size: [1024, 1024]
reference_images:
  - "assets/sprites/roster/socrates/source/socrates_core_4x4.png"
  - "assets/sprites/roster/socrates/source/socrates_extended_4x4.png"
source_character: "characters/socrates/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Socrates — `special_effects_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/socrates/source/animation-v2/socrates_special_effects_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `rendered_unreviewed`

## Suggested reference images

- `assets/sprites/roster/socrates/source/socrates_core_4x4.png`
- `assets/sprites/roster/socrates/source/socrates_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `special_effect_slot_1_v2` | `0, 1, 2, 3` | `once` | 3 |
| `special_effect_slot_2_v2` | `4, 5, 6, 7` | `once` | 3 |
| `special_effect_slot_3_v2` | `8, 9, 10, 11` | `once` | 3 |
| `special_effect_slot_4_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art VFX sprite sheet for ETHIC BRAWL: socrates.

Character identity reference: Socrates — The Gadfly Questioner; role: question/counter trickster; mechanic: reflection, stun, dialogue trap.
Biography/combat fantasy: Athenian gadfly recast as a question/counter trickster. Socrates wins by making the opponent answer: he reflects certainty, stuns with elenchus, traps the arena as an agora, and backs away with infuriating calm.
Appearance: balding head, pug nose, short beard, simple white himation/tunic, bare feet or sandals, small cup and scroll, warm ironic smile, dialogue-ring VFX without readable text.
Palette: linen white #E9E0CA, skin bronze #B9855A, scroll tan #D1B276, hemlock green #6FAE5F, agora gold #E2B84D, question blue #57A6FF.
Animation identity: barefoot questioning idle, casual walk, nimble conversational shuffle run, compact hop, open-palm reflective block, shrugging victory.
Normals: Gadfly Jab: annoying open-finger poke, tiny blue question spark, poke starter; Elenchus Palm: open palm presses forward, gold-blue dialogue ring, stun pressure; Agora Trip: barefoot low sweep, dust and question spark, trick ender
Specials: B>A Elenchus Bolt: startup raises one questioning finger, active small blue-gold bolt shoots from fingertip, impact stun spark pops like a dialogue bubble without text, recovery finger lowers with smirk; B<A Question Reversal: startup leans in as if inviting an answer, active open palm mirror catches attack, impact reversal flash bends back toward opponent, recovery shrugs into stance; BvA Agora Trap: startup taps ground with bare foot, active small circular debate mark appears on floor, impact trap glows gold-blue and waits, recovery hands open in invitation; B<J Apology Backstep: startup steps back with cup/scroll close, active slips backward under a faint dialogue arc, impact afterimage shrugs in place, recovery settles calm and irritating
Palette anchors: linen white #E9E0CA, skin bronze #B9855A, scroll tan #D1B276, hemlock green #6FAE5F, agora gold #E2B84D, question blue #57A6FF

Create EXACTLY one square RGBA effect-sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, row-major.
Use at least 1024x1024 pixels and dimensions divisible by four. True alpha transparency only; no scenery, floor, UI, labels, or text.
Each cell contains one isolated character-specific effect phase without the fighter body. Keep palette, pixel density, lighting, and outline language consistent.
Center every effect on a stable origin. Keep the complete effect, projectile, field edge, particles, and dissipating fragments fully inside its cell.
Never connect pixels across cells. Do not draw generic fireballs when the move description calls for a beam, counter plane, dash trail, summon, field, or physical shock.
Effects must remain readable at gameplay scale and visually match the character bible without relying on readable symbols, letters, or equations.

CHARACTER SPECIAL DEFINITIONS, in exact row order:
1. B>A — Elenchus Bolt: startup — raises one questioning finger; active — small blue-gold bolt shoots from fingertip; impact or sustain — stun spark pops like a dialogue bubble without text; recovery — finger lowers with smirk.
2. B<A — Question Reversal: startup — leans in as if inviting an answer; active — open palm mirror catches attack; impact or sustain — reversal flash bends back toward opponent; recovery — shrugs into stance.
3. BvA — Agora Trap: startup — taps ground with bare foot; active — small circular debate mark appears on floor; impact or sustain — trap glows gold-blue and waits; recovery — hands open in invitation.
4. B<J — Apology Backstep: startup — steps back with cup/scroll close; active — slips backward under a faint dialogue arc; impact or sustain — afterimage shrugs in place; recovery — settles calm and irritating.

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
