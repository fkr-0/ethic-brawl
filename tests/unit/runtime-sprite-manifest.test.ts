import { getCharacterIds } from '@/content/characters/character-data';
import { buildCharacterAnimationMap } from '@/render/sprites/character-anim-map';
import { createCharacterSpriteManifest } from '@/render/sprites/sprite-integration';
import {
  inspectEthicSpriteManifestCompatibility,
  normalizeEthicSpriteManifest,
} from '@/render/sprites/runtime-manifest';
import { resolveArcadeSpriteFrame } from '@arcade/runtime/sprites';
import { describe, expect, it } from 'vitest';

describe('Arcade Runtime 1.12 sprite-manifest contract', () => {
  it('normalizes every authored character manifest through the strict runtime schema', () => {
    for (const characterId of getCharacterIds()) {
      const localManifest = createCharacterSpriteManifest(characterId);
      const compatibility = inspectEthicSpriteManifestCompatibility(localManifest);
      const runtimeManifest = normalizeEthicSpriteManifest(localManifest);

      expect(compatibility.errors, `${characterId} compatibility errors`).toEqual([]);
      expect(compatibility.clipCount).toBe(localManifest.clips.length);
      expect(compatibility.addressedFrameCount).toBeGreaterThan(0);
      expect(runtimeManifest.version).toBe('1.0.0');
      expect(runtimeManifest.sheets).toHaveLength(1);
      expect(runtimeManifest.sheets[0]?.id).toBe(characterId);
      expect(Object.keys(runtimeManifest.sheets[0]?.animations ?? {})).toHaveLength(
        localManifest.clips.length
      );

      const animationMap = buildCharacterAnimationMap(localManifest);
      expect(animationMap.runtimeManifest).toBeDefined();
      expect(animationMap.runtimeSheet.id).toBe(characterId);
      for (const clip of localManifest.clips) {
        for (const [localFrame, clipFrame] of clip.frames.entries()) {
          const address = resolveArcadeSpriteFrame(animationMap.runtimeSheet, clip.id, localFrame);
          expect(address, `${characterId}/${clip.id}[${localFrame}]`).not.toBeNull();
          expect(address?.absoluteFrame).toBe(clipFrame.frameIndex);
        }
      }
    }
  });

  it('rejects local mapping drift before handing the projection to the runtime', () => {
    const manifest = createCharacterSpriteManifest('kant');
    expect(() =>
      normalizeEthicSpriteManifest({
        ...manifest,
        fallbackClip: '__missing_clip__',
      })
    ).toThrow(/fallback references missing clip/);
  });

  it('rejects malformed local frame semantics before Runtime normalization', () => {
    const manifest = createCharacterSpriteManifest('kant');
    const clip = manifest.clips.find(({ frames }) => frames.length > 0);
    expect(clip).toBeDefined();
    if (!clip) return;

    const brokenClip = {
      ...clip,
      frames: [{ frameIndex: -1, duration: 0 }],
    };
    const broken = {
      ...manifest,
      clips: manifest.clips.map((candidate) => (candidate.id === clip.id ? brokenClip : candidate)),
    };

    const report = inspectEthicSpriteManifestCompatibility(broken);
    expect(report.errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('invalid frameIndex -1'),
        expect.stringContaining('invalid duration 0'),
      ])
    );
    expect(() => normalizeEthicSpriteManifest(broken)).toThrow(/invalid frameIndex -1/);
  });

  it('rejects ambiguous duplicate mappings', () => {
    const manifest = createCharacterSpriteManifest('kant');
    const first = manifest.stateMappings[0];
    expect(first).toBeDefined();
    if (!first) return;

    expect(() =>
      normalizeEthicSpriteManifest({
        ...manifest,
        stateMappings: [...manifest.stateMappings, first],
      })
    ).toThrow(/duplicate state mapping/);
  });

  it('records lossy per-frame timing explicitly while preserving average Runtime FPS', () => {
    const manifest = createCharacterSpriteManifest('kant');
    const clip = manifest.clips.find(({ frames }) => frames.length >= 2);
    expect(clip).toBeDefined();
    if (!clip) return;

    const variableFrames = clip.frames.map((frame, index) => ({
      ...frame,
      duration: index % 2 === 0 ? 2 : 6,
    }));
    const variable = {
      ...manifest,
      clips: manifest.clips.map((candidate) =>
        candidate.id === clip.id ? { ...candidate, frames: variableFrames } : candidate
      ),
    };

    const report = inspectEthicSpriteManifestCompatibility(variable);
    expect(report.errors).toEqual([]);
    expect(report.variableTimingClipIds).toContain(clip.id);
    expect(report.warnings[0]).toMatch(/per-frame timing/);

    const runtimeManifest = normalizeEthicSpriteManifest(variable);
    const runtimeClip = runtimeManifest.sheets[0]?.animations[clip.id];
    const averageDuration =
      variableFrames.reduce((sum, frame) => sum + frame.duration, 0) / variableFrames.length;
    expect(runtimeClip?.fps).toBeCloseTo(60 / averageDuration);
    expect(runtimeClip?.tags).toContain('ethic-brawl:timing:local-variable');
  });
});
