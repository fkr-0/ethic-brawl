# ADR 0001: Declarative settings and renderer-neutral presentation policy

- **Status:** Accepted
- **Date:** 2026-07-23
- **Scope:** App shell, settings persistence, fight presentation, Canvas renderer, Pixi bridge

## Context

The settings screen previously described the same interaction model twice:

1. scene code owned hard-coded tab behavior and row counts;
2. rendering code owned a separate hard-coded list of labels and rows.

That duplication made navigation and visuals capable of drifting. Fight feedback also coupled sensory output directly to rendering and camera systems, making reduced-motion or reduced-flash behavior difficult to apply consistently across Canvas and Pixi without changing combat timing.

## Decision

Ethic Brawl uses three explicit boundaries:

```text
Settings model
  ├─ declares tabs, rows, descriptions, values, and activation transitions
  ├─ produces immutable state snapshots
  └─ remains independent from Canvas and DOM APIs

Presentation policy
  ├─ maps user preferences to normalized intensity scales
  ├─ never changes fight simulation, frame data, or hit resolution
  └─ is consumed by both Canvas and Pixi render paths

Persistence adapter
  ├─ stores a versioned schema
  ├─ validates untrusted localStorage data at runtime
  └─ migrates legacy partial payloads through safe defaults
```

Specialized UI modules own the settings screen and AI spectator overlay. The general app-shell renderer remains a composition module rather than accumulating every screen-specific interaction and layout concern.

## Consequences

### Positive

- Navigation row counts and rendered rows share one source of truth.
- Accessibility preferences apply identically to retained and immediate renderers.
- Combat remains deterministic because sensory policy is downstream from simulation.
- New settings require an explicit model entry, persistence decision, and test instead of scattered conditionals.
- AI telemetry can evolve independently from the fight HUD.

### Costs

- The app shell has more small modules and explicit data transfer.
- Presentation options must remain renderer-neutral; renderer-specific shortcuts are rejected at the policy boundary.
- Persisted settings require schema-aware maintenance.

## Verification contract

- Unit tests cover settings transitions, persistence validation, presentation mapping, camera scaling, and layout non-overlap.
- Browser tests cover real keyboard navigation, persistence/reload, Canvas policy propagation, and AI spectator mode in Chromium and Firefox.
- The normal asset, type, lint, unit, and production-build gates remain mandatory.
