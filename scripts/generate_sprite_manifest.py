#!/usr/bin/env python3
import json
import os
import sys
from pathlib import Path

try:
    from PIL import Image
except Exception:
    print("error: pillow is required. install with: python -m pip install pillow", file=sys.stderr)
    sys.exit(1)


def infer_pivot(w: int, h: int):
    return {"x": w // 2, "y": h - 2}


def load_motion_template(path: Path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def build_manifest(char_dir: Path):
    frames_dir = char_dir / "frames"
    meta_dir = char_dir / "meta"
    template_path = meta_dir / "motions.template.json"

    if not frames_dir.exists():
        raise FileNotFoundError(f"missing frames dir: {frames_dir}")
    if not template_path.exists():
        raise FileNotFoundError(f"missing template: {template_path}")

    template = load_motion_template(template_path)
    mapping = {int(e["index"]): e for e in template.get("frames", [])}

    entries = []
    for i in range(1, 17):
        fn = f"{i:02d}.png"
        fp = frames_dir / fn
        if not fp.exists():
            continue
        with Image.open(fp) as im:
            w, h = im.size
        m = mapping.get(i, {})
        entries.append(
            {
                "index": i,
                "file": fn,
                "motion": m.get("motion", "Unknown"),
                "orientation": m.get("orientation", template.get("orientation_default", "right")),
                "frame": {"x": 0, "y": 0, "w": w, "h": h},
                "pivot": infer_pivot(w, h),
                "duration_ms": 100,
            }
        )

    manifest = {
        "character": char_dir.name,
        "source": "frames",
        "orientation_default": template.get("orientation_default", "right"),
        "notes": template.get("notes", ""),
        "frames": entries,
        "clips": {
            "idle": [1],
            "fightpose": [2, 3],
            "run": [5, 6, 7, 8],
            "jump": [10, 11],
            "land": [9, 12],
            "attacks": [13, 14, 15],
            "special": [16],
        },
    }

    out = meta_dir / "sprite.manifest.json"
    with out.open("w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
        f.write("\n")
    return out


def main():
    if len(sys.argv) < 2:
        print("usage: generate_sprite_manifest.py <character_slug|all>", file=sys.stderr)
        sys.exit(2)

    base = Path("assets/sprites")
    target = sys.argv[1]

    chars = []
    if target == "all":
        for d in sorted(base.iterdir()):
            if d.is_dir() and (d / "meta" / "motions.template.json").exists():
                chars.append(d)
    else:
        d = base / target
        chars = [d]

    for c in chars:
        out = build_manifest(c)
        print(f"ok: {out}")


if __name__ == "__main__":
    main()
