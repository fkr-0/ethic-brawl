import { type CharacterId, getCharacter } from '@/content/characters/character-data';
import { ROUNDS_TO_WIN } from '@/app/config';
import type { PlayerInput as CorePlayerInput } from '@/core/input/input-binding';
import { type FightState, Fighter, type PlayerInput, createFightController } from '@/game';
import {
  applyFightCameraEffects,
  cameraFollowTargets,
  createCamera,
  renderFightScene,
  updateCamera,
} from '@/render';

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

export interface FightCharacterSelection {
  player1: CharacterId;
  player2: CharacterId;
}

export interface FightRuntimeStatus {
  hasRoundWinner: boolean;
  hasFightResult: boolean;
}

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

  const initialize = (selection: FightCharacterSelection = DEFAULT_SELECTION): FightState => {
    const { player1, player2 } = createInitialFighters(selection);
    controller.init(player1, player2);
    const state = controller.getState();
    if (!state) {
      throw new Error('fight controller failed to initialize');
    }
    return state;
  };

  initialize(DEFAULT_SELECTION);

  function update(deltaTime: number, input1: CorePlayerInput, input2: CorePlayerInput): void {
    controller.update(deltaTime, toFightInput(input1), toFightInput(input2));
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
    applyFightCameraEffects(camera, state.cameraEffects);
  }

  function render(ctx: CanvasRenderingContext2D): void {
    const state = controller.getState();
    if (!state) {
      return;
    }

    renderFightScene(ctx, state, camera);
  }

  function reset(selection?: FightCharacterSelection): void {
    initialize(selection ?? DEFAULT_SELECTION);
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
    resolveMatchForTesting,
  };
}

export type FightRuntime = ReturnType<typeof createFightRuntime>;
