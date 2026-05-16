# Social Arousal and Moving Story Environments

## Core loop

Story stages are no longer static backdrops. They are moving social pressure cookers:

1. The background scrolls through windows, balconies, bunker slits, lab glass, or broadcast panels.
2. Citizens comment through speech bubbles.
3. Their arousal can target the player, the stage boss, or both.
4. Player actions shift the social state.
5. The boss encounter may unlock, loop, weaken, or intensify depending on the crowd state.

## Axes

```text
collectivism:   -100 reactionary/private-order  <-> +100 communist/common-ownership
authority:      -100 anti-authoritarian         <-> +100 authoritarian/state-command
nationalism:       0 pluralist/international    <-> 100 nationalist/reactionary
insurgency:        0 passive grievance          <-> 100 immediate uprising demand
antiBoss:          0 acceptance of boss         <-> 100 uprising demand against boss
antiPlayer:        0 acceptance of player       <-> 100 hatred of player
volatility:        0 talk only                  <-> 100 direct street action
```

## Ideology colors

```text
quietist            low insurgency; complaint without action
insurgent           anti-authoritarian + high direct action; anarchist/insurrectionary color
fascist             nationalist + authoritarian + reactionary color
council_communist   communist + anti-authoritarian; workers councils, local assemblies
bolshevist          communist + authoritarian; party/state-command color
liberal_civic       moderate uprising under civic/legal frames
boss_loyalist       order-first crowd that supports or tolerates the stage boss
```

## Moving environment outputs

```text
antiPlayer high:
  - speech bubbles against player
  - stones from windows
  - molotovs/fire lanes
  - small group ambushes

antiBoss high + player accepted:
  - speech bubbles against boss
  - traps against enemies
  - allied citizens emerge
  - items dropped from windows

boss gate not satisfied:
  - infinite unrest wave continues
  - extra citizen/enemy waves spawn until enough antiBoss and not too much antiPlayer

boss appearance/difficulty:
  - beloved_strongman: crowd supports order; harder boss, more guards
  - guarded_commander: unresolved social split; medium harder boss
  - isolated_tyrant: neutral baseline
  - besieged_overseer: crowd pressures boss; weaker boss, support against enemies
```

## Character and stage fit

Character acceptance is intentionally contextual:

- Camus in a 1789-like anti-authoritarian street is more accepted by insurgents.
- Machiavelli in a Barcelona-1936-like anti-authoritarian crowd is suspected of coup logic.
- Machiavelli near authoritarian lobbies can be more legible and temporarily accepted.
- Leibniz is trusted more in lab/technical contexts than ruined survivalist contexts.
- Diogenes is strongest in street/poverty contexts and weakest in elite lobbies.

The model supports this with per-stage `characterAffinities` and per-ideology action multipliers.
