import { ATTACK_HITBOXES, createActiveHitbox } from '@/game/fight/hitbox';
import { describe, expect, it } from 'vitest';

describe('active hitboxes', () => {
  it('falls back to a safe zero-sized hitbox when attack configs are unexpectedly missing', () => {
    const originalAttack1 = ATTACK_HITBOXES.attack_1;

    try {
      (ATTACK_HITBOXES as unknown as Record<string, typeof originalAttack1 | undefined>).attack_1 =
        undefined;

      expect(
        createActiveHitbox('player-1', { x: 10, y: 20 }, 'right', {
          id: 'unknown_attack',
          damage: 12,
          knockbackX: 5,
          knockbackY: 3,
          hitstun: 9,
          type: 'light',
        })
      ).toMatchObject({
        x: 10,
        y: 20,
        width: 0,
        height: 0,
        knockbackX: 5,
      });
    } finally {
      (ATTACK_HITBOXES as unknown as Record<string, typeof originalAttack1 | undefined>).attack_1 =
        originalAttack1;
    }
  });
});
