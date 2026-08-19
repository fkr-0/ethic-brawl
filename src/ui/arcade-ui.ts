/**
 * Ethic Brawl palette adapter over the canonical @arcade/runtime Canvas UI
 * composition. Geometry, typography rhythm, meters, chips and focus treatment
 * live in the shared runtime; this module only owns the title palette and
 * backwards-compatible local function names.
 */

import {
  ARCADE_UI_FONT,
  ARCADE_UI_UNIT,
  createArcadeUiTheme,
  drawArcadeBackdropCanvas,
  drawArcadeChipCanvas,
  drawArcadeCommandBarCanvas,
  drawArcadeFooterCanvas,
  drawArcadeMenuRowCanvas,
  drawArcadeMeterCanvas,
  drawArcadePanelCanvas,
  drawArcadeScreenTitleCanvas,
  drawArcadeTextBlockCanvas,
  fitArcadeTextCanvas,
} from '@arcade/runtime/ui';
import type {
  ArcadeChipOptions,
  ArcadeCommandAction,
  ArcadeCommandDevice,
  ArcadeMeterOptions,
  ArcadePanelOptions,
  ArcadeScreenTitleOptions,
  ArcadeUiTheme,
} from '@arcade/runtime/ui';

export { ARCADE_UI_FONT, ARCADE_UI_UNIT };
export type {
  ArcadeChipOptions,
  ArcadeCommandAction,
  ArcadeCommandDevice,
  ArcadeMeterOptions,
  ArcadePanelOptions,
  ArcadeScreenTitleOptions,
  ArcadeUiTheme,
};

export type ArcadeCommandBarOptions = Omit<
  Parameters<typeof drawArcadeCommandBarCanvas>[1],
  'actions' | 'device'
>;
export type ArcadeTextBlockOptions = Parameters<typeof drawArcadeTextBlockCanvas>[1];

export const ETHIC_UI: ArcadeUiTheme = createArcadeUiTheme({
  background: '#080511',
  backgroundRaised: '#1a0a2e',
  panel: 'rgba(13, 5, 24, 0.82)',
  panelStrong: 'rgba(8, 5, 16, 0.94)',
  text: '#f8f5ff',
  muted: '#b8a9c9',
  accent: '#00f5ff',
  accentAlt: '#ff00ff',
  warning: '#ff9f1c',
  danger: '#ff4b6e',
  line: 'rgba(184, 169, 201, 0.32)',
});

export function drawArcadeBackdrop(
  ctx: CanvasRenderingContext2D,
  theme: ArcadeUiTheme = ETHIC_UI
): void {
  drawArcadeBackdropCanvas(ctx, theme);
}

export function drawArcadeCommandBar(
  ctx: CanvasRenderingContext2D,
  actions: readonly ArcadeCommandAction[],
  device: ArcadeCommandDevice = 'keyboard',
  options: ArcadeCommandBarOptions = {},
  theme: ArcadeUiTheme = ETHIC_UI
) {
  return drawArcadeCommandBarCanvas(ctx, { ...options, actions, device }, theme);
}

export function drawArcadeTextBlock(
  ctx: CanvasRenderingContext2D,
  options: ArcadeTextBlockOptions,
  theme: ArcadeUiTheme = ETHIC_UI
) {
  return drawArcadeTextBlockCanvas(ctx, options, theme);
}

export function fitArcadeText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  return fitArcadeTextCanvas(ctx, text, maxWidth);
}

export function drawArcadeTabs(
  ctx: CanvasRenderingContext2D,
  tabs: readonly { id: string; label: string; glyph?: string }[],
  activeId: string,
  y: number,
  theme: ArcadeUiTheme = ETHIC_UI
): void {
  const totalWidth = Math.min(ctx.canvas.width - ARCADE_UI_UNIT * 20, tabs.length * 190);
  const tabWidth = totalWidth / Math.max(1, tabs.length);
  const startX = (ctx.canvas.width - totalWidth) / 2;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const [index, tab] of tabs.entries()) {
    const active = tab.id === activeId;
    const x = startX + index * tabWidth;
    ctx.fillStyle = active ? `${theme.accent}22` : theme.panel;
    ctx.fillRect(x, y, tabWidth - 2, 34);
    ctx.fillStyle = active ? theme.accent : theme.line;
    ctx.fillRect(x, y + 32, tabWidth - 2, active ? 2 : 1);
    ctx.font = `${active ? 800 : 650} 13px ${ARCADE_UI_FONT}`;
    ctx.fillStyle = active ? theme.text : theme.muted;
    ctx.fillText(`${tab.glyph ?? '·'} ${tab.label}`.toUpperCase(), x + tabWidth / 2, y + 17);
  }
  ctx.restore();
}

export function drawArcadeSettingRow(
  ctx: CanvasRenderingContext2D,
  options: {
    x: number;
    y: number;
    width: number;
    label: string;
    value: string;
    description: string;
    selected: boolean;
  },
  theme: ArcadeUiTheme = ETHIC_UI
): void {
  const height = 68;
  ctx.save();
  ctx.fillStyle = options.selected ? `${theme.accent}18` : theme.panel;
  ctx.fillRect(options.x, options.y, options.width, height);
  ctx.strokeStyle = options.selected ? theme.accent : theme.line;
  ctx.lineWidth = options.selected ? 2 : 1;
  ctx.strokeRect(options.x, options.y, options.width, height);
  ctx.fillStyle = options.selected ? theme.accent : theme.line;
  ctx.fillRect(options.x, options.y, options.selected ? 6 : 2, height);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `${options.selected ? 800 : 700} 17px ${ARCADE_UI_FONT}`;
  ctx.fillStyle = options.selected ? theme.text : theme.muted;
  ctx.fillText(options.label.toUpperCase(), options.x + 22, options.y + 27);
  ctx.font = `600 11px ${ARCADE_UI_FONT}`;
  ctx.fillStyle = theme.muted;
  ctx.fillText(options.description.toUpperCase(), options.x + 22, options.y + 50);

  ctx.textAlign = 'right';
  ctx.font = `900 14px ${ARCADE_UI_FONT}`;
  ctx.fillStyle = options.selected ? theme.warning : theme.accentAlt;
  ctx.fillText(options.value, options.x + options.width - 22, options.y + 29);
  ctx.restore();
}

export function drawArcadePanel(
  ctx: CanvasRenderingContext2D,
  options: ArcadePanelOptions,
  theme: ArcadeUiTheme = ETHIC_UI
): void {
  drawArcadePanelCanvas(ctx, options, theme);
}

export function drawArcadeMenuRow(
  ctx: CanvasRenderingContext2D,
  label: string,
  x: number,
  y: number,
  width: number,
  selected: boolean,
  theme: ArcadeUiTheme = ETHIC_UI
): void {
  drawArcadeMenuRowCanvas(ctx, label, x, y, width, selected, theme);
}

export function drawArcadeFooter(
  ctx: CanvasRenderingContext2D,
  text: string,
  theme: ArcadeUiTheme = ETHIC_UI
): void {
  drawArcadeFooterCanvas(ctx, text, theme);
}

export function drawArcadeChip(
  ctx: CanvasRenderingContext2D,
  options: ArcadeChipOptions,
  theme: ArcadeUiTheme = ETHIC_UI
): void {
  drawArcadeChipCanvas(ctx, options, theme);
}

export function drawArcadeMeter(
  ctx: CanvasRenderingContext2D,
  options: ArcadeMeterOptions,
  theme: ArcadeUiTheme = ETHIC_UI
): void {
  drawArcadeMeterCanvas(ctx, options, theme);
}

export function drawArcadeScreenTitle(
  ctx: CanvasRenderingContext2D,
  options: ArcadeScreenTitleOptions,
  theme: ArcadeUiTheme = ETHIC_UI
): void {
  drawArcadeScreenTitleCanvas(ctx, options, theme);
}
