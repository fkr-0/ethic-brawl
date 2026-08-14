import type {
  EthicPixiBridgeController,
  EthicPixiBridgeLoadResult,
  EthicPixiBridgeOptions,
} from './ethic-pixi-contract';

export const ETHIC_PIXI_BRIDGE_QUERY = 'renderer=bridge';

export type EthicRendererPreference = 'canvas' | 'bridge';

interface EthicPixiBridgeModule {
  createEthicPixiBridge(options: EthicPixiBridgeOptions): Promise<EthicPixiBridgeController>;
}

export interface EthicPixiBridgeLoaderDependencies {
  search?: string;
  importBridge?: () => Promise<EthicPixiBridgeModule>;
}

export function resolveEthicRendererPreference(
  search = globalThis.location?.search ?? ''
): EthicRendererPreference {
  const params = new URLSearchParams(search);
  return params.get('renderer') === 'bridge' || params.get('pixiBridge') === '1'
    ? 'bridge'
    : 'canvas';
}

export function isEthicPixiBridgeRequested(search = globalThis.location?.search ?? ''): boolean {
  return resolveEthicRendererPreference(search) === 'bridge';
}

function describeLoadError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function loadEthicPixiBridge(
  options: Omit<EthicPixiBridgeOptions, 'mount'> & { mount: HTMLElement | null },
  dependencies: EthicPixiBridgeLoaderDependencies = {}
): Promise<EthicPixiBridgeLoadResult> {
  const search = dependencies.search ?? globalThis.location?.search ?? '';
  if (!isEthicPixiBridgeRequested(search)) {
    return { status: 'disabled', controller: null, errorMessage: null };
  }
  if (!options.mount) {
    return {
      status: 'failed',
      controller: null,
      errorMessage: 'Native renderer mount element is unavailable',
    };
  }

  try {
    const module = await (dependencies.importBridge ?? (() => import('./ethic-pixi-bridge')))();
    const controller = await module.createEthicPixiBridge({ ...options, mount: options.mount });
    return { status: 'ready', controller, errorMessage: null };
  } catch (error) {
    return { status: 'failed', controller: null, errorMessage: describeLoadError(error) };
  }
}
