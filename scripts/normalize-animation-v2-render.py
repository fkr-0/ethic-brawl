#!/usr/bin/env python3
"""Normalize a built-in 1254px RGB sprite render to a 1024px RGBA 4x4 sheet."""

from __future__ import annotations

import argparse
from collections import deque
import hashlib
import json
from pathlib import Path
from statistics import median

from PIL import Image, ImageDraw

SOURCE_SIZE = 1254
GRID_SIZE = 4
CELL_SIZE = 256
OUTPUT_SIZE = GRID_SIZE * CELL_SIZE
REQUESTED_KEY = (255, 0, 255)


def parse_hex_color(value: str) -> tuple[int, int, int] | None:
    if value.lower() == "auto":
        return None
    text = value.removeprefix("#")
    if len(text) != 6:
        raise argparse.ArgumentTypeError("chroma key must be #RRGGBB")
    try:
        return tuple(int(text[index : index + 2], 16) for index in (0, 2, 4))
    except ValueError as error:
        raise argparse.ArgumentTypeError("chroma key must be #RRGGBB") from error


def grid_edges(length: int) -> list[int]:
    return [index * length // GRID_SIZE for index in range(GRID_SIZE + 1)]


def sample_border_key(source: Image.Image) -> tuple[int, int, int]:
    rgb = source.convert("RGB")
    samples: list[tuple[int, int, int]] = []
    depth = 4
    def pixels(image: Image.Image) -> list[tuple[int, int, int]]:
        return list(image.get_flattened_data())

    for offset in range(depth):
        samples.extend(pixels(rgb.crop((0, offset, rgb.width, offset + 1))))
        samples.extend(
            pixels(rgb.crop((0, rgb.height - offset - 1, rgb.width, rgb.height - offset)))
        )
        samples.extend(pixels(rgb.crop((offset, 0, offset + 1, rgb.height))))
        samples.extend(
            pixels(rgb.crop((rgb.width - offset - 1, 0, rgb.width - offset, rgb.height)))
        )
    return tuple(round(median(channel)) for channel in zip(*samples))


def remove_edge_connected_key(
    cell: Image.Image, key: tuple[int, int, int], threshold: int
) -> Image.Image:
    rgb = cell.convert("RGB")
    width, height = rgb.size
    pixels = rgb.load()
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()
    maximum = threshold * threshold

    def enqueue(x: int, y: int) -> None:
        offset = y * width + x
        if visited[offset]:
            return
        pixel = pixels[x, y]
        if sum((left - right) ** 2 for left, right in zip(pixel, key)) > maximum:
            return
        visited[offset] = 1
        queue.append((x, y))

    for x in range(width):
        enqueue(x, 0)
        enqueue(x, height - 1)
    for y in range(height):
        enqueue(0, y)
        enqueue(width - 1, y)

    while queue:
        x, y = queue.popleft()
        if x:
            enqueue(x - 1, y)
        if x + 1 < width:
            enqueue(x + 1, y)
        if y:
            enqueue(x, y - 1)
        if y + 1 < height:
            enqueue(x, y + 1)

    rgba = rgb.convert("RGBA")
    alpha = Image.new("L", (width, height), 255)
    alpha.putdata([0 if value else 255 for value in visited])
    rgba.putalpha(alpha)
    return rgba


def remove_magenta_spill(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = list(rgba.get_flattened_data())
    cleaned: list[tuple[int, int, int, int]] = []
    for red, green, blue, alpha in pixels:
        if alpha and red > green + 40 and blue > green + 40:
            cleaned.append((red, green, blue, 0))
        else:
            cleaned.append((red, green, blue, alpha))
    rgba.putdata(cleaned)
    return rgba


def normalize(
    source: Image.Image,
    key: tuple[int, int, int],
    threshold: int,
    content_scale: float,
) -> tuple[Image.Image, list[dict[str, object]]]:
    if source.size != (SOURCE_SIZE, SOURCE_SIZE):
        raise ValueError(
            f"expected {SOURCE_SIZE}x{SOURCE_SIZE}, got {source.width}x{source.height}"
        )
    if source.mode not in {"RGB", "RGBA"}:
        raise ValueError(f"expected RGB or RGBA source, got {source.mode}")

    x_edges = grid_edges(source.width)
    y_edges = grid_edges(source.height)
    output = Image.new("RGBA", (OUTPUT_SIZE, OUTPUT_SIZE), (0, 0, 0, 0))
    frames: list[dict[str, object]] = []

    for frame in range(GRID_SIZE * GRID_SIZE):
        row, column = divmod(frame, GRID_SIZE)
        bounds = (
            x_edges[column],
            y_edges[row],
            x_edges[column + 1],
            y_edges[row + 1],
        )
        cleaned = remove_edge_connected_key(source.crop(bounds), key, threshold)
        cleaned = remove_magenta_spill(cleaned)
        cleaned = cleaned.resize((CELL_SIZE, CELL_SIZE), Image.Resampling.NEAREST)
        scaled_size = round(CELL_SIZE * content_scale)
        cleaned = cleaned.resize((scaled_size, scaled_size), Image.Resampling.NEAREST)
        fitted = Image.new("RGBA", (CELL_SIZE, CELL_SIZE), (0, 0, 0, 0))
        fitted.alpha_composite(
            cleaned,
            ((CELL_SIZE - scaled_size) // 2, CELL_SIZE - scaled_size),
        )
        cleaned = fitted
        opaque_bounds = cleaned.getchannel("A").getbbox()
        if opaque_bounds is None:
            raise ValueError(f"frame {frame} is blank after chroma removal")
        left, top, right, bottom = opaque_bounds
        if left == 0 or top == 0 or right == CELL_SIZE or bottom == CELL_SIZE:
            raise ValueError(f"frame {frame} foreground touches its cell boundary")
        output.alpha_composite(cleaned, (column * CELL_SIZE, row * CELL_SIZE))
        frames.append(
            {
                "frame": frame,
                "source_bounds": list(bounds),
                "output_bounds": [left, top, right - left, bottom - top],
            }
        )
    return output, frames


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def write_result(
    input_path: Path,
    output_path: Path,
    receipt_path: Path | None,
    key: tuple[int, int, int] | None,
    threshold: int,
    content_scale: float,
) -> None:
    with Image.open(input_path) as source:
        observed_key = sample_border_key(source) if key is None else key
        output, frames = normalize(source, observed_key, threshold, content_scale)
        source_mode = source.mode
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output.save(output_path, format="PNG", optimize=True, compress_level=9)
    receipt = {
        "contract": "animation-v2-render-source-v1",
        "source": str(input_path),
        "source_size": [SOURCE_SIZE, SOURCE_SIZE],
        "source_mode": source_mode,
        "source_sha256": sha256(input_path),
        "requested_chroma_key": "#%02X%02X%02X" % REQUESTED_KEY,
        "observed_chroma_key": "#%02X%02X%02X" % observed_key,
        "chroma_threshold": threshold,
        "content_scale": content_scale,
        "split": "floor(i * 1254 / 4)",
        "output": str(output_path),
        "output_size": [OUTPUT_SIZE, OUTPUT_SIZE],
        "output_mode": "RGBA",
        "output_sha256": sha256(output_path),
        "frames": frames,
    }
    if receipt_path is not None:
        receipt_path.parent.mkdir(parents=True, exist_ok=True)
        receipt_path.write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")


def self_test() -> None:
    source = Image.new("RGB", (SOURCE_SIZE, SOURCE_SIZE), REQUESTED_KEY)
    draw = ImageDraw.Draw(source)
    edges = grid_edges(SOURCE_SIZE)
    for frame in range(16):
        row, column = divmod(frame, 4)
        draw.rectangle(
            (
                edges[column] + 70,
                edges[row] + 45,
                edges[column + 1] - 70,
                edges[row + 1] - 35,
            ),
            fill=(238, 232, 216),
        )
    assert sample_border_key(source) == REQUESTED_KEY
    output, frames = normalize(source, REQUESTED_KEY, 48, 0.9)
    assert output.size == (1024, 1024)
    assert output.mode == "RGBA"
    assert output.getpixel((0, 0))[3] == 0
    assert len(frames) == 16


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--receipt", type=Path)
    parser.add_argument("--chroma-key", type=parse_hex_color, default=None)
    parser.add_argument("--threshold", type=int, default=96)
    parser.add_argument("--content-scale", type=float, default=0.9)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return
    if args.input is None or args.output is None:
        parser.error("--input and --output are required unless --self-test is used")
    if not 0 <= args.threshold <= 96:
        parser.error("--threshold must be between 0 and 96")
    if not 0.75 <= args.content_scale <= 1.0:
        parser.error("--content-scale must be between 0.75 and 1.0")
    write_result(
        args.input,
        args.output,
        args.receipt,
        args.chroma_key,
        args.threshold,
        args.content_scale,
    )


if __name__ == "__main__":
    main()
