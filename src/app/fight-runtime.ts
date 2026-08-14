import { ROUNDS_TO_WIN } from '@/app/config';
import { type CharacterId, getCharacter } from '@/content/characters/character-data';
import type { PlayerInput as CorePlayerInput } from '@/core/input/input-binding';
import {
  type FightRuleSet,
  type FightState,
  Fighter,
  type PlayerInput,
  createFightController,
} from '@/game';
import {
  type AIDifficulty,
  AI_DIFFICULTY_CONFIG,
  createAIController,
} from '@/game/ai/ai-controller';
import {
  type FightPresentationOptions,
  applyFightCameraEffects,
  cameraFollowTargets,
  clearFighterAnimationCache,
  createCamera,
  renderFightScene,
  updateCamera,
} from '@/render';
import {
  DEFAULT_FIGHT_PRESENTATION_POLICY,
  presentationPolicyToRenderOptions,
  type FightPresentationPolicy,
} from './presentation-policy';

function toFightInput(input: CorePlayerInput): PlayerInput {
  return {
    moveLeft: input.moveLeft,
    moveRight: input.moveRight,
    moveUp: input.moveUp,
    moveDown: input.moveDown,
    jump: input.jump,
    jumpPressed: input.jumpPressed,
    attack: input.attack,
    attackPressed: input.attackPressed,
    block: input.block,
    blockPressed: input.blockPressed,
    special: input.special,
    specialPressed: input.specialPressed,
  };
}

export interface FightRuntimeOptions {
  player1AIDifficulty?: AIDifficulty;
  player2AIDifficulty?: AIDifficulty;
  fightRules?: FightRuleSet;
}

export interface FightCharacterSelection {
  player1: CharacterId;
  player2: CharacterId;
}

export interface FightRuntimeStatus {
  hasRoundWinner: boolean;
  hasFightResult: boolean;
}

/**
 * AI showcase rounds are intentionally compact: enough health for authored
 * chains, defense, and specials to appear, but short enough for rapid roster
 * review and deterministic browser certification.
 */
export const AI_SHOWCASE_FIGHT_RULES: FightRuleSet = {
  id: 'ai_showcase_sprint',
  label: 'AI Showcase Sprint',
  roundTimeSeconds: 15,
  player1StartEnergyRatio: 1,
  player2StartEnergyRatio: 1,
  player1StartSpecialCooldownRatio: 0,
  player2StartSpecialCooldownRatio: 0,
  player1HealthMultiplier: 3,
  player2HealthMultiplier: 3,
};

const DEFAULT_SELECTION: FightCharacterSelection = {
  player1: 'camus',
  player2: 'machiavelli',
};

const EMPTY_FIGHT_INPUT: PlayerInput = {
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

function createInitialFighters(selection: FightCharacterSelection) {
  const player1 = new Fighter('p1', selection.player1, 1, getCharacter(selection.player1), 240, 1);
  const player2 = new Fighter('p2', selection.player2, 2, getCharacter(selection.player2), 720, 1);
  return { player1, player2 };
}

export function createFightRuntime() {
  const controller = createFightController();
  const camera = createCamera();
  let player1AIDifficulty: AIDifficulty = 'medium';
  let player2AIDifficulty: AIDifficulty = 'medium';
  let player1AI = createAIController(AI_DIFFICULTY_CONFIG[player1AIDifficulty]);
  let player2AI = createAIController(AI_DIFFICULTY_CONFIG[player2AIDifficulty]);
  let presentationPolicy = DEFAULT_FIGHT_PRESENTATION_POLICY;

  const initialize = (
    selection: FightCharacterSelection = DEFAULT_SELECTION,
    options: FightRuntimeOptions = {}
  ): FightState => {
    const requestedPlayer1Difficulty = options.player1AIDifficulty ?? player1AIDifficulty;
    if (requestedPlayer1Difficulty !== player1AIDifficulty) {
      player1AIDifficulty = requestedPlayer1Difficulty;
      player1AI = createAIController(AI_DIFFICULTY_CONFIG[player1AIDifficulty]);
    }
    const requestedDifficulty = options.player2AIDifficulty ?? player2AIDifficulty;
    if (requestedDifficulty !== player2AIDifficulty) {
      player2AIDifficulty = requestedDifficulty;
      player2AI = createAIController(AI_DIFFICULTY_CONFIG[player2AIDifficulty]);
    }
    const { player1, player2 } = createInitialFighters(selection);
    clearFighterAnimationCache();
    player1AI.reset();
    player2AI.reset();
    controller.init(player1, player2, options.fightRules);
    const state = controller.getState();
    if (!state) {
      throw new Error('fight controller failed to initialize');
    }
    return state;
  };

  initialize(DEFAULT_SELECTION);

  function update(
    deltaTime: number,
    input1: CorePlayerInput,
    input2: CorePlayerInput,
    computerControlledPlayer2 = false,
    computerControlledPlayer1 = false
  ): void {
    const beforeUpdate = controller.getState();
    const player1Input =
      computerControlledPlayer1 && beforeUpdate
        ? player1AI.update(beforeUpdate.player1, beforeUpdate.player2, beforeUpdate.frameCount + 1)
        : toFightInput(input1);
    const player2Input =
      computerControlledPlayer2 && beforeUpdate
        ? player2AI.update(beforeUpdate.player2, beforeUpdate.player1, beforeUpdate.frameCount + 1)
        : toFightInput(input2);
    controller.update(deltaTime, player1Input, player2Input);
    const state = controller.getState();
    if (!state) {
      return;
    }

    cameraFollowTargets(camera, [
      { x: state.player1.x, y: state.player1.getWorldY() - 80 },
      { x: state.player2.x, y: state.player2.getWorldY() - 80 },
    ]);
    updateCamera(camera, {
      minX: 320,
      maxX: 640,
      followSpeed: 0.08,
    });
    applyFightCameraEffects(camera, state.cameraEffects, presentationPolicy.cameraEffectScale);
  }

  function getPlayer1AIDifficulty(): AIDifficulty {
    return player1AIDifficulty;
  }

  function getPlayer2AIDifficulty(): AIDifficulty {
    return player2AIDifficulty;
  }

  function getPlayer1AIAction(): string {
    return player1AI.getCurrentAction();
  }

  function getPlayer2AIAction(): string {
    return player2AI.getCurrentAction();
  }

  function setPresentationPolicy(policy: FightPresentationPolicy): void {
    presentationPolicy = { ...policy };
  }

  function getPresentationOptions() {
    return presentationPolicyToRenderOptions(presentationPolicy);
  }

  function render(
    ctx: CanvasRenderingContext2D,
    presentation: FightPresentationOptions = {}
  ): void {
    const state = controller.getState();
    if (!state) {
      return;
    }

    renderFightScene(ctx, state, camera, {
      ...getPresentationOptions(),
      ...presentation,
    });
  }

  function reset(selection?: FightCharacterSelection, options: FightRuntimeOptions = {}): void {
    initialize(selection ?? DEFAULT_SELECTION, options);
  }

  function getResult() {
    return controller.getState()?.result ?? null;
  }

  function hasRoundWinner(): boolean {
    return Boolean(controller.getState()?.round.winner);
  }

  function startNextRound(): void {
    controller.startNextRound();
  }

  function getState(): FightState | null {
    return controller.getState();
  }

  function getCamera() {
    return camera;
  }

  /** Deterministic browser-test seam; normal gameplay never calls this. */
  function resolveMatchForTesting(winner: 1 | 2): void {
    const state = controller.getState();
    if (!state || state.result) return;
    state.scores[winner - 1] = ROUNDS_TO_WIN - 1;
    const winningFighter = winner === 1 ? state.player1 : state.player2;
    const losingFighter = winner === 1 ? state.player2 : state.player1;
    winningFighter.health = Math.max(1, winningFighter.health);
    losingFighter.health = 0;
    controller.update(0, EMPTY_FIGHT_INPUT, EMPTY_FIGHT_INPUT);
  }

  return {
    update,
    render,
    reset,
    startNextRound,
    hasRoundWinner,
    getResult,
    getState,
    getCamera,
    getPlayer1AIDifficulty,
    getPlayer2AIDifficulty,
    getPlayer1AIAction,
    getPlayer2AIAction,
    setPresentationPolicy,
    getPresentationOptions,
    resolveMatchForTesting,
  };
}

export type FightRuntime = ReturnType<typeof createFightRuntime>;
