import { createAtlasFramesFromGrid, createDefaultManifest } from '@/render/sprites/sprite-assets';
import { describe, expect, it } from 'vitest';

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

  it('maps the legacy motion blueprint to the correct frames', () => {
    const manifest = createDefaultManifest('camus');
    const clips = new Map(manifest.clips.map((clip) => [clip.id, clip]));

    expect(clips.get('run')?.frames.map(({ frameIndex }) => frameIndex)).toEqual([4, 5, 6, 7]);
    expect(clips.get('jump_rise')?.frames[0]?.frameIndex).toBe(9);
    expect(clips.get('air_attack')?.frames[0]?.frameIndex).toBe(10);
    expect(clips.get('attack_1')?.frames[0]?.frameIndex).toBe(12);
    expect(clips.get('attack_2')?.frames[0]?.frameIndex).toBe(13);
    expect(clips.get('attack_3')?.frames[0]?.frameIndex).toBe(14);
    expect(clips.get('special')?.frames[0]?.frameIndex).toBe(15);
  });
});
