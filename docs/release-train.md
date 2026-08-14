# Ethic Brawl release train

Ethic Brawl 1.7.1 was prepared on 2026-07-23 against Arcade Runtime 1.10.0.

| Released | Next patch | Next minor |
|---:|---:|---:|
| 1.7.1 | 1.7.2 | 1.8.0 |

The next patch is restricted to correctness, AI-showcase tuning, asset consistency, and browser-isolation fixes. The next minor may incorporate physical-device and sustained-session evidence, but renderer defaults remain an explicit game-owned decision.

```sh
pnpm release:plan:check
pnpm prompts:v2:check
pnpm prompts:items:check
pnpm assets:audit
pnpm assets:check
pnpm build
pnpm bundle:check
pnpm release:check
```

The bundle gate treats the Pixi bridge as an optional capability. The default Canvas import graph must remain below 400 KiB and must not contain or preload native-renderer assets.

The sprite gate is intentionally fail-closed. `assets:audit` refreshes human- and machine-readable evidence; `assets:check` must remain red while any declared runtime asset is missing or structurally invalid. Prompt coverage does not waive that requirement.
