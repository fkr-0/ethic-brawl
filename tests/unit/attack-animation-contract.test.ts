import { getCharacter } from '@/content/characters/character-data';
import {
  type AttackChoreographyId,
  resolveAttackChoreography,
} from '@/game/fight/attack-presentation-presets';
import type { AttackData } from '@/game/fight/fighter-state';
import { buildCharacterAnimationMap } from '@/render/sprites/character-anim-map';
import {
  getAttackPhaseClip,
  resolveAttackPhaseProgress,
} from '@/render/sprites/character-anim-map';
import type { SpriteManifest } from '@/render/sprites/types';
import { describe, expect, it } from 'vitest';

const BASE_ATTACK: AttackData = {
  id: 'test',
  name: 'Test',
  damage: 10,
  hitstun: 10,
  knockbackX: 2,
  knockbackY: 0,
  range: 60,
  startup: 6,
  active: 4,
  recovery: 10,
  type: 'light',
};

describe('attack animation contract', () => {
  it('maps authored presentation presets to distinct choreography families', () => {
    const expected: Array<[NonNullable<AttackData['presentationPreset']>, AttackChoreographyId]> = [
      ['jab_snap', 'straight'],
      ['rebel_wave', 'sweep'],
      ['heel_drop', 'heel'],
      ['monad_sweep', 'orbit'],
      ['launcher_crack', 'launcher'],
      ['cynic_flurry', 'flurry'],
      ['special_invocation', 'invocation'],
      ['counter_riposte', 'riposte'],
    ];

    for (const [presentationPreset, choreography] of expected) {
      expect(resolveAttackChoreography({ ...BASE_ATTACK, presentationPreset })).toBe(choreography);
    }
    expect(getCharacter('camus').combat?.normalChain?.[2]?.presentationPreset).toBe('heel_drop');
  });

  it('resolves phase progress directly from combat timing', () => {
    expect(resolveAttackPhaseProgress(0, 6, 4, 10)).toBe(0);
    expect(resolveAttackPhaseProgress(5, 6, 4, 10)).toBe(1);
    expect(resolveAttackPhaseProgress(6, 6, 4, 10)).toBe(0);
    expect(resolveAttackPhaseProgress(9, 6, 4, 10)).toBe(1);
    expect(resolveAttackPhaseProgress(10, 6, 4, 10)).toBe(0);
    expect(resolveAttackPhaseProgress(19, 6, 4, 10)).toBe(1);
  });

  it('prefers attack-type clips before the generic fallback mapping', () => {
    const manifest: SpriteManifest = {
      characterId: 'test',
      frames: [],
      clips: [
        { id: 'typed', name: 'Typed', mode: 'once', frames: [{ frameIndex: 1, duration: 2 }] },
        { id: 'generic', name: 'Generic', mode: 'once', frames: [{ frameIndex: 2, duration: 2 }] },
      ],
      stateMappings: [],
      attackPhaseMappings: [
        { attackId: '@heavy', phase: 'active', clipId: 'typed' },
        { attackId: '*', phase: 'active', clipId: 'generic' },
      ],
      fallbackClip: 'generic',
    };
    const animationMap = buildCharacterAnimationMap(manifest, null);

    expect(getAttackPhaseClip(animationMap, 'unknown-heavy', 'active', 'heavy')?.id).toBe('typed');
    expect(getAttackPhaseClip(animationMap, 'unknown-light', 'active', 'light')?.id).toBe(
      'generic'
    );
  });
});
