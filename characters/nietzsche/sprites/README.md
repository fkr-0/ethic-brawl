# Friedrich Nietzsche sprite outputs

Nietzsche now uses the manually curated Animation v2 atlas described by
`../animation-v2.atlas.json`. The five accepted render jobs live under
`../../../docs/prompts/fighter-animation-v2/render-jobs/nietzsche/nietzsche/`
and are normalized into:

- `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_idle_turn_4x4.png`
- `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_walk_forward_backward_4x4.png`
- `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_run_start_loop_stop_4x4.png`
- `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_jump_land_recovery_4x4.png`
- `assets/sprites/roster/nietzsche/source/animation-v2/nietzsche_lane_guard_crouch_4x4.png`

Build or validate the curated sheets with:

    pnpm assets:nietzsche-v2
    pnpm assets:nietzsche-v2:check

The authored 80-frame bank supplies idle, turning, locomotion, jumping, lane
movement, crouching, and guarding. Nietzsche currently has only a 16-frame
legacy core sheet, which remains appended for attacks, specials, damage,
knockdown, recovery, and victory until dedicated combat renders are available.
