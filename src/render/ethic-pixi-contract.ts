import type { FightRuntime } from '@/app/fight-runtime';
import type { ArcadePixiRuntime } from '@arcade/runtime';
import type { FightPresentationOptions } from './fight-presentation';

export interface EthicPixiBridgeOptions {
  mount: HTMLElement;
  sourceCanvas: HTMLCanvasElement;
  fightRuntime: FightRuntime;
  width: number;
  height: number;
}

export interface EthicPixiBridgeController {
  readonly enabled: true;
  readonly runtime: ArcadePixiRuntime;
  setPresentation(options: FightPresentationOptions): void;
  render(active: boolean, timeMs?: number): void;
  snapshot(): ReturnType<ArcadePixiRuntime['snapshot']>;
  destroy(): void;
}

export type EthicPixiBridgeLoadStatus = 'disabled' | 'ready' | 'failed';
export type EthicPixiBridgeRuntimeStatus = EthicPixiBridgeLoadStatus | 'destroyed';

export interface EthicPixiBridgeLoadResult {
  status: EthicPixiBridgeLoadStatus;
  controller: EthicPixiBridgeController | null;
  errorMessage: string | null;
}
