/**
 * Combo tracking system
 */

import { FRAME_DATA } from './fighter-state';

/**
 * Combo state
 */
export interface ComboState {
  count: number;
  damage: number;
  lastHitFrame: number;
  isActive: boolean;
  hits: ComboHit[];
}

/**
 * Individual combo hit
 */
export interface ComboHit {
  damage: number;
  attackType: string;
  frame: number;
}

/**
 * Combo multiplier tiers
 */
export const COMBO_MULTIPLIERS: readonly {
  minHits: number;
  damageBonus: number;
  hitstunExtension: number;
}[] = [
  { minHits: 1, damageBonus: 0, hitstunExtension: 0 },
  { minHits: 4, damageBonus: 0.15, hitstunExtension: 2 },
  { minHits: 7, damageBonus: 0.3, hitstunExtension: 4 },
  { minHits: 11, damageBonus: 0.5, hitstunExtension: 6 },
];

/**
 * Create an empty combo state
 */
export function createComboState(): ComboState {
  return {
    count: 0,
    damage: 0,
    lastHitFrame: 0,
    isActive: false,
    hits: [],
  };
}

/**
 * Add a hit to the combo
 */
export function addComboHit(
  combo: ComboState,
  damage: number,
  attackType: string,
  currentFrame: number
): ComboState {
  const newCombo: ComboState = {
    count: combo.count + 1,
    damage: combo.damage + damage,
    lastHitFrame: currentFrame,
    isActive: true,
    hits: [...combo.hits, { damage, attackType, frame: currentFrame }],
  };
  return newCombo;
}

/**
 * Update combo state (check for timeout)
 */
export function updateCombo(combo: ComboState, currentFrame: number): ComboState {
  if (!combo.isActive) {
    return combo;
  }

  const framesSinceLastHit = currentFrame - combo.lastHitFrame;

  if (framesSinceLastHit > FRAME_DATA.COMBO_WINDOW) {
    return {
      ...combo,
      isActive: false,
    };
  }

  return combo;
}

/**
 * Break the combo
 */
export function breakCombo(combo: ComboState): ComboState {
  return {
    ...combo,
    isActive: false,
  };
}

/**
 * Get the current combo multiplier
 */
export function getComboMultiplier(combo: ComboState): {
  damageBonus: number;
  hitstunExtension: number;
} {
  if (!combo.isActive || combo.count < 1) {
    return { damageBonus: 0, hitstunExtension: 0 };
  }

  // Find the highest applicable multiplier
  for (let i = COMBO_MULTIPLIERS.length - 1; i >= 0; i--) {
    const tier = COMBO_MULTIPLIERS[i];
    if (tier && combo.count >= tier.minHits) {
      return {
        damageBonus: tier.damageBonus,
        hitstunExtension: tier.hitstunExtension,
      };
    }
  }

  return { damageBonus: 0, hitstunExtension: 0 };
}

/**
 * Calculate scaled damage for a combo hit
 */
export function getScaledDamage(baseDamage: number, combo: ComboState): number {
  const { damageBonus } = getComboMultiplier(combo);

  // Each hit in combo deals +5% stacking damage
  const stackBonus = combo.count * 0.05;

  return Math.floor(baseDamage * (1 + damageBonus + stackBonus));
}

/**
 * Get combo display text
 */
export function getComboDisplayText(combo: ComboState): string {
  if (!combo.isActive || combo.count < 2) {
    return '';
  }

  const texts = ['DOUBLE', 'TRIPLE', 'QUAD', 'PENTA'];
  if (combo.count <= 5) {
    return texts[combo.count - 2] ?? `${combo.count}x`;
  }

  if (combo.count < 10) {
    return `${combo.count}x COMBO!`;
  }

  if (combo.count < 20) {
    return `${combo.count}x INSANE!`;
  }

  return `${combo.count}x UNREAL!`;
}

/**
 * Get combo tier name for display
 */
export function getComboTierName(combo: ComboState): string {
  if (combo.count < 2) return '';
  if (combo.count < 4) return 'COMBO';
  if (combo.count < 7) return 'NICE';
  if (combo.count < 10) return 'GREAT';
  if (combo.count < 15) return 'EXCELLENT';
  if (combo.count < 20) return 'AMAZING';
  return 'LEGENDARY';
}
