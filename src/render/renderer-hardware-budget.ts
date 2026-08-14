import {
  createHardwareBudgetMonitor,
  detectArcadeHardwareTier,
  type ArcadeHardwareBudgetProfile,
  type ArcadeHardwareTier,
} from '../../vendor/arcade-runtime.mjs';

export const ETHIC_HARDWARE_BUDGETS: Readonly<
  Record<ArcadeHardwareTier, ArcadeHardwareBudgetProfile>
> = Object.freeze({
  low: Object.freeze({
    frameMeanMs: 28,
    frameP95Ms: 45,
    frameMaxMs: 180,
    allocationBytesPerFrame: 96 * 1024,
    uploadBytesPerFrame: 4 * 1024 * 1024,
    bundleBytes: 2 * 1024 * 1024,
    heapBytes: 256 * 1024 * 1024,
    minimumSamples: 60,
  }),
  balanced: Object.freeze({
    frameMeanMs: 20,
    frameP95Ms: 33.4,
    frameMaxMs: 140,
    allocationBytesPerFrame: 192 * 1024,
    uploadBytesPerFrame: 5 * 1024 * 1024,
    bundleBytes: 3 * 1024 * 1024,
    heapBytes: 512 * 1024 * 1024,
    minimumSamples: 90,
  }),
  high: Object.freeze({
    frameMeanMs: 16.7,
    frameP95Ms: 25,
    frameMaxMs: 120,
    allocationBytesPerFrame: 384 * 1024,
    uploadBytesPerFrame: 8 * 1024 * 1024,
    bundleBytes: 4 * 1024 * 1024,
    heapBytes: 1024 * 1024 * 1024,
    minimumSamples: 120,
  }),
});

export function createEthicHardwareBudgetMonitor(
  device: {
    deviceMemory?: number;
    hardwareConcurrency?: number;
    devicePixelRatio?: number;
    renderer?: string;
  } = {}
) {
  const tier = detectArcadeHardwareTier(device);
  return createHardwareBudgetMonitor({ tier, device, profiles: ETHIC_HARDWARE_BUDGETS });
}

export function getBrowserHardwareProfile() {
  const navigatorWithMemory = navigator as Navigator & { deviceMemory?: number };
  return {
    ...(navigatorWithMemory.deviceMemory === undefined
      ? {}
      : { deviceMemory: navigatorWithMemory.deviceMemory }),
    hardwareConcurrency: navigator.hardwareConcurrency,
    devicePixelRatio: globalThis.devicePixelRatio,
  };
}
