import { describe, expect, it } from 'vitest';
import { createAtlasFramesFromGrid, createDefaultManifest } from '@/render/sprites/sprite-assets';
import {
  CHARACTER_SPRITE_PATHS,
  createCharacterSpriteManifest,
} from '@/render/sprites/sprite-integration';
import {
  applySpriteBackgroundKey,
  calculateNormalizedSpriteScale,
  TARGET_FIGHTER_VISIBLE_HEIGHT,
} from '@/render/sprites/sprite-renderer';

describe('sprite sheet decoding', () => {
  it('divides non-even 4x4 sheets without cumulative frame drift', () => {
    const image = { width: 512, height: 546 } as HTMLCanvasElement;
    const frames = createAtlasFramesFromGrid(image, 4, 4);

    expect(frames).toHaveLength(16);
    expect(frames[0]).toMatchObject({ x: 0, y: 0, frameWidth: 128, frameHeight: 136 });
    expect(frames[15]).toMatchObject({ x: 384, y: 409, frameWidth: 128, frameHeight: 137 });
    expect((frames[15]?.x ?? 0) + (frames[15]?.frameWidth ?? 0)).toBe(512);
    expect((frames[15]?.y ?? 0) + (frames[15]?.frameHeight ?? 0)).toBe(546);
  });

  it('uses Kant hand-curated frame ordering before the legacy combat fallback', () => {
    const descriptor = CHARACTER_SPRITE_PATHS.kant;
    const manifest = createCharacterSpriteManifest('kant');
    const clips = new Map(manifest.clips.map((clip) => [clip.id, clip]));

    expect(descriptor.layout).toBe('animation-v2');
    expect(descriptor.animationV2Profile).toBe('complete');
    expect(manifest.frames).toHaveLength(112 + (descriptor.authoredActionSheets?.length ?? 0) * 16);
    expect(clips.get('idle_v2')?.frames.map(({ frameIndex }) => frameIndex)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(clips.get('walk_backward_v2')?.frames.map(({ frameIndex }) => frameIndex)).toEqual([
      24, 25, 26, 27, 28, 29, 30, 31,
    ]);
    const authoredSpecialIndex =
      descriptor.authoredActionSheets?.findIndex(({ kind }) => kind === 'specials') ?? -1;
    expect(authoredSpecialIndex).toBeGreaterThanOrEqual(0);
    const authoredSpecialOffset = 112 + authoredSpecialIndex * 16;
    expect(
      clips.get('kant_BFA')?.frames.every(({ frameIndex }) => frameIndex >= authoredSpecialOffset)
    ).toBe(true);
  });

  it('uses Nietzsche curated locomotion with a 16-frame legacy combat fallback', () => {
    const descriptor = CHARACTER_SPRITE_PATHS.nietzsche;
    const manifest = createCharacterSpriteManifest('nietzsche');
    const clips = new Map(manifest.clips.map((clip) => [clip.id, clip]));

    expect(descriptor.layout).toBe('animation-v2');
    expect(descriptor.animationV2Profile).toBe('complete');
    expect([
      descriptor.corePath,
      ...(descriptor.additionalPaths ?? []),
      ...(descriptor.extendedPath ? [descriptor.extendedPath] : []),
      ...(descriptor.authoredActionSheets ?? []).map(({ path }) => path),
    ]).toHaveLength(6 + (descriptor.authoredActionSheets?.length ?? 0));
    expect(manifest.frames).toHaveLength(96 + (descriptor.authoredActionSheets?.length ?? 0) * 16);
    expect(clips.get('idle_v2')?.frames.map(({ frameIndex }) => frameIndex)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(clips.get('walk_backward_v2')?.frames.map(({ frameIndex }) => frameIndex)).toEqual([
      24, 25, 26, 27, 28, 29, 30, 31,
    ]);
    const phaseMappings = new Map(
      manifest.attackPhaseMappings.map((mapping) => [
        `${mapping.attackId}:${mapping.phase}`,
        mapping.clipId,
      ])
    );
    expect(phaseMappings.get('@light:active')).toBe('attack_light_v2_active');
    expect(
      clips.get('attack_light_v2_active')?.frames.every(({ frameIndex }) => frameIndex >= 96)
    ).toBe(true);
    const authoredSpecialIndex =
      descriptor.authoredActionSheets?.findIndex(({ kind }) => kind === 'specials') ?? -1;
    expect(authoredSpecialIndex).toBeGreaterThanOrEqual(0);
    const authoredSpecialOffset = 96 + authoredSpecialIndex * 16;
    expect(
      clips
        .get('nietzsche_BFA')
        ?.frames.every(({ frameIndex }) => frameIndex >= authoredSpecialOffset)
    ).toBe(true);
  });

  it('binds authored Animation v2 locomotion while retaining legacy combat frames', () => {
    for (const characterId of [
      'aquinas',
      'aristotle',
      'bakunin',
      'camus',
      'foucault',
      'hegel',
      'kant',
      'marx',
      'machiavelli',
      'socrates',
    ] as const) {
      const descriptor = CHARACTER_SPRITE_PATHS[characterId];
      const manifest = createCharacterSpriteManifest(characterId);
      const clips = new Map(manifest.clips.map((clip) => [clip.id, clip]));
      const states = new Map(
        manifest.stateMappings.map((mapping) => [mapping.state, mapping.clipId])
      );

      expect(descriptor.layout, characterId).toBe('animation-v2');
      expect(
        [
          descriptor.corePath,
          ...(descriptor.additionalPaths ?? []),
          ...(descriptor.extendedPath ? [descriptor.extendedPath] : []),
          ...(descriptor.authoredActionSheets ?? []).map(({ path }) => path),
        ],
        characterId
      ).toHaveLength(7 + (descriptor.authoredActionSheets?.length ?? 0));
      expect(manifest.frames, characterId).toHaveLength(
        112 + (descriptor.authoredActionSheets?.length ?? 0) * 16
      );
      expect(clips.get('idle_v2')?.frames.map(({ frameIndex }) => frameIndex)).toEqual([
        0, 1, 2, 3, 4, 5, 6, 7,
      ]);
      expect(clips.get('walk_forward_v2')?.frames.map(({ frameIndex }) => frameIndex)).toEqual([
        16, 17, 18, 19, 20, 21, 22, 23,
      ]);
      expect(clips.get('run_v2')?.frames.map(({ frameIndex }) => frameIndex)).toEqual([
        36, 37, 38, 39, 40, 41, 42, 43,
      ]);
      expect(clips.get('jump_air_v2')?.frames.map(({ frameIndex }) => frameIndex)).toEqual([
        52, 53, 54, 55,
      ]);
      expect(clips.get('guard_v2')?.frames.map(({ frameIndex }) => frameIndex)).toEqual([
        76, 77, 78, 79,
      ]);
      expect(states.get('walking')).toBe('walk_forward_v2');
      expect(states.get('running')).toBe('run_v2');
      const actionKinds = new Set((descriptor.authoredActionSheets ?? []).map(({ kind }) => kind));
      expect(states.get('blocking')).toBe(
        actionKinds.has('advanced_guard') ? 'guard_hold_v2' : 'guard_v2'
      );
      if (actionKinds.has('normal_attacks')) {
        const phaseMappings = new Map(
          manifest.attackPhaseMappings.map((mapping) => [
            `${mapping.attackId}:${mapping.phase}`,
            mapping.clipId,
          ])
        );
        expect(phaseMappings.get('@light:active')).toBe('attack_light_v2_active');
        expect(states.get('attacking')).toBe('attack_light_v2');
      } else {
        expect(
          clips.get('attack_light_active')?.frames.every(({ frameIndex }) => frameIndex >= 80)
        ).toBe(true);
      }
      expect(clips.get(`${characterId}_BFA`)).toBeDefined();
    }
  });

  it('binds Stirner curated movement and the available authored action sheets', () => {
    const descriptor = CHARACTER_SPRITE_PATHS.stirner;
    const manifest = createCharacterSpriteManifest('stirner');
    const clips = new Map(manifest.clips.map((clip) => [clip.id, clip]));
    const states = new Map(
      manifest.stateMappings.map((mapping) => [mapping.state, mapping.clipId])
    );

    expect(descriptor.layout).toBe('animation-v2');
    expect(descriptor.animationV2Profile).toBe('complete');
    expect([
      descriptor.corePath,
      ...(descriptor.additionalPaths ?? []),
      ...(descriptor.extendedPath ? [descriptor.extendedPath] : []),
      ...(descriptor.authoredActionSheets ?? []).map(({ path }) => path),
    ]).toHaveLength(7 + (descriptor.authoredActionSheets?.length ?? 0));
    expect(manifest.frames).toHaveLength(112 + (descriptor.authoredActionSheets?.length ?? 0) * 16);
    expect(clips.get('idle_v2')?.frames.map(({ frameIndex }) => frameIndex)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(clips.get('walk_forward_v2')?.frames.map(({ frameIndex }) => frameIndex)).toEqual([
      16, 17, 18, 19, 20, 21, 22, 23,
    ]);
    expect(clips.get('run_v2')?.frames.map(({ frameIndex }) => frameIndex)).toEqual([
      36, 37, 38, 39, 40, 41, 42, 43,
    ]);
    expect(clips.get('jump_air_v2')?.frames.map(({ frameIndex }) => frameIndex)).toEqual([
      52, 53, 54, 55,
    ]);
    expect(clips.get('guard_v2')?.frames.map(({ frameIndex }) => frameIndex)).toEqual([
      76, 77, 78, 79,
    ]);
    expect(states.get('idle')).toBe('idle_v2');
    expect(states.get('walking')).toBe('walk_forward_v2');
    expect(states.get('running')).toBe('run_v2');
    expect(states.get('blocking')).toBe('guard_hold_v2');
    expect(states.get('attacking')).toBe('attack_light_v2');
    expect(states.get('victory')).toBe('victory_v2');
    expect(clips.get('attack_light_v2_active')).toBeDefined();
    expect(clips.get('stirner_BFA')).toBeDefined();
  });

  it('binds Leibniz as a complete Animation v2 bank without legacy sheets', () => {
    const descriptor = CHARACTER_SPRITE_PATHS.leibniz;
    const manifest = createCharacterSpriteManifest('leibniz');
    const clips = new Map(manifest.clips.map((clip) => [clip.id, clip]));
    const states = new Map(
      manifest.stateMappings.map((mapping) => [mapping.state, mapping.clipId])
    );

    expect(descriptor.layout).toBe('animation-v2');
    expect(descriptor.extendedPath).toBeUndefined();
    expect(descriptor.authoredActionSheets).toHaveLength(8);
    expect([
      descriptor.corePath,
      ...(descriptor.additionalPaths ?? []),
      ...(descriptor.authoredActionSheets ?? []).map(({ path }) => path),
    ]).toHaveLength(13);
    expect(manifest.frames).toHaveLength(208);
    expect(states.get('idle')).toBe('idle_v2');
    expect(states.get('blocking')).toBe('guard_hold_v2');
    expect(states.get('attacking')).toBe('attack_light_v2');
    expect(states.get('victory')).toBe('victory_v2');
    expect(clips.get('leibniz_BFA')).toBeDefined();
  });

  it('maps the legacy motion blueprint to the correct frames', () => {
    const manifest = createDefaultManifest('camus');
    const clips = new Map(manifest.clips.map((clip) => [clip.id, clip]));

    expect(clips.get('run')?.frames.map(({ frameIndex }) => frameIndex)).toEqual([4, 5, 6, 7]);
    expect(clips.get('run')?.frames.every(({ duration }) => duration === 5)).toBe(true);
    expect(clips.get('jump_rise')?.frames[0]?.frameIndex).toBe(9);
    expect(clips.get('air_attack')?.frames[0]?.frameIndex).toBe(10);
    expect(clips.get('attack_1')?.frames[0]?.frameIndex).toBe(12);
    expect(clips.get('attack_2')?.frames[0]?.frameIndex).toBe(13);
    expect(clips.get('attack_3')?.frames[0]?.frameIndex).toBe(14);
    expect(clips.get('special')?.frames[0]?.frameIndex).toBe(15);
  });

  it('maps legacy hit reactions and typed attack phases to real sprite clips', () => {
    const manifest = createDefaultManifest('leibniz');
    const stateMappings = new Map(
      manifest.stateMappings.map((mapping) => [mapping.state, mapping.clipId])
    );
    const phaseMappings = new Map(
      manifest.attackPhaseMappings.map((mapping) => [
        `${mapping.attackId}:${mapping.phase}`,
        mapping.clipId,
      ])
    );

    expect(stateMappings.get('hitstun')).toBe('hitstun');
    expect(stateMappings.get('knockdown')).toBe('knockdown');
    expect(stateMappings.get('gettingUp')).toBe('getup');
    expect(phaseMappings.get('@light:startup')).toBe('attack_light_startup');
    expect(phaseMappings.get('@medium:active')).toBe('attack_medium_active');
    expect(phaseMappings.get('@heavy:recovery')).toBe('attack_heavy_recovery');
    expect(phaseMappings.get('@special:active')).toBe('attack_special_active');
  });

  it('removes an edge-connected dark gradient without erasing a light interior sprite', () => {
    const width = 7;
    const height = 7;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const offset = (y * width + x) * 4;
        const isSprite = x >= 2 && x <= 4 && y >= 1 && y <= 5;
        const background = 18 + y * 7;
        data[offset] = isSprite ? 238 : background;
        data[offset + 1] = isSprite ? 226 : background + 2;
        data[offset + 2] = isSprite ? 190 : background + 10;
        data[offset + 3] = 255;
      }
    }
    const imageData = { data, width, height } as ImageData;

    applySpriteBackgroundKey(imageData, {
      enabled: true,
      mode: 'adaptive-edge',
      threshold: 46,
      r: 255,
      g: 255,
      b: 255,
    });

    const alphaAt = (x: number, y: number) => data[(y * width + x) * 4 + 3];
    expect(alphaAt(0, 3)).toBe(0);
    expect(alphaAt(6, 3)).toBe(0);
    expect(alphaAt(3, 3)).toBe(255);
    expect(alphaAt(3, 1)).toBe(255);
  });

  it('normalizes differently-sized sprite sheets to the same readable fighter height', () => {
    const middleLaneDepth = 0.925;
    const regularScale = calculateNormalizedSpriteScale(118, middleLaneDepth);
    const smallSheetScale = calculateNormalizedSpriteScale(69, middleLaneDepth);

    expect(118 * regularScale).toBeCloseTo(TARGET_FIGHTER_VISIBLE_HEIGHT * middleLaneDepth, 5);
    expect(69 * smallSheetScale).toBeCloseTo(TARGET_FIGHTER_VISIBLE_HEIGHT * middleLaneDepth, 5);
    expect(smallSheetScale).toBeGreaterThan(regularScale);
  });
});
