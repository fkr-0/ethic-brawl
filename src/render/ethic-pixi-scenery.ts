import type { FightState } from '@/game/fight/fight-controller';
import { getLaneGroundY } from '@/game/fight/fight-controller';
import { type Container, Graphics, Text } from 'pixi.js';
import type { Camera } from './camera';
import {
  calculateWrappedParallaxX,
  type FightGraphicsProfile,
  resolveCombatScreenFeedback,
  resolveFightStageEvent,
} from './fight-presentation';

interface BuildingSeed {
  worldX: number;
  width: number;
  height: number;
}

function seededBuildings(seed: number, count: number, spacing: number): BuildingSeed[] {
  let state = seed >>> 0;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  return Array.from({ length: count }, (_, index) => ({
    worldX: index * spacing + random() * spacing * 0.45,
    width: 54 + Math.floor(random() * 76),
    height: 86 + Math.floor(random() * 156),
  }));
}

export interface EthicPixiScenerySnapshot {
  profileId: string;
  updates: number;
  farBuildings: number;
  midBuildings: number;
  nativeScreenFeedback: boolean;
}

export function createEthicPixiScenery(options: {
  backdrop: Container;
  worldBack: Container;
  world: Container;
  worldFront: Container;
  overlay: Container;
  width: number;
  height: number;
}) {
  const sky = new Graphics();
  const far = new Graphics();
  const mid = new Graphics();
  const arena = new Graphics();
  const atmosphere = new Graphics();
  const foreground = new Graphics();
  const feedback = new Graphics();
  options.backdrop.addChild(sky, far);
  options.worldBack.addChild(mid, atmosphere);
  options.world.addChild(arena);
  options.worldFront.addChild(foreground);
  options.overlay.addChild(feedback);

  const signs = Array.from({ length: 4 }, () => {
    const sign = new Text({
      text: '',
      style: {
        fontFamily: 'Courier New, monospace',
        fontSize: 15,
        fontWeight: '700',
        fill: '#00f5ff',
      },
    });
    sign.anchor.set(0.5, 0.5);
    options.worldBack.addChild(sign);
    return sign;
  });

  let profileId = '';
  let farSeeds: BuildingSeed[] = [];
  let midSeeds: BuildingSeed[] = [];
  let updates = 0;

  const rebuildProfile = (profile: FightGraphicsProfile): void => {
    profileId = profile.id;
    farSeeds = seededBuildings(profile.seed, 18, 92);
    midSeeds = seededBuildings(profile.seed ^ 0x9e3779b9, 12, 128);
    sky.clear();
    const third = options.height / 3;
    sky.rect(0, 0, options.width, third + 1).fill({ color: profile.skyTop });
    sky.rect(0, third, options.width, third + 1).fill({ color: profile.skyMiddle });
    sky.rect(0, third * 2, options.width, third + 1).fill({ color: profile.skyBottom });
    sky.rect(0, 0, options.width, options.height).fill({ color: profile.haze });
  };

  return {
    update(
      state: FightState,
      camera: Camera,
      profile: FightGraphicsProfile,
      screenFeedbackScale = 1
    ): EthicPixiScenerySnapshot {
      if (profile.id !== profileId) rebuildProfile(profile);
      const frame = state.frameCount;
      const repeatWidth = 1280;
      const stageEvent = resolveFightStageEvent(frame, profile);

      far.clear();
      for (const building of farSeeds) {
        const x = calculateWrappedParallaxX(
          building.worldX,
          camera.x,
          profile.farParallaxSpeed,
          repeatWidth
        );
        const y = options.height - 102 - building.height;
        far
          .rect(x, y, building.width, building.height)
          .fill({ color: profile.farColor, alpha: 0.72 });
        far
          .rect(x + 12, y + 16, 5, Math.max(8, building.height - 32))
          .fill({ color: profile.accent, alpha: 0.13 });
      }

      mid.clear();
      for (const [index, building] of midSeeds.entries()) {
        const x = calculateWrappedParallaxX(
          building.worldX,
          camera.x,
          profile.midParallaxSpeed,
          repeatWidth
        );
        const height = building.height + 38;
        const y = options.height - 96 - height;
        mid.rect(x, y, building.width, height).fill({ color: profile.midColor });
        for (let windowY = y + 18; windowY < y + height - 16; windowY += 28) {
          mid.rect(x + 14, windowY, Math.max(8, building.width - 28), 4).fill({
            color: index % 2 === 0 ? profile.accent : profile.secondaryAccent,
            alpha: 0.34,
          });
        }
      }

      if (profile.theme === 'babylon') {
        const gateWidth = 250 + profile.encounterIndex * 45;
        const gateX = options.width / 2 - gateWidth / 2 - (camera.x - options.width / 2) * 0.08;
        for (let tier = 0; tier < 5; tier += 1) {
          const tierWidth = gateWidth - tier * 34;
          mid
            .rect(gateX + tier * 17, 286 - tier * 35, tierWidth, 34)
            .fill({ color: profile.secondaryAccent, alpha: 0.42 });
        }
      }

      for (const [index, sign] of signs.entries()) {
        const word = profile.signWords[index] ?? '';
        sign.text = word;
        sign.style.fill = index % 2 === 0 ? profile.accent : profile.secondaryAccent;
        sign.alpha = 0.48 + Math.sin(frame * 0.04 + index) * 0.12;
        sign.position.set(
          calculateWrappedParallaxX(
            120 + index * 310,
            camera.x,
            profile.signParallaxSpeed,
            repeatWidth
          ),
          128 + (index % 3) * 48
        );
      }

      atmosphere.clear();
      if (profile.atmosphereMotif === 'neon_rain') {
        for (let index = 0; index < 28; index += 1) {
          const x = ((index * 41 + frame * 1.8 - camera.x * 0.18) % (options.width + 40)) - 20;
          const y = ((index * 83 + frame * 4.2) % (options.height + 80)) - 80;
          atmosphere
            .moveTo(x, y)
            .lineTo(x - 4, y + 22)
            .stroke({
              color: profile.accent,
              alpha: 0.14,
              width: 1,
            });
        }
      } else if (profile.atmosphereMotif === 'gate_embers') {
        for (let index = 0; index < 36; index += 1) {
          const speed = 0.55 + (index % 7) * 0.13;
          const x =
            (index * 47 + Math.sin(frame * 0.02 + index) * 25 - camera.x * 0.12) % options.width;
          const y = options.height - ((frame * speed + index * 61) % (options.height - 70));
          atmosphere
            .rect(x, y, 1 + (index % 3), 2 + (index % 4))
            .fill({ color: index % 4 === 0 ? '#fff2b0' : profile.accent, alpha: 0.22 });
        }
      }

      arena.clear();
      arena.rect(0, options.height - 100, options.width, 100).fill({ color: profile.floorColor });
      arena
        .rect(0, options.height - 100, options.width, 8)
        .fill({ color: profile.floorHighlight, alpha: 0.55 });
      for (let lane = 0; lane < 3; lane += 1) {
        const y = getLaneGroundY(lane as 0 | 1 | 2);
        for (let x = 0; x < options.width; x += 20) {
          arena.rect(x, y, 10, 1).fill({ color: profile.floorHighlight, alpha: 0.68 });
        }
      }
      for (let ray = 0; ray <= 12; ray += 1) {
        const x = (options.width / 12) * ray;
        arena
          .moveTo(options.width / 2, options.height - 100)
          .lineTo(x, options.height)
          .stroke({ color: profile.accent, alpha: 0.16 + stageEvent.intensity * 0.12, width: 1 });
      }

      foreground.clear();
      if (profile.foregroundMotif === 'gate_braziers') {
        for (const x of [72, options.width - 72]) {
          foreground.rect(x - 22, options.height - 92, 44, 92).fill({ color: profile.midColor });
          foreground
            .circle(x, options.height - 104, 16 + stageEvent.intensity * 8)
            .fill({ color: profile.accent, alpha: 0.5 + stageEvent.intensity * 0.3 });
        }
      } else {
        foreground
          .rect(0, options.height - 26, options.width, 4)
          .fill({ color: profile.secondaryAccent, alpha: 0.35 });
      }

      const screenFeedback = resolveCombatScreenFeedback(state);
      feedback.clear();
      const feedbackAlpha = Math.min(
        0.34,
        screenFeedback.lowHealthAlpha + screenFeedback.impactAlpha
      );
      if (feedbackAlpha > 0) {
        feedback.rect(0, 0, options.width, options.height).fill({
          color: '#ff2448',
          alpha: feedbackAlpha * 0.48 * Math.max(0, Math.min(1, screenFeedbackScale)),
        });
      }

      updates += 1;
      return {
        profileId,
        updates,
        farBuildings: farSeeds.length,
        midBuildings: midSeeds.length,
        nativeScreenFeedback: true,
      };
    },
    snapshot(): EthicPixiScenerySnapshot {
      return {
        profileId,
        updates,
        farBuildings: farSeeds.length,
        midBuildings: midSeeds.length,
        nativeScreenFeedback: true,
      };
    },
    destroy(): void {
      for (const sign of signs) sign.destroy();
      sky.destroy();
      far.destroy();
      mid.destroy();
      arena.destroy();
      atmosphere.destroy();
      foreground.destroy();
      feedback.destroy();
    },
  };
}
