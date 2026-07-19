# ETHIC BRAWL

A 2.5D cyberpunk philosophical arena-brawler with absurdist humor. Battle as neon-cyberpunk versions of historical philosophers in a futuristic dystopia where ideas are fought with fists.

**Current release candidate: 1.1.0.** Local Versus and the complete three-encounter Babylon Story route are playable. Five later story routes are authored previews and remain locked.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Run type checking
pnpm typecheck

# Run tests
pnpm test:run

# Run all production-mounted browser tests
pnpm test:e2e

# Run the focused sprite/animation browser gate
pnpm test:e2e:sprites

# Run the complete release gate
pnpm release:check
```

## Controls

### Player 1 (Left Side)
| Key | Action |
|-----|--------|
| A / D | Move Left / Right |
| W / S | Lane Up / Down |
| J | Attack |
| K | Block |
| L | Jump |
| I | Special Attack |
| ESC | Pause |

### Player 2 (Right Side)
| Key | Action |
|-----|--------|
| Arrow Keys | Move |
| Numpad 1 / U | Attack |
| Numpad 3 / I | Block |
| Numpad 2 / O | Jump |
| Numpad 4 / P | Special Attack |

## Characters

The 1.1.0 release roster contains 13 fighters: Camus, Machiavelli, Diogenes, Leibniz, Foucault, Deleuze & Guattari, Marx, Bakunin, Schmitt, Socrates, Kant, Kierkegaard, and Stirner. Every release fighter has a three-hit normal chain, four command specials, a unique gimmick, and a 32-frame core-plus-extended animation set.

### Albert Camus - "The Absurdist"
- **Style:** Balanced fighter with resilience under pressure
- **Special:** Absurd Revolt - AOE burst damage
- **Gimmick:** Rebel's Resilience - Gains damage bonus when low on health

### Gottfried Leibniz - "The Optimist"
- **Style:** Technical fighter with projectile special
- **Special:** Monadic Strike - Homing projectile
- **Gimmick:** Best of All Worlds - Chance for critical hits

### Niccolò Machiavelli - "The Strategist"
- **Style:** Aggressive fighter with counter mechanics
- **Special:** Ends Justify - Counter stance with high damage
- **Gimmick:** Political Maneuver - Perfect blocks restore health

### Diogenes - "The Cynic"
- **Style:** Defensive tank with disruption
- **Special:** Lantern Flash - Blinding AOE stagger
- **Gimmick:** Cynic's Disregard - Chance to ignore light hitstun

## Combat Mechanics

### Movement
- **Walk:** Hold left/right
- **Run:** Double-tap left/right
- **Lane Change:** Press up/down to change lanes (3 lanes total)
- **Jump:** Press jump button (can air control)

### Combat
- **Attack Chain:** Press attack repeatedly for 3-hit combo
- **Block:** Hold block to reduce damage by 60%
- **Perfect Block:** Block within 8 frames of impact for 100% reduction + riposte advantage
- **Roll:** Reserved input combination; full evasive-roll behavior remains planned
- **Special:** Character-unique attack with cooldown

### Combo System
- Consecutive hits within 30 frames extend combo
- Damage scaling increases with combo count
- Combo breaks after 30 frames without hit or when opponent touches ground

## Stage 1 Vertical Slice: Babylon

Stage Mode now ships a complete first campaign slice using the existing focused two-fighter combat engine:

1. Select one philosopher from the curated 13-character release roster.
2. Use the release grid with live sprite previews, core stats, the full normal chain, all four command inputs, special names, and character gimmicks.
3. Fight three AI-driven Babylon encounters representing the stage's market, archive-security, and ziggurat-gate waves; threat ramps from easy to medium to hard and each wave uses a distinct combat mode.
4. Preserve the selected protagonist across encounters and retry the current wave after a defeat.
5. Clear the final encounter to choose one of three illustrated Babylon rewards, archive the clear, review the next locked route preview, and return to the menu.

Combat presentation now includes conviction energy, special-cooldown readiness, corrected victory/defeat/aborted verdicts, and a stage-progress strip that no longer obscures the health HUD.

The three Stage 1 modes now change actual fight rules as well as presentation: Market Procession gives a longer public opening and delays the examiner's special, Archive Lockdown shortens the clock and fortifies the enforcer, and Gate Judgment becomes a 72-second final verdict against a reinforced opponent with immediate special access. The active mode and its rule summary appear on the encounter placard and fight HUD.

The Babylon fights now use three encounter-specific graphics profiles with independently tuned parallax speeds, moving dust, cuneiform-style propaganda signs, attack wind-up telegraphs, and low-health/impact screen feedback. Stage introductions use the actual selected and opposing sprites in a theatrical placard layout. Near-camera layers distinguish the waves with market stalls and awnings, archive columns and scanning light, or gate braziers and crowd silhouettes; atmospheric layers add market streamers, falling archive data, and gate embers.

Sprite attacks are synchronized directly to combat startup, active, and recovery frames. Light, medium, heavy, and special attacks use multi-frame pose sequences on both legacy and extended sprite sheets, while eight choreography families add distinct straight punches, sweeps, heel attacks, orbiting motions, launchers, flurries, invocations, and ripostes. Movement speed drives locomotion playback, and sprites now receive lane depth, squash/stretch, recoil, hit flashes, shadows, and restrained afterimages.

Sprite extraction now uses an adaptive edge-connected background key rather than assuming every source sheet has a white backdrop. The browser validates all 448 atlas cells across the 18-character roster after keying, rejecting blank cells, out-of-bounds references, and likely retained background panels. Short crossfades between adjacent frames and clips smooth locomotion and combat phase changes without decoupling animation from the deterministic fight timeline.

Fighter sprites are normalized from the visible height of their idle poses instead of sharing one raw source-pixel multiplier. Regular 128-pixel sheets, taller roster sheets, and smaller legacy sheets therefore render at a consistent arena height while preserving front/middle/back lane depth.

Jumping, falling, landing, knockdown, get-up, and turnaround presentation is synchronized to simulation state. Landings move through an airborne pose, impact crouch, and neutral settle; turns collapse and crossfade through the facing swap; airborne tilt follows vertical velocity rather than replaying a detached loop.

Each arena profile also runs a deterministic signature event. The market receives a moving bronze caravan, the archive performs an index scanner sweep, the final gate emits a brazier heat verdict, and the versus arena surges with a neon signal wave. These events affect backdrop motion, foreground light, crowd rhythm, and stage-specific floor geometry without changing combat determinism.

The 1.1.0 content gate additionally verifies the 13 active fighters' extended animation banks, all 12 story-enemy atlas rows, and all 31 item-icon assignments. Legacy fighters remain loadable for old saves and development checks but do not appear in the release selection grid.

Combat sparks and landing dust use one fixed-capacity object pool instead of allocating a new particle-system object for every impact. The pool exposes runtime statistics through the E2E probe and safely recycles particles only when its capacity is exhausted.

The browser E2E test mounts a production build at `/ethic-brawl/`, covering deployed bundle and sprite URLs, two-dimensional roster navigation, real keyboard combat, defeat/retry behavior, escalating AI, all three encounters, and the complete campaign route.

## Graphics Architecture and PixiJS

PixiJS is **not currently installed**. Ethic Brawl and Badger Sprawl Runner both still use Canvas2D, and this pass deliberately converges their graphics concepts before changing render backends.

Ethic Brawl now has a renderer-neutral fight-presentation contract in `src/render/fight-presentation.ts`. It carries stage themes and encounter profiles independently from the Canvas drawing code, providing a clean future seam for a complete PixiJS v8 adapter. See `docs/graphics-convergence.md` for the comparison and migration criteria.

## Project Structure

```
ethic-brawl/
├── src/
│   ├── main.ts              # Entry point
│   ├── app/                 # Application bootstrap
│   │   ├── config.ts        # Global configuration
│   │   ├── bootstrap.ts     # Initialization
│   │   └── game-loop.ts     # Main loop
│   ├── core/                # Engine systems
│   │   ├── input/           # Input handling
│   │   ├── state/           # State machine, scenes
│   │   ├── events/          # Event bus
│   │   └── storage/         # Persistence
│   ├── game/                # Game logic
│   │   ├── fight/           # Combat system
│   │   ├── physics/         # Movement, collision
│   │   └── ai/              # AI controller
│   ├── render/              # Canvas rendering
│   ├── audio/               # Web Audio API
│   ├── content/             # Game content definitions
│   │   └── characters/      # Character data
│   └── utils/               # Utility functions
├── tests/                   # Test files
├── index.html               # HTML entry
├── package.json
├── tsconfig.json
├── vite.config.ts
└── biome.json
```

## Technology Stack

- **Vite** - Fast build tool with HMR
- **TypeScript** - Type-safe development
- **HTML5 Canvas** - Hardware-accelerated 2D rendering
- **Web Audio API** - Procedural audio synthesis
- **Biome** - Fast linting and formatting

## Development

### Architecture Principles

1. **Pure Logic Separation** - Game logic is independent of rendering
2. **Fixed Timestep** - Consistent physics at 60fps
3. **State Machine** - Clean scene and fighter state management
4. **Event-Driven** - Loose coupling via event bus
5. **Testable Core** - Pure functions for unit testing

### Adding a New Character

1. Create `src/content/characters/new-character.ts`
2. Define stats, special, gimmick, quotes, and colors
3. Add to `CHARACTERS` map in `character-data.ts`
4. Update `CharacterId` type

### Adding a New Scene

1. Create scene in `src/ui/screens/`
2. Use `createScene()` helper
3. Add to scene manager in `main.ts`
4. Define valid transitions

## Current Limitations

- No online multiplayer (local only)
- No save state for mid-campaign progress
- Stage campaign currently contains the Babylon vertical slice; later stages remain data-authored but are not yet connected to multi-enemy runtime encounters
- Heuristic AI now has encounter-specific difficulty profiles, but does not yet learn or adapt across matches
- PixiJS/WebGL is not yet active; the renderer-neutral presentation seam is prepared, but Canvas2D remains the only production backend

## Future Extensions

1. **Network Multiplayer** - WebSocket-based online play
2. **Expanded Roster** - More philosophers and thinkers
3. **Ability DSL** - Custom ability creation system
4. **Environmental Hazards** - Interactive stage elements
5. **Expanded Story Mode** - Connect later authored stages and true multi-enemy waves
6. **Spectator Mode** - Replay and watch matches

## License

MIT

---

*"I rebel, therefore we exist."* - Albert Camus (in this game)
