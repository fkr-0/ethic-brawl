#!/usr/bin/env python3
"""Generate Ethic Brawl's deterministic desktop application icon."""

from __future__ import annotations

import argparse
import io
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "desktop" / "icon.png"
SIZE = 512


def build_icon() -> bytes:
    image = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    plate = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(plate)

    dark = (13, 5, 24, 255)
    dark_alt = (26, 10, 46, 255)
    cyan = (0, 245, 255, 255)
    magenta = (255, 0, 255, 255)

    bounds = (28, 28, SIZE - 28, SIZE - 28)
    draw.rounded_rectangle(bounds, radius=92, fill=dark, outline=dark_alt, width=12)

    # Deterministic CRT-like scan lines kept deliberately subtle at icon scale.
    for y in range(68, SIZE - 68, 18):
        draw.line((62, y, SIZE - 62, y), fill=(255, 255, 255, 10), width=2)

    glow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.rounded_rectangle((42, 42, SIZE - 42, SIZE - 42), radius=78, outline=cyan, width=14)
    glow_draw.arc((42, 42, SIZE - 42, SIZE - 42), 224, 44, fill=magenta, width=18)
    blurred = glow.filter(ImageFilter.GaussianBlur(18))
    image.alpha_composite(blurred)
    image.alpha_composite(plate)

    frame = ImageDraw.Draw(image)
    frame.rounded_rectangle((42, 42, SIZE - 42, SIZE - 42), radius=78, outline=cyan, width=8)
    frame.arc((42, 42, SIZE - 42, SIZE - 42), 224, 44, fill=magenta, width=10)

    # Geometric EB monogram: no font dependency, so generation is reproducible.
    stroke = 34
    left = 122
    mid = 244
    top = 150
    bottom = 362
    frame.line((left, top, left, bottom), fill=cyan, width=stroke)
    frame.line((left, top, mid, top), fill=cyan, width=stroke)
    frame.line((left, 256, mid - 18, 256), fill=cyan, width=stroke)
    frame.line((left, bottom, mid, bottom), fill=cyan, width=stroke)

    right = 284
    far = 392
    frame.line((right, top, right, bottom), fill=magenta, width=stroke)
    frame.arc((right - 16, top, far, 268), 270, 90, fill=magenta, width=stroke)
    frame.arc((right - 16, 244, far, bottom), 270, 90, fill=magenta, width=stroke)

    # A small cyan/magenta slash keeps the mark readable at 32px taskbar size.
    frame.polygon([(244, 126), (268, 126), (244, 386), (220, 386)], fill=(255, 255, 255, 210))

    buffer = io.BytesIO()
    image.save(buffer, format="PNG", optimize=True, compress_level=9)
    return buffer.getvalue()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail if desktop/icon.png is stale")
    args = parser.parse_args()

    expected = build_icon()
    if args.check:
        if not OUTPUT.exists():
            raise SystemExit(f"missing generated desktop icon: {OUTPUT.relative_to(ROOT)}")
        if OUTPUT.read_bytes() != expected:
            raise SystemExit(
                "desktop/icon.png is stale; run `pnpm desktop:icon` and commit the result"
            )
        print("desktop icon is reproducible and current")
        return 0

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_bytes(expected)
    print(f"wrote {OUTPUT.relative_to(ROOT)} ({len(expected)} bytes)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
