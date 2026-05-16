/**
 * Experience and leveling system
 */

/**
 * Level thresholds
 */
export const LEVEL_THRESHOLDS: readonly number[] = [
  0, // Level 1
  150, // Level 2
  350, // Level 3
  600, // Level 4
  900, // Level 5 (Max for 4-stage campaign)
  1300, // Level 6 (Extended)
  1800, // Level 7
  2400, // Level 8
  3200, // Level 9
  4200, // Level 10 (Absolute max)
];

/**
 * Level bonuses
 */
export const LEVEL_BONUSES: readonly { level: number; bonus: LevelBonus }[] = [
  { level: 1, bonus: { type: 'none', value: 0 } },
  { level: 2, bonus: { type: 'stat_boost', stat: 'strength', value: 2 } },
  { level: 3, bonus: { type: 'stat_boost', stat: 'defense', value: 2 } },
  { level: 4, bonus: { type: 'stat_boost', stat: 'agility', value: 2 } },
  { level: 5, bonus: { type: 'special_cooldown', value: -30 } },
  { level: 6, bonus: { type: 'stat_boost', stat: 'energy', value: 3 } },
  { level: 7, bonus: { type: 'combo_extension', value: 5 } },
  { level: 8, bonus: { type: 'block_bonus', value: 10 } },
  { level: 9, bonus: { type: 'stat_boost', stat: 'strength', value: 3 } },
  { level: 10, bonus: { type: 'ultimate', value: 1 } },
];

/**
 * Level bonus types
 */
export interface LevelBonus {
  type: 'none' | 'stat_boost' | 'special_cooldown' | 'combo_extension' | 'block_bonus' | 'ultimate';
  stat?: 'strength' | 'defense' | 'agility' | 'energy';
  value: number;
}

/**
 * Experience state
 */
export interface ExperienceState {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXP: number;
  bonuses: LevelBonus[];
}

/**
 * Create initial experience state
 */
export function createExperienceState(): ExperienceState {
  const initialBonus = LEVEL_BONUSES[0]?.bonus;
  return {
    level: 1,
    xp: 0,
    xpToNextLevel: LEVEL_THRESHOLDS[1] ?? 150,
    totalXP: 0,
    bonuses: initialBonus ? [initialBonus] : [],
  };
}

/**
 * Add XP and return new state
 */
export function addXP(state: ExperienceState, amount: number): ExperienceState {
  const newState: ExperienceState = {
    ...state,
    xp: state.xp + amount,
    totalXP: state.totalXP + amount,
  };

  // Check for level up
  while (newState.xp >= newState.xpToNextLevel && newState.level < LEVEL_THRESHOLDS.length) {
    newState.xp -= newState.xpToNextLevel;
    newState.level++;

    const lastThreshold = LEVEL_THRESHOLDS.at(-1) ?? 0;
    const nextThreshold = LEVEL_THRESHOLDS[newState.level] ?? lastThreshold;
    newState.xpToNextLevel = nextThreshold - (LEVEL_THRESHOLDS[newState.level - 1] ?? 0);

    // Add level bonus
    const levelBonus = LEVEL_BONUSES.find((b) => b.level === newState.level);
    if (levelBonus) {
      newState.bonuses = [...newState.bonuses, levelBonus.bonus];
    }
  }

  return newState;
}

/**
 * Get level from total XP
 */
export function getLevelFromXP(totalXP: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXP >= (LEVEL_THRESHOLDS[i] ?? 0)) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Calculate XP needed for next level
 */
export function getXPToNextLevel(currentLevel: number): number {
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return Number.POSITIVE_INFINITY;
  }
  return (LEVEL_THRESHOLDS[currentLevel] ?? 0) - (LEVEL_THRESHOLDS[currentLevel - 1] ?? 0);
}

/**
 * Get progress to next level (0-1)
 */
export function getLevelProgress(state: ExperienceState): number {
  if (state.level >= LEVEL_THRESHOLDS.length) {
    return 1;
  }
  const currentThreshold = LEVEL_THRESHOLDS[state.level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[state.level] ?? currentThreshold;
  const progress = state.xp / (nextThreshold - currentThreshold);
  return Math.min(1, Math.max(0, progress));
}

/**
 * Calculate fight XP reward
 */
export function calculateFightXP(
  baseXP: number,
  modifiers: {
    perfect?: boolean;
    timeBonus?: number;
    comboBonus?: number;
    trialBonus?: number;
    firstTime?: boolean;
  }
): number {
  let xp = baseXP;

  if (modifiers.perfect) {
    xp *= 1.5;
  }

  if (modifiers.timeBonus) {
    xp += modifiers.timeBonus;
  }

  if (modifiers.comboBonus) {
    xp += modifiers.comboBonus;
  }

  if (modifiers.trialBonus) {
    xp += modifiers.trialBonus;
  }

  if (modifiers.firstTime) {
    xp *= 1.25;
  }

  return Math.floor(xp);
}
