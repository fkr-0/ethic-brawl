# Ethic Brawl Workspace Agent Prompt — Sprite Remediation

Snapshot date: 2026-08-01

Use the following as the operating prompt for a ChatGPT Workspace Agent with image generation/editing and the `@projmgrauth` ws-bridge MCP connected.

---

You are completing and repairing the production sprite pipeline for the local project `ethic-brawl` at `/home/user/work/code/artifacts/ethic-brawl`.

Use the shared `sprite-render` skill for the entire task. A generated image in chat is not a completed asset. A sheet is complete only after the original PNG bytes are transferred to the exact declared repository path, the transfer hash matches, structural and visual review pass, the relevant manifest is updated, and repository checks succeed.

## Safety and repository state

The checkout may already contain extensive in-progress sprite, manifest, runtime, and test changes. Before doing anything:

1. open the existing project workspace once;
2. inspect Git status and active path claims;
3. preserve all unrelated working-tree changes;
4. do not reset, clean, delete, mass-format, or overwrite existing files;
5. claim each output PNG and related manifest before writing;
6. treat generated job files as generated sources: change the prompt pack or character bible and regenerate rather than hand-editing them;
7. never substitute placeholders, duplicated frames, screenshots, or procedural silhouettes for requested renders.

If `bridge.yml` validation prevents project-presence registration, report the manifest defect and continue only with explicit non-overlapping path claims. Do not silently rewrite the manifest as part of sprite work.

## Canonical sources

Use these files as the source of truth:

- `docs/prompts/fighter-animation-v2/render-jobs/manifest.json`
- `docs/prompts/fighter-animation-v2/render-jobs/<character>/<prompt-id>.md`
- `docs/prompts/fighter-animation-v2/prompt-pack.yml`
- `docs/prompts/fighter-animation-v2/atlas-manifest.template.yml`
- `characters/<character>/prompts.yml`
- `characters/<character>/animation-v2.atlas.json`
- `characters/<character>/animation-v2.actions.json`
- `assets/sprites/roster/<character>/source/animation-v2/`
- `scripts/curate-animation-v2-fullset.py`
- `scripts/build-character-animation-v2.py`

The declared corpus contains 18 characters × 13 sheets = 234 jobs. Every accepted output must be a decodable 1024×1024 RGBA PNG with true transparency, a perfect 4×4 row-major grid, 16 nonempty cells, stable identity/root/camera, and no cross-cell content.

## Verified current snapshot

Recompute this inventory before editing; the following is only the 2026-08-01 baseline:

```yaml
jobs: 234
outputs_present: 177
outputs_missing: 57
present_outputs_structurally_invalid: 0
present_outputs_with_empty_cells: 0
present_outputs_with_one_or_more_edge_contacts: 130
present_outputs_with_exact_duplicate_cells: 26
cross_file_exact_duplicate_groups: 0
frontmatter:
  pending_render: 234
  output_exists_but_still_pending: 177
```

The generated prompt corpus is current, and these read-only checks passed at the snapshot:

```text
pnpm prompts:v2:check
pnpm assets:fullset-v2:check
pnpm assets:animation-v2:check
pnpm assets:check
```

Do not infer artistic acceptance from those green structural gates.

## Missing-output pattern

For every character except Anselm, the three missing declared outputs are:

```text
mobility_evasion_throw_4x4
guard_parry_break_4x4
reactions_knockdown_4x4
```

Anselm is additionally missing:

```text
normal_attacks_4x4
item_interactions_4x4
special_effects_4x4
```

This totals 57 missing outputs.

### Existing selected candidates

Fifty-three missing outputs already have a candidate under:

```text
docs/prompts/fighter-animation-v2/render-jobs/<character>/selected/<prompt-id>.png
```

Nineteen selected candidates already satisfy the basic 1024×1024 RGBA/alpha contract:

```text
aristotle/guard_parry_break_4x4
bakunin/mobility_evasion_throw_4x4
bakunin/reactions_knockdown_4x4
camus/reactions_knockdown_4x4
deleuze_guattari/mobility_evasion_throw_4x4
foucault/mobility_evasion_throw_4x4
foucault/reactions_knockdown_4x4
hegel/guard_parry_break_4x4
hegel/reactions_knockdown_4x4
kant/guard_parry_break_4x4
kierkegaard/guard_parry_break_4x4
leibniz/mobility_evasion_throw_4x4
leibniz/guard_parry_break_4x4
leibniz/reactions_knockdown_4x4
machiavelli/guard_parry_break_4x4
machiavelli/reactions_knockdown_4x4
marx/reactions_knockdown_4x4
socrates/reactions_knockdown_4x4
stirner/guard_parry_break_4x4
```

These may be curated and copied to their declared output paths only after semantic, frame-order, duplicate-frame, containment, and provenance review. Structural dimensions alone are not acceptance.

Thirty-four selected candidates are nonconforming source material. Most are 1254×1254 RGB with no alpha. One Anselm reaction candidate is 1024×1536 RGBA. Do not blindly resize, crop, or turn a white/checkerboard background transparent. Preserve the raw source and choose one of:

- lossless cleanup when the 4×4 cell geometry and foreground separation are unambiguous;
- image editing with explicit alpha reconstruction and per-cell containment review;
- rerender when cleanup would redraw anatomy, destroy pixel structure, infer missing frames, or leave ambiguous grid geometry.

Four Anselm jobs have no selected candidate and require a genuine new render or edit derived from approved references:

```text
anselm/normal_attacks_4x4
anselm/mobility_evasion_throw_4x4
anselm/item_interactions_4x4
anselm/special_effects_4x4
```

## High-priority defects in present sheets

### Exact duplicate-cell review

Exact duplicates can be intentional holds, but entire semantic rows or whole sheets duplicated byte-for-byte are presumptively broken. Inspect these first and rerender or repair only where motion semantics are absent:

```text
aristotle/run_start_loop_stop_4x4       # all 16 cells repeat
kant/idle_turn_4x4                       # all 16 cells repeat
nietzsche/walk_forward_backward_4x4      # all 16 cells repeat
socrates/idle_turn_4x4                   # all 16 cells repeat
socrates/walk_forward_backward_4x4       # all 16 cells repeat
socrates/run_start_loop_stop_4x4         # nearly all cells repeat
```

Also review the remaining duplicate-flagged sheets reported by a fresh cell-hash audit, especially Schmitt locomotion/defense, Machiavelli landing recovery, Foucault item interactions, and repeated special-effect phases. Do not reject a sheet solely because two legitimate hold frames match; judge the clip contract.

### Cell-edge containment

The baseline found alpha touching one or more cell boundaries in 130 of 177 present sheets. This is a conservative warning, not an automatic rejection, but all-16-frame contact is a strong clipping or cross-cell-bleed signal for character sheets.

Prioritize visual/geometry review of all-frame contacts in:

- Schmitt locomotion, jump, lane/guard/crouch, and specials;
- Socrates lane/guard/crouch and item interactions;
- Stirner lane/guard/crouch and special effects;
- Leibniz walk/run;
- Kierkegaard walk and specials;
- Hegel normal attacks, item interactions, specials, and special effects;
- Foucault item interactions and specials;
- Diogenes idle, walk, and item interactions;
- Deleuze/Guattari jump, item interactions, and specials;
- Bakunin normal attacks, specials, and special effects;
- Camus intro/taunt/victory/defeat;
- Kant special effects.

For isolated VFX sheets, contact may be visually acceptable only if the effect remains inside its logical cell and no pixel leaks into an adjacent frame. For character sheets, preserve feet, props, and attacks while adding safe transparent padding or rerendering at a smaller stable scale; do not crop anatomy.

## Workspace-Agent transfer protocol

Do not send binary image data through the model context.

### Download references

1. Use `transfer_prepare_download` with `projectPath`, the narrowest `include` set for one character or one sheet, and bounded `maxFiles`/`maxBytes`: the render job, approved references, character bible, relevant manifest, and validation configuration.
2. Follow the returned one-time GET URL.
3. Verify archive byte count and SHA-256 before extraction.
4. Reuse invariant character references across that character's batch.

### Upload a generated or repaired sheet

1. Preserve the original renderer/edit source in the project-defined provenance location when cleanup is performed.
2. Compute the final PNG's exact byte count and SHA-256.
3. Call `transfer_prepare_upload` with `projectPath`, exact declared `targetPath`, exact `sizeBytes`, `sha256`, `mediaType: image/png`, and the selected `overwrite` policy.
4. Use `overwrite: never` for a missing output, `identical-only` for an uncertain idempotent retry, and `replace` only for an explicitly reviewed repair of an existing file.
5. Follow the returned PUT URL with the exact bytes.
6. Call `transfer_get_status` with the returned `transferId` and require `state: completed`, matching `observedSizeBytes`, and matching `observedSha256`.
7. Verify the project-side hash before running validation.

Before generating a batch, prove this full data-plane round trip with one representative missing sheet. If the Workspace Agent cannot execute arbitrary GET/PUT URLs, stop before spending more image-generation tokens and report the capability gap. Do not replace the transfer with a screenshot, base64 pasted into chat, or a sprite-specific transport hack.

## Execution order

1. Recompute the 234-job inventory from the manifest and current filesystem.
2. Reconcile concurrent working-tree changes and claim only selected output/manifests.
3. Complete one transfer preflight using one of the 19 structurally valid selected candidates.
4. Review and integrate the remaining 18 structurally valid candidates.
5. Triage the 34 malformed selected candidates into safe cleanup versus rerender; process the safest, highest-value subset first.
6. Generate the four genuinely absent Anselm sheets.
7. Review exact duplicate-frame defects; rerender only failed semantic sheets/rows.
8. Resolve severe character-sheet edge containment, prioritizing all-frame contact.
9. Update curation receipts, hashes, source/public copies, action maps, and runtime mappings only for accepted sheets.
10. Update render-job status through the generator's source data or a repository-approved evidence mechanism; do not hand-edit generated job files.
11. Generate deterministic contact sheets and gameplay-scale loop previews.
12. Run the narrow checks, sprite runtime tests, browser E2E, and production build.

## Required checks

Use the narrowest relevant checks during iteration, then at minimum run:

```text
pnpm prompts:v2:check
pnpm assets:fullset-v2:check
pnpm assets:animation-v2:check
pnpm assets:check
pnpm test:run -- tests/unit/sprite-atlas-grid.test.ts tests/unit/sprite-runtime-inspection.test.ts tests/unit/release-content-contract.test.ts tests/unit/release-readiness.test.ts
pnpm test:e2e:sprites
pnpm test:e2e:sprite-review
pnpm typecheck
pnpm build
```

Do not update visual baselines merely to make tests pass. Review changed screenshots first.

## Completion evidence

Return a compact machine-readable and human-readable report containing:

```yaml
inventory:
  total_jobs: 234
  present_before: integer
  present_after: integer
  missing_after: [job_ids]
rendered: [job_ids]
repaired: [job_ids]
accepted: [job_ids]
rejected:
  - job_id: string
    reason: string
transfers:
  - job_id: string
    transfer_id: string
    target: string
    size_bytes: integer
    sha256: string
validation:
  commands: [{command: string, result: pass|fail}]
  duplicate_warnings_remaining: integer
  edge_contact_warnings_remaining: integer
runtime:
  integrated_clips: [clip_ids]
  legacy_fallbacks_remaining: [clip_ids]
provenance_gaps: [strings]
```

Never claim the full sprite bank is production-complete while missing outputs, unresolved duplicate-motion defects, unreviewed all-frame edge contacts, stale provenance, or legacy runtime fallbacks remain.
