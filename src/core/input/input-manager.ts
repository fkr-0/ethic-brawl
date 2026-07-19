/**
 * Shared arcade-runtime semantic input adapter for both Ethic Brawl players.
 */

import {
  type ActionBinding,
  type ActionState,
  createActionInput,
} from '../../../vendor/arcade-runtime.mjs';
import {
  GAME_ACTIONS,
  type GameAction,
  type InputBinding,
  PLAYER1_BINDINGS,
  PLAYER2_BINDINGS,
  type PlayerInput,
  cloneInputBinding,
  createEmptyPlayerInput,
} from './input-binding';
import { createKeyboard } from './keyboard';

export interface InputState {
  player1: PlayerInput;
  player2: PlayerInput;
}

type CoreSnapshot = Readonly<Record<GameAction, ActionState>>;

const GAMEPAD_BINDINGS: Record<GameAction, ActionBinding[]> = {
  moveLeft: [
    { type: 'axis', index: 0, direction: -1 },
    { type: 'button', index: 14 },
  ],
  moveRight: [
    { type: 'axis', index: 0, direction: 1 },
    { type: 'button', index: 15 },
  ],
  moveUp: [
    { type: 'axis', index: 1, direction: -1 },
    { type: 'button', index: 12 },
  ],
  moveDown: [
    { type: 'axis', index: 1, direction: 1 },
    { type: 'button', index: 13 },
  ],
  jump: [{ type: 'button', index: 0 }],
  attack: [{ type: 'button', index: 2 }],
  block: [{ type: 'button', index: 4 }],
  special: [{ type: 'button', index: 3 }],
  pause: [{ type: 'button', index: 9 }],
  confirm: [{ type: 'button', index: 0 }],
  cancel: [{ type: 'button', index: 1 }],
};

function toCoreBindings(binding: InputBinding): Record<GameAction, ActionBinding[]> {
  return Object.fromEntries(
    GAME_ACTIONS.map((action) => [
      action,
      [...(binding.keys.get(action) ?? []), ...GAMEPAD_BINDINGS[action]],
    ])
  ) as Record<GameAction, ActionBinding[]>;
}

function toPlayerInput(snapshot: CoreSnapshot): PlayerInput {
  const input = createEmptyPlayerInput();
  input.moveLeft = snapshot.moveLeft.held;
  input.moveRight = snapshot.moveRight.held;
  input.moveUp = snapshot.moveUp.held;
  input.moveDown = snapshot.moveDown.held;
  input.jump = snapshot.jump.held;
  input.jumpPressed = snapshot.jump.pressed;
  input.attack = snapshot.attack.held;
  input.attackPressed = snapshot.attack.pressed;
  input.block = snapshot.block.held;
  input.blockPressed = snapshot.block.pressed;
  input.special = snapshot.special.held;
  input.specialPressed = snapshot.special.pressed;
  input.pause = snapshot.pause.pressed;
  input.confirm = snapshot.confirm.pressed;
  input.cancel = snapshot.cancel.pressed;
  return input;
}

export function createInputManager() {
  const keyboard = createKeyboard();
  let player1Binding = cloneInputBinding(PLAYER1_BINDINGS);
  let player2Binding = cloneInputBinding(PLAYER2_BINDINGS);
  const player1 = createActionInput({
    actions: GAME_ACTIONS,
    bindings: toCoreBindings(player1Binding),
    keyboard: keyboard.getDevice(),
    gamepadIndex: 0,
  });
  const player2 = createActionInput({
    actions: GAME_ACTIONS,
    bindings: toCoreBindings(player2Binding),
    keyboard: keyboard.getDevice(),
    gamepadIndex: 1,
  });
  let current: InputState = {
    player1: createEmptyPlayerInput(),
    player2: createEmptyPlayerInput(),
  };

  function update(): void {
    keyboard.update();
    current = {
      player1: toPlayerInput(player1.refresh()),
      player2: toPlayerInput(player2.refresh()),
    };
  }

  function getState(): InputState {
    return current;
  }

  function setPlayer1Binding(binding: InputBinding): void {
    player1Binding = cloneInputBinding(binding);
    player1.setBindings(toCoreBindings(player1Binding));
  }

  function setPlayer2Binding(binding: InputBinding): void {
    player2Binding = cloneInputBinding(binding);
    player2.setBindings(toCoreBindings(player2Binding));
  }

  return {
    update,
    getState,
    getPlayer1Input: () => current.player1,
    getPlayer2Input: () => current.player2,
    isPausePressed: () => current.player1.pause || current.player2.pause,
    setPlayer1Binding,
    setPlayer2Binding,
    setBindings(bindings: { player1?: InputBinding; player2?: InputBinding }): void {
      if (bindings.player1) setPlayer1Binding(bindings.player1);
      if (bindings.player2) setPlayer2Binding(bindings.player2);
    },
    getBindings: () => ({
      player1: cloneInputBinding(player1Binding),
      player2: cloneInputBinding(player2Binding),
    }),
    resetBindings(): void {
      setPlayer1Binding(PLAYER1_BINDINGS);
      setPlayer2Binding(PLAYER2_BINDINGS);
    },
    getKeyboard: () => keyboard,
    reset(): void {
      keyboard.reset();
      player1.reset();
      player2.reset();
      current = {
        player1: createEmptyPlayerInput(),
        player2: createEmptyPlayerInput(),
      };
    },
    destroy(): void {
      keyboard.destroy();
    },
  };
}

export type InputManager = ReturnType<typeof createInputManager>;
