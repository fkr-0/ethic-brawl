import type { FightOutcomeSummary, GameMode, SettingsState } from '@/app/app-shell/types';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/app/config';
import type { CharacterId } from '@/content/characters/character-data';
import { getCharacter } from '@/content/characters/character-data';
import {
  GAME_ACTIONS,
  GAME_ACTION_LABELS,
  PLAYER1_BINDINGS,
  PLAYER2_BINDINGS,
  formatBindingForDisplay,
  type PlayerInput,
} from '@/core';

export function renderLoading(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#1A0A2E';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.font = '24px "Courier New", monospace';
  ctx.fillStyle = '#00F5FF';
  ctx.textAlign = 'center';
  ctx.fillText('INITIALIZING...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
}

export function renderStartScreen(ctx: CanvasRenderingContext2D): void {
  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, '#1A0A2E');
  gradient.addColorStop(1, '#2D1B4E');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.font = 'bold 64px "Courier New", monospace';
  ctx.fillStyle = '#FF00FF';
  ctx.textAlign = 'center';
  ctx.fillText('ETHIC BRAWL', CANVAS_WIDTH / 2, 180);

  ctx.font = '20px "Courier New", monospace';
  ctx.fillStyle = '#00F5FF';
  ctx.fillText('A Philosophical Arena Fighter', CANVAS_WIDTH / 2, 220);

  ctx.font = '28px "Courier New", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('[ENTER] START GAME', CANVAS_WIDTH / 2, 350);

  ctx.font = '18px "Courier New", monospace';
  ctx.fillStyle = '#B8A9C9';
  ctx.fillText('Press ENTER or ATTACK to continue', CANVAS_WIDTH / 2, 450);
  ctx.fillText('Press Shift+/ (?) for controls', CANVAS_WIDTH / 2, 480);
}

export function renderMainMenu(ctx: CanvasRenderingContext2D, selectedIndex: number): void {
  const options = ['VS MODE', 'STAGE MODE', 'SETTINGS'];

  const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  gradient.addColorStop(0, '#1A0A2E');
  gradient.addColorStop(1, '#2D1B4E');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  ctx.font = 'bold 64px "Courier New", monospace';
  ctx.fillStyle = '#FF00FF';
  ctx.fillText('ETHIC BRAWL', CANVAS_WIDTH / 2, 130);

  ctx.font = '20px "Courier New", monospace';
  ctx.fillStyle = '#00F5FF';
  ctx.fillText('Choose a mode', CANVAS_WIDTH / 2, 175);

  for (let i = 0; i < options.length; i++) {
    const y = 250 + i * 70;
    const active = i === selectedIndex;
    ctx.fillStyle = active ? '#FFFFFF' : '#B8A9C9';
    ctx.font = active ? 'bold 34px "Courier New", monospace' : '28px "Courier New", monospace';
    const label = options[i] ?? '';
    ctx.fillText(active ? `> ${label} <` : label, CANVAS_WIDTH / 2, y);
  }

  ctx.font = '18px "Courier New", monospace';
  ctx.fillStyle = '#B8A9C9';
  ctx.fillText('W/S move | ENTER confirm | Shift+/ (?) help', CANVAS_WIDTH / 2, 500);
}

export function renderSettings(ctx: CanvasRenderingContext2D, settings: SettingsState): void {
  ctx.fillStyle = '#12091F';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
      settings.selectedIndex === GAME_ACTIONS.length ? '> Reset All Bindings' : 'Reset All Bindings',
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

  ctx.textAlign = 'center';
  ctx.font = '16px "Courier New", monospace';
  ctx.fillStyle = '#B8A9C9';
  ctx.fillText('W/S select | A/D tab | ENTER edit/toggle | BACKSPACE/ESC back', CANVAS_WIDTH / 2, 555);
}

export function renderCharacterSelect(
  ctx: CanvasRenderingContext2D,
  characterIds: CharacterId[],
  player1SelectIndex: number,
  player2SelectIndex: number,
  phase: 1 | 2,
  gameMode: GameMode = 'vs'
): void {
  ctx.fillStyle = '#1A0A2E';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

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

  const colors = ['#00F5FF', '#39FF14', '#FF00FF', '#FF073A'];
  const columns = 6;
  const cardWidth = 138;
  const cardHeight = 112;
  const gapX = 12;
  const gapY = 14;
  const startX = 36;
  const startY = 82;

  for (let i = 0; i < characterIds.length; i++) {
    const x = startX + (i % columns) * (cardWidth + gapX);
    const y = startY + Math.floor(i / columns) * (cardHeight + gapY);
    const characterId = characterIds[i];
    if (!characterId) continue;
    const character = getCharacter(characterId);
    const activeIndex = phase === 1 ? player1SelectIndex : player2SelectIndex;
    const isActive = i === activeIndex;
    const isP1 = i === player1SelectIndex;
    const isP2 = i === player2SelectIndex;

    ctx.fillStyle = isActive ? '#3A2361' : '#2D1B4E';
    ctx.fillRect(x, y, cardWidth, cardHeight);

    const accentColor = colors[i] ?? '#FFFFFF';
    ctx.strokeStyle = isActive ? '#FFFFFF' : accentColor;
    ctx.lineWidth = isActive ? 4 : 2;
    ctx.strokeRect(x, y, cardWidth, cardHeight);

    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillStyle = accentColor;
    ctx.textAlign = 'center';
    ctx.fillText(character.name.toUpperCase().slice(0, 18), x + cardWidth / 2, y + cardHeight - 12);

    ctx.fillStyle = accentColor;
    ctx.fillRect(x + 42, y + 22, 54, 62);

    if (isP1) {
      ctx.fillStyle = '#00F5FF';
      ctx.fillText('P1', x + 18, y + 16);
    }
    if (isP2 && gameMode === 'vs') {
      ctx.fillStyle = '#FF9F1C';
      ctx.fillText('P2', x + cardWidth - 18, y + 16);
    }
  }

  ctx.font = '18px "Courier New", monospace';
  ctx.fillStyle = '#B8A9C9';
  ctx.fillText(
    gameMode === 'stage'
      ? 'LEFT/RIGHT choose | CONFIRM enter Babylon | CANCEL back | Shift+/ (?) help'
      : 'LEFT/RIGHT choose | CONFIRM lock | CANCEL back | Shift+/ (?) help',
    CANVAS_WIDTH / 2,
    492
  );
}

export interface StageIntroViewModel {
  stageNumber: number;
  stageName: string;
  tagline: string;
  wave: number;
  waveCount: number;
  encounterTitle: string;
  enemyName: string;
  enemyArchetypes: readonly string[];
  note: string;
}

export function renderStageIntro(
  ctx: CanvasRenderingContext2D,
  stage: StageIntroViewModel
): void {
  ctx.fillStyle = '#12091F';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.font = 'bold 26px "Courier New", monospace';
  ctx.fillStyle = '#FF9F1C';
  ctx.fillText(
    `STAGE ${stage.stageNumber} · WAVE ${stage.wave}/${stage.waveCount}`,
    CANVAS_WIDTH / 2,
    76
  );
  ctx.font = 'bold 56px "Courier New", monospace';
  ctx.fillStyle = '#00F5FF';
  ctx.fillText(stage.stageName.toUpperCase(), CANVAS_WIDTH / 2, 150);
  ctx.font = '22px "Courier New", monospace';
  ctx.fillStyle = '#B8A9C9';
  ctx.fillText(stage.tagline, CANVAS_WIDTH / 2, 196);
  ctx.font = 'bold 28px "Courier New", monospace';
  ctx.fillStyle = '#FF00FF';
  ctx.fillText(stage.encounterTitle, CANVAS_WIDTH / 2, 270);
  ctx.font = '20px "Courier New", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(`Opponent: ${stage.enemyName}`, CANVAS_WIDTH / 2, 310);
  ctx.font = '16px "Courier New", monospace';
  ctx.fillStyle = '#39FF14';
  ctx.fillText(stage.enemyArchetypes.join(' · ').replaceAll('_', ' '), CANVAS_WIDTH / 2, 350);
  ctx.fillStyle = '#B8A9C9';
  ctx.fillText(stage.note, CANVAS_WIDTH / 2, 390);
  ctx.fillText('Press CONFIRM to fight', CANVAS_WIDTH / 2, 462);
}

export function renderStageProgress(
  ctx: CanvasRenderingContext2D,
  stage: Pick<StageIntroViewModel, 'stageNumber' | 'stageName' | 'wave' | 'waveCount'>
): void {
  ctx.save();
  ctx.fillStyle = 'rgba(18, 9, 31, 0.78)';
  ctx.fillRect(CANVAS_WIDTH / 2 - 150, 8, 300, 42);
  ctx.strokeStyle = '#FF9F1C';
  ctx.strokeRect(CANVAS_WIDTH / 2 - 150, 8, 300, 42);
  ctx.textAlign = 'center';
  ctx.font = 'bold 14px "Courier New", monospace';
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(
    `STAGE ${stage.stageNumber}: ${stage.stageName.toUpperCase()} · WAVE ${stage.wave}/${stage.waveCount}`,
    CANVAS_WIDTH / 2,
    34
  );
  ctx.restore();
}

export function renderTrial(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#140C25';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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
  ctx.fillStyle = '#180E2E';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
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

  ctx.font = 'bold 48px "Courier New", monospace';
  ctx.fillStyle = '#FF00FF';
  ctx.textAlign = 'center';
  ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);

  ctx.font = '20px "Courier New", monospace';
  ctx.fillStyle = '#00F5FF';
  ctx.fillText('Press ESC or CANCEL to resume', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
  ctx.fillText('Press Shift+/ (?) for controls', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
}

export function renderResults(
  ctx: CanvasRenderingContext2D,
  result: FightOutcomeSummary | null
): void {
  ctx.fillStyle = '#1A0A2E';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.font = 'bold 48px "Courier New", monospace';
  ctx.fillStyle = '#FF00FF';
  ctx.textAlign = 'center';
  ctx.fillText('VICTORY!', CANVAS_WIDTH / 2, 150);

  ctx.font = '24px "Courier New", monospace';
  ctx.fillStyle = '#00F5FF';
  ctx.fillText(`PLAYER ${result?.winner ?? 1} WINS`, CANVAS_WIDTH / 2, 220);

  ctx.font = '18px "Courier New", monospace';
  ctx.fillStyle = '#FFFFFF';
  const time = result
    ? `${Math.floor(result.totalTime / 60)}:${Math.floor(result.totalTime % 60)
        .toString()
        .padStart(2, '0')}`
    : '0:00';
  ctx.fillText(`Time: ${time}`, CANVAS_WIDTH / 2, 300);
  ctx.fillText(`Max Combo: ${result?.maxCombo ?? 0}`, CANVAS_WIDTH / 2, 330);
  ctx.fillText(`Score: ${result?.score ?? 0}`, CANVAS_WIDTH / 2, 360);
  if (result?.perfect) {
    ctx.fillStyle = '#FFD700';
    ctx.fillText('PERFECT!', CANVAS_WIDTH / 2, 390);
  }

  ctx.font = '20px "Courier New", monospace';
  ctx.fillStyle = '#39FF14';
  ctx.fillText('Press ENTER to continue', CANVAS_WIDTH / 2, 450);
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
