---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 1
character_id: "anselm"
character_title: "Anselm of Canterbury"
prompt_id: "jump_land_recovery_4x4"
status: pending_render
output_image: "assets/sprites/roster/anselm/source/animation-v2/anselm_jump_land_recovery_4x4.png"
reference_images:
  - "assets/sprites/roster/anselm/source/anselm_core_4x4.png"
  - "assets/sprites/roster/anselm/source/anselm_extended_4x4.png"
source_character: "characters/anselm/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Anselm of Canterbury — `jump_land_recovery_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/anselm/source/animation-v2/anselm_jump_land_recovery_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/anselm/source/anselm_core_4x4.png`
- `assets/sprites/roster/anselm/source/anselm_extended_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `jump_takeoff_v2` | `0, 1, 2, 3` | `once` | 3 |
| `jump_air_v2` | `4, 5, 6, 7` | `once` | 4 |
| `land_v2` | `8, 9, 10, 11` | `once` | 3 |
| `land_recovery_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Anselm of Canterbury.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom.
Every cell must be the same size, perfectly aligned, with no gutters, no margins, no border, no labels, no text.
Use true alpha transparency. Keep the same character identity, costume, palette, scale, camera angle, lighting, and pixel density in all 16 cells.
Right-facing side-view fighter poses unless a frame explicitly says left-facing recovery. Keep the full body inside every cell.
Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Prioritize body pose clarity over large magical effects.

Anselm of Canterbury — The Ontological Proof; role: proof mage.
Biography: Medieval monk and philosopher of the Proslogion recast as a narrow proof-mage. His combat rhythm is premise, gesture, conclusion: quiet prayer-hand starts become unavoidable lines of manuscript light.
Appearance: narrow hooded monk face, intent eyes, brown robe, cord belt, illuminated manuscript talisman, prayer-hand posture, parchment seal glow.
Palette: monk brown #4B3325, robe shadow #2D1F19, parchment #DCC99B, manuscript red #A33A32, holy ivory #F8EDC6, logic blue #7FA9D8.
Animation identity: prayer-hand idle, restrained gliding walk, compact robe-ribbon run, seal-flash jump, crossed-hand proof shield.
Normals: Proslogion Pierce: two-finger or talisman thrust, tiny ivory-blue point, precise opener; Ontological Ray: hands open from prayer, thin ivory ray with red fleck, linear control; Credo Dive: descending prayer-hand strike, small seal burst, aerial ender
Specials: B>A Ontological Ray: startup talisman brightens, active narrow ivory-blue beam, impact glyph flecks no text, recovery hands close; B<A Greater-Than Counter: startup humble exposed stance, active proof seal unfolds, impact riposte pulse snaps, recovery robe settles; B^J Proslogion Rise: startup knees dip talisman up, active vertical manuscript seal lifts, impact rising shoulder ring, recovery hands close overhead; BvJ That-Than-Which Field: startup talisman near ground, active parchment ring expands, impact ivory-blue ticks pulse, recovery prayer at center
Appearance continuity: narrow hooded monk face, intent eyes, brown robe, cord belt, illuminated manuscript talisman, prayer-hand posture, parchment seal glow
Palette anchors: monk brown #4B3325, robe shadow #2D1F19, parchment #DCC99B, manuscript red #A33A32, holy ivory #F8EDC6, logic blue #7FA9D8
Animation identity: prayer-hand idle, restrained gliding walk, compact robe-ribbon run, seal-flash jump, crossed-hand proof shield

Create EXACTLY one square RGBA sprite sheet arranged as a perfect 4x4 grid: 16 equal cells, read left-to-right and top-to-bottom.
Use at least 1024x1024 pixels and dimensions divisible by four. No gutters, margins, borders, labels, captions, numbers, UI, or scenery.
True alpha transparency only. One full-body fighter in every cell. Orthographic side-view arcade camera. Stable ground baseline.
Keep character identity, face, costume, prop, palette, scale, lighting, outline weight, and pixel density identical in all cells.
Crisp deliberate pixel art with a limited palette and readable silhouette. Do not paint intermediate blur; each cell is a clean animation drawing.
Root-lock every grounded frame: keep the pelvis/root near the same cell coordinate. Show movement through stride, compression, weight transfer,
overlap, and counter-swing. Do not move the character progressively across the sheet. The game engine supplies screen translation.
Keep feet inside the cell, keep effects compact, and never connect marks across cell boundaries.

SHEET: TAKEOFF, AIR ARC, LANDING, AND RECOVERY. Keep one consistent side-view camera and horizontal root anchor.

Frames 1-4, takeoff:
1 standing anticipation, knees and hips begin to load;
2 deepest crouch/compression, arms prepare;
3 explosive extension, toes still near baseline;
4 clean takeoff, feet visibly leave the baseline.

Frames 5-8, airborne arc:
5 rising pose with limbs trailing;
6 near apex, body longest and lightest;
7 apex transition, vertical velocity visually near zero;
8 beginning descent, limbs prepare for contact.

Frames 9-12, landing:
9 pre-contact with feet reaching for baseline;
10 first contact, clear squash and impact absorption;
11 deepest landing compression, torso and secondary cloth/hair continue downward;
12 first recovery upward, balance returning.

Frames 13-16, settle:
13 small corrective step or character-specific stabilizing gesture;
14 guard and head return to neutral height;
15 secondary motion settles;
16 exact reusable idle-ready pose.

Do not add a floor, dust cloud, or scenery. A tiny contact accent inside frame 10 is allowed but must not obscure the feet.
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
