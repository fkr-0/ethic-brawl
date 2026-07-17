#!/usr/bin/env python3
"""Build deterministic release-ready enemy and item pixel atlases."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Literal

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
CELL = 128
SHEET = CELL * 4


@dataclass(frozen=True)
class EnemyStyle:
    body: str
    accent: str
    skin: str = "#C98F68"
    scale: float = 1.0
    kind: Literal["human", "air_drone", "ground_drone", "zombie"] = "human"
    hood: bool = False
    mask: bool = False
    heavy: bool = False


ENEMY_SHEETS: dict[str, list[EnemyStyle]] = {
    "street": [
        EnemyStyle("#68402E", "#F1A94E"),
        EnemyStyle("#3E4C5D", "#F26B5B", mask=True),
        EnemyStyle("#422D46", "#D85D84", heavy=True, scale=1.08),
        EnemyStyle("#372C29", "#FF9F1C", heavy=True, scale=1.2),
    ],
    "crowd": [
        EnemyStyle("#1B1828", "#9D6CFF", hood=True, mask=True, scale=0.92),
        EnemyStyle("#241831", "#E14FFF", hood=True, mask=True),
        EnemyStyle("#315564", "#56D6C9"),
        EnemyStyle("#61313B", "#FF5B67", mask=True),
    ],
    "machines-apocalypse": [
        EnemyStyle("#263A49", "#00F5FF", kind="air_drone", scale=0.9),
        EnemyStyle("#384437", "#39FF14", kind="ground_drone"),
        EnemyStyle("#4A513D", "#A9C56D", skin="#8CA071", kind="zombie"),
        EnemyStyle(
            "#5A392C",
            "#FF7A45",
            skin="#9B735B",
            kind="zombie",
            heavy=True,
            scale=1.18,
        ),
    ],
}

ITEM_IDS = [
    "life_potion_small",
    "life_potion_large",
    "energy_potion_small",
    "energy_potion_large",
    "rusted_short_sword",
    "neon_duelist_sword",
    "street_argument_bat",
    "civic_mace",
    "riot_breaker_mace",
    "pipe",
    "uzi",
    "bat",
    "katana",
    "molotov_cocktail",
    "grenade",
    "boulder",
    "rocket_launcher",
    "minidrone",
    "computer_terminal",
    "sniper_rifle",
    "bow",
    "foldable_chair",
    "shovel",
    "book_stoic_body",
    "book_dialectic_reflexes",
    "book_machine_ethics",
    "book_arcology_rhetoric",
    "temp_boost_adrenaline_patch",
    "temp_boost_focus_lens",
    "temp_boost_armor_gel",
    "temp_boost_overclock_scroll",
]


def px(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], fill: str) -> None:
    draw.rectangle(box, fill=fill)


def line(
    draw: ImageDraw.ImageDraw,
    points: list[tuple[int, int]],
    fill: str,
    width: int = 4,
) -> None:
    draw.line(points, fill=fill, width=width, joint="curve")


def draw_human(
    draw: ImageDraw.ImageDraw,
    ox: int,
    oy: int,
    style: EnemyStyle,
    role: int,
) -> None:
    scale = style.scale
    base_x = ox + CELL // 2
    ground = oy + 112
    bob = (0, -2, 0, 4)[role]
    torso_y = ground - int(58 * scale) + bob
    head_r = int(10 * scale)
    head_y = torso_y - int(15 * scale)

    if role == 1:  # advancing
        lean = 7
        front_foot = 23
        rear_foot = -18
    elif role == 2:  # attacking
        lean = 10
        front_foot = 16
        rear_foot = -12
    elif role == 3:  # hurt
        lean = -8
        front_foot = 11
        rear_foot = -15
    else:
        lean = 0
        front_foot = 14
        rear_foot = -14

    hip = (base_x + lean // 2, torso_y + int(36 * scale))
    shoulder = (base_x + lean, torso_y + int(8 * scale))
    outline = "#100D16"
    limb_width = max(7, int(9 * scale))

    line(draw, [hip, (base_x + rear_foot, ground - 5), (base_x + rear_foot - 4, ground)], outline, limb_width + 4)
    line(draw, [hip, (base_x + front_foot, ground - 6), (base_x + front_foot + 6, ground)], outline, limb_width + 4)
    line(draw, [hip, (base_x + rear_foot, ground - 5), (base_x + rear_foot - 4, ground)], style.body, limb_width)
    line(draw, [hip, (base_x + front_foot, ground - 6), (base_x + front_foot + 6, ground)], style.body, limb_width)

    torso_w = int((28 if style.heavy else 22) * scale)
    draw.polygon(
        [
            (shoulder[0] - torso_w // 2, shoulder[1] - 3),
            (shoulder[0] + torso_w // 2, shoulder[1] - 3),
            (hip[0] + torso_w // 2 - 2, hip[1]),
            (hip[0] - torso_w // 2 + 2, hip[1]),
        ],
        fill=outline,
    )
    draw.polygon(
        [
            (shoulder[0] - torso_w // 2 + 3, shoulder[1]),
            (shoulder[0] + torso_w // 2 - 3, shoulder[1]),
            (hip[0] + torso_w // 2 - 5, hip[1] - 3),
            (hip[0] - torso_w // 2 + 5, hip[1] - 3),
        ],
        fill=style.body,
    )
    px(draw, (shoulder[0] - 3, shoulder[1], shoulder[0] + 3, hip[1] - 2), style.accent)

    if role == 2:
        arm_front = [(shoulder[0] + 7, shoulder[1] + 5), (base_x + 36, torso_y + 22), (base_x + 48, torso_y + 18)]
        arm_rear = [(shoulder[0] - 7, shoulder[1] + 7), (base_x - 13, torso_y + 28)]
    elif role == 3:
        arm_front = [(shoulder[0] + 7, shoulder[1] + 5), (base_x + 21, torso_y + 35)]
        arm_rear = [(shoulder[0] - 7, shoulder[1] + 7), (base_x - 26, torso_y + 14)]
    else:
        swing = 8 if role == 1 else 0
        arm_front = [(shoulder[0] + 7, shoulder[1] + 5), (base_x + 18 + swing, torso_y + 29)]
        arm_rear = [(shoulder[0] - 7, shoulder[1] + 7), (base_x - 16 - swing, torso_y + 28)]

    for arm in (arm_rear, arm_front):
        line(draw, arm, outline, limb_width + 3)
        line(draw, arm, style.body, limb_width - 1)
        hx, hy = arm[-1]
        draw.ellipse((hx - 5, hy - 5, hx + 5, hy + 5), fill=outline)
        draw.ellipse((hx - 3, hy - 3, hx + 3, hy + 3), fill=style.skin)

    head_x = shoulder[0] + (4 if role == 2 else 0)
    draw.ellipse(
        (head_x - head_r - 2, head_y - head_r - 2, head_x + head_r + 2, head_y + head_r + 2),
        fill=outline,
    )
    draw.ellipse(
        (head_x - head_r, head_y - head_r, head_x + head_r, head_y + head_r),
        fill=style.skin,
    )
    px(draw, (head_x + 3, head_y - 2, head_x + 6, head_y), "#18131C")
    if style.hood:
        draw.arc(
            (head_x - head_r - 4, head_y - head_r - 5, head_x + head_r + 4, head_y + head_r + 5),
            180,
            355,
            fill=style.accent,
            width=5,
        )
    if style.mask:
        px(draw, (head_x - 5, head_y + 2, head_x + head_r, head_y + 7), style.accent)

    if role == 3:
        line(draw, [(base_x + 24, torso_y - 5), (base_x + 31, torso_y - 12)], style.accent, 3)
        line(draw, [(base_x + 27, torso_y + 1), (base_x + 37, torso_y - 1)], style.accent, 3)


def draw_air_drone(draw: ImageDraw.ImageDraw, ox: int, oy: int, style: EnemyStyle, role: int) -> None:
    cx, cy = ox + 64 + (7 if role == 1 else 0), oy + 61 + (3 if role == 3 else 0)
    body = (cx - 25, cy - 13, cx + 25, cy + 13)
    draw.rounded_rectangle(body, radius=7, fill="#111723", outline=style.accent, width=4)
    px(draw, (cx - 5, cy - 4, cx + 7, cy + 5), style.accent)
    line(draw, [(cx - 23, cy), (cx - 43, cy - 12)], style.body, 6)
    line(draw, [(cx + 23, cy), (cx + 43, cy - 12)], style.body, 6)
    line(draw, [(cx - 50, cy - 12), (cx - 35, cy - 12)], style.accent, 3)
    line(draw, [(cx + 35, cy - 12), (cx + 50, cy - 12)], style.accent, 3)
    if role == 2:
        line(draw, [(cx + 25, cy + 4), (cx + 49, cy + 15)], "#FF5B67", 5)
        px(draw, (cx + 48, cy + 13, cx + 54, cy + 19), "#FFF3A1")
    if role == 3:
        line(draw, [(cx - 7, cy - 20), (cx + 2, cy - 30)], "#FF9F1C", 4)


def draw_ground_drone(draw: ImageDraw.ImageDraw, ox: int, oy: int, style: EnemyStyle, role: int) -> None:
    cx, ground = ox + 64 + (8 if role == 1 else 0), oy + 108
    draw.ellipse((cx - 34, ground - 17, cx + 34, ground + 1), fill="#10151A", outline=style.accent, width=4)
    draw.rounded_rectangle(
        (cx - 25, ground - 52, cx + 25, ground - 15),
        radius=8,
        fill=style.body,
        outline="#0D1013",
        width=4,
    )
    px(draw, (cx - 11, ground - 40, cx + 11, ground - 31), style.accent)
    if role == 2:
        line(draw, [(cx + 20, ground - 36), (cx + 48, ground - 40)], style.accent, 7)
        px(draw, (cx + 47, ground - 44, cx + 55, ground - 36), "#FFF3A1")
    if role == 3:
        line(draw, [(cx - 20, ground - 57), (cx - 30, ground - 68)], "#FF9F1C", 4)


def build_enemy_atlases() -> None:
    out_dir = ROOT / "public/assets/sprites/enemies"
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, styles in ENEMY_SHEETS.items():
        image = Image.new("RGBA", (SHEET, SHEET), (0, 0, 0, 0))
        draw = ImageDraw.Draw(image)
        for row, style in enumerate(styles):
            for role in range(4):
                ox, oy = role * CELL, row * CELL
                if style.kind == "air_drone":
                    draw_air_drone(draw, ox, oy, style, role)
                elif style.kind == "ground_drone":
                    draw_ground_drone(draw, ox, oy, style, role)
                else:
                    draw_human(draw, ox, oy, style, role)
        image.save(out_dir / f"{name}.png", optimize=True)


def draw_item(draw: ImageDraw.ImageDraw, ox: int, oy: int, item_id: str) -> None:
    cx, cy = ox + 64, oy + 64
    outline = "#0D0A14"

    if "potion" in item_id:
        large = "large" in item_id
        color = "#FF355E" if "life" in item_id else "#00D9FF"
        w, h = (32, 54) if large else (26, 44)
        draw.rounded_rectangle(
            (cx - w // 2, cy - h // 2 + 6, cx + w // 2, cy + h // 2),
            radius=8,
            fill=color,
            outline=outline,
            width=5,
        )
        px(draw, (cx - 9, cy - h // 2 - 4, cx + 9, cy - h // 2 + 8), "#D9E4EE")
        px(draw, (cx - w // 2 + 6, cy - h // 2 + 14, cx - w // 2 + 11, cy + h // 2 - 8), "#FFFFFF")
        return

    if item_id.startswith("book_"):
        colors = {
            "book_stoic_body": "#A77745",
            "book_dialectic_reflexes": "#D44761",
            "book_machine_ethics": "#35B8B2",
            "book_arcology_rhetoric": "#8A6AD8",
        }
        color = colors[item_id]
        draw.polygon(
            [(cx - 34, cy - 38), (cx + 31, cy - 30), (cx + 34, cy + 36), (cx - 31, cy + 30)],
            fill=outline,
        )
        draw.polygon(
            [(cx - 28, cy - 32), (cx + 25, cy - 26), (cx + 28, cy + 29), (cx - 25, cy + 24)],
            fill=color,
        )
        line(draw, [(cx - 17, cy - 8), (cx + 17, cy - 4)], "#F3E6BF", 5)
        line(draw, [(cx - 15, cy + 5), (cx + 12, cy + 8)], "#F3E6BF", 4)
        return

    if item_id.startswith("temp_boost_"):
        colors = {
            "temp_boost_adrenaline_patch": "#FF4E64",
            "temp_boost_focus_lens": "#00E4FF",
            "temp_boost_armor_gel": "#73E47C",
            "temp_boost_overclock_scroll": "#F1C94D",
        }
        color = colors[item_id]
        draw.rounded_rectangle((cx - 34, cy - 25, cx + 34, cy + 25), radius=8, fill=outline)
        draw.rounded_rectangle((cx - 28, cy - 19, cx + 28, cy + 19), radius=5, fill=color)
        line(draw, [(cx - 16, cy), (cx - 5, cy), (cx, cy - 12), (cx + 5, cy + 12), (cx + 16, cy)], "#FFFFFF", 5)
        return

    if "sword" in item_id or item_id == "katana":
        color = "#00F5FF" if "neon" in item_id else "#C7CDD3"
        line(draw, [(cx - 28, cy + 34), (cx + 27, cy - 31)], outline, 12)
        line(draw, [(cx - 26, cy + 31), (cx + 26, cy - 30)], color, 5)
        line(draw, [(cx - 37, cy + 18), (cx - 9, cy + 42)], "#D7A33D", 7)
        return

    if item_id in {"street_argument_bat", "bat", "pipe", "shovel"}:
        color = "#9A6A3B" if "bat" in item_id else "#A9B0B5"
        line(draw, [(cx - 29, cy + 34), (cx + 27, cy - 33)], outline, 15)
        line(draw, [(cx - 28, cy + 32), (cx + 26, cy - 31)], color, 8)
        if item_id == "shovel":
            draw.polygon([(cx + 16, cy - 29), (cx + 39, cy - 43), (cx + 45, cy - 24), (cx + 29, cy - 12)], fill="#78838A", outline=outline)
        return

    if "mace" in item_id:
        line(draw, [(cx - 25, cy + 35), (cx + 16, cy - 18)], outline, 14)
        line(draw, [(cx - 24, cy + 33), (cx + 15, cy - 17)], "#88704E", 7)
        draw.ellipse((cx + 1, cy - 36, cx + 37, cy), fill="#8B939A", outline=outline, width=5)
        return

    if item_id in {"uzi", "sniper_rifle", "rocket_launcher"}:
        length = 74 if item_id != "uzi" else 52
        color = "#59616A" if item_id != "rocket_launcher" else "#667547"
        draw.rounded_rectangle((cx - length // 2, cy - 15, cx + length // 2, cy + 10), radius=5, fill=color, outline=outline, width=5)
        px(draw, (cx - 4, cy + 7, cx + 10, cy + 31), outline)
        if item_id == "sniper_rifle":
            px(draw, (cx - 8, cy - 26, cx + 21, cy - 16), "#00D9FF")
        return

    if item_id == "molotov_cocktail":
        draw.rounded_rectangle((cx - 15, cy - 17, cx + 15, cy + 35), radius=6, fill="#6C8A63", outline=outline, width=5)
        line(draw, [(cx, cy - 18), (cx + 5, cy - 39)], "#D9C2A1", 7)
        draw.polygon([(cx + 5, cy - 42), (cx + 18, cy - 27), (cx + 8, cy - 20), (cx - 2, cy - 31)], fill="#FF8C32")
        return

    if item_id == "grenade":
        draw.ellipse((cx - 26, cy - 24, cx + 26, cy + 30), fill="#53624B", outline=outline, width=6)
        px(draw, (cx - 10, cy - 36, cx + 12, cy - 22), "#8B939A")
        line(draw, [(cx + 8, cy - 34), (cx + 25, cy - 42)], "#D1B66D", 5)
        return

    if item_id == "boulder":
        draw.polygon(
            [(cx - 38, cy - 8), (cx - 22, cy - 35), (cx + 21, cy - 39), (cx + 39, cy - 8), (cx + 28, cy + 35), (cx - 25, cy + 38)],
            fill="#77777C",
            outline=outline,
        )
        line(draw, [(cx - 18, cy - 20), (cx + 7, cy - 4), (cx + 25, cy - 16)], "#A2A2A8", 5)
        return

    if item_id == "minidrone":
        draw.ellipse((cx - 24, cy - 15, cx + 24, cy + 15), fill="#344B59", outline=outline, width=5)
        line(draw, [(cx - 22, cy), (cx - 44, cy - 13)], "#00F5FF", 6)
        line(draw, [(cx + 22, cy), (cx + 44, cy - 13)], "#00F5FF", 6)
        return

    if item_id == "computer_terminal":
        draw.rounded_rectangle((cx - 37, cy - 31, cx + 37, cy + 24), radius=6, fill="#2D3442", outline=outline, width=6)
        px(draw, (cx - 26, cy - 20, cx + 26, cy + 7), "#32D8C8")
        line(draw, [(cx - 19, cy + 36), (cx + 19, cy + 36)], "#8B939A", 7)
        return

    if item_id == "bow":
        draw.arc((cx - 38, cy - 45, cx + 37, cy + 45), 270, 90, fill="#C38A45", width=8)
        line(draw, [(cx, cy - 43), (cx, cy + 43)], "#E7D8B8", 3)
        line(draw, [(cx - 18, cy), (cx + 35, cy)], "#AFC5D6", 4)
        return

    if item_id == "foldable_chair":
        draw.rectangle((cx - 29, cy - 34, cx + 29, cy - 2), fill="#737C84", outline=outline, width=5)
        line(draw, [(cx - 22, cy - 2), (cx - 31, cy + 38)], outline, 7)
        line(draw, [(cx + 22, cy - 2), (cx + 31, cy + 38)], outline, 7)
        return


def build_item_atlases() -> None:
    out_dir = ROOT / "public/assets/sprites/items"
    out_dir.mkdir(parents=True, exist_ok=True)
    for sheet_index in range(2):
        image = Image.new("RGBA", (SHEET, SHEET), (0, 0, 0, 0))
        draw = ImageDraw.Draw(image)
        for local_index, item_id in enumerate(ITEM_IDS[sheet_index * 16 : (sheet_index + 1) * 16]):
            row, column = divmod(local_index, 4)
            draw_item(draw, column * CELL, row * CELL, item_id)
        image.save(out_dir / f"icons-{sheet_index + 1}.png", optimize=True)


def main() -> None:
    build_enemy_atlases()
    build_item_atlases()
    print("built 3 enemy atlases and 2 item atlases")


if __name__ == "__main__":
    main()
