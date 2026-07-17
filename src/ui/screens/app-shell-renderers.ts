import type { FightOutcomeSummary, GameMode, SettingsState } from '@/app/app-shell/types';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/app/config';
import type { CharacterId } from '@/content/characters/character-data';
import {
  getCharacter,
  getCharacterNormalChain,
} from '@/content/characters/character-data';
import { getEnemyVisual } from '@/content/enemies/enemy-visual-data';
import { getSpecialsForCharacter } from '@/content/specials/special-data';
import {
  GAME_ACTIONS,
  GAME_ACTION_LABELS,
  PLAYER1_BINDINGS,
  PLAYER2_BINDINGS,
  type PlayerInput,
  formatBindingForDisplay,
} from '@/core';
import {
  getAtlasFrame,
  getCharacterAnimationMap,
  getStateClip,
  renderSpriteFrame,
} from '@/render/sprites';
import { commandSlotToLabel } from '@/game/fight/command-input';
import {
  ARCADE_UI_FONT,
  ETHIC_UI,
  drawArcadeBackdrop,
  drawArcadeFooter,
  drawArcadeMenuRow,
  drawArcadePanel,
} from '@/ui/arcade-ui';

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3
): number {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth || !line) {
      line = candidate;
      continue;
    }
    lines.push(line);
    line = word;
    if (lines.length === maxLines - 1) break;
  }
  if (line && lines.length < maxLines) lines.push(line);

  lines.forEach((value, index) => ctx.fillText(value, x, y + index * lineHeight));
  return lines.length * lineHeight;
}

function renderCharacterSpritePreview(
  ctx: CanvasRenderingContext2D,
  characterId: CharacterId,
  centerX: number,
  baselineY: number,
  maxWidth: number,
  maxHeight: number,
  opacity = 1,
  flipX = false
): boolean {
  const animMap = getCharacterAnimationMap(characterId);
  if (!animMap?.atlas) return false;
  const idleClip = getStateClip(animMap, 'idle');
  const clipFrame = idleClip?.frames[0];
  if (!clipFrame) return false;
  const atlasFrame = getAtlasFrame(animMap, clipFrame);
  if (!atlasFrame) return false;
  const scale = Math.min(maxWidth / atlasFrame.frameWidth, maxHeight / atlasFrame.frameHeight);
  return renderSpriteFrame(ctx, animMap.atlas, atlasFrame, centerX, baselineY, {
    flipX,
    opacity,
    scale,
  });
}

export function renderLoading(ctx: CanvasRenderingContext2D): void {
  drawArcadeBackdrop(ctx);
  drawArcadePanel(ctx, {
    x: CANVAS_WIDTH / 2 - 180,
    y: CANVAS_HEIGHT / 2 - 54,
    width: 360,
    height: 108,
    strong: true,
    label: 'System boot',
  });
  ctx.font = `800 22px ${ARCADE_UI_FONT}`;
  ctx.fillStyle = ETHIC_UI.accent;
  ctx.textAlign = 'center';
  ctx.fillText('INITIALIZING...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
}

export function renderStartScreen(ctx: CanvasRenderingContext2D): void {
  drawArcadeBackdrop(ctx);

  ctx.font = `900 60px ${ARCADE_UI_FONT}`;
  ctx.fillStyle = ETHIC_UI.accentAlt;
  ctx.textAlign = 'center';
  ctx.fillText('ETHIC BRAWL', CANVAS_WIDTH / 2, 150);

  ctx.font = `700 16px ${ARCADE_UI_FONT}`;
  ctx.fillStyle = ETHIC_UI.accent;
  ctx.fillText('PHILOSOPHICAL ARENA // BABYLON FEED', CANVAS_WIDTH / 2, 184);

  drawArcadePanel(ctx, {
    x: CANVAS_WIDTH / 2 - 220,
    y: 246,
    width: 440,
    height: 132,
    accent: ETHIC_UI.warning,
    strong: true,
    label: 'Open transmission',
  });
  ctx.font = `800 24px ${ARCADE_UI_FONT}`;
  ctx.fillStyle = ETHIC_UI.text;
  ctx.fillText('ENTER  //  START GAME', CANVAS_WIDTH / 2, 310);

  ctx.font = `12px ${ARCADE_UI_FONT}`;
  ctx.fillStyle = ETHIC_UI.muted;
  ctx.fillText('ATTACK ALSO CONFIRMS', CANVAS_WIDTH / 2, 342);
  drawArcadeFooter(ctx, 'Enter / Attack continue  //  Shift+/ controls');
}

export function renderMainMenu(ctx: CanvasRenderingContext2D, selectedIndex: number): void {
  const options = ['VERSUS // LOCAL', 'STORY // BABYLON', 'SETTINGS'];
  const descriptions = [
    'Two players · full release roster · authored command kits',
    'Three encounters · persistent wave pressure · one complete route',
    'Gameplay, accessibility, and remappable controls',
  ];
  drawArcadeBackdrop(ctx);

  ctx.textAlign = 'center';
  ctx.font = `900 50px ${ARCADE_UI_FONT}`;
  ctx.fillStyle = ETHIC_UI.accentAlt;
  ctx.fillText('ETHIC BRAWL', CANVAS_WIDTH / 2, 92);

  ctx.font = `700 13px ${ARCADE_UI_FONT}`;
  ctx.fillStyle = ETHIC_UI.accent;
  ctx.fillText('SELECT DISPUTE PROTOCOL', CANVAS_WIDTH / 2, 122);

  const panelX = CANVAS_WIDTH / 2 - 230;
  const panelY = 154;
  drawArcadePanel(ctx, {
    x: panelX,
    y: panelY,
    width: 460,
    height: 238,
    strong: true,
    label: 'Mode routing',
  });
  for (let i = 0; i < options.length; i++) {
    const active = i === selectedIndex;
    const label = options[i] ?? '';
    drawArcadeMenuRow(ctx, label, panelX + 18, panelY + 36 + i * 48, 424, active);
  }
  ctx.font = `12px ${ARCADE_UI_FONT}`;
  ctx.fillStyle = ETHIC_UI.muted;
  ctx.fillText(descriptions[selectedIndex] ?? '', CANVAS_WIDTH / 2, panelY + 216);
  drawArcadeFooter(ctx, 'W/S navigate  //  Enter confirm  //  Shift+/ controls');
}

export function renderSettings(ctx: CanvasRenderingContext2D, settings: SettingsState): void {
  drawArcadeBackdrop(ctx);
  drawArcadePanel(ctx, {
    x: 68,
    y: 104,
    width: CANVAS_WIDTH - 136,
    height: 370,
    accent: ETHIC_UI.accentAlt,
    strong: true,
    label: 'Configuration matrix',
  });
  ctx.textAlign = 'center';

  ctx.font = 'bold 42px "Courier New", monospace';
  ctx.fillStyle = '#39FF14';
  ctx.fillText('SETTINGS', CANVAS_WIDTH / 2, 88);

  ctx.font = '18px "Courier New", monospace';
  ctx.fillStyle = settings.menuTab === 'gameplay' ? '#FFFFFF' : '#817597';
  ctx.fillText('[ GAMEPLAY ]', CANVAS_WIDTH / 2 - 120, 130);
  ctx.fillStyle = settings.menuTab === 'keybindings' ? '#FFFFFF' : '#817597';
  ctx.fillText('[ KEYBINDINGS ]', CANVAS_WIDTH / 2 + 120, 130);

  if (settings.menuTab === 'gameplay') {
    const rows = [
      `Skip Stage Intro: ${settings.skipStageIntro ? 'ON' : 'OFF'}`,
      'Open Keybinding Menu',
    ];
    ctx.font = '24px "Courier New", monospace';
    rows.forEach((label, index) => {
      const active = settings.selectedIndex === index;
      ctx.fillStyle = active ? '#FFFFFF' : '#B8A9C9';
      ctx.fillText(active ? `> ${label} <` : label, CANVAS_WIDTH / 2, 220 + index * 52);
    });
  } else {
    ctx.textAlign = 'left';
    ctx.font = 'bold 15px "Courier New", monospace';
    ctx.fillStyle = '#00F5FF';
    ctx.fillText('ACTION', 96, 178);
    ctx.fillStyle = '#39FF14';
    ctx.fillText('PLAYER 1', 370, 178);
    ctx.fillStyle = '#FF9F1C';
    ctx.fillText('PLAYER 2', 560, 178);

    ctx.font = '14px "Courier New", monospace';
    GAME_ACTIONS.forEach((action, index) => {
      const y = 210 + index * 27;
      const active = settings.selectedIndex === index;
      ctx.fillStyle = active ? '#FFFFFF' : '#B8A9C9';
      ctx.fillText(active ? `> ${GAME_ACTION_LABELS[action]}` : GAME_ACTION_LABELS[action], 96, y);
      ctx.fillStyle = active ? '#FFFFFF' : '#39FF14';
      ctx.fillText(formatBindingForDisplay(settings.bindings.player1, action), 370, y);
      ctx.fillStyle = '#FF9F1C';
      ctx.fillText(formatBindingForDisplay(settings.bindings.player2, action), 560, y);
    });

    const resetY = 210 + GAME_ACTIONS.length * 27;
    ctx.fillStyle = settings.selectedIndex === GAME_ACTIONS.length ? '#FFFFFF' : '#B8A9C9';
    ctx.fillText(
      settings.selectedIndex === GAME_ACTIONS.length
        ? '> Reset All Bindings'
        : 'Reset All Bindings',
      96,
      resetY
    );

    if (settings.keybindingEdit) {
      ctx.fillStyle = 'rgba(8, 5, 16, 0.9)';
      ctx.fillRect(120, 210, CANVAS_WIDTH - 240, 180);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(120, 210, CANVAS_WIDTH - 240, 180);
      ctx.textAlign = 'center';
      ctx.font = 'bold 24px "Courier New", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('PRESS A NEW KEY', CANVAS_WIDTH / 2, 270);
      ctx.font = '18px "Courier New", monospace';
      ctx.fillStyle = '#B8A9C9';
      ctx.fillText(
        `P${settings.keybindingEdit.playerId} ${GAME_ACTION_LABELS[settings.keybindingEdit.action]}`,
        CANVAS_WIDTH / 2,
        312
      );
      ctx.fillText('CANCEL keeps the current binding', CANVAS_WIDTH / 2, 350);
    }
  }

  drawArcadeFooter(ctx, 'W/S select  //  A/D tab  //  Enter edit  //  Esc back');
}

export function renderCharacterSelect(
  ctx: CanvasRenderingContext2D,
  characterIds: CharacterId[],
  player1SelectIndex: number,
  player2SelectIndex: number,
  phase: 1 | 2,
  gameMode: GameMode = 'vs'
): void {
  drawArcadeBackdrop(ctx);

  ctx.font = '32px "Courier New", monospace';
  ctx.fillStyle = '#FF00FF';
  ctx.textAlign = 'center';
  const title =
    gameMode === 'stage'
      ? 'SELECT YOUR PHILOSOPHER — BABYLON'
      : phase === 1
        ? 'SELECT PLAYER 1'
        : 'SELECT PLAYER 2';
  ctx.fillText(title, CANVAS_WIDTH / 2, 54);

  const columns = 6;
  const cardWidth = 96;
  const cardHeight = 104;
  const gapX = 8;
  const gapY = 10;
  const startX = 22;
  const startY = 86;
  const activeIndex = phase === 1 ? player1SelectIndex : player2SelectIndex;

  for (let i = 0; i < characterIds.length; i++) {
    const x = startX + (i % columns) * (cardWidth + gapX);
    const y = startY + Math.floor(i / columns) * (cardHeight + gapY);
    const characterId = characterIds[i];
    if (!characterId) continue;
    const character = getCharacter(characterId);
    const isActive = i === activeIndex;
    const isP1 = i === player1SelectIndex;
    const isP2 = i === player2SelectIndex;

    drawArcadePanel(ctx, {
      x,
      y,
      width: cardWidth,
      height: cardHeight,
      accent: isActive ? ETHIC_UI.text : character.colors.primary,
      strong: isActive,
    });

    const accentColor = character.colors.primary;
    ctx.strokeStyle = isActive ? '#FFFFFF' : accentColor;
    ctx.lineWidth = isActive ? 4 : 2;
    ctx.strokeRect(x, y, cardWidth, cardHeight);

    const spriteRendered = renderCharacterSpritePreview(
      ctx,
      characterId,
      x + cardWidth / 2,
      y + 78,
      72,
      70,
      isActive ? 1 : 0.82
    );
    if (!spriteRendered) {
      ctx.fillStyle = accentColor;
      ctx.fillRect(x + 32, y + 20, 32, 56);
    }

    ctx.font = 'bold 10px "Courier New", monospace';
    ctx.fillStyle = accentColor;
    ctx.textAlign = 'center';
    ctx.fillText(character.name.toUpperCase().slice(0, 14), x + cardWidth / 2, y + cardHeight - 9);

    if (isP1) {
      ctx.fillStyle = '#00F5FF';
      ctx.fillText('P1', x + 18, y + 16);
    }
    if (isP2 && gameMode === 'vs') {
      ctx.fillStyle = '#FF9F1C';
      ctx.fillText('P2', x + cardWidth - 18, y + 16);
    }
  }

  const selectedId = characterIds[activeIndex];
  if (selectedId) {
    const selected = getCharacter(selectedId);
    const panelX = 662;
    const panelY = 86;
    const panelWidth = 276;
    const panelHeight = 390;
    drawArcadePanel(ctx, {
      x: panelX,
      y: panelY,
      width: panelWidth,
      height: panelHeight,
      accent: selected.colors.primary,
      strong: true,
      label: 'Doctrine profile',
    });

    renderCharacterSpritePreview(ctx, selectedId, panelX + 58, panelY + 128, 102, 120);
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(selected.name.toUpperCase(), panelX + 112, panelY + 34);
    ctx.font = '11px "Courier New", monospace';
    ctx.fillStyle = selected.colors.accent;
    ctx.fillText(selected.subtitle.toUpperCase(), panelX + 112, panelY + 56);

    const stats = [
      ['POW', selected.baseStats.strength],
      ['DEF', selected.baseStats.defense],
      ['INT', selected.baseStats.intelligence],
      ['AGI', selected.baseStats.agility],
    ] as const;
    stats.forEach(([label, value], index) => {
      const y = panelY + 82 + index * 22;
      ctx.font = 'bold 11px "Courier New", monospace';
      ctx.fillStyle = '#B8A9C9';
      ctx.fillText(label, panelX + 112, y);
      ctx.fillStyle = '#281A3E';
      ctx.fillRect(panelX + 146, y - 9, 106, 10);
      ctx.fillStyle = selected.colors.primary;
      ctx.fillRect(panelX + 146, y - 9, Math.min(106, value * 10.6), 10);
    });

    const normalChain = getCharacterNormalChain(selected);
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillStyle = selected.colors.primary;
    ctx.fillText('NORMAL CHAIN', panelX + 18, panelY + 174);
    ctx.font = '10px "Courier New", monospace';
    ctx.fillStyle = '#D7CDE2';
    ctx.fillText(
      normalChain.map((attack) => attack.name).join('  ›  ').slice(0, 42),
      panelX + 18,
      panelY + 191
    );

    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillStyle = selected.colors.primary;
    ctx.fillText('COMMAND MOVESET', panelX + 18, panelY + 216);
    const specials = getSpecialsForCharacter(selectedId).slice(0, 4);
    specials.forEach((move, index) => {
      const y = panelY + 236 + index * 20;
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.fillStyle = selected.colors.accent;
      ctx.fillText(commandSlotToLabel(move.commandSlot), panelX + 18, y);
      ctx.font = '10px "Courier New", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(move.displayName.toUpperCase().slice(0, 25), panelX + 92, y);
    });

    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillStyle = selected.colors.accent;
    ctx.fillText(selected.gimmick.name.toUpperCase(), panelX + 18, panelY + 326);
    ctx.font = '10px "Courier New", monospace';
    ctx.fillStyle = '#B8A9C9';
    drawWrappedText(
      ctx,
      selected.gimmick.description,
      panelX + 18,
      panelY + 344,
      panelWidth - 36,
      14,
      2
    );
  }

  drawArcadeFooter(
    ctx,
    gameMode === 'stage'
      ? 'D-PAD choose | CONFIRM enter Babylon | CANCEL back | Shift+/ (?) help'
      : 'D-PAD choose | CONFIRM lock | CANCEL back | Shift+/ (?) help'
  );
}

export interface StageIntroViewModel {
  stageNumber: number;
  stageName: string;
  tagline: string;
  wave: number;
  waveCount: number;
  encounterTitle: string;
  playerCharacterId: CharacterId;
  playerName: string;
  enemyCharacterId: CharacterId;
  enemyName: string;
  enemyArchetypes: readonly string[];
  note: string;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  modeLabel: string;
  modeDescription: string;
  ruleSummary: string;
}

export function renderStageIntro(ctx: CanvasRenderingContext2D, stage: StageIntroViewModel): void {
  const enemy = getCharacter(stage.enemyCharacterId);
  const player = getCharacter(stage.playerCharacterId);
  const background = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  background.addColorStop(0, '#080511');
  background.addColorStop(0.58, '#18102B');
  background.addColorStop(1, '#2B1822');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.save();
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = player.colors.primary;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(430, 0);
  ctx.lineTo(290, CANVAS_HEIGHT);
  ctx.lineTo(0, CANVAS_HEIGHT);
  ctx.fill();
  ctx.fillStyle = enemy.colors.primary;
  ctx.beginPath();
  ctx.moveTo(CANVAS_WIDTH - 430, 0);
  ctx.lineTo(CANVAS_WIDTH, 0);
  ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.lineTo(CANVAS_WIDTH - 290, CANVAS_HEIGHT);
  ctx.fill();
  ctx.restore();

  ctx.textAlign = 'center';
  ctx.font = 'bold 19px "Courier New", monospace';
  ctx.fillStyle = '#FF9F1C';
  ctx.fillText(
    `STAGE ${stage.stageNumber} · WAVE ${stage.wave}/${stage.waveCount}`,
    CANVAS_WIDTH / 2,
    42
  );
  ctx.font = 'bold 42px "Courier New", monospace';
  ctx.fillStyle = '#00F5FF';
  ctx.fillText(stage.stageName.toUpperCase(), CANVAS_WIDTH / 2, 88);
  ctx.font = '17px "Courier New", monospace';
  ctx.fillStyle = '#B8A9C9';
  ctx.fillText(stage.tagline, CANVAS_WIDTH / 2, 116);
  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = '#817597';
  drawWrappedText(ctx, stage.modeDescription, CANVAS_WIDTH / 2, 133, 410, 12, 2);

  renderCharacterSpritePreview(ctx, stage.playerCharacterId, 210, 406, 210, 250, 1, false);
  renderCharacterSpritePreview(ctx, stage.enemyCharacterId, 750, 406, 210, 250, 1, true);

  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.fillStyle = player.colors.primary;
  ctx.fillText(stage.playerName.toUpperCase(), 210, 446);
  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = player.colors.accent;
  ctx.fillText(player.subtitle.toUpperCase(), 210, 464);

  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.fillStyle = enemy.colors.primary;
  ctx.fillText(stage.enemyName.toUpperCase(), 750, 446);
  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = enemy.colors.accent;
  ctx.fillText(enemy.subtitle.toUpperCase(), 750, 464);

  drawArcadePanel(ctx, {
    x: 340,
    y: 152,
    width: 280,
    height: 280,
    accent: ETHIC_UI.warning,
    strong: true,
    label: 'Encounter terms',
  });

  ctx.font = 'bold 25px "Courier New", monospace';
  ctx.fillStyle = '#FF00FF';
  drawWrappedText(ctx, stage.encounterTitle.toUpperCase(), CANVAS_WIDTH / 2, 196, 240, 30, 2);
  ctx.font = 'bold 34px "Courier New", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('VS', CANVAS_WIDTH / 2, 270);
  const archetypeVisuals = stage.enemyArchetypes
    .map((id) => getEnemyVisual(id))
    .filter((visual) => visual !== null);
  archetypeVisuals.forEach((visual, index) => {
    const badgeWidth = 72;
    const gap = 6;
    const rowWidth = archetypeVisuals.length * badgeWidth + (archetypeVisuals.length - 1) * gap;
    const x = CANVAS_WIDTH / 2 - rowWidth / 2 + index * (badgeWidth + gap);
    ctx.fillStyle = '#120C20';
    ctx.fillRect(x, 296, badgeWidth, 34);
    ctx.strokeStyle = visual.accent;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, 296, badgeWidth, 34);
    ctx.font = 'bold 8px "Courier New", monospace';
    ctx.fillStyle = visual.accent;
    ctx.textAlign = 'center';
    drawWrappedText(ctx, visual.label.toUpperCase(), x + badgeWidth / 2, 309, badgeWidth - 8, 10, 2);
  });
  ctx.fillStyle =
    stage.aiDifficulty === 'hard'
      ? '#FF073A'
      : stage.aiDifficulty === 'medium'
        ? '#FF9F1C'
        : '#39FF14';
  ctx.fillText(`THREAT: ${stage.aiDifficulty.toUpperCase()}`, CANVAS_WIDTH / 2, 358);
  ctx.fillStyle = '#B8A9C9';
  drawWrappedText(ctx, stage.note, CANVAS_WIDTH / 2, 382, 240, 16, 2);

  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillStyle = '#00F5FF';
  ctx.fillText(stage.modeLabel.toUpperCase(), CANVAS_WIDTH / 2, 414);
  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = '#FF9F1C';
  ctx.fillText(stage.ruleSummary.toUpperCase(), CANVAS_WIDTH / 2, 430);

  ctx.font = 'bold 15px "Courier New", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('CONFIRM TO FIGHT', CANVAS_WIDTH / 2, 474);
  ctx.font = '11px "Courier New", monospace';
  ctx.fillStyle = '#817597';
  ctx.fillText(
    'The placard is propaganda. The fists are unfortunately real.',
    CANVAS_WIDTH / 2,
    506
  );
}

export function renderStageProgress(
  ctx: CanvasRenderingContext2D,
  stage: Pick<StageIntroViewModel, 'stageNumber' | 'stageName' | 'wave' | 'waveCount' | 'modeLabel'>
): void {
  ctx.save();
  drawArcadePanel(ctx, {
    x: CANVAS_WIDTH / 2 - 190,
    y: CANVAS_HEIGHT - 56,
    width: 380,
    height: 40,
    accent: ETHIC_UI.warning,
    strong: true,
  });
  ctx.textAlign = 'center';
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(
    `STAGE ${stage.stageNumber}: ${stage.stageName.toUpperCase()} · ${stage.modeLabel.toUpperCase()} · WAVE ${stage.wave}/${stage.waveCount}`,
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT - 25
  );
  ctx.restore();
}

export function renderTrial(ctx: CanvasRenderingContext2D): void {
  drawArcadeBackdrop(ctx);
  drawArcadePanel(ctx, {
    x: CANVAS_WIDTH / 2 - 270,
    y: 118,
    width: 540,
    height: 286,
    accent: ETHIC_UI.warning,
    strong: true,
    label: 'Intermission protocol',
  });
  ctx.textAlign = 'center';
  ctx.font = 'bold 42px "Courier New", monospace';
  ctx.fillStyle = '#FF9F1C';
  ctx.fillText('TRIAL OF CONVICTION', CANVAS_WIDTH / 2, 170);
  ctx.font = '20px "Courier New", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('Win the debate between rounds?', CANVAS_WIDTH / 2, 250);
  ctx.fillStyle = '#39FF14';
  ctx.fillText('CONFIRM: Accept reward', CANVAS_WIDTH / 2, 320);
  ctx.fillStyle = '#FF00FF';
  ctx.fillText('CANCEL: Skip to results', CANVAS_WIDTH / 2, 355);
}

export function renderUpgrade(ctx: CanvasRenderingContext2D): void {
  drawArcadeBackdrop(ctx);
  drawArcadePanel(ctx, {
    x: CANVAS_WIDTH / 2 - 270,
    y: 118,
    width: 540,
    height: 250,
    accent: ETHIC_UI.accent,
    strong: true,
    label: 'Doctrine modified',
  });
  ctx.textAlign = 'center';
  ctx.font = 'bold 42px "Courier New", monospace';
  ctx.fillStyle = '#39FF14';
  ctx.fillText('UPGRADE ACQUIRED', CANVAS_WIDTH / 2, 170);
  ctx.font = '20px "Courier New", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('+ Momentum: Better opening pressure', CANVAS_WIDTH / 2, 260);
  ctx.fillStyle = '#B8A9C9';
  ctx.fillText('Press CONFIRM to continue', CANVAS_WIDTH / 2, 340);
}

export function renderPauseScreen(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(26, 10, 46, 0.8)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawArcadePanel(ctx, {
    x: CANVAS_WIDTH / 2 - 230,
    y: CANVAS_HEIGHT / 2 - 96,
    width: 460,
    height: 192,
    accent: ETHIC_UI.accentAlt,
    strong: true,
    label: 'Simulation held',
  });

  ctx.font = 'bold 48px "Courier New", monospace';
  ctx.fillStyle = '#FF00FF';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

  ctx.font = '20px "Courier New", monospace';
  ctx.fillStyle = '#00F5FF';
  ctx.fillText('Press ESC or CANCEL to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
  ctx.fillText('Press Shift+/ (?) for controls', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
}

export interface ResultsViewModel {
  gameMode: GameMode;
  player1Name: string;
  player2Name: string;
  stageNumber: number;
  stageEncounterIndex: number;
  stageEncounterWins: number;
  stageEncounterCount: number;
}

export function renderResults(
  ctx: CanvasRenderingContext2D,
  result: FightOutcomeSummary | null,
  view: ResultsViewModel
): void {
  drawArcadeBackdrop(ctx);
  drawArcadePanel(ctx, {
    x: CANVAS_WIDTH / 2 - 280,
    y: 88,
    width: 560,
    height: 370,
    accent: result?.winner === 1 ? ETHIC_UI.accent : ETHIC_UI.danger,
    strong: true,
    label: 'Verdict ledger',
  });

  const stageDefeat = view.gameMode === 'stage' && result?.winner === 2;
  const aborted = result === null;
  const stageCleared =
    view.gameMode === 'stage' &&
    !aborted &&
    !stageDefeat &&
    view.stageEncounterWins >= view.stageEncounterCount;
  const winnerName = result?.winner === 2 ? view.player2Name : view.player1Name;

  ctx.font = 'bold 48px "Courier New", monospace';
  ctx.fillStyle = aborted
    ? '#B8A9C9'
    : stageDefeat
      ? '#FF073A'
      : stageCleared
        ? '#39FF14'
        : '#FF00FF';
  ctx.textAlign = 'center';
  ctx.fillText(
    aborted
      ? 'MATCH ABORTED'
      : stageDefeat
        ? 'DEFEAT'
        : stageCleared
          ? 'BABYLON CLEARED'
          : 'VICTORY',
    CANVAS_WIDTH / 2,
    140
  );

  ctx.font = '24px "Courier New", monospace';
  ctx.fillStyle = '#00F5FF';
  ctx.fillText(
    aborted ? 'NO VERDICT REACHED' : `${winnerName.toUpperCase()} PREVAILS`,
    CANVAS_WIDTH / 2,
    205
  );

  if (view.gameMode === 'stage') {
    ctx.font = '16px "Courier New", monospace';
    ctx.fillStyle = '#FF9F1C';
    ctx.fillText(
      `STAGE ${Math.max(1, view.stageNumber - (stageCleared ? 1 : 0))} · WAVE ${view.stageEncounterIndex + 1}/${view.stageEncounterCount} · ${view.stageEncounterWins} CLEARED`,
      CANVAS_WIDTH / 2,
      240
    );
  }

  ctx.font = '18px "Courier New", monospace';
  ctx.fillStyle = '#FFFFFF';
  const time = result
    ? `${Math.floor(result.totalTime / 60)}:${Math.floor(result.totalTime % 60)
        .toString()
        .padStart(2, '0')}`
    : '0:00';
  ctx.fillText(`Time: ${time}`, CANVAS_WIDTH / 2, 292);
  ctx.fillText(`Max Combo: ${result?.maxCombo ?? 0}`, CANVAS_WIDTH / 2, 322);
  ctx.fillText(`Score: ${result?.score ?? 0}`, CANVAS_WIDTH / 2, 352);
  if (result?.perfect) {
    ctx.fillStyle = '#FFD700';
    ctx.fillText('PERFECT!', CANVAS_WIDTH / 2, 382);
  }

  ctx.font = '20px "Courier New", monospace';
  if (stageDefeat) {
    ctx.fillStyle = '#39FF14';
    ctx.fillText('CONFIRM: Retry this wave', CANVAS_WIDTH / 2, 442);
    ctx.fillStyle = '#B8A9C9';
    ctx.fillText('CANCEL: Return to menu', CANVAS_WIDTH / 2, 478);
  } else {
    ctx.fillStyle = '#39FF14';
    ctx.fillText('Press CONFIRM to continue', CANVAS_WIDTH / 2, 458);
  }
  drawArcadeFooter(ctx, 'Confirm continue  //  Cancel return');
}

function formatBindingKeys(keys: string[]): string {
  return keys
    .map((key) =>
      key
        .replace(/^Key/, '')
        .replace(/^Arrow/, '')
        .replace(/^Numpad/, 'Num')
        .replace('Backspace', 'Bksp')
        .replace('Escape', 'Esc')
    )
    .join(' / ');
}

export function renderHelpOverlay(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.fillStyle = 'rgba(8, 5, 16, 0.88)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  drawArcadePanel(ctx, {
    x: 72,
    y: 38,
    width: CANVAS_WIDTH - 144,
    height: CANVAS_HEIGHT - 88,
    accent: ETHIC_UI.accent,
    strong: true,
    label: 'Input reference',
  });

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = 'bold 32px "Courier New", monospace';
  ctx.fillText('KEYBINDINGS', CANVAS_WIDTH / 2, 72);
  ctx.font = '18px "Courier New", monospace';
  ctx.fillStyle = '#B8A9C9';
  ctx.fillText('Press Shift+/ (?) to close', CANVAS_WIDTH / 2, 102);

  const rows: Array<{ label: string; p1: string; p2: string }> = [
    {
      label: 'Move Left',
      p1: formatBindingKeys(PLAYER1_BINDINGS.keys.get('moveLeft') ?? []),
      p2: formatBindingKeys(PLAYER2_BINDINGS.keys.get('moveLeft') ?? []),
    },
    {
      label: 'Move Right',
      p1: formatBindingKeys(PLAYER1_BINDINGS.keys.get('moveRight') ?? []),
      p2: formatBindingKeys(PLAYER2_BINDINGS.keys.get('moveRight') ?? []),
    },
    {
      label: 'Move Up/Down',
      p1: `${formatBindingKeys(PLAYER1_BINDINGS.keys.get('moveUp') ?? [])} / ${formatBindingKeys(PLAYER1_BINDINGS.keys.get('moveDown') ?? [])}`,
      p2: `${formatBindingKeys(PLAYER2_BINDINGS.keys.get('moveUp') ?? [])} / ${formatBindingKeys(PLAYER2_BINDINGS.keys.get('moveDown') ?? [])}`,
    },
    {
      label: 'Jump',
      p1: formatBindingKeys(PLAYER1_BINDINGS.keys.get('jump') ?? []),
      p2: formatBindingKeys(PLAYER2_BINDINGS.keys.get('jump') ?? []),
    },
    {
      label: 'Attack',
      p1: formatBindingKeys(PLAYER1_BINDINGS.keys.get('attack') ?? []),
      p2: formatBindingKeys(PLAYER2_BINDINGS.keys.get('attack') ?? []),
    },
    {
      label: 'Block',
      p1: formatBindingKeys(PLAYER1_BINDINGS.keys.get('block') ?? []),
      p2: formatBindingKeys(PLAYER2_BINDINGS.keys.get('block') ?? []),
    },
    {
      label: 'Special',
      p1: formatBindingKeys(PLAYER1_BINDINGS.keys.get('special') ?? []),
      p2: formatBindingKeys(PLAYER2_BINDINGS.keys.get('special') ?? []),
    },
    {
      label: 'Confirm / Cancel',
      p1: `${formatBindingKeys(PLAYER1_BINDINGS.keys.get('confirm') ?? [])} / ${formatBindingKeys(PLAYER1_BINDINGS.keys.get('cancel') ?? [])}`,
      p2: `${formatBindingKeys(PLAYER2_BINDINGS.keys.get('confirm') ?? [])} / ${formatBindingKeys(PLAYER2_BINDINGS.keys.get('cancel') ?? [])}`,
    },
    {
      label: 'Pause',
      p1: formatBindingKeys(PLAYER1_BINDINGS.keys.get('pause') ?? []),
      p2: formatBindingKeys(PLAYER2_BINDINGS.keys.get('pause') ?? []),
    },
  ];

  const leftX = 130;
  const topY = 150;
  const rowHeight = 34;
  ctx.textAlign = 'left';
  ctx.font = 'bold 16px "Courier New", monospace';
  ctx.fillStyle = '#00F5FF';
  ctx.fillText('ACTION', leftX, topY);
  ctx.fillStyle = '#39FF14';
  ctx.fillText('PLAYER 1', leftX + 260, topY);
  ctx.fillStyle = '#FF9F1C';
  ctx.fillText('PLAYER 2', leftX + 490, topY);

  ctx.font = '15px "Courier New", monospace';
  rows.forEach((row, index) => {
    const y = topY + 28 + index * rowHeight;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(row.label, leftX, y);
    ctx.fillStyle = '#39FF14';
    ctx.fillText(row.p1, leftX + 260, y);
    ctx.fillStyle = '#FF9F1C';
    ctx.fillText(row.p2, leftX + 490, y);
  });

  ctx.restore();
}

export function renderInputPanels(
  ctx: CanvasRenderingContext2D,
  player1: PlayerInput,
  player2: PlayerInput
): void {
  const actions: Array<{ key: keyof PlayerInput; label: string }> = [
    { key: 'moveLeft', label: 'L' },
    { key: 'moveRight', label: 'R' },
    { key: 'moveUp', label: 'U' },
    { key: 'moveDown', label: 'D' },
    { key: 'jump', label: 'JMP' },
    { key: 'attack', label: 'ATK' },
    { key: 'block', label: 'BLK' },
    { key: 'special', label: 'SPC' },
  ];

  const drawPanel = (
    x: number,
    y: number,
    title: string,
    color: string,
    input: PlayerInput
  ): void => {
    ctx.fillStyle = 'rgba(10, 8, 22, 0.78)';
    ctx.fillRect(x, y, 212, 86);
    ctx.strokeStyle = `${color}AA`;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 212, 86);

    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = color;
    ctx.fillText(title, x + 8, y + 16);

    for (let i = 0; i < actions.length; i++) {
      const row = Math.floor(i / 4);
      const col = i % 4;
      const cellX = x + 8 + col * 50;
      const cellY = y + 24 + row * 28;
      const action = actions[i];
      if (!action) continue;
      const lit = Boolean(input[action.key]);
      ctx.fillStyle = lit ? color : '#2B2740';
      ctx.fillRect(cellX, cellY, 44, 22);
      ctx.strokeStyle = lit ? '#FFFFFF' : '#5A5470';
      ctx.lineWidth = 1;
      ctx.strokeRect(cellX, cellY, 44, 22);
      ctx.fillStyle = lit ? '#080714' : '#C8C2DA';
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(action.label, cellX + 22, cellY + 14);
    }
  };

  drawPanel(20, CANVAS_HEIGHT - 110, 'P1 INPUT', '#39FF14', player1);
  drawPanel(CANVAS_WIDTH - 232, CANVAS_HEIGHT - 110, 'P2 INPUT', '#FF9F1C', player2);
}

export function renderDebugInfo(
  ctx: CanvasRenderingContext2D,
  fps: number,
  frameCount: number
): void {
  ctx.font = '12px "Courier New", monospace';
  ctx.fillStyle = '#39FF14';
  ctx.textAlign = 'right';
  ctx.fillText(`FPS: ${fps} | Frame: ${frameCount}`, CANVAS_WIDTH - 10, 20);
}
