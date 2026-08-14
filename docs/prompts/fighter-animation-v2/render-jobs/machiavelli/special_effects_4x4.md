---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "machiavelli"
character_title: "Niccolò Machiavelli"
prompt_id: "special_effects_4x4"
job_id: "machiavelli__special_effects_4x4"
status: pending_render
output_image: "assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_special_effects_4x4.png"
frames: 16
grid:
  columns: 4
  rows: 4
cell_size: [256, 256]
output_size: [1024, 1024]
reference_images:
  - "assets/sprites/roster/machiavelli/source/machiavelli_core_4x4.png"
  - "assets/sprites/roster/machiavelli/source/machiavelli_extended_4x4.png"
source_character: "characters/machiavelli/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Niccolò Machiavelli — `special_effects_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_special_effects_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/machiavelli/source/machiavelli_core_4x4.png`
- `assets/sprites/roster/machiavelli/source/machiavelli_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `special_effect_slot_1_v2` | `0, 1, 2, 3` | `once` | 3 |
| `special_effect_slot_2_v2` | `4, 5, 6, 7` | `once` | 3 |
| `special_effect_slot_3_v2` | `8, 9, 10, 11` | `once` | 3 |
| `special_effect_slot_4_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art VFX sprite sheet for ETHIC BRAWL: machiavelli.

Character identity reference: Niccolò Machiavelli — The Strategist; role: feint assassin.
Biography: Florentine diplomat and author of The Prince recast as a courtly assassin of tactics. He treats combat as statecraft: a retreat is a lunge, a bow hides a blade, and a trap is simply policy made visible. His arc is observation, conspiracy, execution.
Appearance: slick dark hair, pointed beard, narrow calculating eyes, dark renaissance doublet, black cloak wedges, oxblood trim, gloves, hard boots, hidden dagger and parchment seal.
Palette: black #111014, cloak #07070A, oxblood #6E1720, steel #6F7880, parchment #D4B48C, trap magenta #FF00FF.
Animation identity: predatory stillness, stalking walk, sudden low burst run, compact tactical jump, cloak-curtain block.
Normals: Court Feint: false bow into hidden-hand poke, tiny oxblood slash, deceptive opener; Prince's Edict: diagonal cloak slash plus thrust, oxblood slash and steel glint, launcher pressure; Palace Coup: low-to-high cloak-banner strike, magenta crack, heavy launcher
Specials: B>A Prince's Gambit Lunge: startup false retreat cloak hides arm, active abrupt diagonal blade lunge, impact magenta exposed mark, recovery slides past line; B<A Court Intrigue Parry: startup smug exposed shoulder, active cloak curtain shield, impact dagger riposte from darkness, recovery cloak closes; BvA Coup Trap: startup kneeling gloved setup, active small magenta floor sigil, impact root spark arms, recovery withdraws without looking; B>J Opportunist Dash: startup low loaded boot, active black afterimage cross-up, impact reappears behind-angle, recovery cloak settles
Palette anchors: black #111014, cloak #07070A, oxblood #6E1720, steel #6F7880, parchment #D4B48C, trap magenta #FF00FF

Create EXACTLY one square RGBA effect-sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, row-major.
Use at least 1024x1024 pixels and dimensions divisible by four. True alpha transparency only; no scenery, floor, UI, labels, or text.
Each cell contains one isolated character-specific effect phase without the fighter body. Keep palette, pixel density, lighting, and outline language consistent.
Center every effect on a stable origin. Keep the complete effect, projectile, field edge, particles, and dissipating fragments fully inside its cell.
Never connect pixels across cells. Do not draw generic fireballs when the move description calls for a beam, counter plane, dash trail, summon, field, or physical shock.
Effects must remain readable at gameplay scale and visually match the character bible without relying on readable symbols, letters, or equations.

CHARACTER SPECIAL DEFINITIONS, in exact row order:
1. B>A — Prince's Gambit Lunge: startup — false retreat cloak hides arm; active — abrupt diagonal blade lunge; impact or sustain — magenta exposed mark; recovery — slides past line.
2. B<A — Court Intrigue Parry: startup — smug exposed shoulder; active — cloak curtain shield; impact or sustain — dagger riposte from darkness; recovery — cloak closes.
3. BvA — Coup Trap: startup — kneeling gloved setup; active — small magenta floor sigil; impact or sustain — root spark arms; recovery — withdraws without looking.
4. B>J — Opportunist Dash: startup — low loaded boot; active — black afterimage cross-up; impact or sustain — reappears behind-angle; recovery — cloak settles.

SHEET: FOUR CHARACTER-SPECIFIC SPECIAL EFFECT SEQUENCES, ONE INDEPENDENT ROW PER CURRENT SPECIAL.
Row 1, frames 1-4: first listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 2, frames 5-8: second listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 3, frames 9-12: third listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.
Row 4, frames 13-16: fourth listed special effect — telegraph or spawn, active travel or sustain, impact peak, dissipation.

For physical or movement specials, render the compact trail, dust, shock, counter flash, or field component rather than inventing a projectile.
No fighter body, opponent, scenery, readable text, equations, or effect crossing a cell boundary.
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, equations, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing permanent prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, giant projectiles, detached limbs, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
