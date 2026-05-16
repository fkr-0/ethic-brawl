/**
 * Type-safe pub/sub event bus
 */

type EventCallback<T = unknown> = (data: T) => void;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventMap = object;

/**
 * Create a typed event bus
 */
export function createEventBus<TEvents extends EventMap>() {
  const listeners = new Map<keyof TEvents, Set<EventCallback<unknown>>>();

  function getOrCreateCallbacks<K extends keyof TEvents>(event: K): Set<EventCallback<unknown>> {
    const existing = listeners.get(event);
    if (existing) {
      return existing;
    }

    const created = new Set<EventCallback<unknown>>();
    listeners.set(event, created);
    return created;
  }

  function on<K extends keyof TEvents>(event: K, callback: EventCallback<TEvents[K]>): () => void {
    const callbacks = getOrCreateCallbacks(event);
    const normalizedCallback = callback as EventCallback<unknown>;
    callbacks.add(normalizedCallback);

    return () => {
      callbacks.delete(normalizedCallback);
      if (callbacks.size === 0) {
        listeners.delete(event);
      }
    };
  }

  function once<K extends keyof TEvents>(
    event: K,
    callback: EventCallback<TEvents[K]>
  ): () => void {
    let unsubscribe = () => {};

    const wrappedCallback: EventCallback<TEvents[K]> = (data) => {
      unsubscribe();
      callback(data);
    };

    unsubscribe = on(event, wrappedCallback);
    return unsubscribe;
  }

  function emit<K extends keyof TEvents>(event: K, data: TEvents[K]): void {
    const callbacks = listeners.get(event);
    if (!callbacks) {
      return;
    }

    for (const callback of [...callbacks]) {
      callback(data);
    }
  }

  function off<K extends keyof TEvents>(event?: K): void {
    if (event) {
      listeners.delete(event);
      return;
    }

    listeners.clear();
  }

  function hasListeners<K extends keyof TEvents>(event: K): boolean {
    const callbacks = listeners.get(event);
    return callbacks !== undefined && callbacks.size > 0;
  }

  return {
    on,
    once,
    emit,
    off,
    hasListeners,
  };
}

/**
 * Game event types
 */
export interface GameEvents {
  // Fight events
  'fight:start': { stage: number; player1: string; player2: string };
  'fight:end': { winner: 1 | 2; perfect: boolean };
  'round:start': { round: number };
  'round:end': { winner: 1 | 2; round: number };

  // Combat events
  'hit:landed': HitData;
  'hit:blocked': BlockData;
  'hit:perfect_block': BlockData;

  // Combo events
  'combo:start': { player: 1 | 2 };
  'combo:increment': { player: 1 | 2; count: number };
  'combo:break': { player: 1 | 2; count: number };

  // Health events
  'health:changed': { fighter: string; oldHealth: number; newHealth: number };
  'health:critical': { fighter: string; health: number };
  'health:depleted': { fighter: string };

  // Special events
  'special:ready': { fighter: string };
  'special:activated': { fighter: string; name: string };
  'special:cooldown': { fighter: string };

  // Trial events
  'trial:start': { trialId: string; type: string };
  'trial:answer': { trialId: string; answer: string };
  'trial:complete': { trialId: string; score: number; consequence: string };

  // Progression events
  'xp:gained': { amount: number; source: string };
  'level:up': { level: number };
  'upgrade:applied': { upgradeId: string };

  // UI events
  'screen:transition': { from: string; to: string };
  'menu:navigate': { direction: 'up' | 'down' | 'left' | 'right' };
  'menu:select': { option: string };

  // Audio events
  'audio:play_sfx': { name: string };
  'audio:music_change': { track: string };

  // Game events
  'game:pause': undefined;
  'game:resume': undefined;
  'game:reset': undefined;
}

/**
 * Hit data structure
 */
export interface HitData {
  attacker: string;
  target: string;
  damage: number;
  knockbackX: number;
  knockbackY: number;
  hitstun: number;
  attackType: 'light' | 'medium' | 'heavy' | 'special';
}

/**
 * Block data structure
 */
export interface BlockData {
  attacker: string;
  blocker: string;
  damage: number;
  chipDamage: number;
}

/**
 * Global event bus instance
 */
export const eventBus = createEventBus<GameEvents>();
