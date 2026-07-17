# Ethic Brawl 1.1.0 — Babylon Release Candidate

Ethic Brawl 1.1.0 is the first release-shaped vertical slice: a polished local-versus mode and one complete three-encounter Story Mode route through Babylon.

## Playable content

- **13 fighters:** Camus, Machiavelli, Diogenes, Leibniz, Foucault, Deleuze & Guattari, Marx, Bakunin, Schmitt, Socrates, Kant, Kierkegaard, and Stirner.
- **Complete command kits:** every fighter has a three-hit authored normal chain and four distinct command specials.
- **Local versus:** two-player selection from the full release roster.
- **Story — Babylon:** Market Procession, Archive Lockdown, and Gate Judgment, with escalating AI and distinct fight rules.
- **Clear rewards:** choose a life potion, rusted short sword, or Stoic Body book after the final encounter.

## Art and presentation

- Enhanced production sprite sheets replace the missing Stirner, Kierkegaard, and Deleuze & Guattari banks.
- Every release fighter has a 16-frame extended animation bank for attacks, aerial motion, defense, damage, recovery, and victory.
- All 12 story enemy archetypes have explicit idle, advance, attack, and hurt frames.
- All 31 catalog items have stable icon-atlas slots.
- Character select exposes stats, normal chains, command inputs, special names, and gimmicks without leaving the screen.
- Stage placards show enemy intel, threat level, and the active encounter rules.

## Campaign boundary

Babylon is the only playable story route in 1.1.0. Babylon: Postapocalypse, The Sprawl, Arcology Entrance, Arcology Labs, and Arcology Penthouse remain authored data previews and are visibly locked. This release does not present the current two-fighter encounter simulation as finished multi-enemy combat.

## Release verification

```bash
pnpm assets:check
pnpm release:check
```

The release gate validates required art, formatting, types, unit tests, the production build, and browser-level Stage One and sprite-animation flows.

