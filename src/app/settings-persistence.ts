import type { SerializableSettingsState, SettingsState } from '@/app/app-shell/types';
import { deserializeInputBinding, serializeInputBinding } from '@/core/input/input-binding';
import { STORAGE_KEYS } from './config';

const SETTINGS_SCHEMA_VERSION = 2 as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isOneOf<Value extends string>(value: unknown, values: readonly Value[]): value is Value {
  return typeof value === 'string' && values.includes(value as Value);
}

export function parseSerializableSettings(
  value: unknown
): Partial<SerializableSettingsState> | null {
  if (!isRecord(value)) return null;
  const parsed: Partial<SerializableSettingsState> = {};
  if (value.schemaVersion === SETTINGS_SCHEMA_VERSION)
    parsed.schemaVersion = SETTINGS_SCHEMA_VERSION;
  if (typeof value.skipStageIntro === 'boolean') parsed.skipStageIntro = value.skipStageIntro;
  if (isOneOf(value.impactMotion, ['full', 'reduced', 'none'])) {
    parsed.impactMotion = value.impactMotion;
  }
  if (isOneOf(value.combatFlashes, ['full', 'reduced', 'none'])) {
    parsed.combatFlashes = value.combatFlashes;
  }
  if (isOneOf(value.spectatorDetail, ['minimal', 'tactical', 'lab'])) {
    parsed.spectatorDetail = value.spectatorDetail;
  }
  if (isRecord(value.bindings)) {
    parsed.bindings = value.bindings as SerializableSettingsState['bindings'];
  }
  return parsed;
}

export function toSerializableSettings(settings: SettingsState): SerializableSettingsState {
  return {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    skipStageIntro: settings.skipStageIntro,
    impactMotion: settings.impactMotion,
    combatFlashes: settings.combatFlashes,
    spectatorDetail: settings.spectatorDetail,
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
    impactMotion: persisted.impactMotion ?? settings.impactMotion,
    combatFlashes: persisted.combatFlashes ?? settings.combatFlashes,
    spectatorDetail: persisted.spectatorDetail ?? settings.spectatorDetail,
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
    return applySerializableSettings(base, parseSerializableSettings(JSON.parse(stored)));
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
