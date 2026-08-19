import { SPECIAL_MOVES } from '@/content/specials';
import {
  defineRuntimeSpecialAction,
  stepRuntimeAction,
  tryStartRuntimeAction,
} from '@/runtime/gameplay-actions';
import { describe, expect, it } from 'vitest';

describe('authored special catalog Runtime projection', () => {
  it('projects every authored special into Runtime 1.12 atomic cost/cooldown semantics', () => {
    const specials = Object.values(SPECIAL_MOVES);
    expect(specials.length).toBeGreaterThan(20);

    for (const special of specials) {
      const action = defineRuntimeSpecialAction({
        id: special.id,
        energyCost: special.energyCost,
        cooldown: special.cooldownFrames,
      });
      const resourceMax = Math.max(1, special.energyCost + 25);
      const started = tryStartRuntimeAction(
        {
          ownerId: special.characterId,
          resourceId: 'energy',
          resourceValue: resourceMax,
          resourceMax,
          cooldowns: {},
        },
        action,
        { reason: `special:${special.id}` }
      );

      expect(started.ok, special.id).toBe(true);
      expect(started.resourceValue, special.id).toBe(resourceMax - special.energyCost);
      if (special.cooldownFrames > 0) {
        expect(started.cooldowns[special.id], special.id).toBe(special.cooldownFrames);

        const blocked = tryStartRuntimeAction(
          {
            ownerId: special.characterId,
            resourceId: 'energy',
            resourceValue: started.resourceValue,
            resourceMax,
            cooldowns: started.cooldowns,
          },
          action
        );
        expect(blocked.ok, `${special.id}: cooldown`).toBe(false);
        expect(blocked.reason, `${special.id}: cooldown`).toBe('cooldown');

        const stepped = stepRuntimeAction(
          {
            ownerId: special.characterId,
            resourceId: 'energy',
            resourceValue: started.resourceValue,
            resourceMax,
            cooldowns: started.cooldowns,
          },
          1
        );
        expect(stepped.cooldowns[special.id] ?? 0, `${special.id}: stepped cooldown`).toBe(
          Math.max(0, special.cooldownFrames - 1)
        );
      }
    }
  });
});
