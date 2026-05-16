/**
 * Sprite integration - connects sprite system to game entities
 */

import { type CharacterId, getCharacterIds } from '@/content/characters/character-data';
import { buildCharacterAnimationMap } from './character-anim-map';
import {
  createAtlasFrom4x4Sheet,
  createClip,
  createDefaultManifest,
  loadImage,
} from './sprite-assets';
import type { CharacterAnimationMap, SpriteAtlas, SpriteManifest } from './types';

/**
 * Character sprite asset paths
 */
const CHARACTER_SPRITE_PATHS: Record<CharacterId, string> = {
  camus: '/assets/sprites/camus/source/camus.png',
  leibniz: '/assets/sprites/leibniz/source/leibniz.png',
  machiavelli: '/assets/sprites/machiavelli/source/machiavelli.png',
  diogenes: '/assets/sprites/diogenes/source/diogenes.png',
  aristotle: '/assets/sprites/roster/aristotle/source/aristotle_core_4x4.png',
  aquinas: '/assets/sprites/roster/aquinas/source/aquinas_core_4x4.png',
  anselm: '/assets/sprites/roster/anselm/source/anselm_core_4x4.png',
  hegel: '/assets/sprites/roster/hegel/source/hegel_core_4x4.png',
  nietzsche: '/assets/sprites/roster/nietzsche/source/nietzsche_core_4x4.png',
  foucault: '/assets/sprites/roster/foucault/source/foucault_core_4x4.png',
  deleuze_guattari: '/assets/sprites/roster/deleuze_guattari/source/deleuze_guattari_core_4x4.png',
  marx: '/assets/sprites/roster/marx/source/marx_core_4x4.png',
  bakunin: '/assets/sprites/roster/bakunin/source/bakunin_core_4x4.png',
  schmitt: '/assets/sprites/roster/schmitt/source/schmitt_core_4x4.png',
  socrates: '/assets/sprites/roster/socrates/source/socrates_core_4x4.png',
  kant: '/assets/sprites/roster/kant/source/kant_core_4x4.png',
  kierkegaard: '/assets/sprites/roster/kierkegaard/source/kierkegaard_core_4x4.png',
  stirner: '/assets/sprites/roster/stirner/source/stirner_core_4x4.png',
};

/**
 * Global sprite scale factor - scales down large sprites to fit game scale
 */
let SPRITE_SCALE_FACTOR = 0.4;

/**
 * Grid spacing adjustment - pixels to subtract from frame dimensions to avoid overlap
 */
let GRID_SPACING = 4;

export function setGridSpacing(spacing: number): void {
  GRID_SPACING = spacing;
  console.info(`🔍 Grid spacing: ${GRID_SPACING}px (subtracted from frame dimensions)`);
}

export function getGridSpacing(): number {
  return GRID_SPACING;
}

export function setSpriteScaleFactor(scale: number): void {
  SPRITE_SCALE_FACTOR = scale;
}

export function getSpriteScaleFactor(): number {
  return SPRITE_SCALE_FACTOR;
}

/**
 * Global character animation map cache
 */
const characterAnimationMapCache = new Map<CharacterId, CharacterAnimationMap>();

/**
 * Create Diogenes-specific manifest with command specials
 */
function createDiogenesManifest(): SpriteManifest {
  const manifest = createDefaultManifest('diogenes');

  const energyBlastClip = createClip('energy_blast', 'Energy Blast', [11, 12, 13], 'once', 4);
  const boulderRollClip = createClip('boulder_roll', 'Boulder Roll', [14, 15, 0, 1], 'once', 3);

  manifest.clips.push(energyBlastClip, boulderRollClip);

  manifest.commandSpecialMappings = [
    { command: 'block+left+attack', clipId: 'energy_blast' },
    { command: 'block+right+attack', clipId: 'boulder_roll' },
  ];

  return manifest;
}

/**
 * Create character-specific manifest
 */
function createCharacterManifest(characterId: CharacterId): SpriteManifest {
  if (characterId === 'diogenes') {
    return createDiogenesManifest();
  }
  return createDefaultManifest(characterId);
}

/**
 * Initialize sprite assets for a character
 */
export async function initializeCharacterSprites(
  characterId: CharacterId
): Promise<CharacterAnimationMap> {
  const cached = characterAnimationMapCache.get(characterId);
  if (cached) {
    return cached;
  }

  const spritePath = CHARACTER_SPRITE_PATHS[characterId];
  const manifest = createCharacterManifest(characterId);

  try {
    // Load image first to determine actual dimensions
    const image = await loadImage(spritePath);
    // Calculate frame dimensions from the 4x4 sheet
    const rawFrameWidth = image.width / 4;
    const rawFrameHeight = image.height / 4;

    // Use precise frame dimensions and subtract grid spacing to avoid overlap
    const frameWidth = Math.floor(rawFrameWidth) - GRID_SPACING;
    const frameHeight = Math.floor(rawFrameHeight) - GRID_SPACING;

    // The sprites are too large, so we'll scale them down during rendering
    // Keep the native frame size but apply a scale factor during rendering
    const frames = createAtlasFrom4x4Sheet(image, frameWidth, frameHeight);
    const atlas: SpriteAtlas = {
      characterId,
      image,
      frames,
      frameWidth,
      frameHeight,
    };

    const animMap = buildCharacterAnimationMap(manifest, atlas);
    characterAnimationMapCache.set(characterId, animMap);
    return animMap;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(
      `✗ Failed to load sprite assets for ${characterId} from ${spritePath}: ${errorMessage}`
    );
    console.warn(`  → Falling back to procedural rendering for ${characterId}`);
    const animMap = buildCharacterAnimationMap(manifest, null);
    characterAnimationMapCache.set(characterId, animMap);
    return animMap;
  }
}

/**
 * Get character animation map
 */
export function getCharacterAnimationMap(characterId: CharacterId): CharacterAnimationMap | null {
  return characterAnimationMapCache.get(characterId) ?? null;
}

/**
 * Initialize all character sprites
 */
export async function initializeAllCharacterSprites(): Promise<void> {
  const characterIds = getCharacterIds();

  console.info('🎮 Initializing character sprites...');
  let successCount = 0;
  let fallbackCount = 0;

  await Promise.all(
    characterIds.map(async (id) => {
      try {
        const animMap = await initializeCharacterSprites(id);
        if (animMap.atlas && animMap.atlas.image.width > 0) {
          successCount++;
          console.info(
            `✓ Loaded sprite assets for ${id} (${animMap.atlas.image.width}x${animMap.atlas.image.height})`
          );
        } else {
          fallbackCount++;
          console.warn(`⚠ Using procedural fallback for ${id} (no sprite image)`);
        }
      } catch (error) {
        fallbackCount++;
        console.warn(`✗ Failed to load sprite assets for ${id}:`, error);
      }
    })
  );

  console.info(
    `📊 Sprite loading complete: ${successCount} loaded, ${fallbackCount} using procedural fallback`
  );
}

/**
 * Check if character has sprite assets
 */
export function characterHasSpriteAssets(characterId: CharacterId): boolean {
  const animMap = characterAnimationMapCache.get(characterId);
  return animMap !== undefined && animMap !== null && animMap.atlas !== null;
}
