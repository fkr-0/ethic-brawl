# Character Design Review

## Current state

The roster is now beginning to form actual gameplay identity, but it is still much stronger as a concept sheet than as a finished fighting-game cast.

What is already working:

- each character has a clear thematic fantasy
- base stats are readable and not wildly inconsistent
- movement profiles now create meaningful feel differences
- hit-policy presets and move-class presets have started moving combat identity into content
- palette choices are bold and fit the cyberpunk / absurdist tone

What is still underdeveloped is the translation from “cool character idea” into “distinct playable archetype with readable move identity.”

## Character-by-character snapshot

### Camus
Strong thematic core. The current data now points toward a pressure / frame-trap character, which is a good fit for a stubborn forward-leaning archetype.

Still missing:

- a clearer special identity in runtime behavior
- a stronger visual silhouette beyond palette
- a defined risk/reward loop that players can feel within one round

### Leibniz
The optimistic calculator fantasy is good, and the cross-lane special begins to make him feel more spatially intelligent than the others.

Still missing:

- more explicit zoning / setup identity
- lighter, more cerebral movement or projectile cadence
- authored move chain behavior beyond the shared default normals

### Machiavelli
Currently the cleanest archetype direction. Faster movement plus launcher behavior already suggests a scheming opportunist or punish character.

Still missing:

- stronger counter-special differentiation
- clearer “control the flow of the fight” mechanics
- a bespoke normal chain that reflects manipulation, feints, or opportunistic conversion

### Diogenes
Good anti-meta fantasy and the heavier movement profile helps. He already reads as the more stubborn, grounding presence in the cast.

Still missing:

- a more distinctive mechanical payoff for the cynic fantasy
- clearer defensive or disruptive gameplay hooks
- stronger runtime use of his gimmick instead of leaving it mostly descriptive

## Biggest design problems right now

### 1. Most normals are still the same underlying chain
This is the largest roster-design limitation.

Even with different movement and move-class presets, the cast still shares the same default normal-chain skeleton. That means characters may feel statistically different before they feel truly expressive.

### 2. Specials are still too template-driven
Special timings are currently derived mostly from `special.type`, which is useful as scaffolding but too coarse for a lasting roster.

That means two characters with the same special type risk feeling structurally similar even if their flavor text differs.

### 3. Gimmicks are mostly declared, not lived
The gimmick layer reads well on paper, but a lot of that identity is not yet participating in live combat resolution.

Until gimmicks actually shape outcomes, they are flavor rather than design.

### 4. Visual silhouettes are too close
Right now the roster is primarily distinguished by:

- name
- quote tone
- palette
- stats

That is not enough. A fighting-game cast needs stronger silhouette separation in:

- proportions
- stance
- movement rhythm
- attack arcs
- special VFX language

## Best next character-design steps

### Milestone A: define roster archetype sheets
For each character, explicitly write:

- fantasy
- preferred range
- pressure style
- anti-air strength
- conversion pattern
- defensive weakness
- unique resource or gimmick hook

### Milestone B: author per-character normal chains
Move beyond the shared `DEFAULT_ATTACK_CHAIN` and let each character own:

- frame pacing
- hitbox shape
- launch profile
- lane reach
- block pressure profile

### Milestone C: make specials fully bespoke
Keep `special.type` as a broad category if useful, but move frame data and runtime behavior into authored content per character.

### Milestone D: activate gimmicks in combat
Every gimmick should have at least one tested runtime expression.

### Milestone E: define silhouette rules for rendering / future art
Even before polished sprites or illustrations, each character should have a different:

- idle stance
- attack line
- jump pose
- block pose
- hit reaction

## Overall assessment

The roster is no longer just flavor pasted onto a shared body of rules; it has started to become a real design surface. But it is still in the “promising prototype roster” stage, not yet the “distinct cast with strong matchup identity” stage.

The clean path forward is:

1. bespoke normal chains
2. runtime gimmicks
3. bespoke specials
4. stronger silhouette / stance language

That sequence would convert the current philosophical cast from clever concept into an actually memorable fighting-game roster.
