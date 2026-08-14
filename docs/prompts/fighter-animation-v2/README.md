# Full Fighter Animation v2 Prompt Pack

This pack defines a complete, reviewable fighter sprite vocabulary for the current 18-character Ethic Brawl roster. It keeps each request to one independent 4×4 sheet while covering locomotion, defense, normal attacks, combat mobility, item handling, reactions, command specials, and match presentation.

The first five sheets are already compatible with the current Animation v2 locomotion/defense integration. The remaining eight sheets are the asset contract for replacing legacy combat, character-specific VFX, and presentation fallbacks after their renders pass review.

## Character sources

The generator reads every `characters/<id>/prompts.yml` identity bible. Each file must provide:

- `common_prompt_prefix`
- `character_sprite_brief`
- `negative_prompt`
- `palette_anchors`
- `appearance_bible`
- `animation_bible`
- exactly three `move_render_descriptions.normal_moves`
- exactly four `move_render_descriptions.special_moves`

The structured move descriptions are converted automatically into the normal-attack and command-special render prompts.

Canonical character IDs use `leibniz`, not the older `leibnitz` spelling. Historical filenames may retain aliases only where needed for provenance.

Provide the currently approved core and extended sprite sheets as image references whenever the rendering model supports them. The generator searches both `assets/` and `public/assets/` for those references. Identity continuity is more important than decorative detail.

## Output contract

Each request produces one square RGBA sheet with exactly 16 equal cells in a 4×4 row-major grid. Use at least 1024×1024 pixels and dimensions divisible by four.

- true alpha transparency only;
- no gutters, margins, frame lines, labels, numbers, or captions;
- orthographic side-view fighting-game camera;
- one character at a fixed scale and fixed root anchor;
- complete body, props, items, and effects inside every cell;
- identical costume, face, palette, lighting, outline weight, and pixel density;
- right-facing unless a turn or fall explicitly changes orientation;
- no baked world translation;
- no motion or VFX crossing a cell boundary;
- temporary items and special props appear only in their named rows;
- no second complete opponent in hit, grab, or throw frames.

## Full sheet set

| Sheet | Frames | Purpose |
|---|---:|---|
| `idle_turn_4x4` | 8 idle + 4 turn left + 4 turn right | Breathing, weight shifts, and facing changes |
| `walk_forward_backward_4x4` | 8 forward + 8 backward | Distinct advance and guarded retreat cycles |
| `run_start_loop_stop_4x4` | 4 start + 8 loop + 4 brake | Acceleration, sustained run, and braking |
| `jump_land_recovery_4x4` | 4 takeoff + 4 air + 4 landing + 4 recovery | Continuous vertical motion |
| `lane_guard_crouch_4x4` | 4 lane-away + 4 lane-toward + 4 crouch + 4 guard | 2.5D footwork and basic defense transitions |
| `normal_attacks_4x4` | 4 light + 4 medium + 4 heavy + 4 air attack | Full current normal attack chain and aerial attack |
| `mobility_evasion_throw_4x4` | 4 forward dash + 4 backdash + 4 evade + 4 throw | Combat movement and empty-hand throw motion |
| `item_interactions_4x4` | 4 pickup + 4 throw + 4 use + 4 swing | Universal item handling |
| `guard_parry_break_4x4` | 4 held guard + 4 parry + 4 guard break + 4 counter | Detailed defensive combat states |
| `reactions_knockdown_4x4` | 4 light hit + 4 heavy hit + 4 knockdown + 4 get-up | Damage and recovery states |
| `specials_4x4` | 4 frames × 4 current specials | One row per character-specific command-special caster animation |
| `special_effects_4x4` | 4 effect phases × 4 current specials | Isolated telegraph, active, impact, and dissipation VFX |
| `intro_taunt_victory_defeat_4x4` | 4 intro + 4 taunt + 4 victory + 4 defeat | Match presentation and end states |

That is **208 authored prompt frames per character** and **3,744 frames across 18 characters** when every sheet is rendered.

Suggested output directory:

```text
assets/sprites/roster/<id>/source/animation-v2/
```

Suggested filenames and clip ranges are defined in `atlas-manifest.template.yml`.

## Generate individual render jobs

Install the Python dependency once and generate every ready-to-paste job:

```bash
python3 -m pip install -r docs/prompts/fighter-animation-v2/requirements.txt
pnpm prompts:v2:generate
```

At the current roster size this writes:

```text
18 characters × 13 sheets = 234 render-job Markdown files
```

Files are written under:

```text
docs/prompts/fighter-animation-v2/render-jobs/<character>/<prompt-id>.md
```

The generator also writes:

- `render-jobs/INDEX.md`
- `render-jobs/manifest.json`

Verify generated files without rewriting them:

```bash
pnpm prompts:v2:check
```

Generated render-job Markdown files should not be edited directly. Change `prompt-pack.yml`, `atlas-manifest.template.yml`, or a character prompt bible, then regenerate.

## Recommended rendering order

For each character:

1. Render and approve `idle_turn_4x4`.
2. Render walk, run, jump, and lane/guard/crouch using the approved idle and legacy core sheet as references.
3. Render `normal_attacks_4x4` and confirm the three rows match the structured normal-move list.
4. Render mobility, item, detailed defense, and reaction sheets.
5. Render `specials_4x4`; each row must match the exact listed command-special order.
6. Render `special_effects_4x4` from the approved caster-special sheet so palette and timing agree.
7. Render intro, taunt, victory, and defeat last so identity is already stable.
8. Review every result with `REVIEW_CHECKLIST.md` before curation or runtime integration.

Do not ask one image generation to produce all 208 frames. Each 4×4 job is intentionally independent so a failed sheet can be rerendered without destabilizing the rest.

## Runtime note

The current game runtime directly uses the first five Animation v2 sheets for integrated characters and appends legacy combat frames. The eight new action and effect sheets are prompt-complete but not yet runtime-mapped. Once approved assets exist, the runtime atlas should map their clip metadata instead of retaining legacy attack, reaction, item, special, VFX, and victory fallbacks.
