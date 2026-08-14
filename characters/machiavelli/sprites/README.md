# Machiavelli sprites

Machiavelli uses the manually curated Animation v2 atlas described by
`../animation-v2.atlas.json`. The reviewed render jobs live under
`../../../docs/prompts/fighter-animation-v2/render-jobs/machiavelli/machiavelli/`
and are normalized into:

- `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_idle_turn_4x4.png`
- `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_walk_forward_backward_4x4.png`
- `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_run_start_loop_stop_4x4.png`
- `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_jump_land_recovery_4x4.png`
- `assets/sprites/roster/machiavelli/source/animation-v2/machiavelli_lane_guard_crouch_4x4.png`

Build or validate the curated sheets with:

    pnpm assets:machiavelli-v2
    pnpm assets:machiavelli-v2:check

The authored 80-frame bank supplies idle, turning, locomotion, jumping, lane
movement, crouching, and guarding. The existing 32 legacy core and extended
frames remain appended for attacks, specials, damage, knockdown, recovery, and
victory until dedicated combat renders are curated. The reviewed green-screen
mixed sheet is intentionally excluded from the locomotion bank because it
contains combat and knockdown poses rather than replacements for the five
Animation v2 movement sheets.
