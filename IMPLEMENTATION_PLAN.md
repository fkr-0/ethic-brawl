# ETHIC BRAWL — IMPLEMENTATION PLAN
## Phase 3: Milestone-Based Development Roadmap

---

## 1. MILESTONE OVERVIEW

The implementation is divided into **7 milestones**, each building on the previous:

| Milestone | Name | Duration | Focus |
|-----------|------|----------|-------|
| M0 | Project Scaffolding | 1 session | Build system, structure, empty game |
| M1 | Core Engine | 1 session | Loop, input, state machine, canvas |
| M2 | Combat Foundation | 2 sessions | Fighter, combat logic, basic rendering |
| M3 | Visual & Audio Layer | 1 session | Procedural graphics, synth audio |
| M4 | AI & Versus Mode | 1 session | AI controller, 2-player input |
| M5 | Campaign & Progression | 2 sessions | Campaign flow, trials, upgrades |
| M6 | Polish & Testing | 1 session | UI screens, effects, tests, cleanup |

**Total Estimated Sessions:** 9 major implementation phases

---

## 2. MILESTONE DETAILS

### M0: PROJECT SCAFFOLDING

**Goal:** Create a working Vite + TypeScript project that displays a canvas.

**Deliverables:**
- Working `pnpm install` and `pnpm dev`
- Canvas element rendering a test color
- TypeScript strict mode compiling without errors
- Biome linting passing

**Files to Create:**
```
ethic-brawl/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── biome.json
├── README.md
└── src/
    ├── main.ts
    ├── app/
    │   ├── index.ts
    │   ├── config.ts
    │   └── bootstrap.ts
    └── utils/
        ├── index.ts
        └── assertions.ts
```

**Verification:**
- `pnpm dev` opens browser with colored canvas
- `pnpm typecheck` passes
- `pnpm lint` passes

---

### M1: CORE ENGINE

**Goal:** Establish game loop, input system, and scene management.

**Deliverables:**
- 60fps game loop with delta time
- Keyboard input tracking (pressed, justPressed, justReleased)
- State machine with scene transitions
- Basic event bus

**Files to Create:**
```
src/
├── app/
│   └── game-loop.ts
├── core/
│   ├── index.ts
│   ├── input/
│   │   ├── index.ts
│   │   ├── input-manager.ts
│   │   ├── keyboard.ts
│   │   └── input-binding.ts
│   ├── state/
│   │   ├── index.ts
│   │   ├── state-machine.ts
│   │   └── scene-manager.ts
│   ├── events/
│   │   ├── index.ts
│   │   └── event-bus.ts
│   └── storage/
│       ├── index.ts
│       └── persistence.ts
└── utils/
    ├── math.ts
    └── timing.ts
```

**Key Implementation Details:**

1. **Game Loop:**
```typescript
// Fixed timestep with accumulator
const FIXED_TIMESTEP = 1000 / 60; // 16.67ms
let accumulator = 0;

function loop(timestamp: number) {
  const deltaTime = timestamp - lastTime;
  accumulator += deltaTime;
  
  while (accumulator >= FIXED_TIMESTEP) {
    update(FIXED_TIMESTEP);
    accumulator -= FIXED_TIMESTEP;
  }
  
  render(accumulator / FIXED_TIMESTEP);
  requestAnimationFrame(loop);
}
```

2. **Input Binding:**
```typescript
const PLAYER1_BINDINGS: InputBinding = {
  playerId: 1,
  keys: new Map([
    ['moveLeft', ['KeyA']],
    ['moveRight', ['KeyD']],
    ['moveUp', ['KeyW']],
    ['moveDown', ['KeyS']],
    ['jump', ['KeyL']],
    ['attack', ['KeyJ']],
    ['block', ['KeyK']],
    ['special', ['KeyI']],
  ]),
};
```

**Verification:**
- Console logs input state changes
- Scene transitions work programmatically
- Event bus emits and receives correctly

---

### M2: COMBAT FOUNDATION

**Goal:** Implement fighter entities and core combat mechanics.

**Deliverables:**
- Fighter entity with position, velocity, state
- Movement (walk, run, lane change, jump)
- Basic attack combo (3 hits)
- Block with damage reduction
- Hit reactions (hitstun, knockback)
- Combo counter
- Collision detection
- Round-based fight loop

**Files to Create:**
```
src/
├── game/
│   ├── index.ts
│   ├── fight/
│   │   ├── index.ts
│   │   ├── fight-controller.ts
│   │   ├── fighter.ts
│   │   ├── fighter-state.ts
│   │   ├── combat.ts
│   │   ├── combo.ts
│   │   └── hitbox.ts
│   └── physics/
│       ├── index.ts
│       ├── movement.ts
│       ├── collision.ts
│       └── lanes.ts
├── render/
│   ├── index.ts
│   ├── renderer.ts
│   └── camera.ts
└── content/
    ├── index.ts
    └── characters/
        ├── index.ts
        ├── character-data.ts
        ├── camus.ts
        ├── leibniz.ts
        ├── machiavelli.ts
        └── diogenes.ts
```

**Key Implementation Details:**

1. **Fighter State Machine:**
```typescript
type FighterStateName =
  | 'idle' | 'walking' | 'running' | 'jumping' | 'falling'
  | 'attacking' | 'blocking' | 'hitstun' | 'knockdown'
  | 'gettingUp' | 'victory' | 'defeat' | 'special';

const FIGHTER_STATE_TRANSITIONS: StateTransitions<FighterStateName> = {
  idle: ['walking', 'jumping', 'attacking', 'blocking', 'hitstun'],
  walking: ['idle', 'running', 'jumping', 'attacking', 'blocking'],
  // ... etc
};
```

2. **Combat Resolution:**
```typescript
function resolveHit(attacker: Fighter, defender: Fighter): HitResult {
  const isBlocking = defender.state === 'blocking';
  const perfectBlockWindow = defender.perfectBlockWindow;
  const isPerfectBlock = isBlocking && perfectBlockWindow > 0;
  
  if (isPerfectBlock) {
    return { type: 'perfect_block', damage: 0, riposteWindow: 30 };
  }
  
  const baseDamage = attacker.currentAttack.damage;
  const defense = defender.stats.defense;
  const damageReduction = isBlocking ? 0.6 : 0;
  const finalDamage = Math.max(1, baseDamage * (1 - defense * 0.025) * (1 - damageReduction));
  
  return { type: 'hit', damage: finalDamage, knockback: /* ... */ };
}
```

**Verification:**
- Two fighters can move and attack each other
- Damage numbers appear (debug)
- Health decreases correctly
- Combo counter increments
- Rounds end when health depletes

---

### M3: VISUAL & AUDIO LAYER

**Goal:** Add procedural graphics and synthesized audio.

**Deliverables:**
- Procedural character sprites
- Animated hit sparks and effects
- Parallax backgrounds
- HUD (health bars, combo display, timer)
- Synthesized combat SFX
- Procedural background music

**Files to Create:**
```
src/
├── render/
│   ├── sprites/
│   │   ├── index.ts
│   │   ├── sprite-renderer.ts
│   │   └── procedural-sprites.ts
│   ├── effects/
│   │   ├── index.ts
│   │   ├── particles.ts
│   │   ├── hit-sparks.ts
│   │   └── screen-effects.ts
│   ├── backgrounds/
│   │   ├── index.ts
│   │   ├── parallax-bg.ts
│   │   └── stage-backgrounds.ts
│   └── hud/
│       ├── index.ts
│       ├── hud-renderer.ts
│       ├── health-bar.ts
│       ├── combo-display.ts
│       └── score-display.ts
├── audio/
│   ├── index.ts
│   ├── audio-engine.ts
│   ├── synthesizer/
│   │   ├── index.ts
│   │   ├── oscillator-pool.ts
│   │   ├── envelope.ts
│   │   └── filters.ts
│   ├── music/
│   │   ├── index.ts
│   │   ├── sequencer.ts
│   │   ├── music-generator.ts
│   │   └── patterns.ts
│   └── sfx/
│       ├── index.ts
│       ├── sound-effects.ts
│       └── sfx-player.ts
└── utils/
    ├── random.ts
    └── color.ts
```

**Key Implementation Details:**

1. **Procedural Character Sprite:**
```typescript
function drawFighter(ctx: CanvasRenderingContext2D, fighter: Fighter): void {
  const { x, y, facing, state } = fighter;
  const colors = fighter.character.colors;
  
  ctx.save();
  ctx.translate(x, y);
  if (facing === 'left') ctx.scale(-1, 1);
  
  // Body
  ctx.fillStyle = colors.primary;
  ctx.fillRect(-20, -60, 40, 60);
  
  // Head
  ctx.fillStyle = colors.secondary;
  ctx.beginPath();
  ctx.arc(0, -75, 15, 0, Math.PI * 2);
  ctx.fill();
  
  // Animation based on state
  if (state === 'attacking') {
    // Arm extended
    ctx.fillRect(20, -50, 30, 8);
  }
  
  ctx.restore();
}
```

2. **Synth SFX:**
```typescript
function playHitSound(engine: AudioEngine): void {
  const osc = engine.context.createOscillator();
  const gain = engine.context.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(200, engine.context.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, engine.context.currentTime + 0.1);
  
  gain.gain.setValueAtTime(0.3, engine.context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, engine.context.currentTime + 0.1);
  
  osc.connect(gain);
  gain.connect(engine.sfxGain);
  
  osc.start();
  osc.stop(engine.context.currentTime + 0.1);
}
```

**Verification:**
- Characters have distinct visual appearances
- Hit effects play on impact
- Music plays during fight
- HUD shows health, combo, timer correctly
- Parallax background scrolls with camera

---

### M4: AI & VERSUS MODE

**Goal:** Implement AI opponents and 2-player local play.

**Deliverables:**
- AI controller with difficulty levels
- AI behavior patterns (approach, attack, retreat, punish)
- Player 2 input bindings
- Versus mode scene flow
- Character selection screen

**Files to Create:**
```
src/
├── game/
│   ├── ai/
│   │   ├── index.ts
│   │   ├── ai-controller.ts
│   │   └── ai-behaviors.ts
│   └── versus/
│       ├── index.ts
│       └── versus-controller.ts
└── ui/
    ├── index.ts
    ├── screens/
    │   ├── index.ts
    │   └── character-select.ts
    └── components/
        ├── index.ts
        ├── button.ts
        ├── text-display.ts
        └── menu.ts
```

**Key Implementation Details:**

1. **AI Decision Making:**
```typescript
function updateAI(fighter: Fighter, opponent: Fighter, config: AIConfig): AIDecision {
  const distance = Math.abs(fighter.position.x - opponent.position.x);
  
  // Add reaction delay based on difficulty
  if (reactionDelayActive(config)) {
    return { action: 'idle' };
  }
  
  // Approach if too far
  if (distance > 100) {
    return { action: 'approach' };
  }
  
  // In range - decide to attack or block
  if (opponent.state === 'attacking' && Math.random() < config.blockChance) {
    return { action: 'block' };
  }
  
  if (Math.random() < config.aggressiveness) {
    return { action: 'attack' };
  }
  
  // Retreat occasionally
  if (Math.random() < 0.2) {
    return { action: 'retreat' };
  }
  
  return { action: 'idle' };
}
```

2. **Player 2 Input:**
```typescript
const PLAYER2_BINDINGS: InputBinding = {
  playerId: 2,
  keys: new Map([
    ['moveLeft', ['ArrowLeft']],
    ['moveRight', ['ArrowRight']],
    ['moveUp', ['ArrowUp']],
    ['moveDown', ['ArrowDown']],
    ['jump', ['Numpad2', 'KeyO']],
    ['attack', ['Numpad1', 'KeyU']],
    ['block', ['Numpad3', 'KeyI']],
    ['special', ['Numpad4', 'KeyP']],
  ]),
};
```

**Verification:**
- AI provides reasonable challenge at all difficulties
- Player 2 can control fighter in versus mode
- Character select works for both players
- Versus mode completes with results screen

---

### M5: CAMPAIGN & PROGRESSION

**Goal:** Implement full campaign flow with trials and upgrades.

**Deliverables:**
- Campaign controller (stage progression)
- Stage generator (opponent, clues, background)
- Clue generator (headlines, propaganda, signs)
- Trial controller (dilemmas, logic, accusations)
- Trial scoring (keyword matching, stance detection)
- XP and leveling system
- Upgrade selection and application
- Persistence (localStorage)

**Files to Create:**
```
src/
├── game/
│   ├── campaign/
│   │   ├── index.ts
│   │   ├── campaign-controller.ts
│   │   ├── stage-generator.ts
│   │   ├── clue-generator.ts
│   │   └── trial-controller.ts
│   └── progression/
│       ├── index.ts
│       ├── experience.ts
│       └── upgrades.ts
├── content/
│   ├── stages/
│   │   ├── index.ts
│   │   └── stage-data.ts
│   ├── trials/
│   │   ├── index.ts
│   │   ├── trial-data.ts
│   │   ├── moral-dilemmas.ts
│   │   ├── logic-puzzles.ts
│   │   └── accusations.ts
│   ├── clues/
│   │   ├── index.ts
│   │   ├── headlines.ts
│   │   ├── propaganda.ts
│   │   └── signs.ts
│   ├── upgrades/
│   │   ├── index.ts
│   │   └── upgrade-data.ts
│   └── quotes/
│       ├── index.ts
│       └── character-quotes.ts
└── ui/
    └── screens/
        ├── trial-screen.ts
        ├── upgrade-screen.ts
        └── results-screen.ts
```

**Key Implementation Details:**

1. **Trial Scoring:**
```typescript
function scoreTypedResponse(response: string, trial: Trial): number {
  let score = 0;
  
  // Keyword matching
  const responseLower = response.toLowerCase();
  for (const keyword of trial.keywords ?? []) {
    if (responseLower.includes(keyword.toLowerCase())) {
      score += 5;
    }
  }
  
  // Rhetorical flair (questions, exclamations, quotes)
  if (response.includes('?')) score += 1;
  if (response.includes('!')) score += 1;
  if (response.includes('"') || response.includes("'")) score += 2;
  
  // Length bonus
  score += Math.min(10, Math.floor(response.length / 10));
  
  return Math.min(100, Math.max(0, score));
}
```

2. **Upgrade Application:**
```typescript
function applyUpgrade(fighter: Fighter, upgrade: Upgrade): Fighter {
  const modified = { ...fighter };
  
  for (const [stat, value] of Object.entries(upgrade.effect.statModifiers)) {
    modified.stats[stat] += value;
  }
  
  modified.upgrades.push({
    upgradeId: upgrade.id,
    statModifiers: upgrade.effect.statModifiers,
  });
  
  return modified;
}
```

**Verification:**
- Campaign progresses through 4 stages
- Clues appear in stages
- Trials present after victory
- Trial scoring works correctly
- Upgrades affect stats visibly
- Progress persists across sessions

---

### M6: POLISH & TESTING

**Goal:** Complete UI, add visual polish, write tests, finalize.

**Deliverables:**
- Start screen with menu
- Pause screen
- Full UI styling (cyberpunk theme)
- Screen shake and effects
- Glitch visual effects
- Unit tests for core systems
- Integration tests for game flow
- README documentation

**Files to Create/Update:**
```
src/
├── ui/
│   └── screens/
│       ├── start-screen.ts
│       └── pause-screen.ts
└── tests/ (moved to tests/ at root)
    ├── unit/
    │   ├── combat.test.ts
    │   ├── combo.test.ts
    │   ├── upgrades.test.ts
    │   ├── trial-scoring.test.ts
    │   └── ai-decision.test.ts
    └── integration/
        └── fight-flow.test.ts
```

**Test Coverage Goals:**
| Module | Target Coverage |
|--------|-----------------|
| combat.ts | 85% |
| combo.ts | 90% |
| upgrades.ts | 80% |
| trial-controller.ts | 75% |
| ai-controller.ts | 70% |

**Verification:**
- All unit tests pass
- Game feels polished
- All UI screens work
- Documentation is complete

---

## 3. DEPENDENCY GRAPH

```
M0: Scaffolding
 │
 └──▶ M1: Core Engine
       │
       └──▶ M2: Combat Foundation
             │
             ├───────┬───────┐
             │       │       │
             ▼       ▼       ▼
           M3:     M4:     (parallel)
         Visual   AI &     
         Audio   Versus    
             │       │
             └───┬───┘
                 │
                 ▼
             M5: Campaign & Progression
                 │
                 ▼
             M6: Polish & Testing
```

**Critical Path:** M0 → M1 → M2 → M5 → M6

**Parallel Work Possible:**
- M3 (Visual/Audio) can start after M2
- M4 (AI/Versus) can start after M2
- M3 and M4 can run in parallel

---

## 4. FILE TOUCH LIST BY MILESTONE

### M0: Project Scaffolding (11 files)
- `package.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `biome.json`
- `index.html`
- `README.md`
- `src/main.ts`
- `src/app/index.ts`
- `src/app/config.ts`
- `src/app/bootstrap.ts`
- `src/utils/index.ts`
- `src/utils/assertions.ts`

### M1: Core Engine (14 files)
- `src/app/game-loop.ts`
- `src/core/index.ts`
- `src/core/input/index.ts`
- `src/core/input/input-manager.ts`
- `src/core/input/keyboard.ts`
- `src/core/input/input-binding.ts`
- `src/core/state/index.ts`
- `src/core/state/state-machine.ts`
- `src/core/state/scene-manager.ts`
- `src/core/events/index.ts`
- `src/core/events/event-bus.ts`
- `src/core/storage/index.ts`
- `src/core/storage/persistence.ts`
- `src/utils/math.ts`
- `src/utils/timing.ts`

### M2: Combat Foundation (23 files)
- `src/game/index.ts`
- `src/game/fight/index.ts`
- `src/game/fight/fight-controller.ts`
- `src/game/fight/fighter.ts`
- `src/game/fight/fighter-state.ts`
- `src/game/fight/combat.ts`
- `src/game/fight/combo.ts`
- `src/game/fight/hitbox.ts`
- `src/game/physics/index.ts`
- `src/game/physics/movement.ts`
- `src/game/physics/collision.ts`
- `src/game/physics/lanes.ts`
- `src/render/index.ts`
- `src/render/renderer.ts`
- `src/render/camera.ts`
- `src/content/index.ts`
- `src/content/characters/index.ts`
- `src/content/characters/character-data.ts`
- `src/content/characters/camus.ts`
- `src/content/characters/leibniz.ts`
- `src/content/characters/machiavelli.ts`
- `src/content/characters/diogenes.ts`

### M3: Visual & Audio Layer (26 files)
- `src/render/sprites/index.ts`
- `src/render/sprites/sprite-renderer.ts`
- `src/render/sprites/procedural-sprites.ts`
- `src/render/effects/index.ts`
- `src/render/effects/particles.ts`
- `src/render/effects/hit-sparks.ts`
- `src/render/effects/screen-effects.ts`
- `src/render/backgrounds/index.ts`
- `src/render/backgrounds/parallax-bg.ts`
- `src/render/backgrounds/stage-backgrounds.ts`
- `src/render/hud/index.ts`
- `src/render/hud/hud-renderer.ts`
- `src/render/hud/health-bar.ts`
- `src/render/hud/combo-display.ts`
- `src/render/hud/score-display.ts`
- `src/audio/index.ts`
- `src/audio/audio-engine.ts`
- `src/audio/synthesizer/index.ts`
- `src/audio/synthesizer/oscillator-pool.ts`
- `src/audio/synthesizer/envelope.ts`
- `src/audio/synthesizer/filters.ts`
- `src/audio/music/index.ts`
- `src/audio/music/sequencer.ts`
- `src/audio/music/music-generator.ts`
- `src/audio/music/patterns.ts`
- `src/audio/sfx/index.ts`
- `src/audio/sfx/sound-effects.ts`
- `src/audio/sfx/sfx-player.ts`
- `src/utils/random.ts`
- `src/utils/color.ts`

### M4: AI & Versus Mode (13 files)
- `src/game/ai/index.ts`
- `src/game/ai/ai-controller.ts`
- `src/game/ai/ai-behaviors.ts`
- `src/game/versus/index.ts`
- `src/game/versus/versus-controller.ts`
- `src/ui/index.ts`
- `src/ui/screens/index.ts`
- `src/ui/screens/character-select.ts`
- `src/ui/components/index.ts`
- `src/ui/components/button.ts`
- `src/ui/components/text-display.ts`
- `src/ui/components/menu.ts`

### M5: Campaign & Progression (27 files)
- `src/game/campaign/index.ts`
- `src/game/campaign/campaign-controller.ts`
- `src/game/campaign/stage-generator.ts`
- `src/game/campaign/clue-generator.ts`
- `src/game/campaign/trial-controller.ts`
- `src/game/progression/index.ts`
- `src/game/progression/experience.ts`
- `src/game/progression/upgrades.ts`
- `src/content/stages/index.ts`
- `src/content/stages/stage-data.ts`
- `src/content/trials/index.ts`
- `src/content/trials/trial-data.ts`
- `src/content/trials/moral-dilemmas.ts`
- `src/content/trials/logic-puzzles.ts`
- `src/content/trials/accusations.ts`
- `src/content/clues/index.ts`
- `src/content/clues/headlines.ts`
- `src/content/clues/propaganda.ts`
- `src/content/clues/signs.ts`
- `src/content/upgrades/index.ts`
- `src/content/upgrades/upgrade-data.ts`
- `src/content/quotes/index.ts`
- `src/content/quotes/character-quotes.ts`
- `src/ui/screens/trial-screen.ts`
- `src/ui/screens/upgrade-screen.ts`
- `src/ui/screens/results-screen.ts`

### M6: Polish & Testing (12 files)
- `src/ui/screens/start-screen.ts`
- `src/ui/screens/pause-screen.ts`
- `tests/unit/combat.test.ts`
- `tests/unit/combo.test.ts`
- `tests/unit/upgrades.test.ts`
- `tests/unit/trial-scoring.test.ts`
- `tests/unit/ai-decision.test.ts`
- `tests/integration/fight-flow.test.ts`
- `tests/test-utils.ts`
- `public/favicon.svg`

---

## 5. MVP-FIRST REASONING

### Why This Order?

1. **M0-M1 First:** Without a working loop and input, nothing else can be tested. These are foundational.

2. **M2 Before M3-M4:** Combat logic must exist before visuals or AI can interact with it. Core gameplay is the MVP's heart.

3. **M3-M4 Parallel:** Visual polish and AI can be developed simultaneously once combat exists. They're independent concerns.

4. **M5 Late:** Campaign and progression depend on combat being solid. Adding them earlier would mean iterating on unstable foundations.

5. **M6 Last:** Polish and testing only make sense after features are stable. Testing early would mean constant test updates.

### What Gets Cut If Time Runs Short?

| Priority | Keep | Cut If Needed |
|----------|------|---------------|
| Critical | Combat, 4 chars, campaign flow | Perfect block, roll |
| High | AI, HUD, basic audio | Procedural music complexity |
| Medium | Visual effects, trial typing | Glitch effects, screen shake |
| Low | Extensive tests | Coverage targets |

### Minimum Viable Product

If we had to ship after M4, we'd have:
- Core combat working
- 4 playable characters
- AI opponents
- 2-player versus mode
- Basic visuals and audio

This is **playable** but lacks campaign depth. The M5 additions make it a **complete experience**.

---

## 6. RISK MITIGATION IN PLAN

| Risk | Mitigation in Plan |
|------|-------------------|
| Combat feels bad | M2 focuses entirely on combat; M3 adds visual feedback |
| AI is too easy/hard | M4 includes configurable difficulty; separate from core combat |
| Audio latency | M3 includes calibration parameter; Web Audio API is low-latency |
| Progression feels weak | M5 dedicates full milestone; multiple upgrade types |
| Tests are hard to write | Pure logic separated from rendering; test utilities created |
| Scope creep | Each milestone has explicit file list; cut priorities defined |

---

*End of Phase 3 Implementation Plan*
*Next: Implementation (Phase 4)*
