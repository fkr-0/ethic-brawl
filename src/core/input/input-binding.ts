/**
 * Input binding configuration
 */

import type { Keyboard } from './keyboard';

/**
 * Game action types
 */
export type GameAction =
  | 'moveLeft'
  | 'moveRight'
  | 'moveUp'
  | 'moveDown'
  | 'jump'
  | 'attack'
  | 'block'
  | 'special'
  | 'pause'
  | 'confirm'
  | 'cancel';

/**
 * Player input state
 */
export interface PlayerInput {
  moveLeft: boolean;
  moveRight: boolean;
  moveUp: boolean;
  moveDown: boolean;
  jump: boolean;
  jumpPressed: boolean;
  attack: boolean;
  attackPressed: boolean;
  block: boolean;
  blockPressed: boolean;
  special: boolean;
  specialPressed: boolean;
  pause: boolean;
  confirm: boolean;
  cancel: boolean;
}

/**
 * Input binding configuration
 */
export interface InputBinding {
  playerId: 1 | 2;
  keys: Map<GameAction, string[]>;
}

/**
 * Default player 1 bindings (WASD + IJKL)
 */
export const PLAYER1_BINDINGS: InputBinding = {
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
    ['pause', ['Escape']],
    ['confirm', ['Enter', 'Space']],
    ['cancel', ['Backspace']],
  ]),
};

/**
 * Default player 2 bindings (Arrows + Numpad)
 */
export const PLAYER2_BINDINGS: InputBinding = {
  playerId: 2,
  keys: new Map([
    ['moveLeft', ['ArrowLeft']],
    ['moveRight', ['ArrowRight']],
    ['moveUp', ['ArrowUp']],
    ['moveDown', ['ArrowDown']],
    ['jump', ['Numpad2', 'Comma']],
    ['attack', ['Numpad1', 'Period']],
    ['block', ['Numpad3', 'Slash']],
    ['special', ['Numpad4', 'Semicolon']],
    ['pause', ['Escape']],
    ['confirm', ['NumpadEnter']],
    ['cancel', ['Numpad0']],
  ]),
};

export const GAME_ACTIONS: GameAction[] = [
  'moveLeft',
  'moveRight',
  'moveUp',
  'moveDown',
  'jump',
  'attack',
  'block',
  'special',
  'pause',
  'confirm',
  'cancel',
];

export const GAME_ACTION_LABELS: Record<GameAction, string> = {
  moveLeft: 'Move Left',
  moveRight: 'Move Right',
  moveUp: 'Move Up',
  moveDown: 'Move Down',
  jump: 'Jump',
  attack: 'Attack',
  block: 'Block',
  special: 'Special',
  pause: 'Pause',
  confirm: 'Confirm',
  cancel: 'Cancel',
};

export type SerializedInputBinding = Record<GameAction, string[]>;

function cloneKeys(keys: Map<GameAction, string[]>): Map<GameAction, string[]> {
  return new Map(GAME_ACTIONS.map((action) => [action, [...(keys.get(action) ?? [])]]));
}

export function cloneInputBinding(binding: InputBinding): InputBinding {
  return {
    playerId: binding.playerId,
    keys: cloneKeys(binding.keys),
  };
}

export function serializeInputBinding(binding: InputBinding): SerializedInputBinding {
  const serialized = {} as SerializedInputBinding;
  for (const action of GAME_ACTIONS) {
    serialized[action] = [...(binding.keys.get(action) ?? [])];
  }
  return serialized;
}

export function deserializeInputBinding(
  playerId: 1 | 2,
  serialized: Partial<Record<GameAction, string[]>> | null | undefined,
  fallback: InputBinding = playerId === 1 ? PLAYER1_BINDINGS : PLAYER2_BINDINGS
): InputBinding {
  const keys = cloneKeys(fallback.keys);
  if (serialized) {
    for (const action of GAME_ACTIONS) {
      const customKeys = serialized[action];
      if (Array.isArray(customKeys) && customKeys.length > 0) {
        keys.set(action, [
          ...new Set(customKeys.filter((key) => typeof key === 'string' && key.length > 0)),
        ]);
      }
    }
  }
  return { playerId, keys };
}

export function updateBindingForAction(
  binding: InputBinding,
  action: GameAction,
  keyCode: string,
  options: { replace?: boolean; removeConflicts?: boolean } = {}
): InputBinding {
  const next = cloneInputBinding(binding);
  const normalizedCode = keyCode.trim();
  if (!normalizedCode) return next;

  if (options.removeConflicts ?? true) {
    for (const candidate of GAME_ACTIONS) {
      const candidateKeys = next.keys.get(candidate) ?? [];
      next.keys.set(
        candidate,
        candidateKeys.filter((key) => key !== normalizedCode)
      );
    }
  }

  const current = options.replace ? [] : [...(next.keys.get(action) ?? [])];
  next.keys.set(action, [...new Set([...current, normalizedCode])]);
  return next;
}

export function resetBindingForPlayer(playerId: 1 | 2): InputBinding {
  return cloneInputBinding(playerId === 1 ? PLAYER1_BINDINGS : PLAYER2_BINDINGS);
}

export function formatKeyCodeForDisplay(keyCode: string): string {
  return keyCode
    .replace(/^Key/, '')
    .replace(/^Digit/, '')
    .replace(/^Arrow/, '')
    .replace(/^Numpad/, 'Num')
    .replace('Backspace', 'Bksp')
    .replace('Escape', 'Esc')
    .replace('Space', 'Space')
    .replace('Enter', 'Enter');
}

export function formatBindingForDisplay(binding: InputBinding, action: GameAction): string {
  const keys = binding.keys.get(action) ?? [];
  return keys.length > 0 ? keys.map(formatKeyCodeForDisplay).join(' / ') : 'Unbound';
}

/**
 * Create empty player input state
 */
export function createEmptyPlayerInput(): PlayerInput {
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
    pause: false,
    confirm: false,
    cancel: false,
  };
}

/**
 * Read player input from keyboard
 */
export function readPlayerInput(keyboard: Keyboard, binding: InputBinding): PlayerInput {
  const input = createEmptyPlayerInput();

  // Helper to check if any key for an action is active
  const isActionPressed = (action: GameAction): boolean => {
    const keys = binding.keys.get(action);
    if (!keys) return false;
    return keys.some((key) => keyboard.isPressed(key));
  };

  const wasActionJustPressed = (action: GameAction): boolean => {
    const keys = binding.keys.get(action);
    if (!keys) return false;
    return keys.some((key) => keyboard.wasJustPressed(key));
  };

  // Movement
  input.moveLeft = isActionPressed('moveLeft');
  input.moveRight = isActionPressed('moveRight');
  input.moveUp = isActionPressed('moveUp');
  input.moveDown = isActionPressed('moveDown');

  // Actions
  input.jump = isActionPressed('jump');
  input.jumpPressed = wasActionJustPressed('jump');
  input.attack = isActionPressed('attack');
  input.attackPressed = wasActionJustPressed('attack');
  input.block = isActionPressed('block');
  input.blockPressed = wasActionJustPressed('block');
  input.special = isActionPressed('special');
  input.specialPressed = wasActionJustPressed('special');

  // Menu
  input.pause = wasActionJustPressed('pause');
  input.confirm = wasActionJustPressed('confirm');
  input.cancel = wasActionJustPressed('cancel');

  return input;
}
