import { createLegacyCompatibleVersionedStore } from '@/runtime/versioned-storage';
import { createMemoryStorageAdapter, createVersionedStore } from '@arcade/runtime/storage';
import { describe, expect, it, vi } from 'vitest';

interface SettingsFixture {
  theme: string;
  volume: number;
}

const validateFixture = (value: unknown): value is SettingsFixture => {
  if (!value || typeof value !== 'object') return false;
  const fixture = value as Partial<SettingsFixture>;
  return typeof fixture.theme === 'string' && typeof fixture.volume === 'number';
};

describe('legacy-compatible Runtime versioned storage', () => {
  it('upgrades raw legacy JSON while preserving it as the Runtime backup', () => {
    const legacy = JSON.stringify({ theme: 'neon', volume: 0.75 });
    const adapter = createMemoryStorageAdapter({ settings: legacy });
    const store = createLegacyCompatibleVersionedStore<SettingsFixture>({
      adapter,
      key: 'settings',
      version: 1,
      defaults: { theme: 'default', volume: 1 },
      validate: validateFixture,
      parseLegacy: (raw) => {
        const parsed: unknown = JSON.parse(raw);
        return validateFixture(parsed) ? parsed : null;
      },
      now: () => 1234,
    });

    const loaded = store.load();
    const snapshot = adapter.snapshot();

    expect(loaded).toMatchObject({
      data: { theme: 'neon', volume: 0.75 },
      source: 'primary',
      migrated: false,
      recovered: false,
      version: 1,
      legacyUpgraded: true,
    });
    expect(snapshot['settings.backup']).toBe(legacy);
    expect(JSON.parse(snapshot.settings ?? '{}')).toMatchObject({
      format: 1,
      version: 1,
      data: { theme: 'neon', volume: 0.75 },
    });
  });

  it('leaves an existing Runtime envelope untouched', () => {
    const adapter = createMemoryStorageAdapter();
    createVersionedStore<SettingsFixture>({
      adapter,
      key: 'settings',
      version: 1,
      validate: validateFixture,
    }).save({ theme: 'cyan', volume: 0.5 });

    const store = createLegacyCompatibleVersionedStore<SettingsFixture>({
      adapter,
      key: 'settings',
      version: 1,
      defaults: { theme: 'default', volume: 1 },
      validate: validateFixture,
      parseLegacy: () => {
        throw new Error('legacy parser must not run for Runtime envelopes');
      },
    });

    expect(store.load()).toMatchObject({
      data: { theme: 'cyan', volume: 0.5 },
      legacyUpgraded: false,
    });
  });

  it('keeps Runtime migrations available after the legacy bridge', () => {
    const adapter = createMemoryStorageAdapter();
    createVersionedStore<{ theme: string }>({
      adapter,
      key: 'settings',
      version: 1,
    }).save({ theme: 'magenta' }, { savedAt: 10, revision: 2 });

    const store = createLegacyCompatibleVersionedStore<SettingsFixture>({
      adapter,
      key: 'settings',
      version: 2,
      defaults: { theme: 'default', volume: 1 },
      migrations: {
        2: (data) => ({ ...(data as { theme: string }), volume: 0.8 }),
      },
      validate: validateFixture,
      parseLegacy: () => null,
    });

    expect(store.load()).toMatchObject({
      data: { theme: 'magenta', volume: 0.8 },
      migrated: true,
      legacyUpgraded: false,
      version: 2,
    });
  });

  it('falls back safely when legacy data cannot be parsed', () => {
    const corruption = vi.fn();
    const adapter = createMemoryStorageAdapter({ settings: '{broken json' });
    const store = createLegacyCompatibleVersionedStore<SettingsFixture>({
      adapter,
      key: 'settings',
      version: 1,
      defaults: { theme: 'default', volume: 1 },
      validate: validateFixture,
      parseLegacy: () => null,
      onCorruption: corruption,
    });

    expect(store.load()).toMatchObject({
      data: { theme: 'default', volume: 1 },
      source: 'default',
      legacyUpgraded: false,
    });
    expect(corruption).toHaveBeenCalled();
  });
});
