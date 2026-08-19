import type { SpectatorDetailLevel } from '@/app/app-shell/types';
import { CANVAS_WIDTH } from '@/app/config';
import { ARCADE_UI_FONT, ETHIC_UI, fitArcadeText } from '@/ui/arcade-ui';

export interface UiRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function resolveAiShowcaseLayout(
  detail: SpectatorDetailLevel,
  canvasWidth = CANVAS_WIDTH
): AiShowcaseLayout {
  const titleWidth = Math.min(500, canvasWidth - 460);
  const title: UiRectangle = {
    x: canvasWidth / 2 - titleWidth / 2,
    y: 78,
    width: titleWidth,
    height: 28,
  };
  if (detail === 'minimal') return { title, player1: null, player2: null };

  const panelWidth = 208;
  const panelHeight = detail === 'lab' ? 58 : 44;
  return {
    title,
    player1: { x: 14, y: 78, width: panelWidth, height: panelHeight },
    player2: {
      x: canvasWidth - panelWidth - 14,
      y: 78,
      width: panelWidth,
      height: panelHeight,
    },
  };
}

export interface AiShowcaseLayout {
  title: UiRectangle;
  player1: UiRectangle | null;
  player2: UiRectangle | null;
}

export interface AiShowcaseStatusModel {
  player1Name: string;
  player2Name: string;
  detail: SpectatorDetailLevel;
  player1Action: string;
  player2Action: string;
  player1AttackId: string | null;
  player2AttackId: string | null;
  player1ChainIndex: number;
  player2ChainIndex: number;
  player1Energy: number;
  player2Energy: number;
}

function formatTelemetryToken(value: string | null): string {
  if (!value) return 'SCANNING';
  return value.replaceAll('_', ' ').toUpperCase().slice(0, 24);
}

export function renderAiShowcaseStatus(
  ctx: CanvasRenderingContext2D,
  model: AiShowcaseStatusModel
): void {
  const label = `AI SHOWCASE // ${model.player1Name.toUpperCase()} VS ${model.player2Name.toUpperCase()}`;
  const layout = resolveAiShowcaseLayout(model.detail);

  ctx.save();
  ctx.fillStyle = 'rgba(8, 5, 16, 0.82)';
  ctx.fillRect(layout.title.x, layout.title.y, layout.title.width, layout.title.height);
  ctx.strokeStyle = ETHIC_UI.accentAlt;
  ctx.lineWidth = 1;
  ctx.strokeRect(layout.title.x, layout.title.y, layout.title.width, layout.title.height);
  ctx.textAlign = 'center';
  ctx.font = `700 11px ${ARCADE_UI_FONT}`;
  const fittedLabel = fitArcadeText(ctx, label, layout.title.width - 24);
  ctx.fillStyle = ETHIC_UI.text;
  ctx.fillText(fittedLabel, CANVAS_WIDTH / 2, layout.title.y + 18);

  if (layout.player1 && layout.player2) {
    const drawTelemetryPanel = (
      rectangle: UiRectangle,
      side: 'P1' | 'P2',
      action: string,
      attackId: string | null,
      chainIndex: number,
      energy: number,
      accent: string
    ) => {
      ctx.fillStyle = 'rgba(8, 5, 16, 0.88)';
      ctx.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
      ctx.strokeStyle = accent;
      ctx.strokeRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
      ctx.textAlign = 'left';
      ctx.font = `800 10px ${ARCADE_UI_FONT}`;
      ctx.fillStyle = accent;
      ctx.fillText(
        `${side} // ${formatTelemetryToken(action)}`,
        rectangle.x + 10,
        rectangle.y + 16
      );
      ctx.font = `650 9px ${ARCADE_UI_FONT}`;
      ctx.fillStyle = ETHIC_UI.text;
      ctx.fillText(formatTelemetryToken(attackId), rectangle.x + 10, rectangle.y + 32);
      if (model.detail === 'lab') {
        ctx.fillStyle = ETHIC_UI.muted;
        ctx.fillText(
          `CHAIN ${chainIndex + 1}  //  ENERGY ${energy}`,
          rectangle.x + 10,
          rectangle.y + 48
        );
      }
    };
    drawTelemetryPanel(
      layout.player1,
      'P1',
      model.player1Action,
      model.player1AttackId,
      model.player1ChainIndex,
      model.player1Energy,
      ETHIC_UI.accent
    );
    drawTelemetryPanel(
      layout.player2,
      'P2',
      model.player2Action,
      model.player2AttackId,
      model.player2ChainIndex,
      model.player2Energy,
      ETHIC_UI.warning
    );
  }
  ctx.restore();
}
