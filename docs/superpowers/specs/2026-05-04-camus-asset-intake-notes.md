# Camus 4x4 Asset Intake Notes

Date: 2026-05-04
Source: User-provided image `[Image #1]`

## Intake Goal

Adopt this sheet as the first production sprite source for Camus vertical slice.

## Expected Processing Steps

1. Save source sheet into `public/assets/sprites/camus/source/`.
2. Slice into 16 frames preserving original pixel scale.
3. Record per-frame:
- filename
- frame rect
- pivot
- default duration
- candidate state tag
4. Build `camus.atlas.json` and `camus.clips.json`.

## Preliminary Frame Grouping (to validate in-engine)

- Row 1: idle/guard stance variants
- Row 2: run cycle
- Row 3: crouch/jump/air/landing variants
- Row 4: attack/special/pose variants

## Integration Constraints

- Maintain integer scaling.
- Do not anti-alias when resizing.
- Keep transparent background alpha clean (no halo pixels).

## Validation Checklist

- Facing flip produces clean silhouette.
- Ground contact does not foot-slide in run cycle.
- Attack key frames line up with gameplay hit windows.
- Idle loop reads naturally at gameplay zoom.
