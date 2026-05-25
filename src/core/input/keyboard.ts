/**
 * Keyboard input tracking
 */

/**
 * Key state
 */
export interface KeyState {
  isPressed: boolean;
  wasJustPressed: boolean;
  wasJustReleased: boolean;
  pressTime: number;
  releaseTime: number;
}

/**
 * Create a keyboard state tracker
 */
export function createKeyboard() {
  const keyStates = new Map<string, KeyState>();
  const frameKeyEvents = {
    pressed: new Set<string>(),
    released: new Set<string>(),
  };
  const latestPressedKeys: string[] = [];

  /**
   * Handle key down event
   */
  function onKeyDown(event: KeyboardEvent): void {
    const code = event.code;

    // Prevent repeated events while key is held
    if (!keyStates.get(code)?.isPressed) {
      frameKeyEvents.pressed.add(code);
      latestPressedKeys.push(code);
    }
  }

  /**
   * Handle key up event
   */
  function onKeyUp(event: KeyboardEvent): void {
    frameKeyEvents.released.add(event.code);
  }

  /**
   * Update key states (call at end of frame)
   */
  function update(): void {
    // Process pressed keys
    for (const code of frameKeyEvents.pressed) {
      const existing = keyStates.get(code);
      if (existing) {
        existing.isPressed = true;
        existing.wasJustPressed = true;
        existing.pressTime = performance.now();
      } else {
        keyStates.set(code, {
          isPressed: true,
          wasJustPressed: true,
          wasJustReleased: false,
          pressTime: performance.now(),
          releaseTime: 0,
        });
      }
    }

    // Process released keys
    for (const code of frameKeyEvents.released) {
      const existing = keyStates.get(code);
      if (existing) {
        existing.isPressed = false;
        existing.wasJustReleased = true;
        existing.releaseTime = performance.now();
      } else {
        keyStates.set(code, {
          isPressed: false,
          wasJustPressed: false,
          wasJustReleased: true,
          pressTime: 0,
          releaseTime: performance.now(),
        });
      }
    }

    // Clear just pressed/released from previous frame
    for (const [code, state] of keyStates) {
      if (!frameKeyEvents.pressed.has(code)) {
        state.wasJustPressed = false;
      }
      if (!frameKeyEvents.released.has(code)) {
        state.wasJustReleased = false;
      }
    }

    // Clear frame events
    frameKeyEvents.pressed.clear();
    frameKeyEvents.released.clear();
  }

  /**
   * Get state of a key
   */
  function getKey(code: string): KeyState {
    let state = keyStates.get(code);
    if (!state) {
      state = {
        isPressed: false,
        wasJustPressed: false,
        wasJustReleased: false,
        pressTime: 0,
        releaseTime: 0,
      };
      keyStates.set(code, state);
    }
    return state;
  }

  /**
   * Check if key is currently pressed
   */
  function isPressed(code: string): boolean {
    return getKey(code).isPressed;
  }

  /**
   * Check if key was just pressed this frame
   */
  function wasJustPressed(code: string): boolean {
    return getKey(code).wasJustPressed;
  }

  /**
   * Check if key was just released this frame
   */
  function wasJustReleased(code: string): boolean {
    return getKey(code).wasJustReleased;
  }

  /**
   * Get how long a key has been held
   */
  function getHoldDuration(code: string): number {
    const state = getKey(code);
    if (state.isPressed) {
      return performance.now() - state.pressTime;
    }
    return 0;
  }

  function consumeLatestPressedKey(exclusions: string[] = []): string | null {
    while (latestPressedKeys.length > 0) {
      const key = latestPressedKeys.shift();
      if (key && !exclusions.includes(key)) return key;
    }
    return null;
  }

  /**
   * Clear all key states
   */
  function reset(): void {
    keyStates.clear();
    frameKeyEvents.pressed.clear();
    frameKeyEvents.released.clear();
    latestPressedKeys.length = 0;
  }

  // Bind event listeners
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  return {
    update,
    getKey,
    isPressed,
    wasJustPressed,
    wasJustReleased,
    getHoldDuration,
    consumeLatestPressedKey,
    reset,
    destroy: () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    },
  };
}

/**
 * Keyboard instance type
 */
export type Keyboard = ReturnType<typeof createKeyboard>;
