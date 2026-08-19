import {
  defineRuntimeSpecialAction,
  stepRuntimeAction,
  tryStartRuntimeAction,
} from '@/runtime/gameplay-actions';
import { describe, expect, it } from 'vitest';

const base = {
  ownerId: 'kant',
  resourceId: 'energy',
  resourceValue: 80,
  resourceMax: 100,
  cooldowns: {},
};

describe('Runtime gameplay-action adapter', () => {
  it('atomically spends energy and starts the Runtime cooldown', () => {
    const action = defineRuntimeSpecialAction({
      id: 'categorical-imperative',
      energyCost: 30,
      cooldown: 24,
    });
    const result = tryStartRuntimeAction(base, action, { reason: 'special' });

    expect(result.ok).toBe(true);
    expect(result.reason).toBeNull();
    expect(result.resourceValue).toBe(50);
    expect(result.cooldowns['categorical-imperative']).toBe(24);
    expect(result.events.map(({ kind }) => kind)).toContain('started');
  });

  it('maps insufficient resource without consuming energy or starting cooldown', () => {
    const action = defineRuntimeSpecialAction({ id: 'expensive', energyCost: 90, cooldown: 60 });
    const result = tryStartRuntimeAction(base, action);

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('resource');
    expect(result.resourceValue).toBe(80);
    expect(result.cooldowns.expensive).toBeUndefined();
  });

  it('preserves Runtime queue semantics for cooldown-blocked actions', () => {
    const action = defineRuntimeSpecialAction({
      id: 'queued-special',
      energyCost: 10,
      cooldown: 30,
      queueWindow: 8,
    });
    const blocked = tryStartRuntimeAction({ ...base, cooldowns: { 'queued-special': 5 } }, action, {
      queueIfBlocked: true,
    });

    expect(blocked.ok).toBe(false);
    expect(blocked.reason).toBe('cooldown');
    expect(blocked.queuedActionId).toBe('queued-special');
    expect(blocked.queueRemaining).toBe(8);
    expect(blocked.resourceValue).toBe(80);
  });

  it('steps cooldown and queued-action windows through one Runtime state update', () => {
    const stepped = stepRuntimeAction(
      {
        ...base,
        cooldowns: { special: 5 },
        queuedActionId: 'special',
        queueRemaining: 3,
      },
      2
    );

    expect(stepped.changed).toBe(true);
    expect(stepped.cooldowns.special).toBe(3);
    expect(stepped.queuedActionId).toBe('special');
    expect(stepped.queueRemaining).toBe(1);
  });

  it('expires queued actions while continuing to step cooldowns', () => {
    const stepped = stepRuntimeAction(
      {
        ...base,
        cooldowns: { special: 5 },
        queuedActionId: 'special',
        queueRemaining: 2,
      },
      3
    );

    expect(stepped.cooldowns.special).toBe(2);
    expect(stepped.queuedActionId).toBeNull();
    expect(stepped.queueRemaining).toBe(0);
    expect(stepped.events.map(({ kind }) => kind)).toContain('queue-expired');
  });
});
