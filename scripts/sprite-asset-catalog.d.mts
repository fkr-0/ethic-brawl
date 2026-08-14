export type RuntimeSpriteSourceContract = 'animation-v2' | 'legacy-roster';

export interface RuntimeSpriteAsset {
  path: string;
  category: 'fighter' | 'enemy' | 'item-overlay' | 'item-body-pose' | 'item-icons';
  required: boolean;
  requiredFrames?: number;
  grid: { columns: number; rows: number };
  sourceContract?: RuntimeSpriteSourceContract;
  expected:
    | { width: number; height: number }
    | { normalizedWidth: number; normalizedHeight: number; acceptedSquareWidths: number[] };
}

export function collectRuntimeSpriteAssets(projectRoot?: string): RuntimeSpriteAsset[];
