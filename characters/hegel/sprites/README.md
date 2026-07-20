# G.W.F. Hegel sprite outputs

Generated sheets from `../prompts.yml` should be saved here:

- `hegel_grid01_movement.png`
- `hegel_grid02_fighting.png`
- `hegel_grid03_throws_consumes_swings.png`
- `hegel_grid04_specials.png`

Source status: authored Animation v2 locomotion/defense plus legacy combat fallback sheets

## Animation v2 runtime intake

The five rendered locomotion/defense sheets in
`docs/prompts/fighter-animation-v2/render-jobs/hegel/` are normalized with:

    npm run assets:hegel-v2

The shared builder removes baked checkerboards from RGB renders, preserves the
transparent idle sheet, writes exact 1024×1024 RGBA grids to both the source
and public asset trees, and records source/output hashes in
`assets/sprites/roster/hegel/source/animation-v2/manifest.json`.

At runtime these 80 authored frames drive idle, walk, run, jump, landing,
lane-shift, crouch, and guard animation. The previous core/extended sheets are
appended only as combat fallbacks until dedicated attack render jobs exist.
