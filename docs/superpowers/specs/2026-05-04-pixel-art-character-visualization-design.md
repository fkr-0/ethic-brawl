# Pixel-Art Character Visualization Design

Date: 2026-05-04
Project: Ethic Brawl

## 1. Objective

Deliver clean, production-quality pixel-art fighter visuals with sprite-based animation, replacing procedural silhouette rendering while preserving gameplay timing accuracy and performance.

Primary outcomes:
- Distinct, readable pixel-art depictions of Camus, Leibniz, Machiavelli, and Diogenes.
- State-synced sprite animation pipeline (idle/walk/run/jump/block/attacks/hitstun/special/KO).
- Command-special visual identity for Diogenes:
  - `block + left + attack` -> energy blast.
  - `block + right + attack` -> boulder roll.

## 2. Scope

In scope:
- Art direction/specification for pixel style and likeness cues.
- Sprite asset conventions and atlas pipeline.
- Engine-side sprite renderer and animation state mapping.
- Runtime debug overlays for state/frame/hitbox alignment.
- Incremental rollout via one-character vertical slice, then full roster.

Out of scope (initial phase):
- Skeletal 2D rigs (Spine/DragonBones).
- 3D models or 2.5D model rendering.
- Online netcode interpolation concerns.

## 3. Visual Design Principles

1. Readability first:
- Every key gameplay state must be visually obvious at arena camera distance.

2. Stylized likeness over realism:
- Historical cues via silhouette + props + face clusters (not photorealism).

3. Cohesive palette system:
- Shared global ramps + per-character accent ramps.

4. Pixel integrity:
- Integer scaling and pixel snapping to avoid blur/shimmer.

5. Strong anticipation and impact frames:
- Startup/active/recovery phases are visually distinct and timed to gameplay frames.

## 4. Technical Art Specification

### 4.1 Sprite Resolution and Framing

- Base frame size: `96x96` pixels per body frame (can expand to `128x128` for specials only).
- Ground pivot reference point required for each frame.
- Character draw origin anchored at feet contact point.

### 4.2 Asset Format

- Texture: `PNG` (no JPG).
- Atlas metadata: `JSON`.
- Naming convention:
  - `char_<id>__<state>__f<index>.png`
  - Example: `char_camus__idle__f00.png`

### 4.3 Required Animation Sets Per Character

Mandatory clips:
- `idle`
- `walk`
- `run`
- `jump_start`
- `jump_air`
- `fall`
- `land`
- `block`
- `hitstun`
- `attack_light_1`
- `attack_medium_1`
- `attack_heavy_1`
- `special_default`
- `knockdown`
- `getup`
- `victory`
- `defeat`

Diogenes extra clips:
- `special_command_energy_blast`
- `special_command_boulder_roll`

## 5. Engine Architecture Changes

## 5.1 New Modules

- `src/render/sprite/sprite-renderer.ts`
  - Draws atlas frames with pixel snap and optional flip.
- `src/render/sprite/animation-player.ts`
  - Handles clip playback, loop rules, frame stepping.
- `src/render/sprite/character-anim-map.ts`
  - Maps fighter runtime state + attack phase to clip keys.
- `src/render/sprite/sprite-assets.ts`
  - Loads atlas + sprite definitions.

## 5.2 Integration Points

- Current procedural body renderer in `src/render/renderer.ts` becomes fallback path.
- New sprite path is default when sprite assets exist.
- Keep combat logic untouched; visuals are consumer of state.

## 5.3 Timing Sync Rules

- Attack animation segmented by existing gameplay windows:
  - startup frames map to anticipation sub-frames.
  - active frames map to strike sub-frames.
  - recovery frames map to recoil/reset sub-frames.
- If clip length mismatches state window, use deterministic frame remapping.

## 6. State Mapping Contract

`Fighter state` -> `Sprite clip`
- idle -> idle
- walking -> walk
- running -> run
- jumping -> jump_start / jump_air (phase split)
- falling -> fall
- blocking -> block
- hitstun -> hitstun
- attacking -> attack_* clip chosen by current attack id/type
- special -> special_default or command-specific clips
- knockdown -> knockdown
- gettingUp -> getup
- victory -> victory
- defeat -> defeat

## 7. Tooling and Debug Requirements

Implement debug overlay toggles:
- Current fighter state
- Active animation clip
- Clip frame index
- Attack phase (startup/active/recovery)
- Hitbox/hurtbox outlines over sprite
- Ground pivot marker

Acceptance requirement: designers can identify any sync mismatch in a single test session.

## 8. Performance Requirements

- Target: stable 60 FPS on current dev hardware.
- Max draw calls minimized via atlas batching.
- Avoid per-frame image decoding or dynamic asset creation.
- Optional quality knobs:
  - disable afterimage on low-end
  - reduced VFX particle count

## 9. Delivery Plan (Milestones)

## M1: Style + Pipeline Foundation
Tasks:
1. Create pixel style bible doc and palette ramps.
2. Define sprite file naming and atlas schema.
3. Implement sprite loader and renderer foundation.

Acceptance criteria:
- One static sprite frame renders for each fighter with correct pivot and facing.

## M2: Vertical Slice (Camus)
Tasks:
1. Produce Camus core clips (idle/walk/run/jump/fall/block/hitstun/light-medium-heavy/special).
2. Implement animation state map.
3. Integrate timing sync with gameplay frame windows.

Acceptance criteria:
- Camus fully playable with sprite-only visuals and no procedural fallback needed.

## M3: Command-Special Visual Identity (Diogenes)
Tasks:
1. Add `special_command_energy_blast` clip.
2. Add `special_command_boulder_roll` clip.
3. Map command-input events to clip routing in special state.

Acceptance criteria:
- `block+left+attack` and `block+right+attack` each play distinct clip and align with active hit windows.

## M4: Full Roster Rollout
Tasks:
1. Produce remaining roster clips.
2. Add portrait/UI headshot assets.
3. Normalize palette consistency and readability pass.

Acceptance criteria:
- All roster characters satisfy state coverage and readability checklist.

## M5: Hardening + QA
Tasks:
1. Add missing-asset fallback behavior and warnings.
2. Add tests for state-to-clip mapping and frame bounds.
3. Build visual regression capture set for key states.

Acceptance criteria:
- No runtime crash on missing clip.
- All mapping tests pass.

## 10. Task Breakdown (Implementation-Ready)

1. Create `src/render/sprite/` module scaffolding.
2. Introduce sprite asset manifest schema.
3. Add atlas loading and caching utility.
4. Add animation player with deterministic tick.
5. Add fighter-state -> clip mapping utility.
6. Replace renderer fighter draw path with sprite renderer (fallback retained).
7. Add debug overlay toggles and diagnostics.
8. Create Camus vertical-slice assets and integrate.
9. Tune timings against combat startup/active/recovery windows.
10. Add Diogenes directional command-special clips + mappings.
11. Produce Leibniz/Machiavelli/Diogenes baseline locomotion and combat clips.
12. Add automated tests and manual QA checklist pass.

## 11. Risk Register

1. Art throughput bottleneck
- Mitigation: lock spec early, vertical-slice first, outsource/parallelize asset production.

2. Timing desync between combat and visuals
- Mitigation: deterministic frame remapping and debug overlays.

3. Pixel shimmer from camera movement
- Mitigation: pixel snapping and integer scaling policy.

4. Scope creep in animation count
- Mitigation: strict “must-have clip list” for first playable pass.

## 12. Definition of Done

Done when:
- All four characters render with sprite-based state animations.
- Core combat readability is improved versus current procedural silhouettes.
- Diogenes command-special visuals are distinct and synced.
- Tests pass and no performance regression beyond agreed budget.
