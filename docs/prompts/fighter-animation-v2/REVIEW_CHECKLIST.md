# Fine-grained Animation Review Checklist

## Sheet geometry

- [ ] Exactly 4×4 cells and 16 poses.
- [ ] Image dimensions are divisible by four.
- [ ] No gutters, borders, labels, or accidental frame lines.
- [ ] Background alpha is truly transparent, not white, black, or checkerboard pixels.
- [ ] No opaque pixels leak across cell boundaries.

## Character continuity

- [ ] Face, hair, costume, props, proportions, palette, and outline remain stable.
- [ ] Character height varies only for authored squash, crouch, jump, or landing poses.
- [ ] Grounded feet share one baseline.
- [ ] Root/pelvis remains centered; no baked translation across frames.
- [ ] Secondary motion follows the body rather than changing randomly.

## Animation continuity

- [ ] Idle frames 8→1 cross-fade without a silhouette jump.
- [ ] Walk-forward frames 8→1 loop cleanly.
- [ ] Walk-backward frames 16→9 loop cleanly and do not look like a mirrored forward walk.
- [ ] Run-loop frames 12→5 loop cleanly.
- [ ] Acceleration frame 4 matches run-loop frame 5 in rhythm and height.
- [ ] Run-loop frame 12 flows into braking frame 13.
- [ ] Jump takeoff, apex, descent, contact, compression, and recovery are all distinct.
- [ ] No adjacent poses are duplicates.

## Gameplay readability

- [ ] Forward and backward intent is readable at 128-pixel character height.
- [ ] Contact and passing poses remain distinguishable after nearest-neighbor downscaling.
- [ ] Guard and crouch silhouettes do not resemble hitstun or knockdown.
- [ ] Lane shifts read as diagonal footwork, not teleporting or rotating the camera.
- [ ] No decorative effect obscures hands, feet, torso direction, or contact pose.

## Acceptance artifacts

- [ ] Store the untouched generation beside the approved cleaned sheet.
- [ ] Record model, prompt revision, seed/reference images, and manual edits.
- [ ] Produce a sliced-frame contact sheet at gameplay scale.
- [ ] Produce a looping preview GIF or video before runtime integration.
