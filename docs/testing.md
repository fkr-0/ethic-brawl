# Ethic Brawl Testing and Release Verification

## Daily development checks

```bash
pnpm test:run
pnpm typecheck
pnpm test:e2e
pnpm test:e2e:sprites
```

## Focused checks

```bash
pnpm test:single tests/unit/release-readiness.test.ts
pnpm test:simulation
pnpm test:e2e:sprites
```

## Full local release gate

Run the complete local gate before tagging or shipping a major release:

```bash
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build
pnpm test:e2e
pnpm release:check
```

`pnpm release:check` runs the automated release gate in order: lint, typecheck, unit tests, production build, and all three Chromium E2E specifications.

The Stage 1 browser test builds a production bundle and serves it below `/ethic-brawl/`, matching the artifacts-hub deployment layout. It verifies that relative bundle and sprite URLs resolve, all 18 coded character sprite atlases load, vertical and horizontal roster navigation work, the renderer reports the Canvas2D backend and correct Babylon graphics profile, the opponent AI advances and escalates from easy to medium to hard, real keyboard movement and attack input damage an opponent, and the pooled VFX runtime emits without recycling under the tested combat load. It also verifies the Market Procession, Archive Lockdown, and Gate Judgment rule IDs, their 99/84/72-second clocks, encounter durability and conviction differences, defeat/retry behavior, all three encounter transitions, and the complete trial/upgrade/results route.

The focused sprite-animation E2E specification audits the actual post-keyed browser pixels for all 448 atlas frames and requires a readable normalized middle-lane fighter scale. It rejects blank frames, invalid atlas bounds, invalid clip references, and retained full-cell backgrounds. It then selects Foucault through the real character-select UI and validates multi-frame idle cycling, monotonic keyboard locomotion, interpolation blends, facing-relative anticipation and active lunges, motion trails, light attack startup/active/recovery clips, special animation phases, synchronized jump and three-pose landing clips, lane-dependent scale, combat-reactive stage impact telemetry, a real hitstun reaction, and a clean animation-cache reset in a second match.

Stage presentation tests verify that all four deterministic signature events cycle through idle, warning, active, and release phases with bounded intensity. The Stage 1 browser route confirms the Market Caravan, Archive Scan, and Gate Heat Wave identities remain attached to the correct encounters.

Shared-runtime tests verify deterministic system/pass execution, context-loss restoration, synchronous and asynchronous profiling, invalidatable Canvas texture passes, ordered Pixi descriptors, composite stage bridging, declaration compatibility, metadata versioning, and SHA-256 hashes for both vendored runtime files.

The renderer-bridge browser route runs the same fight in Canvas-only and opt-in Pixi bridge modes. It requires a successful lazy Pixi initialization, one active `stage-canvas` pass, a ready context, at least 90 measured frames per mode, and a bounded bridge p95 cost. This comparison is diagnostic evidence; Canvas2D remains the release baseline until native fighter, projectile, and VFX passes reach parity.

## Manual browser smoke test

1. Run `pnpm build`.
2. Run `pnpm preview`.
3. Open the preview URL.
4. Verify the title/start screen appears.
5. Enter a local match and confirm movement, attack, block, jump, lane-change, special input, round end, and results flow are usable.
6. Confirm each Babylon wave has a visibly different palette/profile, atmosphere, foreground, and parallax cadence; verify that startup telegraphs, impact vignette, and placard portraits remain readable.
7. Confirm light, medium, heavy, and special sprite attacks visibly follow startup/active/recovery timing, with no frame popping when attacks chain or a new fight begins.
8. Record the browser, OS, commit SHA, and any release notes before tagging.
