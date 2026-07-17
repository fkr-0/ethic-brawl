#!/usr/bin/env python3
"""Normalize legacy fighter sheets and build deterministic 32-frame extensions.

The first four fighters predate the roster atlas contract and ship as large
RGB sheets on uneven light backgrounds. This tool converts those sheets to the
same transparent 512x512 / 4x4 layout used by the release roster, then derives
the second 16-frame bank used for attacks, specials, reactions, recovery, and
victory poses. Existing authored files are preserved unless --force is passed.
"""

from __future__ import annotations

import argparse
from collections import deque
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SHEET_SIZE = 512
CELL = SHEET_SIZE // 4
CONTENT_WIDTH = 112
CONTENT_HEIGHT = 118


@dataclass(frozen=True)
class CharacterSource:
    source: Path
    accent: str
    normalize_core: bool = True


CHARACTERS = {
    "camus": CharacterSource(
        ROOT / "public/assets/sprites/camus/source/camus.png", "#E8D34F"
    ),
    "leibniz": CharacterSource(
        ROOT / "public/assets/sprites/leibniz/source/leibniz.png", "#55D6FF"
    ),
    "machiavelli": CharacterSource(
        ROOT / "public/assets/sprites/machiavelli/source/machiavelli.png",
        "#D94B64",
    ),
    "diogenes": CharacterSource(
        ROOT / "public/assets/sprites/diogenes/source/diogenes.png", "#D9A441"
    ),
    "deleuze_guattari": CharacterSource(
        ROOT
        / "public/assets/sprites/roster/deleuze_guattari/source/deleuze_guattari_core_4x4.png",
        "#E75EFF",
        normalize_core=False,
    ),
}

# source frame, scale, shift x/y, rotation, effect
EXTENSION_RECIPES = [
    (12, 1.00, -3, 0, 0, "trail"),
    (12, 1.08, 4, -2, 0, "impact"),
    (13, 1.00, -3, 0, 0, "trail"),
    (13, 1.08, 4, -2, 0, "impact"),
    (14, 1.00, -3, 0, 0, "trail"),
    (14, 1.12, 4, -3, 0, "impact"),
    (15, 1.00, 0, 0, 0, "charge"),
    (15, 1.08, 0, -4, 0, "aura"),
    (1, 1.00, 0, 0, 0, "guard"),
    (2, 1.00, 0, 0, 0, "guard"),
    (11, 1.00, -4, 3, 0, "hurt"),
    (8, 1.00, 5, 5, 0, "hurt"),
    (10, 0.92, 0, 11, 72, "dust"),
    (11, 0.96, -3, 7, 22, "dust"),
    (8, 1.00, 0, 4, 0, "rise"),
    (3, 1.06, 0, -2, 0, "aura"),
]


def grid_frame(sheet: Image.Image, frame_index: int) -> Image.Image:
    row, column = divmod(frame_index, 4)
    left = (column * sheet.width) // 4
    right = ((column + 1) * sheet.width) // 4
    top = (row * sheet.height) // 4
    bottom = ((row + 1) * sheet.height) // 4
    return sheet.crop((left, top, right, bottom)).convert("RGBA")


def is_light_background(pixel: tuple[int, int, int, int]) -> bool:
    red, green, blue, _ = pixel
    return min(red, green, blue) >= 202 and max(red, green, blue) - min(
        red, green, blue
    ) <= 42


def remove_connected_background(frame: Image.Image) -> Image.Image:
    """Remove only near-neutral light pixels connected to the cell boundary."""

    rgba = frame.convert("RGBA")
    pixels = rgba.load()
    width, height = rgba.size
    queue: deque[tuple[int, int]] = deque()
    visited = bytearray(width * height)

    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))

    while queue:
        x, y = queue.popleft()
        index = y * width + x
        if visited[index]:
            continue
        visited[index] = 1
        if not is_light_background(pixels[x, y]):
            continue
        red, green, blue, _ = pixels[x, y]
        brightness = min(red, green, blue)
        alpha = max(0, min(90, (232 - brightness) * 3))
        pixels[x, y] = (red, green, blue, alpha)
        if x > 0:
            queue.append((x - 1, y))
        if x + 1 < width:
            queue.append((x + 1, y))
        if y > 0:
            queue.append((x, y - 1))
        if y + 1 < height:
            queue.append((x, y + 1))

    return rgba


def fit_to_cell(frame: Image.Image) -> Image.Image:
    alpha_box = frame.getchannel("A").getbbox()
    figure = frame.crop(alpha_box) if alpha_box else frame
    scale = min(CONTENT_WIDTH / figure.width, CONTENT_HEIGHT / figure.height, 1.0)
    size = (
        max(1, round(figure.width * scale)),
        max(1, round(figure.height * scale)),
    )
    figure = figure.resize(size, Image.Resampling.LANCZOS)
    cell = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    cell.alpha_composite(figure, ((CELL - figure.width) // 2, CELL - figure.height - 4))
    return cell


def normalize_legacy_core(source: Path) -> Image.Image:
    with Image.open(source) as opened:
        sheet = opened.convert("RGBA")
    normalized = Image.new("RGBA", (SHEET_SIZE, SHEET_SIZE), (0, 0, 0, 0))
    for frame_index in range(16):
        frame = fit_to_cell(remove_connected_background(grid_frame(sheet, frame_index)))
        row, column = divmod(frame_index, 4)
        normalized.alpha_composite(frame, (column * CELL, row * CELL))
    return normalized


def transform_frame(
    source: Image.Image,
    scale: float,
    shift_x: int,
    shift_y: int,
    rotation: int,
) -> Image.Image:
    alpha_box = source.getchannel("A").getbbox()
    figure = source.crop(alpha_box) if alpha_box else source
    size = (
        max(1, round(figure.width * scale)),
        max(1, round(figure.height * scale)),
    )
    figure = figure.resize(size, Image.Resampling.NEAREST)
    if rotation:
        figure = figure.rotate(rotation, resample=Image.Resampling.NEAREST, expand=True)
    frame = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
    x = (CELL - figure.width) // 2 + shift_x
    y = CELL - figure.height - 4 + shift_y
    frame.alpha_composite(figure, (x, y))
    return frame


def draw_effect(frame: Image.Image, effect: str, accent: str) -> None:
    draw = ImageDraw.Draw(frame)
    if effect == "trail":
        draw.line([(10, 78), (36, 64), (55, 58)], fill=accent, width=4)
        draw.line([(14, 91), (42, 80)], fill=accent, width=3)
    elif effect == "impact":
        draw.line([(92, 39), (118, 25)], fill=accent, width=5)
        draw.line([(96, 55), (125, 54)], fill=accent, width=4)
        draw.line([(91, 70), (117, 84)], fill=accent, width=4)
    elif effect in {"charge", "aura"}:
        draw.arc((15, 9, 113, 124), 195, 345, fill=accent, width=4)
        draw.arc((24, 18, 104, 112), 20, 160, fill=accent, width=3)
        if effect == "aura":
            for x, y in ((19, 40), (104, 34), (13, 84), (109, 87)):
                draw.rectangle((x, y, x + 4, y + 4), fill=accent)
    elif effect == "guard":
        draw.arc((18, 18, 112, 121), 255, 75, fill=accent, width=4)
    elif effect == "hurt":
        draw.line([(89, 30), (110, 16)], fill="#FF4F66", width=4)
        draw.line([(96, 43), (123, 40)], fill="#FF4F66", width=3)
    elif effect == "dust":
        for x, y in ((22, 111), (39, 117), (93, 114), (108, 106)):
            draw.ellipse((x, y, x + 7, y + 4), fill="#8A7E88")
    elif effect == "rise":
        draw.line([(21, 104), (13, 84)], fill=accent, width=3)
        draw.line([(107, 103), (117, 83)], fill=accent, width=3)


def build_extension(core: Image.Image, accent: str) -> Image.Image:
    extension = Image.new("RGBA", (SHEET_SIZE, SHEET_SIZE), (0, 0, 0, 0))
    for target_index, recipe in enumerate(EXTENSION_RECIPES):
        source_index, scale, shift_x, shift_y, rotation, effect = recipe
        frame = transform_frame(
            grid_frame(core, source_index), scale, shift_x, shift_y, rotation
        )
        draw_effect(frame, effect, accent)
        row, column = divmod(target_index, 4)
        extension.alpha_composite(frame, (column * CELL, row * CELL))
    return extension


def build_character(character_id: str, source: CharacterSource, force: bool) -> list[Path]:
    output_dir = ROOT / "public/assets/sprites/roster" / character_id / "source"
    output_dir.mkdir(parents=True, exist_ok=True)
    core_path = output_dir / f"{character_id}_core_4x4.png"
    extension_path = output_dir / f"{character_id}_extended_4x4.png"
    written: list[Path] = []

    if source.normalize_core and (force or not core_path.exists()):
        core = normalize_legacy_core(source.source)
        core.save(core_path, optimize=True)
        written.append(core_path)
    else:
        with Image.open(core_path if core_path.exists() else source.source) as opened:
            core = opened.convert("RGBA")

    if force or not extension_path.exists():
        extension = build_extension(core, source.accent)
        extension.save(extension_path, optimize=True)
        written.append(extension_path)

    return written


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--force", action="store_true", help="overwrite existing authored sheets"
    )
    args = parser.parse_args()

    written: list[Path] = []
    for character_id, source in CHARACTERS.items():
        written.extend(build_character(character_id, source, args.force))

    for path in written:
        print(path.relative_to(ROOT))
    print(f"wrote {len(written)} release character atlas files")


if __name__ == "__main__":
    main()
