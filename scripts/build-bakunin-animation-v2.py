#!/usr/bin/env python3
"""Prepare the authored Bakunin render jobs for runtime use.

The rendering model returned four 1254px RGB sheets with a baked checkerboard
and one 1024px RGBA sheet. This builder normalizes all five sources to exact
1024x1024 RGBA grids without re-anchoring individual frames, preserving the
authored root motion and timing while removing edge-connected light backgrounds.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import deque
from dataclasses import dataclass
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
RENDER_DIR = ROOT / "docs/prompts/fighter-animation-v2/render-jobs/bakunin"
ASSET_DIR = ROOT / "assets/sprites/roster/bakunin/source/animation-v2"
PUBLIC_DIR = ROOT / "public/assets/sprites/roster/bakunin/source/animation-v2"
GRID_SIZE = 4
CELL_SIZE = 256
SHEET_SIZE = GRID_SIZE * CELL_SIZE


@dataclass(frozen=True)
class SheetSpec:
    source: str
    output: str
    clips: dict[str, dict[str, object]]


SHEETS = (
    SheetSpec(
        source="016_upload_file_00000000545481f49052690ef0cb25b5.png",
        output="bakunin_idle_turn_4x4.png",
        clips={
            "idle_v2": {"frames": list(range(0, 8)), "mode": "loop", "duration": 7},
            "turn_left_v2": {"frames": list(range(8, 12)), "mode": "once", "duration": 3},
            "turn_right_v2": {"frames": list(range(12, 16)), "mode": "once", "duration": 3},
        },
    ),
    SheetSpec(
        source="bakunin_walk.png",
        output="bakunin_walk_forward_backward_4x4.png",
        clips={
            "walk_forward_v2": {"frames": list(range(0, 8)), "mode": "loop", "duration": 4},
            "walk_backward_v2": {"frames": list(range(8, 16)), "mode": "loop", "duration": 5},
        },
    ),
    SheetSpec(
        source="bakunin_run.png",
        output="bakunin_run_start_loop_stop_4x4.png",
        clips={
            "run_start_v2": {"frames": list(range(0, 4)), "mode": "once", "duration": 3},
            "run_v2": {"frames": list(range(4, 12)), "mode": "loop", "duration": 3},
            "run_stop_v2": {"frames": list(range(12, 16)), "mode": "once", "duration": 4},
        },
    ),
    SheetSpec(
        source="bakunin_jump.png",
        output="bakunin_jump_land_recovery_4x4.png",
        clips={
            "jump_takeoff_v2": {"frames": list(range(0, 4)), "mode": "once", "duration": 3},
            "jump_air_v2": {"frames": list(range(4, 8)), "mode": "once", "duration": 4},
            "land_v2": {"frames": list(range(8, 12)), "mode": "once", "duration": 3},
            "land_recovery_v2": {"frames": list(range(12, 16)), "mode": "once", "duration": 4},
        },
    ),
    SheetSpec(
        source="bakunin_crouch.png",
        output="bakunin_lane_guard_crouch_4x4.png",
        clips={
            "lane_away_v2": {"frames": list(range(0, 4)), "mode": "once", "duration": 3},
            "lane_toward_v2": {"frames": list(range(4, 8)), "mode": "once", "duration": 3},
            "crouch_v2": {"frames": list(range(8, 12)), "mode": "once", "duration": 4},
            "guard_v2": {"frames": list(range(12, 16)), "mode": "once", "duration": 4},
        },
    ),
)


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def grid_edges(length: int) -> list[int]:
    """Return exact proportional edges for sheets not divisible by four."""

    return [(index * length) // GRID_SIZE for index in range(GRID_SIZE + 1)]


def remove_edge_connected_light_background(cell: Image.Image) -> Image.Image:
    """Remove checkerboard pixels while preserving enclosed highlights.

    Only light, low-chroma pixels connected to a cell edge are keyed. This is
    deliberately more conservative than a global white threshold so beard,
    smoke, skin highlights, and fuse sparks remain intact.
    """

    rgba = cell.convert("RGBA")
    pixels = bytearray(rgba.tobytes())
    if any(alpha < 250 for alpha in pixels[3::4]):
        return rgba

    width, height = rgba.size
    pixel_count = width * height
    candidate = bytearray(pixel_count)
    for pixel_index in range(pixel_count):
        offset = pixel_index * 4
        red, green, blue = pixels[offset : offset + 3]
        channel_min = min(red, green, blue)
        channel_max = max(red, green, blue)
        luminance = (red + green + blue) / 3
        candidate[pixel_index] = int(luminance >= 205 and channel_max - channel_min <= 24)

    visited = bytearray(pixel_count)
    queue: deque[int] = deque()

    def enqueue(y: int, x: int) -> None:
        if not (0 <= y < height and 0 <= x < width):
            return
        pixel_index = y * width + x
        if candidate[pixel_index] and not visited[pixel_index]:
            visited[pixel_index] = 1
            queue.append(pixel_index)

    for x in range(width):
        enqueue(0, x)
        enqueue(height - 1, x)
    for y in range(height):
        enqueue(y, 0)
        enqueue(y, width - 1)

    while queue:
        pixel_index = queue.popleft()
        y, x = divmod(pixel_index, width)
        enqueue(y - 1, x)
        enqueue(y + 1, x)
        enqueue(y, x - 1)
        enqueue(y, x + 1)

    for pixel_index, is_background in enumerate(visited):
        if is_background:
            pixels[pixel_index * 4 + 3] = 0
    return Image.frombytes("RGBA", rgba.size, bytes(pixels))


def prepare_sheet(source_path: Path) -> tuple[Image.Image, list[dict[str, object]]]:
    source = Image.open(source_path)
    x_edges = grid_edges(source.width)
    y_edges = grid_edges(source.height)
    output = Image.new("RGBA", (SHEET_SIZE, SHEET_SIZE), (0, 0, 0, 0))
    frame_report: list[dict[str, object]] = []

    for row in range(GRID_SIZE):
        for column in range(GRID_SIZE):
            frame_index = row * GRID_SIZE + column
            cell = source.crop(
                (x_edges[column], y_edges[row], x_edges[column + 1], y_edges[row + 1])
            )
            cell = remove_edge_connected_light_background(cell)
            cell = cell.resize((CELL_SIZE, CELL_SIZE), Image.Resampling.NEAREST)
            output.alpha_composite(cell, (column * CELL_SIZE, row * CELL_SIZE))

            alpha = cell.getchannel("A")
            visible_mask = alpha.point(lambda value: 255 if value > 16 else 0)
            bounds = visible_mask.getbbox()
            if bounds is None:
                raise RuntimeError(f"{source_path.name}: frame {frame_index} is blank")
            left, top, right, bottom = bounds
            visible_pixels = sum(visible_mask.histogram()[1:])
            frame_report.append(
                {
                    "frame": frame_index,
                    "opaque_bounds": [left, top, right - left, bottom - top],
                    "visible_coverage": round(visible_pixels / (CELL_SIZE * CELL_SIZE), 4),
                }
            )

    return output, frame_report


def write_png(image: Image.Image, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, format="PNG", optimize=True, compress_level=9)


def build() -> dict[str, object]:
    manifest_sheets: list[dict[str, object]] = []
    for sheet_index, spec in enumerate(SHEETS):
        source_path = RENDER_DIR / spec.source
        if not source_path.is_file():
            raise FileNotFoundError(f"Missing Bakunin render source: {source_path}")

        image, frame_report = prepare_sheet(source_path)
        asset_path = ASSET_DIR / spec.output
        public_path = PUBLIC_DIR / spec.output
        write_png(image, asset_path)
        write_png(image, public_path)

        manifest_sheets.append(
            {
                "sheet_index": sheet_index,
                "frame_offset": sheet_index * 16,
                "source": str(source_path.relative_to(ROOT)),
                "source_sha256": sha256(source_path),
                "output": str(asset_path.relative_to(ROOT)),
                "output_sha256": sha256(asset_path),
                "clips": spec.clips,
                "frames": frame_report,
            }
        )

    manifest: dict[str, object] = {
        "character": "bakunin",
        "version": 1,
        "layout": "five 4x4 RGBA sheets, row-major",
        "cell_size": [CELL_SIZE, CELL_SIZE],
        "authored_frame_count": len(SHEETS) * 16,
        "runtime_note": "Legacy core and extended sheets are appended by the runtime for combat-only fallback frames.",
        "sheets": manifest_sheets,
    }
    manifest_text = json.dumps(manifest, indent=2, sort_keys=True) + "\n"
    for directory in (ASSET_DIR, PUBLIC_DIR):
        directory.mkdir(parents=True, exist_ok=True)
        (directory / "manifest.json").write_text(manifest_text, encoding="utf-8")
    return manifest


def check() -> None:
    expected = {spec.output for spec in SHEETS} | {"manifest.json"}
    for directory in (ASSET_DIR, PUBLIC_DIR):
        missing = sorted(name for name in expected if not (directory / name).is_file())
        if missing:
            raise RuntimeError(f"Missing generated files in {directory}: {', '.join(missing)}")
        for spec in SHEETS:
            image = Image.open(directory / spec.output)
            if image.size != (SHEET_SIZE, SHEET_SIZE) or image.mode != "RGBA":
                raise RuntimeError(
                    f"Invalid generated sheet {directory / spec.output}: {image.mode} {image.size}"
                )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="validate existing generated outputs")
    args = parser.parse_args()
    if args.check:
        check()
        print("Bakunin Animation v2 assets are present and structurally valid.")
        return

    manifest = build()
    check()
    print(
        f"Built {manifest['authored_frame_count']} Bakunin frames across {len(SHEETS)} sheets."
    )


if __name__ == "__main__":
    main()
