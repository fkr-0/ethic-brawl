# Physics and Control Review

This pass focused on the parts of the prototype that most directly affect whether the game feels fair, readable, and responsive.

## Issues fixed across the recent physics iterations

### 1. Running was triggered by holding a direction
The old controller logic updated the last-tap timestamp every frame while a direction was held. That meant a simple hold could become a run on the next frame, which made movement feel slippery and inconsistent.

The fix was to treat running as a real input-edge mechanic:

- only a fresh directional press counts as a tap
- the second tap must occur within a frame-based timing window
- the system no longer depends on wall-clock time via `performance.now()`

### 2. Lane changes were consuming two timer ticks per frame
Lane travel was decremented once in `fight-controller.ts` and again in `fighter.ts`. That made lane hops resolve too quickly and unpredictably.

The fix was to make the per-frame motor update the single owner of lane-transition progress.

### 3. Lane movement snapped instead of interpolating
A lane change used to keep the fighter on the source lane until the very end, then teleport to the destination lane. That breaks the illusion of 2.5D depth.

The fix was to track the lane-change origin and interpolate ground height during the transition.

### 4. Holding up or down could chain multiple lane hops
Because lane changes were level-triggered instead of edge-triggered, holding vertical movement could keep shifting the fighter through multiple lanes.

The fix was to require a fresh vertical press for each lane change.

### 5. Jump state never cleanly became falling
A fighter could remain in `jumping` all the way through the apex until landing. That makes animation, attack gating, and state reasoning harder.

The fix was to switch from `jumping` to `falling` as soon as vertical velocity crosses through zero.

### 6. Attacks were not interrupted by hitstun
A fighter could enter hitstun but still retain an active or pending attack state internally. That is both unfair and visually confusing.

The fix was to clear the current attack and its locked facing when hitstun begins.

### 7. Active attacks could flip direction mid-swing
Hitboxes used the fighter's live `facing` every frame. Auto-facing could therefore reverse a hitbox during an already-started attack.

The fix was to lock attack facing at attack start and keep it for the lifetime of that attack.

### 8. Grounded movement bypassed the velocity model entirely
Grounded motion used to mutate `x` directly inside `fight-controller.ts`. That made acceleration, braking, jump carry, and knockback blending awkward or impossible.

The fix was to extract a dedicated `fighter-motor.ts` module that now owns:

- grounded acceleration and braking
- jump startup and momentum carry
- lane-change initiation and progression
- grounded movement-state syncing
- per-frame horizontal integration

### 9. Character movement identity was implicit
Roster data used to vary mostly by raw stats. That gave only limited control over feel and balance.

The fix was to add normalized movement profiles to character definitions, including:

- `walkMultiplier`
- `runMultiplier`
- `accelerationMultiplier`
- `decelerationMultiplier`
- `jumpMultiplier`
- `airControlMultiplier`
- `weight`

## What is cleaner now

The project has crossed an important threshold:

- `fight-controller.ts` no longer owns grounded movement math
- `fighter.ts` no longer mixes as much controller policy with physics integration
- grounded motion now has inertia instead of frame-perfect snapping
- releasing movement results in visible braking rather than immediate freeze
- jumps can preserve horizontal intent, which already makes the prototype feel less stiff
- character data now contains the beginnings of actual gameplay archetypes

## What still most needs work

### Explicit pushback and grounded knockback rules
The motor now blends controlled grounded motion with external horizontal velocity, but block pushback and hit reactions are still simplistic. The next step is to define explicit pushback rules for:

- blocked normals
- counter-hits
- corner pressure
- air-to-ground and ground-to-air interactions

### Motor ownership of action locks
The motor currently owns movement and jump behavior, but blocking, attack start, and special gating still begin in `fight-controller.ts`. A cleaner next step is to let the motor decide whether those actions are allowed and how they affect movement.

### Simulation-first combat verification
The unit suite is much healthier than before, but the next leap in confidence will come from deterministic scenario tests that step a fight for many frames and assert on the resulting state.

## Best next move

The highest-leverage next implementation is no longer “extract the motor” because that now exists. The next strongest step is to deepen it into a full fighter motion/combat gateway that also owns:

- action locking
- block entry and exit timing
- grounded pushback
- knockback categories
- momentum inheritance rules for more than just jumps

That would make the engine much easier to tune without fear.


## What this combat pass added

### 10. Combat gating now lives behind a combat-intent layer
Block, attack, and special startup used to begin directly in `fight-controller.ts`. That made the controller own too much action-policy logic and left special attacks effectively unimplemented.

The fix was to introduce a dedicated combat-intent module that now owns:

- block entry and release decisions
- attack startup gating
- special startup gating
- blockstun-aware action locking

### 11. Blocked hits no longer masquerade as regular hitstun
A successful block used to route through the same `takeDamage()` path as a clean hit. That incorrectly converted block pressure into hitstun, broke visual readability, and made defensive interactions feel wrong.

The fix was to add a separate blocked-impact path with chip damage, blockstun, grounded pushback, and attacker recoil on block.

### 12. Grounded launch knockback now actually launches
Heavy grounded hits could carry upward knockback values, but defenders remained flagged as grounded, so the launch component never became real motion.

The fix was to make impact application decide whether the defender should leave the ground, and to feed that through the motor so heavy and special grounded hits can produce real airborne reactions.

### 13. Specials now exist as runtime combat actions
Special moves used to exist only as content metadata. Pressing the special input had no runtime effect.

The fix was to derive a runtime special attack from character data, start it through the combat-intent layer, attach cooldown behavior, and use attack-specific hitbox metadata so range from character data affects the resulting active hitbox.

### 14. Simulation tests now cover combat feel, not just isolated helpers
The test suite now includes fixed-step fight scenarios that cover:

- blocking converting a hit into chip + pushback
- heavy grounded hits launching airborne
- specials entering cooldown and refusing immediate reuse


### 15. Hit-confirm ownership now prevents accidental multi-hit retriggers
Long active windows used to re-apply damage or block pressure every frame as long as overlap persisted. That made some normals behave like un-authored multi-hit attacks and made combat feel arbitrary instead of designable.

The fix was to give each live attack its own per-target contact history. Default attacks now connect once per target for the life of that attack, while authored multi-hit attacks can opt into additional contacts with an explicit rehit delay and per-target hit cap.

### 16. Perfect-block timing no longer swallows ordinary defense
The previous perfect-block window was wide enough that an ordinary held block against a short-startup normal could resolve as a perfect block. That masked chip/blockstun behavior and made defensive outcomes harder to read.

The fix was to tighten the perfect-block window so normal held blocks remain normal blocks, while late defensive timing still has room to become a true perfect block.

### 17. Multi-hit behavior is now a first-class content preset, not only inline attack metadata
The engine previously supported explicit multi-hit policies only when a specific runtime attack object carried raw `hitPolicy` metadata. That worked for tests, but it left authored combat identity scattered across ad-hoc objects instead of living in reusable roster content.

The fix was to add a named hit-policy preset catalog and let roster content reference those presets for both normals and specials. Runtime attack resolution now understands preset-backed hit behavior directly, so content authors can declare that a move is a "double tap" or pressure flurry without copying raw hit counters into each individual attack object.


### 18. Move classes are now first-class authored combat content
The engine used to rely on generic attack defaults plus ad-hoc runtime metadata. That made combat feel improvements possible, but not especially authorable.

The fix was to add a move-class layer that now lets content declare, per normal or special:

- launch class
- chip / block profile
- counter-hit profile
- lane reach

That matters because it moves combat feel further out of controller assumptions and into reusable authored content. A medium normal can now be a launcher, a pressure tool can now chip and trap differently on block, and a special can explicitly reach into adjacent lanes without pretending that lane interaction is only a hurtbox-geometry accident.

