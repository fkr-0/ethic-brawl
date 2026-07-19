---
generated: true
generated_by: "docs/prompts/fighter-animation-v2/render-prompts.py"
prompt_pack_version: 1
character_id: "deleuze_guattari"
character_title: "Gilles Deleuze / Félix Guattari"
prompt_id: "jump_land_recovery_4x4"
status: pending_render
output_image: "assets/sprites/roster/deleuze_guattari/source/animation-v2/deleuze_guattari_jump_land_recovery_4x4.png"
reference_images:
  - "assets/sprites/roster/deleuze_guattari/source/deleuze_guattari_core_4x4.png"
source_character: "characters/deleuze_guattari/prompts.yml"
source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"
---

# Gilles Deleuze / Félix Guattari — `jump_land_recovery_4x4`

This file is one complete Animation v2 render job. Copy only the text in the **Prompt** block into the rendering model.

## Render target

- Output image: `assets/sprites/roster/deleuze_guattari/source/animation-v2/deleuze_guattari_jump_land_recovery_4x4.png`
- Sheet geometry: 4×4 cells, 16 frames, row-major
- Review state: `pending_render`

## Suggested reference images

- `assets/sprites/roster/deleuze_guattari/source/deleuze_guattari_core_4x4.png`

## Runtime clip plan

| Clip | Frames | Mode | Duration |
|---|---|---|---:|
| `jump_takeoff_v2` | `0, 1, 2, 3` | `once` | 3 |
| `jump_air_v2` | `4, 5, 6, 7` | `once` | 4 |
| `land_v2` | `8, 9, 10, 11` | `once` | 3 |
| `land_recovery_v2` | `12, 13, 14, 15` | `once` | 4 |

## Prompt

```text
Create a production-ready pixel-art sprite sheet for ETHIC BRAWL: Gilles Deleuze / Félix Guattari.
Output EXACTLY one image arranged as a perfect 4x4 grid, 16 frames total, read left-to-right and top-to-bottom. Every cell must be same size, perfectly aligned, no gutters, no margins, no border, no labels, no text. Use true alpha transparency only. Keep the same character identity, costume, palette, scale, side-view camera, lighting, and pixel density in all 16 cells. Right-facing side-view fighter poses unless explicitly stated. Full body inside every cell. Crisp readable 2D arcade pixel art, limited palette, strong silhouette. Compact VFX secondary to body pose clarity.

Gilles Deleuze / Félix Guattari — The Rhizome Engine; role: swarm / field chaos; mechanic: rhizome chains, assemblage cyclones.
Biography/combat fantasy: A duo reimagined as one playable assemblage: two thinkers expressed as a single unstable fighter silhouette of scarf, coat, masks, papers, and living rhizome lines. Their combat dissolves clean categories into swarms, chains, and fields of becoming.
Appearance: duo-as-one silhouette, one main body with a secondary shoulder-mask/echo rather than two independent characters, layered coats and scarves, wild hair outlines, notebooks, rhizome root-vines and machine-cog motes.
Palette: ink black #15151A, paper cream #E7DCC4, rhizome green #39FF14, machine magenta #FF4DCC, plateau blue #4AA3FF, cyclone violet #6B4DFF.
Animation identity: restless double-beat idle, skittering sideways walk, line-of-flight dash run, scarf-and-root aerial shapes, tangled assemblage block, chaotic but readable victory swirl.
Normals: Concept Jab: two-beat asymmetrical jab from main hand and echo shoulder, green rhizome tick, trick opener; Assemblage Sweep: scarf-and-root side sweep, magenta-green arc, chaos pressure; Plateau Kick: rising knee with paper burst, blue plateau spark, launcher-flavored ender
Specials: B>A Rhizome Lash: startup root-lines coil around the lead arm, active green chain lashes forward in one clear strand, impact small branching roots bite the floor, recovery root strand retracts into sleeve; B^A Thousand Plateaus Rise: startup papers and roots gather under feet, active vertical layered platform/rhizome lift rises, impact blue-green staircase burst pops upward, recovery falls back into unstable stance; B>J Line-of-Flight Dash: startup body leans toward escape vector, active fast diagonal dash with scarf-root afterimage, impact magenta/green line cuts across cell, recovery reassembles as one fighter silhouette; BvJ Body-without-Organs Domain: startup silhouette loosens as root-cog motes orbit, active flat violet-green field spreads under feet, impact assemblage cyclone forms behind but body stays readable, recovery motes collapse into coat folds
Appearance continuity: duo-as-one silhouette, one main body with a secondary shoulder-mask/echo rather than two independent characters, layered coats and scarves, wild hair outlines, notebooks, rhizome root-vines and machine-cog motes
Palette anchors: ink black #15151A, paper cream #E7DCC4, rhizome green #39FF14, machine magenta #FF4DCC, plateau blue #4AA3FF, cyclone violet #6B4DFF
Animation identity: restless double-beat idle, skittering sideways walk, line-of-flight dash run, scarf-and-root aerial shapes, tangled assemblage block, chaotic but readable victory swirl

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
Negative prompt: blurry, painterly, 3d render, realistic photo, watercolor, vector smooth shading, multiple characters unless the character is explicitly a duo-as-one silhouette, busy background, non-transparent background, checkerboard background, text, letters, labels, captions, speech bubbles, UI elements, watermark, logo, uneven grid, broken grid, offset cells, inconsistent cell sizes, cropped limbs, cut-off feet, motion trails crossing cell boundaries, duplicate frames, heavy glow, bloom, soft shadow halos, anti-aliased fringe, costume changes, face changes, weapon changes, prop disappears, unreadable silhouette, blurry, painterly, 3d render, realistic photo, vector art, smooth gradient rendering, anti-aliased fringe, multiple characters,
background, scenery, checkerboard, text, letters, labels, captions, watermark, logo, frame numbers, uneven grid, gutters,
inconsistent cell sizes, cropped body, cut-off feet, changing face, changing costume, changing palette, changing prop size,
camera rotation, zoom changes, root drifting across cells, duplicate poses, skipped motion phases, motion smear, cross-cell trails,
excessive glow, effects hiding the body, cast shadows extending into neighboring cells
```

## Acceptance

Review the rendered sheet against [`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or runtime integration.
