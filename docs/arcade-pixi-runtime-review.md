# Arcade Pixi Runtime Review

## Verdict

`@arcade/pixi-runtime` v0.6 is suitable as Ethic Brawl's renderer-orchestration foundation. It now provides a deterministic render plan, lifecycle and context-loss handling, camera transforms, frame profiling, asset ownership, pass ownership, and an incremental Canvas-to-Pixi bridge.

It is not yet a reason to replace the authoritative Canvas2D renderer in one step. Ethic Brawl's fighter sprites, hit effects, projectiles, foreground, and HUD still share Canvas-specific drawing code and simulation-facing presentation state. Migrating those systems independently is safer than wrapping the complete existing canvas in one Pixi texture.

## Review findings closed in v0.6

- Pass `order` previously controlled Pixi container z-order but was ignored by update execution. Updates now run by ascending order, descending priority, then stable registration sequence.
- Context loss was counted but rendering continued and the previous running state was not restored. Lost contexts now pause work, suppress manual frames, and resume only when the runtime had been running before restoration.
- The profiler only measured synchronous callbacks. `measureAsync` now covers asynchronous initialization and asset work.
- Canvas texture passes uploaded every frame and resized even when dimensions were unchanged. Passes now support invalidation, conditional drawing, redraw/skip counters, and no-op same-size resize handling.
- Render-plan order and priority now reject non-finite values instead of allowing `NaN` to produce unstable sorting.
- Runtime declarations used broad `any` state for installed render plans. The installer is generic and both module and declaration hashes are verified.

## Ethic Brawl integration

The default renderer remains Canvas2D. Core fight rendering already uses the runtime camera transform, and the main loop uses the shared frame profiler.

`?renderer=bridge` dynamically imports PixiJS and enables a transparent Pixi canvas beneath the authoritative game canvas. Background and arena drawing are composited into one `stage-canvas` texture pass, reducing the bridge from two full-size uploads to one. Fighters, VFX, foreground, overlays, and HUD continue to render on the Canvas2D layer.

Bridge initialization is failure-safe. Unsupported or failed Pixi initialization records a failure reason and continues with Canvas2D instead of aborting the game. The browser probe reports requested/enabled state, context state, active passes, and Canvas/Pixi timing summaries.

## Migration path

1. Keep the Canvas2D path as the correctness reference and performance baseline.
2. Move projectiles to the dedicated native `projectiles` layer.
3. Move fighter atlas rendering to native Pixi sprites while preserving the existing deterministic animation snapshots.
4. Move pooled combat VFX to the native `effects` layer.
5. Split foreground and HUD only where profiling shows a benefit; static or text-heavy layers may remain Canvas texture passes.
6. Make the Pixi path the default only after visual parity, context-loss recovery, accessibility overlays, and browser p95 performance are validated on representative hardware.

## Release criteria for defaulting to Pixi

- No gameplay or visual-regression failures in the Canvas and bridge E2E routes.
- Native fighter, projectile, and VFX passes have deterministic lifecycle tests.
- Context-loss restoration returns to a playable fight without reloading.
- Bridge/native p95 frame cost stays within the documented release threshold.
- Canvas2D remains available as an explicit fallback until at least one stable release after default migration.
