/** Shared arcade-runtime keyboard adapter preserving Ethic Brawl's public API. */

import { createKeyboardDevice } from '../../../vendor/arcade-runtime.mjs';
import type { KeyboardDevice } from '../../../vendor/arcade-runtime.mjs';

export interface KeyState {
  isPressed: boolean;
  wasJustPressed: boolean;
  wasJustReleased: boolean;
  pressTime: number;
  releaseTime: number;
}

export function createKeyboard() {
  const device = createKeyboardDevice();
  return {
    update: () => device.advance(),
    getKey: (code: string): KeyState => device.getState(code),
    isPressed: (code: string): boolean => device.isHeld(code),
    wasJustPressed: (code: string): boolean => device.isPressed(code),
    wasJustReleased: (code: string): boolean => device.isReleased(code),
    getHoldDuration: (code: string): number => device.getHoldDuration(code),
    consumeLatestPressedKey: (exclusions: string[] = []): string | null =>
      device.consumeLatestPressed(exclusions),
    reset: () => device.reset(),
    destroy: () => device.destroy(),
    getDevice: (): KeyboardDevice => device,
  };
}

export type Keyboard = ReturnType<typeof createKeyboard>;
