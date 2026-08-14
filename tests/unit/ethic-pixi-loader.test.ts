import type { EthicPixiBridgeController } from '@/render/ethic-pixi-contract';
import { loadEthicPixiBridge } from '@/render/ethic-pixi-loader';
import { describe, expect, it, vi } from 'vitest';

function options() {
  return {
    mount: {} as HTMLElement,
    sourceCanvas: {} as HTMLCanvasElement,
    fightRuntime: {} as never,
    width: 960,
    height: 540,
  };
}

describe('Ethic Pixi lazy loader', () => {
  it('does not import the optional renderer for normal Canvas sessions', async () => {
    const importBridge = vi.fn();
    const result = await loadEthicPixiBridge(options(), { search: '', importBridge });
    expect(result).toEqual({ status: 'disabled', controller: null, errorMessage: null });
    expect(importBridge).not.toHaveBeenCalled();
  });

  it('loads the bridge only after an explicit renderer request', async () => {
    const controller = { enabled: true } as EthicPixiBridgeController;
    const createEthicPixiBridge = vi.fn(async () => controller);
    const result = await loadEthicPixiBridge(options(), {
      search: '?renderer=bridge',
      importBridge: async () => ({ createEthicPixiBridge }),
    });
    expect(result).toEqual({ status: 'ready', controller, errorMessage: null });
    expect(createEthicPixiBridge).toHaveBeenCalledOnce();
  });

  it('fails soft and preserves Canvas fallback diagnostics', async () => {
    const result = await loadEthicPixiBridge(options(), {
      search: '?pixiBridge=1',
      importBridge: async () => {
        throw new Error('WebGL unavailable');
      },
    });
    expect(result).toEqual({
      status: 'failed',
      controller: null,
      errorMessage: 'WebGL unavailable',
    });
  });
});
