/**
 * Generic finite state machine implementation
 */

/**
 * State definition
 */
export interface State<TState extends string> {
  name: TState;
  onEnter?: (from: TState | null) => void | Promise<void>;
  onUpdate?: (deltaTime: number) => void;
  onExit?: (to: TState) => void | Promise<void>;
}

/**
 * State transition definition
 */
export interface Transition<TState extends string> {
  from: TState;
  to: TState;
  condition?: () => boolean;
  onTransition?: () => void | Promise<void>;
}

/**
 * State machine configuration
 */
export interface StateMachineConfig<TState extends string> {
  initialState: TState;
  states: State<TState>[];
  transitions?: Transition<TState>[];
}

/**
 * Create a state machine
 */
export function createStateMachine<TState extends string>(
  config: StateMachineConfig<TState>
): {
  getCurrentState: () => TState;
  getState: () => State<TState> | undefined;
  canTransitionTo: (state: TState) => boolean;
  transition: (to: TState) => Promise<boolean>;
  update: (deltaTime: number) => void;
  reset: () => Promise<void>;
} {
  const stateMap = new Map<TState, State<TState>>();
  let currentState: State<TState>;
  let currentStateName: TState = config.initialState;

  // Build state map
  for (const state of config.states) {
    stateMap.set(state.name, state);
  }

  // Initialize current state
  const initial = stateMap.get(config.initialState);
  if (!initial) {
    throw new Error(`Initial state "${config.initialState}" not found`);
  }
  currentState = initial;

  /**
   * Check if transition from current state to target is valid
   */
  function canTransitionTo(target: TState): boolean {
    if (!config.transitions) return true;

    return config.transitions.some((t) => t.from === currentStateName && t.to === target);
  }

  /**
   * Transition to a new state
   */
  async function transition(to: TState): Promise<boolean> {
    const targetState = stateMap.get(to);
    if (!targetState) {
      console.error(`State "${to}" not found`);
      return false;
    }

    // Check if transition is valid
    if (!canTransitionTo(to)) {
      console.error(`Invalid transition from "${currentStateName}" to "${to}"`);
      return false;
    }

    // Find transition definition
    const transitionDef = config.transitions?.find(
      (t) => t.from === currentStateName && t.to === to
    );

    // Check condition
    if (transitionDef?.condition && !transitionDef.condition()) {
      return false;
    }

    // Exit current state
    if (currentState.onExit) {
      await currentState.onExit(to);
    }

    // Execute transition callback
    if (transitionDef?.onTransition) {
      await transitionDef.onTransition();
    }

    const previousStateName = currentStateName;
    currentStateName = to;
    currentState = targetState;

    // Enter new state
    if (currentState.onEnter) {
      await currentState.onEnter(previousStateName);
    }

    return true;
  }

  /**
   * Update the current state
   */
  function update(deltaTime: number): void {
    if (currentState.onUpdate) {
      currentState.onUpdate(deltaTime);
    }
  }

  /**
   * Reset to initial state
   */
  async function reset(): Promise<void> {
    currentStateName = config.initialState;
    const initial = stateMap.get(config.initialState);
    if (initial) {
      currentState = initial;
      if (currentState.onEnter) {
        await currentState.onEnter(null);
      }
    }
  }

  return {
    getCurrentState: () => currentStateName,
    getState: () => currentState,
    canTransitionTo,
    transition,
    update,
    reset,
  };
}

/**
 * Simple state machine for single-value states
 */
export function createSimpleStateMachine<TState extends string>(
  initialState: TState,
  validTransitions: Record<TState, TState[]>
): {
  getState: () => TState;
  setState: (state: TState) => boolean;
  canTransitionTo: (state: TState) => boolean;
} {
  let currentState = initialState;

  function canTransitionTo(state: TState): boolean {
    return validTransitions[currentState]?.includes(state) ?? false;
  }

  function setState(state: TState): boolean {
    if (canTransitionTo(state)) {
      currentState = state;
      return true;
    }
    return false;
  }

  return {
    getState: () => currentState,
    setState,
    canTransitionTo,
  };
}
