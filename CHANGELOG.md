# Changelog

All notable changes to Ethic Brawl are documented here.

## [1.3.2] - 2026-07-19

### Fixed

- The game surface now expands to the largest available 16:9 viewport area instead of remaining at a fixed 960×540 CSS size.
- Canvas2D and the optional Pixi bridge now share identical responsive dimensions, preserving exact layer alignment after browser resizes.
- Viewport sizing uses dynamic viewport units where available and prevents page scrolling or touch overscroll around the game.

## [1.3.1] - 2026-07-19

### Added

- `@arcade/pixi-runtime` v0.6 with deterministic pass execution, WebGL context-loss pause/resume, asynchronous profiling, and invalidatable Canvas texture passes.
- A lazy-loaded PixiJS 8.19 stage bridge enabled with `?renderer=bridge`.
- Browser telemetry for bridge request/fallback state, active runtime passes, context state, and Canvas/Pixi frame summaries.
- Direct runtime lifecycle tests plus a Canvas-versus-bridge browser performance route.
- `docs/arcade-pixi-runtime-review.md` with the migration verdict, closed findings, and native-pass roadmap.

### Changed

- Background and arena now share one composited `stage-canvas` upload in bridge mode instead of uploading two full-size textures per frame.
- The shared render-plan installer is generically typed, and checksum tests verify both the runtime module and declaration file.
- PixiJS is dynamically imported only when bridge mode is requested; the default Canvas2D bundle remains the correctness baseline.

### Fixed

- Render-pass `order` now governs update execution as well as Pixi z-order.
- Context loss no longer allows frames to continue against a lost renderer and restores the previous running state only after recovery.
- Failed Pixi initialization now records the cause and falls back to Canvas2D instead of aborting startup.
- Same-size Canvas texture resizes no longer reset and re-upload the backing canvas.

## [1.3.0] - 2026-07-19

### Added

- Combat-reactive stage choreography that derives crowd energy, lighting pulse, impact response, combo pressure, and low-health tension from deterministic fight state.
- A compact stage-event cue showing warning, active, and release phases without obscuring the fight HUD.
- Directional attack anticipation, active-frame lunges, recovery overshoot, deterministic hit jitter, and additive sprite motion trails.
- A verified `@arcade/pixi-runtime` v0.5 render plan, camera/profiler support, a dedicated projectile layer, checksum metadata, declarations, and ready-pass Canvas bridge installer for incremental Pixi migration.
- Browser and unit observability for action offsets, motion blur, impact pulse, crowd energy, stage lighting, and shared-runtime bridge order.

### Changed

- Market awnings, archive columns, gate braziers, and foreground crowds now react to stage-event intensity and combat momentum.
- Sprite shadows follow attack displacement so strong lunges remain grounded instead of visually sliding away from their contact point.
- Shared-runtime tests now verify vendored runtime hashes using repository-root paths across Node and Vite test environments.

### Fixed

- Added Node type declarations required by checksum and bridge-contract tests.
- Removed timing-fragile active-frame browser assertions while preserving deterministic motion validation.

## [1.2.0] - 2026-07-19

### Added

- Deterministic signature stage events for every arena profile: Neon Signal Surge, Bronze Caravan, Archive Index Sweep, and Brazier Verdict.
- Stage-specific arena flooring with market tracks, archive index tiles, gate cracks, perspective rays, and event-responsive lighting.
- Browser observability for stage-event ID, phase, and intensity.
- Unit coverage for jump, landing, turnaround, get-up, stage-event cycles, and grounded landing recovery.

### Changed

- Jump, fall, landing, knockdown, and get-up sprite clips now follow the deterministic combat timeline instead of free-running independently.
- Landing uses a three-pose airborne-to-impact-to-idle settle; extended knockdown and get-up clips now include readable transitions back to neutral.
- Turnarounds compress the fighter silhouette through the facing change and briefly crossfade the previous orientation.
- Airborne sprite tilt now follows vertical velocity, while rotation also incorporates authored torso twist.

### Fixed

- Falling fighters now return to a controllable grounded state when touching down. Previously the motor marked them grounded while leaving the logical state stuck at `falling`.

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

