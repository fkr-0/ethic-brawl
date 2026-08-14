#!/usr/bin/env python3
"""Prepare authored Animation v2 render jobs for runtime use.

The rendering model returned a mixture of 1254px RGB/RGBA sheets with baked
checkerboards and 1024px RGBA sheets. This builder normalizes the configured
characters to exact 1024x1024 RGBA grids without independently re-anchoring
frames, preserving authored root motion while removing edge-connected light
backgrounds. Characters with hand-reviewed curation files can additionally
select or repeat individual source frames, apply explicit root alignment, and
use fitted paper-background subtraction before the runtime atlas is assembled.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from collections import deque
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
GRID_SIZE = 4
CELL_SIZE = 256
SHEET_SIZE = GRID_SIZE * CELL_SIZE


@dataclass(frozen=True)
class SheetSpec:
    source: str
    output_suffix: str
    clips: dict[str, dict[str, object]]
    source_columns: int = GRID_SIZE
    source_rows: int = GRID_SIZE
    source_frames: tuple[int, ...] = tuple(range(GRID_SIZE * GRID_SIZE))
    frame_offsets: tuple[tuple[int, int], ...] = tuple(
        (0, 0) for _ in range(GRID_SIZE * GRID_SIZE)
    )
    frame_scales: tuple[float, ...] = tuple(1.0 for _ in range(GRID_SIZE * GRID_SIZE))
    cleanup_transparent_edges: bool = False
    background_mode: str = "light-edge"
    background_threshold: float = 60.0
    background_overrides: tuple[tuple[int, str, float], ...] = ()


@dataclass(frozen=True)
class CharacterSpec:
    character: str
    idle_source: str | None = None
    walk_source: str | None = None
    run_source: str | None = None
    jump_source: str | None = None
    crouch_source: str | None = None
    crouch_source_columns: int = GRID_SIZE
    crouch_source_rows: int = GRID_SIZE
    crouch_source_frames: tuple[int, ...] = tuple(range(GRID_SIZE * GRID_SIZE))
    curation_file: str | None = None
    action_curation_file: str | None = None

    @property
    def render_dir(self) -> Path:
        return ROOT / f"docs/prompts/fighter-animation-v2/render-jobs/{self.character}"

    @property
    def asset_dir(self) -> Path:
        return ROOT / f"assets/sprites/roster/{self.character}/source/animation-v2"

    @property
    def public_dir(self) -> Path:
        return (
            ROOT / f"public/assets/sprites/roster/{self.character}/source/animation-v2"
        )


CHARACTERS: dict[str, CharacterSpec] = {
    "bakunin": CharacterSpec(
        character="bakunin",
        action_curation_file="characters/bakunin/animation-v2.actions.json",
        idle_source="016_upload_file_00000000545481f49052690ef0cb25b5.png",
        walk_source="bakunin_walk.png",
        run_source="bakunin_run.png",
        jump_source="bakunin_jump.png",
        crouch_source="bakunin_crouch.png",
    ),
    "hegel": CharacterSpec(
        character="hegel",
        action_curation_file="characters/hegel/animation-v2.actions.json",
        idle_source="023_upload_file_00000000cbfc81f4aec952df29668fad.png",
        walk_source="hegel_walk.png",
        run_source="hegel_run.png",
        jump_source="hegel_jump.png",
        crouch_source="hegel_crouch.png",
    ),
    "deleuze_guattari": CharacterSpec(
        character="deleuze_guattari",
        curation_file="characters/deleuze_guattari/animation-v2.atlas.json",
        action_curation_file="characters/deleuze_guattari/animation-v2.actions.json",
    ),
    "kierkegaard": CharacterSpec(
        character="kierkegaard",
        action_curation_file="characters/kierkegaard/animation-v2.actions.json",
        curation_file="characters/kierkegaard/animation-v2.atlas.json",
    ),
    "schmitt": CharacterSpec(
        character="schmitt",
        action_curation_file="characters/schmitt/animation-v2.actions.json",
        curation_file="characters/schmitt/animation-v2.atlas.json",
    ),
    "anselm": CharacterSpec(
        character="anselm",
        curation_file="characters/anselm/animation-v2.atlas.json",
        action_curation_file="characters/anselm/animation-v2.actions.json",
    ),
    "diogenes": CharacterSpec(
        character="diogenes",
        curation_file="characters/diogenes/animation-v2.atlas.json",
        action_curation_file="characters/diogenes/animation-v2.actions.json",
    ),
    "leibniz": CharacterSpec(
        character="leibniz",
        curation_file="characters/leibniz/animation-v2.atlas.json",
        action_curation_file="characters/leibniz/animation-v2.actions.json",
    ),
    "aquinas": CharacterSpec(
        character="aquinas",
        curation_file="characters/aquinas/animation-v2.atlas.json",
        action_curation_file="characters/aquinas/animation-v2.actions.json",
    ),
    "aristotle": CharacterSpec(
        character="aristotle",
        curation_file="characters/aristotle/animation-v2.atlas.json",
        action_curation_file="characters/aristotle/animation-v2.actions.json",
    ),
    "camus": CharacterSpec(
        character="camus",
        curation_file="characters/camus/animation-v2.atlas.json",
        action_curation_file="characters/camus/animation-v2.actions.json",
    ),
    "foucault": CharacterSpec(
        character="foucault",
        action_curation_file="characters/foucault/animation-v2.actions.json",
        curation_file="characters/foucault/animation-v2.atlas.json",
    ),
    "stirner": CharacterSpec(
        character="stirner",
        action_curation_file="characters/stirner/animation-v2.actions.json",
        curation_file="characters/stirner/animation-v2.atlas.json",
    ),
    "kant": CharacterSpec(
        character="kant",
        action_curation_file="characters/kant/animation-v2.actions.json",
        curation_file="characters/kant/animation-v2.atlas.json",
    ),
    "marx": CharacterSpec(
        character="marx",
        action_curation_file="characters/marx/animation-v2.actions.json",
        curation_file="characters/marx/animation-v2.atlas.json",
    ),
    "machiavelli": CharacterSpec(
        character="machiavelli",
        action_curation_file="characters/machiavelli/animation-v2.actions.json",
        curation_file="characters/machiavelli/animation-v2.atlas.json",
    ),
    "socrates": CharacterSpec(
        character="socrates",
        action_curation_file="characters/socrates/animation-v2.actions.json",
        curation_file="characters/socrates/animation-v2.atlas.json",
    ),
    "nietzsche": CharacterSpec(
        character="nietzsche",
        action_curation_file="characters/nietzsche/animation-v2.actions.json",
        curation_file="characters/nietzsche/animation-v2.atlas.json",
    ),
}


def load_curation(character: CharacterSpec) -> dict[str, object] | None:
    if character.curation_file is None:
        return None
    curation_path = ROOT / character.curation_file
    if not curation_path.is_file():
        raise FileNotFoundError(
            f"Missing {character.character} Animation v2 curation: {curation_path}"
        )
    curation = json.loads(curation_path.read_text(encoding="utf-8"))
    if curation.get("character") != character.character:
        raise RuntimeError(
            f"{curation_path}: character must be {character.character!r}"
        )
    return curation


def base_sheet_specs(character: CharacterSpec) -> tuple[SheetSpec, ...]:
    curation = load_curation(character)
    if curation is not None:
        raw_sheets = curation.get("sheets")
        if not isinstance(raw_sheets, list) or not raw_sheets:
            raise RuntimeError(
                f"{character.curation_file}: sheets must be a non-empty list"
            )
        curated_specs: list[SheetSpec] = []
        for raw_sheet in raw_sheets:
            if not isinstance(raw_sheet, dict):
                raise RuntimeError(
                    f"{character.curation_file}: every sheet must be an object"
                )
            source_grid = raw_sheet.get("source_grid", [GRID_SIZE, GRID_SIZE])
            source_frames = raw_sheet.get(
                "source_frames", list(range(GRID_SIZE * GRID_SIZE))
            )
            frame_offsets = raw_sheet.get(
                "frame_offsets", [[0, 0] for _ in range(GRID_SIZE * GRID_SIZE)]
            )
            frame_scales = raw_sheet.get(
                "frame_scales", [1.0 for _ in range(GRID_SIZE * GRID_SIZE)]
            )
            cleanup_transparent_edges = raw_sheet.get(
                "cleanup_transparent_edges", False
            )
            background_mode = raw_sheet.get("background_mode", "light-edge")
            background_threshold = raw_sheet.get("background_threshold", 60.0)
            if (
                not isinstance(source_grid, list)
                or len(source_grid) != 2
                or not all(isinstance(value, int) for value in source_grid)
            ):
                raise RuntimeError(
                    f"{character.curation_file}: source_grid must be [columns, rows]"
                )
            if not isinstance(source_frames, list) or not all(
                isinstance(value, int) for value in source_frames
            ):
                raise RuntimeError(
                    f"{character.curation_file}: source_frames must be integer indices"
                )
            if not isinstance(frame_offsets, list) or not all(
                isinstance(value, list)
                and len(value) == 2
                and all(isinstance(component, int) for component in value)
                for value in frame_offsets
            ):
                raise RuntimeError(
                    f"{character.curation_file}: frame_offsets must contain [x, y] pairs"
                )
            if (
                not isinstance(frame_scales, list)
                or not all(isinstance(value, (int, float)) for value in frame_scales)
                or not all(0.5 <= float(value) <= 1.5 for value in frame_scales)
            ):
                raise RuntimeError(
                    f"{character.curation_file}: frame_scales must contain values from 0.5 to 1.5"
                )
            if not isinstance(cleanup_transparent_edges, bool):
                raise RuntimeError(
                    f"{character.curation_file}: cleanup_transparent_edges must be boolean"
                )
            if background_mode not in {
                "light-edge",
                "dark-edge",
                "background-aware",
                "polynomial",
            }:
                raise RuntimeError(
                    f"{character.curation_file}: background_mode must be light-edge, dark-edge, background-aware, or polynomial"
                )
            if (
                not isinstance(background_threshold, (int, float))
                or not 10 <= float(background_threshold) <= 180
            ):
                raise RuntimeError(
                    f"{character.curation_file}: background_threshold must be from 10 to 180"
                )
            curated_specs.append(
                SheetSpec(
                    source=str(raw_sheet["source"]),
                    output_suffix=str(raw_sheet["output_suffix"]),
                    clips=dict(raw_sheet["clips"]),
                    source_columns=source_grid[0],
                    source_rows=source_grid[1],
                    source_frames=tuple(source_frames),
                    frame_offsets=tuple(
                        (value[0], value[1]) for value in frame_offsets
                    ),
                    frame_scales=tuple(float(value) for value in frame_scales),
                    cleanup_transparent_edges=cleanup_transparent_edges,
                    background_mode=str(background_mode),
                    background_threshold=float(background_threshold),
                )
            )
        return tuple(curated_specs)

    specs: list[SheetSpec] = []
    if character.idle_source:
        specs.append(
            SheetSpec(
                source=character.idle_source,
                output_suffix="idle_turn_4x4.png",
                clips={
                    "idle_v2": {
                        "frames": list(range(0, 8)),
                        "mode": "loop",
                        "duration": 7,
                    },
                    "turn_left_v2": {
                        "frames": list(range(8, 12)),
                        "mode": "once",
                        "duration": 3,
                    },
                    "turn_right_v2": {
                        "frames": list(range(12, 16)),
                        "mode": "once",
                        "duration": 3,
                    },
                },
            )
        )
    if character.walk_source:
        specs.append(
            SheetSpec(
                source=character.walk_source,
                output_suffix="walk_forward_backward_4x4.png",
                clips={
                    "walk_forward_v2": {
                        "frames": list(range(0, 8)),
                        "mode": "loop",
                        "duration": 4,
                    },
                    "walk_backward_v2": {
                        "frames": list(range(8, 16)),
                        "mode": "loop",
                        "duration": 5,
                    },
                },
            )
        )
    if character.run_source:
        specs.append(
            SheetSpec(
                source=character.run_source,
                output_suffix="run_start_loop_stop_4x4.png",
                clips={
                    "run_start_v2": {
                        "frames": list(range(0, 4)),
                        "mode": "once",
                        "duration": 3,
                    },
                    "run_v2": {
                        "frames": list(range(4, 12)),
                        "mode": "loop",
                        "duration": 3,
                    },
                    "run_stop_v2": {
                        "frames": list(range(12, 16)),
                        "mode": "once",
                        "duration": 4,
                    },
                },
            )
        )
    if character.jump_source:
        specs.append(
            SheetSpec(
                source=character.jump_source,
                output_suffix="jump_land_recovery_4x4.png",
                clips={
                    "jump_takeoff_v2": {
                        "frames": list(range(0, 4)),
                        "mode": "once",
                        "duration": 3,
                    },
                    "jump_air_v2": {
                        "frames": list(range(4, 8)),
                        "mode": "once",
                        "duration": 4,
                    },
                    "land_v2": {
                        "frames": list(range(8, 12)),
                        "mode": "once",
                        "duration": 3,
                    },
                    "land_recovery_v2": {
                        "frames": list(range(12, 16)),
                        "mode": "once",
                        "duration": 4,
                    },
                },
            )
        )
    if character.crouch_source:
        specs.append(
            SheetSpec(
                source=character.crouch_source,
                output_suffix="lane_guard_crouch_4x4.png",
                clips={
                    "lane_away_v2": {
                        "frames": list(range(0, 4)),
                        "mode": "once",
                        "duration": 3,
                    },
                    "lane_toward_v2": {
                        "frames": list(range(4, 8)),
                        "mode": "once",
                        "duration": 3,
                    },
                    "crouch_v2": {
                        "frames": list(range(8, 12)),
                        "mode": "once",
                        "duration": 4,
                    },
                    "guard_v2": {
                        "frames": list(range(12, 16)),
                        "mode": "once",
                        "duration": 4,
                    },
                },
                source_columns=character.crouch_source_columns,
                source_rows=character.crouch_source_rows,
                source_frames=character.crouch_source_frames,
            )
        )
    return tuple(specs)


ACTION_SHEET_LAYOUTS: dict[str, tuple[str, dict[str, dict[str, object]]]] = {
    "normal_attacks": (
        "normal_attacks_4x4.png",
        {
            "attack_light_v2": {
                "frames": list(range(0, 4)),
                "mode": "once",
                "duration": 3,
            },
            "attack_medium_v2": {
                "frames": list(range(4, 8)),
                "mode": "once",
                "duration": 3,
            },
            "attack_heavy_v2": {
                "frames": list(range(8, 12)),
                "mode": "once",
                "duration": 4,
            },
            "air_attack_v2": {
                "frames": list(range(12, 16)),
                "mode": "once",
                "duration": 3,
            },
        },
    ),
    "mobility_throw": (
        "mobility_throw_4x4.png",
        {
            "dash_forward_v2": {
                "frames": list(range(0, 4)),
                "mode": "once",
                "duration": 2,
            },
            "dash_backward_v2": {
                "frames": list(range(4, 8)),
                "mode": "once",
                "duration": 2,
            },
            "evade_v2": {"frames": list(range(8, 12)), "mode": "once", "duration": 3},
            "throw_v2": {"frames": list(range(12, 16)), "mode": "once", "duration": 3},
        },
    ),
    "item_interactions": (
        "item_interactions_4x4.png",
        {
            "item_pickup_v2": {
                "frames": list(range(0, 4)),
                "mode": "once",
                "duration": 3,
            },
            "item_throw_v2": {
                "frames": list(range(4, 8)),
                "mode": "once",
                "duration": 3,
            },
            "item_use_v2": {
                "frames": list(range(8, 12)),
                "mode": "once",
                "duration": 4,
            },
            "item_swing_v2": {
                "frames": list(range(12, 16)),
                "mode": "once",
                "duration": 3,
            },
        },
    ),
    "advanced_guard": (
        "advanced_guard_4x4.png",
        {
            "guard_hold_v2": {
                "frames": list(range(0, 4)),
                "mode": "loop",
                "duration": 5,
            },
            "parry_v2": {"frames": list(range(4, 8)), "mode": "once", "duration": 2},
            "guard_break_v2": {
                "frames": list(range(8, 12)),
                "mode": "once",
                "duration": 3,
            },
            "counter_v2": {
                "frames": list(range(12, 16)),
                "mode": "once",
                "duration": 3,
            },
        },
    ),
    "damage_recovery": (
        "damage_recovery_4x4.png",
        {
            "hit_light_v2": {
                "frames": list(range(0, 4)),
                "mode": "once",
                "duration": 3,
            },
            "hit_heavy_v2": {
                "frames": list(range(4, 8)),
                "mode": "once",
                "duration": 4,
            },
            "knockdown_v2": {
                "frames": list(range(8, 12)),
                "mode": "once",
                "duration": 4,
            },
            "get_up_v2": {"frames": list(range(12, 16)), "mode": "once", "duration": 4},
        },
    ),
    "specials": (
        "specials_4x4.png",
        {
            "special_1_v2": {
                "frames": list(range(0, 4)),
                "mode": "once",
                "duration": 3,
            },
            "special_2_v2": {
                "frames": list(range(4, 8)),
                "mode": "once",
                "duration": 3,
            },
            "special_3_v2": {
                "frames": list(range(8, 12)),
                "mode": "once",
                "duration": 3,
            },
            "special_4_v2": {
                "frames": list(range(12, 16)),
                "mode": "once",
                "duration": 3,
            },
        },
    ),
    "special_effects": (
        "special_effects_4x4.png",
        {
            "special_fx_1_v2": {
                "frames": list(range(0, 4)),
                "mode": "once",
                "duration": 3,
            },
            "special_fx_2_v2": {
                "frames": list(range(4, 8)),
                "mode": "once",
                "duration": 3,
            },
            "special_fx_3_v2": {
                "frames": list(range(8, 12)),
                "mode": "once",
                "duration": 3,
            },
            "special_fx_4_v2": {
                "frames": list(range(12, 16)),
                "mode": "once",
                "duration": 3,
            },
        },
    ),
    "intro_taunt_victory_defeat": (
        "intro_taunt_victory_defeat_4x4.png",
        {
            "intro_v2": {"frames": list(range(0, 4)), "mode": "once", "duration": 4},
            "taunt_v2": {"frames": list(range(4, 8)), "mode": "once", "duration": 4},
            "victory_v2": {"frames": list(range(8, 12)), "mode": "once", "duration": 5},
            "defeat_v2": {"frames": list(range(12, 16)), "mode": "once", "duration": 5},
        },
    ),
}


def load_action_curation(character: CharacterSpec) -> dict[str, object] | None:
    if character.action_curation_file is None:
        return None
    path = ROOT / character.action_curation_file
    if not path.is_file():
        raise FileNotFoundError(
            f"Missing {character.character} Animation v2 action curation: {path}"
        )
    curation = json.loads(path.read_text(encoding="utf-8"))
    if curation.get("character") != character.character:
        raise RuntimeError(f"{path}: character must be {character.character!r}")
    sheets = curation.get("sheets")
    if not isinstance(sheets, list) or not sheets:
        raise RuntimeError(f"{path}: sheets must be a non-empty list")
    return curation


def action_sheet_specs(character: CharacterSpec) -> tuple[SheetSpec, ...]:
    curation = load_action_curation(character)
    if curation is None:
        return ()
    specs: list[SheetSpec] = []
    seen_kinds: set[str] = set()
    for raw_sheet in curation["sheets"]:
        if not isinstance(raw_sheet, dict):
            raise RuntimeError(
                f"{character.action_curation_file}: every sheet must be an object"
            )
        kind = raw_sheet.get("kind")
        if not isinstance(kind, str) or kind not in ACTION_SHEET_LAYOUTS:
            raise RuntimeError(
                f"{character.action_curation_file}: unsupported action sheet kind {kind!r}"
            )
        if kind in seen_kinds:
            raise RuntimeError(
                f"{character.action_curation_file}: duplicate action sheet kind {kind!r}"
            )
        seen_kinds.add(kind)
        output_suffix, clips = ACTION_SHEET_LAYOUTS[kind]
        source_grid = raw_sheet.get("source_grid", [GRID_SIZE, GRID_SIZE])
        source_frames = raw_sheet.get(
            "source_frames", list(range(GRID_SIZE * GRID_SIZE))
        )
        frame_offsets = raw_sheet.get(
            "frame_offsets", [[0, 0] for _ in range(GRID_SIZE * GRID_SIZE)]
        )
        frame_scales = raw_sheet.get(
            "frame_scales", [1.0 for _ in range(GRID_SIZE * GRID_SIZE)]
        )
        if (
            not isinstance(source_grid, list)
            or len(source_grid) != 2
            or not all(isinstance(value, int) and value > 0 for value in source_grid)
        ):
            raise RuntimeError(
                f"{character.action_curation_file}: source_grid must be positive [columns, rows]"
            )
        if not isinstance(source_frames, list) or not all(
            isinstance(value, int) for value in source_frames
        ):
            raise RuntimeError(
                f"{character.action_curation_file}: source_frames must be integer indices"
            )
        if not isinstance(frame_offsets, list) or not all(
            isinstance(value, list)
            and len(value) == 2
            and all(isinstance(component, int) for component in value)
            for value in frame_offsets
        ):
            raise RuntimeError(
                f"{character.action_curation_file}: frame_offsets must contain [x, y] pairs"
            )
        if not isinstance(frame_scales, list) or not all(
            isinstance(value, (int, float)) and 0.5 <= float(value) <= 1.5
            for value in frame_scales
        ):
            raise RuntimeError(
                f"{character.action_curation_file}: frame_scales must contain values from 0.5 to 1.5"
            )
        background_mode = str(raw_sheet.get("background_mode", "light-edge"))
        background_threshold = float(raw_sheet.get("background_threshold", 60.0))
        cleanup_transparent_edges = bool(
            raw_sheet.get("cleanup_transparent_edges", False)
        )
        if background_mode not in {
            "light-edge",
            "dark-edge",
            "background-aware",
            "polynomial",
        }:
            raise RuntimeError(
                f"{character.action_curation_file}: background_mode must be light-edge, dark-edge, background-aware, or polynomial"
            )
        if not 10 <= background_threshold <= 180:
            raise RuntimeError(
                f"{character.action_curation_file}: background_threshold must be from 10 to 180"
            )
        raw_background_overrides = raw_sheet.get("background_overrides", {})
        if not isinstance(raw_background_overrides, dict):
            raise RuntimeError(
                f"{character.action_curation_file}: background_overrides must be an object"
            )
        background_overrides: list[tuple[int, str, float]] = []
        for raw_frame, raw_override in raw_background_overrides.items():
            try:
                override_frame = int(raw_frame)
            except (TypeError, ValueError) as error:
                raise RuntimeError(
                    f"{character.action_curation_file}: background override keys must be frame indices"
                ) from error
            if not 0 <= override_frame < GRID_SIZE * GRID_SIZE:
                raise RuntimeError(
                    f"{character.action_curation_file}: background override frame must be from 0 to 15"
                )
            if not isinstance(raw_override, dict):
                raise RuntimeError(
                    f"{character.action_curation_file}: background override {override_frame} must be an object"
                )
            override_mode = str(raw_override.get("mode", background_mode))
            override_threshold = float(
                raw_override.get("threshold", background_threshold)
            )
            if override_mode not in {
                "light-edge",
                "dark-edge",
                "background-aware",
                "polynomial",
            }:
                raise RuntimeError(
                    f"{character.action_curation_file}: unsupported background override mode {override_mode!r}"
                )
            if not 10 <= override_threshold <= 180:
                raise RuntimeError(
                    f"{character.action_curation_file}: background override threshold must be from 10 to 180"
                )
            background_overrides.append(
                (override_frame, override_mode, override_threshold)
            )
        specs.append(
            SheetSpec(
                source=str(raw_sheet["source"]),
                output_suffix=output_suffix,
                clips=clips,
                source_columns=source_grid[0],
                source_rows=source_grid[1],
                source_frames=tuple(source_frames),
                frame_offsets=tuple((value[0], value[1]) for value in frame_offsets),
                frame_scales=tuple(float(value) for value in frame_scales),
                cleanup_transparent_edges=cleanup_transparent_edges,
                background_mode=background_mode,
                background_threshold=background_threshold,
                background_overrides=tuple(sorted(background_overrides)),
            )
        )
    return tuple(specs)


def sheet_specs(character: CharacterSpec) -> tuple[SheetSpec, ...]:
    """Return locomotion sheets followed by any reviewed optional action sheets."""

    return (*base_sheet_specs(character), *action_sheet_specs(character))


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def grid_edges(length: int, divisions: int) -> list[int]:
    """Return exact proportional edges for grids not evenly divisible."""

    return [(index * length) // divisions for index in range(divisions + 1)]


def remove_edge_connected_light_background(
    cell: Image.Image, cleanup_transparent_edges: bool = False
) -> Image.Image:
    """Remove baked checkerboards and optional translucent cell-edge residue."""

    rgba = cell.convert("RGBA")
    pixels = bytearray(rgba.tobytes())
    has_existing_transparency = any(alpha < 250 for alpha in pixels[3::4])
    if has_existing_transparency and not cleanup_transparent_edges:
        return rgba

    width, height = rgba.size
    pixel_count = width * height
    candidate = bytearray(pixel_count)
    for pixel_index in range(pixel_count):
        offset = pixel_index * 4
        red, green, blue, alpha = pixels[offset : offset + 4]
        channel_min = min(red, green, blue)
        channel_max = max(red, green, blue)
        luminance = (red + green + blue) / 3
        channel_spread = channel_max - channel_min
        if has_existing_transparency:
            candidate[pixel_index] = int(0 < alpha <= 180 and channel_spread <= 28)
        else:
            candidate[pixel_index] = int(luminance >= 205 and channel_spread <= 24)

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


def remove_edge_connected_sampled_background(
    cell: Image.Image,
    threshold: float,
    cleanup_transparent_edges: bool = False,
) -> Image.Image:
    """Remove an edge-connected background sampled from the cell border.

    Generated sheets are not consistent about their export background: some
    use white or checkerboard paper, some use opaque black, and some retain
    dark RGB values underneath transparent pixels. A fixed luminance key
    cannot handle all three without damaging Nietzsche's black outlines.

    This mode builds a small palette from dominant border colors, then clears
    only similar pixels that are connected to the cell boundary. Disconnected
    line art remains intact even when it shares the background color.
    """

    rgba = cell.convert("RGBA")
    width, height = rgba.size
    pixels = bytearray(rgba.tobytes())
    transparent_pixels = sum(alpha <= 16 for alpha in pixels[3::4])
    if (
        transparent_pixels >= max(1, round(width * height * 0.01))
        and not cleanup_transparent_edges
    ):
        return rgba
    border_width = max(2, min(6, min(width, height) // 64))

    buckets: dict[tuple[int, int, int], list[int]] = {}
    border_samples = 0
    for y in range(height):
        for x in range(width):
            if not (
                x < border_width
                or x >= width - border_width
                or y < border_width
                or y >= height - border_width
            ):
                continue
            offset = (y * width + x) * 4
            red, green, blue = pixels[offset : offset + 3]
            key = (red // 16, green // 16, blue // 16)
            aggregate = buckets.setdefault(key, [0, 0, 0, 0])
            aggregate[0] += red
            aggregate[1] += green
            aggregate[2] += blue
            aggregate[3] += 1
            border_samples += 1

    minimum_cluster = max(4, round(border_samples * 0.015))
    dominant = sorted(buckets.values(), key=lambda value: value[3], reverse=True)
    selected = [value for value in dominant if value[3] >= minimum_cluster][:8]
    if not selected and dominant:
        selected = dominant[:1]
    palette = [
        (
            value[0] / value[3],
            value[1] / value[3],
            value[2] / value[3],
        )
        for value in selected
    ]
    if not palette:
        return rgba

    threshold_squared = threshold * threshold
    translucent_threshold_squared = (threshold * 1.35) ** 2
    candidate = bytearray(width * height)
    for pixel_index in range(width * height):
        offset = pixel_index * 4
        red, green, blue, alpha = pixels[offset : offset + 4]
        if alpha <= 8:
            candidate[pixel_index] = 1
            continue
        distance_squared = min(
            (red - sample_red) ** 2
            + (green - sample_green) ** 2
            + (blue - sample_blue) ** 2
            for sample_red, sample_green, sample_blue in palette
        )
        limit = (
            translucent_threshold_squared
            if cleanup_transparent_edges and alpha < 250
            else threshold_squared
        )
        candidate[pixel_index] = int(distance_squared <= limit)

    visited = bytearray(width * height)
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


def _largest_filled_component(mask: Image.Image) -> Image.Image:
    """Keep the main silhouette and fill holes left by background fitting."""

    width, height = mask.size
    source = bytearray(mask.convert("L").tobytes())
    visited = bytearray(width * height)
    largest: list[int] = []

    for start in range(width * height):
        if source[start] == 0 or visited[start]:
            continue
        component: list[int] = []
        queue: deque[int] = deque([start])
        visited[start] = 1
        while queue:
            pixel_index = queue.popleft()
            component.append(pixel_index)
            y, x = divmod(pixel_index, width)
            for neighbor_y, neighbor_x in (
                (y - 1, x),
                (y + 1, x),
                (y, x - 1),
                (y, x + 1),
            ):
                if not (0 <= neighbor_y < height and 0 <= neighbor_x < width):
                    continue
                neighbor = neighbor_y * width + neighbor_x
                if source[neighbor] and not visited[neighbor]:
                    visited[neighbor] = 1
                    queue.append(neighbor)
        if len(component) > len(largest):
            largest = component

    retained = bytearray(width * height)
    for pixel_index in largest:
        retained[pixel_index] = 255

    # Flood the inverse mask from the border; unvisited inverse pixels are
    # enclosed holes and belong to the retained fighter silhouette.
    exterior = bytearray(width * height)
    queue = deque()

    def enqueue_exterior(y: int, x: int) -> None:
        if not (0 <= y < height and 0 <= x < width):
            return
        pixel_index = y * width + x
        if retained[pixel_index] == 0 and not exterior[pixel_index]:
            exterior[pixel_index] = 1
            queue.append(pixel_index)

    for x in range(width):
        enqueue_exterior(0, x)
        enqueue_exterior(height - 1, x)
    for y in range(height):
        enqueue_exterior(y, 0)
        enqueue_exterior(y, width - 1)

    while queue:
        pixel_index = queue.popleft()
        y, x = divmod(pixel_index, width)
        enqueue_exterior(y - 1, x)
        enqueue_exterior(y + 1, x)
        enqueue_exterior(y, x - 1)
        enqueue_exterior(y, x + 1)

    for pixel_index in range(width * height):
        if not exterior[pixel_index]:
            retained[pixel_index] = 255
    return Image.frombytes("L", (width, height), bytes(retained))


def remove_polynomial_background(cell: Image.Image, threshold: float) -> Image.Image:
    """Subtract a smooth photographed-paper background from one source cell.

    Some Aristotle renders were exported against a warm, uneven paper field.
    A single color key damages his robe and staff, so fit a quadratic RGB
    surface from the cell border, threshold color residuals, and retain the
    principal connected fighter silhouette. The operation is deterministic
    and keeps the manually curated atlas reproducible from the render jobs.
    """

    try:
        import numpy as np
    except ImportError as error:  # pragma: no cover - actionable build failure
        raise RuntimeError(
            "Polynomial background removal requires the Python numpy package"
        ) from error

    rgba = cell.convert("RGBA")
    rgb = np.asarray(rgba, dtype=np.float64)[..., :3]
    height, width, _ = rgb.shape
    x_axis = np.linspace(-1.0, 1.0, width)
    y_axis = np.linspace(-1.0, 1.0, height)
    x_grid, y_grid = np.meshgrid(x_axis, y_axis)
    features = np.stack(
        (
            np.ones_like(x_grid),
            x_grid,
            y_grid,
            x_grid * y_grid,
            x_grid * x_grid,
            y_grid * y_grid,
        ),
        axis=-1,
    )

    border_width = max(8, min(24, width // 6, height // 6))
    border = np.zeros((height, width), dtype=bool)
    border[:border_width, :] = True
    border[-border_width:, :] = True
    border[:, :border_width] = True
    border[:, -border_width:] = True
    design = features[border]
    samples = rgb[border]
    coefficients, *_ = np.linalg.lstsq(design, samples, rcond=None)
    predicted = features @ coefficients
    residual = np.linalg.norm(rgb - predicted, axis=2)
    initial_mask = Image.fromarray(
        np.where(residual >= threshold, 255, 0).astype(np.uint8)
    )

    # Close narrow breaks, discard isolated paper texture, and then fill any
    # robe/interior holes before applying the alpha channel.
    cleaned = initial_mask.filter(ImageFilter.MaxFilter(5)).filter(
        ImageFilter.MinFilter(5)
    )
    cleaned = cleaned.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))
    silhouette = _largest_filled_component(cleaned).filter(ImageFilter.MaxFilter(3))
    output = rgba.copy()
    output.putalpha(silhouette)
    return output


def normalize_cell(cell: Image.Image) -> Image.Image:
    """Fit one source cell into the runtime cell without changing its aspect ratio.

    Most render jobs are square 4x4 sheets, but Stirner's accepted defense
    source is a 5x4 sheet. Stretching those narrow cells to 256x256 noticeably
    widens the character, so non-square cells are uniformly fitted, centered
    horizontally, and ground-aligned instead.
    """

    rgba = cell.convert("RGBA")
    width, height = rgba.size
    scale = min(CELL_SIZE / max(1, width), CELL_SIZE / max(1, height))
    target_width = max(1, round(width * scale))
    target_height = max(1, round(height * scale))
    resized = rgba.resize((target_width, target_height), Image.Resampling.NEAREST)
    normalized = Image.new("RGBA", (CELL_SIZE, CELL_SIZE), (0, 0, 0, 0))
    offset_x = (CELL_SIZE - target_width) // 2
    offset_y = CELL_SIZE - target_height
    normalized.alpha_composite(resized, (offset_x, offset_y))
    return normalized


def scale_cell(cell: Image.Image, scale: float) -> Image.Image:
    """Scale a normalized sprite around the cell's bottom-center root."""

    if scale == 1.0:
        return cell
    target_size = max(1, round(CELL_SIZE * scale))
    resized = cell.resize((target_size, target_size), Image.Resampling.NEAREST)
    scaled = Image.new("RGBA", (CELL_SIZE, CELL_SIZE), (0, 0, 0, 0))
    offset_x = (CELL_SIZE - target_size) // 2
    offset_y = CELL_SIZE - target_size
    scaled.alpha_composite(resized, (offset_x, offset_y))
    return scaled


def prepare_sheet(
    source_path: Path, spec: SheetSpec
) -> tuple[Image.Image, list[dict[str, object]]]:
    source = Image.open(source_path)
    if len(spec.source_frames) != GRID_SIZE * GRID_SIZE:
        raise RuntimeError(
            f"{source_path.name}: expected 16 selected frames, got {len(spec.source_frames)}"
        )
    if len(spec.frame_offsets) != GRID_SIZE * GRID_SIZE:
        raise RuntimeError(
            f"{source_path.name}: expected 16 frame offsets, got {len(spec.frame_offsets)}"
        )
    if len(spec.frame_scales) != GRID_SIZE * GRID_SIZE:
        raise RuntimeError(
            f"{source_path.name}: expected 16 frame scales, got {len(spec.frame_scales)}"
        )
    source_frame_count = spec.source_columns * spec.source_rows
    if any(index < 0 or index >= source_frame_count for index in spec.source_frames):
        raise RuntimeError(
            f"{source_path.name}: selected frame outside {spec.source_columns}x{spec.source_rows} grid"
        )

    x_edges = grid_edges(source.width, spec.source_columns)
    y_edges = grid_edges(source.height, spec.source_rows)
    output = Image.new("RGBA", (SHEET_SIZE, SHEET_SIZE), (0, 0, 0, 0))
    frame_report: list[dict[str, object]] = []
    background_overrides = {
        frame_index: (mode, threshold)
        for frame_index, mode, threshold in spec.background_overrides
    }

    for frame_index, source_frame_index in enumerate(spec.source_frames):
        output_row, output_column = divmod(frame_index, GRID_SIZE)
        source_row, source_column = divmod(source_frame_index, spec.source_columns)
        cell = source.crop(
            (
                x_edges[source_column],
                y_edges[source_row],
                x_edges[source_column + 1],
                y_edges[source_row + 1],
            )
        )
        background_mode, background_threshold = background_overrides.get(
            frame_index, (spec.background_mode, spec.background_threshold)
        )
        if background_mode == "polynomial":
            cell = remove_polynomial_background(cell, background_threshold)
        elif background_mode in {"dark-edge", "background-aware"}:
            cell = remove_edge_connected_sampled_background(
                cell,
                background_threshold,
                cleanup_transparent_edges=spec.cleanup_transparent_edges,
            )
        else:
            cell = remove_edge_connected_light_background(
                cell, cleanup_transparent_edges=spec.cleanup_transparent_edges
            )
        cell = normalize_cell(cell)
        scale = spec.frame_scales[frame_index]
        cell = scale_cell(cell, scale)
        offset_x, offset_y = spec.frame_offsets[frame_index]
        if offset_x != 0 or offset_y != 0:
            translated = Image.new("RGBA", (CELL_SIZE, CELL_SIZE), (0, 0, 0, 0))
            translated.alpha_composite(cell, (offset_x, offset_y))
            cell = translated
        output.alpha_composite(
            cell, (output_column * CELL_SIZE, output_row * CELL_SIZE)
        )

        alpha = cell.getchannel("A")
        visible_mask = alpha.point(lambda value: 255 if value > 16 else 0)
        bounds = visible_mask.getbbox()
        if bounds is None:
            raise RuntimeError(
                f"{source_path.name}: frame {source_frame_index} is blank"
            )
        left, top, right, bottom = bounds
        visible_pixels = sum(visible_mask.histogram()[1:])
        frame_report.append(
            {
                "frame": frame_index,
                "source_frame": source_frame_index,
                "background_mode": background_mode,
                "background_threshold": background_threshold,
                "offset": [offset_x, offset_y],
                "scale": scale,
                "opaque_bounds": [left, top, right - left, bottom - top],
                "visible_coverage": round(visible_pixels / (CELL_SIZE * CELL_SIZE), 4),
            }
        )

    return output, frame_report


def write_png(image: Image.Image, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, format="PNG", optimize=True, compress_level=9)


def output_name(character: str, suffix: str) -> str:
    return f"{character}_{suffix}"


def build_character(character: CharacterSpec) -> dict[str, object]:
    specs = sheet_specs(character)
    curation = load_curation(character)
    manifest_sheets: list[dict[str, object]] = []
    for sheet_index, spec in enumerate(specs):
        source_path = character.render_dir / spec.source
        if not source_path.is_file():
            raise FileNotFoundError(
                f"Missing {character.character} render source: {source_path}"
            )

        image, frame_report = prepare_sheet(source_path, spec)
        filename = output_name(character.character, spec.output_suffix)
        asset_path = character.asset_dir / filename
        public_path = character.public_dir / filename
        write_png(image, asset_path)
        write_png(image, public_path)

        sheet_manifest: dict[str, object] = {
            "sheet_index": sheet_index,
            "frame_offset": sheet_index * 16,
            "source": str(source_path.relative_to(ROOT)),
            "source_sha256": sha256(source_path),
            "background_mode": spec.background_mode,
            "background_threshold": spec.background_threshold,
            "background_overrides": [
                {
                    "frame": frame_index,
                    "mode": mode,
                    "threshold": threshold,
                }
                for frame_index, mode, threshold in spec.background_overrides
            ],
            "source_grid": [spec.source_columns, spec.source_rows],
            "source_frames": list(spec.source_frames),
            "frame_offsets": [list(offset) for offset in spec.frame_offsets],
            "output": str(asset_path.relative_to(ROOT)),
            "output_sha256": sha256(asset_path),
            "clips": spec.clips,
            "frames": frame_report,
        }
        if any(scale != 1.0 for scale in spec.frame_scales):
            sheet_manifest["frame_scales"] = list(spec.frame_scales)
        if spec.cleanup_transparent_edges:
            sheet_manifest["cleanup_transparent_edges"] = True
        manifest_sheets.append(sheet_manifest)

    manifest: dict[str, object] = {
        "character": character.character,
        "version": 1,
        "layout": f"{len(specs)} normalized 4x4 RGBA sheets, row-major",
        "cell_size": [CELL_SIZE, CELL_SIZE],
        "authored_frame_count": len(specs) * 16,
        "runtime_note": "The legacy core sheet and optional extended sheet are appended by the runtime for missing authored states and combat fallback frames.",
        "sheets": manifest_sheets,
    }
    if character.curation_file is not None:
        curation_path = ROOT / character.curation_file
        manifest["curation"] = {
            "path": character.curation_file,
            "sha256": sha256(curation_path),
            "review": curation.get("review", {}) if curation is not None else {},
        }
    action_curation = load_action_curation(character)
    if character.action_curation_file is not None:
        action_curation_path = ROOT / character.action_curation_file
        manifest["action_curation"] = {
            "path": character.action_curation_file,
            "sha256": sha256(action_curation_path),
            "review": (
                action_curation.get("review", {}) if action_curation is not None else {}
            ),
        }
    manifest_text = json.dumps(manifest, indent=2, sort_keys=True) + "\n"
    for directory in (character.asset_dir, character.public_dir):
        directory.mkdir(parents=True, exist_ok=True)
        (directory / "manifest.json").write_text(manifest_text, encoding="utf-8")
    return manifest


def check_character(character: CharacterSpec) -> None:
    specs = sheet_specs(character)
    expected = {
        output_name(character.character, spec.output_suffix) for spec in specs
    } | {"manifest.json"}
    asset_manifest_path = character.asset_dir / "manifest.json"
    public_manifest_path = character.public_dir / "manifest.json"
    if not asset_manifest_path.is_file() or not public_manifest_path.is_file():
        raise RuntimeError(f"Missing generated manifest for {character.character}")
    if sha256(asset_manifest_path) != sha256(public_manifest_path):
        raise RuntimeError(f"Asset/public manifest mismatch for {character.character}")

    manifest = json.loads(asset_manifest_path.read_text(encoding="utf-8"))
    manifest_sheets = manifest.get("sheets")
    if manifest.get("character") != character.character or not isinstance(
        manifest_sheets, list
    ):
        raise RuntimeError(f"Invalid generated manifest for {character.character}")
    if manifest.get("authored_frame_count") != len(specs) * GRID_SIZE * GRID_SIZE:
        raise RuntimeError(f"Invalid authored frame count for {character.character}")
    if len(manifest_sheets) != len(specs):
        raise RuntimeError(f"Invalid sheet count for {character.character}")
    if character.curation_file is not None:
        curation_path = ROOT / character.curation_file
        manifest_curation = manifest.get("curation")
        if not isinstance(manifest_curation, dict):
            raise RuntimeError(
                f"Missing curation receipt for {character.character}; rebuild Animation v2 assets"
            )
        if manifest_curation.get("path") != character.curation_file:
            raise RuntimeError(
                f"Incorrect curation path for {character.character}; rebuild Animation v2 assets"
            )
        if manifest_curation.get("sha256") != sha256(curation_path):
            raise RuntimeError(
                f"Stale curation hash for {character.character}; rebuild Animation v2 assets"
            )
    if character.action_curation_file is not None:
        action_curation_path = ROOT / character.action_curation_file
        manifest_action_curation = manifest.get("action_curation")
        if not isinstance(manifest_action_curation, dict):
            raise RuntimeError(
                f"Missing action curation receipt for {character.character}; rebuild Animation v2 assets"
            )
        if manifest_action_curation.get("path") != character.action_curation_file:
            raise RuntimeError(
                f"Incorrect action curation path for {character.character}; rebuild Animation v2 assets"
            )
        if manifest_action_curation.get("sha256") != sha256(action_curation_path):
            raise RuntimeError(
                f"Stale action curation hash for {character.character}; rebuild Animation v2 assets"
            )

    for directory in (character.asset_dir, character.public_dir):
        missing = sorted(name for name in expected if not (directory / name).is_file())
        if missing:
            raise RuntimeError(
                f"Missing generated files in {directory}: {', '.join(missing)}"
            )

    for spec, sheet_record in zip(specs, manifest_sheets, strict=True):
        filename = output_name(character.character, spec.output_suffix)
        asset_path = character.asset_dir / filename
        public_path = character.public_dir / filename
        source_path = character.render_dir / spec.source
        image = Image.open(asset_path)
        if image.size != (SHEET_SIZE, SHEET_SIZE) or image.mode != "RGBA":
            raise RuntimeError(
                f"Invalid generated sheet {asset_path}: {image.mode} {image.size}"
            )
        if sha256(asset_path) != sha256(public_path):
            raise RuntimeError(f"Asset/public sheet mismatch for {filename}")
        expected_source = str(source_path.relative_to(ROOT))
        expected_output = str(asset_path.relative_to(ROOT))
        if sheet_record.get("source") != expected_source:
            raise RuntimeError(
                f"Incorrect source mapping for {filename}; rebuild Animation v2 assets"
            )
        if sheet_record.get("output") != expected_output:
            raise RuntimeError(
                f"Incorrect output mapping for {filename}; rebuild Animation v2 assets"
            )
        if sheet_record.get("background_mode") != spec.background_mode:
            raise RuntimeError(
                f"Stale background mode for {filename}; rebuild Animation v2 assets"
            )
        if sheet_record.get("background_threshold") != spec.background_threshold:
            raise RuntimeError(
                f"Stale background threshold for {filename}; rebuild Animation v2 assets"
            )
        if sheet_record.get("source_grid") != [spec.source_columns, spec.source_rows]:
            raise RuntimeError(
                f"Stale source grid for {filename}; rebuild Animation v2 assets"
            )
        if sheet_record.get("source_frames") != list(spec.source_frames):
            raise RuntimeError(
                f"Stale frame selection for {filename}; rebuild Animation v2 assets"
            )
        if sheet_record.get("frame_offsets") != [
            list(offset) for offset in spec.frame_offsets
        ]:
            raise RuntimeError(
                f"Stale frame offsets for {filename}; rebuild Animation v2 assets"
            )
        if any(scale != 1.0 for scale in spec.frame_scales):
            if sheet_record.get("frame_scales") != list(spec.frame_scales):
                raise RuntimeError(
                    f"Stale frame scales for {filename}; rebuild Animation v2 assets"
                )
        if spec.cleanup_transparent_edges:
            if sheet_record.get("cleanup_transparent_edges") is not True:
                raise RuntimeError(
                    f"Stale transparent-edge cleanup metadata for {filename}; rebuild Animation v2 assets"
                )
        if sheet_record.get("clips") != spec.clips:
            raise RuntimeError(
                f"Stale clip metadata for {filename}; rebuild Animation v2 assets"
            )
        if sheet_record.get("source_sha256") != sha256(source_path):
            raise RuntimeError(
                f"Stale source hash for {filename}; rebuild Animation v2 assets"
            )
        if sheet_record.get("output_sha256") != sha256(asset_path):
            raise RuntimeError(
                f"Stale output hash for {filename}; rebuild Animation v2 assets"
            )

        alpha = image.getchannel("A")
        if alpha.getextrema() == (255, 255):
            raise RuntimeError(
                f"Generated sheet has no transparent background: {filename}"
            )
        for frame_index in range(GRID_SIZE * GRID_SIZE):
            row, column = divmod(frame_index, GRID_SIZE)
            frame_alpha = alpha.crop(
                (
                    column * CELL_SIZE,
                    row * CELL_SIZE,
                    (column + 1) * CELL_SIZE,
                    (row + 1) * CELL_SIZE,
                )
            )
            if frame_alpha.getbbox() is None:
                raise RuntimeError(
                    f"Generated sheet has blank frame {frame_index}: {filename}"
                )


def selected_characters(selection: str) -> list[CharacterSpec]:
    if selection == "all":
        return list(CHARACTERS.values())
    return [CHARACTERS[selection]]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--character",
        choices=[*CHARACTERS, "all"],
        default="all",
        help="character asset set to build (default: all)",
    )
    parser.add_argument(
        "--check", action="store_true", help="validate existing generated outputs"
    )
    args = parser.parse_args()

    characters = selected_characters(args.character)
    if args.check:
        for character in characters:
            check_character(character)
        print(
            "Animation v2 assets are present and structurally valid for "
            + ", ".join(character.character for character in characters)
            + "."
        )
        return

    frame_count = 0
    for character in characters:
        manifest = build_character(character)
        check_character(character)
        frame_count += int(manifest["authored_frame_count"])
    print(
        f"Built {frame_count} authored frames for "
        + ", ".join(character.character for character in characters)
        + "."
    )


if __name__ == "__main__":
    main()
