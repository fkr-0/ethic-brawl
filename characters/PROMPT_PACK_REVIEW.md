# Character Prompt Pack Review

## Scope

Review covers detailed character packs currently present under `characters/<id>/`: Camus, Machiavelli, Aristotle, Aquinas, Anselm, Hegel, and Nietzsche.

## Verdict

- The prompts are feasible for high-quality 4x4 grid generation because every prompt keeps one exact sheet, a fixed grid, transparent alpha, repeated identity constraints, no labels, and frame-by-frame pose maps.
- The strongest packs are Camus and Machiavelli because they are backed by runtime CharacterDefinition data plus existing source sheets.
- Aristotle, Aquinas, Anselm, and Hegel now have runtime CharacterDefinition entries, stats, normal chains, skill-tree generated specials, and placeholder source-sheet paths.
- Nietzsche now has runtime stats, normal chain, and specials; his visual/source-art side remains roadmap-derived and still needs a source sheet.

## Per-character review matrix

| Character | Biography | Visual design | Animation language | Specials | UI details | Prompt feasibility | Notes |
|---|---|---|---|---|---|---|---|
| camus | ok | ok | ok | ok | ok | feasible | Excellent: specific costume, smoke/sun/void identity, runtime specials, and four-grid breakdown are clear. |
| machiavelli | ok | ok | ok | ok | ok | feasible | Excellent: feint/cloak/trap identity is distinct; grid04 specials are especially renderable. |
| aristotle | ok | ok | ok | ok | ok | feasible | Good: staff/robe/golden category language is clear; avoid too many abstract geometry marks in one cell. |
| aquinas | ok | ok | ok | ok | ok | feasible | Good: heavy monk/codex/shield identity is strong; keep divine rays limited so the body remains readable. |
| anselm | ok | ok | ok | ok | ok | feasible | Good: narrow proof-mage identity is readable; manuscript seals should be simple, not text-like. |
| hegel | ok | ok | ok | ok | ok | feasible | Good: three-state identity is strong; render prompts should emphasize body pose over abstract state diagrams. |
| nietzsche | ok | ok | ok | ok | ok | feasible | Promising but source-light: hammer/moustache/storm identity is feasible; has runtime backing; still needs source sheet validation. |

## Prompt-quality constraints retained

- Exact 4x4 grid, 16 frames, no gutters/margins/borders.
- Transparent alpha background only.
- Same character identity, scale, palette, lighting, and pixel density across all cells.
- Each grid has a narrow purpose: movement, fighting, interaction/combos, specials.
- VFX is constrained to stay inside the cell and not obscure the body.

## Known risks and mitigations

| Risk | Mitigation already in prompts | Remaining action |
|---|---|---|
| LLM draws labels or text in cells | negative prompt forbids labels/text/UI | keep all frame labels outside the image prompt if renderer tends to draw text |
| Uneven grid or gutters | hard format requirements repeated in every common prefix | use post-generation grid validation/slicing script |
| Character drift across frames | repeated identity/costume/palette/scale constraints | feed a reference sheet or first approved frame when supported |
| Abstract philosopher effects become unreadable | prompts require silhouette-first VFX and limited palette | simplify VFX if first generations are noisy |
| Placeholder/non-runtime characters imply implementation | datasheets mark proposed/runtime status | add sprite source sheets and tune balance after gameplay trials |

## Recommended next cleanup

1. Normalize `focault` vs `foucault` across source files with aliases during migration.
2. Promote the new `characters/<id>/sprite-grid-manifest.json` structure into the renderer/atlas pipeline.
3. For each generated grid, run an automated check: dimensions divisible by 4, alpha background present, no nontransparent pixels outside expected cell bounds.
4. Add source sheets for Nietzsche and any other roadmap-only character before final sprite production.

## Enhancement v2: distinctive biography and prompt bible pass

The seven detailed packs now include richer biography, appearance bible, palette anchors, animation identity, item interaction descriptions, normal-move render notes, and startup/active/impact/recovery descriptions for all four MVP specials. Prompt sets were rewritten as v2 to be more distinctive while staying feasible: one exact 4x4 sheet, one pose per frame, stable costume/palette, compact VFX, no labels/text, and no cross-cell trails.

## Spriteless prompt-first expansion

Added v2 datasheets, prompt packs, sprite-grid manifests, and sprite-output folders for Foucault, Deleuze/Guattari, Marx, Bakunin, Schmitt, Socrates, Kant, Kierkegaard, and Stirner. These packs use roadmap MVP specials where available and mark source status explicitly. Foucault keeps the normalized `foucault` id while pointing to legacy `focault` source assets.
