/**
 * Input manager that aggregates all input sources
 */

import {
  PLAYER1_BINDINGS,
  PLAYER2_BINDINGS,
  cloneInputBinding,
  type InputBinding,
  type PlayerInput,
  readPlayerInput,
} from './input-binding';
import { type Keyboard, createKeyboard } from './keyboard';

/**
 * Combined input state for all players
 */
export interface InputState {
  player1: PlayerInput;
  player2: PlayerInput;
}

/**
 * Create the input manager
 */
export function createInputManager() {
  const keyboard = createKeyboard();
  let player1Binding = cloneInputBinding(PLAYER1_BINDINGS);
  let player2Binding = cloneInputBinding(PLAYER2_BINDINGS);

  /**
   * Update input state (call each frame)
   */
  function update(): void {
    keyboard.update();
  }

  /**
   * Get current input state
   */
  function getState(): InputState {
    return {
      player1: readPlayerInput(keyboard, player1Binding),
      player2: readPlayerInput(keyboard, player2Binding),
    };
  }

  /**
   * Get player 1 input
   */
  function getPlayer1Input(): PlayerInput {
    return readPlayerInput(keyboard, player1Binding);
  }

  /**
   * Get player 2 input
   */
  function getPlayer2Input(): PlayerInput {
    return readPlayerInput(keyboard, player2Binding);
  }

  /**
   * Check if pause was pressed
   */
  function isPausePressed(): boolean {
    const state = getState();
    return state.player1.pause || state.player2.pause;
  }

  /**
   * Set custom bindings
   */
  function setPlayer1Binding(binding: InputBinding): void {
    player1Binding = cloneInputBinding(binding);
  }

  function setPlayer2Binding(binding: InputBinding): void {
    player2Binding = cloneInputBinding(binding);
  }

  function setBindings(bindings: { player1?: InputBinding; player2?: InputBinding }): void {
    if (bindings.player1) setPlayer1Binding(bindings.player1);
    if (bindings.player2) setPlayer2Binding(bindings.player2);
  }

  function getBindings(): { player1: InputBinding; player2: InputBinding } {
    return {
      player1: cloneInputBinding(player1Binding),
      player2: cloneInputBinding(player2Binding),
    };
  }

  /**
   * Reset bindings to defaults
   */
  function resetBindings(): void {
    player1Binding = cloneInputBinding(PLAYER1_BINDINGS);
    player2Binding = cloneInputBinding(PLAYER2_BINDINGS);
  }

  /**
   * Get keyboard instance for advanced usage
   */
  function getKeyboard(): Keyboard {
    return keyboard;
  }

  /**
   * Clear all input state
   */
  function reset(): void {
    keyboard.reset();
  }

  /**
   * Cleanup
   */
  function destroy(): void {
    keyboard.destroy();
  }

  return {
    update,
    getState,
    getPlayer1Input,
    getPlayer2Input,
    isPausePressed,
    setPlayer1Binding,
    setPlayer2Binding,
    setBindings,
    getBindings,
    resetBindings,
    getKeyboard,
    reset,
    destroy,
  };
}

/**
 * Input manager instance type
 */
export type InputManager = ReturnType<typeof createInputManager>;
