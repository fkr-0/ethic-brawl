import { getCharacter, createCharacterAttack } from '@/content/characters/character-data';
import { createActiveHitbox } from '@/game/fight/hitbox';
import { describe, expect, it } from 'vitest';

describe('authored attack hitbox fallback', () => {
  it('uses attack-class geometry instead of collapsing every authored id to the light jab', () => {
    const foucault = getCharacter('foucault');
    const light = createCharacterAttack(foucault, 0);
    const medium = createCharacterAttack(foucault, 1);
    const heavy = createCharacterAttack(foucault, 2);
    if (!light || !medium || !heavy) throw new Error('missing Foucault normal chain');

    const lightBox = createActiveHitbox('p1', { x: 0, y: 0 }, 'right', light);
    const mediumBox = createActiveHitbox('p1', { x: 0, y: 0 }, 'right', medium);
    const heavyBox = createActiveHitbox('p1', { x: 0, y: 0 }, 'right', heavy);

    expect(lightBox.height).toBe(30);
    expect(mediumBox.height).toBe(25);
    expect(heavyBox.height).toBe(40);
    expect(mediumBox.x + mediumBox.width).toBeGreaterThanOrEqual(medium.range);
    expect(heavyBox.x + heavyBox.width).toBeGreaterThanOrEqual(heavy.range);
  });

  it('mirrors range-aware geometry without changing its reach', () => {
    const attack = createCharacterAttack(getCharacter('foucault'), 1);
    if (!attack) throw new Error('missing Foucault medium');
    const right = createActiveHitbox('p1', { x: 100, y: 0 }, 'right', attack);
    const left = createActiveHitbox('p1', { x: 100, y: 0 }, 'left', attack);

    expect(right.width).toBe(left.width);
    expect(right.x - 100).toBe(-(left.x + left.width - 100));
  });
});
