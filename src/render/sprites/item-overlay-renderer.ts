import {
  type FrameAnchorTransform,
  type ItemVisualDefinition,
  type ItemVisualFrameRole,
  resolveItemVisualFrame,
} from '@/game/items/item-visuals';
import { loadImage } from './sprite-assets';

export interface ItemOverlayRenderOptions {
  flipX?: boolean;
  opacity?: number;
  debug?: boolean;
}

const itemImageCache = new Map<string, Promise<HTMLImageElement>>();

export function loadItemVisualImage(src: string): Promise<HTMLImageElement> {
  const cached = itemImageCache.get(src);
  if (cached) {
    return cached;
  }

  const promise = loadImage(src);
  itemImageCache.set(src, promise);
  return promise;
}

export function clearItemVisualImageCache(): void {
  itemImageCache.clear();
}

export async function renderItemOverlayAtAnchor(
  ctx: CanvasRenderingContext2D,
  visual: ItemVisualDefinition,
  anchor: FrameAnchorTransform,
  role: ItemVisualFrameRole,
  options: ItemOverlayRenderOptions = {}
): Promise<boolean> {
  const frame = resolveItemVisualFrame(visual, role);
  if (!frame) {
    return false;
  }

  const image = await loadItemVisualImage(frame.imagePath);
  const sourceWidth = frame.sourceWidth ?? image.width;
  const sourceHeight = frame.sourceHeight ?? image.height;
  const { transform } = visual;
  const flipX = options.flipX ?? false;
  const facingSign = flipX ? -1 : 1;

  ctx.save();
  ctx.globalAlpha = options.opacity ?? 1;
  ctx.translate(anchor.x, anchor.y);
  ctx.scale(facingSign, 1);
  ctx.rotate(((anchor.angleDeg + transform.gripAngleDeg) * Math.PI) / 180);
  ctx.scale(transform.scale, transform.scale);
  ctx.translate(transform.offset.x, transform.offset.y);

  ctx.drawImage(
    image,
    frame.sourceX,
    frame.sourceY,
    sourceWidth,
    sourceHeight,
    -transform.pivot.x,
    -transform.pivot.y,
    sourceWidth,
    sourceHeight
  );

  if (options.debug) {
    ctx.strokeStyle = '#ff00ff';
    ctx.strokeRect(-transform.pivot.x, -transform.pivot.y, sourceWidth, sourceHeight);
  }

  ctx.restore();
  return true;
}
