import { getSettingsRows, SETTINGS_TABS } from '@/app/app-shell/settings-model';
import type { SettingsState } from '@/app/app-shell/types';
import { CANVAS_WIDTH } from '@/app/config';
import {
  GAME_ACTIONS,
  GAME_ACTION_LABELS,
  formatBindingForDisplay,
} from '@/core/input/input-binding';
import {
  ARCADE_UI_FONT,
  ETHIC_UI,
  drawArcadeBackdrop,
  drawArcadeFooter,
  drawArcadePanel,
  drawArcadeSettingRow,
  drawArcadeTabs,
} from '@/ui/arcade-ui';

export function renderSettings(ctx: CanvasRenderingContext2D, settings: SettingsState): void {
  drawArcadeBackdrop(ctx);
  drawArcadePanel(ctx, {
    x: 68,
    y: 96,
    width: CANVAS_WIDTH - 136,
    height: 382,
    accent: ETHIC_UI.accentAlt,
    strong: true,
    label: 'Configuration matrix',
  });
  ctx.textAlign = 'center';

  ctx.font = `900 38px ${ARCADE_UI_FONT}`;
  ctx.fillStyle = ETHIC_UI.accent;
  ctx.fillText('CONFIGURATION LAB', CANVAS_WIDTH / 2, 78);
  drawArcadeTabs(ctx, SETTINGS_TABS, settings.menuTab, 112);

  if (settings.menuTab !== 'keybindings') {
    const rows = getSettingsRows(settings);
    rows.forEach((row, index) => {
      drawArcadeSettingRow(ctx, {
        x: 100,
        y: 164 + index * 82,
        width: CANVAS_WIDTH - 200,
        label: row.label,
        value: row.value,
        description: row.description,
        selected: settings.selectedIndex === index,
      });
    });
  } else {
    ctx.textAlign = 'left';
    ctx.font = `700 15px ${ARCADE_UI_FONT}`;
    ctx.fillStyle = ETHIC_UI.accent;
    ctx.fillText('ACTION', 96, 174);
    ctx.fillStyle = '#39FF14';
    ctx.fillText('PLAYER 1', 370, 174);
    ctx.fillStyle = ETHIC_UI.warning;
    ctx.fillText('PLAYER 2', 560, 174);

    ctx.font = `14px ${ARCADE_UI_FONT}`;
    GAME_ACTIONS.forEach((action, index) => {
      const y = 203 + index * 25;
      const active = settings.selectedIndex === index;
      ctx.fillStyle = active ? ETHIC_UI.text : ETHIC_UI.muted;
      ctx.fillText(active ? `> ${GAME_ACTION_LABELS[action]}` : GAME_ACTION_LABELS[action], 96, y);
      ctx.fillStyle = active ? ETHIC_UI.text : '#39FF14';
      ctx.fillText(formatBindingForDisplay(settings.bindings.player1, action), 370, y);
      ctx.fillStyle = ETHIC_UI.warning;
      ctx.fillText(formatBindingForDisplay(settings.bindings.player2, action), 560, y);
    });

    const resetY = 203 + GAME_ACTIONS.length * 25;
    ctx.fillStyle = settings.selectedIndex === GAME_ACTIONS.length ? ETHIC_UI.text : ETHIC_UI.muted;
    ctx.fillText(
      settings.selectedIndex === GAME_ACTIONS.length
        ? '> Reset All Bindings'
        : 'Reset All Bindings',
      96,
      resetY
    );

    if (settings.keybindingEdit) {
      ctx.fillStyle = 'rgba(8, 5, 16, 0.94)';
      ctx.fillRect(120, 210, CANVAS_WIDTH - 240, 180);
      ctx.strokeStyle = ETHIC_UI.text;
      ctx.lineWidth = 2;
      ctx.strokeRect(120, 210, CANVAS_WIDTH - 240, 180);
      ctx.textAlign = 'center';
      ctx.font = `800 24px ${ARCADE_UI_FONT}`;
      ctx.fillStyle = ETHIC_UI.text;
      ctx.fillText('PRESS A NEW KEY', CANVAS_WIDTH / 2, 270);
      ctx.font = `18px ${ARCADE_UI_FONT}`;
      ctx.fillStyle = ETHIC_UI.muted;
      ctx.fillText(
        `P${settings.keybindingEdit.playerId} ${GAME_ACTION_LABELS[settings.keybindingEdit.action]}`,
        CANVAS_WIDTH / 2,
        312
      );
      ctx.fillText('CANCEL keeps the current binding', CANVAS_WIDTH / 2, 350);
    }
  }

  drawArcadeFooter(ctx, 'W/S select  //  A/D tab  //  Enter change  //  Esc back');
}
