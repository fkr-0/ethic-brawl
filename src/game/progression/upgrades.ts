/**
 * Upgrade system
 */

import type { FighterStats } from '../fight/fighter-state';

/**
 * Upgrade ID type
 */
export type UpgradeId =
  | 'iron_will'
  | 'swift_justice'
  | 'second_wind'
  | 'combo_king'
  | 'critical_thinker'
  | 'stoic_endurance'
  | 'philosophical_momentum'
  | 'dialectical_speed'
  | 'metaphysical_armor'
  | 'socratic_counter';

/**
 * Upgrade rarity
 */
export type UpgradeRarity = 'common' | 'rare' | 'epic';

/**
 * Upgrade definition
 */
export interface Upgrade {
  id: UpgradeId;
  name: string;
  description: string;
  flavorText: string;
  rarity: UpgradeRarity;
  icon: string;
  effect: UpgradeEffect;
  prerequisites?: UpgradeId[];
  conflicts?: UpgradeId[];
}

/**
 * Upgrade effect
 */
export interface UpgradeEffect {
  type: 'stat_boost' | 'special_enhancement' | 'passive_ability' | 'combo_enhancement';
  stat?: keyof FighterStats;
  value?: number;
  percentage?: number;
  specialModifier?: SpecialModifier;
}

/**
 * Special modifier
 */
export interface SpecialModifier {
  damageMultiplier?: number;
  cooldownReduction?: number;
  rangeExtension?: number;
  additionalEffect?: string;
}

/**
 * Applied upgrade with state
 */
export interface AppliedUpgrade extends Upgrade {
  appliedAt: {
    stage: number;
    level: number;
  };
}

/**
 * All available upgrades
 */
export const UPGRADES: Record<UpgradeId, Upgrade> = {
  iron_will: {
    id: 'iron_will',
    name: 'Iron Will',
    description: 'Block effectiveness increased by 15%',
    flavorText: '"The will to resist is the first freedom." - Stoic proverb',
    rarity: 'common',
    icon: '🛡️',
    effect: {
      type: 'stat_boost',
      stat: 'defense',
      percentage: 15,
    },
  },

  swift_justice: {
    id: 'swift_justice',
    name: 'Swift Justice',
    description: 'Attack speed increased by 12%',
    flavorText: '"Justice delayed is justice denied." - Legal maxim',
    rarity: 'common',
    icon: '⚡',
    effect: {
      type: 'stat_boost',
      stat: 'agility',
      percentage: 12,
    },
  },

  second_wind: {
    id: 'second_wind',
    name: 'Second Wind',
    description: 'Recover 15% health when below 25% health',
    flavorText: '"The body can endure, but the spirit must choose to continue."',
    rarity: 'rare',
    icon: '💨',
    effect: {
      type: 'passive_ability',
      specialModifier: {
        additionalEffect: 'health_recovery_on_low',
      },
    },
  },

  combo_king: {
    id: 'combo_king',
    name: 'Combo King',
    description: 'Combo damage scaling increased by 25%',
    flavorText: '"One idea leads to another, each stronger than the last."',
    rarity: 'rare',
    icon: '🔥',
    effect: {
      type: 'combo_enhancement',
      percentage: 25,
    },
  },

  critical_thinker: {
    id: 'critical_thinker',
    name: 'Critical Thinker',
    description: 'Special damage increased by 20%',
    flavorText: '"A precise argument cuts deeper than any blade."',
    rarity: 'common',
    icon: '💭',
    effect: {
      type: 'special_enhancement',
      percentage: 20,
    },
  },

  stoic_endurance: {
    id: 'stoic_endurance',
    name: 'Stoic Endurance',
    description: 'Maximum health increased by 20',
    flavorText: '"The obstacle becomes the way." - Marcus Aurelius',
    rarity: 'common',
    icon: '💪',
    effect: {
      type: 'stat_boost',
      stat: 'health',
      value: 20,
    },
  },

  philosophical_momentum: {
    id: 'philosophical_momentum',
    name: 'Philosophical Momentum',
    description: 'Each hit in a combo grants +2% damage to next hit',
    flavorText: '"Ideas build upon themselves."',
    rarity: 'epic',
    icon: '🌀',
    effect: {
      type: 'combo_enhancement',
      specialModifier: {
        additionalEffect: 'scaling_combo_damage',
      },
    },
  },

  dialectical_speed: {
    id: 'dialectical_speed',
    name: 'Dialectical Speed',
    description: 'Movement speed +15%, Lane change speed +25%',
    flavorText: '"The thesis must move to meet its antithesis."',
    rarity: 'rare',
    icon: '🏃',
    effect: {
      type: 'stat_boost',
      stat: 'agility',
      percentage: 15,
    },
  },

  metaphysical_armor: {
    id: 'metaphysical_armor',
    name: 'Metaphysical Armor',
    description: 'First hit of each fight deals 50% damage to you',
    flavorText: '"The first blow is merely an illusion of harm."',
    rarity: 'epic',
    icon: '✨',
    effect: {
      type: 'passive_ability',
      specialModifier: {
        additionalEffect: 'first_hit_reduction',
      },
    },
  },

  socratic_counter: {
    id: 'socratic_counter',
    name: 'Socratic Counter',
    description: 'Perfect block window extended by 5 frames',
    flavorText: '"I know that I know nothing... except when to strike."',
    rarity: 'rare',
    icon: '🎯',
    effect: {
      type: 'passive_ability',
      specialModifier: {
        additionalEffect: 'extended_perfect_block',
      },
    },
  },
};

/**
 * Get upgrades by rarity
 */
export function getUpgradesByRarity(rarity: UpgradeRarity): Upgrade[] {
  return Object.values(UPGRADES).filter((u) => u.rarity === rarity);
}

/**
 * Get random upgrades for selection
 */
export function getRandomUpgrades(count: number, exclude: UpgradeId[] = [], stage = 1): Upgrade[] {
  const available = Object.values(UPGRADES).filter((u) => !exclude.includes(u.id));

  // Weight by rarity and stage
  const weighted: { upgrade: Upgrade; weight: number }[] = available.map((u) => {
    let weight = 1;

    // Increase rare/epic chance in later stages
    if (u.rarity === 'rare') {
      weight = 0.5 + stage * 0.1;
    } else if (u.rarity === 'epic') {
      weight = 0.2 + stage * 0.15;
    }

    return { upgrade: u, weight };
  });

  const selected: Upgrade[] = [];
  const pool = [...weighted];

  for (let i = 0; i < count && pool.length > 0; i++) {
    const totalWeight = pool.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (let j = 0; j < pool.length; j++) {
      const item = pool[j];
      if (item) {
        random -= item.weight;
        if (random <= 0) {
          selected.push(item.upgrade);
          pool.splice(j, 1);
          break;
        }
      }
    }
  }

  return selected;
}

/**
 * Apply upgrade to fighter stats
 */
export function applyUpgradeToStats(stats: FighterStats, upgrade: Upgrade): FighterStats {
  const newStats = { ...stats };

  if (upgrade.effect.type === 'stat_boost') {
    const stat = upgrade.effect.stat;
    const value = upgrade.effect.value;
    const percentage = upgrade.effect.percentage;

    if (stat && stat in newStats) {
      const current = (newStats as Record<string, number | undefined>)[stat];
      if (current !== undefined) {
        if (value !== undefined) {
          (newStats as Record<string, number>)[stat] = current + value;
        } else if (percentage !== undefined) {
          (newStats as Record<string, number>)[stat] = current * (1 + percentage / 100);
        }
      }
    }
  }

  // Round to integers
  newStats.health = Math.floor(newStats.health);
  newStats.maxHealth = Math.floor(newStats.maxHealth);
  newStats.strength = Math.floor(newStats.strength);
  newStats.defense = Math.floor(newStats.defense);
  newStats.agility = Math.floor(newStats.agility);
  newStats.intelligence = Math.floor(newStats.intelligence);
  newStats.vitality = Math.floor(newStats.vitality);
  newStats.energy = Math.floor(newStats.energy);

  return newStats;
}

/**
 * Check if upgrade can be applied
 */
export function canApplyUpgrade(
  upgrade: Upgrade,
  applied: AppliedUpgrade[],
  _stats: FighterStats
): boolean {
  // Check prerequisites
  if (upgrade.prerequisites) {
    for (const prereq of upgrade.prerequisites) {
      if (!applied.find((a) => a.id === prereq)) {
        return false;
      }
    }
  }

  // Check conflicts
  if (upgrade.conflicts) {
    for (const conflict of upgrade.conflicts) {
      if (applied.find((a) => a.id === conflict)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Create applied upgrade record
 */
export function createAppliedUpgrade(
  upgrade: Upgrade,
  stage: number,
  level: number
): AppliedUpgrade {
  return {
    ...upgrade,
    appliedAt: { stage, level },
  };
}
