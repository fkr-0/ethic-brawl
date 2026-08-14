import { createInitialAppShellState } from '@/app/app-shell/scene-factory';
import {
  applySerializableSettings,
  parseSerializableSettings,
  toSerializableSettings,
} from '@/app/settings-persistence';
import { describe, expect, it } from 'vitest';

describe('app settings persistence', () => {
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
});
