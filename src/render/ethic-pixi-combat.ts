import { CHARACTERS, type CharacterId } from '@/content/characters/character-data';
import type { FightState } from '@/game/fight/fight-controller';
import type { Fighter } from '@/game/fight/fighter';
import type { ProjectileState } from '@/game/specials/projectile-system';
import { type Container, Graphics, Sprite, Texture } from 'pixi.js';
import { createPixiFramePool } from '../../vendor/arcade-runtime.mjs';
import { createFighterAnimationView } from './fighter-animation-view';
import {
  createAnimationPlayerState,
  getAttackPhaseClip,
  getCharacterAnimationMap,
  getStateClip,
  playClip,
  resolveAttackPhase,
  setPlaybackSpeed,
  updateAnimationPlayer,
} from './sprites';
import {
  getProcessedSpriteFrameCanvas,
  resolveFighterSpriteRenderScale,
} from './sprites/sprite-renderer';
import { getSpriteScaleFactor } from './sprites/sprite-integration';

export interface EthicProjectileVisual {
  x: number;
  y: number;
  radius: number;
  rotation: number;
  alpha: number;
  color: string;
  kind: ProjectileState['definition']['kind'];
}

export function resolveEthicProjectileVisual(projectile: ProjectileState): EthicProjectileVisual {
  const direction = projectile.facing === 'right' ? 1 : -1;
  const lifetime = Math.max(1, projectile.definition.lifetimeFrames);
  const progress = Math.min(1, projectile.ageFrames / lifetime);
  const colors: Record<ProjectileState['definition']['kind'], string> = {
    magic_ball: '#00f5ff',
    laser: '#ff00ff',
    firestorm: '#ff9f1c',
    blizzard: '#8cecff',
    chain_lightning: '#f7ff52',
    shockwave: '#39ff14',
    trap_mine: '#ff073a',
    summon_field: '#b67cff',
  };
  return {
    x: projectile.x,
    y: projectile.y,
    radius:
      projectile.definition.collision === 'ray' ? 5 : 8 + Math.sin(projectile.ageFrames * 0.35) * 2,
    rotation: direction < 0 ? Math.PI : 0,
    alpha: Math.max(0.25, 1 - progress * 0.35),
    color: colors[projectile.definition.kind],
    kind: projectile.definition.kind,
  };
}

function drawProjectile(graphics: Graphics, visual: EthicProjectileVisual): void {
  graphics.clear();
  graphics.position.set(visual.x, visual.y);
  graphics.rotation = visual.rotation;
  graphics.alpha = visual.alpha;
  if (visual.kind === 'laser') {
    graphics
      .roundRect(-visual.radius * 2, -2, visual.radius * 4, 4, 2)
      .fill({ color: visual.color });
  } else if (visual.kind === 'shockwave') {
    graphics.circle(0, 0, visual.radius * 1.8).stroke({ color: visual.color, width: 3 });
  } else if (visual.kind === 'trap_mine') {
    graphics
      .poly([-visual.radius, visual.radius, 0, -visual.radius, visual.radius, visual.radius])
      .fill({ color: visual.color });
  } else {
    graphics.circle(0, 0, visual.radius).fill({ color: visual.color });
  }
}

export function createEthicPixiCombat(options: { actors: Container; projectiles: Container }) {
  options.actors.sortableChildren = true;
  const fighterSprites = new Map<string, Sprite>();
  const fighterFallbacks = new Map<string, Graphics>();
  const animationStates = new Map<string, ReturnType<typeof createAnimationPlayerState>>();
  const textureCache = new Map<string, Texture>();
  let actorUpdates = 0;
  let textureUploads = 0;

  const projectilePool = createPixiFramePool<Graphics, ProjectileState>({
    container: options.projectiles,
    maxCapacity: 192,
    createSprite: () => new Graphics(),
    activate(graphics, projectile) {
      drawProjectile(graphics, resolveEthicProjectileVisual(projectile));
    },
    deactivate(graphics) {
      graphics.clear();
      graphics.alpha = 0;
    },
  });

  const textureFor = (characterId: string, frameIndex: number, source: HTMLCanvasElement) => {
    const key = `${characterId}:${frameIndex}`;
    let texture = textureCache.get(key);
    if (!texture) {
      texture = Texture.from(source);
      texture.source.scaleMode = 'nearest';
      textureCache.set(key, texture);
      textureUploads += source.width * source.height * 4;
    }
    return texture;
  };

  const syncFighter = (fighter: Fighter, frame: number) => {
    const renderFallback = () => {
      let graphics = fighterFallbacks.get(fighter.id);
      if (!graphics) {
        graphics = new Graphics();
        graphics.label = `fighter-fallback:${fighter.id}`;
        options.actors.addChild(graphics);
        fighterFallbacks.set(fighter.id, graphics);
      }
      const colors = CHARACTERS[fighter.characterId as CharacterId]?.colors;
      const animation = createFighterAnimationView(fighter, frame);
      graphics.clear();
      graphics.position.set(fighter.x, fighter.getWorldY() + animation.bobOffsetY);
      graphics.roundRect(-21, -80, 42, 62, 8).fill({ color: colors?.primary ?? '#00f5ff' });
      graphics.circle(0, -88, 17).fill({ color: colors?.secondary ?? '#ff00ff' });
      graphics.scale.set(
        fighter.facing === 'right' ? animation.depthScale : -animation.depthScale,
        animation.depthScale
      );
      graphics.zIndex = fighter.lane;
      graphics.visible = true;
      const sprite = fighterSprites.get(fighter.id);
      if (sprite) sprite.visible = false;
      return true;
    };
    const animMap = getCharacterAnimationMap(fighter.characterId as CharacterId);
    if (!animMap?.atlas) return renderFallback();
    let state = animationStates.get(fighter.id) ?? createAnimationPlayerState();
    let clip = null;
    if ((fighter.state === 'attacking' || fighter.state === 'special') && fighter.currentAttack) {
      const phase = resolveAttackPhase(
        fighter.attackFrame,
        fighter.currentAttack.startup,
        fighter.currentAttack.active,
        fighter.currentAttack.recovery
      );
      clip = getAttackPhaseClip(
        animMap,
        fighter.currentAttack.id,
        phase,
        fighter.currentAttack.type
      );
    }
    clip ??= getStateClip(animMap, fighter.state);
    if (!clip) return renderFallback();
    if (state.currentClip?.id !== clip.id) state = playClip(state, clip, 1);
    else state = updateAnimationPlayer(setPlaybackSpeed(state, 1), 1);
    animationStates.set(fighter.id, state);

    const clipFrame = clip.frames[state.currentFrame];
    const atlasFrame = clipFrame ? animMap.atlas.frames[clipFrame.frameIndex] : null;
    if (!atlasFrame) return renderFallback();
    const source = getProcessedSpriteFrameCanvas(animMap.atlas, atlasFrame);
    if (!source) return renderFallback();
    let sprite = fighterSprites.get(fighter.id);
    if (!sprite) {
      sprite = new Sprite();
      sprite.label = `fighter:${fighter.id}`;
      options.actors.addChild(sprite);
      fighterSprites.set(fighter.id, sprite);
    }
    const animation = createFighterAnimationView(fighter, frame);
    const scale = resolveFighterSpriteRenderScale(
      animMap.atlas,
      animation.depthScale,
      getSpriteScaleFactor(),
      atlasFrame
    );
    sprite.texture = textureFor(fighter.characterId, atlasFrame.index, source);
    sprite.anchor.set(atlasFrame.pivot.x, atlasFrame.pivot.y);
    sprite.position.set(
      fighter.x +
        animation.recoilOffsetX +
        animation.actionOffsetX * (fighter.facing === 'right' ? 1 : -1),
      fighter.getWorldY() + animation.bobOffsetY + animation.actionOffsetY
    );
    sprite.scale.set(
      scale *
        (fighter.facing === 'right' ? 1 : -1) *
        Math.max(0.86, Math.min(1.16, animation.bodyWidthScale)),
      scale * Math.max(0.86, Math.min(1.16, animation.bodyHeightScale))
    );
    sprite.rotation = Math.max(-0.18, Math.min(0.18, animation.bodyLean * 0.18));
    sprite.zIndex = fighter.lane;
    sprite.alpha = fighter.state === 'knockdown' ? 0.72 : 1;
    sprite.visible = true;
    const fallback = fighterFallbacks.get(fighter.id);
    if (fallback) fallback.visible = false;
    actorUpdates += 1;
    return true;
  };

  return {
    sync(state: FightState) {
      const activeIds = new Set<string>();
      for (const fighter of [state.player1, state.player2].sort((a, b) => a.lane - b.lane)) {
        activeIds.add(fighter.id);
        syncFighter(fighter, state.frameCount);
      }
      for (const [id, sprite] of fighterSprites) sprite.visible = activeIds.has(id);
      for (const [id, graphics] of fighterFallbacks)
        graphics.visible = activeIds.has(id) && graphics.visible;
      projectilePool.beginFrame();
      for (const projectile of state.projectiles) projectilePool.acquire(projectile);
      const projectiles = projectilePool.endFrame();
      return {
        actors: activeIds.size,
        actorUpdates,
        projectiles,
        textureBytes: textureUploads,
      } as const;
    },
    snapshot() {
      return {
        actors: fighterSprites.size,
        actorUpdates,
        projectiles: projectilePool.snapshot(),
        textures: textureCache.size,
        textureBytes: textureUploads,
      } as const;
    },
    destroy() {
      projectilePool.destroy();
      for (const sprite of fighterSprites.values()) sprite.destroy();
      for (const graphics of fighterFallbacks.values()) graphics.destroy();
      for (const texture of textureCache.values()) texture.destroy(true);
      fighterSprites.clear();
      fighterFallbacks.clear();
      textureCache.clear();
    },
  };
}
