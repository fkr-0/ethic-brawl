# ADR 0002: Load the native renderer as an optional capability

- **Status:** Accepted
- **Date:** 2026-07-23
- **Scope:** Application entry, Pixi bridge, Vite chunking, release checks, browser diagnostics

## Context

The native Pixi bridge is opt-in, but the application entry imported it through the general render barrel. Vite therefore placed Pixi in the static entry graph and generated a page-level module preload even when the user selected the default Canvas renderer.

The result violated the intended architecture: an experimental backend consumed download, parse, and module-initialization resources during every normal session.

## Decision

The native renderer is represented by three layers:

```text
ethic-pixi-contract.ts
  └─ renderer-neutral TypeScript interfaces only

ethic-pixi-loader.ts
  ├─ resolves the explicit renderer preference
  ├─ dynamically imports the implementation
  ├─ returns disabled / ready / failed diagnostics
  └─ fails soft to Canvas2D

ethic-pixi-bridge.ts
  └─ owns Pixi imports and native renderer construction
```

The general render barrel exports only the contract and loader. It never re-exports the implementation module.

Pixi is not assigned to a forced Rollup manual chunk. The dynamic bridge entry owns its Pixi dependency graph, allowing Pixi's renderer-specific modules to remain nested dynamic chunks and preventing Vite's preload helper from creating a static entry dependency.

## Release invariants

`pnpm bundle:check` reads `dist/.vite/manifest.json` and fails when:

- the native renderer is not a dynamic entry;
- an optional-renderer asset enters the initial import closure;
- `index.html` references an optional-renderer asset;
- the entry exceeds 90 KiB;
- the complete initial graph exceeds 400 KiB;
- the exclusive optional-renderer graph exceeds 640 KiB.

Browser tests additionally prove that Canvas mode makes no optional-renderer requests and that bridge mode loads successfully only after explicit opt-in.

## Consequences

### Positive

- Canvas users pay no network or module-init cost for Pixi.
- Renderer initialization failures no longer abort application startup.
- Bundle ownership is measurable and release-enforced.
- The optional backend can evolve without contaminating the authoritative entry path.

### Costs

- The bridge API must remain behind a small renderer-neutral contract.
- Dynamic-loading diagnostics are part of the E2E probe and require compatibility maintenance.
- Bundle budgets must be deliberately revised when justified rather than bypassed by chunk renaming.
