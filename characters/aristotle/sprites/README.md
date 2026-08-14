# Aristotle sprite outputs

## Animation v2

Aristotle's reviewed locomotion and defensive animation bank is generated from the render-job sources in:

```text
docs/prompts/fighter-animation-v2/render-jobs/aristotle/aristotle/
```

The manual frame map is:

```text
characters/aristotle/animation-v2.atlas.json
```

Generated source and browser assets:

```text
assets/sprites/roster/aristotle/source/animation-v2/
public/assets/sprites/roster/aristotle/source/animation-v2/
```

The authored bank contains five normalized 4×4 RGBA sheets, for 80 frames total:

- idle and turning
- forward and backward walking
- run start, loop, and stop
- takeoff, airborne motion, landing, and recovery
- lane movement, crouch, and guard

The runtime appends Aristotle's legacy core and extended sheets for attacks, specials, reactions, knockdown, recovery, and victory states that do not yet have dedicated Animation v2 renders.

### Curation notes

- Frame order, repeated poses, scaling, horizontal root position, and ground baselines are explicitly curated rather than inferred from source-cell placement.
- The alternate `walk2` render is retained as source material but intentionally excluded from the runtime atlas because its paper treatment and stance-heavy sequence do not form a cleaner gait.
- Incomplete run frames with clipped heads are excluded.
- Warm paper backgrounds in the run and jump sheets use polynomial background subtraction to preserve the pale robe, staff, skin tones, and contact shadows.

### Commands

```sh
pnpm assets:aristotle-v2
pnpm assets:aristotle-v2:check
```

## Legacy grid outputs

Older grid-generation references remain:

- `aristotle_grid01_movement.png`
- `aristotle_grid02_fighting.png`
- `aristotle_grid03_throws_consumes_swings.png`
- `aristotle_grid04_specials.png`
