#!/usr/bin/env python3
"""Build and validate authored Animation v2 sprite sheets.

Existing Bakunin, Hegel, and Stirner runtime sheets are validated in-place.
The Deleuze/Guattari normal-attack POC is normalized cell-by-cell into the
canonical 1024x1024 RGBA runtime sheet and copied to the public asset tree.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
GRID_SIZE = 4
CELL_SIZE = 256
SHEET_SIZE = GRID_SIZE * CELL_SIZE

EXISTING_SHEETS = {
    "bakunin": (
        "bakunin_idle_turn_4x4.png",
        "bakunin_walk_forward_backward_4x4.png",
        "bakunin_run_start_loop_stop_4x4.png",
        "bakunin_jump_land_recovery_4x4.png",
        "bakunin_lane_guard_crouch_4x4.png",
    ),
    "hegel": (
        "hegel_idle_turn_4x4.png",
        "hegel_walk_forward_backward_4x4.png",
        "hegel_run_start_loop_stop_4x4.png",
        "hegel_jump_land_recovery_4x4.png",
        "hegel_lane_guard_crouch_4x4.png",
    ),
    "stirner": (
        "stirner_walk_forward_backward_4x4.png",
        "stirner_run_start_loop_stop_4x4.png",
        "stirner_jump_land_recovery_4x4.png",
        "stirner_lane_guard_crouch_4x4.png",
    ),
}
DELEUZE_ID = "deleuze_guattari"
DELEUZE_SOURCE = (
    ROOT
    / "assets/sprites/roster/deleuze_guattari/source/animation-v2"
    / "deleuze_guattari_normal_attacks_poc_4x4.png"
)
DELEUZE_OUTPUT_NAME = "deleuze_guattari_normal_attacks_4x4.png"
DELEUZE_ASSET_DIR = ROOT / "assets/sprites/roster/deleuze_guattari/source/animation-v2"
DELEUZE_PUBLIC_DIR = ROOT / "public/assets/sprites/roster/deleuze_guattari/source/animation-v2"

CLIPS = {
    "attack_light_v2": {"frames": [0, 1, 2, 3], "mode": "once", "duration": 3},
    "attack_medium_v2": {"frames": [4, 5, 6, 7], "mode": "once", "duration": 3},
    "attack_heavy_v2": {"frames": [8, 9, 10, 11], "mode": "once", "duration": 4},
    "air_attack_v2": {"frames": [12, 13, 14, 15], "mode": "once", "duration": 3},
}


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def grid_edges(length: int) -> list[int]:
    return [(index * length) // GRID_SIZE for index in range(GRID_SIZE + 1)]


def remove_light_matte_fringe(cell: Image.Image) -> Image.Image:
    """Remove only neutral-white border pixels touching existing transparency."""

    rgba = cell.convert("RGBA")
    width, height = rgba.size
    pixels = bytearray(rgba.tobytes())
    for _ in range(2):
        transparent = {
            index
            for index in range(width * height)
            if pixels[index * 4 + 3] <= 16
        }
        remove: list[int] = []
        for index in range(width * height):
            offset = index * 4
            red, green, blue, alpha = pixels[offset : offset + 4]
            if alpha <= 16:
                continue
            if min(red, green, blue) < 235 or max(red, green, blue) - min(red, green, blue) > 18:
                continue
            y, x = divmod(index, width)
            if any(
                0 <= x + dx < width
                and 0 <= y + dy < height
                and (y + dy) * width + x + dx in transparent
                for dy in (-1, 0, 1)
                for dx in (-1, 0, 1)
                if dx or dy
            ):
                remove.append(index)
        if not remove:
            break
        for index in remove:
            pixels[index * 4 + 3] = 0
    return Image.frombytes("RGBA", rgba.size, bytes(pixels))


def normalize_deleuze_sheet() -> tuple[Image.Image, list[dict[str, object]]]:
    if not DELEUZE_SOURCE.is_file():
        raise FileNotFoundError(f"Missing Deleuze/Guattari render source: {DELEUZE_SOURCE}")

    source = Image.open(DELEUZE_SOURCE).convert("RGBA")
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
            cell = remove_light_matte_fringe(cell)
            cell = cell.resize((CELL_SIZE, CELL_SIZE), Image.Resampling.NEAREST)
            alpha = cell.getchannel("A")
            visible_mask = alpha.point(lambda value: 255 if value > 16 else 0)
            bounds = visible_mask.getbbox()
            if bounds is None:
                raise RuntimeError(f"{DELEUZE_SOURCE.name}: frame {frame_index} is blank")
            left, top, right, bottom = bounds
            visible_pixels = visible_mask.histogram()[255]
            coverage = visible_pixels / (CELL_SIZE * CELL_SIZE)
            if not 0.01 <= coverage <= 0.70:
                raise RuntimeError(
                    f"{DELEUZE_SOURCE.name}: frame {frame_index} coverage {coverage:.4f} is implausible"
                )
            output.alpha_composite(cell, (column * CELL_SIZE, row * CELL_SIZE))
            frame_report.append(
                {
                    "frame": frame_index,
                    "opaque_bounds": [left, top, right - left, bottom - top],
                    "visible_coverage": round(coverage, 4),
                }
            )
    return output, frame_report


def write_png(image: Image.Image, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, format="PNG", optimize=True, compress_level=9)


def build_deleuze() -> None:
    image, frames = normalize_deleuze_sheet()
    asset_path = DELEUZE_ASSET_DIR / DELEUZE_OUTPUT_NAME
    public_path = DELEUZE_PUBLIC_DIR / DELEUZE_OUTPUT_NAME
    write_png(image, asset_path)
    write_png(image, public_path)
    manifest = {
        "character": DELEUZE_ID,
        "version": 1,
        "layout": "one 4x4 RGBA normal-attack sheet, row-major",
        "cell_size": [CELL_SIZE, CELL_SIZE],
        "authored_frame_count": 16,
        "runtime_note": (
            "Authored normal and air attacks are appended after the legacy core and "
            "extended sheets; legacy movement, reactions, and specials remain active."
        ),
        "source": str(DELEUZE_SOURCE.relative_to(ROOT)),
        "source_sha256": sha256(DELEUZE_SOURCE),
        "output": str(asset_path.relative_to(ROOT)),
        "output_sha256": sha256(asset_path),
        "clips": CLIPS,
        "frames": frames,
    }
    manifest_text = json.dumps(manifest, indent=2, sort_keys=True) + "\n"
    for directory in (DELEUZE_ASSET_DIR, DELEUZE_PUBLIC_DIR):
        directory.mkdir(parents=True, exist_ok=True)
        (directory / "manifest.json").write_text(manifest_text, encoding="utf-8")


def validate_sheet(path: Path) -> None:
    if not path.is_file():
        raise RuntimeError(f"Missing generated Animation v2 sheet: {path}")
    with Image.open(path) as image:
        if image.size != (SHEET_SIZE, SHEET_SIZE) or image.mode != "RGBA":
            raise RuntimeError(f"Invalid generated sheet {path}: {image.mode} {image.size}")


def check_character(character: str) -> None:
    if character == DELEUZE_ID:
        asset_path = DELEUZE_ASSET_DIR / DELEUZE_OUTPUT_NAME
        public_path = DELEUZE_PUBLIC_DIR / DELEUZE_OUTPUT_NAME
        validate_sheet(asset_path)
        validate_sheet(public_path)
        if sha256(asset_path) != sha256(public_path):
            raise RuntimeError("Deleuze/Guattari asset and public sheets differ")
        for directory in (DELEUZE_ASSET_DIR, DELEUZE_PUBLIC_DIR):
            manifest_path = directory / "manifest.json"
            if not manifest_path.is_file():
                raise RuntimeError(f"Missing generated manifest: {manifest_path}")
        return

    directory = ROOT / f"public/assets/sprites/roster/{character}/source/animation-v2"
    for name in EXISTING_SHEETS[character]:
        validate_sheet(directory / name)
    if not (directory / "manifest.json").is_file():
        raise RuntimeError(f"Missing generated manifest: {directory / 'manifest.json'}")


def selected_characters(value: str) -> list[str]:
    supported = [*EXISTING_SHEETS, DELEUZE_ID]
    if value == "all":
        return supported
    if value not in supported:
        raise ValueError(f"Unsupported character {value!r}; choose from all, {', '.join(supported)}")
    return [value]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--character", default="all")
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    characters = selected_characters(args.character)

    if not args.check and DELEUZE_ID in characters:
        build_deleuze()
    for character in characters:
        check_character(character)
    print(f"Animation v2 assets valid for: {', '.join(characters)}")


if __name__ == "__main__":
    main()
