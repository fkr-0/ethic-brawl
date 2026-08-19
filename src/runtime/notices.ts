import {
  createArcadeNoticeQueue,
  drawArcadeNoticeCanvas,
  type ArcadeNotice,
  type ArcadeNoticeKind,
  type ArcadeUiTheme,
} from '@arcade/runtime/ui';

export type EthicNoticeTopic = 'renderer' | 'sprites' | 'settings' | 'input' | 'debug';

export interface EthicNoticeInput {
  topic: EthicNoticeTopic;
  message: string;
  title?: string;
  kind?: ArcadeNoticeKind;
  duration?: number;
  priority?: number;
  detail?: Readonly<Record<string, unknown>>;
}

export interface EthicNoticeSnapshot {
  current: ArcadeNotice | null;
  count: number;
  notices: readonly ArcadeNotice[];
}

/**
 * Presentation-only application notice state over Runtime 1.12's deduplicating
 * transient queue. Topics become stable dedupe keys, so repeated toggles update
 * the visible notice instead of flooding the queue.
 */
export function createEthicNoticeModel(
  options: { capacity?: number; defaultDuration?: number } = {}
) {
  const queue = createArcadeNoticeQueue({
    capacity: options.capacity ?? 6,
    defaultDuration: options.defaultDuration ?? 150,
  });

  return Object.freeze({
    push(input: EthicNoticeInput): ArcadeNotice {
      return queue.push({
        key: `ethic:${input.topic}`,
        message: input.message,
        title: input.title ?? input.topic.toUpperCase(),
        kind: input.kind ?? 'info',
        ...(input.duration === undefined ? {} : { duration: input.duration }),
        ...(input.priority === undefined ? {} : { priority: input.priority }),
        ...(input.detail === undefined ? {} : { detail: input.detail }),
      });
    },
    current(): ArcadeNotice | null {
      return queue.current();
    },
    step(delta = 1): ArcadeNotice | null {
      return queue.step(delta);
    },
    dismissCurrent(reason = 'dismiss'): boolean {
      const current = queue.current();
      return current ? queue.dismiss(current.id, reason) : false;
    },
    clear(reason = 'clear'): number {
      return queue.clear(reason);
    },
    snapshot(): EthicNoticeSnapshot {
      const snapshot = queue.snapshot();
      return Object.freeze({
        current: queue.current(),
        count: snapshot.notices.length,
        notices: snapshot.notices,
      });
    },
    queue,
  });
}

export type EthicNoticeModel = ReturnType<typeof createEthicNoticeModel>;

export type EthicNoticeDrawOptions = NonNullable<Parameters<typeof drawArcadeNoticeCanvas>[2]>;

/** Render the current notice without exposing Runtime queue internals to scenes. */
export function drawEthicNotice(
  context: CanvasRenderingContext2D,
  model: EthicNoticeModel,
  options: EthicNoticeDrawOptions = {},
  theme?: ArcadeUiTheme
) {
  return drawArcadeNoticeCanvas(context, model.current(), options, theme);
}
