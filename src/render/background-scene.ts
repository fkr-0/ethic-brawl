import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/app/config';

export interface BackgroundWindow {
  x: number;
  y: number;
  width: number;
  height: number;
  lit: boolean;
}

export interface BackgroundBuilding {
  x: number;
  width: number;
  height: number;
}

export interface MidBackgroundBuilding extends BackgroundBuilding {
  windows: BackgroundWindow[];
}

export interface BackgroundSign {
  x: number;
  y: number;
  text: string;
  speedFactor: number;
  color: string;
}

export interface StableBackgroundScene {
  distantBuildings: BackgroundBuilding[];
  midBuildings: MidBackgroundBuilding[];
  signs: BackgroundSign[];
}

function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

export function createStableBackgroundScene(seed = 1337): StableBackgroundScene {
  const random = createSeededRandom(seed);
  const distantBuildings: BackgroundBuilding[] = [];
  const midBuildings: MidBackgroundBuilding[] = [];

  for (let index = 0; index < 15; index++) {
    distantBuildings.push({
      x: index * 80,
      width: 60,
      height: 100 + Math.sin(index * 1.5) * 50,
    });
  }

  for (let index = 0; index < 10; index++) {
    const width = 100;
    const height = 150 + Math.cos(index * 2) * 70;
    const windows: BackgroundWindow[] = [];

    for (let wy = 0; wy < height - 20; wy += 25) {
      for (let wx = 10; wx < width - 10; wx += 20) {
        windows.push({
          x: wx,
          y: wy + 10,
          width: 8,
          height: 12,
          lit: random() > 0.3,
        });
      }
    }

    midBuildings.push({
      x: index * 120,
      width,
      height,
      windows,
    });
  }

  return {
    distantBuildings,
    midBuildings,
    signs: [
      {
        x: 50,
        y: 150,
        text: 'PHILOSOPHY',
        speedFactor: 0.2,
        color: '#FF00FF44',
      },
      {
        x: CANVAS_WIDTH - 260,
        y: 180,
        text: 'TRUTH',
        speedFactor: 0.15,
        color: '#00F5FF44',
      },
      {
        x: CANVAS_WIDTH * 0.42,
        y: CANVAS_HEIGHT - 290,
        text: 'ABSURD',
        speedFactor: 0.24,
        color: '#39FF1444',
      },
    ],
  };
}

export const DEFAULT_BACKGROUND_SCENE = createStableBackgroundScene();
