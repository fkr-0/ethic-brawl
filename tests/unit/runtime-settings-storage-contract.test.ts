import { createInitialAppShellState } from '@/app/app-shell/scene-factory';
import type { SerializableSettingsState } from '@/app/app-shell/types';
import {
  applySerializableSettings,
  parseSerializableSettings,
  toSerializableSettings,
} from '@/app/settings-persistence';
import { createLegacyCompatibleVersionedStore } from '@/runtime/versioned-storage';
import { createMemoryStorageAdapter } from '@arcade/runtime/storage';
import { describe, expect, it } from 'vitest';

describe('Ethic settings over Runtime versioned storage', () => {
  it('upgrades the real raw settings schema and preserves all current preferences', () => {
    const base = createInitialAppShellState().settings;
    const legacySettings = toSerializableSettings({
      ...base,
      skipStageIntro: true,
      impactMotion: 'reduced',
      combatFlashes: 'none',
      spectatorDetail: 'lab',
    });
    const rawLegacy = JSON.stringify(legacySettings);
    const adapter = createMemoryStorageAdapter({ ethic_brawl_settings: rawLegacy });
    const store = createLegacyCompatibleVersionedStore<Partial<SerializableSettingsState>>({
      adapter,
      key: 'ethic_brawl_settings',
      version: 1,
      defaults: toSerializableSettings(base),
      validate: (value) => parseSerializableSettings(value) !== null,
      parseLegacy: (raw) => parseSerializableSettings(JSON.parse(raw)),
    });

    const loaded = store.load();
    const restored = applySerializableSettings(base, loaded.data);

    expect(loaded.legacyUpgraded).toBe(true);
    expect(restored).toMatchObject({
      skipStageIntro: true,
      impactMotion: 'reduced',
      combatFlashes: 'none',
      spectatorDetail: 'lab',
    });
    expect(adapter.snapshot()['ethic_brawl_settings.backup']).toBe(rawLegacy);
  });

  it('round-trips a new settings save through the Runtime envelope', () => {
    const base = createInitialAppShellState().settings;
    const adapter = createMemoryStorageAdapter();
    const makeStore = () =>
      createLegacyCompatibleVersionedStore<Partial<SerializableSettingsState>>({
        adapter,
        key: 'ethic_brawl_settings',
        version: 1,
        defaults: toSerializableSettings(base),
        validate: (value) => parseSerializableSettings(value) !== null,
        parseLegacy: (raw) => parseSerializableSettings(JSON.parse(raw)),
      });

    const changed = toSerializableSettings({
      ...base,
      spectatorDetail: 'minimal',
      impactMotion: 'none',
    });
    makeStore().save(changed);

    const loaded = makeStore().load();
    expect(loaded.legacyUpgraded).toBe(false);
    expect(applySerializableSettings(base, loaded.data)).toMatchObject({
      spectatorDetail: 'minimal',
      impactMotion: 'none',
    });
    expect(JSON.parse(adapter.snapshot().ethic_brawl_settings ?? '{}')).toMatchObject({
      format: 1,
      version: 1,
      data: changed,
    });
  });
});
