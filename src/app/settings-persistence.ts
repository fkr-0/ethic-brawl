import type { SerializableSettingsState, SettingsState } from '@/app/app-shell/types';
import { deserializeInputBinding, serializeInputBinding } from '@/core/input/input-binding';
import { STORAGE_KEYS } from './config';

export function toSerializableSettings(settings: SettingsState): SerializableSettingsState {
  return {
    skipStageIntro: settings.skipStageIntro,
    bindings: {
      player1: serializeInputBinding(settings.bindings.player1),
      player2: serializeInputBinding(settings.bindings.player2),
    },
  };
}

export function applySerializableSettings(
  settings: SettingsState,
  persisted: Partial<SerializableSettingsState> | null | undefined
): SettingsState {
  if (!persisted) return settings;
  return {
    ...settings,
    skipStageIntro: persisted.skipStageIntro ?? settings.skipStageIntro,
    bindings: {
      player1: deserializeInputBinding(1, persisted.bindings?.player1, settings.bindings.player1),
      player2: deserializeInputBinding(2, persisted.bindings?.player2, settings.bindings.player2),
    },
  };
}

export function loadAppSettings(base: SettingsState): SettingsState {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!stored) return base;
    return applySerializableSettings(
      base,
      JSON.parse(stored) as Partial<SerializableSettingsState>
    );
  } catch (error) {
    console.error('Failed to load app settings:', error);
    return base;
  }
}

export function saveAppSettings(settings: SettingsState): boolean {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(toSerializableSettings(settings)));
    return true;
  } catch (error) {
    console.error('Failed to save app settings:', error);
    return false;
  }
}
