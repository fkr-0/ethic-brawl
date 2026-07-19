import type { FightRuntime } from '@/app/fight-runtime';
import { isEthicPixiBridgeRequested, tryCreateEthicPixiBridge } from '@/render/ethic-pixi-bridge';
import { describe, expect, it, vi } from 'vitest';

describe('Ethic Pixi bridge opt-in', () => {
  it('stays disabled by default and accepts both supported query switches', () => {
    expect(isEthicPixiBridgeRequested('')).toBe(false);
    expect(isEthicPixiBridgeRequested('?renderer=canvas')).toBe(false);
    expect(isEthicPixiBridgeRequested('?renderer=bridge')).toBe(true);
    expect(isEthicPixiBridgeRequested('?pixiBridge=1')).toBe(true);
  });

  it('falls back to Canvas2D when the optional Pixi chunk cannot initialize', async () => {
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.dataset.rendererMode = 'pending';
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const attempt = await tryCreateEthicPixiBridge({
      mount: document.body,
      sourceCanvas,
      fightRuntime: {} as FightRuntime,
      width: 960,
      height: 540,
      loadPixi: async () => {
        throw new Error('WebGL unavailable');
      },
    });

    expect(attempt.controller).toBeNull();
    expect(attempt.failureReason).toBe('WebGL unavailable');
    expect(sourceCanvas.dataset.rendererMode).toBeUndefined();
    expect(warning).toHaveBeenCalledOnce();
    warning.mockRestore();
  });
});
