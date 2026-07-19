/** Type-safe compatibility facade over the shared arcade-runtime event engine. */

import { createEventBus as createArcadeEventBus } from '../../../vendor/arcade-runtime.mjs';

export function createEventBus<TEvents extends object>() {
  return createArcadeEventBus<TEvents>();
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
