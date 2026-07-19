/**
 * Sprite integration - connects sprite system to game entities
 */

import { type CharacterId, getCharacterIds } from '@/content/characters/character-data';
import {
  getSpecialsForCharacter,
  type SpecialMoveDefinition,
} from '@/content/specials/special-data';
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
export interface CharacterSpriteDescriptor {
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

export const CHARACTER_SPRITE_PATHS: Record<CharacterId, CharacterSpriteDescriptor> = {
  camus: {
    corePath: 'assets/sprites/roster/camus/source/camus_core_4x4.png',
    extendedPath: 'assets/sprites/roster/camus/source/camus_extended_4x4.png',
    layout: 'roster',
  },
  leibniz: {
    corePath: 'assets/sprites/roster/leibniz/source/leibniz_core_4x4.png',
    extendedPath: 'assets/sprites/roster/leibniz/source/leibniz_extended_4x4.png',
    layout: 'roster',
  },
  machiavelli: {
    corePath: 'assets/sprites/roster/machiavelli/source/machiavelli_core_4x4.png',
    extendedPath: 'assets/sprites/roster/machiavelli/source/machiavelli_extended_4x4.png',
    layout: 'roster',
  },
  diogenes: {
    corePath: 'assets/sprites/roster/diogenes/source/diogenes_core_4x4.png',
    extendedPath: 'assets/sprites/roster/diogenes/source/diogenes_extended_4x4.png',
    layout: 'roster',
  },
  aristotle: {
    corePath: 'assets/sprites/roster/aristotle/source/aristotle_core_4x4.png',
    extendedPath: 'assets/sprites/roster/aristotle/source/aristotle_extended_4x4.png',
    layout: 'roster',
  },
  aquinas: {
    corePath: 'assets/sprites/roster/aquinas/source/aquinas_core_4x4.png',
    extendedPath: 'assets/sprites/roster/aquinas/source/aquinas_extended_4x4.png',
    layout: 'roster',
  },
  anselm: {
    corePath: 'assets/sprites/roster/anselm/source/anselm_core_4x4.png',
    extendedPath: 'assets/sprites/roster/anselm/source/anselm_extended_4x4.png',
    layout: 'roster',
  },
  hegel: {
    corePath: 'assets/sprites/roster/hegel/source/hegel_core_4x4.png',
    extendedPath: 'assets/sprites/roster/hegel/source/hegel_extended_4x4.png',
    layout: 'roster',
  },
  nietzsche: {
    corePath: 'assets/sprites/roster/nietzsche/source/nietzsche_core_4x4.png',
    layout: 'roster',
  },
  foucault: {
    corePath: 'assets/sprites/roster/foucault/source/foucault_core_4x4.png',
    extendedPath: 'assets/sprites/roster/foucault/source/foucault_extended_4x4.png',
    layout: 'roster',
  },
  deleuze_guattari: {
    corePath: 'assets/sprites/roster/deleuze_guattari/source/deleuze_guattari_core_4x4.png',
    extendedPath: 'assets/sprites/roster/deleuze_guattari/source/deleuze_guattari_extended_4x4.png',
    layout: 'roster',
  },
  marx: {
    corePath: 'assets/sprites/roster/marx/source/marx_core_4x4.png',
    extendedPath: 'assets/sprites/roster/marx/source/marx_extended_4x4.png',
    layout: 'roster',
  },
  bakunin: {
    corePath: 'assets/sprites/roster/bakunin/source/bakunin_core_4x4.png',
    extendedPath: 'assets/sprites/roster/bakunin/source/bakunin_extended_4x4.png',
    layout: 'roster',
  },
  schmitt: {
    corePath: 'assets/sprites/roster/schmitt/source/schmitt_core_4x4.png',
    extendedPath: 'assets/sprites/roster/schmitt/source/schmitt_extended_4x4.png',
    layout: 'roster',
  },
  socrates: {
    corePath: 'assets/sprites/roster/socrates/source/socrates_core_4x4.png',
    extendedPath: 'assets/sprites/roster/socrates/source/socrates_extended_4x4.png',
    layout: 'roster',
  },
  kant: {
    corePath: 'assets/sprites/roster/kant/source/kant_core_4x4.png',
    extendedPath: 'assets/sprites/roster/kant/source/kant_extended_4x4.png',
    layout: 'roster',
  },
  kierkegaard: {
    corePath: 'assets/sprites/roster/kierkegaard/source/kierkegaard_core_4x4.png',
    extendedPath: 'assets/sprites/roster/kierkegaard/source/kierkegaard_extended_4x4.png',
    layout: 'roster',
  },
  stirner: {
    corePath: 'assets/sprites/roster/stirner/source/stirner_core_4x4.png',
    extendedPath: 'assets/sprites/roster/stirner/source/stirner_extended_4x4.png',
    layout: 'roster',
  },
};

/**
 * Player-adjustable multiplier applied after each atlas is normalized to a
 * consistent visible fighter height. A value of 1 is the authored default.
 */
let SPRITE_SCALE_FACTOR = 1;

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
  SPRITE_SCALE_FACTOR = Math.max(0.6, Math.min(1.5, scale));
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
  const lightStartup = hasExtended ? [0, 16] : [0, 12];
  const lightActive = hasExtended ? [16, 17] : [12, 13];
  const lightRecovery = hasExtended ? [17, 0] : [13, 0];
  const mediumStartup = hasExtended ? [0, 18] : [0, 13];
  const mediumActive = hasExtended ? [18, 19] : [13, 14];
  const mediumRecovery = hasExtended ? [19, 11, 0] : [14, 11, 0];
  const heavyStartup = hasExtended ? [11, 20] : [11, 14];
  const heavyActive = hasExtended ? [20, 21] : [14, 10];
  const heavyRecovery = hasExtended ? [21, 22, 0] : [10, 11, 0];
  const specialStartup = hasExtended ? [15, 22, 23] : [0, 15];
  const specialActive = hasExtended ? [23, 20, 21] : [15, 14];
  const specialRecovery = hasExtended ? [21, 22, 15, 0] : [14, 15, 0];
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
    createClip('idle', 'Idle Cycle', [0, 1, 2, 3], 'loop', 10),
    createClip('run', 'Walk / Run', [4, 5, 6, 7], 'loop', 5),
    createClip('jump_rise', 'Jump Arc', [8, 9], 'once', 4),
    createClip('air_attack', 'Air Attack', [10], 'once', 4),
    createClip('land', 'Land and Settle', [9, 11, 0], 'once', 3),
    createClip('attack_light_startup', 'Light Wind-Up', lightStartup, 'once', 3),
    createClip('attack_light_active', 'Light Strike', lightActive, 'once', 2),
    createClip('attack_light_recovery', 'Light Recovery', lightRecovery, 'once', 3),
    createClip('attack_medium_startup', 'Medium Wind-Up', mediumStartup, 'once', 3),
    createClip('attack_medium_active', 'Medium Strike', mediumActive, 'once', 2),
    createClip('attack_medium_recovery', 'Medium Recovery', mediumRecovery, 'once', 3),
    createClip('attack_heavy_startup', 'Heavy Wind-Up', heavyStartup, 'once', 4),
    createClip('attack_heavy_active', 'Heavy Strike', heavyActive, 'once', 3),
    createClip('attack_heavy_recovery', 'Heavy Recovery', heavyRecovery, 'once', 4),
    createClip('attack_special_startup', 'Special Invocation', specialStartup, 'once', 4),
    createClip('attack_special_active', 'Special Release', specialActive, 'once', 3),
    createClip('attack_special_recovery', 'Special Recovery', specialRecovery, 'once', 4),
    createClip('attack_1', 'Jab Fallback', [12], 'once', 4),
    createClip('attack_2', 'Swing Fallback', [13], 'once', 4),
    createClip('attack_3', 'Kick Fallback', [14], 'once', 4),
    createClip('special', 'Special Charge Fallback', [15], 'once', 5),
    createClip('guard', 'Guard', [hasExtended ? 24 : 1], 'loop', 4),
    createClip('hitstun', 'Hurt', hasExtended ? [26, 27] : [11], 'once', 3),
    createClip('knockdown', 'Knockdown', hasExtended ? [27, 28] : [10, 11], 'once', 5),
    createClip('getup', 'Get Up', hasExtended ? [28, 29, 30, 0] : [11, 8, 0], 'once', 4),
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
    { attackId: '@light', phase: 'startup', clipId: 'attack_light_startup' },
    { attackId: '@light', phase: 'active', clipId: 'attack_light_active' },
    { attackId: '@light', phase: 'recovery', clipId: 'attack_light_recovery' },
    { attackId: '@medium', phase: 'startup', clipId: 'attack_medium_startup' },
    { attackId: '@medium', phase: 'active', clipId: 'attack_medium_active' },
    { attackId: '@medium', phase: 'recovery', clipId: 'attack_medium_recovery' },
    { attackId: '@heavy', phase: 'startup', clipId: 'attack_heavy_startup' },
    { attackId: '@heavy', phase: 'active', clipId: 'attack_heavy_active' },
    { attackId: '@heavy', phase: 'recovery', clipId: 'attack_heavy_recovery' },
    { attackId: '@special', phase: 'startup', clipId: 'attack_special_startup' },
    { attackId: '@special', phase: 'active', clipId: 'attack_special_active' },
    { attackId: '@special', phase: 'recovery', clipId: 'attack_special_recovery' },
    { attackId: '*', phase: 'startup', clipId: 'attack_1' },
    { attackId: '*', phase: 'active', clipId: 'attack_2' },
    { attackId: '*', phase: 'recovery', clipId: 'attack_3' },
  ];
  manifest.fallbackClip = 'idle';
  return manifest;
}

interface SpecialFramePhases {
  startup: number[];
  active: number[];
  recovery: number[];
}

function getSpecialFramePhases(
  special: SpecialMoveDefinition,
  hasExtended: boolean
): SpecialFramePhases {
  const tags = new Set(special.tags);

  if (!hasExtended) {
    if (tags.has('counter') || tags.has('reflect')) {
      return { startup: [1, 2], active: [13, 12], recovery: [11, 0] };
    }
    if (tags.has('launcher') || tags.has('anti_air')) {
      return { startup: [8, 9], active: [10, 14], recovery: [11, 0] };
    }
    if (tags.has('dash') || tags.has('teleport')) {
      return { startup: [4, 5], active: [6, 12, 13], recovery: [7, 0] };
    }
    if (tags.has('field') || tags.has('trap')) {
      return { startup: [0, 3, 15], active: [15, 14], recovery: [11, 3, 0] };
    }
    return { startup: [0, 15], active: [15, 14], recovery: [14, 11, 0] };
  }

  if (tags.has('counter') || tags.has('reflect')) {
    return { startup: [24, 25], active: [17, 16], recovery: [26, 0] };
  }
  if (tags.has('launcher') || tags.has('anti_air')) {
    return { startup: [8, 9, 20], active: [20, 21, 10], recovery: [22, 11, 0] };
  }
  if (tags.has('dash') || tags.has('teleport')) {
    return { startup: [4, 5, 16], active: [16, 17, 18, 19], recovery: [19, 7, 0] };
  }
  if (tags.has('field') || tags.has('trap')) {
    return { startup: [0, 15, 22], active: [23, 20, 21], recovery: [21, 22, 0] };
  }
  if (special.projectile) {
    return { startup: [0, 15, 22], active: [22, 23, 20], recovery: [21, 11, 0] };
  }
  if (tags.has('buff') || tags.has('armor')) {
    return { startup: [0, 3, 15], active: [15, 23], recovery: [23, 3, 0] };
  }
  return { startup: [0, 15, 22], active: [23, 20, 21], recovery: [21, 22, 0] };
}

function addAuthoredSpecialClips(
  manifest: SpriteManifest,
  characterId: CharacterId,
  hasExtended: boolean
): SpriteManifest {
  const knownClipIds = new Set(manifest.clips.map(({ id }) => id));
  const commandMappings = [...(manifest.commandSpecialMappings ?? [])];

  for (const special of getSpecialsForCharacter(characterId)) {
    const phases = getSpecialFramePhases(special, hasExtended);
    const baseClipId = special.animation.casterClipId;
    const phaseClipIds = {
      startup: `${baseClipId}_startup`,
      active: `${baseClipId}_active`,
      recovery: `${baseClipId}_recovery`,
    } as const;

    if (!knownClipIds.has(baseClipId)) {
      manifest.clips.push(
        createClip(
          baseClipId,
          special.displayName,
          [...phases.startup, ...phases.active, ...phases.recovery],
          'once',
          3
        )
      );
      knownClipIds.add(baseClipId);
    }

    for (const phase of ['startup', 'active', 'recovery'] as const) {
      const clipId = phaseClipIds[phase];
      manifest.clips.push(
        createClip(clipId, `${special.displayName} ${phase}`, phases[phase], 'once', 3)
      );
      manifest.attackPhaseMappings.push({ attackId: special.id, phase, clipId });
    }

    commandMappings.push({ command: special.commandSlot, clipId: baseClipId });
  }

  manifest.commandSpecialMappings = commandMappings;
  return manifest;
}

export function createCharacterSpriteManifest(
  characterId: CharacterId,
  hasExtended = Boolean(CHARACTER_SPRITE_PATHS[characterId].extendedPath)
): SpriteManifest {
  const descriptor = CHARACTER_SPRITE_PATHS[characterId];
  let manifest: SpriteManifest;

  if (descriptor.layout === 'roster') {
    manifest = createRosterManifest(characterId, hasExtended);
    if (characterId === 'diogenes') {
      const diogenesManifest = createDiogenesManifest();
      manifest.clips.push(
        ...diogenesManifest.clips.filter(
          (clip) => clip.id === 'energy_blast' || clip.id === 'boulder_roll'
        )
      );
      if (diogenesManifest.commandSpecialMappings) {
        manifest.commandSpecialMappings = diogenesManifest.commandSpecialMappings;
      }
    }
  } else if (characterId === 'diogenes') {
    manifest = createDiogenesManifest();
  } else {
    manifest = createDefaultManifest(characterId);
  }

  return addAuthoredSpecialClips(manifest, characterId, hasExtended);
}

async function buildCharacterAtlas(
  characterId: CharacterId,
  descriptor: CharacterSpriteDescriptor
): Promise<{ atlas: SpriteAtlas; hasExtended: boolean }> {
  const coreImage = await loadImage(descriptor.corePath);
  const extendedImage = descriptor.extendedPath ? await loadImage(descriptor.extendedPath) : null;
  const normalizeRosterSheet = (
    image: HTMLImageElement | HTMLCanvasElement
  ): HTMLImageElement | HTMLCanvasElement => {
    if (descriptor.layout !== 'roster' || image.width !== 512 || image.height <= 512) {
      return image;
    }
    const normalized = document.createElement('canvas');
    normalized.width = 512;
    normalized.height = 512;
    const normalizedContext = normalized.getContext('2d');
    if (!normalizedContext) return image;
    normalizedContext.drawImage(image, 0, image.height - 512, 512, 512, 0, 0, 512, 512);
    return normalized;
  };
  const coreSheet = normalizeRosterSheet(coreImage);
  const extendedSheet = extendedImage ? normalizeRosterSheet(extendedImage) : null;
  const atlasImage = document.createElement('canvas');
  atlasImage.width = Math.max(coreSheet.width, extendedSheet?.width ?? 0);
  atlasImage.height = coreSheet.height + (extendedSheet?.height ?? 0);
  const atlasContext = atlasImage.getContext('2d');
  if (!atlasContext) {
    throw new Error(`Unable to create sprite atlas canvas for ${characterId}`);
  }
  atlasContext.drawImage(coreSheet, 0, 0);
  if (extendedSheet) {
    atlasContext.drawImage(extendedSheet, 0, coreSheet.height);
  }

  const frames = createAtlasFramesFromGrid(coreSheet, 4, 4, {
    cropPixels: GRID_SPACING,
  });
  if (extendedSheet) {
    frames.push(
      ...createAtlasFramesFromGrid(extendedSheet, 4, 4, {
        indexOffset: 16,
        destinationOffsetY: coreSheet.height,
        cropPixels: GRID_SPACING,
      })
    );
  }

  return {
    atlas: {
      characterId,
      image: atlasImage,
      frames,
      frameWidth: Math.floor(coreSheet.width / 4),
      frameHeight: Math.floor(coreSheet.height / 4),
    },
    hasExtended: Boolean(extendedSheet),
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
    const manifest = createCharacterSpriteManifest(characterId, hasExtended);
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
    const manifest = createCharacterSpriteManifest(characterId, false);
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
