import type { CharacterId } from '@/content/characters/character-data';
import type { GameAction, InputBinding, SerializedInputBinding } from '@/core/input/input-binding';

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

export type GameMode = 'vs' | 'ai-vs-ai' | 'stage';
export type SettingsMenuTab = 'gameplay' | 'accessibility' | 'keybindings';
export type ImpactMotionLevel = 'full' | 'reduced' | 'none';
export type CombatFlashLevel = 'full' | 'reduced' | 'none';
export type SpectatorDetailLevel = 'minimal' | 'tactical' | 'lab';

export interface KeybindingEditState {
  playerId: 1 | 2;
  action: GameAction;
}

export interface SettingsState {
  skipStageIntro: boolean;
  impactMotion: ImpactMotionLevel;
  combatFlashes: CombatFlashLevel;
  spectatorDetail: SpectatorDetailLevel;
  menuTab: SettingsMenuTab;
  selectedIndex: number;
  keybindingEdit: KeybindingEditState | null;
  bindings: {
    player1: InputBinding;
    player2: InputBinding;
  };
}

export interface SerializableSettingsState {
  schemaVersion: 2;
  skipStageIntro: boolean;
  impactMotion: ImpactMotionLevel;
  combatFlashes: CombatFlashLevel;
  spectatorDetail: SpectatorDetailLevel;
  bindings: {
    player1: SerializedInputBinding;
    player2: SerializedInputBinding;
  };
}

export type { AppShellState } from './scene-factory';
