# ETHIC BRAWL

A 2.5D cyberpunk philosophical arena-brawler with absurdist humor. Battle as neon-cyberpunk versions of historical philosophers in a futuristic dystopia where ideas are fought with fists.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run typecheck

# Run tests
npm test
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
- **Roll:** Run + Block for evasive roll with invulnerability frames
- **Special:** Character-unique attack with cooldown

### Combo System
- Consecutive hits within 30 frames extend combo
- Damage scaling increases with combo count
- Combo breaks after 30 frames without hit or when opponent touches ground

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
- Limited trial content (expansion ready)
- Basic AI (improvement opportunities)

## Future Extensions

1. **Network Multiplayer** - WebSocket-based online play
2. **Expanded Roster** - More philosophers and thinkers
3. **Ability DSL** - Custom ability creation system
4. **Environmental Hazards** - Interactive stage elements
5. **Story Mode** - Extended narrative campaign
6. **Spectator Mode** - Replay and watch matches

## License

MIT

---

*"I rebel, therefore we exist."* - Albert Camus (in this game)
