import { resolveAiShowcaseLayout, type UiRectangle } from '@/ui/hud/ai-showcase-overlay';
import { describe, expect, it } from 'vitest';

function overlaps(a: UiRectangle, b: UiRectangle): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

describe('AI showcase HUD layout contract', () => {
  it.each(['tactical', 'lab'] as const)(
    'keeps %s telemetry inside the canvas and outside the title band',
    (detail) => {
      const canvasWidth = 960;
      const layout = resolveAiShowcaseLayout(detail, canvasWidth);
      expect(layout.player1).not.toBeNull();
      expect(layout.player2).not.toBeNull();
      if (!layout.player1 || !layout.player2) return;

      expect(layout.player1.x).toBeGreaterThanOrEqual(0);
      expect(layout.player2.x + layout.player2.width).toBeLessThanOrEqual(canvasWidth);
      expect(overlaps(layout.player1, layout.title)).toBe(false);
      expect(overlaps(layout.player2, layout.title)).toBe(false);
      expect(layout.title.y).toBeGreaterThanOrEqual(78);
      expect(
        Math.max(layout.player1.y + layout.player1.height, layout.player2.y + layout.player2.height)
      ).toBeLessThan(150);
    }
  );

  it('collapses to the title-only minimal broadcast', () => {
    const layout = resolveAiShowcaseLayout('minimal');
    expect(layout.player1).toBeNull();
    expect(layout.player2).toBeNull();
  });
});
