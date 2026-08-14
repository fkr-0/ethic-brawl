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

## Combat and interaction continuity

- [ ] Every normal-attack row has distinct startup, active, follow-through, and recovery poses.
- [ ] Light, medium, and heavy normals differ clearly in commitment, reach, and recovery.
- [ ] The air attack remains airborne through its active phase and ends in a landing-ready pose.
- [ ] Forward dash, backdash, evade, and throw remain distinct from walk/run and from hit reactions.
- [ ] Throw frames contain only the caster motion, not an inconsistent second opponent body.
- [ ] Pickup, throw, use, and swing preserve item size, grip, and attachment between adjacent phases.
- [ ] Held guard, parry, guard break, and counter cannot be mistaken for one another.
- [ ] Light hit, heavy hit, knockdown, and get-up form continuous trajectories without teleporting limbs or props.
- [ ] Each special row follows the exact character-bible move order and reads as startup, active, impact/sustain, recovery.
- [ ] Intro, taunt, victory, and defeat return to reusable or stable endpoint poses where specified.

## Effect-sheet continuity

- [ ] Effect sheets contain no fighter body, opponent, scenery, labels, or readable symbols.
- [ ] Each special-effect row matches the palette and mechanic of the corresponding caster-special row.
- [ ] Telegraph/spawn, active/travel or sustain, impact peak, and dissipation are visibly distinct.
- [ ] Physical specials use appropriate dust, trail, shock, counter, or field effects instead of invented generic projectiles.
- [ ] Effect origin and scale remain stable, with no fragment or glow touching a cell boundary.

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
