import { GAME_ACTIONS, resetBindingForPlayer, type GameAction } from '@/core/input/input-binding';
import type {
  CombatFlashLevel,
  ImpactMotionLevel,
  SettingsMenuTab,
  SettingsState,
  SpectatorDetailLevel,
} from './types';

export interface SettingsTabDefinition {
  id: SettingsMenuTab;
  label: string;
  glyph: string;
}

export interface SettingsRowViewModel {
  id: string;
  label: string;
  value: string;
  description: string;
  kind: 'toggle' | 'cycle' | 'link';
}

export const SETTINGS_TABS: readonly SettingsTabDefinition[] = [
  { id: 'gameplay', label: 'Play', glyph: '◆' },
  { id: 'accessibility', label: 'Signal', glyph: '◉' },
  { id: 'keybindings', label: 'Keys', glyph: '⌁' },
];

const IMPACT_MOTION_LEVELS: readonly ImpactMotionLevel[] = ['full', 'reduced', 'none'];
const COMBAT_FLASH_LEVELS: readonly CombatFlashLevel[] = ['full', 'reduced', 'none'];
const SPECTATOR_DETAIL_LEVELS: readonly SpectatorDetailLevel[] = ['minimal', 'tactical', 'lab'];

function cycleValue<Value extends string>(values: readonly Value[], current: Value): Value {
  const currentIndex = Math.max(0, values.indexOf(current));
  return values[(currentIndex + 1) % values.length] ?? values[0] ?? current;
}

function displayLevel(value: string): string {
  return value === 'none' ? 'OFF' : value.toUpperCase();
}

export function getSettingsRows(settings: SettingsState): readonly SettingsRowViewModel[] {
  if (settings.menuTab === 'gameplay') {
    return [
      {
        id: 'skip-stage-intro',
        label: 'Skip Stage Intro',
        value: settings.skipStageIntro ? 'ON' : 'OFF',
        description: 'Jump directly from route selection into combat.',
        kind: 'toggle',
      },
      {
        id: 'spectator-detail',
        label: 'AI Spectator Feed',
        value: settings.spectatorDetail.toUpperCase(),
        description: 'Minimal broadcast, tactical intent, or full laboratory telemetry.',
        kind: 'cycle',
      },
      {
        id: 'open-keybindings',
        label: 'Control Wiring',
        value: 'OPEN',
        description: 'Remap both fighters without leaving the game shell.',
        kind: 'link',
      },
    ];
  }

  if (settings.menuTab === 'accessibility') {
    return [
      {
        id: 'impact-motion',
        label: 'Impact Motion',
        value: displayLevel(settings.impactMotion),
        description: 'Scale camera shake and combat zoom while preserving timing information.',
        kind: 'cycle',
      },
      {
        id: 'combat-flashes',
        label: 'Combat Flashes',
        value: displayLevel(settings.combatFlashes),
        description: 'Scale fighter highlights, hit-freeze whiteouts, and damage overlays.',
        kind: 'cycle',
      },
    ];
  }

  return [];
}

export function getSettingsRowCount(settings: SettingsState): number {
  return settings.menuTab === 'keybindings'
    ? GAME_ACTIONS.length + 1
    : getSettingsRows(settings).length;
}

export function cycleSettingsTab(
  settings: SettingsState,
  direction: 'left' | 'right'
): SettingsState {
  const currentIndex = SETTINGS_TABS.findIndex(({ id }) => id === settings.menuTab);
  const delta = direction === 'left' ? -1 : 1;
  const nextIndex = (currentIndex + delta + SETTINGS_TABS.length) % SETTINGS_TABS.length;
  return {
    ...settings,
    menuTab: SETTINGS_TABS[nextIndex]?.id ?? 'gameplay',
    selectedIndex: 0,
    keybindingEdit: null,
  };
}

export function activateSettingsSelection(settings: SettingsState): SettingsState {
  if (settings.menuTab === 'gameplay') {
    if (settings.selectedIndex === 0) {
      return { ...settings, skipStageIntro: !settings.skipStageIntro };
    }
    if (settings.selectedIndex === 1) {
      return {
        ...settings,
        spectatorDetail: cycleValue(SPECTATOR_DETAIL_LEVELS, settings.spectatorDetail),
      };
    }
    return {
      ...settings,
      menuTab: 'keybindings',
      selectedIndex: 0,
      keybindingEdit: null,
    };
  }

  if (settings.menuTab === 'accessibility') {
    if (settings.selectedIndex === 0) {
      return {
        ...settings,
        impactMotion: cycleValue(IMPACT_MOTION_LEVELS, settings.impactMotion),
      };
    }
    return {
      ...settings,
      combatFlashes: cycleValue(COMBAT_FLASH_LEVELS, settings.combatFlashes),
    };
  }

  if (settings.selectedIndex === GAME_ACTIONS.length) {
    return {
      ...settings,
      bindings: {
        player1: resetBindingForPlayer(1),
        player2: resetBindingForPlayer(2),
      },
      keybindingEdit: null,
    };
  }

  const action = GAME_ACTIONS[settings.selectedIndex] as GameAction | undefined;
  return action ? { ...settings, keybindingEdit: { playerId: 1, action } } : settings;
}
