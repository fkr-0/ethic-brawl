# Pixel-Art Character Visualization Execution Plan

Date: 2026-05-04
Depends on: `docs/superpowers/specs/2026-05-04-pixel-art-character-visualization-design.md`

## Objective

Execute pixel-art sprite migration in reviewable PRs, now using provided 4x4 sheets for:
- Camus
- Diogenes
- Machiavelli
- Leibniz

## Source Asset Decision (Confirmed)

Adopt user-provided 4x4 sheets as primary vertical-slice assets:
- Camus sheet (existing)
- Diogenes sheet (`[Image #1]` latest turn)
- Machiavelli sheet (`[Image #2]`)
- Leibniz sheet (`[Image #3]`)

These are treated as source art and normalized into engine-ready atlas + clips.

## Recommended Asset Prep Format

Preferred for production speed and fewer mapping mistakes:
1. Split each 4x4 sheet into 16 individual PNG frames per character.
2. Name consistently with ordinal index:
- `char_<id>__f00.png` ... `char_<id>__f15.png`
3. Provide one metadata file per character with frame->motion labels.

You can keep the unsplit 4x4 sheets too, but splitting into 16 files makes pivot tuning and per-frame replacement much easier.

## Required Annotation Pass (Needed)

For each character’s 16 frames, confirm intended motion label.

Minimum labels to assign:
- `idle`
- `guard`
- `taunt_or_pose`
- `run_1`
- `run_2`
- `run_3`
- `run_4`
- `crouch`
- `jump_rise`
- `air_attack_or_air_kick`
- `land`
- `attack_1`
- `attack_2`
- `attack_3`
- `victory_or_quote_pose`
- `spare` (if not used)

If you want exact semantic mapping beyond this (for authored move identity), I need your preferred meaning for any ambiguous frame.

## Delivery Strategy

- Keep combat logic unchanged.
- Make sprite rendering default with procedural fallback while clip coverage is incomplete.
- Ship roster in order of completeness: Camus -> Diogenes -> Machiavelli -> Leibniz.

## PR Plan

### PR-1: Runtime Scaffolding
- Add sprite runtime modules (`sprite-assets`, `animation-player`, `sprite-renderer`, `character-anim-map`).
- Add manifest schema and fallback path.

Acceptance:
- Static frame renders for any fighter via manifest.

### PR-2: Multi-Character Intake Pipeline
- Add intake folders:
  - `public/assets/sprites/camus/source/`
  - `public/assets/sprites/diogenes/source/`
  - `public/assets/sprites/machiavelli/source/`
  - `public/assets/sprites/leibniz/source/`
- Add split-frame folders (`frames/`) and per-character metadata templates.

Acceptance:
- All 4 characters have 16 indexed frames + metadata stubs.

### PR-3: Camus Integration
- Build Camus atlas/clips from 16 frames.
- Map states and attack phase timings.

Acceptance:
- Camus fully playable in sprite mode.

### PR-4: Diogenes Integration + Command Specials
- Build Diogenes clips.
- Explicitly bind command-special visuals:
  - block+left+attack -> energy blast clip chain
  - block+right+attack -> boulder roll clip chain

Acceptance:
- Command-specials visually distinct and synced.

### PR-5: Machiavelli + Leibniz Integration
- Build both atlases and clip maps.
- Normalize run, jump, attack readability.

Acceptance:
- Full roster playable with sprite path in core combat states.

### PR-6: Debug + QA Hardening
- Add overlay toggles (state/clip/frame/pivot/hitboxes).
- Add mapping validation tests and missing-clip fallback tests.

Acceptance:
- Test suite green and no runtime crash on missing sprite entries.

## Task Checklist (Actionable)

1. Create `sprite-manifest.schema.json`.
2. Build frame-split script or manual import checklist.
3. Split all four sheets into 16 files each.
4. Add per-character `frame_labels.json` (index -> motion).
5. Add pivot authoring values per frame.
6. Implement atlas loader + cache.
7. Implement animation player + clip timing controls.
8. Implement state->clip map with startup/active/recovery remap.
9. Integrate Camus, then Diogenes, then Machiavelli, then Leibniz.
10. Add command-special clip routing for Diogenes.
11. Add debug overlay and visual QA checklist run.
12. Add automated mapping/fallback tests.

## If You Want Faster Execution

Best input from you next:
- Per-character table: `f00..f15 -> intended motion name`.

If you don’t provide that, I can infer a first pass and mark uncertain mappings for review.
