/**
 * Sprite fallback tracking - disables sprites for characters that fail to render
 */

import type { CharacterId } from '@/content/characters/character-data';

const failedCharacters = new Set<CharacterId>();

/**
 * Mark a character as having failed sprite rendering
 */
export function markSpriteFallback(characterId: CharacterId): void {
  failedCharacters.add(characterId);
  console.warn(`🎨 Sprite fallback enabled for ${characterId} - using procedural rendering`);
}

/**
 * Check if a character should use sprite fallback
 */
export function shouldUseSpriteFallback(characterId: CharacterId): boolean {
  return failedCharacters.has(characterId);
}

/**
 * Clear all fallbacks (for testing/debugging)
 */
export function clearSpriteFallbacks(): void {
  failedCharacters.clear();
}

/**
 * Get list of characters using fallback
 */
export function getFallbackCharacters(): CharacterId[] {
  return Array.from(failedCharacters);
}
