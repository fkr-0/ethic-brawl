# 2026-03-21 — VFX and Recovery Layer Pass

## Goal

Push the prototype past the point where physics and combat are readable only through body posing.

This pass adds:

- transient per-move VFX
- ambient no-move VFX
- explicit hit-freeze in fight state
- knockdown and get-up as first-class recovery phases
- character-scoped animation profiles so primitive rendering can vary silhouette and motion quality without authored sprites

## Why this is the right bridge step

A full departure from procedural primitives would normally require authored sprite sheets, rigs, or mesh parts. The project does not have that content yet. The right bridge is therefore not to wait for art, but to make the primitive renderer more expressive and more data-driven.

That means:

1. simulation emits more presentation-ready state
2. content owns more of the motion identity
3. the renderer gains effect layers and recovery families
4. tests pin the readable combat cases so future balancing does not silently flatten the visuals again

## Added engine-facing contracts

### Fight state

- `hitFreezeFrames`
- `visualEffects`

### Fighter state

- `pendingKnockdown`
- explicit `forceState(...)`
- launch impulses now immediately express airborne state visually

### Content

- `CharacterAnimationProfile`
- per-character ambient VFX identity
- per-character silhouette / cadence / anticipation / recovery / recoil tuning

## Added renderer-facing contracts

### Transient effects

- impact sparks by move strength
- guard / perfect guard effects
- launcher pop effect
- special burst effect
- landing dust

### Ambient effects

- idle identity effect per character
- movement afterglow
- guard shimmer
- special-state orbit/glow treatment
- landing dust bridge between motion and impact

## Validation strategy

The pass was treated as behavioral work, not a style pass.

New tests cover:

- hit-freeze pausing fighter simulation while still keeping combat ownership coherent
- impact VFX spawn on live combat contact
- knockdown → get-up → idle progression
- ambient no-move VFX collection
- character animation-profile variation in identical gameplay states
- knockdown / get-up view-family separation

## Remaining ceiling after this pass

This is now a good procedural presentation layer, but it is still not authored animation.

The next real ceiling-breakers are:

1. per-move camera shake / zoom hints
2. richer special-specific timing curves
3. wakeup option states and knockdown variants
4. per-character move-set authoring beyond shared defaults
5. eventually real authored parts or sprite/rig assets
