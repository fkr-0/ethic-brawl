/**
 * Command special detection and routing
 */

import type { PlayerInput } from '@/game';
import { getCommandSpecialClip } from './character-anim-map';
import { getCharacterAnimationMap } from './sprite-integration';

/**
 * Command special pattern
 */
export interface CommandSpecialPattern {
  name: string;
  block: boolean;
  direction: 'left' | 'right' | 'neutral' | 'up' | 'down';
  attack: boolean;
}

/**
 * Detect command special from input
 */
export function detectCommandSpecial(input: PlayerInput, isBlocking: boolean): string | null {
  if (!input.attackPressed || !isBlocking) {
    return null;
  }

  if (input.moveLeft) {
    return 'block+left+attack';
  }
  if (input.moveRight) {
    return 'block+right+attack';
  }
  if (input.moveUp) {
    return 'block+up+attack';
  }
  if (input.moveDown) {
    return 'block+down+attack';
  }

  return 'block+neutral+attack';
}

/**
 * Get command special clip for character
 */
export function getCommandSpecialClipForCharacter(
  characterId: string,
  input: PlayerInput,
  isBlocking: boolean
): ReturnType<typeof getCommandSpecialClip> | null {
  const command = detectCommandSpecial(input, isBlocking);
  if (!command) {
    return null;
  }

  const animMap = getCharacterAnimationMap(
    characterId as 'camus' | 'diogenes' | 'machiavelli' | 'leibniz'
  );
  if (!animMap) {
    return null;
  }

  return getCommandSpecialClip(animMap, command);
}

/**
 * Check if character has command special mappings
 */
export function characterHasCommandSpecials(characterId: string): boolean {
  const animMap = getCharacterAnimationMap(
    characterId as 'camus' | 'diogenes' | 'machiavelli' | 'leibniz'
  );
  if (!animMap) {
    return false;
  }

  return animMap.commandSpecialToClip.size > 0;
}
