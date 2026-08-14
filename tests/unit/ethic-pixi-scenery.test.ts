import { createEthicPixiScenery } from '@/render/ethic-pixi-scenery';
import { resolveFightGraphicsProfile } from '@/render/fight-presentation';
import { Container } from 'pixi.js';
import { describe, expect, it } from 'vitest';

describe('Ethic native Pixi scenery', () => {
  it('owns retained scenery and screen feedback without a Canvas texture pass', () => {
    const scenery = createEthicPixiScenery({
      backdrop: new Container(),
      worldBack: new Container(),
      world: new Container(),
      worldFront: new Container(),
      overlay: new Container(),
      width: 960,
      height: 540,
    });
    const fighter = {
      health: 100,
      stats: { maxHealth: 100 },
      hitstunFrames: 0,
      blockstunFrames: 0,
    };
    const state = {
      frameCount: 1,
      hitFreezeFrames: 0,
      player1: fighter,
      player2: fighter,
      combos: [{ count: 0 }, { count: 0 }],
    } as never;
    expect(
      scenery.update(
        state,
        { x: 480, y: 270, zoom: 1, shakeOffsetX: 0, shakeOffsetY: 0 } as never,
        resolveFightGraphicsProfile()
      )
    ).toMatchObject({ profileId: 'neon_arena', farBuildings: 18, midBuildings: 12 });
    expect(scenery.snapshot()).toMatchObject({ updates: 1, nativeScreenFeedback: true });
    scenery.destroy();
  });
});
