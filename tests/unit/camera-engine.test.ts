import { describe, expect, it } from 'vitest';
import { cameraFollowTargets, createCamera, shakeCamera, updateCamera } from '@/render/camera';

describe('shared camera rig facade', () => {
  it('preserves Ethic target averaging, frame blending and legacy shake aliases', () => {
    const camera = createCamera({ x: 100, y: 100, zoom: 1 });
    cameraFollowTargets(camera, [
      { x: 200, y: 120 },
      { x: 400, y: 180 },
    ]);
    shakeCamera(camera, 8);
    updateCamera(camera, {
      minX: 0,
      maxX: 960,
      followSpeed: 0.1,
      shakeDecay: 0.5,
      zoom: 1.5,
    });

    expect(camera.x).toBe(120);
    expect(camera.y).toBe(105);
    expect(camera.zoom).toBeCloseTo(1.08);
    expect(camera.shake).toBe(4);
    expect(camera.shakeOffsetX).toBe(camera.shakeX);
    expect(camera.shakeOffsetY).toBe(camera.shakeY);
  });
});
