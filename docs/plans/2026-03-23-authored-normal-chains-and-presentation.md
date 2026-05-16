# Authored Normal Chains and Presentation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans.md (in project knowledge) to implement this plan task-by-task.

**Goal:** Replace the remaining shared-normal-chain feel with authored per-character normal chains, plus move-timed presentation cues and procedural micro-variation that make repeated actions read less mechanically.

**Architecture:** Keep the combat runtime authoritative and deterministic, but move authored attack identity into content and a dedicated presentation preset layer. The fighter owns attack presentation state and queues visual/camera cues; the renderer consumes those outputs without reintroducing gameplay logic into view code.

**Tech Stack:** TypeScript, Vitest, Biome, Vite canvas renderer.

---

## Landed in this pass

1. Added first-class authored normal chains via `CharacterCombatProfile.normalChain`.
2. Added presentation presets via `src/game/fight/attack-presentation-presets.ts`.
3. Added fighter-owned queued presentation effects and camera effects.
4. Added runtime camera application for authored move cues.
5. Added view-only attack micro-timing variation so repeated attacks do not animate identically.

## Files touched

- `src/content/characters/character-data.ts`
- `src/game/fight/attack-presentation-presets.ts`
- `src/game/fight/combat-intent.ts`
- `src/game/fight/fighter-state.ts`
- `src/game/fight/fighter.ts`
- `src/game/fight/fight-controller.ts`
- `src/game/fight/visual-effects.ts`
- `src/render/camera.ts`
- `src/render/renderer.ts`
- `src/render/vfx.ts`
- `src/render/fighter-animation-view.ts`
- `tests/unit/character-data.test.ts`
- `tests/unit/attack-presentation.test.ts`
- `tests/unit/animation-view.test.ts`

## Verification

- `npm run lint`
- `npm run typecheck`
- `npx vitest run --pool=threads --no-file-parallelism --maxWorkers=1`
- `npm run build`
