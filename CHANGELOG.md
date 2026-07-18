# Changelog

All notable changes to Ethic Brawl are documented here.

## [1.1.1] - 2026-07-18

### Changed

- Fighter sprites are normalized from the visible height of their idle poses, producing consistent readable sizing across 96 px, 128 px, and 136 px source cells.
- The authored presentation multiplier now defaults to `1.0`; F3/F4 adjust the normalized result between 60% and 150%.

### Fixed

- Deployed fighters no longer render at the legacy `0.4` raw scale, which reduced middle-lane characters to roughly 47–50 visible pixels and made sprite animation appear static.
- Runtime sprite lookup now accepts every playable character ID without retaining the obsolete four-character type assertion.
- Browser E2E now rejects a regression to undersized fighter rendering while continuing to validate idle, locomotion, attack, special, hitstun, and lane-depth animation.

## [1.1.0] - 2026-07-17

### Added

- Curated 13-fighter release roster with three authored normals and four command specials per fighter.
- Enhanced core sprite sheets for Stirner, Kierkegaard, and Deleuze & Guattari, plus extended 16-frame animation banks for every release fighter.
- Three four-row enemy atlases covering all 12 authored story archetypes.
- Two item-icon atlases covering all 31 catalog items.
- Selectable Babylon clear rewards with icon-backed trial and acquisition screens.
- Release asset validation and a deterministic enemy/item atlas builder.

### Changed

- Character select now shows the complete normal chain, command inputs, special names, stats, and fighter gimmick.
- Story Mode now clearly presents Babylon as the complete playable route and later stages as locked authored previews.
- Babylon encounter placards show enemy-archetype intel and distinct mode rules.
- Main menu, stage routing, results, and reward presentation use the shared arcade UI language.

### Fixed

- Character-selection state now indexes the curated release roster rather than the legacy 18-fighter development catalog.
- Every release fighter now resolves to an extended animation bank instead of silently falling back to a 16-frame core sheet.

