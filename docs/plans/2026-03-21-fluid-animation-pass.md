# Fluid Animation Pass Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans.md (in project knowledge) to implement this plan task-by-task.

**Goal:** Improve visual fluidity by adding explicit landing, turnaround, and recoil timers plus richer inbetween posing in the render view layer.

**Architecture:** Keep combat and physics authoritative in simulation, but expose deterministic short-lived view timers on `Fighter` for animation-only transitions. Convert `render/fighter-animation-view.ts` from a phase switch into a continuous pose mapper and let `renderer.ts` consume richer limb/joint parameters.

**Tech Stack:** TypeScript, Vitest, Biome, Vite canvas renderer.

---

## Implemented tasks

1. Write failing tests for landing / turnaround / recoil timers in `tests/unit/animation-view.test.ts`
2. Verify RED by running the focused test file
3. Add fighter-side animation timers and timer-trigger methods in `src/game/fight/fighter.ts`
4. Trigger landing impacts from `src/game/fight/fighter-motor.ts`
5. Route auto-facing through `fighter.setFacing()` in `src/game/fight/fight-controller.ts`
6. Extend `src/render/fighter-animation-view.ts` with continuous phase interpolation, landing impact, turnaround amount, recoil offset, and segmented-limb view data
7. Upgrade `src/render/renderer.ts` to draw segmented limbs and use the richer view state
8. Re-run focused tests to GREEN
9. Run full lint, test, typecheck, and build verification
