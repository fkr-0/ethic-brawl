import { createScene, createSceneManager } from '@/core/state/scene-manager';
import { describe, expect, it } from 'vitest';

describe('campaign scene transitions', () => {
  it('allows a cleared fight to advance to the next wave intro', async () => {
    const manager = createSceneManager({
      scenes: [createScene('fight', {}), createScene('stage-intro', {})],
      initialScene: 'fight',
    });

    await manager.start();
    expect(manager.canTransitionTo('stage-intro')).toBe(true);
    await expect(manager.transitionTo('stage-intro')).resolves.toBe(true);
    expect(manager.getCurrentScene()).toBe('stage-intro');
  });

  it('allows the upgrade screen to finish at results', async () => {
    const manager = createSceneManager({
      scenes: [createScene('upgrade', {}), createScene('results', {})],
      initialScene: 'upgrade',
    });

    await manager.start();
    expect(manager.canTransitionTo('results')).toBe(true);
    await expect(manager.transitionTo('results')).resolves.toBe(true);
    expect(manager.getCurrentScene()).toBe('results');
  });
});
