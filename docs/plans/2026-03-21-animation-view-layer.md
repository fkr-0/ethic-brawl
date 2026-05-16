# Animation View Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans.md (in project knowledge) to implement this plan task-by-task.

**Goal:** Add a deterministic animation view layer that converts combat/physics state into readable motion and wire it into the running fight scene.

**Architecture:** Keep animation as a pure render-facing adapter instead of mixing pose math into the fighter or controller. Use one pure module for stable background data and one pure module for fighter animation state, then let a thin fight runtime hook the renderer into the app scene.

**Tech Stack:** TypeScript, Canvas 2D, Vitest, Biome, Vite.

---

## Implemented tasks

1. add `src/render/fighter-animation-view.ts` as the pose adapter from fighter simulation state to render parameters
2. add `src/render/background-scene.ts` for deterministic skyline/window generation
3. update `src/render/renderer.ts` to draw layered limbs, lean, bob, scale, flash, aura, and afterimages from the view model
4. add `src/app/fight-runtime.ts` so the real fight renderer is used by the live `fight` scene instead of the placeholder rectangle demo
5. add red/green tests for animation-view behavior, deterministic background generation, and fight-runtime integration

## Resulting boundaries

- simulation remains in `src/game/fight/`
- render-only interpretation lives in `src/render/`
- scene/app wiring lives in `src/app/`

## Next implementation steps

1. replace primitive pose drawing with authored sprite-part or mesh-part slots while preserving the same animation view contract
2. add stateful landing / turnaround / recoil animation timers instead of deriving everything from the current frame only
3. move VFX hints into authored move data so impacts, trails, and specials read as character-specific rather than generic
