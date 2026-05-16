import type { CharacterId } from '@/content/characters/character-data';

export interface CharacterSelectionState {
  player1Index: number;
  player2Index: number;
  phase: 1 | 2;
}

export interface MatchSelection {
  player1: CharacterId;
  player2: CharacterId;
}

export interface FightOutcomeSummary {
  winner: 1 | 2;
  rounds: number;
  totalTime: number;
  maxCombo: number;
  score: number;
  perfect: boolean;
}

export type GameMode = 'vs' | 'stage';

export interface SettingsState {
  skipStageIntro: boolean;
}

export type { AppShellState } from './scene-factory';
