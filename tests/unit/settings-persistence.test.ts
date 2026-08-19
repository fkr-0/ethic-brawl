import { createInitialAppShellState } from '@/app/app-shell/scene-factory';
import {
  applySerializableSettings,
  loadAppSettings,
  parseSerializableSettings,
  saveAppSettings,
  toSerializableSettings,
} from '@/app/settings-persistence';
import { STORAGE_KEYS } from '@/app/config';
import { beforeEach, describe, expect, it } from 'vitest';

describe('app settings persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('writes a versioned payload and restores new presentation preferences', () => {
    const base = createInitialAppShellState().settings;
    const serialized = toSerializableSettings({
      ...base,
      impactMotion: 'reduced',
      combatFlashes: 'none',
      spectatorDetail: 'lab',
    });
    expect(serialized.schemaVersion).toBe(2);
    const restored = applySerializableSettings(base, serialized);
    expect(restored.impactMotion).toBe('reduced');
    expect(restored.combatFlashes).toBe('none');
    expect(restored.spectatorDetail).toBe('lab');
  });

  it('accepts legacy payloads and rejects malformed root values', () => {
    expect(parseSerializableSettings(null)).toBeNull();
    expect(parseSerializableSettings('broken')).toBeNull();
    expect(parseSerializableSettings({ skipStageIntro: true })).toEqual({
      skipStageIntro: true,
    });
  });

  it('ignores invalid enum values instead of trusting localStorage input', () => {
    expect(
      parseSerializableSettings({
        impactMotion: 'earthquake',
        combatFlashes: 9000,
        spectatorDetail: 'omniscient',
      })
    ).toEqual({});
  });

  it('upgrades legacy raw localStorage settings into the Runtime envelope with backup', () => {
    const base = createInitialAppShellState().settings;
    const legacy = toSerializableSettings({
      ...base,
      skipStageIntro: true,
      impactMotion: 'reduced',
      combatFlashes: 'none',
      spectatorDetail: 'lab',
    });
    const rawLegacy = JSON.stringify(legacy);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, rawLegacy);

    const restored = loadAppSettings(base);

    expect(restored).toMatchObject({
      skipStageIntro: true,
      impactMotion: 'reduced',
      combatFlashes: 'none',
      spectatorDetail: 'lab',
    });
    expect(localStorage.getItem(`${STORAGE_KEYS.SETTINGS}.backup`)).toBe(rawLegacy);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) ?? '{}')).toMatchObject({
      format: 1,
      version: 1,
      data: legacy,
    });
  });

  it('saves and reloads current settings through Runtime versioned storage', () => {
    const base = createInitialAppShellState().settings;
    const changed = {
      ...base,
      spectatorDetail: 'minimal' as const,
      impactMotion: 'none' as const,
    };

    expect(saveAppSettings(changed)).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) ?? '{}')).toMatchObject({
      format: 1,
      version: 1,
      data: toSerializableSettings(changed),
    });
    expect(loadAppSettings(base)).toMatchObject({
      spectatorDetail: 'minimal',
      impactMotion: 'none',
    });
  });
});
