/**
 * AI controller for computer-controlled opponents
 */

import type { PlayerInput } from '../fight/fight-controller';
import type { Fighter } from '../fight/fighter';

/**
 * AI difficulty levels
 */
export type AIDifficulty = 'easy' | 'medium' | 'hard';

/**
 * AI configuration
 */
export interface AIConfig {
  difficulty: AIDifficulty;
  reactionTime: number; // frames before AI reacts
  aggressiveness: number; // 0-1, how often AI attacks
  blockChance: number; // 0-1, chance to block incoming attacks
  specialUsage: number; // 0-1, how often AI uses specials
  comboAbility: number; // 0-1, chance to continue combos
  optimalRange: number; // preferred fighting distance
  retreatThreshold: number; // health % at which AI retreats
}

/**
 * Default AI configurations per difficulty
 */
export const AI_DIFFICULTY_CONFIG: Record<AIDifficulty, AIConfig> = {
  easy: {
    difficulty: 'easy',
    reactionTime: 20,
    aggressiveness: 0.3,
    blockChance: 0.2,
    specialUsage: 0.1,
    comboAbility: 0.2,
    optimalRange: 80,
    retreatThreshold: 0.2,
  },
  medium: {
    difficulty: 'medium',
    reactionTime: 12,
    aggressiveness: 0.5,
    blockChance: 0.4,
    specialUsage: 0.25,
    comboAbility: 0.5,
    optimalRange: 70,
    retreatThreshold: 0.25,
  },
  hard: {
    difficulty: 'hard',
    reactionTime: 6,
    aggressiveness: 0.7,
    blockChance: 0.6,
    specialUsage: 0.4,
    comboAbility: 0.8,
    optimalRange: 60,
    retreatThreshold: 0.3,
  },
};

/**
 * AI state for decision tracking
 */
interface AIState {
  currentAction: AIAction;
  actionTimer: number;
  reactionBuffer: PlayerInput | null;
  lastDecisionFrame: number;
  targetPosition: number;
}

/**
 * AI actions
 */
type AIAction =
  | 'idle'
  | 'approach'
  | 'retreat'
  | 'attack'
  | 'block'
  | 'jump'
  | 'use_special'
  | 'combo'
  | 'lane_change';

/**
 * Create AI controller
 */
export function createAIController(config: AIConfig) {
  let state: AIState = {
    currentAction: 'idle',
    actionTimer: 0,
    reactionBuffer: null,
    lastDecisionFrame: 0,
    targetPosition: 0,
  };

  /**
   * Update AI and get input for this frame
   */
  function update(aiFighter: Fighter, playerFighter: Fighter, currentFrame: number): PlayerInput {
    const input = createEmptyInput();

    // Update action timer
    if (state.actionTimer > 0) {
      state.actionTimer--;
    }

    // Make new decision if action complete
    if (state.actionTimer <= 0) {
      makeDecision(aiFighter, playerFighter, currentFrame);
    }

    // Execute current action
    executeAction(input, aiFighter, playerFighter, currentFrame);

    return input;
  }

  /**
   * Make a decision about what to do
   */
  function makeDecision(ai: Fighter, player: Fighter, _frame: number): void {
    const distance = Math.abs(ai.x - player.x);
    const healthPercent = ai.health / ai.stats.maxHealth;

    // Should we retreat?
    if (healthPercent < config.retreatThreshold && Math.random() < 0.3) {
      state.currentAction = 'retreat';
      state.actionTimer = 30;
      return;
    }

    // Are we too far? Approach
    if (distance > config.optimalRange + 30) {
      state.currentAction = 'approach';
      state.actionTimer = 15;
      return;
    }

    // Are we being attacked? Block or dodge
    if (player.state === 'attacking' && Math.random() < config.blockChance) {
      state.currentAction = 'block';
      state.actionTimer = 20;
      return;
    }

    // In optimal range - attack or defend
    if (distance <= config.optimalRange + 10) {
      // Use special if available
      if (ai.specialCooldown === 0 && Math.random() < config.specialUsage) {
        state.currentAction = 'use_special';
        state.actionTimer = 15;
        return;
      }

      // Random lane change
      if (Math.random() < 0.1) {
        state.currentAction = 'lane_change';
        state.actionTimer = 20;
        return;
      }

      // Attack
      if (Math.random() < config.aggressiveness) {
        // Continue combo if we just hit
        if (ai.combo.isActive && Math.random() < config.comboAbility) {
          state.currentAction = 'combo';
        } else {
          state.currentAction = 'attack';
        }
        state.actionTimer = 20;
        return;
      }

      // Jump attack
      if (Math.random() < 0.15 && ai.isGrounded) {
        state.currentAction = 'jump';
        state.actionTimer = 30;
        return;
      }
    }

    // Default: approach slowly
    state.currentAction = 'approach';
    state.actionTimer = 10;
  }

  /**
   * Execute the current action
   */
  function executeAction(input: PlayerInput, ai: Fighter, player: Fighter, _frame: number): void {
    const distance = ai.x - player.x;
    const isPlayerAttacking = player.state === 'attacking';

    switch (state.currentAction) {
      case 'approach':
        if (distance > 0) {
          input.moveLeft = true;
        } else {
          input.moveRight = true;
        }
        break;

      case 'retreat':
        if (distance > 0) {
          input.moveRight = true;
        } else {
          input.moveLeft = true;
        }
        break;

      case 'attack':
        // Approach first if too far
        if (Math.abs(distance) > config.optimalRange) {
          if (distance > 0) {
            input.moveLeft = true;
          } else {
            input.moveRight = true;
          }
        }
        // Then attack
        input.attackPressed = Math.random() < 0.5;
        input.attack = true;
        break;

      case 'combo':
        input.attackPressed = true;
        input.attack = true;
        break;

      case 'block':
        input.block = true;
        if (isPlayerAttacking) {
          input.blockPressed = true;
        }
        break;

      case 'jump':
        if (ai.isGrounded) {
          input.jumpPressed = true;
          input.jump = true;
        }
        // Attack while jumping
        if (!ai.isGrounded) {
          input.attackPressed = Math.random() < 0.6;
        }
        break;

      case 'use_special':
        input.specialPressed = true;
        input.special = true;
        break;

      case 'lane_change':
        // Change lanes to dodge or approach
        if (ai.lane < 2 && Math.random() < 0.5) {
          input.moveUp = true;
        } else if (ai.lane > 0) {
          input.moveDown = true;
        }
        break;

      default:
        // Do nothing
        break;
    }
  }

  /**
   * Reset AI state
   */
  function reset(): void {
    state = {
      currentAction: 'idle',
      actionTimer: 0,
      reactionBuffer: null,
      lastDecisionFrame: 0,
      targetPosition: 0,
    };
  }

  return {
    update,
    reset,
    getConfig: () => config,
    getCurrentAction: () => state.currentAction,
  };
}

/**
 * Create empty input state
 */
function createEmptyInput(): PlayerInput {
  return {
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false,
    jump: false,
    jumpPressed: false,
    attack: false,
    attackPressed: false,
    block: false,
    blockPressed: false,
    special: false,
    specialPressed: false,
  };
}
