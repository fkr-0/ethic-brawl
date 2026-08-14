# Immanuel Kant sprite outputs

Generated sheets from `../prompts.yml` should be saved here:

- `kant_grid01_movement.png`
- `kant_grid02_fighting.png`
- `kant_grid03_throws_consumes_swings.png`
- `kant_grid04_specials.png`

Source status: hand-curated Animation v2 locomotion/defense plus legacy combat fallback

## Animation v2 runtime intake

Six candidate render sheets are stored in
`docs/prompts/fighter-animation-v2/render-jobs/kant/`. The approved frame
selection, rejected alternate, and root-alignment offsets are recorded in
`characters/kant/animation-v2.atlas.json`.

Build and validate the normalized runtime sheets with:

    npm run assets:kant-v2
    npm run assets:kant-v2:check

The resulting 80 authored frames cover idle/turn, forward/backward walking,
run start/loop/stop, jump/landing/recovery, lane shifts, crouch, and guard.
The existing core and extended sheets remain appended for attacks, specials,
hit reactions, knockdown/get-up, and victory.
