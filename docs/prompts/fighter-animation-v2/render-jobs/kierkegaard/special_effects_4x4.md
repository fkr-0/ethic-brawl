---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 3
character_id: "kierkegaard"
character_title: "Søren Kierkegaard"
prompt_id: "special_effects_4x4"
job_id: "kierkegaard__special_effects_4x4"
status: rendered_unreviewed
output_image: "assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_special_effects_4x4.png"
frames: 16
grid:
  columns: 4
  rows: 4
cell_size: [256, 256]
output_size: [1024, 1024]
reference_images:
  - "assets/sprites/roster/kierkegaard/source/kierkegaard_core_4x4.png"
  - "assets/sprites/roster/kierkegaard/source/kierkegaard_extended_4x4.png"
source_character: "characters/kierkegaard/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Søren Kierkegaard — `special_effects_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/kierkegaard/source/animation-v2/kierkegaard_special_effects_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Output geometry: 1024×1024 RGBA, 256×256 per cell
- Review state: `rendered_unreviewed`

## Suggested reference images

- `assets/sprites/roster/kierkegaard/source/kierkegaard_core_4x4.png`
- `assets/sprites/roster/kierkegaard/source/kierkegaard_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `special_effect_slot_1_v2` | `0, 1, 2, 3` | `once` | 3 |
| `special_effect_slot_2_v2` | `4, 5, 6, 7` | `once` | 3 |
| `special_effect_slot_3_v2` | `8, 9, 10, 11` | `once` | 3 |
| `special_effect_slot_4_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art VFX sprite sheet for ETHIC BRAWL: kierkegaard.

Character identity reference: Søren Kierkegaard — The Knight of Faith; role: risk / leap specialist; mechanic: anxiety pools, faith leaps.
Biography/combat fantasy: Danish existential writer recast as a risk/leap specialist. Kierkegaard weaponizes anxiety, irony, and the impossible leap: hesitant in posture, sudden in commitment, fragile unless faith carries him through.
Appearance: melancholy dandy silhouette, swept hair, long dark coat, high collar, narrow trousers, walking cane or small book, ink-blue anxiety pools and white-gold faith sparks.
Palette: copenhagen black #171820, coat blue #202A44, paper cream #E5D8BA, anxiety ink #263B8F, faith gold #F3D66B, irony pink #C85C9E.
Animation identity: nervous fidget idle, hesitant walk, sudden leap-run, dramatic airborne faith arc, cane/book guarded block, relieved hand-to-heart victory.
Normals: Irony Jab: small hesitant cane poke that commits late, pink irony tick, tricky opener; Anxiety Cut: quick diagonal coat-and-cane slash, ink-blue smear, risk pressure; Faith Heel: sudden committed leap kick, gold spark at foot, leap ender
Specials: B>A Leap-of-Faith Strike: startup hesitates with cane/book close, active sudden forward faith-lit strike, impact gold spark at committed impact, recovery lands fragile but resolved; B^A Either/Or Upper: startup two ghosted choices split around him, active chooses upward cane/book uppercut, impact blue-pink fork collapses into hit, recovery recovers with hand to chest; B>J Faith Dash: startup low anxious crouch, active white-gold dash leap forward, impact body crosses a small abyss gap inside cell, recovery lands in resolved stance; BvJ Knight of Faith: startup anxiety pool forms under shoes, active gold light rises through dark pool, impact protective faith aura stabilizes body, recovery aura fades to trembling calm
Palette anchors: copenhagen black #171820, coat blue #202A44, paper cream #E5D8BA, anxiety ink #263B8F, faith gold #F3D66B, irony pink #C85C9E

Create EXACTLY one square RGBA effect-sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, row-major.
Use at least 1024x1024 pixels and dimensions divisible by four. True alpha transparency only; no scenery, floor, UI, labels, or text.
Each cell contains one isolated character-specific effect phase without the fighter body. Keep palette, pixel density, lighting, and outline language consistent.
Center every effect on a stable origin. Keep the complete effect, projectile, field edge, particles, and dissipating fragments fully inside its cell.
Never connect pixels across cells. Do not draw generic fireballs when the move description calls for a beam, counter plane, dash trail, summon, field, or physical shock.
Effects must remain readable at gameplay scale and visually match the character bible without relying on readable symbols, letters, or equations.

CHARACTER SPECIAL DEFINITIONS, in exact row order:
1. B>A — Leap-of-Faith Strike: startup — hesitates with cane/book close; active — sudden forward faith-lit strike; impact or sustain — gold spark at committed impact; recovery — lands fragile but resolved.
2. B^A — Either/Or Upper: startup — two ghosted choices split around him; active — chooses upward cane/book uppercut; impact or sustain — blue-pink fork collapses into hit; recovery — recovers with hand to chest.
3. B>J — Faith Dash: startup — low anxious crouch; active — white-gold dash leap forward; impact or sustain — body crosses a small abyss gap inside cell; recovery — lands in resolved stance.
4. BvJ — Knight of Faith: startup — anxiety pool forms under shoes; active — gold light rises through dark pool; impact or sustain — protective faith aura stabilizes body; recovery — aura fades to trembling calm.

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
