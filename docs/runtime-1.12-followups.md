# Arcade Runtime 1.12 follow-ups

Ethic Brawl now treats `@arcade/runtime` as a capability-oriented dependency even though the
release artifact is still vendored as one ESM module. Production, unit-test, and browser-test
TypeScript imports use the official Runtime 1.12 capability subpaths; package-root imports are
rejected. This document records the remaining consumer work without requiring changes to Runtime
source.

## Executable consumption contract

Run:

    node scripts/verify-runtime-consumption.mjs

The verifier fails closed when production or test TypeScript:

- reintroduces a relative `vendor/arcade-runtime.mjs` import;
- imports a capability that Runtime 1.12 does not publish;
- imports from the package root instead of an official Runtime 1.12 capability subpath;
- lets the Vite and Vitest capability aliases drift apart;
- loses the TypeScript declaration aliases; or
- modifies the vendored Runtime module/declarations without updating their verified hashes.

`--json` emits the same checks as machine-readable evidence. A Vitest contract test executes
that path, and release CI runs the verifier explicitly before build/test work.

## Sprite-manifest compatibility boundary

`src/render/sprites/runtime-manifest.ts` now separates two contracts deliberately:

1. **Ethic Brawl local authoring semantics** — per-frame durations, local frame metadata,
   state/attack/command mappings, and richer atlas geometry.
2. **Runtime 1.12 semantic projection** — sheet/frame addressing, clip count/order, average
   FPS, loop semantics, and strict `normalizeArcadeSpriteManifest()` validation.

The compatibility inspection rejects malformed frame indices/durations, duplicate clip IDs,
duplicate mapping keys, non-finite pivots, and dangling clip references before Runtime
normalization. Variable per-frame timing is reported explicitly rather than silently presented
as lossless: Runtime 1.12 has one FPS per animation, so the projection stores average FPS and a
`ethic-brawl:timing:local-variable` tag while the local renderer remains timing authority.

## Integrated Runtime 1.12 capabilities

The following adapters are implemented under `src/runtime/`, tested directly against the vendored
Runtime 1.12 implementation, and now wired into production paths.

### Unified gameplay actions

`gameplay-actions.ts` converts the existing serializable `energy + cooldowns` shape into
`ArcadeGameplayActionState`, then delegates cost payment, cooldown start/step, queue windows and
queue expiry to Runtime. `defineRuntimeSpecialAction()` maps the authored special contract onto
Runtime action definitions.

The special resolver and fighter cooldown tick now delegate to this state machine. The catalog
contract test projects every authored special and verifies its real energy cost, cooldown block
and cooldown decrement behavior. The former second energy-spend pass in combat intent is removed;
the resolver result is now the single source of truth for energy + cooldown updates.

### Transient notice model

`notices.ts` wraps `createArcadeNoticeQueue()` with stable Ethic topics and exposes
`drawEthicNotice()` over `drawArcadeNoticeCanvas()`. The live application now surfaces renderer
fallbacks, settings/keybinding saves, sprite toggles/scaling/grid controls, chroma-key changes and
frame-boundary debug state. The queue advances once per fixed update and remains presentation-only.

### Stateful grid focus bridge

`grid-focus.ts` provides a transitional integer-index facade over `createGridFocusNavigator()`.
Start-menu, settings-row and character-select movement now use it. Runtime owns preferred-column
behavior, disabled/hidden skipping and focus-replacement events while the existing integer indices
remain observable E2E mirrors.

### Legacy-compatible versioned storage

`versioned-storage.ts` makes `createVersionedStore()` safe for existing raw localStorage payloads.
Settings persistence now uses it with the existing Ethic serializer/parser as its schema boundary.
The first load upgrades raw JSON into Runtime's checksummed envelope while preserving the original
payload as the backup; subsequent saves use normal Runtime revision/backup semantics.

## Next implementation slices

### P1 — finish grid-focus ownership

The live shell now delegates movement to the Runtime navigator but still mirrors focus into legacy
integer fields for rendering/E2E compatibility. Once browser coverage is stable, let each scene
own the Runtime navigator directly and derive the mirror index only for diagnostics.

### P1 — extend versioned persistence

Settings are migrated. Next, move progression/best-score persistence to the same Runtime envelope
and backup semantics, then remove the remaining raw localStorage wrappers.

### P1 — remove resolver duplication

Vite and Vitest currently duplicate the official Runtime capability list while TypeScript maps a
wildcard to the vendored declarations. After the in-flight release work settles, extract one
small generated/checked capability manifest consumed by both configs. The executable verifier
added in this slice prevents drift in the meantime.

### Runtime-side gaps to track, not patch here

The Runtime 1.12 capability surface now covers every Runtime symbol consumed by Ethic Brawl, so
the root-import exception set is empty. Future Runtime work should focus on reducing the remaining
consumer adapters where a shared higher-level primitive becomes a genuine semantic fit rather
than widening exports merely to satisfy this consumer. `verify-runtime-consumption.mjs` now
prevents regressions back to package-root imports across source and tests.
