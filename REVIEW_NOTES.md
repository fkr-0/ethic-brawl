# Review Notes

## What is solid
- Clear folder split between app/core/game/render/audio/content.
- TypeScript strictness is already good enough to let the project typecheck cleanly.
- Vite build pipeline is lightweight and fast.
- Several subsystems are reasonably pure and testable.

## Concrete issues found
1. Boot flow bug: the scene manager never entered the configured initial scene, so the later timed transition to `start` was invalid.
2. Event bus API fragility: `once()` depended on `this.on`, which breaks when methods are destructured.
3. Timing edge cases: zero-duration timers and single-frame counters produced `NaN` progress values.
4. Test harness gap: the repo shipped with a `tests/` directory and Vitest config, but no actual test files.
5. Lint debt remains large outside the touched surface area; this archive improves behavior and adds regression coverage, but does not fully clean the repo.

## Improvements included here
- Added explicit `sceneManager.start()` bootstrap step and wired main startup through it.
- Added regression tests for scene startup, event-bus `once()`, and timing edge cases.
- Hardened event listener cleanup and iteration behavior.
- Removed a few touched-file safety issues while preserving build output.

## Recommended next steps
- Add DOM-level integration tests around `bootstrap()` and the title-screen -> fight-screen flow.
- Extract scene definitions from `main.ts` into dedicated modules for testability.
- Add deterministic randomness/seed injection for campaign clue and trial generators.
- Do a dedicated lint-debt pass with behavior-preserving tests around combat/campaign subsystems first.
