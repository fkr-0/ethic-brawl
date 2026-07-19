import { afterEach, describe, expect, it } from 'vitest';
import { createInputManager, type InputManager } from '@/core/input/input-manager';

let manager: InputManager | null = null;

afterEach(() => {
  manager?.destroy();
  manager = null;
});

describe('shared semantic input recording', () => {
  it('is disabled by default', () => {
    manager = createInputManager();
    manager.update();
    expect(manager.getInputRecording()).toBeNull();
  });

  it('keeps a bounded ticked stream of two-player semantic input snapshots', () => {
    manager = createInputManager({ recordingCapacity: 2 });

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
    manager.update();
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }));
    manager.update();
    manager.update();

    const recording = manager.getInputRecording();
    expect(recording?.metadata).toEqual({ game: 'ethic-brawl', stream: 'semantic-input-v1' });
    expect(recording?.entries.map(({ tick, sequence }) => [tick, sequence])).toEqual([
      [1, 1],
      [2, 2],
    ]);
    expect(recording?.entries[0]?.command).toMatchObject({
      player1: { moveLeft: false },
      player2: { moveLeft: false },
    });

    manager.clearInputRecording();
    expect(manager.getInputRecording()?.entries).toEqual([]);
  });
});
