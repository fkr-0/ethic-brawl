# Character Prompt Pack Review

## Scope

Review covers all 18 canonical character prompt bibles under `characters/<id>/prompts.yml` and the shared full-action Animation v2 generator under `docs/prompts/fighter-animation-v2/`.

Canonical roster IDs:

```text
anselm, aquinas, aristotle, bakunin, camus, deleuze_guattari,
diogenes, foucault, hegel, kant, kierkegaard, leibniz,
machiavelli, marx, nietzsche, schmitt, socrates, stirner
```

`leibniz` is canonical; `leibnitz` is retained only where historical source provenance requires it.

## Verdict

- All 18 character bibles satisfy the generator contract.
- Every bible defines a stable appearance, palette, animation identity, exactly three current normal moves, and exactly four current command specials.
- The shared pack generates 13 independent 4×4 sheets per character: 234 render jobs and 3,744 prospective frames in total.
- The prompts are feasible because each request has one narrow purpose, one exact grid, explicit phase ordering, true-alpha requirements, stable root/camera constraints, and compact VFX rules.
- Diogenes and Leibniz now have full canonical v2 bibles rather than relying on the malformed historical files under `roster/prompts/`.

## Coverage matrix

| Character | Identity bible | 3 normals | 4 specials | 13 v2 jobs | Main rendering risk |
|---|---|---:|---:|---:|---|
| Anselm | complete | yes | yes | yes | manuscript seals becoming text-like |
| Aquinas | complete | yes | yes | yes | heavy robe/codex silhouettes exceeding cells |
| Aristotle | complete | yes | yes | yes | staff and category geometry competing with the body |
| Bakunin | complete | yes | yes | yes | explosive props and smoke crossing cell edges |
| Camus | complete | yes | yes | yes | smoke effects obscuring compact counters |
| Deleuze/Guattari | complete | yes | yes | yes | double-character continuity and tangled effects |
| Diogenes | complete | yes | yes | yes | preserving an elderly ascetic identity; barrel/tub must remain temporary |
| Foucault | complete | yes | yes | yes | grids and institutional VFX becoming scenery |
| Hegel | complete | yes | yes | yes | dialectical effects overwhelming professor body mechanics |
| Kant | complete | yes | yes | yes | overly rigid poses or text-like law symbols |
| Kierkegaard | complete | yes | yes | yes | dramatic leap shapes exceeding cell bounds |
| Leibniz | complete | yes | yes | yes | monad geometry becoming readable equations or giant generic magic |
| Machiavelli | complete | yes | yes | yes | cloak silhouettes hiding attack contact poses |
| Marx | complete | yes | yes | yes | banner/factory effects becoming background scenery |
| Nietzsche | complete | yes | yes | yes | hammer, coat, and storm effects exceeding cells |
| Schmitt | complete | yes | yes | yes | border rectangles reading as frame lines |
| Socrates | complete | yes | yes | yes | understated gestures becoming near-duplicate poses |
| Stirner | complete | yes | yes | yes | deliberately comic motion losing anatomical readability |

## Full Animation v2 sheet vocabulary

The generated job set covers:

1. idle and turns;
2. forward/backward walk;
3. run start/loop/stop;
4. jump/land/recovery;
5. lane movement, crouch, and guard transition;
6. light, medium, heavy, and air attacks;
7. forward dash, backdash, evade, and empty-hand throw;
8. item pickup, throw, use, and swing;
9. held guard, parry, guard break, and counter;
10. light/heavy hitstun, knockdown, and get-up;
11. four character-specific special caster animations;
12. four isolated character-specific special effect sequences;
13. intro, taunt, victory, and defeat.

## Prompt-quality constraints retained

- Exact 4×4 grid, 16 cells, no gutters, margins, borders, labels, or numbers.
- True alpha background only.
- Stable character identity, scale, palette, lighting, root, and camera.
- Full body, props, items, and effects remain inside their cell.
- Effects are silhouette-secondary and use character-specific palette/mechanic language.
- Throw and reaction sheets do not draw a second complete opponent.
- Special caster and effect rows follow the exact structured move order from the character bible.

## Runtime boundary

The first five locomotion/defense sheets already have Animation v2 runtime support for integrated characters. The eight combat, interaction, reaction, special, effect, and presentation sheets are prompt-complete but still require rendered assets, curation, atlas offsets, and runtime mappings before they can replace legacy fallbacks.

## Remaining production work

1. Render the missing sheets and keep untouched generations beside curated outputs.
2. Generate contact sheets and loop previews at gameplay scale.
3. Record model, seed, references, and manual edits for each selected sheet.
4. Curate root, scale, baseline, alpha, and edge containment.
5. Extend the runtime manifest to consume the eight new sheet classes.
6. Validate every clip and special mapping in browser tests before removing legacy combat art.
