/**
 * Sprite integration - connects sprite system to game entities
 */

import { type CharacterId, getCharacterIds } from '@/content/characters/character-data';
import { buildCharacterAnimationMap } from './character-anim-map';
import {
  createAtlasFramesFromGrid,
  createClip,
  createDefaultManifest,
  loadImage,
} from './sprite-assets';
import type { CharacterAnimationMap, SpriteAtlas, SpriteManifest } from './types';

/**
 * Character sprite asset paths
 */
interface CharacterSpriteDescriptor {
  corePath: string;
  extendedPath?: string;
  layout: 'legacy' | 'roster';
}

export interface SpriteLoadReport {
  requested: number;
  loaded: CharacterId[];
  failed: Array<{ characterId: CharacterId; reason: string }>;
}

export function getSpriteLoadReport(): SpriteLoadReport {
  const characterIds = getCharacterIds();
  return {
    requested: characterIds.length,
    loaded: characterIds.filter((id) => characterHasSpriteAssets(id)),
    failed: characterIds.flatMap((characterId) => {
      const reason = spriteLoadFailures.get(characterId);
      return reason ? [{ characterId, reason }] : [];
    }),
  };
}

const CHARACTER_SPRITE_PATHS: Record<CharacterId, CharacterSpriteDescriptor> = {
  camus: { corePath: '/assets/sprites/camus/source/camus.png', layout: 'legacy' },
  leibniz: { corePath: '/assets/sprites/leibniz/source/leibniz.png', layout: 'legacy' },
  machiavelli: {
    corePath: '/assets/sprites/machiavelli/source/machiavelli.png',
    layout: 'legacy',
  },
  diogenes: { corePath: '/assets/sprites/diogenes/source/diogenes.png', layout: 'legacy' },
  aristotle: {
    corePath: '/assets/sprites/roster/aristotle/source/aristotle_core_4x4.png',
    extendedPath: '/assets/sprites/roster/aristotle/source/aristotle_extended_4x4.png',
    layout: 'roster',
  },
  aquinas: {
    corePath: '/assets/sprites/roster/aquinas/source/aquinas_core_4x4.png',
    extendedPath: '/assets/sprites/roster/aquinas/source/aquinas_extended_4x4.png',
    layout: 'roster',
  },
  anselm: {
    corePath: '/assets/sprites/roster/anselm/source/anselm_core_4x4.png',
    extendedPath: '/assets/sprites/roster/anselm/source/anselm_extended_4x4.png',
    layout: 'roster',
  },
  hegel: {
    corePath: '/assets/sprites/roster/hegel/source/hegel_core_4x4.png',
    extendedPath: '/assets/sprites/roster/hegel/source/hegel_extended_4x4.png',
    layout: 'roster',
  },
  nietzsche: {
    corePath: '/assets/sprites/roster/nietzsche/source/nietzsche_core_4x4.png',
    layout: 'roster',
  },
  foucault: {
    corePath: '/assets/sprites/roster/foucault/source/foucault_core_4x4.png',
    extendedPath: '/assets/sprites/roster/foucault/source/foucault_extended_4x4.png',
    layout: 'roster',
  },
  deleuze_guattari: {
    corePath: '/assets/sprites/roster/deleuze_guattari/source/deleuze_guattari_core_4x4.png',
    layout: 'roster',
  },
  marx: {
    corePath: '/assets/sprites/roster/marx/source/marx_core_4x4.png',
    extendedPath: '/assets/sprites/roster/marx/source/marx_extended_4x4.png',
    layout: 'roster',
  },
  bakunin: {
    corePath: '/assets/sprites/roster/bakunin/source/bakunin_core_4x4.png',
    extendedPath: '/assets/sprites/roster/bakunin/source/bakunin_extended_4x4.png',
    layout: 'roster',
  },
  schmitt: {
    corePath: '/assets/sprites/roster/schmitt/source/schmitt_core_4x4.png',
    extendedPath: '/assets/sprites/roster/schmitt/source/schmitt_extended_4x4.png',
    layout: 'roster',
  },
  socrates: {
    corePath: '/assets/sprites/roster/socrates/source/socrates_core_4x4.png',
    extendedPath: '/assets/sprites/roster/socrates/source/socrates_extended_4x4.png',
    layout: 'roster',
  },
  kant: {
    corePath: '/assets/sprites/roster/kant/source/kant_core_4x4.png',
    extendedPath: '/assets/sprites/roster/kant/source/kant_extended_4x4.png',
    layout: 'roster',
  },
  kierkegaard: {
    corePath: '/assets/sprites/roster/kierkegaard/source/kierkegaard_core_4x4.png',
    layout: 'roster',
  },
  stirner: {
    corePath: '/assets/sprites/roster/stirner/source/stirner_core_4x4.png',
    layout: 'roster',
  },
};

/**
 * Global sprite scale factor - scales down large sprites to fit game scale
 */
let SPRITE_SCALE_FACTOR = 0.4;

/**
 * Grid spacing adjustment - pixels to subtract from frame dimensions to avoid overlap
 */
let GRID_SPACING = 0;

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
const spriteLoadFailures = new Map<CharacterId, string>();

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
function createRosterManifest(characterId: CharacterId, hasExtended: boolean): SpriteManifest {
  const manifest = createDefaultManifest(characterId);
  const runLabels = ['run_1', 'run_2', 'run_3', 'run_4'] as const;
  manifest.frames = Array.from({ length: hasExtended ? 32 : 16 }, (_, index) => ({
    index,
    label:
      index < 4
        ? 'idle'
        : index < 8
          ? (runLabels[index - 4] ?? 'run_1')
          : index === 9 || index === 21
            ? 'jump_rise'
            : index === 10 || index === 22
              ? 'air_attack_or_air_kick'
              : index === 12 || index === 16 || index === 17
                ? 'attack_1'
                : index === 13 || index === 18
                  ? 'attack_2'
                  : index === 14
                    ? 'attack_3'
                    : index === 24 || index === 25
                      ? 'guard'
                      : index === 31
                        ? 'victory_or_quote_pose'
                        : 'land',
    pivot: { x: 0.5, y: 1 },
    duration: 4,
  }));
  manifest.clips = [
    createClip('idle', 'Idle Cycle', [0, 1, 2, 3], 'loop', 7),
    createClip('run', 'Walk / Run', [4, 5, 6, 7], 'loop', 3),
    createClip('jump_rise', 'Jump', [8, 9], 'once', 4),
    createClip('air_attack', 'Air Attack', [10], 'once', 4),
    createClip('land', 'Land', [11], 'once', 4),
    createClip('attack_1', 'Jab', [12], 'once', 4),
    createClip('attack_2', 'Swing', [13], 'once', 4),
    createClip('attack_3', 'Kick', [14], 'once', 4),
    createClip('special', 'Special Charge', [15], 'once', 5),
    createClip('guard', 'Guard', [hasExtended ? 24 : 1], 'loop', 4),
    createClip('hitstun', 'Hurt', hasExtended ? [26, 27] : [11], 'once', 3),
    createClip('knockdown', 'Knockdown', [hasExtended ? 28 : 11], 'once', 5),
    createClip('getup', 'Get Up', hasExtended ? [29, 30] : [11], 'once', 4),
    createClip('victory', 'Victory', [hasExtended ? 31 : 3], 'loop', 8),
  ];
  manifest.stateMappings = [
    { state: 'idle', clipId: 'idle' },
    { state: 'walking', clipId: 'run' },
    { state: 'running', clipId: 'run' },
    { state: 'jumping', clipId: 'jump_rise' },
    { state: 'falling', clipId: 'jump_rise' },
    { state: 'landing', clipId: 'land' },
    { state: 'crouching', clipId: 'land' },
    { state: 'blocking', clipId: 'guard' },
    { state: 'attacking', clipId: 'attack_1' },
    { state: 'special', clipId: 'special' },
    { state: 'hitstun', clipId: 'hitstun' },
    { state: 'knockdown', clipId: 'knockdown' },
    { state: 'gettingUp', clipId: 'getup' },
    { state: 'victory', clipId: 'victory' },
    { state: 'defeat', clipId: 'knockdown' },
  ];
  manifest.attackPhaseMappings = [
    { attackId: '*', phase: 'startup', clipId: 'attack_1' },
    { attackId: '*', phase: 'active', clipId: 'attack_2' },
    { attackId: '*', phase: 'recovery', clipId: 'attack_3' },
  ];
  manifest.fallbackClip = 'idle';
  return manifest;
}

function createCharacterManifest(
  characterId: CharacterId,
  descriptor: CharacterSpriteDescriptor,
  hasExtended: boolean
): SpriteManifest {
  if (characterId === 'diogenes') {
    return createDiogenesManifest();
  }
  if (descriptor.layout === 'roster') {
    return createRosterManifest(characterId, hasExtended);
  }
  return createDefaultManifest(characterId);
}

async function buildCharacterAtlas(
  characterId: CharacterId,
  descriptor: CharacterSpriteDescriptor
): Promise<{ atlas: SpriteAtlas; hasExtended: boolean }> {
  const coreImage = await loadImage(descriptor.corePath);
  const extendedImage = descriptor.extendedPath ? await loadImage(descriptor.extendedPath) : null;
  const atlasImage = document.createElement('canvas');
  atlasImage.width = Math.max(coreImage.width, extendedImage?.width ?? 0);
  atlasImage.height = coreImage.height + (extendedImage?.height ?? 0);
  const atlasContext = atlasImage.getContext('2d');
  if (!atlasContext) {
    throw new Error(`Unable to create sprite atlas canvas for ${characterId}`);
  }
  atlasContext.drawImage(coreImage, 0, 0);
  if (extendedImage) {
    atlasContext.drawImage(extendedImage, 0, coreImage.height);
  }

  const frames = createAtlasFramesFromGrid(coreImage, 4, 4, {
    cropPixels: GRID_SPACING,
  });
  if (extendedImage) {
    frames.push(
      ...createAtlasFramesFromGrid(extendedImage, 4, 4, {
        indexOffset: 16,
        destinationOffsetY: coreImage.height,
        cropPixels: GRID_SPACING,
      })
    );
  }

  return {
    atlas: {
      characterId,
      image: atlasImage,
      frames,
      frameWidth: Math.floor(coreImage.width / 4),
      frameHeight: Math.floor(coreImage.height / 4),
    },
    hasExtended: Boolean(extendedImage),
  };
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

  const descriptor = CHARACTER_SPRITE_PATHS[characterId];

  try {
    const { atlas, hasExtended } = await buildCharacterAtlas(characterId, descriptor);
    const manifest = createCharacterManifest(characterId, descriptor, hasExtended);
    const animMap = buildCharacterAnimationMap(manifest, atlas);
    characterAnimationMapCache.set(characterId, animMap);
    spriteLoadFailures.delete(characterId);
    return animMap;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(
      `✗ Failed to load sprite assets for ${characterId} from ${descriptor.corePath}: ${errorMessage}`
    );
    console.warn(`  → Falling back to procedural rendering for ${characterId}`);
    spriteLoadFailures.set(characterId, errorMessage);
    const manifest = createCharacterManifest(characterId, descriptor, false);
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
