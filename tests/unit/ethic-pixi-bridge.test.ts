import { isEthicPixiBridgeRequested } from '@/render/ethic-pixi-bridge';
import { describe, expect, it } from 'vitest';

describe('Ethic Pixi bridge opt-in', () => {
  it('stays disabled by default and accepts both supported query switches', () => {
    expect(isEthicPixiBridgeRequested('')).toBe(false);
    expect(isEthicPixiBridgeRequested('?renderer=canvas')).toBe(false);
    expect(isEthicPixiBridgeRequested('?renderer=bridge')).toBe(true);
    expect(isEthicPixiBridgeRequested('?pixiBridge=1')).toBe(true);
  });
});
