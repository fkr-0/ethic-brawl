/**
 * Input manager that aggregates all input sources
 */

import {
  PLAYER1_BINDINGS,
  PLAYER2_BINDINGS,
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
  let player1Binding = PLAYER1_BINDINGS;
  let player2Binding = PLAYER2_BINDINGS;

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
  function setPlayer1Binding(binding: typeof PLAYER1_BINDINGS): void {
    player1Binding = binding;
  }

  function setPlayer2Binding(binding: typeof PLAYER2_BINDINGS): void {
    player2Binding = binding;
  }

  /**
   * Reset bindings to defaults
   */
  function resetBindings(): void {
    player1Binding = PLAYER1_BINDINGS;
    player2Binding = PLAYER2_BINDINGS;
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
