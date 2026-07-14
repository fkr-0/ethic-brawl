# Ethic Brawl v1.0 Release Todo

## Current release status

- Automated gate includes lint, typecheck, 75 unit tests, production build, and the Babylon Stage 1 Chromium E2E slice.
- Remaining blocker: manual browser/canvas validation and release packaging notes.
- Release rule: do not tag `v1.0.0` until every item in `Release-blocking manual validation` is checked.

## Automated release gate

- [x] Establish release verification gate
  - Added `tests/unit/release-readiness.test.ts` to keep release assets from disappearing.
- [x] Restore lint gate to green
  - Biome formatting/import-order issues are part of the required automated gate.
- [x] Document test and release commands
  - Added `docs/testing.md` with focused, full, and manual smoke-test commands.
- [x] Add CI release verification workflow
  - Added `.github/workflows/release-check.yml` for push, pull request, and manual verification.
- [x] Add a scripted local release check
  - Added `pnpm release:check` via `scripts/release-check.mjs`.
- [x] Complete the Babylon Stage 1 vertical slice
  - Added three sequential AI-driven encounters, stage/wave presentation, trial, upgrade, results, and return-to-menu routing.
- [x] Repair and validate the runtime sprite roster
  - Added missing Anselm, Aquinas, and Hegel sheets; wired available extended sheets; corrected legacy/roster frame mappings and non-even grid slicing.
- [x] Add browser E2E coverage
  - Chromium verifies all 18 sprite atlases, 2D roster navigation, real keyboard movement/attack damage, defeat/retry, escalating encounter AI, three encounter wins, and the complete Stage 1 route.
- [x] Improve the playable Stage 1 UX
  - Added live roster sprite previews and character details, conviction/special HUD meters, threat-level briefings, corrected result verdicts, and current-wave retry after defeat.
- [x] Converge graphics concepts with Badger Sprawl Runner
  - Added renderer-neutral presentation profiles, three Babylon parallax treatments, attack telegraphs, low-health/impact feedback, sprite placards, and renderer/profile E2E metadata.
  - Replaced per-hit particle-system allocation with a fixed-capacity combat VFX pool and added encounter-specific foreground layers.
  - Added combat-synchronized multi-frame sprite attacks, eight attack choreography families, adaptive locomotion, afterimages, and per-wave atmospheric parallax.
  - Added Market Procession, Archive Lockdown, and Gate Judgment rule presets with distinct timers, durability, conviction, and special readiness.
  - PixiJS remains intentionally uninstalled until both projects have a concrete reason to replace their complete Canvas2D backends.

## Release-blocking manual validation

- [ ] Run the automated gate one final time on the release candidate
  - Command: `pnpm release:check`
  - Expected result: lint exits zero, typecheck exits zero, all unit tests pass, production build succeeds, and Stage 1 E2E passes.
  - Record in release notes: command, exit status, test count, build artifact names, date, and commit SHA.

- [ ] Manual browser smoke test before tagging
  - Required because automated tests cannot fully verify canvas rendering and real keyboard input.
  - Command: `pnpm build && pnpm preview`
  - Browser path: open the Vite preview URL printed by the command.
  - Cover boot flow:
    - [ ] App loads without console errors.
    - [ ] Title/start screen appears.
    - [ ] Start action reaches character select.
    - [ ] Character select can choose both fighters or proceed with defaults.
    - [ ] Fight scene starts with visible fighters, stage, HUD, and timer.
  - Cover Player 1 controls:
    - [ ] Move left/right.
    - [ ] Lane up/down.
    - [ ] Jump.
    - [ ] Attack chain.
    - [ ] Block.
    - [ ] Special input.
  - Cover Player 2 controls:
    - [ ] Move with arrow keys.
    - [ ] Attack.
    - [ ] Block.
    - [ ] Jump.
    - [ ] Special input.
  - Cover combat outcomes:
    - [ ] Hits visibly connect.
    - [ ] Blocks reduce damage / produce block feedback.
    - [ ] Specials trigger cooldown / visual effect.
    - [ ] Round can end by KO or timeout.
    - [ ] Results or campaign route appears after match end.
    - [ ] Restart or return-to-menu path works.
  - Record in release notes: browser, OS, viewport size, commit SHA, and any observed issues.

- [ ] Check production build artifact manually
  - Command: `pnpm build`
  - Inspect: `dist/index.html` and `dist/assets/*` exist.
  - Confirm no unexpected huge bundle or missing asset warning appears in the build output.

- [x] Exclude archived test scaffolding from active lint/release checks
  - `tests.bak`, Playwright reports, and generated test results are excluded from Biome and Git tracking.

- [ ] Capture v1.0 release notes
  - Include summary of shipped systems:
    - local 2.5D brawler flow
    - roster/content data
    - fight simulation/unit coverage
    - release verification automation
  - Include verification evidence:
    - `pnpm release:check` output summary
    - manual smoke-test checklist result
    - commit SHA
    - build artifact names
  - Include known limitations:
    - no online multiplayer
    - manual visual review is still recommended for canvas composition and animation quality
    - later authored stages are not yet connected to true multi-enemy combat

- [ ] Prepare the release commit
  - Command: `git status --short`
  - Confirm only intended Ethic Brawl files are included.
  - Important: root `artifacts` repo had unrelated dirty changes outside `brawl/ethic-brawl`; do not accidentally stage them.
  - Suggested scoped staging from repo root:
    - `git add brawl/ethic-brawl/todo.md`
    - `git add brawl/ethic-brawl/docs/testing.md`
    - `git add brawl/ethic-brawl/scripts/release-check.mjs`
    - `git add brawl/ethic-brawl/.github/workflows/release-check.yml`
    - `git add brawl/ethic-brawl/package.json`
    - `git add brawl/ethic-brawl/tests/unit/release-readiness.test.ts`
    - `git add brawl/ethic-brawl/tests/vite-env.d.ts`
    - plus the lint-formatted Ethic Brawl files intentionally changed during the release pass.

- [ ] Tag `v1.0.0` only after automated and manual gates are recorded
  - Suggested command after commit: `git tag -a v1.0.0 -m "Ethic Brawl v1.0.0"`
  - Push only after reviewing the final diff and release notes.

## Nice-to-have before v1.0, only if time allows

- [ ] Add a short `docs/release-notes-v1.0.md`
  - Benefit: release evidence lives in-repo.
  - Minimum sections: summary, verification, manual smoke result, known limitations.

- [ ] Add a screenshot or short GIF after manual smoke test
  - Benefit: confirms canvas boot/render path for the tagged release.
  - Store outside repo unless assets are intentionally part of release notes.

## Post-1.0 backlog, not required for first major release

- [ ] Expand per-character authored move kits beyond current presets.
- [ ] Add corner pressure, wakeup, jump-in, and air-to-air deterministic simulation scenarios.
- [ ] Promote character gimmicks into a complete combat-resolution pipeline.
- [ ] Add online multiplayer only after local combat is stable and releasable.
