# Implementation Audit

Date: 2026-05-04

## Findings Status

1. Scene wiring gap (`stage-intro`, `trial`, `upgrade` not active): Fixed.
2. Results screen not data-driven from real fight outcomes: Fixed.
3. App shell too coupled in one large `main.ts`: Improved via submoduling; orchestrator now delegates screen rendering and app-shell types to dedicated modules.

## Refactor Summary

### Stability Improvements

- Added explicit live scene registrations for:
  - `stage-intro`
  - `trial`
  - `upgrade`
- Stabilized round progression in the app shell by advancing rounds after a short inter-round delay when a round winner exists and no match result is final yet.
- Added explicit fight-result routing:
  - Player 1 match win routes through `trial` -> `upgrade` path.
  - Other outcomes route to `results` directly.

### Modularity Improvements

- Moved app-shell render responsibilities out of `main.ts` into:
  - `src/ui/screens/app-shell-renderers.ts`
- Added dedicated app-shell types:
  - `src/app/app-shell/types.ts`
  - re-export at `src/app/app-shell/index.ts`
- Expanded fight runtime API surface for orchestration instead of state-peeking in `main.ts`:
  - `getResult()`
  - `hasRoundWinner()`
  - `startNextRound()`

### Results Integration

- Results screen now renders from real `FightResult` data (`winner`, `time`, `maxCombo`, `score`, `perfect`) instead of hardcoded placeholders.

## Submoduling Steps Applied

1. Isolated data contracts (`app-shell/types.ts`).
2. Isolated visual rendering (`ui/screens/app-shell-renderers.ts`).
3. Kept `main.ts` as orchestrator only (scene transitions + high-level runtime flow).
4. Extended runtime interface to expose orchestration-safe methods.
5. Re-verified typecheck and full tests.

## Remaining Optional Hardening

1. Split scene update logic into a dedicated `app-shell/scene-factory.ts` to further reduce `main.ts` complexity.
2. Add integration tests for scene flow:
   - `start -> character-select -> stage-intro -> fight -> trial/upgrade/results`.
3. Make `trial` and `upgrade` consume real campaign controller state rather than placeholder UI decisions.
