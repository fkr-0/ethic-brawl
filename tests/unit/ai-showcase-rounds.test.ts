import { AI_SHOWCASE_FIGHT_RULES, createFightRuntime } from '@/app/fight-runtime';
import type { CharacterId } from '@/content/characters/character-data';
import { createEmptyPlayerInput } from '@/core/input/input-binding';
import { describe, expect, it } from 'vitest';

const MATCHUPS: ReadonlyArray<readonly [CharacterId, CharacterId]> = [
  ['camus', 'nietzsche'],
  ['machiavelli', 'foucault'],
  ['aristotle', 'bakunin'],
];

describe('AI showcase sprint rounds', () => {
  it.each(MATCHUPS)('%s vs %s resolves a round in the 7–17 second target window', (p1, p2) => {
    const runtime = createFightRuntime();
    const empty = createEmptyPlayerInput();
    runtime.reset(
      { player1: p1, player2: p2 },
      {
        player1AIDifficulty: 'medium',
        player2AIDifficulty: 'medium',
        fightRules: AI_SHOWCASE_FIGHT_RULES,
      }
    );

    let elapsedFrames = 0;
    for (; elapsedFrames < 60 * 18; elapsedFrames++) {
      runtime.update(1000 / 60, empty, empty, true, true);
      if (runtime.getState()?.round.winner !== null) break;
    }

    const elapsedSeconds = elapsedFrames / 60;
    expect(runtime.getState()?.round.winner).not.toBeNull();
    expect(elapsedSeconds).toBeGreaterThanOrEqual(7);
    expect(elapsedSeconds).toBeLessThanOrEqual(17);
  });
});
