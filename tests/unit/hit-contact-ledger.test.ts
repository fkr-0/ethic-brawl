import { describe, expect, it } from 'vitest';
import {
  canRegisterAttackContact,
  createAttackContactMap,
  registerAttackContact,
} from '@/game/fight/hit-confirm';

describe('shared hit contact ledger facade', () => {
  it('preserves attack hit budgets and frame-based rehit delays', () => {
    const contacts = createAttackContactMap();
    const attack = {
      hitPolicy: { maxHitsPerTarget: 2, rehitDelayFrames: 4 },
    };

    expect(canRegisterAttackContact(attack, contacts, 'p2', 10)).toBe(true);
    registerAttackContact(contacts, 'p2', 10);
    expect(canRegisterAttackContact(attack, contacts, 'p2', 12)).toBe(false);
    expect(canRegisterAttackContact(attack, contacts, 'p2', 14)).toBe(true);
    registerAttackContact(contacts, 'p2', 14);
    expect(canRegisterAttackContact(attack, contacts, 'p2', 20)).toBe(false);
  });
});
