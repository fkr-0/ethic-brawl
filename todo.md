# Ethic Brawl v1.0 Release Todo

## Current release status

- Automated gate: green as of the latest local `pnpm release:check` run.
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

## Release-blocking manual validation

- [ ] Run the automated gate one final time on the release candidate
  - Command: `pnpm release:check`
  - Expected result: lint exits zero, typecheck exits zero, all unit tests pass, and production build succeeds.
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

- [ ] Review known warnings before release
  - Current known warning source: archived `tests.bak` files use `any` in old test scaffolding.
  - Decision needed:
    - [ ] Accept warnings for v1.0 because release gate exits zero.
    - [ ] Or exclude / clean `tests.bak` before tagging if a warning-free release is desired.

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
    - manual browser smoke still required for canvas/input regressions
    - `tests.bak` warnings remain unless cleaned

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

- [ ] Decide whether to clean or exclude `tests.bak` warnings
  - Benefit: warning-free lint output.
  - Risk: touching archived tests could expand scope.
  - Recommendation: defer unless warning-free output is a hard requirement.

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
