# Equipment rendering shortcuts for Ethic Brawl

## Decision

Do **not** draw every character with every item.

Use a layered equipment system:

```text
final frame = character body frame + hand anchor + item overlay + optional VFX/projectile
```

This avoids combinatorial asset explosion while still allowing pipes, uzis, bats, katanas, molotovs, grenades, boulders, rocket launchers, and minidrones to work across the roster.

## Why

If we author every character/item combination directly, the count explodes:

```text
characters × animations × frames × items
```

With 16 characters, 12 useful item/action clips, 4 to 8 frames per clip, and 9 items, that quickly becomes thousands of custom frames. It also means every new item forces a full roster art pass.

The better production model is:

```text
characters × base animations
+ items × overlay animations
+ small per-character anchor metadata
```

## Recommended shortcut stack

### 1. Weapon/item overlays

Draw each item once as its own tiny alpha sprite sheet:

```text
assets/sprites/items/pipe.png
assets/sprites/items/uzi.png
assets/sprites/items/bat.png
assets/sprites/items/katana.png
assets/sprites/items/molotov.png
assets/sprites/items/grenade.png
assets/sprites/items/boulder.png
assets/sprites/items/rocket_launcher.png
assets/sprites/items/minidrone.png
```

Each item sheet should contain a small set of angles or animation frames, not character-specific versions.

Suggested item sheet layout:

```text
4 columns × 2 rows
row 1: idle/held, windup, active, recovery
row 2: pickup/world, thrown/fired, impact/empty, icon pose
```

For larger items such as boulder and rocket launcher, add character-size compatibility rules instead of redrawing every pose.

### 2. Hand-anchor metadata per character and clip

Each character frame gets anchor points:

```yaml
frame: strike_jab_02
right_hand:
  x: 78
  y: 64
  angle_deg: -12
  behind_body: false
left_hand:
  x: 61
  y: 67
  angle_deg: 8
  behind_body: true
```

At render time, place the item at the hand anchor, rotated and flipped with the character.

Minimum anchors:

```text
right_hand, left_hand, torso, mouth_or_face, feet, muzzle_or_throw_origin
```

For Ethic Brawl, start with hand anchors only and add muzzle/throw anchors when ranged items enter combat.

### 3. Shared item action poses

Characters do not need unique item animations for every weapon. Give them a small universal set:

```text
carry_light      pipe, bat, katana, grenade, molotov
carry_heavy      boulder, rocket launcher
swing_light      pipe, bat, katana
throw_light      grenade, molotov
shoot_1h         uzi
shoot_2h         rocket launcher
deploy           minidrone
pickup/drop      all items
```

The philosopher/personality layer can still affect timing, posture, VFX, and recovery without requiring custom item art.

### 4. Socketed render layers

Render in layers:

```text
shadow
back arm / back clothing
back item part, if needed
body sprite
front item
front arm / hand cover, if authored
muzzle flash / swing arc / projectile
```

This solves most visual overlap problems without bespoke redraws.

### 5. Silhouette masking only for hero-quality frames

For important characters or promo shots, optionally draw a few custom overlay-mask frames:

```text
custom hand cover layer
custom sleeve overlap layer
custom two-hand grip correction
```

Use these only for high-value clips such as katana special, rocket launcher fire, or Camus/Machiavelli signature moves.

## Item-specific notes

| Item | Best implementation | Notes |
|---|---|---|
| pipe | overlay melee | simple, works with swing_light |
| bat | overlay melee | already close to existing weapon family |
| katana | overlay melee + slash VFX | use blade angle plus separate arc VFX |
| uzi | overlay ranged + muzzle flash | one-hand shoot pose, projectile emitter |
| molotov cocktail | overlay throwable + flame VFX | draw bottle in hand only until throw frame |
| grenade | overlay throwable + fuse/arc VFX | tiny item, can be icon-like in hand |
| boulder | heavy carried prop | restrict to heavy carry/throw poses |
| rocket launcher | two-hand heavy overlay | needs body pose family, not per-character redraw |
| minidrone | deployable actor | after deploy, it becomes its own sprite/AI entity |

## Current project fit

The current item code already separates item definitions from characters. Weapon support currently models weapon effects by family rather than by hard-drawn sprites, with families such as sword, bat, and mace in `src/game/items/item-system.ts`, and catalogue entries such as short swords, bat, and mace in `src/content/items/item-data.ts`.

That is a good foundation. The missing piece is visual equipment rendering:

```text
ItemDefinition.effect.family
→ ItemVisualDefinition
→ item sprite overlay + anchor rules + action pose family
```

## Proposed data shape

```ts
export type ItemVisualKind =
  | 'melee_overlay'
  | 'ranged_overlay'
  | 'throwable_overlay'
  | 'heavy_prop'
  | 'deployable_actor';

export interface ItemVisualDefinition {
  itemId: string;
  kind: ItemVisualKind;
  spriteSheet: string;
  defaultLayer: 'behind_body' | 'front_hand' | 'vfx' | 'actor';
  anchor: 'right_hand' | 'left_hand' | 'both_hands' | 'throw_origin' | 'deploy_origin';
  compatiblePoseFamily: 'carry_light' | 'carry_heavy' | 'swing_light' | 'throw_light' | 'shoot_1h' | 'shoot_2h' | 'deploy';
  pivot: { x: number; y: number };
  scale: number;
  gripAngleDeg: number;
}
```

## Production workflow

1. Draw base character sheets empty-handed.
2. Add a small anchor pass for the shared item poses.
3. Draw one alpha sheet per item.
4. Add runtime render overlays.
5. Add VFX/projectile actors separately.
6. Only hand-author exceptions when a pose looks wrong enough to matter.

## Practical rule

Use custom character-with-item art only when the item changes the full-body silhouette in a way sockets cannot solve:

```text
rocket launcher bracing
boulder overhead carry
signature katana flourish
boss-only weapon stance
```

Everything else should be overlay-driven.
