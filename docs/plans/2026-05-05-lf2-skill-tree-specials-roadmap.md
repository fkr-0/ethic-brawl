# Ethic Brawl LF2-Style Skill Tree + Command Specials Roadmap

Status: design roadmap  
Scope: command-special skill tree, sprite prompt plan, projectile / elemental physics plan  
Design target: fast LF2-inspired readability, but expressed as Ethic Brawl philosopher mechanics

---

## 0. Design thesis

Ethic Brawl should support a small, readable command language that creates large expressive depth:

```txt
block + direction + attack/jump = special branch
```

The player should be able to learn one universal grammar, then discover each philosopher's ideology through different move meanings.

Core design rule:

```txt
same input slot  -> same tactical family
same philosopher -> distinct philosophical expression
```

Example:

```txt
B > A always means forward pressure / projectile / engage
Camus B > A  = Absurd Revolt counter-wave
Marx  B > A  = Manifesto Shockwave
Kant  B > A  = Universal Law Beam
```

---

## 1. Command legend

### 1.1 Button notation

```txt
B = Block / Defend
A = Attack
J = Jump
N = Neutral / no direction
> = Forward, relative to facing direction
< = Backward, relative to facing direction
^ = Up
v = Down
+ = simultaneous or near-simultaneous input
, = sequence window, default 8-12 frames
[h] = hold for charge variant
```

### 1.2 Core LF2-inspired command grid

These 8 commands are the first full skill-tree surface. Every philosopher should eventually have all 8, but MVP can ship 4 per character.

| Slot | Command | Tactical family | Typical cost | Design role |
|---:|---|---|---:|---|
| S1 | `B + > + A` | Forward special | 18 energy | projectile, dash strike, beam, advancing pressure |
| S2 | `B + < + A` | Reverse special | 16 energy | counter, retreat trap, reflector, anti-rush |
| S3 | `B + ^ + A` | Rising special | 20 energy | launcher, anti-air, vertical beam, jump-cancel starter |
| S4 | `B + v + A` | Ground special | 20 energy | AoE, mine, tremor, floor hazard |
| S5 | `B + > + J` | Mobility special | 14 energy | dash, phase, leap, cross-up, lane change |
| S6 | `B + < + J` | Escape special | 14 energy | backstep, parry jump, retreat teleport, decoy |
| S7 | `B + ^ + J` | Ascend / summon | 24 energy | storm, aura, air install, floating cast |
| S8 | `B + v + J` | Ultimate / stance | 35 energy | field, transformation, super, domain state |

### 1.3 Optional expert extensions

```txt
B + N + A    quick neutral burst / stance poke
B + N + J    stance swap / philosophy mode switch
B[h] + > + A charge projectile
B + >, > + A dash super
B + <, > + A reversal super
```

Do not add expert extensions until the first 8-command grid is stable.

---

## 2. Skill tree structure

Each philosopher has three upgrade layers:

```txt
root kit
  -> branch modifiers
      -> command special unlocks
          -> mastery mutators
```

### 2.1 Skill tree node schema

```ts
export type CommandSlot =
  | 'BFA' // block forward attack
  | 'BBA' // block back attack
  | 'BUA' // block up attack
  | 'BDA' // block down attack
  | 'BFJ' // block forward jump
  | 'BBJ' // block back jump
  | 'BUJ' // block up jump
  | 'BDJ'; // block down jump

export interface SkillNode {
  id: string;
  characterId: string;
  commandSlot: CommandSlot;
  displayName: string;
  tier: 1 | 2 | 3 | 4;
  energyCost: number;
  cooldownFrames: number;
  prerequisites: string[];
  tags: SpecialTag[];
  projectileId?: string;
  fieldId?: string;
  vfxPresetId: string;
  animationClipId: string;
  masteryMutators?: SkillMutator[];
}
```

### 2.2 Tactical tags

```txt
projectile
beam
orb
storm
field
counter
summon
buff
debuff
dash
teleport
launcher
anti_air
trap
chain
freeze
burn
shock
slow
armor
reflect
```

---

## 3. Launch roster + expansion roster

The user list contains 18 philosophers. Recommended production scope:

```txt
launch 12:
  camus, diogenes, leibniz, machiavelli, foucault,
  deleuze_guattari, marx, bakunin, schmitt, aristotle,
  socrates, kant

expansion 6:
  kierkegaard, plato, aquinas, anselm, hegel, nietzsche
```

Internal ID cleanup recommendation:

```txt
focault -> foucault      // add alias, do not break old assets
leibnitz -> leibniz      // add alias, do not break old assets
carl_schmidt -> schmitt  // user-facing title: Carl Schmitt
thomasaquin -> aquinas   // title: Thomas Aquinas
anselmcanterbury -> anselm
```

---

## 4. Command-special move map

### 4.1 Launch roster: 12 philosophers x 8 command slots

| Philosopher | B > A | B < A | B ^ A | B v A | B > J | B < J | B ^ J | B v J |
|---|---|---|---|---|---|---|---|---|
| Camus | Absurd Revolt Wave | Rebel Reversal | Sisyphus Uppercut | Void Groundbreak | Invincible Summer Dash | Cigarette Fade | Desert Sun Lift | The Absurd Domain |
| Diogenes | Lantern Truth Flash | Cynic Barrel Counter | Dog Bite Launcher | Barrel Roll Quake | Beggar's Scramble | Tub Retreat | Lantern Leap | Marketplace Shame Field |
| Leibniz | Monad Bolt | Possible World Mirror | Calculus Spiral | Optimism Mine | Pre-established Dash | Counterfactual Step | Monad Orbit | Best-World Engine |
| Machiavelli | Prince's Gambit Lunge | Court Intrigue Parry | Assassin's Ascension | Coup Trap | Opportunist Dash | Diplomatic Exit | Black Banner Rise | Statecraft Execution |
| Foucault | Discipline Beam | Panopticon Counter | Archive Spike | Prison Grid Field | Surveillance Slide | Discourse Escape | Clinic Lift | Biopower Zone |
| Deleuze/Guattari | Rhizome Lash | Deterritorialize Counter | Thousand Plateaus Rise | Desiring-Machine Field | Line-of-Flight Dash | Fold Escape | Assemblage Cyclone | Body-without-Organs Domain |
| Marx | Manifesto Shockwave | Dialectical Guard | Class Struggle Upper | Factory Floor Hazard | Proletarian Rush | Historical Retreat | Red Banner Rise | Revolution Field |
| Bakunin | Anarch Bomb | Authority Breaker | Riot Uppercut | Molotov Groundfire | Insurrection Dash | Black Flag Evade | Chaos Leap | No-Masters Firestorm |
| Carl Schmitt | Sovereign Beam | Exception Counter | Decision Upper | Border Wall Field | Emergency Advance | Jurist Withdrawal | Authority Lift | State of Exception |
| Aristotle | Golden Mean Palm | Teleology Counter | Prime Mover Lift | Category Trap | Peripatetic Step | Doctrine Retreat | Lyceum Arc | Virtue Balance Field |
| Socrates | Elenchus Bolt | Question Reversal | Gadfly Upper | Agora Trap | Dialogue Step | Apology Backstep | Daimonion Lift | Trial of Athens |
| Kant | Universal Law Beam | Noumenal Reflect | Sublime Upper | Duty Sigil | Categorical Dash | Critique Retreat | Starry-Heavens Rise | Kingdom of Ends |

### 4.2 Expansion roster: 6 philosophers x 8 command slots

| Philosopher | B > A | B < A | B ^ A | B v A | B > J | B < J | B ^ J | B v J |
|---|---|---|---|---|---|---|---|---|
| Kierkegaard | Leap-of-Faith Strike | Anxiety Counter | Either/Or Upper | Dread Pool | Faith Dash | Irony Retreat | Single-Individual Rise | Knight of Faith |
| Plato | Form Beam | Cave Shadow Counter | Ideal Ascent | Republic Circle | Symposium Step | Cave Retreat | Chariot Rise | Realm of Forms |
| Thomas Aquinas | Five Ways Ray | Scholastic Shield | Angelic Upper | Basilica Consecration | Summa Advance | Cloister Step | Divine Ladder | Prime Cause Field |
| Anselm | Ontological Ray | Greater-Than Counter | Proof Ascension | Abbey Seal | Necessary Step | Monastic Retreat | Proslogion Rise | That-Than-Which Field |
| Hegel | Thesis Bolt | Antithesis Reversal | Negation Upper | Dialectic Ground | Synthesis Dash | Spirit Retreat | Absolute Rise | World-Spirit Domain |
| Nietzsche | Hammer Aphorism | Eternal Return Counter | Zarathustra Upper | Abyss Field | Overman Rush | Dionysian Fade | Mountain Ascent | Will-to-Power Storm |

---

## 5. Physics system roadmap

### Phase P1: command resolver upgrade

Current command support already recognizes block-direction-attack and block-direction-jump. Extend to full directions.

```txt
src/game/fight/command-input.ts
  - add up/down/neutral command directions
  - add sequence buffer
  - add facing-relative conversion
  - add command priority rules
```

Priority rule:

```txt
perfect block > hitstun lock > command special > normal special > normal attack > movement
```

### Phase P2: special registry

Create:

```txt
src/content/specials/special-data.ts
src/game/specials/special-resolver.ts
src/game/specials/special-runtime.ts
src/game/specials/projectile-system.ts
src/game/specials/field-system.ts
src/game/specials/status-effects.ts
```

Data model:

```ts
export interface SpecialMoveDefinition {
  id: string;
  characterId: string;
  commandSlot: CommandSlot;
  displayName: string;
  energyCost: number;
  startupFrames: number;
  activeFrames: number;
  recoveryFrames: number;
  cancelWindows: CancelWindow[];
  hitPolicyPreset?: AttackHitPolicyPresetId;
  moveClassPreset?: AttackMoveClassPresetId;
  projectile?: ProjectileDefinition;
  field?: FieldDefinition;
  statusEffects?: StatusEffectDefinition[];
  animation: {
    casterClipId: string;
    vfxClipId?: string;
    impactClipId?: string;
  };
}
```

### Phase P3: projectile primitives

Projectile base fields:

```ts
export interface ProjectileDefinition {
  id: string;
  kind: ProjectileKind;
  speedX: number;
  speedY: number;
  accelerationX: number;
  accelerationY: number;
  lifetimeFrames: number;
  pierceCount: number;
  bounceCount: number;
  laneBehavior: 'same_lane' | 'adjacent_arc' | 'cross_lane' | 'all_lanes';
  collision: 'aabb' | 'circle' | 'ray' | 'chain';
  gravityScale: number;
  homingStrength?: number;
  chainRadius?: number;
  tickRate?: number;
}
```

Projectile kinds:

| Kind | Physics behavior | Rendering behavior | Examples |
|---|---|---|---|
| `magic_ball` | moving circle, optional arc, explodes on hit | orb sprite + trailing particles | Monad Bolt, Elenchus Bolt |
| `laser` | raycast / long AABB, instant or short sustain | beam segments + muzzle flare + impact flare | Universal Law Beam, Discipline Beam |
| `firestorm` | field emitter, repeated ticks, vertical turbulence | column sprites + ember particles | Bakunin ultimate, Nietzsche storm |
| `blizzard` | slow moving field, friction/slow status | snow ribbons + frost overlay | Kant sublime variant, Plato cave cold field |
| `chain_lightning` | first target ray, then nearest target jumps | branching bolts + flash frames | Leibniz monad chain, Hegel synthesis chain |
| `shockwave` | expanding ring / ground cone | dust ring + screen shake | Marx manifesto, Camus revolt |
| `trap_mine` | dormant object, trigger radius | sigil / barrel / glyph idle frame | Aristotle category trap, Machiavelli coup trap |
| `summon_field` | stationary aura, tick effect | domain overlay + symbol particles | Foucault biopower, Kant kingdom field |

### Phase P4: elemental status effects

```ts
export type StatusEffectId =
  | 'burn'
  | 'freeze'
  | 'shock'
  | 'slow'
  | 'silence'
  | 'confusion'
  | 'armor'
  | 'reflect'
  | 'exposed'
  | 'rooted';
```

Rules:

| Effect | Gameplay | Visual |
|---|---|---|
| burn | damage over time, removes ice | ember ticks, red/orange pixels |
| freeze | movement slow, can shatter on heavy hit | frost outline, icy ground |
| shock | brief stun or chain target marker | white/blue bolt flicker |
| slow | reduced acceleration + recovery penalty | blue-grey afterimage |
| silence | disables command specials briefly | broken glyph / muted aura |
| confusion | input inversion for 30-60 frames, story-only/AI-safe | purple ripple |
| armor | absorbs N hitstun events | gold shell flash |
| reflect | returns projectile ownership | mirror flash |
| exposed | extra intelligence damage taken | target reticle |
| rooted | no lane change / no dash | ground chains |

---

## 6. Sprite and VFX production plan

### 6.1 Required sprite asset categories

Each command special needs 3 layers:

```txt
caster sheet      = philosopher body animation
projectile sheet  = moving object / beam / orb / hazard
impact sheet      = hit spark / explosion / freeze / burn / chain hit
```

Recommended output format:

```txt
caster:     4x4 sheet, same rules as current character sheets
projectile: 4x4 sheet, transparent, loopable travel frames
impact:     4x4 sheet, transparent, one-shot impact frames
field:      4x4 or 8x4 sheet, transparent, loopable aura/hazard frames
```

### 6.2 Universal caster prompt template

```txt
Create a pixel-art sprite sheet for ETHIC BRAWL command special animation.

FORMAT:
- exact 4x4 grid, 16 frames
- transparent true alpha background
- one fighter only
- no UI, no text, no frame labels, no extra characters
- same camera, scale, lighting, and silhouette consistency across all cells

FRAME MAP:
Row 1: ready, command guard, gather energy, wind-up
Row 2: cast start, cast release, recoil, settle
Row 3: directional variant pose, airborne/ground variant pose, cancel pose, recovery pose
Row 4: empowered cast, overcharge pose, hit-confirm pose, final key pose

CHARACTER:
{{character_brief}}

SPECIAL:
{{special_name}} — {{special_description}}

VFX STYLE:
{{vfx_palette}}, readable at small size, effect attached to body silhouette only.
No projectile crossing cell boundaries; projectile is generated on separate VFX sheet.
```

### 6.3 Universal projectile prompt template

```txt
Create a transparent pixel-art VFX sprite sheet for ETHIC BRAWL.

FORMAT:
- exact 4x4 grid, 16 frames
- transparent true alpha background
- no character, no UI, no text, no logo
- centered projectile / effect, no clipping
- readable retro arcade fighting game style

VFX TYPE:
{{projectile_kind}}

BEHAVIOR READ:
{{physics_behavior}}

VISUAL PALETTE:
{{palette}}

FRAME MAP:
Row 1: spawn / ignition frames
Row 2: travel loop frames
Row 3: empowered / unstable travel frames
Row 4: impact / dissipate frames

NEGATIVE:
blurry, painterly, realistic, soft glow bloom, background, smoke covering entire sheet,
anti-aliased fringe, cropped particles, duplicate frames, text.
```

### 6.4 VFX prompt presets

#### Magic ball

```txt
VFX TYPE: magic_ball
BEHAVIOR READ: compact orb with clear travel direction, spinning internal glyphs, small particle trail, impact pop on final row
VISUAL PALETTE: philosopher-specific core color plus white-hot center and dark outline pixels
```

#### Laser / beam

```txt
VFX TYPE: laser_beam
BEHAVIOR READ: instant horizontal beam, muzzle flare, segmented beam body, impact flash, readable start/middle/end frames
VISUAL PALETTE: bright core, darker outer edge, sharp arcade pixels, no full-screen bloom
```

#### Firestorm

```txt
VFX TYPE: firestorm_field
BEHAVIOR READ: vertical turbulent fire columns, ground ignition, ember lift, looping hazard frames, explosive final burst
VISUAL PALETTE: orange/red/yellow core with black smoke pixels, hard-edged transparent silhouette
```

#### Blizzard

```txt
VFX TYPE: blizzard_field
BEHAVIOR READ: swirling snow ribbons, ice shards, ground frost wave, slow field aura, shatter impact frames
VISUAL PALETTE: pale blue, white, grey-violet shadow pixels, crisp frosted edges
```

#### Chain lightning

```txt
VFX TYPE: chain_lightning
BEHAVIOR READ: branching bolt from source to target, secondary arcs, frame-to-frame jagged variation, impact flash nodes
VISUAL PALETTE: white-blue core, violet edge, tiny spark particles, high contrast pixel branches
```

#### Shockwave

```txt
VFX TYPE: ground_shockwave
BEHAVIOR READ: expanding floor ring / cone, dust burst, impact chunks, readable ground contact shadow-free alpha
VISUAL PALETTE: philosopher color mixed with dust grey and bright edge highlights
```

#### Trap / glyph mine

```txt
VFX TYPE: trap_glyph_mine
BEHAVIOR READ: dormant sigil, armed pulse, trigger flare, detonation, dissipating rune fragments
VISUAL PALETTE: hard readable glyph shape, no text letters, abstract symbols only
```

---

## 7. Philosopher visual + mechanical identity notes

### Launch 12

| ID | Role | Element / mechanic | First 4 MVP moves |
|---|---|---|---|
| camus | evasive counter duelist | smoke, sun, void shockwaves | B>A, B<A, B>J, BvJ |
| machiavelli | feint assassin | trap, lunge, counter execution | B>A, B<A, BvA, B>J |
| diogenes | scrappy disruptor | lantern flash, barrel physics, shame debuff | B>A, BvA, B>J, B<J |
| leibniz | orb / math projectile mage | monads, chain logic, mirrors | B>A, B<A, B^J, BvJ |
| foucault | control zoner | beams, grids, reveal/silence | B>A, BvA, B<J, BvJ |
| deleuze_guattari | swarm / field chaos | rhizome chains, assemblage cyclones | B>A, B^A, B>J, BvJ |
| marx | pressure scaler | shockwaves, factory hazards, revolution buffs | B>A, BvA, B^J, BvJ |
| bakunin | explosive rushdown | bombs, firestorm, armor break | B>A, BvA, B>J, BvJ |
| schmitt | armored rule-breaker | borders, beam authority, exception state | B>A, B<A, BvA, BvJ |
| socrates | question/counter trickster | reflection, stun, dialogue trap | B>A, B<A, BvA, B<J |
| kant | lawful control mage | beams, constraints, reflective duty | B>A, B<A, BvA, BvJ |
| kierkegaard | risk / leap specialist | anxiety pools, faith leaps | B>A, B^A, B>J, BvJ |
| stirner | egoist trickster | unique/ridiculous moves that break design rules | B>A, B<A, B>J, BvJ |

### Expansion 6

| ID | Role | Element / mechanic | First 4 MVP moves |
|---|---|---|---|
| aristotle | balanced adaptive fighter | category traps, golden field, anti-air | B>A, B<A, B^A, BvJ |
| plato | vertical idealist zoner | light beams, cave shadows, forms | B>A, B<A, B^J, BvJ |
| aquinas | holy tank | divine rays, shields, consecrated ground | B>A, B<A, BvA, BvJ |
| anselm | proof mage | unavoidable logic rays, seals | B>A, B<A, B^J, BvJ |
| jwf hegel | evolving combo engine | thesis/antithesis/synthesis states | B>A, B<A, B>J, BvJ |
| friedrich nietzsche | high-risk bruiser | hammer, abyss, lightning/fire storm | B>A, B<A, B>J, BvJ |
| spinoza | rationalist summoner | substance monads, attribute fields | B>A, B<A, B^J, BvJ |
| arthur schopenhauer | pessimistic debuffer | will-weakening rays, despair fields | B>A, B<A, BvA, BvJ |
| augustine | faith healer | grace beams, original sin debuff | B>A, B<A, B^J, BvJ |
| hobbes | aggressive grappler | Leviathan rush, social contract trap | B>A, B<A, B>J, BvJ |
| rousseau | wild card brawler | noble savage charge, general will buff | B>A, B<A, B>J, BvJ |
| derrida | deconstructive trickster | différance chains, trace fields | B>A, B<A, B>J, BvJ |
| ludwig wittgenstein | language game manipulator | picture theory traps, language game bombs | B>A, B<A, B>J, BvJ |
| hume | skeptical opportunist | empiricist burst, custom buff/debuff | B>A, B<A, B>J, BvJ |
| popper | falsification tester | conjecture ray, refutation field | B>A, B<A, B>J, BvJ |
| sartre | existential wildcard | nausea bomb, bad faith mirror | B>A, B<A, B>J, BvJ |
| epicurus | pleasure seeker | hedonist burst, tranquility field | B>A, B<A, B>J, BvJ |
| august comte | scientific positivist | law of three stages buff, positivist ray | B>A, B<A, B>J, BvJ |
| hannah arendt | political theorist | banality trap, vita activa buff | B>A, B<A, B>J, BvJ |
| heidegger | ontological manipulator | being-toward-death bomb, Dasein field | B>A, B<A, B>J, BvJ |
| plato | idealist zoner | light beams, cave shadows, forms | B>A, B<A, B^J, BvJ |
| mill | utilitarian supporter | greatest happiness beam, utility field | B>A, B<A, B>J, BvJ |
| bertrand russell | logical sharp-shooter | paradox bomb, logic counter | B>A, B<A, B>J, BvJ |
| theodor adorno | critical theorist | culture industry trap, negative dialectics field | B>A, B<A, B>J, BvJ |


---

## 8. Implementation roadmap

### Milestone 1: command grammar MVP

Files:

```txt
src/game/fight/command-input.ts
src/render/sprites/command-specials.ts
src/game/fight/fight-controller.ts
```

Tasks:

```txt
- support up/down/neutral directions in command-input.ts
- add facing-relative translation for > and <
- add command buffer with 8-12 frame memory
- add tests for command priority and direction normalization
```

Acceptance:

```txt
B+>+A, B+<+A, B+^+A, B+v+A, B+>+J, B+<+J, B+^+J, B+v+J resolve as unique commands.
```

### Milestone 2: special registry + skill tree data

Files:

```txt
src/content/specials/special-data.ts
src/content/skill-tree/skill-tree-data.ts
src/game/specials/special-resolver.ts
src/game/progression/upgrades.ts
```

Tasks:

```txt
- define CommandSlot enum
- add SpecialMoveDefinition
- add SkillNode schema
- map 4 MVP moves per launch philosopher
- attach energy cost and cooldown
- expose getUnlockedSpecials(characterId, progression)
```

Acceptance:

```txt
Camus, Diogenes, Leibniz, Machiavelli can unlock 4 specials each through skill nodes.
```

### Milestone 3: projectile runtime

Files:

```txt
src/game/specials/projectile-system.ts
src/game/specials/projectile-physics.ts
src/game/fight/fight-controller.ts
src/render/vfx.ts
src/render/effects/particles.ts
```

Tasks:

```txt
- add projectile entity list to fight state
- update projectiles each frame
- support circle, AABB, ray, chain collision
- add projectile ownership and reflect support
- add laneReach behavior
- add tests for projectile travel, lifetime, collision, reflect
```

Acceptance:

```txt
magic balls, beams, and shockwaves can hit, miss, expire, and be reflected deterministically.
```

### Milestone 4: elemental fields and status effects

Files:

```txt
src/game/specials/field-system.ts
src/game/specials/status-effects.ts
src/game/fight/fighter.ts
src/render/effects/screen-effects.ts
```

Tasks:

```txt
- add per-fighter status state
- burn / freeze / shock / slow / silence / armor / reflect
- add field emitters with tick rates
- add friendly-fire flag for multiplayer/team modes
- add tests for dot ticks, freeze slow, shock chain, armor absorption
```

Acceptance:

```txt
firestorm, blizzard, chain lightning, and control fields work from data definitions.
```

### Milestone 5: animation + sprite routing

Files:

```txt
src/render/sprites/character-anim-map.ts
src/render/sprites/sprite-integration.ts
src/render/sprites/command-specials.ts
public/assets/sprites/**
```

Tasks:

```txt
- add commandSlot -> casterClipId mapping
- add projectile sprite manifest type
- add VFX clip manifest type
- add fallback rendering for missing command-special sprites
- generate first 12 caster sheets and first 8 shared VFX sheets
```

Acceptance:

```txt
A missing sprite never breaks gameplay; present sprites route by command slot and character.
```

### Milestone 6: skill-tree UI

Files:

```txt
src/ui/screens/app-shell-renderers.ts
src/core/storage/persistence.ts
src/game/progression/upgrades.ts
```

Tasks:

```txt
- add skill tree menu screen
- show command legend in UI
- show locked/unlocked command slots
- persist unlocked nodes
- expose training-room command display
```

Acceptance:

```txt
Player can unlock a special, see its command, and trigger it in combat.
```

### Milestone 7: balancing pass

Balancing targets:

```txt
- 4 specials per philosopher: MVP
- 8 specials per philosopher: full kit
- no more than 2 hard-control moves per philosopher
- no more than 1 domain/ultimate per philosopher
- projectile spam limited by energy + cooldown + recovery
- melee philosophers receive armor/cancel advantages over projectile philosophers
```

---

## 9. Initial data slice recommendation

Implement the first slice with four philosophers and four moves each:

```txt
camus:
  B>A  Absurd Revolt Wave       shockwave projectile
  B<A  Rebel Reversal           counter/reflect
  B>J  Invincible Summer Dash   mobility iframe dash
  BvJ  The Absurd Domain        short slow/debuff field

diogenes:
  B>A  Lantern Truth Flash      cone blind/stun
  BvA  Barrel Roll Quake        ground shockwave
  B>J  Beggar's Scramble        low evasive rush
  B<J  Tub Retreat              armored backstep

leibniz:
  B>A  Monad Bolt               magic ball
  B<A  Possible World Mirror    projectile reflect
  B^J  Monad Orbit              orbiting projectile shield
  BvJ  Best-World Engine        temporary cooldown buff

machiavelli:
  B>A  Prince's Gambit Lunge    dash strike
  B<A  Court Intrigue Parry     counter
  BvA  Coup Trap                ground mine
  B>J  Opportunist Dash         cross-up dash
```

This validates the whole pipeline:

```txt
command input -> skill unlock -> energy gate -> special runtime -> projectile/field -> VFX/sprites -> tests
```

---

## 10. Test roadmap

```txt
tests/unit/command-input.test.ts
  - resolves 8 command slots
  - relative forward/back mapping
  - neutral/up/down priority

tests/unit/special-resolver.test.ts
  - locked special rejected
  - unlocked special accepted
  - energy/cooldown gates

tests/unit/projectile-system.test.ts
  - magic ball moves and expires
  - laser ray hits immediately
  - projectile reflect swaps owner
  - chain lightning picks nearest next target

tests/unit/status-effects.test.ts
  - burn damage ticks
  - freeze slows movement
  - armor absorbs hitstun
  - silence blocks command specials

tests/unit/skill-tree-data.test.ts
  - every launch character has at least 4 specials
  - every full-kit character has 8 command slots
  - every special has sprite fallback ids
```

---

## 11. Content generation batches

### Batch A: MVP caster sheets

```txt
characters: camus, diogenes, leibniz, machiavelli
specials per character: 4
sheets: 16 caster sheets
```

### Batch B: shared projectile/VFX sheets

```txt
magic_ball_base
laser_beam_base
shockwave_base
counter_flash_base
dash_afterimage_base
trap_glyph_base
field_domain_base
impact_spark_base
```

### Batch C: launch roster expansion

```txt
characters: foucault, deleuze_guattari, marx, bakunin, schmitt, aristotle, socrates, kant
specials per character: 4 MVP -> 8 full kit
```

### Batch D: expansion roster

```txt
characters: kierkegaard, plato, aquinas, anselm, hegel, nietzsche
specials per character: 4 MVP -> 8 full kit
```

---

## 12. Clean next step

Start with code, not art:

```txt
1. Expand command-input.ts to produce 8 CommandSlot values.
2. Add special-data.ts with the 16-MVP-move slice.
3. Add special-resolver.ts with energy/cooldown/unlock checks.
4. Add projectile-system.ts with magic_ball, laser, shockwave only.
5. Add tests before generating large art batches.
```

After this works, generate art in small batches. Do not create 144 special sprites before the special runtime and fallback rendering are stable.
