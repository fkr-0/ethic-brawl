import { CHARACTERS } from '@/content/characters/character-data';
import type { FightState } from '@/game/fight/fight-controller';
import { Container, Graphics, Text } from 'pixi.js';
import { createPixiHudGauge } from '../../vendor/arcade-runtime.mjs';

export interface EthicPixiHudFighterModel {
  name: string;
  health: number;
  maxHealth: number;
  healthColor: string;
  energy: number;
  maxEnergy: number;
  energyColor: string;
  cooldown: number;
  maxCooldown: number;
  combo: number;
  reverse: boolean;
}

export interface EthicPixiHudModel {
  player1: EthicPixiHudFighterModel;
  player2: EthicPixiHudFighterModel;
  timerSeconds: number;
  timerText: string;
  timerWarning: boolean;
  roundNumber: number;
  roundLabel: string;
  scores: readonly [number, number];
}

function fighterModel(
  fighter: FightState['player1'],
  combo: number,
  reverse: boolean
): EthicPixiHudFighterModel {
  const character = CHARACTERS[fighter.characterId as keyof typeof CHARACTERS];
  return {
    name: character?.name ?? (reverse ? 'P2' : 'P1'),
    health: fighter.health,
    maxHealth: fighter.stats.maxHealth,
    healthColor: character?.colors.primary ?? (reverse ? '#FF00FF' : '#00F5FF'),
    energy: fighter.specialState.currentEnergy,
    maxEnergy: fighter.specialState.maxEnergy,
    energyColor: character?.colors.accent ?? (reverse ? '#FF9F1C' : '#39FF14'),
    cooldown: fighter.specialCooldown,
    maxCooldown: fighter.specialMaxCooldown,
    combo,
    reverse,
  };
}

export function resolveEthicPixiHudModel(state: FightState): EthicPixiHudModel {
  const timerSeconds = Math.max(0, state.round.time);
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = Math.floor(timerSeconds % 60);
  return {
    player1: fighterModel(state.player1, state.combos[0]?.count ?? 0, false),
    player2: fighterModel(state.player2, state.combos[1]?.count ?? 0, true),
    timerSeconds,
    timerText: `${minutes}:${seconds.toString().padStart(2, '0')}`,
    timerWarning: timerSeconds < 10,
    roundNumber: state.round.number,
    roundLabel: `ROUND ${state.round.number}`,
    scores: [state.scores[0] ?? 0, state.scores[1] ?? 0],
  };
}

function text(
  root: Container,
  options: { x: number; y: number; size: number; align?: 'left' | 'center' | 'right' }
): Text {
  const value = new Text({
    text: '',
    style: {
      fontFamily: 'Courier New, monospace',
      fontSize: options.size,
      fontWeight: '700',
      fill: '#ffffff',
      align: options.align ?? 'left',
    },
  });
  value.position.set(options.x, options.y);
  value.anchor.set(options.align === 'center' ? 0.5 : options.align === 'right' ? 1 : 0, 0);
  root.addChild(value);
  return value;
}

export function createEthicPixiHud(options: {
  container: Container;
  width: number;
  height: number;
}) {
  const PIXI = { Container, Graphics };
  const root = new Container();
  root.label = 'ethic-native-hud';
  options.container.addChild(root);

  const chrome = new PIXI.Graphics();
  chrome.label = 'hud-chrome';
  chrome
    .rect(34, 8, 332, 84)
    .fill({ color: 0x080511, alpha: 0.84 })
    .stroke({ color: 0x00f5ff, alpha: 0.28, width: 1 });
  chrome
    .rect(options.width - 366, 8, 332, 84)
    .fill({ color: 0x080511, alpha: 0.84 })
    .stroke({ color: 0xff00ff, alpha: 0.28, width: 1 });
  chrome
    .rect(options.width / 2 - 72, 8, 144, 88)
    .fill({ color: 0x080511, alpha: 0.94 })
    .stroke({ color: 0xb8a9c9, alpha: 0.42, width: 1 });
  chrome.rect(34, 8, 4, 84).fill({ color: 0x00f5ff, alpha: 0.95 });
  chrome.rect(options.width - 38, 8, 4, 84).fill({ color: 0xff00ff, alpha: 0.95 });
  chrome.rect(options.width / 2 - 48, 93, 96, 2).fill({ color: 0xff9f1c, alpha: 0.9 });
  root.addChild(chrome);

  const p1Health = createPixiHudGauge({
    PIXI,
    container: root,
    label: 'p1-health',
    layout: { x: 50, y: 36, width: 300, height: 18 },
    style: { background: '#1A0A2E', fill: '#00F5FF', border: '#00F5FF', borderWidth: 2 },
  });
  const p2Health = createPixiHudGauge({
    PIXI,
    container: root,
    label: 'p2-health',
    layout: { x: options.width - 350, y: 36, width: 300, height: 18 },
    style: { background: '#1A0A2E', fill: '#FF00FF', border: '#FF00FF', borderWidth: 2 },
  });
  const p1Energy = createPixiHudGauge({
    PIXI,
    container: root,
    label: 'p1-energy',
    layout: { x: 50, y: 61, width: 300, height: 8 },
    style: { background: '#0D0518', fill: '#39FF14', borderWidth: 0 },
  });
  const p2Energy = createPixiHudGauge({
    PIXI,
    container: root,
    label: 'p2-energy',
    layout: { x: options.width - 350, y: 61, width: 300, height: 8 },
    style: { background: '#0D0518', fill: '#FF9F1C', borderWidth: 0 },
  });
  const p1Cooldown = createPixiHudGauge({
    PIXI,
    container: root,
    label: 'p1-cooldown',
    layout: { x: 50, y: 73, width: 300, height: 3 },
    style: { background: '#241533', fill: '#FF9F1C', borderWidth: 0 },
  });
  const p2Cooldown = createPixiHudGauge({
    PIXI,
    container: root,
    label: 'p2-cooldown',
    layout: { x: options.width - 350, y: 73, width: 300, height: 3 },
    style: { background: '#241533', fill: '#FF9F1C', borderWidth: 0 },
  });

  const p1Tag = text(root, { x: 50, y: 16, size: 8 });
  const p2Tag = text(root, { x: options.width - 50, y: 16, size: 8, align: 'right' });
  const p1Name = text(root, { x: 50, y: 23, size: 13 });
  const p2Name = text(root, { x: options.width - 50, y: 23, size: 13, align: 'right' });
  const p1HealthText = text(root, { x: 200, y: 39, size: 9, align: 'center' });
  const p2HealthText = text(root, { x: options.width - 200, y: 39, size: 9, align: 'center' });
  const p1Special = text(root, { x: 50, y: 79, size: 8 });
  const p2Special = text(root, { x: options.width - 50, y: 79, size: 8, align: 'right' });
  const roundLabel = text(root, { x: options.width / 2, y: 18, size: 9, align: 'center' });
  const timer = text(root, { x: options.width / 2, y: 30, size: 30, align: 'center' });
  const timerCaption = text(root, { x: options.width / 2, y: 67, size: 8, align: 'center' });
  const p1Combo = text(root, { x: 150, y: 122, size: 30, align: 'center' });
  const p2Combo = text(root, { x: options.width - 150, y: 122, size: 30, align: 'center' });
  const rounds = new Graphics();

  root.addChild(rounds);
  let updates = 0;
  let lastModel: EthicPixiHudModel | null = null;

  return {
    root,
    update(state: FightState, timeMs = performance.now()): EthicPixiHudModel {
      const model = resolveEthicPixiHudModel(state);
      lastModel = model;
      const gaugeTime = timeMs / 1000;
      for (const fighter of [model.player1, model.player2]) {
        const health = fighter.reverse ? p2Health : p1Health;
        const energy = fighter.reverse ? p2Energy : p1Energy;
        const cooldown = fighter.reverse ? p2Cooldown : p1Cooldown;
        health.update(
          {
            value: fighter.health,
            max: fighter.maxHealth,
            direction: fighter.reverse ? 'reverse' : 'forward',
            lowThreshold: 0.25,
            criticalThreshold: 0.12,
            time: gaugeTime,
            pulsePeriod: 0.63,
          },
          { style: { fill: fighter.healthColor, border: fighter.healthColor } }
        );
        energy.update(
          {
            value: fighter.energy,
            max: fighter.maxEnergy,
            direction: fighter.reverse ? 'reverse' : 'forward',
          },
          { style: { fill: fighter.energyColor } }
        );
        const cooldownReady = fighter.cooldown <= 0;
        cooldown.update(
          {
            value: fighter.maxCooldown - fighter.cooldown,
            max: fighter.maxCooldown,
            direction: fighter.reverse ? 'reverse' : 'forward',
          },
          { style: { fill: cooldownReady ? '#39FF14' : '#FF9F1C' } }
        );
      }

      p1Name.text = model.player1.name;
      p2Name.text = model.player2.name;
      p1Tag.text = 'P1 // DOCTRINE';
      p2Tag.text = 'P2 // DOCTRINE';
      p1Tag.style.fill = '#B8A9C9';
      p2Tag.style.fill = '#B8A9C9';
      p1Name.style.fill = model.player1.healthColor;
      p2Name.style.fill = model.player2.healthColor;
      p1HealthText.text = `${Math.ceil(model.player1.health)}`;
      p2HealthText.text = `${Math.ceil(model.player2.health)}`;
      p1Special.text =
        model.player1.cooldown <= 0
          ? `SPECIAL READY · ${Math.round(model.player1.energy)} CONVICTION`
          : `SPECIAL ${Math.ceil(model.player1.cooldown / 60)}s · ${Math.round(model.player1.energy)} CONVICTION`;
      p2Special.text =
        model.player2.cooldown <= 0
          ? `SPECIAL READY · ${Math.round(model.player2.energy)} CONVICTION`
          : `SPECIAL ${Math.ceil(model.player2.cooldown / 60)}s · ${Math.round(model.player2.energy)} CONVICTION`;
      p1Special.style.fill = model.player1.cooldown <= 0 ? '#39FF14' : '#B8A9C9';
      p2Special.style.fill = model.player2.cooldown <= 0 ? '#39FF14' : '#B8A9C9';
      timer.text = model.timerText;
      timer.style.fill = model.timerWarning ? '#FF073A' : '#FFFFFF';
      roundLabel.text = model.roundLabel;
      roundLabel.style.fill = '#FF9F1C';
      timerCaption.text = model.timerWarning ? 'FINAL ARGUMENT' : 'MATCH CLOCK';
      timerCaption.style.fill = model.timerWarning ? '#FF4B6E' : '#B8A9C9';
      p1Combo.text = model.player1.combo > 1 ? `${model.player1.combo} HIT` : '';
      p2Combo.text = model.player2.combo > 1 ? `${model.player2.combo} HIT` : '';
      p1Combo.style.fill = '#00F5FF';
      p2Combo.style.fill = '#FF00FF';

      rounds.clear();
      for (let index = 0; index < 2; index += 1) {
        rounds
          .circle(options.width / 2 - 50 - index * 25, 75, 8)
          .fill(index < model.scores[0] ? '#00F5FF' : '#2D1B4E')
          .stroke({ color: '#00F5FF', width: 2 });
        rounds
          .circle(options.width / 2 + 50 + index * 25, 75, 8)
          .fill(index < model.scores[1] ? '#FF00FF' : '#2D1B4E')
          .stroke({ color: '#FF00FF', width: 2 });
      }
      updates += 1;
      return model;
    },
    snapshot() {
      return { updates, model: lastModel } as const;
    },
    destroy() {
      root.removeFromParent();
      root.destroy({ children: true });
    },
  };
}
