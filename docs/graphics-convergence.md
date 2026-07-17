# Ethic Brawl / Badger Sprawl Runner Graphics Convergence

## Current renderer status

Ethic Brawl and Badger Sprawl Runner currently use custom Canvas2D renderers. PixiJS is not installed in either project.

That is intentional for this pass. Adding PixiJS only to Ethic Brawl would split two related game projects across different rendering models without yet solving a concrete bottleneck. A Canvas2D context and a Pixi WebGL/WebGPU context also cannot share the same canvas, so a partial migration would require a second canvas or duplicated scene composition.

Ethic Brawl now exposes renderer-neutral fight-presentation data through `src/render/fight-presentation.ts`. The current backend remains `canvas2d`, while presentation selection, stage profiles, telegraph calculations, and screen-feedback calculations are separated from the drawing entry point.

## Concepts adopted from Badger Sprawl Runner

The pass reuses the strongest ideas from Badger's graphics code without creating a fragile cross-repository runtime dependency:

- Multi-speed, repeatable parallax layers inspired by `apps/runner/src/renderer/ParallaxLayer.ts`.
- Stage-specific palettes and layered skyline silhouettes inspired by Badger's `Renderer.renderStageParallax` flow.
- Clear attack wind-up rings inspired by Badger enemy and boss telegraphs.
- Radial low-health and damage feedback inspired by `UIRenderer.renderScreenFeedback`.
- Large, deliberately theatrical stage placards inspired by `TitleCardRenderer`, now using the actual player and enemy sprites.
- E2E-visible renderer/profile metadata, following Badger's extensive runtime test-harness approach.
- One fixed-capacity combat VFX pool inspired by Badger's `VFXPool`, replacing the former per-impact particle-system allocation path.
- Encounter-specific foreground motifs: market awnings, archive columns and scanner light, and gate braziers with crowd silhouettes.
- Per-profile atmospheric motion and parallax tuning: market streamers, archive data rain, gate embers, and neon rain.
- Combat-synchronized multi-frame sprite phases, adaptive locomotion playback, shadows, squash/stretch, recoil, hit flashes, and pooled afterimages.
- Eight attack choreography families derived from the authored attack-presentation presets instead of one generic attack pose.
- Data-driven Stage combat modes that reuse the existing two-fighter engine while changing timer, durability, opening conviction, and special readiness.

The implementations are original to Ethic Brawl and use its own fighter, lane, sprite, camera, and stage data.

## Why there is no direct package dependency

Ethic Brawl and Badger Sprawl Runner are separate nested repositories. Ethic Brawl's CI checkout cannot assume that the sibling Badger repository exists. Importing Badger source or a `file:../badger-sprawl-runner/...` dependency would therefore make clean CI and standalone development fail.

The safe convergence path is:

1. Keep a small renderer-neutral presentation contract in both projects.
2. Stabilize the shared concepts through tests.
3. Move the contract into a separately versioned package only when both repositories can consume it through a normal package dependency.

## PixiJS migration seam

A future PixiJS v8 renderer should replace the complete drawing backend rather than layer Pixi on top of the current canvas. The intended shape is:

1. Keep fight simulation, input, AI, stage progression, and `FightPresentationOptions` unchanged.
2. Create a Pixi `Application` with `autoStart: false` so the existing fixed-timestep game loop remains authoritative.
3. Translate each `FightGraphicsProfile` into persistent Containers, Graphics, Text, Sprites, and TilingSprites.
4. Convert existing sprite atlases to Pixi textures without changing the sprite contracts.
5. Render telegraphs, particles, and screen feedback as scene objects or filters.
6. Run the same production-mounted E2E route against both backends during migration.

Pixi becomes worthwhile when one of these is true:

- authored multi-layer stage art replaces most procedural Canvas drawing;
- particle counts or post-processing exceed comfortable Canvas2D limits;
- many independently transformed objects need scene-graph culling and batching;
- both Ethic Brawl and Badger Sprawl Runner are ready to adopt the same backend.

Until then, the current Canvas2D path is smaller, deterministic, tested, and shared in spirit with Badger's renderer.
