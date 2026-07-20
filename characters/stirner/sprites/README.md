# Max Stirner sprite outputs

Generated sheets from `../prompts.yml` should be saved here:

- `stirner_grid01_movement.png`
- `stirner_grid02_fighting.png`
- `stirner_grid03_throws_consumes_swings.png`
- `stirner_grid04_specials.png`

Source status: authored Animation v2 movement/defense plus legacy idle and combat fallback

## Animation v2 runtime intake

The rendered movement sheets in
`docs/prompts/fighter-animation-v2/render-jobs/stirner/` are normalized with:

    npm run assets:stirner-v2

The builder removes baked checkerboards from the RGB walk, run, and jump
renders and writes exact 1024×1024 RGBA grids to the source and public asset
trees. The supplied defense render is a 5×4 transparent sheet; each five-frame
row is reduced to four runtime frames by dropping its center in-between pose,
then repacked as the required 4×4 lane/crouch/guard sheet.

At runtime these 64 authored frames drive forward/backward walking, run
start/loop/stop, jump/landing/recovery, lane shifts, crouch, and guard. The
legacy core and extended sheets are appended for idle, attacks, specials, hit
reactions, knockdown/get-up, and victory until a conforming idle/turn render is
available.
