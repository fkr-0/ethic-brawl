import { createVersionedStore, type ArcadeStorageAdapter } from '@arcade/runtime/storage';

export interface LegacyCompatibleVersionedStoreOptions<T> {
  adapter: ArcadeStorageAdapter;
  key: string;
  version: number;
  defaults?: T | (() => T);
  migrations?: Record<
    number,
    (data: unknown, context: Readonly<{ from: number; to: number }>) => unknown
  >;
  validate?: (data: unknown) => boolean;
  backupKey?: string;
  now?: () => number;
  onCorruption?: (context: unknown) => void;
  parseLegacy: (raw: string) => T | null;
}

function isRuntimeStoreEnvelope(raw: string): boolean {
  try {
    const value = JSON.parse(raw) as { format?: unknown } | null;
    return value?.format === 1;
  } catch {
    return false;
  }
}

/**
 * Runtime's versioned store deliberately rejects pre-envelope JSON. Ethic Brawl
 * already has raw localStorage payloads in the wild, so this bridge performs a
 * one-time parse of that legacy payload before the Runtime store loads it.
 *
 * Calling Runtime `save()` while the raw legacy value is still at the primary
 * key naturally preserves that value at Runtime's backup key before replacing
 * the primary with the checksummed envelope.
 */
export function createLegacyCompatibleVersionedStore<T>(
  options: LegacyCompatibleVersionedStoreOptions<T>
) {
  const store = createVersionedStore<T>({
    adapter: options.adapter,
    key: options.key,
    version: options.version,
    ...(options.defaults === undefined ? {} : { defaults: options.defaults }),
    ...(options.migrations === undefined ? {} : { migrations: options.migrations }),
    ...(options.validate === undefined ? {} : { validate: options.validate }),
    ...(options.backupKey === undefined ? {} : { backupKey: options.backupKey }),
    ...(options.now === undefined ? {} : { now: options.now }),
    ...(options.onCorruption === undefined ? {} : { onCorruption: options.onCorruption }),
  });

  const upgradeLegacyPrimary = (): boolean => {
    const raw = options.adapter.getItem(options.key);
    if (raw === null || isRuntimeStoreEnvelope(raw)) return false;

    let legacy: T | null = null;
    try {
      legacy = options.parseLegacy(raw);
    } catch {
      return false;
    }
    if (legacy === null) return false;
    if (options.validate && options.validate(legacy) === false) return false;

    store.save(legacy, { revision: 0 });
    return true;
  };

  return Object.freeze({
    save: store.save,
    clear: store.clear,
    inspect: store.inspect,
    load() {
      const legacyUpgraded = upgradeLegacyPrimary();
      const result = store.load();
      return Object.freeze({ ...result, legacyUpgraded });
    },
    store,
  });
}

export type LegacyCompatibleVersionedStore<T> = ReturnType<
  typeof createLegacyCompatibleVersionedStore<T>
>;
