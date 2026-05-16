/**
 * Character animation map - state/phase to clip resolution
 */

import { getAtlas, getManifest } from './sprite-assets';
import type {
  AnimationClip,
  AttackPhase,
  CharacterAnimationMap,
  FighterStateName,
  SpriteAtlas,
  SpriteManifest,
} from './types';

/**
 * Build character animation map from manifest and atlas
 */
export function buildCharacterAnimationMap(
  manifest: SpriteManifest,
  atlas: SpriteAtlas | null = null
): CharacterAnimationMap {
  const clipMap = new Map<string, AnimationClip>();
  for (const clip of manifest.clips) {
    clipMap.set(clip.id, clip);
  }

  const stateToClip = new Map<FighterStateName, AnimationClip>();
  for (const mapping of manifest.stateMappings) {
    const clip = clipMap.get(mapping.clipId);
    if (clip) {
      stateToClip.set(mapping.state, clip);
    }
  }

  const attackPhaseToClip = new Map<string, Map<AttackPhase, AnimationClip>>();
  for (const mapping of manifest.attackPhaseMappings) {
    const clip = clipMap.get(mapping.clipId);
    if (clip) {
      if (!attackPhaseToClip.has(mapping.attackId)) {
        attackPhaseToClip.set(mapping.attackId, new Map());
      }
      attackPhaseToClip.get(mapping.attackId)?.set(mapping.phase, clip);
    }
  }

  const commandSpecialToClip = new Map<string, AnimationClip>();
  for (const mapping of manifest.commandSpecialMappings ?? []) {
    const clip = clipMap.get(mapping.clipId);
    if (clip) {
      commandSpecialToClip.set(mapping.command, clip);
    }
  }

  const fallbackClip = manifest.fallbackClip ? (clipMap.get(manifest.fallbackClip) ?? null) : null;

  return {
    characterId: manifest.characterId,
    manifest,
    atlas,
    stateToClip,
    attackPhaseToClip,
    commandSpecialToClip,
    fallbackClip,
  };
}

/**
 * Load character animation map by character ID
 */
export async function loadCharacterAnimationMap(
  characterId: string
): Promise<CharacterAnimationMap | null> {
  const manifest = getManifest(characterId);
  const atlas = getAtlas(characterId);

  if (!manifest && !atlas) {
    return null;
  }

  const effectiveManifest = manifest ?? {
    characterId,
    frames: [],
    clips: [],
    stateMappings: [],
    attackPhaseMappings: [],
  };

  return buildCharacterAnimationMap(effectiveManifest, atlas ?? null);
}

/**
 * Get clip for fighter state
 */
export function getStateClip(
  animMap: CharacterAnimationMap,
  state: FighterStateName
): AnimationClip | null {
  return animMap.stateToClip.get(state) ?? animMap.fallbackClip;
}

/**
 * Get clip for attack phase
 */
export function getAttackPhaseClip(
  animMap: CharacterAnimationMap,
  attackId: string,
  phase: AttackPhase
): AnimationClip | null {
  const phaseMap = animMap.attackPhaseToClip.get(attackId);
  if (!phaseMap) {
    const wildcardMap = animMap.attackPhaseToClip.get('*');
    return wildcardMap?.get(phase) ?? animMap.fallbackClip;
  }

  return phaseMap.get(phase) ?? animMap.fallbackClip;
}

/**
 * Get clip for command special
 */
export function getCommandSpecialClip(
  animMap: CharacterAnimationMap,
  command: string
): AnimationClip | null {
  return animMap.commandSpecialToClip.get(command) ?? animMap.fallbackClip;
}

/**
 * Check if character has sprite assets loaded
 */
export function hasSpriteAssets(animMap: CharacterAnimationMap): boolean {
  return animMap.atlas !== null && animMap.manifest.frames.length > 0;
}

/**
 * Get frame metadata by index
 */
export function getFrameMetadata(
  animMap: CharacterAnimationMap,
  frameIndex: number
): { pivot: { x: number; y: number } } | null {
  const frame = animMap.manifest.frames[frameIndex];
  if (!frame) {
    return null;
  }

  return {
    pivot: frame.pivot,
  };
}

/**
 * Resolve attack phase from attack frame and attack data
 */
export function resolveAttackPhase(
  attackFrame: number,
  startup: number,
  active: number,
  _recovery: number
): AttackPhase {
  if (attackFrame < startup) {
    return 'startup';
  }
  if (attackFrame < startup + active) {
    return 'active';
  }
  return 'recovery';
}
