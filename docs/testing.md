# Ethic Brawl Testing and Release Verification

## Daily development checks

```bash
pnpm test:run
pnpm typecheck
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
pnpm release:check
```

`pnpm release:check` runs the automated release gate in order: lint, typecheck, unit tests, and production build. It intentionally does not replace manual browser smoke testing.

## Manual browser smoke test

1. Run `pnpm build`.
2. Run `pnpm preview`.
3. Open the preview URL.
4. Verify the title/start screen appears.
5. Enter a local match and confirm movement, attack, block, jump, lane-change, special input, round end, and results flow are usable.
6. Record the browser, OS, commit SHA, and any release notes before tagging.
