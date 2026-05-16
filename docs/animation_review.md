# Animation Review

## Current state

The prototype is now meaningfully cleaner in simulation and combat feel than it was a few iterations ago, but the animation layer is still at a placeholder stage.

The good news is that the game already has the beginnings of a usable animation contract:

- fighters expose stable state names such as `idle`, `walking`, `running`, `jumping`, `falling`, `attacking`, `blocking`, `hitstun`, and `special`
- fighters also expose timing signals such as `stateFrame`, `attackFrame`, `laneChangeTimer`, `hitstunFrames`, and velocity values
- the renderer already separates arena / HUD / fighter drawing and sorts fighters by lane

That means there is enough state to drive good animation. The missing part is the actual animation system.

## Biggest current animation problems

### 1. The fighter renderer is still a pose switch, not an animation system
`renderFighter()` currently draws a single body/head block with one of three limb poses:

- attack pose
- block pose
- generic standing pose

That is enough for debugging, but not enough for readability or fun. There is no:

- walk cycle
- run cycle
- jump ascent / fall differentiation in the pose
- attack startup / active / recovery silhouette change
- landing reaction
- hurt / block recoil pose
- special-specific posing

### 2. Motion is not visually sold yet
Physics got better, but animation does not yet communicate it strongly.

Examples:

- braking has no visible lean-back or step-drag pose
- jump momentum carry has no anticipation or airborne posture change
- lane changes interpolate position, but the body does not react to that movement
- hitstun currently shows mostly a box-outline indicator rather than a readable body reaction

### 3. Depth is only partially expressed
The game already sorts by lane and computes lane positions, but fighters are not yet visually scaled by lane depth. `getLaneDepthFactor()` exists in the lane module, which is a good sign, but the fighter renderer is not using that factor yet.

That means the prototype behaves like a 2.5D game in simulation, but still reads mostly like a flat debug sketch visually.

### 4. The background has frame-to-frame visual noise
`renderBackground()` uses `Math.random()` while drawing windows. Because that happens every frame, the city lights can shimmer instead of feeling like a stable environment. It makes the whole scene look less intentional than it should.

## Best next animation steps

### Milestone A: create a tiny animation-view model
Do not jump to sprite tooling yet. First create a small animation layer that converts fighter state into render-friendly parameters:

- body lean
- head offset
- front arm angle
- rear arm angle
- front leg angle
- rear leg angle
- squash / stretch
- flash / tint state

This can still render with primitives.

### Milestone B: separate attack phases visually
For every attack and special, the renderer should be able to tell:

- startup
- active
- recovery

That alone will improve readability far more than adding more art too early.

### Milestone C: add locomotion cycles before detailed art
The highest-value visual upgrades are:

1. walk cycle
2. run cycle
3. jump start
4. airborne loop
5. landing pose
6. hit / block recoil

### Milestone D: make lane depth visible
Use lane depth for:

- fighter scale
- shadow width / opacity
- vertical camera feel
- maybe subtle line-width changes

### Milestone E: stop using per-frame random background windows
Generate background light patterns once, store them, and render from stable data.

## Overall assessment

Animation is not yet in a production-ready or even “fun-ready” state, but it is now on a much better systems foundation than before. The important thing is that the physics/control layer now exposes enough stable state that a real animation pass can be added without fighting the engine.

The next clean step is not “make prettier art.” It is “create a deterministic animation layer driven by fighter state and phase timing.”


## What this animation-layer pass added

The project now has an actual animation view layer instead of a raw pose switch.

### New render-facing contracts

- `src/render/fighter-animation-view.ts`
  - derives readable motion parameters from simulation state
  - separates startup / active / recovery silhouettes
  - expresses locomotion via lean, bob, stride, reach, flash, aura, and afterimage values
- `src/render/background-scene.ts`
  - makes skyline window patterns deterministic instead of re-randomizing every frame
- `src/app/fight-runtime.ts`
  - wires the real fight renderer into the running scene so the animation layer is visible in the built app

### What is visibly better now

- front/back lane depth now affects fighter scale and shadow size
- walking and running now read as different motion families instead of the same standing box
- attacks now show anticipation, extension, and recovery instead of one generic attack arm
- blocking and hitstun now have separate readable silhouettes and flashes
- specials now get an aura/afterimage treatment
- the city background no longer shimmers from frame-to-frame randomness

### What is still not “finished good looks” yet

- this is still a primitive-shape animation system, not authored sprite or rig animation
- there is still no dedicated landing pose timer, turn-around anticipation, or knockdown/get-up animation pass
- effects are still generic and not strongly character-authored


## What the fluid-animation pass added

This pass closes the most obvious placeholder-feel gaps without pretending the game has authored sprites yet.

### New animation-state hooks

- fighters now emit explicit short-lived timers for:
  - landing impact
  - turnaround
  - recoil
- those timers are deterministic and live in simulation state, so the renderer does not need to guess transitions from raw velocity alone

### New visual behavior

- attacks interpolate inside startup / active / recovery instead of freezing into one pose per phase
- limbs are now drawn as segmented chains rather than single straight rods, which gives the primitive renderer much better perceived motion detail
- landing compresses the body and shadow instead of snapping back to idle height
- turnarounds now have a visible body twist and counter-lean instead of an instant readless flip
- blocked and hit reactions now include a short recoil offset that helps impacts read even without sprite sheets
- afterimages now support both speed and impact, which makes fast movement and collision feel more connected to the visuals

### Remaining visual ceiling

The renderer is now much less “debug pose only,” but the next visual ceiling is still authored content:

- move-specific VFX timing
- per-character silhouette variations beyond color
- knockdown / get-up / victory / defeat animation families
- camera shake and hit-freeze tuned per move class


## What the VFX / recovery layer pass added

This pass is the clearest answer so far to the question “can this escape a purely primitive procedural look before real art arrives?”

The answer is: partly yes.

### New strengths

- the renderer no longer depends only on body pose to sell impact; it now has transient VFX for hits, guards, launches, specials, and landings
- idle / neutral states are no longer visually dead, because ambient effects now give each character a baseline screen presence
- hit-freeze is now explicit and test-covered, which means impact readability can be tuned as a real mechanic
- knockdown and get-up are now first-class animation families rather than missing recovery gaps
- character animation profiles now vary silhouette and motion identity across the roster even without bespoke sprites

### What this means practically

The project is still procedural and primitive-shape based, but it is no longer only a debug mannequin system. It now has:

- motion families
- recovery families
- effect layers
- content-driven per-character animation identity

That is enough to support another meaningful phase of polish before sprite authoring becomes mandatory.

### The remaining hard ceiling

To fully escape the procedural primitive look, one of these eventually has to happen:

1. authored sprite sheets
2. authored modular body parts / cutout rigging
3. a mesh / bone based render model

Until then, the best path is to keep pushing three things together:

- better per-move authored timing
- better effect layering
- stronger per-character silhouette variation
