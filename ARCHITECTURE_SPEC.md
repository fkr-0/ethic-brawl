# ETHIC BRAWL — ARCHITECTURE SPECIFICATION
## Phase 2: Technical Architecture

---

## 1. PROJECT STRUCTURE

### 1.1 Root Directory Layout

```
ethic-brawl/
├── index.html                 # Entry point HTML
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── tsconfig.node.json         # Node-specific TS config (for Vite)
├── vite.config.ts             # Vite bundler configuration
├── biome.json                 # Biome linter/formatter configuration
├── README.md                  # Project documentation
│
├── src/                       # Source code
│   ├── main.ts               # Application entry point
│   ├── app/                  # Application bootstrap and config
│   ├── core/                 # Core engine systems
│   ├── game/                 # Game logic and state
│   ├── render/               # Canvas rendering
│   ├── audio/                # Web Audio API systems
│   ├── content/              # Static content definitions
│   ├── ui/                   # UI/HUD components
│   └── utils/                # Utility functions
│
├── tests/                     # Test files
│   ├── unit/                 # Unit tests
│   └── integration/          # Integration tests
│
└── public/                    # Static assets (if any)
    └── favicon.svg
```

### 1.2 Detailed Source Tree

```
src/
├── main.ts                           # Bootstrap, initializes game
│
├── app/
│   ├── index.ts                      # App module exports
│   ├── bootstrap.ts                  # Game initialization sequence
│   ├── config.ts                     # Global configuration constants
│   └── game-loop.ts                  # requestAnimationFrame loop
│
├── core/
│   ├── index.ts                      # Core module exports
│   ├── input/
│   │   ├── index.ts                  # Input module exports
│   │   ├── input-manager.ts          # Input aggregation
│   │   ├── keyboard.ts               # Keyboard state tracking
│   │   └── input-binding.ts          # Key-to-action mappings
│   ├── state/
│   │   ├── index.ts                  # State module exports
│   │   ├── state-machine.ts          # Generic state machine
│   │   └── scene-manager.ts          # Scene/phase management
│   ├── events/
│   │   ├── index.ts                  # Events module exports
│   │   └── event-bus.ts              # Pub/sub event system
│   └── storage/
│       ├── index.ts                  # Storage module exports
│       └── persistence.ts            # localStorage wrapper
│
├── game/
│   ├── index.ts                      # Game module exports
│   ├── fight/
│   │   ├── index.ts                  # Fight module exports
│   │   ├── fight-controller.ts       # Main fight orchestration
│   │   ├── fighter.ts                # Fighter entity class
│   │   ├── fighter-state.ts          # Fighter state definitions
│   │   ├── combat.ts                 # Combat resolution logic
│   │   ├── combo.ts                  # Combo tracking system
│   │   └── hitbox.ts                 # Hitbox/hurtbox utilities
│   ├── ai/
│   │   ├── index.ts                  # AI module exports
│   │   ├── ai-controller.ts          # AI decision maker
│   │   └── ai-behaviors.ts           # Behavior tree / patterns
│   ├── physics/
│   │   ├── index.ts                  # Physics module exports
│   │   ├── movement.ts               # Movement calculations
│   │   ├── collision.ts              # Collision detection
│   │   └── lanes.ts                  # Lane positioning logic
│   ├── campaign/
│   │   ├── index.ts                  # Campaign module exports
│   │   ├── campaign-controller.ts    # Campaign flow management
│   │   ├── stage-generator.ts        # Stage content assembly
│   │   ├── clue-generator.ts         # Environmental clue creation
│   │   └── trial-controller.ts       # Trial scene management
│   ├── progression/
│   │   ├── index.ts                  # Progression module exports
│   │   ├── experience.ts             # XP and leveling
│   │   └── upgrades.ts               # Upgrade application
│   └── versus/
│       ├── index.ts                  # Versus module exports
│       └── versus-controller.ts      # Versus mode management
│
├── render/
│   ├── index.ts                      # Render module exports
│   ├── renderer.ts                   # Main canvas renderer
│   ├── camera.ts                     # Camera/viewport management
│   ├── sprites/
│   │   ├── index.ts                  # Sprites module exports
│   │   ├── sprite-renderer.ts        # Sprite drawing utilities
│   │   └── procedural-sprites.ts     # Procedural sprite generation
│   ├── effects/
│   │   ├── index.ts                  # Effects module exports
│   │   ├── particles.ts              # Particle system
│   │   ├── hit-sparks.ts             # Combat visual effects
│   │   └── screen-effects.ts         # Full-screen effects
│   ├── backgrounds/
│   │   ├── index.ts                  # Backgrounds module exports
│   │   ├── parallax-bg.ts            # Parallax scrolling
│   │   └── stage-backgrounds.ts      # Stage-specific backgrounds
│   └── hud/
│       ├── index.ts                  # HUD module exports
│       ├── hud-renderer.ts           # HUD orchestration
│       ├── health-bar.ts             # Health bar rendering
│       ├── combo-display.ts          # Combo counter UI
│       └── score-display.ts          # Score rendering
│
├── audio/
│   ├── index.ts                      # Audio module exports
│   ├── audio-engine.ts               # Web Audio API context
│   ├── synthesizer/
│   │   ├── index.ts                  # Synth module exports
│   │   ├── oscillator-pool.ts        # Oscillator management
│   │   ├── envelope.ts               # ADSR envelopes
│   │   └── filters.ts                # Filter effects
│   ├── music/
│   │   ├── index.ts                  # Music module exports
│   │   ├── sequencer.ts              # Step sequencer
│   │   ├── music-generator.ts        # Procedural music
│   │   └── patterns.ts               # Musical patterns
│   └── sfx/
│       ├── index.ts                  # SFX module exports
│       ├── sound-effects.ts          # SFX definitions
│       └── sfx-player.ts             # SFX playback
│
├── content/
│   ├── index.ts                      # Content module exports
│   ├── characters/
│   │   ├── index.ts                  # Characters exports
│   │   ├── character-data.ts         # Character definitions
│   │   ├── camus.ts                  # Camus-specific content
│   │   ├── leibniz.ts                # Leibniz-specific content
│   │   ├── machiavelli.ts            # Machiavelli-specific content
│   │   └── diogenes.ts               # Diogenes-specific content
│   ├── stages/
│   │   ├── index.ts                  # Stages exports
│   │   └── stage-data.ts             # Stage definitions
│   ├── trials/
│   │   ├── index.ts                  # Trials exports
│   │   ├── trial-data.ts             # Trial scenarios
│   │   ├── moral-dilemmas.ts         # Moral dilemma content
│   │   ├── logic-puzzles.ts          # Logic puzzle content
│   │   └── accusations.ts            # Accusation content
│   ├── clues/
│   │   ├── index.ts                  # Clues exports
│   │   ├── headlines.ts              # Newspaper headlines
│   │   ├── propaganda.ts             # Propaganda slogans
│   │   └── signs.ts                  # Ambient signs
│   ├── upgrades/
│   │   ├── index.ts                  # Upgrades exports
│   │   └── upgrade-data.ts           # Upgrade definitions
│   └── quotes/
│       ├── index.ts                  # Quotes exports
│       └── character-quotes.ts       # Intro/victory lines
│
├── ui/
│   ├── index.ts                      # UI module exports
│   ├── screens/
│   │   ├── index.ts                  # Screens exports
│   │   ├── start-screen.ts           # Title screen
│   │   ├── character-select.ts       # Character selection
│   │   ├── fight-screen.ts           # Fight scene wrapper
│   │   ├── trial-screen.ts           # Trial scene
│   │   ├── upgrade-screen.ts         # Upgrade selection
│   │   ├── results-screen.ts         # Victory/defeat
│   │   └── pause-screen.ts           # Pause menu
│   └── components/
│       ├── index.ts                  # Components exports
│       ├── button.ts                 # Interactive button
│       ├── text-display.ts           # Text rendering
│       └── menu.ts                   # Menu navigation
│
└── utils/
    ├── index.ts                      # Utils exports
    ├── math.ts                       # Math utilities
    ├── timing.ts                     # Frame/time utilities
    ├── random.ts                     # Seeded random
    ├── color.ts                      # Color manipulation
    └── assertions.ts                 # Type guards and assertions
```

---

## 2. CORE MODULE RESPONSIBILITIES

### 2.1 App Module (`src/app/`)

| File | Responsibility |
|------|----------------|
| `bootstrap.ts` | Initialize all systems in correct order, handle startup errors |
| `config.ts` | Define all global constants (frame rate, canvas size, physics values) |
| `game-loop.ts` | Manage requestAnimationFrame, frame timing, pause/resume |

**Key Interfaces:**
```typescript
interface GameConfig {
  targetFPS: number;
  canvasWidth: number;
  canvasHeight: number;
  laneCount: number;
  laneSpacing: number;
  gravity: number;
  audioLatencyCalibration: number;
}

interface FrameState {
  deltaTime: number;
  frameCount: number;
  isPaused: boolean;
  fps: number;
}
```

### 2.2 Core Module (`src/core/`)

#### Input System

| File | Responsibility |
|------|----------------|
| `input-manager.ts` | Aggregate all input sources, provide unified query interface |
| `keyboard.ts` | Track keyboard state (pressed, justPressed, justReleased) |
| `input-binding.ts` | Map physical keys to game actions per player |

**Key Interfaces:**
```typescript
interface InputState {
  players: [PlayerInput, PlayerInput];
}

interface PlayerInput {
  moveLeft: boolean;
  moveRight: boolean;
  moveUp: boolean;
  moveDown: boolean;
  jump: boolean;
  attack: boolean;
  block: boolean;
  special: boolean;
}

interface InputBinding {
  playerId: 1 | 2;
  keys: Map<GameAction, string[]>;
}
```

#### State Machine

| File | Responsibility |
|------|----------------|
| `state-machine.ts` | Generic finite state machine with transitions |
| `scene-manager.ts` | Manage game scenes/modes as states |

**Key Interfaces:**
```typescript
interface State<TState extends string> {
  name: TState;
  onEnter?: () => void;
  onUpdate?: (deltaTime: number) => void;
  onExit?: () => void;
  transitions: Map<TState, () => boolean>;
}

interface Scene {
  name: SceneName;
  enter: () => Promise<void>;
  update: (deltaTime: number) => void;
  render: (ctx: CanvasRenderingContext2D) => void;
  exit: () => Promise<void>;
}

type SceneName = 
  | 'loading'
  | 'start'
  | 'character-select'
  | 'fight'
  | 'trial'
  | 'upgrade'
  | 'results'
  | 'pause';
```

#### Event Bus

| File | Responsibility |
|------|----------------|
| `event-bus.ts` | Decoupled pub/sub for game events |

**Key Events:**
```typescript
type GameEvent =
  | { type: 'fight:start'; data: { stage: number } }
  | { type: 'fight:end'; data: { winner: PlayerId } }
  | { type: 'hit:landed'; data: HitData }
  | { type: 'hit:blocked'; data: BlockData }
  | { type: 'combo:start'; data: { player: PlayerId } }
  | { type: 'combo:increment'; data: { player: PlayerId; count: number } }
  | { type: 'combo:break'; data: { player: PlayerId; count: number } }
  | { type: 'health:changed'; data: { fighter: FighterId; newHealth: number } }
  | { type: 'special:activated'; data: { fighter: FighterId } }
  | { type: 'trial:start'; data: TrialData }
  | { type: 'trial:complete'; data: TrialResult }
  | { type: 'upgrade:applied'; data: UpgradeData };
```

#### Storage

| File | Responsibility |
|------|----------------|
| `persistence.ts` | Wrap localStorage with type safety and error handling |

**Key Interfaces:**
```typescript
interface SaveData {
  unlockedCharacters: CharacterId[];
  bestScores: Record<string, number>;
  campaignProgress: CampaignProgress | null;
  settings: GameSettings;
}

interface CampaignProgress {
  currentStage: number;
  playerLevel: number;
  xp: number;
  upgrades: UpgradeId[];
  selectedCharacter: CharacterId;
}
```

### 2.3 Game Module (`src/game/`)

#### Fight System

| File | Responsibility |
|------|----------------|
| `fight-controller.ts` | Orchestrate fight: rounds, timers, win conditions |
| `fighter.ts` | Fighter entity with state, stats, position, abilities |
| `fighter-state.ts` | Define all fighter states (idle, walk, attack, etc.) |
| `combat.ts` | Pure combat resolution functions (damage, hitstun, knockback) |
| `combo.ts` | Track and manage combo state |
| `hitbox.ts` | Hitbox creation, intersection testing |

**Key Interfaces:**
```typescript
interface Fighter {
  id: FighterId;
  characterId: CharacterId;
  position: Vector2;
  lane: Lane;
  velocity: Vector2;
  state: FighterState;
  facing: Direction;
  health: number;
  maxHealth: number;
  stats: FighterStats;
  upgrades: AppliedUpgrade[];
  specialCooldown: number;
  combo: ComboState;
  hitbox: Hitbox;
  hurtbox: Hitbox;
  stateTimer: number;
  hitstunFrames: number;
  isGrounded: boolean;
  isBlocking: boolean;
  perfectBlockWindow: number;
}

type FighterStateName =
  | 'idle'
  | 'walking'
  | 'running'
  | 'jumping'
  | 'falling'
  | 'attacking'
  | 'blocking'
  | 'hitstun'
  | 'knockdown'
  | 'gettingUp'
  | 'victory'
  | 'defeat'
  | 'special';

interface HitData {
  attacker: FighterId;
  target: FighterId;
  damage: number;
  knockback: Vector2;
  hitstun: number;
  attackType: AttackType;
}

interface ComboState {
  count: number;
  lastHitFrame: number;
  damage: number;
  isActive: boolean;
}
```

#### AI System

| File | Responsibility |
|------|----------------|
| `ai-controller.ts` | High-level AI decision making |
| `ai-behaviors.ts` | Reusable behavior patterns (approach, retreat, punish) |

**Key Interfaces:**
```typescript
interface AIConfig {
  difficulty: 'easy' | 'medium' | 'hard';
  reactionTime: number;      // frames
  aggressiveness: number;    // 0-1
  blockChance: number;       // 0-1
  specialUsage: number;      // 0-1
}

interface AIDecision {
  action: AIAction;
  target?: Vector2;
}

type AIAction =
  | 'idle'
  | 'approach'
  | 'retreat'
  | 'attack'
  | 'block'
  | 'jump'
  | 'useSpecial'
  | 'combo';
```

#### Physics System

| File | Responsibility |
|------|----------------|
| `movement.ts` | Apply velocity, acceleration, friction |
| `collision.ts` | AABB collision detection, resolution |
| `lanes.ts` | Lane positioning, transition logic |

**Key Interfaces:**
```typescript
interface PhysicsBody {
  position: Vector2;
  velocity: Vector2;
  acceleration: Vector2;
  bounds: AABB;
}

interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LaneConfig {
  count: number;
  spacing: number;
  positions: number[];
}
```

#### Campaign System

| File | Responsibility |
|------|----------------|
| `campaign-controller.ts` | Manage campaign flow, stage progression |
| `stage-generator.ts` | Assemble stage content (opponent, clues, setting) |
| `clue-generator.ts` | Generate environmental storytelling elements |
| `trial-controller.ts` | Handle trial scenes, scoring, consequences |

**Key Interfaces:**
```typescript
interface CampaignState {
  currentStage: number;
  stages: Stage[];
  playerProgress: PlayerProgress;
}

interface Stage {
  id: string;
  name: string;
  theme: StageTheme;
  opponent: CharacterId;
  difficulty: AIDifficulty;
  clues: Clue[];
  background: BackgroundConfig;
}

interface Clue {
  type: 'headline' | 'propaganda' | 'sign';
  text: string;
  position: Vector2;
  style: ClueStyle;
}

interface Trial {
  id: string;
  type: TrialType;
  prompt: string;
  options: TrialOption[];
  correctOption?: string;
  keywords?: string[];
}

interface TrialResult {
  trialId: string;
  selectedOption?: string;
  typedResponse?: string;
  score: number;
  consequence: TrialConsequence;
}
```

#### Progression System

| File | Responsibility |
|------|----------------|
| `experience.ts` | XP calculation, level progression |
| `upgrades.ts` | Upgrade application, stat modification |

**Key Interfaces:**
```typescript
interface PlayerProgress {
  level: number;
  xp: number;
  xpToNextLevel: number;
  baseStats: FighterStats;
  upgrades: AppliedUpgrade[];
}

interface Upgrade {
  id: UpgradeId;
  name: string;
  description: string;
  effect: UpgradeEffect;
  rarity: 'common' | 'rare' | 'epic';
}

interface AppliedUpgrade {
  upgradeId: UpgradeId;
  statModifiers: Partial<FighterStats>;
  specialModifiers?: SpecialModifier[];
}
```

### 2.4 Render Module (`src/render/`)

| File | Responsibility |
|------|----------------|
| `renderer.ts` | Main render coordination, layer ordering |
| `camera.ts` | Viewport transformation, shake effects |
| `sprite-renderer.ts` | Draw sprites from definitions |
| `procedural-sprites.ts` | Generate character sprites procedurally |
| `particles.ts` | Particle system for effects |
| `hit-sparks.ts` | Combat impact visual effects |
| `screen-effects.ts` | Flash, fade, glitch effects |
| `parallax-bg.ts` | Multi-layer parallax scrolling |
| `stage-backgrounds.ts` | Stage-specific background rendering |
| `hud-renderer.ts` | HUD coordination |
| `health-bar.ts` | Health bar drawing |
| `combo-display.ts` | Combo counter animation |
| `score-display.ts` | Score rendering |

**Key Interfaces:**
```typescript
interface RenderContext {
  ctx: CanvasRenderingContext2D;
  camera: Camera;
  frame: number;
  deltaTime: number;
}

interface Sprite {
  width: number;
  height: number;
  frames?: SpriteFrame[];
  color: string;
  outline?: string;
}

interface Camera {
  x: number;
  y: number;
  zoom: number;
  shake: number;
  target: Vector2;
}
```

### 2.5 Audio Module (`src/audio/`)

| File | Responsibility |
|------|----------------|
| `audio-engine.ts` | Web Audio API context, master gain |
| `oscillator-pool.ts` | Reusable oscillator management |
| `envelope.ts` | ADSR envelope generation |
| `filters.ts` | Low-pass, high-pass, distortion filters |
| `sequencer.ts` | Step sequencer for music |
| `music-generator.ts` | Procedural music composition |
| `patterns.ts` | Musical pattern definitions |
| `sound-effects.ts` | SFX definitions and parameters |
| `sfx-player.ts` | Trigger SFX playback |

**Key Interfaces:**
```typescript
interface AudioEngine {
  context: AudioContext;
  masterGain: GainNode;
  musicGain: GainNode;
  sfxGain: GainNode;
  latencyCalibration: number;
}

interface SynthVoice {
  oscillator: OscillatorNode;
  gain: GainNode;
  filter?: BiquadFilterNode;
}

interface MusicPattern {
  steps: NoteStep[];
  tempo: number;
  loop: boolean;
  swing: number;
}

interface NoteStep {
  note: string | null;
  duration: number;
  velocity: number;
}

interface SFXConfig {
  type: OscillatorType;
  frequency: number | [number, number]; // start, end for sweep
  duration: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  filter?: FilterConfig;
}
```

### 2.6 Content Module (`src/content/`)

| File | Responsibility |
|------|----------------|
| `character-data.ts` | All character definitions |
| `camus.ts`, etc. | Character-specific content |
| `stage-data.ts` | Stage configurations |
| `trial-data.ts` | Trial scenario pool |
| `moral-dilemmas.ts` | Moral dilemma content |
| `logic-puzzles.ts` | Logic puzzle content |
| `accusations.ts` | Accusation scenarios |
| `headlines.ts` | Headline templates |
| `propaganda.ts` | Propaganda slogans |
| `signs.ts` | Ambient sign text |
| `upgrade-data.ts` | Upgrade definitions |
| `character-quotes.ts` | Intro/victory lines |

### 2.7 UI Module (`src/ui/`)

| File | Responsibility |
|------|----------------|
| `start-screen.ts` | Title screen with menu |
| `character-select.ts` | Character selection UI |
| `fight-screen.ts` | Fight scene wrapper |
| `trial-screen.ts` | Trial UI with choices/text input |
| `upgrade-screen.ts` | Upgrade selection UI |
| `results-screen.ts` | Victory/defeat display |
| `pause-screen.ts` | Pause menu overlay |
| `button.ts` | Interactive button component |
| `text-display.ts` | Styled text rendering |
| `menu.ts` | Menu navigation logic |

### 2.8 Utils Module (`src/utils/`)

| File | Responsibility |
|------|----------------|
| `math.ts` | Clamp, lerp, distance, etc. |
| `timing.ts` | Frame timing, debounce, throttle |
| `random.ts` | Seeded random, weighted choice |
| `color.ts` | Color interpolation, hex conversion |
| `assertions.ts` | Type guards, invariant checks |

---

## 3. MAJOR DATA MODELS

### 3.1 Core Type Definitions

```typescript
// === Identifiers ===
type PlayerId = 1 | 2;
type FighterId = `fighter_${PlayerId}`;
type CharacterId = 'camus' | 'leibniz' | 'machiavelli' | 'diogenes';
type UpgradeId = string;
type TrialId = string;
type StageId = string;

// === Direction ===
type Direction = 'left' | 'right';

// === Lane System ===
type Lane = 0 | 1 | 2; // Front, Middle, Back

// === Vector Types ===
interface Vector2 {
  x: number;
  y: number;
}

// === Fighter Stats ===
interface FighterStats {
  health: number;
  strength: number;
  defense: number;
  agility: number;
  magic: number;
}

// === Attack Data ===
interface AttackData {
  id: string;
  name: string;
  damage: number;
  hitstun: number;
  knockback: Vector2;
  range: number;
  startup: number;
  active: number;
  recovery: number;
  type: 'light' | 'medium' | 'heavy' | 'special';
}

// === Character Definition ===
interface CharacterDefinition {
  id: CharacterId;
  name: string;
  subtitle: string;
  baseStats: FighterStats;
  special: SpecialAttack;
  gimmick: CharacterGimmick;
  quotes: CharacterQuotes;
  colors: CharacterColors;
}

interface SpecialAttack {
  name: string;
  description: string;
  damage: number;
  cooldown: number;
  range: number;
  type: 'projectile' | 'aoe' | 'counter' | 'buff';
}

interface CharacterGimmick {
  name: string;
  description: string;
  trigger: GimmickTrigger;
  effect: GimmickEffect;
}

interface CharacterQuotes {
  intro: string[];
  victory: string[];
  defeat: string[];
  special: string[];
}
```

### 3.2 Game State Model

```typescript
interface GameState {
  scene: SceneName;
  previousScene: SceneName | null;
  input: InputState;
  fight: FightState | null;
  campaign: CampaignState | null;
  versus: VersusState | null;
  trial: TrialState | null;
  settings: GameSettings;
  frame: FrameState;
}

interface FightState {
  fighters: [Fighter, Fighter];
  round: number;
  roundsToWin: number;
  scores: [number, number];
  timer: number;
  combo: [ComboState, ComboState];
  stage: Stage;
  isActive: boolean;
  isPaused: boolean;
}

interface VersusState {
  player1Character: CharacterId;
  player2Character: CharacterId;
  stage: Stage;
}

interface TrialState {
  trial: Trial;
  selectedOption: string | null;
  typedResponse: string;
  isTyping: boolean;
  result: TrialResult | null;
}

interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  audioLatencyCalibration: number;
  screenShake: boolean;
  showHitboxes: boolean; // Debug
}
```

---

## 4. SCENE/STATE FLOW

### 4.1 State Machine Diagram

```
                    ┌─────────────┐
                    │   LOADING   │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
              ┌─────│    START    │─────┐
              │     └──────┬──────┘     │
              │            │            │
              │            ▼            │
         [Versus]   ┌─────────────┐    [Settings]
              │     │   CAMPAIGN  │        │
              │     │   SELECT    │        │
              │     └──────┬──────┘        │
              │            │               │
              ▼            ▼               ▼
       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
       │   VERSUS    │ │    STAGE    │ │   START     │
       │   SELECT    │ │    INTRO    │ │  (return)   │
       └──────┬──────┘ └──────┬──────┘ └─────────────┘
              │               │
              ▼               ▼
       ┌─────────────┐ ┌─────────────┐
       │    FIGHT    │◀│    FIGHT    │
       │  (Versus)   │ │ (Campaign)  │
       └──────┬──────┘ └──────┬──────┘
              │               │
              ▼               ▼
       ┌─────────────┐ ┌─────────────┐
       │   RESULTS   │ │   TRIAL     │
       │  (Versus)   │ │  (Campaign) │
       └──────┬──────┘ └──────┬──────┘
              │               │
              │               ▼
              │        ┌─────────────┐
              │        │   RESULTS   │
              │        │   + XP      │
              │        └──────┬──────┘
              │               │
              │               ▼
              │        ┌─────────────┐
              │        │   UPGRADE   │
              │        │  (if win)   │
              │        └──────┬──────┘
              │               │
              ▼               ▼
       ┌─────────────────────────────┐
       │          START              │
       │     (or next stage)         │
       └─────────────────────────────┘
```

### 4.2 Scene Transitions

| From | To | Trigger |
|------|-----|---------|
| loading | start | Assets initialized |
| start | character-select | Campaign/Versus selected |
| character-select | stage-intro | Characters confirmed |
| stage-intro | fight | Intro animation complete |
| fight | results | Round/match resolved |
| fight | trial | Campaign fight won |
| trial | results | Trial completed |
| results | upgrade | Campaign mode, player won |
| results | start | Campaign complete or Versus done |
| upgrade | stage-intro | Next stage |
| *any | pause | Pause key pressed |
| pause | *previous | Pause key or resume selected |

---

## 5. TESTING STRATEGY

### 5.1 Test Categories

| Category | Location | Focus |
|----------|----------|-------|
| Unit Tests | `tests/unit/` | Pure functions, isolated logic |
| Integration Tests | `tests/integration/` | Multi-system interactions |

### 5.2 Testable Modules (Priority Order)

1. **Combat Logic** (`src/game/fight/combat.ts`)
   - Damage calculation with stats
   - Hitstun duration
   - Knockback vectors
   - Combo damage scaling

2. **Combo System** (`src/game/fight/combo.ts`)
   - Combo counting rules
   - Timeout logic
   - Damage multiplier application

3. **Upgrade Logic** (`src/game/progression/upgrades.ts`)
   - Stat modification
   - Effect application

4. **Trial Scoring** (`src/game/campaign/trial-controller.ts`)
   - Keyword matching
   - Score calculation

5. **AI Decision Logic** (`src/game/ai/ai-controller.ts`)
   - Action selection
   - Difficulty scaling

6. **Content Generation** (`src/game/campaign/clue-generator.ts`, `stage-generator.ts`)
   - Deterministic output with seeds
   - Content pool selection

7. **State Transitions** (`src/core/state/`)
   - Valid transitions only
   - Enter/exit lifecycle

### 5.3 Test Utilities

```typescript
// tests/test-utils.ts

// Mock fighter for testing
function createMockFighter(overrides?: Partial<Fighter>): Fighter;

// Mock input state
function createMockInput(overrides?: Partial<InputState>): InputState;

// Frame simulation
function simulateFrames(count: number, update: (dt: number) => void): void;

// Seeded random for deterministic tests
function createSeededRandom(seed: number): () => number;
```

### 5.4 What NOT to Test

- Canvas rendering output (visual testing not practical)
- Audio output (integration testing sufficient)
- Browser-specific behaviors (rely on manual testing)

---

## 6. CONTENT STRATEGY

### 6.1 Content Sourcing

All content is **code-defined** with no external assets for MVP:

- **Sprites:** Procedurally generated rectangles/polygons with colors
- **Backgrounds:** Layered rectangles with gradient effects
- **Audio:** Web Audio API synthesis only
- **Text:** All authored in TypeScript files

### 6.2 Content Volume (MVP)

| Content Type | Count | Notes |
|--------------|-------|-------|
| Characters | 4 | Camus, Leibniz, Machiavelli, Diogenes |
| Stages | 4 | One per campaign stage |
| Backgrounds | 4 | Procedural per stage |
| Trial Scenarios | 12 | 4 per type |
| Headlines | 10 templates | Remixed at runtime |
| Propaganda | 10 slogans | Mixed and matched |
| Signs | 8 ambient | Environmental |
| Upgrades | 10 modules | 5 common, 3 rare, 2 epic |
| Character Quotes | 20+ | ~5 per character per category |

### 6.3 Content Definition Pattern

```typescript
// src/content/characters/camus.ts
import { CharacterDefinition } from '@/game/types';

export const CAMUS: CharacterDefinition = {
  id: 'camus',
  name: 'Albert Camus',
  subtitle: 'The Absurdist',
  baseStats: {
    health: 100,
    strength: 12,
    defense: 8,
    agility: 10,
    magic: 7,
  },
  special: {
    name: 'Absurd Revolt',
    description: 'Unleash the meaningless fury of existence',
    damage: 25,
    cooldown: 300,
    range: 100,
    type: 'aoe',
  },
  gimmick: {
    name: "Rebel's Resilience",
    description: 'Grows stronger as hope fades',
    trigger: 'on_health_loss',
    effect: { type: 'damage_bonus', value: 0.02, per: 0.1 },
  },
  quotes: {
    intro: [
      'I rebel, therefore we exist.',
      'The absurd is the essential concept.',
      'One must imagine Sisyphus happy... and furious.',
    ],
    victory: [
      'The struggle itself is enough.',
      'In the midst of winter, I found an invincible summer.',
      'Your defeat was always meaningless. Sorry.',
    ],
    defeat: [
      'Perhaps this too is absurd...',
      'At least I imagined myself happy.',
    ],
    special: ['ABSURD REVOLT!', 'EMBRACE THE VOID!'],
  },
  colors: {
    primary: '#00F5FF',   // Cyan
    secondary: '#FF00FF', // Magenta
    accent: '#39FF14',    // Acid Green
  },
};
```

---

## 7. FUTURE EXTENSION POINTS

The architecture explicitly leaves room for:

### 7.1 Network Multiplayer

```typescript
// Future: src/network/
// - connection-manager.ts (WebSocket)
// - input-sync.ts (Input serialization)
// - state-sync.ts (Game state sync)
// - latency-compensation.ts (Rollback netcode)
```

**Extension Points:**
- `InputManager` already supports multiple input sources
- `FightController` is deterministic with fixed timestep
- State machine can pause for sync

### 7.2 External Content Loading

```typescript
// Future: src/content/content-loader.ts
// - Load character definitions from JSON
// - Load stage configurations
// - Support mods/DLC
```

**Extension Points:**
- Content is already data-driven
- Type definitions support runtime loading
- Validation layer can be added

### 7.3 AI API Integration

```typescript
// Future: src/ai/external-ai.ts
// - Trial response evaluation
// - Dynamic content generation
// - Adaptive difficulty
```

**Extension Points:**
- `TrialController` has pluggable scoring
- Content generators can be enhanced
- AI difficulty system is modular

### 7.4 Expanded Roster

```typescript
// Future: More characters
// - Add to content/characters/
// - Update CharacterId type
// - No engine changes needed
```

### 7.5 Ability DSL

```typescript
// Future: src/game/abilities/
// - ability-dsl.ts (Parser for custom abilities)
// - ability-runtime.ts (Execution engine)
// - ability-builder.ts (UI for creation)
```

**Extension Points:**
- `AppliedUpgrade` already has `specialModifiers`
- `Fighter` state machine is extensible
- Event system supports new effect types

---

## 8. BUILD & DEVELOPMENT CONFIGURATION

### 8.1 Package.json Structure

```json
{
  "name": "ethic-brawl",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "typecheck": "tsc --noEmit",
    "lint": "biome check .",
    "lint:fix": "biome check --write .",
    "format": "biome format --write ."
  },
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.0.0",
    "@biomejs/biome": "^1.5.0"
  }
}
```

### 8.2 TypeScript Configuration

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "tests/**/*.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 8.3 Vite Configuration

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
  },
});
```

### 8.4 Biome Configuration

```json
{
  "$schema": "https://biomejs.dev/schemas/1.5.0/schema.json",
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedVariables": "error"
      },
      "style": {
        "useConst": "error",
        "noVar": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "formatWithErrors": false,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  }
}
```

---

*End of Phase 2 Architecture Specification*
*Next: Implementation Plan (Phase 3)*
