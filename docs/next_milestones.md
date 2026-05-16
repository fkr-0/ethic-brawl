## What improved in this iteration

- a real animation view layer now exists and is wired into the live fight scene, with deterministic background art, depth-scaled fighters, locomotion cycles, attack-phase silhouettes, segmented-limb posing, and defense / hit reaction posing
- run input now requires a real second tap instead of promoting a held direction into sprinting after a couple of frames
- lane changes now consume one timer tick per frame, interpolate smoothly between lanes, and require a fresh directional press for each hop
- jump arcs now transition from `jumping` into `falling` at the apex, which makes animation and combat-state logic much easier to reason about
- attacks are now interrupted on hitstun and keep their original facing while active, preventing unreadable mid-swing hitbox flips
- round timers now clamp at zero instead of drifting negative under long frames
- grounded movement has been moved onto a dedicated fighter motor with acceleration, braking, and jump momentum carry
- character definitions now include normalized movement profiles rather than relying only on raw stats
- authored multi-hit behavior can now be declared through named roster/content presets for normals and specials
- authored move classes now exist for launch class, chip/block profile, counter-hit profile, and lane reach
- landing, turnaround, and recoil timers now feed the animation view layer, and attack phases now interpolate within startup / active / recovery instead of snapping to one static pose each

### Physics-specific clean-up priorities after this pass

1. push more combat identity into character data so attack chains, specials, and gimmicks become bespoke instead of mostly preset-driven
2. extend the simulation harness with corner pressure, jump-in, air-to-air, and knockdown/wakeup scenarios
3. move gameplay constants into a single gameplay config module
4. give move classes stronger authored content coverage across the whole roster
5. build on the new animation view layer with authored landing, turnaround, recoil, and per-move VFX timing

## Milestone 1: deepen the combat gateway and state-lock model

### Current state
This iteration moved block / attack / special gating out of `fight-controller.ts` into a dedicated combat-intent layer, added runtime special startup, and introduced blockstun-aware action locking.

### What is still missing

1. separate blockstun and hitstun from broader action-lock concepts so future mechanics such as rolls, parries, and cancels can compose cleanly
2. move attack-chain ownership out of `fighter.ts` defaults and into declarative character combat data
3. add focused tests for:
   - blocking while braking
   - jump startup during run deceleration
   - hitstun clearing run state
   - attack startup while changing lanes

## Milestone 2: tune the new grounded impact model

### Current state
Grounded impact handling now distinguishes normal hits, blocked hits, heavy launch knockback, special knockback, and attacker recoil on block. The simulation suite covers block pushback, heavy launches, and special cooldown gating.

### What is still missing

1. add explicit perfect-block scenario tests so timing windows can be tuned safely
2. add corner-specific rules so grounded pushback cannot silently disappear at stage edges
3. tune launch thresholds and decay values through authorable data instead of hard-coded profiles
4. expand the preset system from preset-driven classes into bespoke per-character move authoring
5. add tests for:
   - corner pressure
   - jump-in blockstun pushback
   - counter-hit launches
   - projectile-vs-grounded reactions

## Milestone 3: turn move classes into full authored move sets

### Goal
Move from preset-backed combat identity to truly authored per-character normals and specials.

### Why
The project now has named move classes for launch, block pressure, counter-hit reward, and lane reach. That is a big step, but the cast still leans heavily on shared defaults.

### Steps

1. expand the now-authored normal-chain entries into richer route trees, cancel windows, and command normals
2. let specials own bespoke frame data instead of deriving everything from `special.type`
3. expand authored move presentation from current VFX/camera cues into per-move trails, impact decals, and short camera focus bias
4. add validation tests proving every roster entry resolves into complete runtime attacks

## Milestone 4: make lane mechanics explicit instead of implicit Y-offset hacks

### Goal
Model lane rules as gameplay decisions, not just render-space separation.

### Why
The current lane system mostly works by vertical displacement. That is enough to prevent some incorrect collisions, but it is not yet a full gameplay model.

### Steps

1. define lane interaction rules explicitly:
   - can melee hit adjacent lanes?
   - can projectiles traverse all lanes?
   - do grabs require same lane only?
2. encode those rules in combat resolution rather than relying only on hurtbox Y separation
3. add per-attack lane reach metadata to hitbox or attack definitions
4. add tests for same-lane, adjacent-lane, and non-adjacent-lane interactions

## Milestone 5: enrich character data into a real gameplay roster model

### Goal
Turn character definitions from mostly flavor/config blobs into structured gameplay content.

### Why
Character data now includes movement tuning, which is a real improvement. The same normalization should happen for the rest of gameplay identity.

### Recommended shape

Add explicit sub-objects to `CharacterDefinition`, for example:

- `movement`
  - `walkMultiplier`
  - `runMultiplier`
  - `accelerationMultiplier`
  - `decelerationMultiplier`
  - `jumpMultiplier`
  - `airControlMultiplier`
  - `weight`
- `combat`
  - `attackChainId`
  - `blockEfficiency`
  - `chipResistance`
  - `pushbackProfile`
- `special`
  - keep current data, but add runtime-facing metadata such as duration, cooldown policy, and lane targeting

### Steps

1. introduce normalized combat definitions with defaults
2. keep content files declarative and concise
3. derive runtime-ready fighter data through a builder or normalizer function
4. add validation tests for every roster entry:
   - non-empty quotes in all buckets
   - valid colors
   - stat ranges within balance constraints
   - complete movement and combat metadata

## Milestone 6: grow the deterministic simulation suite

### Current state
A reusable fixed-step simulation harness now exists in `tests/unit/fight-simulation.test.ts` and covers:

- successful blocks producing chip + pushback instead of raw hitstun
- grounded heavy hits launching defenders airborne
- specials entering cooldown and refusing immediate reactivation

### Next scenarios to add

1. combo timeout reset under repeated pressure
2. round end on timeout and KO
3. attack whiffs across lanes
4. jump arc finishes grounded
5. corner pushback clamping
6. counter-hit and perfect-block branches

## Milestone 7: remove duplicated gameplay constants

### Goal
Create one authoritative source for combat and movement tuning.

### Why
The project still has overlapping constants in:

- `src/app/config.ts`
- `src/game/fight/fighter-state.ts`
- logic embedded directly in controller and combat modules

That duplication makes balancing brittle and causes silent divergence.

### Steps

1. move all combat and movement tuning to a dedicated gameplay config module, for example `src/game/config/gameplay.ts`
2. let `fighter-state.ts` contain types and canonical frame-data objects only
3. remove duplicate exports from `app/config.ts` that are actually gameplay, not app-shell, concerns
4. keep renderer-only values and canvas sizing in `app/config.ts`
5. add regression tests proving imported tuning values are identical at all call sites

## Milestone 8: formalize engine boundaries

### Goal
Clarify what belongs to app shell, engine, fight logic, and rendering.

### Why
Some modules still blur boundaries:

- `app/game-loop.ts` owns engine timing and utility animation behavior
- `render/renderer.ts` reaches into roster data directly
- `fight-controller.ts` still knows some runtime details it should not own long-term

### Steps

1. define a thin runtime layer:
   - loop
   - clock
   - scene transitions
   - event dispatch
2. treat fight simulation as a consumer of runtime ticks, not part of the loop implementation
3. give rendering a view-model or snapshot rather than direct domain lookups
4. move UI/debug formatting out of domain entities where possible

## Milestone 9: finish incomplete combat features behind tests

### Missing or partial features already visible in code

- special attacks are still TODO in `fight-controller.ts`
- roll logic is still TODO
- lane-change transition is still mostly logical rather than driven by a richer motion component
- character gimmicks are defined but not yet applied in combat resolution

### Order of attack

1. gimmick application pipeline
2. special-attack execution model
3. roll and invulnerability system
4. per-character attack-chain customization

## Milestone 10: clean developer ergonomics

### Goal
Make future iterations cheaper and safer.

### Steps

1. add a `docs/testing.md` with exact commands for focused vs full verification
2. add npm scripts for single-file tests and deterministic simulation tests
3. consider splitting `tests/unit/` into:
   - `tests/unit/engine/`
   - `tests/unit/physics/`
   - `tests/unit/fight/`
   - `tests/unit/content/`
4. add CI that runs lint, typecheck, unit tests, and build on every change

## Recommended immediate next coding batch

If continuing right away, the highest-value next batch is:

1. expand the current bespoke normal chains into fuller per-character move kits with branching routes and command normals
2. make specials fully bespoke instead of mostly special-type templates
3. add corner / wakeup / jump-in simulation scenarios
4. start the animation-state layer that can visually sell the now-cleaner physics and combat rules

That sequence would push the prototype from “physics are finally coherent” toward “combat feel is systematically tunable.”


## What the VFX / recovery pass added

- transient per-move VFX now exist for light / medium / heavy / special hits, blocks, perfect blocks, launches, and landings
- ambient no-move VFX now exist, so fighters can read as alive even when not actively attacking
- hit-freeze is now explicit in `FightState`, which makes combat presentation tunable rather than accidental
- launched defenders now progress through `knockdown` and `gettingUp` instead of snapping straight back to neutral
- character data now includes animation profiles, which lets the primitive renderer vary silhouette, cadence, anticipation, recoil, and ambient identity per fighter

## Recommended immediate next coding batch

The strongest next step is now:

1. deepen the new bespoke normal chains with cancel windows, route-specific frame data, and matchup-specific move roles
2. author special timing / VFX / recovery curves per character rather than mostly by special type
3. add wakeup-option simulation tests and corner knockdown scenarios
4. deepen the current camera shake / zoom hint system with per-cue focus bias, zoom easing, and wall-carry emphasis
5. decide whether the next visual leap should be:
   - authored sprite / rig parts, or
   - an even richer procedural body-part system with move-authored overlays
