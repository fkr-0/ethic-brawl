# Changelog

All notable changes to Ethic Brawl are documented here.

## [1.8.0] - Planned

- Add physical-device and sustained-session evidence before considering a native-renderer default change.

## [1.7.5] - Unreleased

### Added

- Added a deterministic 512×512 Ethic Brawl desktop icon using the game's established cyan/magenta terminal palette, plus a reproducibility check so packaged Linux builds cannot silently drift from the tracked icon source.

### Changed

- Electron/AppImage Linux packaging now uses the project-owned Ethic Brawl icon instead of Electron's default application icon.

## [1.7.4] - 2026-08-20

### Added

- Added an experimental Electron desktop shell with `desktop:dev`, unpacked Linux packaging, and AppImage export commands.
- Added tag-triggered and manually dispatchable GitHub AppImage release automation that checks out the exact annotated tag, validates release/runtime metadata, builds without electron-builder implicit publishing, smoke-checks and hashes the AppImage, retains it as a workflow artifact, and attaches it to the matching GitHub Release.
- Added a release-workflow contract test covering immutable tag checkout, explicit publication boundaries, AppImage smoke validation, checksum generation, workflow artifact retention, and GitHub Release upload.
- Added a restricted `arcade://` production bundle protocol, CSP, renderer permission denial, sandbox/context-isolation defaults, and navigation/window guards.
- Added PixiJS's bundled strict-CSP fallback loader for the opt-in native renderer, keeping `script-src 'self'` without permitting `'unsafe-eval'`.
- Pinned electron-builder's static AppImage toolset `1.0.3` so the Linux package does not depend on the legacy FUSE2 runtime.
- Added an executable Runtime-consumption audit that verifies vendored hashes, official capability aliases, source import policy, and a shrinking allowlist of unavoidable Runtime 1.12 root exports.
- Added Runtime-backed transient notices for renderer fallback, settings/keybinding saves, sprite controls, chroma-key state, and frame-boundary debugging, including browser-observable notice state.
- Added a legacy-compatible Runtime versioned-store adapter that upgrades existing raw settings JSON in place while preserving the original payload as the Runtime backup.

### Changed

- Completed the migration away from `@arcade/runtime` root imports: animation, Pixi, tooling, gameplay, testing, and core dependencies now resolve through their official Runtime 1.12 capability subpaths, and the Runtime-consumption audit rejects any future root-import regression.
- Promoted the Runtime 1.12 sprite projection to a first-class `runtimeManifest`/`runtimeSheet` on every character animation map instead of using it only as a construction-time assertion.
- Added roster-wide verification that Runtime frame resolution reproduces every legacy clip frame index exactly while the mixed-resolution authored atlas remains renderer-owned until it is deliberately repacked.
- Special-move energy payment, cooldown start/step, and queue semantics now use Runtime 1.12 gameplay-action state; the duplicate combat-intent energy spend path is removed.
- Start-menu, settings-row, and character-select movement now delegate to Runtime's stateful grid-focus navigator while retaining integer focus mirrors for rendering and E2E observability.
- Settings persistence now stores the existing Ethic settings schema inside Runtime's checksummed versioned envelope with backup/corruption recovery semantics.
- Sprite-manifest projection now validates local frame timing, duplicate mappings, pivots, frame indices, and dangling references before Runtime normalization, explicitly marking lossy variable-timing projection.
- Bumped the package version to 1.7.4.

### Fixed

- Hardened browser release certification around transient combat input, character-select navigation, and locomotion sampling by polling observable simulation state and normalizing movement by authoritative frame progression instead of assuming fixed wall-clock delivery.
- Split renderer upload certification into cumulative diagnostics and a per-frame steady-state signal: context restoration may legitimately recreate GPU textures, while release E2E now requires the settled renderer to return to zero current-frame upload traffic in both Chromium and Firefox.

## [1.7.3] - 2026-08-19

### Changed

- Runtime consumption now uses capability-oriented `@arcade/runtime/*` imports for core, Pixi, sprites, UI, gameplay, stages, and testing APIs while retaining root imports only for Runtime 1.12 symbols that are not exposed by a capability subpath.
- Every authored character sprite manifest is projected into the renderer-neutral Runtime schema and passed through `normalizeArcadeSpriteManifest()` before use, with local clip-reference validation preventing mapping drift.
- AI Showcase title fitting now delegates to the Runtime 1.12 measured-text primitive instead of maintaining a local `measureText()` shrink loop.
- Combat now accepts authored air attacks, buffers late normal inputs, permits confirmed recovery cancels into the next normal or a special, and settles grounded locomotion during committed strikes.
- Canvas and optional Pixi rendering now synchronize attack poses to simulation phase progress, use authored airborne attack clips when available, and shorten attack-phase crossfades for more fluid motion.

### Fixed

- Hitstop no longer creates new melee contacts while the simulation is frozen.
- Authored attacks without explicit hitbox metadata now use type- and range-aware fallback geometry instead of collapsing to the light-jab hitbox.

## [1.7.2] - Release candidate

### Added

- Semantic device-aware command bars across the arcade shell, replacing keyboard-only footer prose while preserving the game's doctrinal verbs and neon terminal identity.
- Measured text fitting and bounded wrapping through Arcade Runtime 1.12.0.
- Browser evidence for a persisted custom keybinding appearing in the live help overlay.
- A runtime-derived catalog covering 298 fighter, enemy, item-overlay, body-pose, and icon assets.
- Deterministic one-job-per-file corpora containing 270 fighter jobs and 30 item/body-pose jobs with exact geometry and provenance.
- Machine-readable sprite audit evidence, a labeled contact sheet, and the searchable Sprite Signal Deck review interface.
- Project-local OpenCode auditors for independent runtime, prompt, pipeline, and review-UX sweeps.
- A declarative settings model that owns tab order, row counts, labels, descriptions, values, and activation behavior from one source of truth.
- Versioned and runtime-validated settings persistence with backward-compatible loading of legacy payloads.
- Renderer-neutral accessibility controls for impact motion and combat flashes across Canvas and the retained Pixi bridge.
- Three AI spectator densities: minimal broadcast, tactical intent, and a deliberately strange laboratory feed with action, attack, chain, and energy telemetry.
- Browser coverage for navigating, persisting, restoring, and applying accessibility and spectator preferences through the real game shell.
- A lazy native-renderer loader with disabled, ready, failed, and destroyed diagnostics plus safe Canvas fallback.
- Manifest-driven production bundle budgets and Chromium/Firefox network tests proving that Canvas mode fetches no Pixi assets.
- A tracked 1254×1254 RGB render-source normalization contract that converts border-sampled chroma-key source grids into exact 1024×1024 RGBA runtime sheets.

### Changed

- The help overlay now renders the active player binding profiles instead of static default bindings.
- Start, settings, roster and results screens describe commands as actions that can resolve to keyboard, gamepad, pointer or touch labels.
- Migrated the vendored Arcade Runtime to 1.12.0.
- Sprite packaging now projects runtime-declared files from the canonical `assets/sprites` tree instead of relying on ignored `public/` copies.
- Normal and stage matches load only their selected matchup; exhaustive full-roster loading is an explicit review operation.
- Animation v2 locomotion clips now use the intended continuous transition cadence.
- Rebuilt the settings screen around reusable arcade tabs and setting-row primitives with clearer hierarchy, explanatory copy, and stronger focus states.
- Fight presentation policy is now configured independently from combat simulation, preserving deterministic gameplay while allowing sensory output to be scaled or disabled.
- The Pixi implementation is now a true dynamic capability instead of being re-exported through the general render barrel.
- Narrow Pixi imports and native ownership reduce the optional renderer's primary chunk from roughly 851 kB to 314 kB while removing the previous >500 kB build warning.

### Fixed

- Removed character-count truncation from shared screen copy so layout follows actual font metrics and Unicode code points.
- Corrected shared chip auto-sizing and dynamic focus replacement behavior through the Runtime upgrade.
- Eliminated the source/public split that caused 112 fighter sprite 404s despite existing artwork.
- Concurrent requests for the same fighter atlas now share one in-flight load.
- Settings navigation and rendering can no longer drift through duplicated hard-coded row counts.
- Malformed localStorage enum values are ignored instead of being trusted as application state.
- The default page no longer preloads the opt-in Pixi runtime.
- Bridge initialization failures no longer abort the entire game startup.
- Legacy roster audit geometry now mirrors the runtime loader: 384/512 square sheets are accepted and 512×N legacy sheets are audited after the same bottom-crop normalization used at runtime, eliminating false release errors without weakening Animation-v2's strict 1024×1024 contract.
- Playwright now allows a 60-second production-server startup window, avoiding false failures under temporary build contention.
- Renderer lifecycle tests now classify failed response URLs directly instead of treating Chromium's URL-free duplicate 404 messages as renderer regressions; dedicated sprite tests remain responsible for roster-asset completeness.

## [1.7.1] - 2026-07-23

### Added

- Deterministic tactical AI decisions for direct pursuit, dash approaches, lane alignment, circling, jump-ins, retreat feints, rapid block/evasion reactions, and directional command-special rotation.
- Roster-wide unit certification that every coded fighter cycles its complete authored normal chain and that all eight directional command slots are exercised.
- Chromium and Firefox browser coverage for natural AI-vs-AI rounds, enforcing a 7–17 second duration window while observing movement, lane changes, normal attacks, combos, and command specials.
- Browser diagnostics for current AI actions, active attacks, chain progress, round timing, winners, and maximum combos.

### Changed

- AI Showcase now uses a dedicated 15-second sprint rule set with increased durability, preventing one-hit specials while keeping roster-review rounds compact.
- Medium and hard AI profiles make shorter, more decisive tactical choices and use seeded variation instead of non-reproducible per-frame randomness.

### Fixed

- The AI Showcase matchup title no longer overlaps the fight timer, health bars, or special meters; it now occupies a separate lower HUD band and shrinks safely for long fighter names.
- Computer fighters now re-press attacks when recovery ends, allowing complete character-specific normal chains instead of stalling after a single random attack edge.
- AI fighters now close horizontal and lane distance deliberately rather than drifting off target during long random actions.
- Repository lint now leaves generated Animation v2 action/atlas metadata to the dedicated release-asset gate instead of demanding unrelated formatter rewrites.
- The release workflow no longer calls the removed Animation v2 prompt generator after prompt jobs were intentionally moved outside the tracked release checkout.

## [1.7.0] - 2026-07-21

### Added

- AI-vs-AI showcase mode with the full coded fighter roster, independent difficulty-configured controllers, animation-review labeling, and quick rematches.
- Browser coverage for selecting Nietzsche and confirming that both computer-controlled fighters move and animate.
- Border-sampled dark-edge/background-aware cleanup for generated sprite sheets with opaque black, light paper, or transparent dark-residue backgrounds.

### Changed

- Nietzsche locomotion and action sheets now use explicit background cleanup policies recorded in their generated manifests.
- Release metadata now targets the 1.7.0 minor train, with 1.7.1 and 1.8.0 reserved for the next patch and minor tracks.

### Fixed

- Opaque black edges and dark RGB residue no longer survive Nietzsche atlas normalization, while disconnected black line art remains protected.
- Deferred sprite texture creation is now classified as GPU upload traffic rather than per-frame CPU allocation, preventing false Firefox hardware-budget failures.

## [1.6.0] - 2026-07-21

### Added

- Cached browser resource-size accounting instead of rescanning every resource entry on every rendered frame.
- Retained native Pixi ownership for procedural scenery, arena geometry, fighter actors, special projectiles, combat screen feedback and fight HUD presentation.
- Chromium and Firefox lifecycle certification for resize, pause/resume, synthetic context loss/restoration, sustained memory sampling, zero-upload enforcement and teardown.
- Semantic plus image-statistics Canvas/native visual-parity certification.
- Release-train and cross-repository Runtime provenance checks.

### Changed

- Removed the final full-frame Canvas-to-texture stage upload; remaining Canvas work is limited to direct authored telegraph and transient-effect overlays.
- Split the former 1.2 MB main bundle into a 78.82 kB initial chunk plus Runtime, fighter-content, campaign, items and lazy Pixi chunks.
- Migrated to Arcade Runtime 1.10.0 and removed consumer-local API-level-1 version aliases.

### Fixed

- Release CI now installs and executes Firefox instead of declaring a Firefox project while provisioning Chromium only.
- Release validation prevents package and vendored-Runtime versions from drifting.

## [1.5.1] - 2026-07-19

### Added

- A fine-grained fighter-animation prompt pack covering eight-frame idle, forward and backward walking, run acceleration/loop/braking, jump/landing recovery, lane shifts, crouch, and guard transitions.
- A proposed animation-v2 atlas manifest and visual acceptance checklist for generated sheets.
- Unit coverage for locomotion cadence, same-clip phase preservation, and bounded playback smoothing.

### Changed

- Upgraded the formatter, linter, and import organizer from Biome 1.9 to Biome 2.5.4 with a migrated v2 configuration; import organization is available explicitly through `pnpm imports:fix` rather than rewriting unrelated files during every lint run.
- Slowed the authored four-frame idle and locomotion clips to more readable base durations.
- Walking and running now share a continuous clip phase instead of restarting at frame zero when the gameplay state changes.
- Playback speed now approaches its target gradually and is bounded to a lower locomotion cadence.
- Adjacent poses use a broader cross-dissolve, and idle/run clip transitions settle over seven render frames.
- Procedural locomotion bob and limb cycles now match the slower sprite cadence.

### Fixed

- The production browser-test server now uses a project-specific port, preventing parallel Artifact Lab Playwright jobs from taking over Ethic Brawl's E2E listener.

## [1.5.0] - 2026-07-19

### Added

- A composite shared-runtime stage bridge with independently profiled background and arena canvas passes.
- Shared arcade-core primitives for the fixed-step loop, keyboard/input lifecycle, scene management, movement approach, acceleration, AABB collision, and one-way platforms.
- Shared-runtime contract, checksum, and lifecycle tests covering both core and Pixi adapters.
- Browser coverage for square and ultrawide viewport scaling while preserving aligned 16:9 Canvas and Pixi surfaces.

### Changed

- The vendored Pixi runtime is updated to 0.7.0 with animation clocks, async profiling, context state, pass invalidation, and expanded telemetry.
- Thrown items, fighter movement, gravity, air control, and stage collision now delegate stable math to the shared arcade core.
- The game fills the available viewport using dynamic viewport units while preserving native 960 × 540 simulation coordinates.
- Renderer review and release checks now cover the composite runtime and its generated metadata.

### Fixed

- Canvas and bridge surfaces remain pixel-aligned across square, landscape, ultrawide, and embedded viewport sizes.
- Input, loop, and scene teardown now share consistent cleanup semantics instead of maintaining parallel lifecycle implementations.
- Platform landings and collision checks use the same validated primitives as the rest of the arcade runtime.

## [1.4.0] - 2026-07-19

### Added

- An opt-in PixiJS bridge that mirrors the deterministic Canvas fight presentation through the shared arcade runtime.
- Dedicated background, stage, fighter, projectile, effects, and foreground render passes with reusable runtime objects.
- Browser performance comparison between the established Canvas renderer and the bridge path.
- Unit contracts for bridge initialization, render-plan ordering, projectile routing, and renderer lifecycle.

### Changed

- Fight presentation now emits bridge-ready positional and combat-effect data without coupling simulation state to PixiJS.
- Renderer selection can be exercised through direct-launch parameters while Canvas remains the safe default.
- Shared runtime metadata and dependencies are pinned for reproducible builds.

### Fixed

- Bridge activation and scene changes now preserve the existing deterministic combat timeline and E2E probes.
- Runtime teardown no longer leaves bridge display objects or frame state attached between scenes.

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

