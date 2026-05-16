import {
  CHARACTERS,
  createCharacterAttack,
  getCharacterNormalChain,
  getRandomQuote,
} from '@/content/characters/character-data';
import { describe, expect, it } from 'vitest';

describe('character definitions', () => {
  it('provides normalized movement profiles for every character', () => {
    for (const character of Object.values(CHARACTERS)) {
      expect(character.movement.walkMultiplier).toBeGreaterThan(0);
      expect(character.movement.runMultiplier).toBeGreaterThan(0);
      expect(character.movement.accelerationMultiplier).toBeGreaterThan(0);
      expect(character.movement.decelerationMultiplier).toBeGreaterThan(0);
      expect(character.movement.jumpMultiplier).toBeGreaterThan(0);
      expect(character.movement.airControlMultiplier).toBeGreaterThan(0);
      expect(character.movement.weight).toBeGreaterThan(0);
    }
  });

  it('returns an empty string when a quote bucket is unexpectedly empty', () => {
    const originalQuotes = [...CHARACTERS.camus.quotes.intro];

    try {
      CHARACTERS.camus.quotes.intro.length = 0;
      expect(getRandomQuote('camus', 'intro')).toBe('');
    } finally {
      CHARACTERS.camus.quotes.intro.splice(0, 0, ...originalQuotes);
    }
  });

  it('provides authored normal chains instead of the shared default chain when available', () => {
    const camusChain = getCharacterNormalChain(CHARACTERS.camus);
    const machiavelliChain = getCharacterNormalChain(CHARACTERS.machiavelli);
    const camusOpener = createCharacterAttack(CHARACTERS.camus, 0);
    const machiavelliFinisher = createCharacterAttack(CHARACTERS.machiavelli, 2);

    expect(camusChain.map((attack) => attack.name)).toEqual([
      'Absurd Jab',
      'Rebel Backfist',
      'Sisyphus Heel',
    ]);
    expect(machiavelliChain.map((attack) => attack.name)).toEqual([
      'Court Feint',
      "Prince's Edict",
      'Palace Coup',
    ]);
    expect(camusOpener?.presentationPreset).toBe('jab_snap');
    expect(machiavelliFinisher?.moveClassPreset).toBe('launcher');
  });
});
