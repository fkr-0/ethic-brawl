# ADR 0003: Canonical sprite source and review corpus

- **Status:** Accepted
- **Date:** 2026-07-24
- **Scope:** Runtime sprite loading, production packaging, render jobs, audit evidence, and review UX

## Context

The project maintained authored PNGs below `assets/sprites` while production also depended on manually copied files below the ignored `public/` tree. That split produced 112 browser 404s even though the corresponding fighter art existed elsewhere. A blanket copy would hide the drift but make the eager startup attempt roughly 167 MB of fighter art.

File existence also created false confidence: legacy fighter sheets had inconsistent dimensions, 20 sheets could not be divided into a true 4×4 grid, and declared item overlays and body poses had no rendered PNGs.

## Decision

1. `assets/sprites` is the only authored PNG source.
2. `scripts/sprite-asset-catalog.mjs` derives the runtime-facing asset catalog from code declarations.
3. the Vite build projects only existing catalog assets and writes a SHA-256 manifest; `public/` is not a second asset source;
4. normal and stage fights load only their selected matchup, while exhaustive sprite review must be invoked explicitly;
5. fighter and item prompt corpora are generated as one render job per output with exact geometry and provenance;
6. `assets:audit` produces JSON, Markdown, a contact sheet, and the searchable Sprite Signal Deck;
7. `assets:check` fails closed on missing source art, invalid dimensions, missing alpha, non-integral grids, decode failures, or empty required cells.

Warnings such as edge contact, duplicate cells, and partial alpha remain visible rather than automatically rejected because some effects, holds, and knockdowns can use them intentionally. They require contact-sheet and in-engine review.

## Consequences

- A prompt is not a render, and a render is not approval.
- Build packaging and audit use the same catalog, preventing source/deployment drift.
- Players do not pay the full-roster review cost at startup.
- New runtime sprite declarations automatically enter the audit and production projection.
- Release remains blocked until every hard error is replaced by real, reviewed PNG output.
