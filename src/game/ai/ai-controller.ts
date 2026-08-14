/**
 * Tactical AI controller for computer-controlled fighters.
 *
 * The controller deliberately uses short, deterministic decisions so AI-vs-AI
 * matches remain readable and reproducible while still varying movement,
 * defense, normal chains, jump-ins, and directional command specials.
 */

import { getCharacterNormalChainLength } from '../../content/characters/character-data';
import type { PlayerInput } from '../fight/fight-controller';
import type { CommandSlot } from '../fight/command-input';
import type { Fighter } from '../fight/fighter';

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface AIConfig {
  difficulty: AIDifficulty;
  reactionTime: number;
  aggressiveness: number;
  blockChance: number;
  specialUsage: number;
  comboAbility: number;
  optimalRange: number;
  retreatThreshold: number;
}

export const AI_DIFFICULTY_CONFIG: Record<AIDifficulty, AIConfig> = {
  easy: {
    difficulty: 'easy',
    reactionTime: 14,
    aggressiveness: 0.48,
    blockChance: 0.28,
    specialUsage: 0.2,
    comboAbility: 0.45,
    optimalRange: 72,
    retreatThreshold: 0.2,
  },
  medium: {
    difficulty: 'medium',
    reactionTime: 7,
    aggressiveness: 0.78,
    blockChance: 0.48,
    specialUsage: 0.46,
    comboAbility: 0.86,
    optimalRange: 62,
    retreatThreshold: 0.24,
  },
  hard: {
    difficulty: 'hard',
    reactionTime: 3,
    aggressiveness: 0.9,
    blockChance: 0.62,
    specialUsage: 0.64,
    comboAbility: 0.96,
    optimalRange: 56,
    retreatThreshold: 0.28,
  },
};

type AIAction =
  | 'idle'
  | 'dash_approach'
  | 'approach'
  | 'retreat'
  | 'attack'
  | 'combo'
  | 'block'
  | 'evade_lane'
  | 'jump_attack'
  | 'command_special'
  | 'circle';

interface AIState {
  currentAction: AIAction;
  actionTimer: number;
  actionAge: number;
  lastDecisionFrame: number;
  evadeLaneDirection: -1 | 1;
  commandIndex: number;
  activeCommandSlot: CommandSlot;
  randomState: number;
  initialized: boolean;
}

const COMMAND_SEQUENCE: readonly CommandSlot[] = [
  'BFA',
  'BUA',
  'BBA',
  'BDA',
  'BFJ',
  'BUJ',
  'BBJ',
  'BDJ',
];

const ATTACKING_STATES = new Set(['attacking', 'special']);

function createInitialState(): AIState {
  return {
    currentAction: 'idle',
    actionTimer: 0,
    actionAge: 0,
    lastDecisionFrame: Number.NEGATIVE_INFINITY,
    evadeLaneDirection: 1,
    commandIndex: 0,
    activeCommandSlot: COMMAND_SEQUENCE[0] ?? 'BFA',
    randomState: 0,
    initialized: false,
  };
}

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 0x9e3779b9;
}

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

function moveToward(input: PlayerInput, ai: Fighter, player: Fighter): void {
  if (ai.x > player.x) input.moveLeft = true;
  else if (ai.x < player.x) input.moveRight = true;
}

function moveAway(input: PlayerInput, ai: Fighter, player: Fighter): void {
  if (ai.x > player.x) input.moveRight = true;
  else input.moveLeft = true;
}

function alignLane(input: PlayerInput, ai: Fighter, player: Fighter): void {
  if (player.lane > ai.lane) input.moveUp = true;
  else if (player.lane < ai.lane) input.moveDown = true;
}

function moveInLaneDirection(input: PlayerInput, direction: -1 | 1): void {
  if (direction > 0) input.moveUp = true;
  else input.moveDown = true;
}

function relativeHorizontal(ai: Fighter, direction: 'forward' | 'back'): -1 | 1 {
  const facingForward = ai.facing === 'right' ? 1 : -1;
  return direction === 'forward' ? facingForward : facingForward === 1 ? -1 : 1;
}

function applyHorizontal(input: PlayerInput, direction: -1 | 1): void {
  if (direction < 0) input.moveLeft = true;
  else input.moveRight = true;
}

function executeCommandInput(input: PlayerInput, ai: Fighter, slot: CommandSlot): void {
  input.block = true;
  input.blockPressed = true;

  switch (slot) {
    case 'BFA':
    case 'BFJ':
      applyHorizontal(input, relativeHorizontal(ai, 'forward'));
      break;
    case 'BBA':
    case 'BBJ':
      applyHorizontal(input, relativeHorizontal(ai, 'back'));
      break;
    case 'BUA':
    case 'BUJ':
      input.moveUp = true;
      break;
    case 'BDA':
    case 'BDJ':
      input.moveDown = true;
      break;
  }

  if (slot.endsWith('A')) {
    input.attack = true;
    input.attackPressed = true;
  } else {
    input.jump = true;
    input.jumpPressed = true;
  }
}

export function createAIController(config: AIConfig) {
  let state = createInitialState();

  function nextRandom(): number {
    let value = state.randomState || 0x9e3779b9;
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    state.randomState = value >>> 0;
    return state.randomState / 0x1_0000_0000;
  }

  function initialize(ai: Fighter, player: Fighter): void {
    if (state.initialized) return;
    state.randomState = hashSeed(
      `${config.difficulty}:${ai.id}:${ai.characterId}:${player.characterId}:${ai.playerId}`
    );
    state.evadeLaneDirection = ai.lane >= 2 ? -1 : 1;
    state.initialized = true;
  }

  function setAction(action: AIAction, duration: number, currentFrame: number): void {
    state.currentAction = action;
    state.actionTimer = Math.max(1, duration);
    state.actionAge = 0;
    state.lastDecisionFrame = currentFrame;
  }

  function chooseEvadeLane(ai: Fighter): -1 | 1 {
    if (ai.lane <= 0) return 1;
    if (ai.lane >= 2) return -1;
    return nextRandom() < 0.5 ? -1 : 1;
  }

  function isImmediateThreat(ai: Fighter, player: Fighter): boolean {
    if (ai.lane !== player.lane) return false;
    const distance = Math.abs(ai.x - player.x);
    const threatRange = Math.max(config.optimalRange + 24, (player.currentAttack?.range ?? 0) + 18);
    return distance <= threatRange && ATTACKING_STATES.has(player.state);
  }

  function reactToThreat(ai: Fighter, currentFrame: number): void {
    if (nextRandom() < config.blockChance) {
      setAction('block', 5 + Math.round(nextRandom() * 4), currentFrame);
      return;
    }

    state.evadeLaneDirection = chooseEvadeLane(ai);
    setAction('evade_lane', 6 + Math.round(nextRandom() * 3), currentFrame);
  }

  function chooseCommandSpecial(currentFrame: number): void {
    state.activeCommandSlot = COMMAND_SEQUENCE[state.commandIndex] ?? 'BFA';
    state.commandIndex = (state.commandIndex + 1) % COMMAND_SEQUENCE.length;
    setAction('command_special', 4, currentFrame);
  }

  function makeDecision(ai: Fighter, player: Fighter, currentFrame: number): void {
    const distance = Math.abs(ai.x - player.x);
    const healthPercent = ai.health / Math.max(1, ai.stats.maxHealth);
    const laneAligned = ai.lane === player.lane;

    if (isImmediateThreat(ai, player)) {
      reactToThreat(ai, currentFrame);
      return;
    }

    if (distance > config.optimalRange + 34) {
      setAction('dash_approach', 9 + Math.round(nextRandom() * 4), currentFrame);
      return;
    }

    if (!laneAligned) {
      setAction('approach', 7 + Math.round(nextRandom() * 4), currentFrame);
      return;
    }

    if (healthPercent < config.retreatThreshold && nextRandom() < 0.32) {
      setAction('retreat', 5 + Math.round(nextRandom() * 4), currentFrame);
      return;
    }

    if (ai.specialCooldown === 0 && nextRandom() < config.specialUsage) {
      chooseCommandSpecial(currentFrame);
      return;
    }

    if (
      (ai.attackChainIndex > 0 || ai.combo.isActive || nextRandom() < config.comboAbility) &&
      nextRandom() < config.aggressiveness
    ) {
      const chainLength = getCharacterNormalChainLength(ai.character);
      setAction('combo', Math.max(72, chainLength * 38), currentFrame);
      return;
    }

    const movementRoll = nextRandom();
    if (movementRoll < 0.12 && ai.isGrounded) {
      setAction('jump_attack', 26, currentFrame);
      return;
    }
    if (movementRoll < 0.24) {
      state.evadeLaneDirection = chooseEvadeLane(ai);
      setAction('circle', 8 + Math.round(nextRandom() * 4), currentFrame);
      return;
    }

    if (nextRandom() < config.aggressiveness) {
      setAction('attack', 34, currentFrame);
      return;
    }

    setAction('approach', 6 + Math.round(nextRandom() * 4), currentFrame);
  }

  function executeAction(input: PlayerInput, ai: Fighter, player: Fighter): void {
    const distance = Math.abs(ai.x - player.x);
    const shouldClose = distance > config.optimalRange - 8;

    switch (state.currentAction) {
      case 'dash_approach':
        if (state.actionAge !== 1) moveToward(input, ai, player);
        alignLane(input, ai, player);
        break;

      case 'approach':
        moveToward(input, ai, player);
        alignLane(input, ai, player);
        break;

      case 'retreat':
        moveAway(input, ai, player);
        if (state.actionAge < 3) moveInLaneDirection(input, state.evadeLaneDirection);
        break;

      case 'attack':
      case 'combo':
        if (shouldClose) moveToward(input, ai, player);
        alignLane(input, ai, player);
        input.attack = true;
        input.attackPressed = ai.currentAttack === null;
        break;

      case 'block':
        input.block = true;
        input.blockPressed = state.actionAge === 0;
        if (state.actionAge >= 2) moveAway(input, ai, player);
        break;

      case 'evade_lane':
        moveInLaneDirection(input, state.evadeLaneDirection);
        moveAway(input, ai, player);
        break;

      case 'jump_attack':
        moveToward(input, ai, player);
        if (state.actionAge === 0 && ai.isGrounded) {
          input.jump = true;
          input.jumpPressed = true;
        } else if (!ai.isGrounded && ai.currentAttack === null) {
          input.attack = true;
          input.attackPressed = true;
        }
        break;

      case 'command_special':
        if (state.actionAge === 0) {
          executeCommandInput(input, ai, state.activeCommandSlot);
        } else if (state.actionAge === 1) {
          input.special = true;
          input.specialPressed = true;
        }
        break;

      case 'circle':
        moveInLaneDirection(input, state.evadeLaneDirection);
        if (distance > config.optimalRange) moveToward(input, ai, player);
        break;

      case 'idle':
        break;
    }
  }

  function update(aiFighter: Fighter, playerFighter: Fighter, currentFrame: number): PlayerInput {
    initialize(aiFighter, playerFighter);
    const input = createEmptyInput();
    const canInterrupt = currentFrame - state.lastDecisionFrame >= config.reactionTime;

    if (isImmediateThreat(aiFighter, playerFighter) && canInterrupt) {
      reactToThreat(aiFighter, currentFrame);
    } else if (state.actionTimer <= 0) {
      makeDecision(aiFighter, playerFighter, currentFrame);
    }

    executeAction(input, aiFighter, playerFighter);
    state.actionTimer--;
    state.actionAge++;
    return input;
  }

  function reset(): void {
    state = createInitialState();
  }

  return {
    update,
    reset,
    getConfig: () => config,
    getCurrentAction: () => state.currentAction,
    getDiagnostics: () => ({
      currentAction: state.currentAction,
      actionTimer: state.actionTimer,
      commandIndex: state.commandIndex,
      activeCommandSlot: state.activeCommandSlot,
    }),
  };
}
