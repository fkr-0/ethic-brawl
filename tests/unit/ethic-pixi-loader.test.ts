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
  it('does not import the optional renderer or CSP shim for normal Canvas sessions', async () => {
    const importCspShim = vi.fn();
    const importBridge = vi.fn();
    const result = await loadEthicPixiBridge(options(), {
      search: '',
      importCspShim,
      importBridge,
    });
    expect(result).toEqual({ status: 'disabled', controller: null, errorMessage: null });
    expect(importCspShim).not.toHaveBeenCalled();
    expect(importBridge).not.toHaveBeenCalled();
  });

  it('installs the strict-CSP shim before loading the explicitly requested bridge', async () => {
    const calls: string[] = [];
    const controller = { enabled: true } as EthicPixiBridgeController;
    const createEthicPixiBridge = vi.fn(async () => controller);
    const result = await loadEthicPixiBridge(options(), {
      search: '?renderer=bridge',
      importCspShim: async () => {
        calls.push('csp');
      },
      importBridge: async () => {
        calls.push('bridge');
        return { createEthicPixiBridge };
      },
    });
    expect(result).toEqual({ status: 'ready', controller, errorMessage: null });
    expect(calls).toEqual(['csp', 'bridge']);
    expect(createEthicPixiBridge).toHaveBeenCalledOnce();
  });

  it('fails soft and preserves Canvas fallback diagnostics', async () => {
    const result = await loadEthicPixiBridge(options(), {
      search: '?pixiBridge=1',
      importCspShim: async () => {},
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
