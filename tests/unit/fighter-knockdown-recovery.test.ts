import { getCharacter } from '@/content/characters/character-data';
import { Fighter } from '@/game/fight/fighter';
import { FRAME_DATA } from '@/game/fight/fighter-state';
import { describe, expect, it } from 'vitest';

describe('fighter knockdown recovery', () => {
  it('protects knockdown and get-up recovery from immediate re-hits', () => {
    const fighter = new Fighter('p1', 'camus', 1, getCharacter('camus'), 300, 1);

    fighter.takeDamage(1, 0, 0, 1, 0.95, { knockdown: true });
    fighter.update(1000 / 60, 1);

    expect(fighter.state).toBe('knockdown');
    expect(fighter.invulnerableFrames).toBe(
      FRAME_DATA.KNOCKDOWN_DURATION + FRAME_DATA.GET_UP_DURATION
    );

    for (let frame = 2; frame <= FRAME_DATA.KNOCKDOWN_DURATION + 1; frame++) {
      fighter.update(1000 / 60, frame);
    }
    expect(fighter.state).toBe('gettingUp');
    expect(fighter.invulnerableFrames).toBeGreaterThan(0);

    for (
      let frame = FRAME_DATA.KNOCKDOWN_DURATION + 2;
      frame <= FRAME_DATA.KNOCKDOWN_DURATION + FRAME_DATA.GET_UP_DURATION + 1;
      frame++
    ) {
      fighter.update(1000 / 60, frame);
    }
    expect(fighter.state).toBe('idle');
    expect(fighter.invulnerableFrames).toBe(0);
  });
});
