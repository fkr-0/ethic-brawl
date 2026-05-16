import { createScene, createSceneManager } from '@/core/state/scene-manager';
import { describe, expect, it } from 'vitest';

describe('scene manager', () => {
  it('starts in the configured initial scene before later transitions', async () => {
    const entered: string[] = [];
    const manager = createSceneManager({
      scenes: [
        createScene('loading', {
          enter: () => {
            entered.push('loading');
          },
        }),
        createScene('start', {
          enter: () => {
            entered.push('start');
          },
        }),
      ],
      initialScene: 'loading',
    });

    await manager.start();

    expect(manager.getCurrentScene()).toBe('loading');
    expect(entered).toEqual(['loading']);
    await expect(manager.transitionTo('start')).resolves.toBe(true);
    expect(manager.getCurrentScene()).toBe('start');
    expect(entered).toEqual(['loading', 'start']);
  });
});
