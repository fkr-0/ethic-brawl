#!/usr/bin/env python3
"""Curate the flat Animation v2 render archive into canonical character/action sets.

The source archive under ``docs/prompts/fullset`` contains timestamp-named PNG
renders and the prompts that produced most of them.  This tool keeps every raw
file, classifies prompt/image pairs from prompt metadata, collapses exact
copies, scores alternate renders, and writes one canonical source per
(character, prompt_id).

Generated layout::

    docs/prompts/fullset/
      raw/                         original files, never discarded
      selected/<character>/       canonical image + prompt pairs
      manifest.json               candidates, quality metrics, and decisions
      README.md                    human-readable corpus summary

The selected files are mirrored to each render-job directory so runtime asset
curation can refer to stable names such as ``selected/normal_attacks_4x4.png``.
With ``--sync-runtime`` the tool also refreshes character curation JSON files.
Existing hand-tuned locomotion offsets are preserved whenever the selected raw
image has the same SHA-256 as the previously curated source.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import shutil
from collections import defaultdict
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
FULLSET = ROOT / "docs/prompts/fullset"
DELIVERY_ROOTS = tuple(
    sorted(
        path
        for path in (ROOT / "docs/prompts").glob("new-images-brawl*")
        if path.is_dir()
    )
)
RAW = FULLSET / "raw"
SELECTED = FULLSET / "selected"
RENDER_ROOT = ROOT / "docs/prompts/fighter-animation-v2/render-jobs"

CHARACTERS = (
    "anselm",
    "aquinas",
    "aristotle",
    "bakunin",
    "camus",
    "deleuze_guattari",
    "diogenes",
    "foucault",
    "hegel",
    "kant",
    "kierkegaard",
    "leibniz",
    "machiavelli",
    "marx",
    "nietzsche",
    "schmitt",
    "socrates",
    "stirner",
)

BASE_ACTIONS = (
    "idle_turn_4x4",
    "walk_forward_backward_4x4",
    "run_start_loop_stop_4x4",
    "jump_land_recovery_4x4",
    "lane_guard_crouch_4x4",
)
ACTION_ACTIONS = (
    "normal_attacks_4x4",
    "mobility_evasion_throw_4x4",
    "item_interactions_4x4",
    "guard_parry_break_4x4",
    "reactions_knockdown_4x4",
    "specials_4x4",
    "special_effects_4x4",
    "intro_taunt_victory_defeat_4x4",
)
ACTIONS = (*BASE_ACTIONS, *ACTION_ACTIONS)

CHARACTER_ALIASES: dict[str, tuple[str, ...]] = {
    character: (character,) for character in CHARACTERS
}
CHARACTER_ALIASES.update(
    {
        "aquinas": ("aquinas", "thomas aquinas"),
        "bakunin": ("bakunin", "mikhail bakunin"),
        "camus": ("camus", "albert camus"),
        "deleuze_guattari": (
            "deleuze_guattari",
            "deleuze",
            "guattari",
            "rhizome engine",
        ),
        "diogenes": ("diogenes", "diogenes of sinope"),
        "foucault": ("foucault", "focault"),
        "hegel": ("hegel", "g.w.f. hegel"),
        "kant": ("kant", "immanuel kant"),
        "leibniz": ("leibniz", "leibnitz"),
        "nietzsche": ("nietzsche", "friedrich nietzsche"),
        "stirner": ("stirner", "max stirner"),
    }
)

ACTION_SIGNATURES: tuple[tuple[str, tuple[str, ...]], ...] = (
    ("idle_turn_4x4", ("fine idle and turn", "idle and turn cycle")),
    (
        "walk_forward_backward_4x4",
        ("eight-frame forward walk", "forward walk and eight-frame backward"),
    ),
    (
        "run_start_loop_stop_4x4",
        ("run acceleration", "run start, loop", "braking to idle"),
    ),
    (
        "jump_land_recovery_4x4",
        ("takeoff, air arc, landing", "takeoff and landing"),
    ),
    (
        "lane_guard_crouch_4x4",
        ("lane shifts", "lane shift", "crouch transition and guard"),
    ),
    ("normal_attacks_4x4", ("three grounded normal attacks", "normal attacks")),
    (
        "mobility_evasion_throw_4x4",
        ("combat mobility, evasion", "empty-hand grab and throw"),
    ),
    ("item_interactions_4x4", ("universal item interactions", "item interactions")),
    ("guard_parry_break_4x4", ("guard, parry", "guard break", "parry and counter")),
    (
        "reactions_knockdown_4x4",
        ("hit reactions", "hitstun", "knockdown and get-up"),
    ),
    (
        "special_effects_4x4",
        ("effect-sprite sheet", "isolated special-effect", "without the fighter body"),
    ),
    ("specials_4x4", ("special caster", "four character-specific special")),
    (
        "intro_taunt_victory_defeat_4x4",
        ("intro, taunt, victory", "presentation states"),
    ),
)

ACTION_KIND = {
    "normal_attacks_4x4": "normal_attacks",
    "mobility_evasion_throw_4x4": "mobility_throw",
    "item_interactions_4x4": "item_interactions",
    "guard_parry_break_4x4": "advanced_guard",
    "reactions_knockdown_4x4": "damage_recovery",
    "specials_4x4": "specials",
    "special_effects_4x4": "special_effects",
    "intro_taunt_victory_defeat_4x4": "intro_taunt_victory_defeat",
}

BASE_CLIPS: dict[str, dict[str, dict[str, Any]]] = {
    "idle_turn_4x4": {
        "idle_v2": {"frames": list(range(0, 8)), "mode": "loop", "duration": 7},
        "turn_left_v2": {"frames": list(range(8, 12)), "mode": "once", "duration": 3},
        "turn_right_v2": {"frames": list(range(12, 16)), "mode": "once", "duration": 3},
    },
    "walk_forward_backward_4x4": {
        "walk_forward_v2": {"frames": list(range(0, 8)), "mode": "loop", "duration": 4},
        "walk_backward_v2": {
            "frames": list(range(8, 16)),
            "mode": "loop",
            "duration": 5,
        },
    },
    "run_start_loop_stop_4x4": {
        "run_start_v2": {"frames": list(range(0, 4)), "mode": "once", "duration": 3},
        "run_v2": {"frames": list(range(4, 12)), "mode": "loop", "duration": 3},
        "run_stop_v2": {"frames": list(range(12, 16)), "mode": "once", "duration": 4},
    },
    "jump_land_recovery_4x4": {
        "jump_takeoff_v2": {"frames": list(range(0, 4)), "mode": "once", "duration": 3},
        "jump_air_v2": {"frames": list(range(4, 8)), "mode": "once", "duration": 4},
        "land_v2": {"frames": list(range(8, 12)), "mode": "once", "duration": 3},
        "land_recovery_v2": {
            "frames": list(range(12, 16)),
            "mode": "once",
            "duration": 4,
        },
    },
    "lane_guard_crouch_4x4": {
        "lane_away_v2": {"frames": list(range(0, 4)), "mode": "once", "duration": 3},
        "lane_toward_v2": {"frames": list(range(4, 8)), "mode": "once", "duration": 3},
        "crouch_v2": {"frames": list(range(8, 12)), "mode": "once", "duration": 4},
        "guard_v2": {"frames": list(range(12, 16)), "mode": "once", "duration": 4},
    },
}

# Explicit review decisions for close or semantically important duplicate groups.
# Other groups use the deterministic score below.
SELECTION_OVERRIDES: dict[tuple[str, str], str] = {
    (
        "anselm",
        "lane_guard_crouch_4x4",
    ): "019_pixel-art-sprite-sheet_20260720T204534Z.png",
    (
        "aquinas",
        "jump_land_recovery_4x4",
    ): "021_pixel-art-sprite-sheet_20260721T102543Z.png",
    (
        "aristotle",
        "idle_turn_4x4",
    ): "006_aristotle-idle-turn-render_20260720T211329Z.png",
    ("camus", "idle_turn_4x4"): "004_pixel-art-sprite-sheet_20260719T195646Z.png",
    (
        "camus",
        "walk_forward_backward_4x4",
    ): "006_pixel-art-sprite-sheet_20260719T195902Z.png",
    (
        "deleuze_guattari",
        "idle_turn_4x4",
    ): "017_create-image-request_20260721T143913Z.png",
    (
        "deleuze_guattari",
        "walk_forward_backward_4x4",
    ): "007_pixel-art-sprite-sheet_20260720T195344Z.png",
    (
        "deleuze_guattari",
        "run_start_loop_stop_4x4",
    ): "013_create-image-request_20260721T131146Z.png",
    (
        "deleuze_guattari",
        "jump_land_recovery_4x4",
    ): "016_create-image-request_20260721T143734Z.png",
    (
        "deleuze_guattari",
        "lane_guard_crouch_4x4",
    ): "015_create-image-request_20260721T143557Z.png",
    (
        "foucault",
        "walk_forward_backward_4x4",
    ): "031_pixel-art-sprite-sheet_20260719T222703Z.png",
    (
        "foucault",
        "jump_land_recovery_4x4",
    ): "035_pixel-art-sprite-sheet_20260720T162758Z.png",
    (
        "foucault",
        "intro_taunt_victory_defeat_4x4",
    ): "030_branch-create-image-request_20260721T235014Z.png",
    (
        "hegel",
        "walk_forward_backward_4x4",
    ): "015_pixel-art-sprite-sheet_20260719T201440Z.png",
    ("kant", "idle_turn_4x4"): "001_pixel-art-sprite-sheet_20260720T193837Z.png",
    ("kant", "normal_attacks_4x4"): "038_create-image-request_20260721T195749Z.png",
    ("machiavelli", "idle_turn_4x4"): "010_pixel-art-sprite-sheet_20260720T200431Z.png",
    (
        "machiavelli",
        "jump_land_recovery_4x4",
    ): "017_pixel-art-sprite-sheet_20260720T203441Z.png",
    (
        "machiavelli",
        "normal_attacks_4x4",
    ): "026_branch-create-image-request_20260721T230824Z.png",
    (
        "machiavelli",
        "guard_parry_break_4x4",
    ): "028_branch-create-image-request_20260721T234303Z.png",
    (
        "nietzsche",
        "walk_forward_backward_4x4",
    ): "007_aristotle-idle-turn-render_20260720T211711Z.png",
    (
        "nietzsche",
        "jump_land_recovery_4x4",
    ): "013_aristotle-idle-turn-render_20260720T220702Z.png",
    (
        "schmitt",
        "walk_forward_backward_4x4",
    ): "042_pixel-art-sprite-sheet_20260720T181328Z.png",
    (
        "schmitt",
        "run_start_loop_stop_4x4",
    ): "044_pixel-art-sprite-sheet_20260720T182212Z.png",
    (
        "socrates",
        "walk_forward_backward_4x4",
    ): "007_pixel-art-sprite-sheet_20260720T195543Z.png",
    ("stirner", "idle_turn_4x4"): "006_create-image-request_20260721T073710Z.png",
    (
        "stirner",
        "item_interactions_4x4",
    ): "007_branch-create-image-request_20260721T191446Z.png",
}

# Bakunin and Hegel already have newer hand-integrated locomotion sources that are
# not reliably paired in the flat archive. Their base atlases are not rewritten.
PRESERVE_EXTERNAL_BASE = {"bakunin", "hegel"}


@dataclass
class Candidate:
    character: str
    action: str
    image: Path
    prompt: Path
    prompt_pack_version: int
    image_sha256: str
    prompt_sha256: str
    metrics: dict[str, Any]
    score: float
    exact_aliases: list[str]


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def organize_raw() -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    for source in sorted((*FULLSET.glob("*.png"), *FULLSET.glob("*.txt"))):
        destination = RAW / source.name
        if destination.exists():
            if sha256(source) != sha256(destination):
                raise RuntimeError(
                    f"Refusing conflicting raw archive move: {destination}"
                )
            source.unlink()
        else:
            source.replace(destination)


def ingest_new_images() -> tuple[int, list[str]]:
    """Copy paired render deliveries into the immutable canonical raw archive.

    Every ``docs/prompts/new-images-brawl*`` directory is treated as an
    append-only delivery. Delivery directories remain untouched for auditing.
    Same-name conflicts are rejected rather than overwritten.
    """

    imported = 0
    imported_from: list[str] = []
    for delivery in DELIVERY_ROOTS:
        delivery_imports = 0
        for source in sorted((*delivery.glob("*.png"), *delivery.glob("*.txt"))):
            destination = RAW / source.name
            if destination.exists():
                if sha256(source) != sha256(destination):
                    raise RuntimeError(
                        f"Refusing conflicting new-image import from {delivery.name}: "
                        f"{destination}"
                    )
                continue
            shutil.copy2(source, destination)
            imported += 1
            delivery_imports += 1
        if delivery_imports:
            imported_from.append(str(delivery.relative_to(ROOT)))
    return imported, imported_from


def source_files() -> tuple[list[Path], list[Path]]:
    roots = [RAW, FULLSET]
    pngs = sorted({path for directory in roots for path in directory.glob("*.png")})
    prompts = sorted({path for directory in roots for path in directory.glob("*.txt")})
    return pngs, prompts


def parse_prompt(text: str) -> tuple[str | None, str | None, int]:
    lowered = text.lower()
    character_match = re.search(r'character_id:\s*["\']?([a-z0-9_]+)', lowered)
    character = character_match.group(1) if character_match else None
    if character not in CHARACTERS:
        roster_match = re.search(
            r"(?:assets|public/assets)/sprites/roster/([a-z0-9_]+)/", lowered
        )
        character = roster_match.group(1) if roster_match else None
    if character not in CHARACTERS:
        scored = [
            (sum(lowered.count(alias) for alias in aliases), candidate)
            for candidate, aliases in CHARACTER_ALIASES.items()
        ]
        score, character = max(scored)
        if score == 0:
            character = None

    action_match = re.search(r'prompt_id:\s*["\']?([a-z0-9_]+)', lowered)
    action = action_match.group(1) if action_match else None
    if action not in ACTIONS:
        action = next(
            (candidate for candidate in ACTIONS if candidate in lowered), None
        )
    if action not in ACTIONS:
        action = next(
            (
                candidate
                for candidate, signatures in ACTION_SIGNATURES
                if any(signature in lowered for signature in signatures)
            ),
            None,
        )

    version_match = re.search(r"prompt_pack_version:\s*(\d+)", lowered)
    version = int(version_match.group(1)) if version_match else 0
    return character, action, version


def foreground_mask(cell: Image.Image, true_alpha: bool) -> np.ndarray:
    resized = cell.convert("RGBA").resize((128, 128), Image.Resampling.NEAREST)
    pixels = np.asarray(resized, dtype=np.int16)
    if true_alpha:
        return pixels[:, :, 3] > 24

    rgb = pixels[:, :, :3]
    border = np.concatenate(
        (
            rgb[:4].reshape(-1, 3),
            rgb[-4:].reshape(-1, 3),
            rgb[:, :4].reshape(-1, 3),
            rgb[:, -4:].reshape(-1, 3),
        )
    )
    quantized = (border // 16).astype(np.int16)
    colors, counts = np.unique(quantized, axis=0, return_counts=True)
    palette = colors[np.argsort(counts)[-6:]] * 16 + 8
    difference = rgb[:, :, None, :] - palette[None, None, :, :]
    distance = (difference * difference).sum(axis=3)
    return distance.min(axis=2) > 55**2


def image_metrics(path: Path) -> dict[str, Any]:
    with Image.open(path) as source:
        image = source.convert("RGBA")
        width, height = image.size
        true_alpha = image.getchannel("A").getextrema()[0] < 250
        x_edges = [index * width // 4 for index in range(5)]
        y_edges = [index * height // 4 for index in range(5)]
        blank_frames = 0
        edge_contacts = 0
        coverage: list[float] = []
        heights: list[float] = []
        widths: list[float] = []
        bottoms: list[float] = []
        centers: list[float] = []

        for row in range(4):
            for column in range(4):
                cell = image.crop(
                    (
                        x_edges[column],
                        y_edges[row],
                        x_edges[column + 1],
                        y_edges[row + 1],
                    )
                )
                mask = foreground_mask(cell, true_alpha)
                y_values, x_values = np.where(mask)
                if not len(x_values):
                    blank_frames += 1
                    coverage.append(0.0)
                    continue
                left = int(x_values.min())
                right = int(x_values.max()) + 1
                top = int(y_values.min())
                bottom = int(y_values.max()) + 1
                coverage.append(float(mask.mean()))
                heights.append((bottom - top) / 128)
                widths.append((right - left) / 128)
                bottoms.append(bottom / 128)
                centers.append((left + right) / 256)
                if left <= 1 or top <= 1 or right >= 127:
                    edge_contacts += 1

    def coefficient(values: list[float]) -> float:
        if len(values) < 2:
            return 0.0
        array = np.asarray(values, dtype=float)
        mean = float(array.mean())
        return float(array.std() / mean) if mean else 0.0

    return {
        "size": [width, height],
        "dimensions_divisible_by_four": width % 4 == 0 and height % 4 == 0,
        "true_alpha": true_alpha,
        "blank_frames": blank_frames,
        "non_ground_edge_contacts": edge_contacts,
        "median_foreground_coverage": round(float(np.median(coverage)), 4),
        "height_cv": round(coefficient(heights), 4),
        "width_cv": round(coefficient(widths), 4),
        "baseline_sd": round(float(np.std(bottoms)), 4) if len(bottoms) > 1 else 0.0,
        "center_sd": round(float(np.std(centers)), 4) if len(centers) > 1 else 0.0,
    }


def candidate_score(
    metrics: dict[str, Any], prompt_pack_version: int, action: str
) -> float:
    score = prompt_pack_version * 30.0
    score += 20.0 if metrics["true_alpha"] else 0.0
    score += 8.0 if metrics["dimensions_divisible_by_four"] else 0.0
    score -= metrics["blank_frames"] * 100.0
    score -= metrics["non_ground_edge_contacts"] * 5.0
    score -= metrics["height_cv"] * 40.0
    score -= metrics["width_cv"] * 25.0
    score -= metrics["center_sd"] * 15.0
    if action not in {
        "jump_land_recovery_4x4",
        "reactions_knockdown_4x4",
        "special_effects_4x4",
    }:
        score -= metrics["baseline_sd"] * 30.0
    return round(score, 3)


def collect_candidates() -> tuple[
    dict[tuple[str, str], list[Candidate]], list[str], list[list[str]]
]:
    pngs, prompts = source_files()
    paired_names = {prompt.with_suffix(".png").name for prompt in prompts}
    by_hash: dict[str, list[str]] = defaultdict(list)
    for image in pngs:
        by_hash[sha256(image)].append(image.name)
    duplicate_groups = sorted(
        (sorted(names) for names in by_hash.values() if len(names) > 1),
        key=lambda names: (-len(names), names[0]),
    )

    groups: dict[tuple[str, str], list[Candidate]] = defaultdict(list)
    for prompt in prompts:
        image = prompt.with_suffix(".png")
        if not image.is_file():
            continue
        character, action, version = parse_prompt(
            prompt.read_text(encoding="utf-8", errors="replace")
        )
        if character is None or action is None:
            continue
        image_hash = sha256(image)
        groups[(character, action)].append(
            Candidate(
                character=character,
                action=action,
                image=image,
                prompt=prompt,
                prompt_pack_version=version,
                image_sha256=image_hash,
                prompt_sha256=sha256(prompt),
                metrics=image_metrics(image),
                score=0.0,
                exact_aliases=[
                    name for name in by_hash[image_hash] if name != image.name
                ],
            )
        )
    for candidates in groups.values():
        for candidate in candidates:
            candidate.score = candidate_score(
                candidate.metrics, candidate.prompt_pack_version, candidate.action
            )
    png_only = sorted(image.name for image in pngs if image.name not in paired_names)
    return groups, png_only, duplicate_groups


def choose_candidates(
    groups: dict[tuple[str, str], list[Candidate]],
) -> dict[tuple[str, str], Candidate]:
    selected: dict[tuple[str, str], Candidate] = {}
    for key, candidates in groups.items():
        unique_by_hash: dict[str, Candidate] = {}
        for candidate in candidates:
            current = unique_by_hash.get(candidate.image_sha256)
            if current is None or candidate.score > current.score:
                unique_by_hash[candidate.image_sha256] = candidate
        unique = list(unique_by_hash.values())
        override_name = SELECTION_OVERRIDES.get(key)
        override = next(
            (
                candidate
                for candidate in unique
                if candidate.image.name == override_name
            ),
            None,
        )
        if override_name and override is None:
            raise RuntimeError(f"Missing selection override {key}: {override_name}")
        selected[key] = override or max(
            unique,
            key=lambda candidate: (
                candidate.score,
                candidate.prompt_pack_version,
                candidate.metrics["true_alpha"],
                candidate.image.name,
            ),
        )
    return selected


def ensure_relative_link_or_copy(source: Path, destination: Path) -> None:
    """Create a relative symlink, falling back to a byte copy when unavailable."""

    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists() or destination.is_symlink():
        destination.unlink()
    try:
        destination.symlink_to(os.path.relpath(source, destination.parent))
    except OSError:
        shutil.copy2(source, destination)


def copy_selected(selected: dict[tuple[str, str], Candidate], check: bool) -> list[str]:
    expected: list[str] = []
    for (character, action), candidate in sorted(selected.items()):
        canonical_directory = SELECTED / character
        canonical_image = canonical_directory / f"{action}.png"
        canonical_prompt = canonical_directory / f"{action}.prompt.txt"
        render_directory = RENDER_ROOT / character / "selected"
        render_image = render_directory / canonical_image.name
        render_prompt = render_directory / canonical_prompt.name
        destinations = (
            (canonical_image, candidate.image, candidate.image_sha256, "image"),
            (canonical_prompt, candidate.prompt, candidate.prompt_sha256, "prompt"),
            (render_image, canonical_image, candidate.image_sha256, "image"),
            (render_prompt, canonical_prompt, candidate.prompt_sha256, "prompt"),
        )
        for destination, source, expected_hash, label in destinations:
            expected.append(str(destination.relative_to(ROOT)))
            if check:
                if not destination.is_file() or sha256(destination) != expected_hash:
                    raise RuntimeError(f"Stale selected {label}: {destination}")
                continue
            ensure_relative_link_or_copy(source, destination)
    return expected


def default_base_sheet(action: str) -> dict[str, Any]:
    return {
        "source": f"selected/{action}.png",
        "output_suffix": f"{action}.png",
        "source_grid": [4, 4],
        "source_frames": list(range(16)),
        "frame_offsets": [[0, 0] for _ in range(16)],
        "frame_scales": [1.0 for _ in range(16)],
        "background_mode": "background-aware",
        "background_threshold": 55,
        "clips": BASE_CLIPS[action],
    }


def sync_base_curations(selected: dict[tuple[str, str], Candidate]) -> list[str]:
    written: list[str] = []
    for character in CHARACTERS:
        if character in PRESERVE_EXTERNAL_BASE:
            continue
        available = [
            action for action in BASE_ACTIONS if (character, action) in selected
        ]
        path = ROOT / f"characters/{character}/animation-v2.atlas.json"
        old: dict[str, Any] | None = None
        if path.is_file():
            old = json.loads(path.read_text(encoding="utf-8"))
        old_by_action = {
            sheet.get("output_suffix", "").removesuffix(".png"): sheet
            for sheet in (old or {}).get("sheets", [])
        }
        included = [
            action
            for action in BASE_ACTIONS
            if action in available or action in old_by_action
        ]
        if not included:
            continue
        sheets: list[dict[str, Any]] = []
        replaced: list[str] = []
        preserved: list[str] = []
        retained_without_fullset_pair: list[str] = []
        render_dir = RENDER_ROOT / character
        for action in included:
            old_sheet = old_by_action.get(action)
            candidate = selected.get((character, action))
            if candidate is None:
                if old_sheet is None:
                    raise RuntimeError(
                        f"Internal curation error: {character}/{action} has no selected or existing sheet"
                    )
                sheets.append(dict(old_sheet))
                retained_without_fullset_pair.append(action)
                continue
            old_hash = None
            if old_sheet is not None:
                old_source = render_dir / str(old_sheet.get("source", ""))
                if old_source.is_file():
                    old_hash = sha256(old_source)
            if old_sheet is not None and old_hash == candidate.image_sha256:
                sheet = dict(old_sheet)
                sheet["source"] = f"selected/{action}.png"
                sheets.append(sheet)
                preserved.append(action)
            else:
                sheets.append(default_base_sheet(action))
                replaced.append(action)
        review = dict((old or {}).get("review", {}))
        review.update(
            {
                "status": "source_curated",
                "selection_manifest": "docs/prompts/fullset/manifest.json",
                "preserved_hand_tuning": preserved,
                "reset_to_source_defaults": replaced,
                "retained_without_fullset_pair": retained_without_fullset_pair,
                "missing_base_actions": [
                    action for action in BASE_ACTIONS if action not in included
                ],
                "notes": [
                    "Canonical sources are selected from prompt/image pairs in docs/prompts/fullset.",
                    "Existing frame selection, scale, and root offsets were retained only when the chosen image hash matched the previously curated source.",
                    "Existing reviewed sheets without a correctly paired fullset prompt are retained rather than silently dropped.",
                    "Sheets whose source changed use neutral frame order and offsets and require a gameplay-scale motion review.",
                ],
            }
        )
        data = {
            "version": 2,
            "character": character,
            "review": review,
            "sheets": sheets,
        }
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        written.append(str(path.relative_to(ROOT)))
    return written


def sync_action_curations(selected: dict[tuple[str, str], Candidate]) -> list[str]:
    written: list[str] = []
    for character in CHARACTERS:
        available = [
            action for action in ACTION_ACTIONS if (character, action) in selected
        ]
        path = ROOT / f"characters/{character}/animation-v2.actions.json"
        if not available:
            # Remove known provisional mappings that had no matching prompt metadata.
            if path.is_file() and character == "deleuze_guattari":
                path.unlink()
                written.append(
                    str(path.relative_to(ROOT)) + " (removed invalid mapping)"
                )
            continue
        old: dict[str, Any] | None = None
        if path.is_file():
            old = json.loads(path.read_text(encoding="utf-8"))
        old_by_kind = {
            sheet.get("kind"): sheet for sheet in (old or {}).get("sheets", [])
        }
        render_dir = RENDER_ROOT / character
        preserved: list[str] = []
        replaced: list[str] = []
        sheets: list[dict[str, Any]] = []
        for action in available:
            kind = ACTION_KIND[action]
            candidate = selected[(character, action)]
            old_sheet = old_by_kind.get(kind)
            old_hash = None
            if old_sheet is not None:
                old_source = render_dir / str(old_sheet.get("source", ""))
                if old_source.is_file():
                    old_hash = sha256(old_source)
            if old_sheet is not None and old_hash == candidate.image_sha256:
                sheet = dict(old_sheet)
                sheet["source"] = f"selected/{action}.png"
                sheets.append(sheet)
                preserved.append(kind)
            else:
                sheets.append(
                    {
                        "kind": kind,
                        "source": f"selected/{action}.png",
                        "source_grid": [4, 4],
                        "source_frames": list(range(16)),
                        "frame_offsets": [[0, 0] for _ in range(16)],
                        "frame_scales": [1.0 for _ in range(16)],
                        "background_mode": "background-aware",
                        "background_threshold": 55,
                    }
                )
                replaced.append(kind)
        old_review = dict((old or {}).get("review", {}))
        old_notes = [
            note
            for note in old_review.get("notes", [])
            if isinstance(note, str)
            and note
            not in {
                "Duplicate candidates were collapsed by SHA-256 and resolved by explicit override or deterministic quality score.",
                "Neutral frame order and offsets are provisional until gameplay-scale motion review.",
            }
        ]
        data = {
            "character": character,
            "version": 2,
            "review": {
                **old_review,
                "status": "source_curated",
                "mapping_basis": "Prompt character_id and prompt_id metadata, never filename chronology.",
                "selection_manifest": "docs/prompts/fullset/manifest.json",
                "available_kinds": [ACTION_KIND[action] for action in available],
                "missing_kinds": [
                    ACTION_KIND[action]
                    for action in ACTION_ACTIONS
                    if action not in available
                ],
                "preserved_hand_tuning": preserved,
                "reset_to_source_defaults": replaced,
                "notes": [
                    *old_notes,
                    "Duplicate candidates were collapsed by SHA-256 and resolved by explicit override or deterministic quality score.",
                    "Existing frame selection and cleanup overrides are retained when the canonical source hash is unchanged.",
                    "Neutral frame order and offsets are provisional until gameplay-scale motion review.",
                ],
            },
            "sheets": sheets,
        }
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")
        written.append(str(path.relative_to(ROOT)))
    return written


def build_manifest(
    groups: dict[tuple[str, str], list[Candidate]],
    selected: dict[tuple[str, str], Candidate],
    png_only: list[str],
    duplicate_groups: list[list[str]],
) -> dict[str, Any]:
    selections: list[dict[str, Any]] = []
    for key in sorted(groups):
        chosen = selected[key]
        candidates = sorted(
            groups[key],
            key=lambda candidate: (-candidate.score, candidate.image.name),
        )
        selections.append(
            {
                "character": key[0],
                "action": key[1],
                "selected_image": chosen.image.name,
                "selected_prompt": chosen.prompt.name,
                "selected_image_sha256": chosen.image_sha256,
                "selected_prompt_sha256": chosen.prompt_sha256,
                "selection_method": (
                    "explicit_override"
                    if key in SELECTION_OVERRIDES
                    else "quality_score"
                ),
                "candidates": [
                    {
                        "image": candidate.image.name,
                        "prompt": candidate.prompt.name,
                        "image_sha256": candidate.image_sha256,
                        "prompt_sha256": candidate.prompt_sha256,
                        "prompt_pack_version": candidate.prompt_pack_version,
                        "score": candidate.score,
                        "metrics": candidate.metrics,
                        "exact_aliases": candidate.exact_aliases,
                        "selected": candidate.image_sha256 == chosen.image_sha256,
                    }
                    for candidate in candidates
                ],
            }
        )
    coverage = {
        character: {
            action: next(
                (
                    entry["selected_image"]
                    for entry in selections
                    if entry["character"] == character and entry["action"] == action
                ),
                None,
            )
            for action in ACTIONS
        }
        for character in CHARACTERS
    }
    missing = {
        character: [action for action, image in actions.items() if image is None]
        for character, actions in coverage.items()
    }
    retained_without_pair: dict[str, list[str]] = {}
    for character in CHARACTERS:
        curation_path = ROOT / f"characters/{character}/animation-v2.atlas.json"
        retained: list[str] = []
        if curation_path.is_file():
            curation = json.loads(curation_path.read_text(encoding="utf-8"))
            for sheet in curation.get("sheets", []):
                action = str(sheet.get("output_suffix", "")).removesuffix(".png")
                source = RENDER_ROOT / character / str(sheet.get("source", ""))
                if action in missing[character] and source.is_file():
                    retained.append(action)
        retained_without_pair[character] = retained
    render_missing = {
        character: [
            action
            for action in actions
            if action not in retained_without_pair[character]
        ]
        for character, actions in missing.items()
    }
    return {
        "version": 1,
        "source": "docs/prompts/fullset/raw",
        "ingest_sources": [
            "docs/prompts/fullset",
            *(str(path.relative_to(ROOT)) for path in DELIVERY_ROOTS),
        ],
        "selection_policy": {
            "primary_classifier": "prompt character_id and prompt_id metadata",
            "fallback_classifier": "exact prompt sheet signatures",
            "duplicate_identity": "SHA-256",
            "quality_metrics": [
                "blank frame count",
                "cell-edge contacts",
                "true alpha",
                "grid divisibility",
                "foreground scale variance",
                "baseline variance",
                "root-center variance",
            ],
            "warning": "The score is a structural ranking, not a substitute for human animation review.",
        },
        "totals": {
            "paired_candidates": sum(len(candidates) for candidates in groups.values()),
            "selected_pairs": len(selected),
            "characters_with_selections": len({key[0] for key in selected}),
            "png_without_paired_prompt": len(png_only),
            "exact_duplicate_groups": len(duplicate_groups),
            "exact_duplicate_files": sum(len(group) for group in duplicate_groups),
            "missing_pairs": sum(len(actions) for actions in missing.values()),
            "retained_unpaired_pairs": sum(
                len(actions) for actions in retained_without_pair.values()
            ),
            "renders_still_needed": sum(
                len(actions) for actions in render_missing.values()
            ),
            "complete_characters": sum(not actions for actions in render_missing.values()),
        },
        "coverage": coverage,
        "missing": missing,
        "retained_without_pair": retained_without_pair,
        "render_missing": render_missing,
        "selections": selections,
        "png_without_paired_prompt": png_only,
        "exact_duplicate_groups": duplicate_groups,
    }


def readme_text(manifest: dict[str, Any]) -> str:
    totals = manifest["totals"]
    lines = [
        "# Animation v2 full render corpus",
        "",
        "This directory is the canonical local archive of generated Animation v2 sprite sheets and their rendering prompts.",
        "The timestamp-named originals are preserved under `raw/`; deterministic canonical choices live under `selected/<character>/`.",
        "Paired deliveries under `docs/prompts/new-images-brawl*/` are copied into `raw/` without modifying their delivery directories.",
        "",
        "## Generated layout",
        "",
        "```text",
        "raw/                         untouched timestamp-named source files",
        "selected/<character>/        best available image and paired prompt per sheet type",
        "manifest.json                hashes, metrics, alternates, and selection decisions",
        "```",
        "",
        "## Inventory",
        "",
        f"- Paired render candidates: {totals['paired_candidates']}",
        f"- Canonical selected pairs: {totals['selected_pairs']}",
        f"- Characters represented: {totals['characters_with_selections']} / {len(CHARACTERS)}",
        f"- PNG files without a same-stem prompt: {totals['png_without_paired_prompt']}",
        f"- Exact duplicate groups: {totals['exact_duplicate_groups']}",
        f"- Canonical prompt/image gaps: {totals['missing_pairs']}",
        f"- Usable retained sheets without a paired fullset prompt: {totals['retained_unpaired_pairs']}",
        f"- Sprite renders still needed: {totals['renders_still_needed']}",
        f"- Characters with all 13 usable sets: {totals['complete_characters']} / {len(CHARACTERS)}",
        "",
        "## Remaining sprite renders needed",
        "",
        *[
            f"- `{character}` ({len(actions)}): "
            + (", ".join(f"`{action}`" for action in actions) if actions else "complete")
            for character, actions in manifest["render_missing"].items()
            if actions
        ],
        "",
        "## Retained without a paired fullset prompt",
        "",
        *[
            f"- `{character}`: " + ", ".join(f"`{action}`" for action in actions)
            for character, actions in manifest["retained_without_pair"].items()
            if actions
        ],
        "",
        "## Rebuild",
        "",
        "```sh",
        "python3 scripts/curate-animation-v2-fullset.py --sync-runtime",
        "python3 scripts/curate-animation-v2-fullset.py --check",
        "```",
        "",
        "Selection first trusts prompt metadata. Exact byte duplicates are collapsed. Alternate non-identical renders are ranked by grid completeness, alpha/background quality, clipping, and frame-to-frame structural stability. Explicit overrides document close visual decisions.",
        "",
        "A selected sheet is source-curated, not automatically art-approved. Gameplay-scale loop review remains required before release acceptance.",
        "",
    ]
    return "\n".join(lines)


def run(check: bool, sync_runtime: bool) -> None:
    imported = 0
    imported_from: list[str] = []
    if not check:
        organize_raw()
        imported, imported_from = ingest_new_images()
    groups, png_only, duplicate_groups = collect_candidates()
    selected = choose_candidates(groups)
    copy_selected(selected, check=check)
    manifest = build_manifest(groups, selected, png_only, duplicate_groups)
    manifest_text = json.dumps(manifest, indent=2, sort_keys=True) + "\n"
    readme = readme_text(manifest)

    manifest_path = FULLSET / "manifest.json"
    readme_path = FULLSET / "README.md"
    if check:
        if (
            not manifest_path.is_file()
            or manifest_path.read_text(encoding="utf-8") != manifest_text
        ):
            raise RuntimeError("docs/prompts/fullset/manifest.json is stale")
        if (
            not readme_path.is_file()
            or readme_path.read_text(encoding="utf-8") != readme
        ):
            raise RuntimeError("docs/prompts/fullset/README.md is stale")
    else:
        manifest_path.write_text(manifest_text, encoding="utf-8")
        readme_path.write_text(readme, encoding="utf-8")
        if sync_runtime:
            base_paths = sync_base_curations(selected)
            action_paths = sync_action_curations(selected)
            print(
                f"Runtime curation files refreshed: {len(base_paths) + len(action_paths)}"
            )

    if imported:
        print(
            f"Imported {imported} files from "
            + ", ".join(imported_from)
            + "."
        )
    print(
        "Animation v2 fullset: "
        f"{manifest['totals']['paired_candidates']} candidates -> "
        f"{manifest['totals']['selected_pairs']} canonical pairs across "
        f"{manifest['totals']['characters_with_selections']} characters; "
        f"{manifest['totals']['exact_duplicate_groups']} exact duplicate groups; "
        f"{manifest['totals']['png_without_paired_prompt']} unpaired PNGs."
    )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check", action="store_true", help="verify generated curation outputs"
    )
    parser.add_argument(
        "--sync-runtime",
        action="store_true",
        help="refresh character base/action curation JSON files from canonical selections",
    )
    arguments = parser.parse_args()
    if arguments.check and arguments.sync_runtime:
        parser.error("--check and --sync-runtime cannot be combined")
    run(check=arguments.check, sync_runtime=arguments.sync_runtime)


if __name__ == "__main__":
    main()
