# Mikhail Bakunin sprite outputs

Generated sheets from `../prompts.yml` should be saved here:

- `bakunin_grid01_movement.png`
- `bakunin_grid02_fighting.png`
- `bakunin_grid03_throws_consumes_swings.png`
- `bakunin_grid04_specials.png`

Source status: prompt-first with roster placeholder source sheet

## Animation v2 runtime intake

The five rendered locomotion/defense sheets in
`docs/prompts/fighter-animation-v2/render-jobs/bakunin/` are normalized with:

    npm run assets:bakunin-v2

The builder removes the baked checkerboard from RGB renders, preserves the
already-transparent idle sheet, writes exact 1024×1024 RGBA grids to both the
source and public asset trees, and records source/output hashes in
`assets/sprites/roster/bakunin/source/animation-v2/manifest.json`.

At runtime these 80 authored frames drive idle, walk, run, jump, landing,
lane-shift, crouch, and guard animation. The previous core/extended sheets are
appended only as combat fallbacks until dedicated attack render jobs exist.
