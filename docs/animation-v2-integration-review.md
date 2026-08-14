# Animation v2 integration review

Review date: 2026-07-21

## Status definitions

- **Rendered**: one or more image sheets exist beside the generated render-job Markdown.
- **Locomotion-pack-complete**: the five currently supported role sources are selected: idle/turn, walk, run, jump/landing, and lane/guard/crouch.
- **Full prompt coverage**: all 13 Animation v2 render jobs exist for the character, covering 208 prompted frames including combat, items, reactions, specials, isolated VFX, and presentation.
- **Runtime-integrated**: normalized RGBA locomotion/defense sheets are loaded by `sprite-integration.ts` and combined with legacy combat fallback frames.
- **Production-accepted**: the repository review checklist is complete, including provenance, gameplay-scale contact sheets, and looping previews.

Runtime integration and production acceptance are intentionally separate. Imperfect generated material can be made safe and usable without claiming that it is final art.

## Executive matrix

| Character | Rendered/selected v2 sheets | Runtime frames | Cell-edge contacts after curation | Result |
|---|---:|---:|---:|---|
| Aquinas | 5/13 | 80 authored + 32 legacy | 0 | Integrated; explicit root/scale curation; gameplay review pending |
| Aristotle | 5/13 | 80 authored + 32 legacy | 0 | Integrated; alternate walk rejected; gameplay review pending |
| Bakunin | 5/13 | 80 authored + 32 legacy | 58 | Integrated; raw normalization remains visually provisional |
| Camus | 5/13 | 80 authored + 32 legacy | 0 | Integrated provisionally; run/defense roles inferred from unnamed candidates |
| Foucault | 5/13 | 80 authored + 32 legacy | 0 | Integrated provisionally; walk required aggressive salvage |
| Hegel | 5/13 | 80 authored + 32 legacy | 56 | Integrated; raw normalization remains visually provisional; outside release roster |
| Kant | 5/13 from 6 locomotion candidates | 80 authored + 32 legacy | 0 | Integrated and curated; gameplay review pending |
| Machiavelli | 5/13 from 6 locomotion candidates | 80 authored + 32 legacy | 0 | Integrated and curated; mixed combat sheet excluded |
| Marx | 5/13 | 80 authored + 32 legacy | 0 | Integrated and curated |
| Nietzsche | 5/13 | 80 authored + 16 legacy | 1 | Integrated and curated; one remaining boundary contact |
| Socrates | 5/13 from 6 locomotion candidates | 80 authored + 32 legacy | 0 | Integrated and curated |
| Stirner | 5/13 | 80 authored + 32 legacy | 47 | Integrated; 5x4 defense salvage remains provisional |
| Anselm | 0/13 | legacy only | — | Full 13-job prompt pack; renders missing |
| Deleuze/Guattari | 0/13 | legacy only | — | Full 13-job prompt pack; renders missing |
| Kierkegaard | 0/13 | legacy only | — | Full 13-job prompt pack; renders missing |
| Schmitt | 0/13 | legacy only | — | Full 13-job prompt pack; renders missing |
| Diogenes | 0/13 | legacy only | — | New full prompt bible and 13 render jobs; renders missing |
| Leibniz | 0/13 | legacy only | — | New full prompt bible and 13 render jobs; renders missing |

The generated runtime Animation v2 bank contains **960 authored locomotion/defense frames across 12 characters**. Every generated runtime sheet is 1024×1024 RGBA, every frame is nonblank, and asset/public copies are hash-identical. Separately, the complete prompt corpus now contains **234 render jobs for 18 characters**, defining **3,744 prospective frames** across 13 sheets per character.

## Newly integrated from render-job directories

### Aquinas

Sources are the five extensionless images under the historical `aquinas/aqquin/` directory. The explicit curation file reconstructs a symmetric idle loop, mirrors the turn return, applies stable grounded baselines, and preserves a deliberate jump arc.

- Curation: `characters/aquinas/animation-v2.atlas.json`
- Generated frames: 80
- Structural result: zero blank frames and zero runtime-cell edge contacts
- Runtime: complete Animation v2 profile with legacy core/extended combat fallback

Result: **runtime-ready; gameplay-scale loop review remains required**.

### Aristotle

Six candidates were reviewed. `aristotle/walk` is selected; `aristotle/walk2` is rejected because its transparent figures cross source-cell boundaries. The only role-correct run and jump sources are retained with explicit fitting, edge cleanup, and root alignment.

- Curation: `characters/aristotle/animation-v2.atlas.json`
- Generated frames: 80
- Structural result: zero blank frames and zero runtime-cell edge contacts
- Known risk: run/jump source drawings were oversized before curation

Result: **runtime-ready; run and jump should receive close visual review or later rerenders**.

### Camus

The named idle, walk, and jump files are unambiguous. Two remaining roles required candidate review:

- run: `037_upload_file_00000000b10882469aec5f59154557a8.png`; candidate 038 is byte-identical;
- lane/guard/crouch: `015_upload_file_00000000deac81f4b2a157eb3846dead.png`.

The run choice is based on its broad stride silhouettes and start/loop/brake row structure. The defense choice is based on its compressed third row and stable upright guard row. Candidates 032 and 035 contain pervasive translucent checker/noise; candidate 033 has severe cross-cell slicing; candidate 039 reads as an idle-like alternate.

- Curation: `characters/camus/animation-v2.atlas.json`
- Generated frames: 80
- Structural result: zero blank frames and zero runtime-cell edge contacts
- Confidence: lower than filename-backed packs because two role assignments are inferred

Result: **runtime-integrated provisionally; human loop review or dedicated rerenders should confirm run and defense semantics**.

### Foucault

The five stable input paths are the historically misspelled `focault_*` aliases. Their hashes are recorded in the curation file rather than silently renaming provenance.

The walk source touched source-cell boundaries in every frame. It was retained as the only explicit walk render, scaled conservatively, centered, and cleaned only at connected translucent edges. The other four roles retain authored row order with explicit root/scale normalization.

- Curation: `characters/foucault/animation-v2.atlas.json`
- Generated frames: 80
- Structural result: zero blank frames and zero runtime-cell edge contacts
- Known risk: walk is a salvage of a badly contained source, not a substitute for a clean rerender

Result: **runtime-integrated provisionally; walk is the highest-priority rerender among the newly added packs**.

## Previously integrated packs

### Curated and cleanly contained

Kant, Machiavelli, Marx, and Socrates each provide five selected sheets, explicit source/frame curation, 80 authored movement/defense frames, and zero runtime-cell edge contacts. Nietzsche is similarly integrated but has one remaining edge-contact warning. Their attacks, specials, reactions, knockdown/get-up, and victory continue to use legacy art.

### Integrated but still source-limited

- **Bakunin:** complete five-sheet runtime profile, but 58 authored frame bounds still touch a cell edge after raw normalization.
- **Hegel:** complete five-sheet runtime profile, but 56 authored frame bounds still touch a cell edge. Hegel is also outside `RELEASE_ROSTER_IDS`.
- **Stirner:** complete profile using a salvaged 5x4 defense source; 47 frame bounds still touch a cell edge.

These characters are functional, but should receive the same explicit per-frame scale/root pass used for the cleanly contained packs.

## Runtime behavior

For complete Animation v2 profiles the runtime loads five authored 4x4 sheets first, then appends the legacy core sheet and optional extended sheet. The result is normally:

- frames 0–79: authored idle, turn, walk, run, jump, landing, lane movement, crouch, and guard;
- frames 80–111: legacy attacks, specials, reactions, knockdown/get-up, and victory.

Nietzsche has no extended legacy sheet and therefore ends at frame 95. Movement direction selects forward or backward walk, run transitions through start/loop/stop, turning uses authored turn clips, and landing divides its interval between impact and recovery.

## Builder and validation

`scripts/build-character-animation-v2.py` now supports all 12 integrated characters and records:

- selected source path and SHA-256;
- source grid and selected source frame for every output frame;
- per-frame scale and integer root offset;
- output hashes, visible bounds, and coverage;
- clip definitions and curation receipt hashes;
- identical source/public output validation.

Useful commands:

```sh
pnpm assets:animation-v2
pnpm assets:animation-v2:check

pnpm assets:aquinas-v2
pnpm assets:aristotle-v2
pnpm assets:camus-v2
pnpm assets:foucault-v2
```

## Formal acceptance still missing

No pack should yet be described as fully production-accepted because repository-wide acceptance artifacts remain incomplete:

- render-job Markdown still says `pending_render` for many now-selected sources;
- model, seed, reference, and manual-edit provenance is incomplete;
- v2-specific gameplay-scale contact sheets and looping previews are not generated automatically;
- the eight newly specified combat, item, reaction, special, VFX, and presentation sheets remain unrendered or not yet runtime-mapped;
- combat animation therefore remains legacy art in the current runtime;
- Camus role inference and Foucault walk salvage need explicit human visual approval;
- Bakunin, Hegel, Stirner, and Nietzsche still have one or more edge-contact warnings.

## Recommended next order

1. Generate automated per-character contact sheets and loop previews from each manifest.
2. Review Camus run/defense semantics in motion and rerender either role if the inferred mapping is wrong.
3. Rerender Foucault walk with strict containment.
4. Apply explicit scale/root curation to Bakunin and Hegel.
5. Replace Stirner's 5x4 defense salvage with a conforming 4x4 render.
6. Resolve Nietzsche's final boundary contact.
7. Render the five locomotion/defense sheets for Anselm, Deleuze/Guattari, Kierkegaard, Schmitt, Diogenes, and Leibniz.
8. Render and curate the eight new combat, mobility, item, detailed-defense, reaction, special-caster, special-effect, and presentation sheets for all characters.
9. Extend the runtime atlas and state/command mappings to consume the approved full 13-sheet banks instead of legacy combat fallbacks.
