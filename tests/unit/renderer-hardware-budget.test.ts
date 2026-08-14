import {
  ETHIC_HARDWARE_BUDGETS,
  createEthicHardwareBudgetMonitor,
} from '@/render/renderer-hardware-budget';
import { describe, expect, it } from 'vitest';

describe('Ethic hardware renderer budgets', () => {
  it('selects low and high profiles from device capabilities', () => {
    expect(createEthicHardwareBudgetMonitor({ deviceMemory: 2, hardwareConcurrency: 4 }).tier).toBe(
      'low'
    );
    expect(
      createEthicHardwareBudgetMonitor({ deviceMemory: 16, hardwareConcurrency: 16 }).tier
    ).toBe('high');
    expect(ETHIC_HARDWARE_BUDGETS.balanced.uploadBytesPerFrame).toBeGreaterThan(1280 * 720 * 4);
  });
});
