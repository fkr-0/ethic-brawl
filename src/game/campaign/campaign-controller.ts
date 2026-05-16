/**
 * Campaign controller - manages campaign flow and progression
 */

import { type CharacterId, getCharacterIds } from '@/content/characters/character-data';
import type { AIDifficulty } from '../ai/ai-controller';
import { generateStageClues } from './clue-generator';
import { generateStageTrial } from './trial-controller';

/**
 * Campaign stage definition
 */
export interface CampaignStage {
  id: string;
  name: string;
  description: string;
  theme: StageTheme;
  opponent: CharacterId;
  difficulty: AIDifficulty;
  clues: CampaignClue[];
  trial: TrialDefinition;
  background: StageBackground;
  reward: StageReward;
}

/**
 * Stage themes
 */
export type StageTheme =
  | 'neon_streets'
  | 'data_cathedral'
  | 'algorithmic_arena'
  | 'philosophers_throne';

/**
 * Campaign clue
 */
export interface CampaignClue {
  id: string;
  type: 'headline' | 'propaganda' | 'sign' | 'dialogue';
  text: string;
  position: { x: number; y: number };
  style: ClueStyle;
}

/**
 * Clue styling
 */
export interface ClueStyle {
  color: string;
  font: string;
  background?: string;
  border?: string;
  glow?: string;
}

/**
 * Trial definition
 */
export interface TrialDefinition {
  id: string;
  type: TrialType;
  prompt: string;
  context: string;
  options: TrialOption[];
  correctOption?: string;
  keywords?: string[];
  stanceKeywords?: {
    idealist: string[];
    pragmatist: string[];
    cynic: string[];
  };
  points: {
    correct: number;
    partial: number;
    creative: number;
  };
}

/**
 * Trial types
 */
export type TrialType = 'moral_dilemma' | 'logic_puzzle' | 'accusation';

/**
 * Trial option
 */
export interface TrialOption {
  id: string;
  text: string;
  stance: 'idealist' | 'pragmatist' | 'cynic';
  consequence: TrialConsequence;
}

/**
 * Trial consequence
 */
export interface TrialConsequence {
  type: 'buff' | 'debuff' | 'xp_bonus' | 'xp_penalty' | 'unlock';
  value: number;
  description: string;
}

/**
 * Stage background config
 */
export interface StageBackground {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  hasRain: boolean;
  hasNeonSigns: boolean;
  hasHolograms: boolean;
}

/**
 * Stage reward
 */
export interface StageReward {
  baseXP: number;
  bonusXPForPerfect: number;
  unlockId?: string;
  moduleReward?: string;
}

/**
 * Campaign state
 */
export interface CampaignState {
  currentStageIndex: number;
  stages: CampaignStage[];
  playerCharacter: CharacterId;
  playerStats: PlayerCampaignStats;
  trialHistory: TrialResult[];
  isActive: boolean;
  isComplete: boolean;
  finalScore: number;
}

/**
 * Player campaign stats
 */
export interface PlayerCampaignStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalFightsWon: number;
  totalTrialsPassed: number;
  maxComboAchieved: number;
  appliedUpgrades: AppliedUpgrade[];
  activeBuffs: ActiveBuff[];
}

/**
 * Applied upgrade
 */
export interface AppliedUpgrade {
  id: string;
  name: string;
  stat: 'strength' | 'defense' | 'agility' | 'energy';
  bonus: number;
}

/**
 * Active buff from trials
 */
export interface ActiveBuff {
  id: string;
  name: string;
  type: 'damage' | 'defense' | 'speed' | 'special';
  value: number;
  duration: 'permanent' | 'next_fight';
}

/**
 * Trial result
 */
export interface TrialResult {
  trialId: string;
  stageIndex: number;
  selectedOption?: string;
  typedResponse?: string;
  score: number;
  stance: 'idealist' | 'pragmatist' | 'cynic' | 'neutral';
  consequence: TrialConsequence;
  timestamp: number;
}

/**
 * Campaign configuration
 */
export interface CampaignConfig {
  playerCharacter: CharacterId;
  difficulty: 'normal' | 'hard';
  randomizeOpponents: boolean;
}

// Callback types
type StageStartCallback = (stage: CampaignStage) => void;
type FightEndCallback = (won: boolean) => void;
type TrialEndCallback = (result: TrialResult) => void;
type CampaignEndCallback = (completed: boolean, score: number) => void;

// Module-level state
let state: CampaignState | null = null;
let onStageStart: StageStartCallback | null = null;
let onFightEnd: FightEndCallback | null = null;
let onTrialEnd: TrialEndCallback | null = null;
let onCampaignEnd: CampaignEndCallback | null = null;

/**
 * Initialize a new campaign
 */
export function initCampaign(config: CampaignConfig): void {
  const stages = generateCampaignStages(config);

  state = {
    currentStageIndex: 0,
    stages,
    playerCharacter: config.playerCharacter,
    playerStats: {
      level: 1,
      xp: 0,
      xpToNextLevel: 150,
      totalFightsWon: 0,
      totalTrialsPassed: 0,
      maxComboAchieved: 0,
      appliedUpgrades: [],
      activeBuffs: [],
    },
    trialHistory: [],
    isActive: true,
    isComplete: false,
    finalScore: 0,
  };

  if (onStageStart && stages[0]) {
    onStageStart(stages[0]);
  }
}

/**
 * Get current stage
 */
export function getCurrentStage(): CampaignStage | null {
  if (!state) return null;
  return state.stages[state.currentStageIndex] ?? null;
}

/**
 * Get current stage number (1-based)
 */
export function getCurrentStageNumber(): number {
  return state ? state.currentStageIndex + 1 : 0;
}

/**
 * Get total stages
 */
export function getTotalStages(): number {
  return state?.stages.length ?? 0;
}

/**
 * Advance to next stage after victory
 */
export function advanceStage(fightData: {
  perfect: boolean;
  maxCombo: number;
  timeBonus: number;
}): void {
  if (!state) return;

  const stage = getCurrentStage();
  if (stage) {
    let xpGain = stage.reward.baseXP;
    if (fightData.perfect) {
      xpGain += stage.reward.bonusXPForPerfect;
    }
    xpGain += fightData.timeBonus;
    awardXP(xpGain);
  }

  state.playerStats.totalFightsWon++;
  if (fightData.maxCombo > state.playerStats.maxComboAchieved) {
    state.playerStats.maxComboAchieved = fightData.maxCombo;
  }

  if (state.currentStageIndex >= state.stages.length - 1) {
    state.isComplete = true;
    state.isActive = false;
    state.finalScore = calculateFinalScore();
    if (onCampaignEnd) {
      onCampaignEnd(true, state.finalScore);
    }
  } else {
    state.currentStageIndex++;
    const nextStage = getCurrentStage();
    if (onStageStart && nextStage) {
      onStageStart(nextStage);
    }
  }
}

/**
 * Handle fight defeat
 */
export function handleFightDefeat(): void {
  if (onFightEnd) {
    onFightEnd(false);
  }
}

/**
 * Retry current stage
 */
export function retryStage(): void {
  const stage = getCurrentStage();
  if (onStageStart && stage) {
    onStageStart(stage);
  }
}

/**
 * Process trial result
 */
export function processTrialResult(result: TrialResult): void {
  if (!state) return;

  result.stageIndex = state.currentStageIndex;
  state.trialHistory.push(result);

  applyConsequence(result.consequence);

  if (result.score > 50) {
    state.playerStats.totalTrialsPassed++;
    awardXP(Math.floor(result.score / 5));
  }

  if (onTrialEnd) {
    onTrialEnd(result);
  }
}

/**
 * Award XP and check for level up
 */
function awardXP(amount: number): void {
  if (!state) return;

  state.playerStats.xp += amount;

  while (state.playerStats.xp >= state.playerStats.xpToNextLevel) {
    state.playerStats.xp -= state.playerStats.xpToNextLevel;
    state.playerStats.level++;
    state.playerStats.xpToNextLevel = Math.floor(state.playerStats.xpToNextLevel * 1.5);
  }
}

/**
 * Apply trial consequence
 */
function applyConsequence(consequence: TrialConsequence): void {
  if (!state) return;

  switch (consequence.type) {
    case 'buff':
      state.playerStats.activeBuffs.push({
        id: `trial_buff_${Date.now()}`,
        name: consequence.description,
        type: 'damage',
        value: consequence.value,
        duration: 'next_fight',
      });
      break;
    case 'xp_bonus':
      awardXP(consequence.value);
      break;
    case 'xp_penalty':
      state.playerStats.xp = Math.max(0, state.playerStats.xp - consequence.value);
      break;
  }
}

/**
 * Apply upgrade selection
 */
export function applyUpgrade(upgrade: AppliedUpgrade): void {
  if (!state) return;
  state.playerStats.appliedUpgrades.push(upgrade);
}

/**
 * Get available upgrades
 */
export function getAvailableUpgrades(): AppliedUpgrade[] {
  const upgrades: AppliedUpgrade[] = [
    { id: 'str_1', name: 'Philosophical Force', stat: 'strength', bonus: 3 },
    { id: 'def_1', name: 'Stoic Resolve', stat: 'defense', bonus: 3 },
    { id: 'agi_1', name: 'Dialectical Speed', stat: 'agility', bonus: 3 },
    { id: 'mag_1', name: 'Metaphysical Energy', stat: 'energy', bonus: 3 },
  ];

  const appliedIds = state?.playerStats.appliedUpgrades.map((u) => u.id) ?? [];
  return upgrades.filter((u) => !appliedIds.includes(u.id));
}

/**
 * Calculate final score
 */
function calculateFinalScore(): number {
  if (!state) return 0;

  let score = 1000 * state.stages.length;
  score += state.playerStats.xp;
  score += state.playerStats.level * 100;
  score += state.playerStats.totalTrialsPassed * 50;
  score += state.playerStats.maxComboAchieved * 10;

  const perfectTrials = state.trialHistory.filter((t) => t.score >= 90).length;
  score += perfectTrials * 100;

  return score;
}

/**
 * Get state
 */
export function getCampaignState(): CampaignState | null {
  return state;
}

/**
 * Set callbacks
 */
export function setOnStageStart(callback: StageStartCallback): void {
  onStageStart = callback;
}

export function setOnFightEnd(callback: FightEndCallback): void {
  onFightEnd = callback;
}

export function setOnTrialEnd(callback: TrialEndCallback): void {
  onTrialEnd = callback;
}

export function setOnCampaignEnd(callback: CampaignEndCallback): void {
  onCampaignEnd = callback;
}

/**
 * Generate campaign stages
 */
function generateCampaignStages(config: CampaignConfig): CampaignStage[] {
  const allCharacters: CharacterId[] = getCharacterIds();
  const availableOpponents = allCharacters.filter((c) => c !== config.playerCharacter);

  const difficulties: readonly AIDifficulty[] =
    config.difficulty === 'hard'
      ? ['medium', 'hard', 'hard', 'hard']
      : ['easy', 'medium', 'medium', 'hard'];

  const themes: StageTheme[] = [
    'neon_streets',
    'data_cathedral',
    'algorithmic_arena',
    'philosophers_throne',
  ];

  return themes.map(
    (theme, i): CampaignStage => ({
      id: `stage_${i + 1}`,
      name: getStageName(theme),
      description: getStageDescription(theme),
      theme,
      opponent: getStageOpponent(availableOpponents, i, config.playerCharacter),
      difficulty: difficulties[i] ?? difficulties.at(-1) ?? 'medium',
      clues: generateStageClues(theme, i),
      trial: generateStageTrial(theme, i),
      background: getStageBackground(theme),
      reward: {
        baseXP: 100 + i * 25,
        bonusXPForPerfect: 50 + i * 25,
      },
    })
  );
}

function getStageOpponent(
  availableOpponents: readonly CharacterId[],
  index: number,
  playerCharacter: CharacterId
): CharacterId {
  if (availableOpponents.length === 0) {
    return playerCharacter;
  }

  return availableOpponents[index % availableOpponents.length] ?? playerCharacter;
}

function getStageName(theme: StageTheme): string {
  const names: Record<StageTheme, string> = {
    neon_streets: 'Neon District',
    data_cathedral: 'Cathedral of Data',
    algorithmic_arena: 'Algorithmic Arena',
    philosophers_throne: "Philosopher's Throne",
  };
  return names[theme];
}

function getStageDescription(theme: StageTheme): string {
  const descriptions: Record<StageTheme, string> = {
    neon_streets: 'Where truth flickers in electric signs',
    data_cathedral: 'Sacred algorithms watch over the faithful',
    algorithmic_arena: 'Combat optimized for maximum spectacle',
    philosophers_throne: 'The ultimate proving ground',
  };
  return descriptions[theme];
}

function getStageBackground(theme: StageTheme): StageBackground {
  const backgrounds: Record<StageTheme, StageBackground> = {
    neon_streets: {
      primaryColor: '#1A0A2E',
      secondaryColor: '#2D1B4E',
      accentColor: '#FF00FF',
      hasRain: true,
      hasNeonSigns: true,
      hasHolograms: false,
    },
    data_cathedral: {
      primaryColor: '#0A0A1E',
      secondaryColor: '#1A1A3E',
      accentColor: '#00F5FF',
      hasRain: false,
      hasNeonSigns: false,
      hasHolograms: true,
    },
    algorithmic_arena: {
      primaryColor: '#0D0518',
      secondaryColor: '#2D0A2E',
      accentColor: '#39FF14',
      hasRain: false,
      hasNeonSigns: true,
      hasHolograms: true,
    },
    philosophers_throne: {
      primaryColor: '#1A0A2E',
      secondaryColor: '#3D1B5E',
      accentColor: '#FFD700',
      hasRain: false,
      hasNeonSigns: true,
      hasHolograms: true,
    },
  };
  return backgrounds[theme];
}
