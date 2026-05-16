# Fighter Motor Extraction Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use executing-plans.md (in project knowledge) to implement this plan task-by-task.

**Goal:** Extract a dedicated fighter motor and move grounded motion from direct position stepping to a velocity-based model.

**Architecture:** Introduce a focused `fighter-motor.ts` module that owns movement input interpretation, grounded acceleration/braking, jump momentum carry, and motion integration. Keep combat resolution in `fight-controller.ts`, but delegate movement-specific rules to the motor and let `Fighter` retain only durable state plus lifecycle bookkeeping.

**Tech Stack:** TypeScript, Vitest, Vite, Biome.

---

### Task 1: Lock down desired grounded-motion behavior

**Files:**
- Modify: `tests/unit/fight-physics-feel.test.ts`
- Test: `tests/unit/fight-physics-feel.test.ts`

1. Add failing tests for grounded acceleration, grounded braking, and jump momentum carry.
2. Run the targeted test file and verify the new assertions fail for the expected behavior reasons.

### Task 2: Extract a fighter motor

**Files:**
- Create: `src/game/fight/fighter-motor.ts`
- Modify: `src/game/fight/fight-controller.ts`
- Modify: `src/game/fight/fighter.ts`
- Modify: `src/game/physics/movement.ts`

1. Create motor helpers for grounded target-speed calculation, grounded acceleration/deceleration, lane changes, and jump startup.
2. Route movement logic in `fight-controller.ts` through the motor.
3. Route per-frame physics integration in `fighter.ts` through the motor.
4. Keep changes minimal and behavior-driven.

### Task 3: Normalize movement data in character definitions

**Files:**
- Modify: `src/content/characters/character-data.ts`
- Modify: `tests/unit/fight-controller-character-physics.test.ts`

1. Add a movement profile to character definitions with safe defaults.
2. Thread the profile into fighter motion tuning.
3. Add a test that demonstrates character data affects motorized movement.

### Task 4: Verify and document

**Files:**
- Modify: `docs/next_milestones.md`
- Modify: `docs/physics_review.md`

1. Run targeted tests after each red-green cycle.
2. Run full lint, test, typecheck, and build.
3. Update the docs to reflect what is now clean and what remains.
