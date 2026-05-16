# Ethic Brawl Character Rendering Pack

This directory condenses scattered character data into per-character datasheets, image-rendering prompt packs, sprite-output folders, and machine-readable sprite-grid manifests.

## Roster specialization

- `roster-specialization.yml`: current role/mechanic/MVP-command list for the near-term roster, including Camus, Machiavelli, Diogenes, Leibniz, Foucault, Deleuze/Guattari, Marx, Bakunin, Schmitt, Aristotle, Socrates, Kant, Kierkegaard, Stirner, Aquinas, Anselm, Hegel, and Nietzsche.
- `PROMPT_PACK_REVIEW.md`: review of prompt feasibility, design coverage, animation coverage, specials, biography, UI hooks, and known risks.

## Detailed character packs now present

Each detailed pack contains:

- `datasheet.yml`: biography, stats, visual language, palette, fighting behavior, UI details, normal moves, specials, sprite outputs.
- `prompts.yml`: four 4x4 prompt grids: movement, fighting, throw/consume/swing, specials.
- `sprite-grid-manifest.json`: machine-readable grid IDs, output filenames, and expanded clip groupings.
- `sprites/`: intended destination for generated sheets.

Detailed packs:

- `camus/`
- `machiavelli/`
- `aristotle/`
- `aquinas/`
- `anselm/`
- `hegel/`
- `nietzsche/`

## Grid convention

All grids are exact 4x4 sheets, 16 frames, left-to-right and top-to-bottom, transparent alpha, no gutters, no margins, no labels.

The old basic 16-frame sheet remains useful as Grid 00 / legacy reference, but these packs expand the playable animation vocabulary into:

1. `grid01_movement`: idle, hurt, walk, run, jump, running jump, KO.
2. `grid02_fighting`: basic attacks, running attacks, jumping attacks, evasion/block, win poses.
3. `grid03_throws_consumes_swings`: item throw, consume/use, swing, four character combo keyposes.
4. `grid04_specials`: four MVP specials, one row per special, four caster frames each.

## Source references

- Existing production source sheets for the first four runtime characters live under `public/assets/sprites/<character>/source/`.
- Existing roster placeholder source sheets for Aristotle, Aquinas, Anselm, and Hegel live under `assets/sprites/roster/<character>/source/`.
- Nietzsche has runtime stats/specials now, but remains source-art-light; no source sheet was found.
- Runtime stats and authored attacks for existing runtime characters are mirrored from `src/content/characters/character-data.ts` and `src/content/characters/character-loader.ts`.
- Special move data is now runtime-backed in `src/content/specials/special-data.ts` for all detailed packs listed above.
Additional spriteless/prompt-first packs:

- `foucault/`
- `deleuze_guattari/`
- `marx/`
- `bakunin/`
- `schmitt/`
- `socrates/`
- `kant/`
- `kierkegaard/`
- `stirner/`

