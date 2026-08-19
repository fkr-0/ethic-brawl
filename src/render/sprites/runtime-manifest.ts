import { normalizeArcadeSpriteManifest, type ArcadeSpriteManifest } from '@arcade/runtime/sprites';
import type { AnimationClip, SpriteManifest } from './types';

const LOGICAL_TICKS_PER_SECOND = 60;

export interface EthicSpriteManifestCompatibilityReport {
  characterId: string;
  metadataFrameCount: number;
  clipCount: number;
  addressedFrameCount: number;
  maxFrameIndex: number;
  variableTimingClipIds: readonly string[];
  errors: readonly string[];
  warnings: readonly string[];
}

function isFiniteNumber(value: number): boolean {
  return Number.isFinite(value);
}

function isFrameIndex(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

function freezeCompatibilityReport(
  report: Omit<
    EthicSpriteManifestCompatibilityReport,
    'variableTimingClipIds' | 'errors' | 'warnings'
  > & {
    variableTimingClipIds: string[];
    errors: string[];
    warnings: string[];
  }
): EthicSpriteManifestCompatibilityReport {
  return Object.freeze({
    ...report,
    variableTimingClipIds: Object.freeze([...report.variableTimingClipIds]),
    errors: Object.freeze([...report.errors]),
    warnings: Object.freeze([...report.warnings]),
  });
}

/**
 * Inspect the richer Ethic Brawl manifest before projecting it into Runtime's
 * renderer-neutral schema. Runtime 1.12 intentionally models one FPS per clip,
 * while Ethic Brawl can author a duration per frame, so variable timing is a
 * compatibility warning rather than an error: the local renderer remains the
 * timing authority and the Runtime projection remains the addressing/semantic
 * validation boundary.
 */
export function inspectEthicSpriteManifestCompatibility(
  manifest: SpriteManifest
): EthicSpriteManifestCompatibilityReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const variableTimingClipIds: string[] = [];
  const addressedFrames = new Set<number>();
  const metadataFrames = new Set<number>();

  if (!manifest.characterId.trim()) errors.push('missing characterId');

  for (const [position, frame] of manifest.frames.entries()) {
    if (!isFrameIndex(frame.index)) {
      errors.push(`frame metadata ${position} has invalid index ${frame.index}`);
      continue;
    }
    if (metadataFrames.has(frame.index)) {
      errors.push(`duplicate frame metadata index ${frame.index}`);
    }
    metadataFrames.add(frame.index);
    if (!isFiniteNumber(frame.pivot.x) || !isFiniteNumber(frame.pivot.y)) {
      errors.push(`frame metadata ${frame.index} has a non-finite pivot`);
    }
  }

  const clipIds = new Set<string>();
  for (const clip of manifest.clips) {
    if (!clip.id.trim()) {
      errors.push('clip has an empty id');
      continue;
    }
    if (clipIds.has(clip.id)) errors.push(`duplicate clip id ${clip.id}`);
    clipIds.add(clip.id);

    if (clip.frames.length === 0) errors.push(`clip ${clip.id} has no frames`);
    const durations = new Set<number>();
    for (const [position, frame] of clip.frames.entries()) {
      if (!isFrameIndex(frame.frameIndex)) {
        errors.push(`clip ${clip.id} frame ${position} has invalid frameIndex ${frame.frameIndex}`);
      } else {
        addressedFrames.add(frame.frameIndex);
      }
      if (!isFiniteNumber(frame.duration) || frame.duration <= 0) {
        errors.push(`clip ${clip.id} frame ${position} has invalid duration ${frame.duration}`);
      } else {
        durations.add(frame.duration);
      }
    }
    if (durations.size > 1) variableTimingClipIds.push(clip.id);
  }

  const assertMappings = <T>(
    mappings: readonly T[],
    kind: string,
    keyOf: (mapping: T) => string,
    clipOf: (mapping: T) => string
  ) => {
    const keys = new Set<string>();
    for (const mapping of mappings) {
      const key = keyOf(mapping);
      const clipId = clipOf(mapping);
      if (keys.has(key)) errors.push(`duplicate ${kind} mapping ${key}`);
      keys.add(key);
      if (!clipIds.has(clipId)) errors.push(`${kind}:${key} references missing clip ${clipId}`);
    }
  };

  assertMappings(
    manifest.stateMappings,
    'state',
    ({ state }) => state,
    ({ clipId }) => clipId
  );
  assertMappings(
    manifest.attackPhaseMappings,
    'attack',
    ({ attackId, phase }) => `${attackId}:${phase}`,
    ({ clipId }) => clipId
  );
  assertMappings(
    manifest.commandSpecialMappings ?? [],
    'command',
    ({ command }) => command,
    ({ clipId }) => clipId
  );

  if (manifest.fallbackClip && !clipIds.has(manifest.fallbackClip)) {
    errors.push(`fallback references missing clip ${manifest.fallbackClip}`);
  }

  if (variableTimingClipIds.length > 0) {
    warnings.push(
      `${variableTimingClipIds.length} clip(s) use per-frame timing that Runtime 1.12 represents as average FPS`
    );
  }

  const allValidFrameIndices = [...metadataFrames, ...addressedFrames];
  return freezeCompatibilityReport({
    characterId: manifest.characterId,
    metadataFrameCount: metadataFrames.size,
    clipCount: clipIds.size,
    addressedFrameCount: addressedFrames.size,
    maxFrameIndex: Math.max(0, ...allValidFrameIndices),
    variableTimingClipIds,
    errors,
    warnings,
  });
}

function assertLocalManifestCompatible(
  manifest: SpriteManifest
): EthicSpriteManifestCompatibilityReport {
  const report = inspectEthicSpriteManifestCompatibility(manifest);
  if (report.errors.length > 0) {
    throw new Error(
      `Invalid sprite manifest ${manifest.characterId || '<unknown>'}: ${report.errors.join('; ')}`
    );
  }
  return report;
}

function toRuntimeAnimation(clip: AnimationClip) {
  const durations = clip.frames.map(({ duration }) => duration);
  const durationSum = durations.reduce((sum, duration) => sum + duration, 0);
  const averageDuration = durationSum / durations.length;
  const variableTiming = new Set(durations).size > 1;
  return {
    frames: clip.frames.length,
    fps: LOGICAL_TICKS_PER_SECOND / averageDuration,
    order: clip.frames.map(({ frameIndex }) => frameIndex),
    loop: clip.mode !== 'once',
    tags: [
      `ethic-brawl:${clip.mode}`,
      variableTiming ? 'ethic-brawl:timing:local-variable' : 'ethic-brawl:timing:uniform',
    ],
  };
}

/**
 * Project Ethic Brawl's legacy per-character manifest into the renderer-neutral
 * ArcadeSpriteManifest schema and run Runtime 1.12's strict normalizer.
 *
 * Ethic Brawl still owns atlas composition and per-frame pivots, so the logical
 * 1x1 grid below exists only to validate frame addressing and animation
 * semantics. Rendering continues to use the richer local atlas metadata.
 */
export function normalizeEthicSpriteManifest(manifest: SpriteManifest): ArcadeSpriteManifest {
  const report = assertLocalManifestCompatible(manifest);

  return normalizeArcadeSpriteManifest({
    version: '1.0.0',
    sheets: [
      {
        id: manifest.characterId,
        file: `${manifest.characterId}.png`,
        frameSize: [1, 1],
        grid: { columns: report.maxFrameIndex + 1, rows: 1 },
        animations: Object.fromEntries(
          manifest.clips.map((clip) => [clip.id, toRuntimeAnimation(clip)])
        ),
        source: {
          adapter: 'ethic-brawl',
          localManifest: true,
          localTimingAuthority: report.variableTimingClipIds.length > 0,
        },
      },
    ],
  });
}

export function assertRuntimeSpriteManifestCompatible<T extends SpriteManifest>(manifest: T): T {
  normalizeEthicSpriteManifest(manifest);
  return manifest;
}
