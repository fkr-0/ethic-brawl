# Ethic Brawl Testing and Release Verification

## Daily development checks

```bash
pnpm test:run
pnpm typecheck
pnpm test:e2e
```

## Focused checks

```bash
pnpm test:single tests/unit/release-readiness.test.ts
pnpm test:simulation
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

`pnpm release:check` runs the automated release gate in order: lint, typecheck, unit tests, production build, and the Chromium Stage 1 E2E slice.

The Stage 1 browser test builds a production bundle and serves it below `/ethic-brawl/`, matching the artifacts-hub deployment layout. It verifies that relative bundle and sprite URLs resolve, all 18 coded character sprite atlases load, vertical and horizontal roster navigation work, the renderer reports the Canvas2D backend and correct Babylon graphics profile, the opponent AI advances and escalates from easy to medium to hard, real keyboard movement and attack input damage an opponent, and the pooled VFX runtime emits without recycling under the tested combat load. It also verifies the Market Procession, Archive Lockdown, and Gate Judgment rule IDs, their 99/84/72-second clocks, encounter durability and conviction differences, defeat/retry behavior, all three encounter transitions, and the complete trial/upgrade/results route.

## Manual browser smoke test

1. Run `pnpm build`.
2. Run `pnpm preview`.
3. Open the preview URL.
4. Verify the title/start screen appears.
5. Enter a local match and confirm movement, attack, block, jump, lane-change, special input, round end, and results flow are usable.
6. Confirm each Babylon wave has a visibly different palette/profile, atmosphere, foreground, and parallax cadence; verify that startup telegraphs, impact vignette, and placard portraits remain readable.
7. Confirm light, medium, heavy, and special sprite attacks visibly follow startup/active/recovery timing, with no frame popping when attacks chain or a new fight begins.
8. Record the browser, OS, commit SHA, and any release notes before tagging.
