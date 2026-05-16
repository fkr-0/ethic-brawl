# ETHIC BRAWL — DESIGN SPECIFICATION
## Phase 1: Complete Game Design Document

---

## 1. GAME VISION SUMMARY

### 1.1 Core Concept
**Ethic Brawl** is a 2.5D cyberpunk philosophical arena-brawler that marries tight arcade combat with absurdist philosophical humor. Players control stylized neon-cyberpunk versions of historical philosophers engaged in brutal, satisfying combat across a futuristic dystopia where ideas are fought with fists.

### 1.2 Elevator Pitch
*"Streets of Rage meets Existential Dread meets Neon Genesis Evangelion."* Four philosophers. One dystopian arena. Absurd trials. Perfect combos. Your ethics will be questioned—and your face will be punched.

### 1.3 Target Experience
- **Immediate hook:** Responsive combat that feels good from the first punch
- **Medium-term engagement:** Character progression, ability customization, and philosophical absurdity
- **Memorable moments:** Victory lines about absurdism, trial verdicts that question your morality, combo finishers named after philosophical concepts

---

## 2. MVP SCOPE DEFINITION

### 2.1 In Scope (MVP)

| Category | Feature | Priority |
|----------|---------|----------|
| **Core Combat** | Movement (left/right + lane up/down) | Critical |
| | Jump with gravity | Critical |
| | Basic attack combo chain (3-hit) | Critical |
| | Block with damage reduction | Critical |
| | Perfect block / riposte window | High |
| | Special attack (character unique) | Critical |
| | Run (double-tap) | High |
| | Roll (run + block) | Medium |
| | Hit reactions & knockback | Critical |
| | Combo counter with UI | High |
| | Victory/defeat flow | Critical |
| **Characters** | 4 playable philosophers | Critical |
| | Unique specials per character | Critical |
| | Distinct stats per character | Critical |
| | Intro/victory quotes | Medium |
| **Game Modes** | 1-player campaign vs AI | Critical |
| | Local 1v1 versus mode | Critical |
| **Campaign** | 4-stage campaign | Critical |
| | Stage intro sequences | High |
| | Environmental clue generation | High |
| | Post-fight "Troublesome Disciple" trial | Critical |
| | Trial scoring & consequences | High |
| **Progression** | XP gain between stages | Critical |
| | Attribute upgrades (4 stats) | Critical |
| | Ability module selection | High |
| **Audio** | Procedural synth soundtrack | Critical |
| | Combat SFX (hit, block, special) | Critical |
| | UI SFX | High |
| **UI** | Start screen | Critical |
| | Character select | Critical |
| | HUD (health, combo, score) | Critical |
| | Results screen | Critical |
| | Upgrade/trial screens | Critical |
| **Persistence** | localStorage for progress | High |

### 2.2 Explicitly Out of Scope (MVP)

| Category | Feature | Reason |
|----------|---------|--------|
| Multiplayer | Online/network play | Technical complexity |
| Backend | Server infrastructure | Out of scope |
| AI APIs | External AI services | Complexity & dependency |
| Voice | Voice input recognition | Technical scope |
| Content | Large roster (>4) | Scope control |
| Content | Deep skill tree editor | Complexity |
| Content | Voice acting | Asset scope |
| Platforms | Mobile optimization | Focus on desktop |
| Features | Live service / seasons | Scope control |
| Features | Replay system | Polish item |

---

## 3. NON-GOALS

1. **Not a competitive e-sport platform** — Balance is good enough for fun, not tournament play
2. **Not a realistic philosophy lesson** — Themes are loose and humorous, not educational
3. **Not a content-rich RPG** — Progression is meaningful but streamlined
4. **Not a mobile game** — Desktop browser is the target
5. **Not a live service** — Complete, self-contained experience

---

## 4. PLAYER LOOP

### 4.1 Core Gameplay Loop (Per-Session)

```
┌─────────────────────────────────────────────────────────────┐
│                      START SCREEN                           │
│                    [Campaign] [Versus]                      │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
    ┌─────────────────┐             ┌─────────────────┐
    │   CAMPAIGN      │             │    VERSUS       │
    │   MODE          │             │    MODE         │
    └─────────────────┘             └─────────────────┘
              │                               │
              ▼                               ▼
    ┌─────────────────┐             ┌─────────────────┐
    │ Character       │             │ Character       │
    │ Select          │             │ Select (P1/P2)  │
    └─────────────────┘             └─────────────────┘
              │                               │
              ▼                               ▼
    ┌─────────────────┐             ┌─────────────────┐
    │ STAGE INTRO     │             │ FIGHT!          │
    │ + Clues         │             │                 │
    └─────────────────┘             └─────────────────┘
              │                               │
              ▼                               ▼
    ┌─────────────────┐             ┌─────────────────┐
    │ FIGHT!          │             │ RESULTS         │
    │ vs AI           │             │ Rematch/Exit    │
    └─────────────────┘             └─────────────────┘
              │
              ▼
    ┌─────────────────┐
    │ TROUBLESOME     │
    │ DISCIPLE TRIAL  │
    └─────────────────┘
              │
              ▼
    ┌─────────────────┐
    │ RESULTS + XP    │
    └─────────────────┘
              │
              ▼
    ┌─────────────────┐
    │ UPGRADE CHOICE  │
    │ (if continuing) │
    └─────────────────┘
              │
              ▼
    ┌─────────────────┐
    │ NEXT STAGE      │
    │ (or Victory)    │
    └─────────────────┘
```

### 4.2 Combat Micro-Loop

```
┌──────────────────────────────────────────────────────────────┐
│                    COMBAT ENCOUNTER                          │
├──────────────────────────────────────────────────────────────┤
│  1. OBSERVE — Read opponent position, state, patterns       │
│  2. POSITION — Move horizontally, adjust lane, close/open   │
│  3. ENGAGE — Attack, block, special, or evade               │
│  4. REACT — Hitstun, knockback, combo, or recovery          │
│  5. PUNISH — Capitalize on openings                          │
│  6. REPEAT until victory/defeat                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. COMBAT DESIGN

### 5.1 Movement System

**Horizontal Movement:**
- Walk speed: 3 units/frame
- Run speed: 6 units/frame (activated by double-tap)
- Run acceleration: 0.5 units/frame²
- Run deceleration: 0.8 units/frame²

**Lane Movement (Vertical/Z-Axis):**
- 3 lanes: Front (near camera), Middle, Back (far from camera)
- Lane change speed: 15 frames per transition
- Lane Y-offset: 40px between lanes
- Movement during lane change is slower (50% speed)

**Jump Physics:**
- Initial velocity: 12 units/frame upward
- Gravity: 0.6 units/frame²
- Air control: 40% horizontal movement
- Jump duration: ~40 frames
- Double jump: Not included in MVP

### 5.2 Attack System

**Basic Attack Chain:**
| Hit | Damage | Hitstun | Knockback | Window to Next |
|-----|--------|---------|-----------|----------------|
| 1st | 8 | 12 frames | 2 units | 15 frames |
| 2nd | 10 | 14 frames | 3 units | 18 frames |
| 3rd | 15 | 20 frames | 6 units | N/A (reset) |

**Attack Properties:**
- Startup frames: 6-8 frames
- Active frames: 4-6 frames
- Recovery frames: 12-15 frames
- Range: 50-70 units (character dependent)

**Special Attacks (Per Character):**
| Character | Special Name | Effect | Cooldown |
|-----------|-------------|--------|----------|
| Camus | Absurd Revolt | AOE burst around self | 300 frames |
| Leibniz | Monadic Strike | Homing projectile | 240 frames |
| Machiavelli | Ends Justify | Counter-stance | 180 frames |
| Diogenes | Lantern Flash | Blinding flash + stagger | 360 frames |

### 5.3 Defense System

**Block Mechanics:**
- Block reduces damage by 60%
- Perfect block window: 8 frames before impact
- Perfect block negates all damage
- Perfect block grants 30-frame riposte advantage (opponent in extended recovery)
- Block chip damage: 10% of original damage

**Roll/Evasion:**
- Input: Run + Block
- Duration: 20 frames
- Invulnerability frames: 12-18 (middle portion)
- Recovery: 8 frames vulnerable at end
- Cooldown: 60 frames

### 5.4 Hit Reactions

**Hitstun States:**
| Type | Duration | Use Case |
|------|----------|----------|
| Light stun | 10 frames | Weak hits, pokes |
| Medium stun | 16 frames | Normal attacks |
| Heavy stun | 24 frames | Strong attacks, combo enders |
| Launch | Variable | Knocked airborne, can be comboed |
| Knockdown | 45 frames | Sent to ground, must recover |

**Knockback Formula:**
```
knockback = base_knockback * (1 + damage_multiplier * combo_count * 0.1)
```

### 5.5 Combo System

**Rules:**
- Combo counter increments on consecutive hits within 30-frame window
- Each hit in combo deals +5% damage (stacking)
- Combo breaks if opponent touches ground or 30 frames pass without hit
- UI animates combo count with scale pulse
- Combo count retracts gradually over 60 frames after break

**Combo Multipliers:**
| Combo Count | Damage Bonus | Hitstun Extension |
|-------------|--------------|-------------------|
| 1-3 | +0% | +0 frames |
| 4-6 | +15% | +2 frames |
| 7-10 | +30% | +4 frames |
| 11+ | +50% | +6 frames |

### 5.6 Character Stats

**Base Stats (Before Upgrades):**

| Character | Health | Strength | Defense | Agility | Magic |
|-----------|--------|----------|---------|---------|-------|
| Camus | 100 | 12 | 8 | 10 | 7 |
| Leibniz | 90 | 10 | 7 | 8 | 12 |
| Machiavelli | 85 | 14 | 6 | 11 | 5 |
| Diogenes | 110 | 8 | 10 | 9 | 8 |

**Character Gimmicks:**
- **Camus:** "Rebel's Resilience" — Gains 2% damage bonus for each 10% health lost
- **Leibniz:** "Best of All Worlds" — 10% chance for attacks to deal +50% damage
- **Machiavelli:** "Political Maneuver" — Successful perfect blocks restore 3% health
- **Diogenes:** "Cynic's Disregard" — 20% chance to ignore hitstun from light attacks

---

## 6. CAMPAIGN & TRIAL LOOP

### 6.1 Campaign Structure

**4-Stage Campaign:**
| Stage | Opponent | Setting | Theme |
|-------|----------|---------|-------|
| 1 | Random (Easy AI) | Neon Streets | Introduction |
| 2 | Random (Medium AI) | Data Cathedral | Control vs Freedom |
| 3 | Random (Hard AI) | Algorithmic Arena | Truth vs Power |
| 4 | Boss (Harder AI) | Philosopher's Throne | Final Confrontation |

### 6.2 Stage Flow

```
STAGE INTRO (10 seconds)
├── Stage name display
├── Atmospheric clue generation
│   ├── Newspaper headlines (1-2)
│   ├── Propaganda slogans (1-2)
│   └── Ambient signs (2-3)
└── Opponent reveal

FIGHT
├── 2 rounds (best of 3)
├── Clues visible in background during fight
└── Environmental storytelling

POST-FIGHT
├── Victory/defeat screen
├── XP award
└── Trial trigger (if victory)

TROUBLESOME DISCIPLE TRIAL
├── Dilemma presentation
├── Player response (choice or typed)
├── Scoring & verdict
└── Consequence application

UPGRADE CHOICE
├── Present 3 random upgrade options
├── Player selects one
└── Stats/abilities updated

CONTINUE OR END
```

### 6.3 Trial System

**Trial Types:**

1. **Moral Dilemma (40%)**
   - Scenario with ethical conflict
   - 4 choices representing different philosophical positions
   - No "correct" answer, but alignment affects score

2. **Logic Puzzle (30%)**
   - Propositional logic or simple deduction
   - Correct answer exists
   - Bonus points for correct, partial for interesting wrong answers

3. **Absurd Accusation (30%)**
   - Player accused of philosophical crime
   - Can choose from defenses OR type short response
   - Typed response scored via keyword matching and stance detection

**Scoring Heuristics for Typed Responses:**
```typescript
interface TypedResponseScore {
  keywordMatches: number;      // +5 per relevant keyword
  stanceAlignment: number;     // -10 to +10 based on position
  rhetoricalFlair: number;     // +1 per rhetorical device detected
  length: number;              // +1 per 10 characters (max +10)
  total: number;               // Sum, clamped 0-100
}
```

**Trial Consequences:**
- High score: +10% XP, unlock ability module
- Medium score: +5% XP
- Low score: No bonus, potential -5% XP
- Very low score: "Philosophical Crisis" debuff (next fight -5% damage)

### 6.4 Progression System

**XP & Leveling:**
- XP per stage: 100 base
- XP bonuses from performance (combo count, time, trial score)
- Level up threshold: 150 XP
- Max level: 5 (for 4-stage campaign)

**Upgrade Categories:**
| Attribute | Effect per Point | Max Bonus |
|-----------|------------------|-----------|
| Strength | +3% attack damage | +30% |
| Defense | +2.5% damage reduction | +25% |
| Agility | +2% movement speed | +20% |
| Magic | +5% special damage, -3% cooldown | +50% damage, -30% cooldown |

**Ability Modules (Pick One Per Stage):**
- "Iron Will" — +10% block effectiveness
- "Swift Justice" — +15% attack speed
- "Second Wind" — Recover 10% health when below 30%
- "Combo King" — Combo meter decays 50% slower
- "Critical Thinker" — +20% special damage

---

## 7. ART & AUDIO DIRECTION

### 7.1 Visual Style Guide

**Color Palette:**
| Role | Color | Hex |
|------|-------|-----|
| Primary Background | Deep Purple | #1A0A2E |
| Secondary Background | Dark Magenta | #2D1B4E |
| Accent 1 | Cyan | #00F5FF |
| Accent 2 | Hot Magenta | #FF00FF |
| Accent 3 | Acid Green | #39FF14 |
| UI Primary | White | #FFFFFF |
| UI Secondary | Pale Purple | #B8A9C9 |
| Danger | Neon Red | #FF073A |
| Health | Cyan | #00F5FF |

**Character Silhouette Principles:**
- Camus: Tall, lean, trench coat, cigarette (glowing)
- Leibniz: Stocky, monacle, calculating visor
- Machiavelli: Sharp suit, crown floating above head
- Diogenes: Hunched, large beard, lantern in hand

**Visual Effects:**
- Hit sparks: 6-frame burst, cyan/magenta based on attacker
- Block effect: Shield shimmer, purple glow
- Special activation: Full-screen flash, character-specific color
- Combo text: Scale up + glow pulse, retract on fade

**Background Layers:**
1. Far: Cityscape silhouette, slow parallax
2. Mid: Buildings with animated neon signs
3. Near: Interactive elements, clue displays
4. Overlay: Scan lines, glitch effects

### 7.2 Audio Direction

**Musical Style:**
- Tempo: 120-140 BPM
- Key: Minor keys, occasional modal interchange
- Synthesis: FM synthesis for bass, subtractive for leads
- Rhythm: Syncopated electronic beats with 80s hip-hop influence
- Arpeggios: Fast, quantized runs for energy

**Audio Implementation:**
```typescript
interface AudioConfig {
  masterVolume: number;      // 0.0 - 1.0
  musicVolume: number;       // 0.0 - 1.0
  sfxVolume: number;         // 0.0 - 1.0
  latencyCalibration: number; // milliseconds, default 0
}
```

**Sound Effects Categories:**
| Category | Sounds Needed | Characteristics |
|----------|---------------|-----------------|
| Combat | hit_light, hit_heavy, block, perfect_block | Synthesized impacts |
| Movement | jump, land, run_start, roll | Whoosh and thud |
| Special | special_camus, special_leibniz, etc. | Unique per character |
| UI | select, confirm, cancel, countdown | Retro arcade beeps |
| State | round_start, victory, defeat, combo | Dramatic stingers |

**Procedural Music Approach:**
- Loop-based sequencer with quantization
- 4-bar phrases with variation
- Intensity layers (low, medium, high) based on combat state
- Transition stingers between states

---

## 8. ACCEPTANCE CRITERIA

### 8.1 Functional Requirements

| ID | Requirement | Verification |
|----|-------------|--------------|
| F1 | Player can move left/right with responsive controls | Manual test |
| F2 | Player can change lanes up/down smoothly | Manual test |
| F3 | Player can jump with appropriate physics | Manual test |
| F4 | Player can execute basic attack combo chain | Manual test |
| F5 | Player can block and take reduced damage | Manual test |
| F6 | Perfect block triggers riposte window | Manual test |
| F7 | Player can execute character-specific special | Manual test |
| F8 | Double-tap triggers run state | Manual test |
| F9 | Run + block performs roll with i-frames | Manual test |
| F10 | AI opponent provides reasonable challenge | Playtest |
| F11 | Combo counter tracks consecutive hits | Manual test |
| F12 | All 4 characters are playable and distinct | Manual test |
| F13 | Campaign mode progresses through 4 stages | Manual test |
| F14 | Trial scenes present choices and score responses | Manual test |
| F15 | Upgrades affect stats meaningfully | Unit test + manual |
| F16 | Versus mode allows 2-player local play | Manual test |
| F17 | Game persists progress to localStorage | Automated test |
| F18 | Audio plays and is synchronized | Manual test |
| F19 | All UI screens are accessible | Manual test |
| F20 | Game runs at 60fps on target hardware | Performance test |

### 8.2 Quality Requirements

| ID | Requirement | Target |
|----|-------------|--------|
| Q1 | Frame rate | Stable 60fps |
| Q2 | Input latency | < 3 frames perceived |
| Q3 | Load time | < 3 seconds to playable |
| Q4 | Code coverage (logic) | > 70% for pure functions |
| Q5 | Linting | Zero Biome errors |
| Q6 | TypeScript strict mode | Full compliance |
| Q7 | Accessibility | Keyboard navigable menus |

---

## 9. RISK LIST

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Combat feels "floaty" | Medium | High | Implement frame data early, iterate on feel |
| Lane movement confusing | Medium | Medium | Clear visual lane indicators, smooth transitions |
| AI too easy/hard | Medium | Medium | Tunable difficulty, playtesting |
| Trial content repetitive | Medium | Low | Pool-based randomization, authored variety |
| Audio latency issues | Low | High | Calibration setting, tested on various systems |
| Performance on lower-end devices | Medium | Medium | Sprite batching, simplified effects option |
| Progression feels meaningless | Medium | Medium | Meaningful upgrade impacts, visible stat changes |
| Controls feel crowded (2-player) | Low | Medium | Thoughtful key mapping, configurable if time |

---

## 10. RESOLVED DESIGN QUESTIONS

### Q1: How deep should the ability system be?
**Resolution:** MVP uses simple "pick one of three" upgrades between stages. The modular structure exists in code but the UI is streamlined. Full DSL-style ability crafting is explicitly post-MVP.

### Q2: How should trials affect gameplay?
**Resolution:** Trials primarily affect XP and score. They can unlock ability modules but don't gate progress. "Philosophical Crisis" debuff is the only gameplay penalty and is recoverable.

### Q3: Real-time or turn-based trials?
**Resolution:** Trials are turn-based and pause the action. This ensures players can read and consider without stress. The break in action is intentional pacing.

### Q4: How much content variety is needed?
**Resolution:** Minimum viable content:
- 10 headline templates (remixed)
- 10 propaganda slogans
- 8 trial dilemmas (2 per type per stage theme)
- 6 ability modules
This provides replayability without excessive authoring.

### Q5: Should there be a story/narrative?
**Resolution:** Light narrative frame through environmental clues and trial contexts. No extended cutscenes or dialogue trees. The "story" is the journey through philosophical challenges.

### Q6: How should 2-player mode work on one keyboard?
**Resolution:** Split keyboard with clear zones:
- P1: Left side (WASD + IJKL)
- P2: Right side (Arrows + Numpad or nearby keys)
This is tested and works for local play.

---

## 11. OPEN QUESTIONS FOR FUTURE PHASES

1. Should we add a "New Game+" mode with harder AI?
2. Could trials become multiplayer debates?
3. Should we add environmental hazards?
4. Could special moves have customization options?
5. Should we add a "Philosophy Codex" unlockable?

These are noted but **not addressed in MVP**.

---

*End of Phase 1 Design Specification*
*Next: Architecture Spec (Phase 2)*
