#!/usr/bin/env python3
"""Audit every sprite declared by the runtime-facing asset catalog."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path
from typing import Any

from PIL import Image, ImageDraw

REPO = Path(__file__).resolve().parents[1]
DEFAULT_OUTPUT = REPO / "generated/sprite-audit"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--fail-on-errors", action="store_true")
    parser.add_argument("--no-contact-sheet", action="store_true")
    return parser.parse_args()


def load_catalog() -> list[dict[str, Any]]:
    result = subprocess.run(
        ["node", "scripts/sprite-asset-catalog.mjs", str(REPO)],
        cwd=REPO,
        text=True,
        capture_output=True,
        check=True,
    )
    payload = json.loads(result.stdout)
    return payload["assets"]


def prompt_job_for(asset: dict[str, Any]) -> str | None:
    path = asset["path"]
    category = asset["category"]
    if category == "fighter":
        parts = Path(path).parts
        character_id = parts[3]
        stem = Path(path).stem
        prefix = f"{character_id}_"
        prompt_id = stem[len(prefix) :] if stem.startswith(prefix) else stem
        aliases = {
            "mobility_throw_4x4": "mobility_evasion_throw_4x4",
            "advanced_guard_4x4": "guard_parry_break_4x4",
            "damage_recovery_4x4": "reactions_knockdown_4x4",
        }
        prompt_id = aliases.get(prompt_id, prompt_id)
        return f"docs/prompts/fighter-animation-v2/render-jobs/{character_id}/{prompt_id}.md"
    if category == "item-overlay":
        return f"docs/prompts/item-sprites/render-jobs/overlays/{Path(path).stem}.md"
    if category == "item-body-pose":
        return f"docs/prompts/item-sprites/render-jobs/body-poses/{Path(path).stem}.md"
    return None


def frame_metrics(
    image: Image.Image, columns: int, rows: int, required_frames: int
) -> dict[str, Any]:
    rgba = image.convert("RGBA")
    if rgba.width % columns or rgba.height % rows:
        return {"grid_integral": False}
    cell_width = rgba.width // columns
    cell_height = rgba.height // rows
    hashes: dict[str, list[int]] = {}
    empty: list[int] = []
    edge_contacts: list[int] = []
    partial_alpha_pixels = 0
    for index in range(required_frames):
        column = index % columns
        row = index // columns
        cell = rgba.crop(
            (
                column * cell_width,
                row * cell_height,
                (column + 1) * cell_width,
                (row + 1) * cell_height,
            )
        )
        alpha = cell.getchannel("A")
        histogram = alpha.histogram()
        partial_alpha_pixels += sum(histogram[1:255])
        bbox = alpha.getbbox()
        if bbox is None:
            empty.append(index)
        else:
            left, top, right, bottom = bbox
            if left == 0 or top == 0 or right == cell_width or bottom == cell_height:
                edge_contacts.append(index)
        digest = hashlib.sha256(cell.tobytes()).hexdigest()
        hashes.setdefault(digest, []).append(index)
    duplicates = [indexes for indexes in hashes.values() if len(indexes) > 1]
    return {
        "grid_integral": True,
        "cell_size": [cell_width, cell_height],
        "empty_cells": empty,
        "duplicate_cell_groups": duplicates,
        "edge_contact_cells": edge_contacts,
        "partial_alpha_pixels": partial_alpha_pixels,
    }


def inspect_asset(asset: dict[str, Any]) -> dict[str, Any]:
    relative = asset["path"]
    path = REPO / relative
    result: dict[str, Any] = {
        **asset,
        "exists": path.is_file(),
        "prompt_job": prompt_job_for(asset),
        "errors": [],
        "warnings": [],
    }
    if not path.is_file():
        if asset.get("required", True):
            result["errors"].append("missing_source")
        else:
            result["warnings"].append("missing_optional")
        return result
    try:
        with Image.open(path) as image:
            image.load()
            result["actual"] = {
                "width": image.width,
                "height": image.height,
                "mode": image.mode,
                "has_alpha": "A" in image.getbands(),
            }
            expected = asset["expected"]
            inspected_image = image
            if asset.get("sourceContract") == "legacy-roster":
                accepted_square_widths = set(expected["acceptedSquareWidths"])
                if image.width == image.height and image.width in accepted_square_widths:
                    pass
                elif image.width == expected["normalizedWidth"] and image.height >= expected["normalizedHeight"]:
                    top = image.height - expected["normalizedHeight"]
                    inspected_image = image.crop((0, top, image.width, image.height))
                    result["normalization"] = {
                        "kind": "legacy-roster-bottom-crop",
                        "source_bounds": [0, top, image.width, image.height],
                        "effective_size": [inspected_image.width, inspected_image.height],
                    }
                else:
                    result["errors"].append("wrong_dimensions")
            elif (image.width, image.height) != (expected["width"], expected["height"]):
                result["errors"].append("wrong_dimensions")
            if "A" not in image.getbands():
                result["errors"].append("missing_alpha")
            required_frames = asset.get(
                "requiredFrames", asset["grid"]["columns"] * asset["grid"]["rows"]
            )
            metrics = frame_metrics(
                inspected_image,
                asset["grid"]["columns"],
                asset["grid"]["rows"],
                required_frames,
            )
            result["metrics"] = metrics
            if not metrics["grid_integral"]:
                result["errors"].append("non_integral_grid")
            else:
                if metrics["empty_cells"]:
                    result["errors"].append("empty_cells")
                if metrics["partial_alpha_pixels"]:
                    result["warnings"].append("partial_alpha")
                if metrics["duplicate_cell_groups"]:
                    result["warnings"].append("duplicate_cells")
                if metrics["edge_contact_cells"]:
                    result["warnings"].append("edge_contact")
    except Exception as error:  # noqa: BLE001 - report malformed assets precisely
        result["errors"].append("decode_error")
        result["decode_error"] = str(error)
    return result


def render_markdown(results: list[dict[str, Any]], summary: dict[str, Any]) -> str:
    lines = [
        "# Ethic Brawl Sprite Audit",
        "",
        "This report is generated from runtime declarations. File existence alone is not treated as artistic approval.",
        "",
        "## Summary",
        "",
        f"- Declared assets: **{summary['assets']}**",
        f"- Assets with hard errors: **{summary['assets_with_errors']}**",
        f"- Assets requiring visual review: **{summary['assets_with_warnings']}**",
        f"- Missing source art: **{summary['errors'].get('missing_source', 0)}**",
        f"- Pending optional art: **{summary['warnings'].get('missing_optional', 0)}**",
        f"- Wrong dimensions: **{summary['errors'].get('wrong_dimensions', 0)}**",
        f"- Non-integral grids: **{summary['errors'].get('non_integral_grid', 0)}**",
        "",
        "## Hard errors",
        "",
        "| Asset | Category | Errors | Prompt job |",
        "|---|---|---|---|",
    ]
    for result in results:
        if result["errors"]:
            prompt = f"`{result['prompt_job']}`" if result["prompt_job"] else "—"
            lines.append(
                f"| `{result['path']}` | {result['category']} | "
                f"{', '.join(result['errors'])} | {prompt} |"
            )
    lines.extend(
        [
            "",
            "## Visual-review warnings",
            "",
            "Warnings are not automatically rejected because effects, knockdowns, and intentional holds can legitimately touch edges or reuse frames.",
            "",
            "| Asset | Warnings |",
            "|---|---|",
        ]
    )
    for result in results:
        if result["warnings"]:
            lines.append(f"| `{result['path']}` | {', '.join(result['warnings'])} |")
    return "\n".join(lines) + "\n"


def render_contact_sheet(results: list[dict[str, Any]], output: Path) -> None:
    candidates = [result for result in results if result["exists"] and (result["errors"] or result["warnings"])]
    if not candidates:
        return
    tile_width, tile_height = 260, 190
    columns = 4
    rows = (len(candidates) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * tile_width, rows * tile_height), "#17111f")
    draw = ImageDraw.Draw(sheet)
    for index, result in enumerate(candidates):
        x = (index % columns) * tile_width
        y = (index // columns) * tile_height
        with Image.open(REPO / result["path"]) as source:
            preview = source.convert("RGBA")
            preview.thumbnail((240, 145), Image.Resampling.NEAREST)
            px = x + (tile_width - preview.width) // 2
            checker = Image.new("RGBA", preview.size, "#2b2233")
            checker.alpha_composite(preview)
            sheet.paste(checker.convert("RGB"), (px, y + 6))
        label = Path(result["path"]).name[:36]
        state = ",".join(result["errors"] or result["warnings"])
        draw.text((x + 8, y + 154), label, fill="#f4efff")
        draw.text((x + 8, y + 170), state[:38], fill="#ffb4d9")
    sheet.save(output)


def render_dashboard(
    results: list[dict[str, Any]], summary: dict[str, Any], output: Path
) -> None:
    payload = json.dumps(results, separators=(",", ":")).replace("</", "<\\/")
    summary_payload = json.dumps(summary, separators=(",", ":")).replace("</", "<\\/")
    document = """<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Ethic Brawl Sprite Signal Deck</title>
  <style>
    :root { color-scheme: dark; --ink:#f7f3ff; --muted:#a69ab8; --panel:#161020; --line:#39294c; --cyan:#4ff6f2; --pink:#ff5caf; --acid:#c8ff4f; --danger:#ff657a; }
    * { box-sizing:border-box; }
    body { margin:0; min-height:100vh; background:radial-gradient(circle at 15% -5%,#3b1851 0,transparent 34rem),#0b0710; color:var(--ink); font:15px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace; }
    header { position:sticky; top:0; z-index:5; padding:22px clamp(18px,4vw,56px); border-bottom:1px solid var(--line); background:rgba(11,7,16,.93); backdrop-filter:blur(18px); }
    .eyebrow { color:var(--cyan); letter-spacing:.18em; text-transform:uppercase; font-size:11px; }
    h1 { margin:.25rem 0 .4rem; font-size:clamp(24px,4vw,48px); line-height:1; letter-spacing:-.05em; }
    h1 span { color:var(--pink); }
    .lede { max-width:75ch; color:var(--muted); margin:0; }
    .metrics { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; margin-top:18px; }
    .metric { padding:12px 14px; background:var(--panel); border:1px solid var(--line); border-radius:12px; }
    .metric strong { display:block; font-size:22px; color:var(--acid); }
    main { padding:22px clamp(18px,4vw,56px) 80px; }
    .controls { display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-bottom:18px; }
    input,select,button { min-height:42px; border:1px solid var(--line); background:#120c1a; color:var(--ink); border-radius:10px; padding:8px 12px; font:inherit; }
    input { flex:1 1 260px; }
    button[aria-pressed="true"] { border-color:var(--cyan); color:var(--cyan); box-shadow:0 0 0 1px var(--cyan) inset; }
    button:focus-visible,input:focus-visible,select:focus-visible,a:focus-visible { outline:3px solid var(--acid); outline-offset:2px; }
    #count { margin-left:auto; color:var(--muted); }
    .grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(290px,1fr)); gap:14px; }
    article { min-width:0; overflow:hidden; background:linear-gradient(160deg,#1a1225,#100b16); border:1px solid var(--line); border-radius:16px; }
    article[data-severity="hard"] { border-color:#7a3041; }
    article[data-severity="review"] { border-color:#685829; }
    .preview { aspect-ratio:16/9; display:grid; place-items:center; background-color:#1c1524; background-image:linear-gradient(45deg,#241a2f 25%,transparent 25%),linear-gradient(-45deg,#241a2f 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#241a2f 75%),linear-gradient(-45deg,transparent 75%,#241a2f 75%); background-size:20px 20px; background-position:0 0,0 10px,10px -10px,-10px 0; }
    .preview img { max-width:100%; max-height:100%; image-rendering:pixelated; object-fit:contain; }
    .missing { color:var(--danger); text-transform:uppercase; letter-spacing:.12em; font-size:12px; }
    .body { padding:14px; }
    .topline { display:flex; gap:8px; align-items:start; justify-content:space-between; }
    h2 { min-width:0; margin:0; font-size:15px; overflow-wrap:anywhere; }
    .category { color:var(--cyan); font-size:11px; white-space:nowrap; }
    .path { color:var(--muted); font-size:11px; overflow-wrap:anywhere; margin:8px 0; }
    .tags { display:flex; flex-wrap:wrap; gap:6px; min-height:24px; }
    .tag { padding:3px 7px; border:1px solid var(--line); border-radius:999px; font-size:10px; }
    .tag.error { color:#ff9dad; border-color:#7a3041; }
    .tag.warning { color:#ffe887; border-color:#685829; }
    .meta { display:flex; gap:12px; color:var(--muted); font-size:11px; margin-top:10px; }
    .links { display:flex; gap:12px; margin-top:12px; }
    a { color:var(--cyan); }
    .empty { padding:60px 20px; text-align:center; color:var(--muted); border:1px dashed var(--line); border-radius:16px; }
    @media (max-width:700px) { .metrics { grid-template-columns:repeat(2,1fr); } #count { width:100%; margin-left:0; } }
  </style>
</head>
<body>
<header>
  <div class="eyebrow">release evidence / visual systems</div>
  <h1>Sprite <span>Signal Deck</span></h1>
  <p class="lede">Runtime-derived evidence. Existing is not the same as approved; warnings stay visible until an expert reviews the contact sheet and the in-engine motion.</p>
  <div class="metrics" id="metrics"></div>
</header>
<main>
  <div class="controls" aria-label="Audit filters">
    <input id="search" type="search" placeholder="Search path, category, error…  /" aria-label="Search sprite assets">
    <select id="category" aria-label="Filter by category"><option value="all">All categories</option></select>
    <button data-filter="all" aria-pressed="true">All</button>
    <button data-filter="hard" aria-pressed="false">Hard errors</button>
    <button data-filter="review" aria-pressed="false">Review</button>
    <button data-filter="clean" aria-pressed="false">Structurally clean</button>
    <output id="count" aria-live="polite"></output>
  </div>
  <section class="grid" id="grid" aria-label="Sprite audit results"></section>
</main>
<script type="application/json" id="asset-data">__DATA__</script>
<script type="application/json" id="summary-data">__SUMMARY__</script>
<script>
const assets=JSON.parse(document.querySelector('#asset-data').textContent);
const summary=JSON.parse(document.querySelector('#summary-data').textContent);
const state={filter:'all',category:'all',query:''};
const esc=(value)=>String(value).replace(/[&<>"']/g,(character)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const severity=(asset)=>asset.errors.length?'hard':asset.warnings.length?'review':'clean';
document.querySelector('#metrics').innerHTML=[['declared',summary.assets],['hard errors',summary.assets_with_errors],['review flags',summary.assets_with_warnings],['missing art',summary.errors.missing_source||0]].map(([label,value])=>`<div class="metric"><strong>${value}</strong>${label}</div>`).join('');
const category=document.querySelector('#category');
[...new Set(assets.map((asset)=>asset.category))].sort().forEach((value)=>category.insertAdjacentHTML('beforeend',`<option value="${esc(value)}">${esc(value)}</option>`));
function card(asset){
  const image=asset.exists?`<img loading="lazy" src="../../${esc(asset.path)}" alt="Preview of ${esc(asset.path)}">`:`<span class="missing">render required</span>`;
  const tags=[...asset.errors.map((value)=>`<span class="tag error">${esc(value)}</span>`),...asset.warnings.map((value)=>`<span class="tag warning">${esc(value)}</span>`)].join('');
  const actual=asset.actual?`${asset.actual.width}×${asset.actual.height} ${asset.actual.mode}`:'not rendered';
  const prompt=asset.prompt_job?`<a href="../../${esc(asset.prompt_job)}">render job</a>`:'';
  const source=asset.exists?`<a href="../../${esc(asset.path)}">source PNG</a>`:'';
  return `<article data-severity="${severity(asset)}"><div class="preview">${image}</div><div class="body"><div class="topline"><h2>${esc(asset.path.split('/').pop())}</h2><span class="category">${esc(asset.category)}</span></div><div class="path">${esc(asset.path)}</div><div class="tags">${tags||'<span class="tag">no structural flags</span>'}</div><div class="meta"><span>${actual}</span><span>${asset.grid.columns}×${asset.grid.rows} grid</span></div><div class="links">${prompt}${source}</div></div></article>`;
}
function render(){
  const query=state.query.trim().toLowerCase();
  const visible=assets.filter((asset)=>(state.filter==='all'||severity(asset)===state.filter)&&(state.category==='all'||asset.category===state.category)&&(!query||JSON.stringify(asset).toLowerCase().includes(query)));
  document.querySelector('#grid').innerHTML=visible.length?visible.map(card).join(''):'<div class="empty">No signals match this filter.</div>';
  document.querySelector('#count').textContent=`${visible.length} / ${assets.length} assets`;
}
document.querySelectorAll('[data-filter]').forEach((button)=>button.addEventListener('click',()=>{state.filter=button.dataset.filter;document.querySelectorAll('[data-filter]').forEach((other)=>other.setAttribute('aria-pressed',String(other===button)));render();}));
document.querySelector('#search').addEventListener('input',(event)=>{state.query=event.target.value;render();});
category.addEventListener('change',(event)=>{state.category=event.target.value;render();});
document.addEventListener('keydown',(event)=>{if(event.key==='/'&&document.activeElement.tagName!=='INPUT'){event.preventDefault();document.querySelector('#search').focus();}if(event.key==='Escape'){state.query='';document.querySelector('#search').value='';render();}});
render();
</script>
</body>
</html>"""
    output.write_text(
        document.replace("__DATA__", payload).replace("__SUMMARY__", summary_payload)
    )


def main() -> int:
    args = parse_args()
    output_dir = args.output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)
    results = [inspect_asset(asset) for asset in load_catalog()]
    error_counts = Counter(error for result in results for error in result["errors"])
    warning_counts = Counter(warning for result in results for warning in result["warnings"])
    category_counts = Counter(result["category"] for result in results)
    summary = {
        "assets": len(results),
        "assets_with_errors": sum(bool(result["errors"]) for result in results),
        "assets_with_warnings": sum(bool(result["warnings"]) for result in results),
        "errors": dict(sorted(error_counts.items())),
        "warnings": dict(sorted(warning_counts.items())),
        "categories": dict(sorted(category_counts.items())),
    }
    payload = {"schema_version": 1, "summary": summary, "assets": results}
    (output_dir / "report.json").write_text(json.dumps(payload, indent=2) + "\n")
    (output_dir / "report.md").write_text(render_markdown(results, summary))
    render_dashboard(results, summary, output_dir / "index.html")
    if not args.no_contact_sheet:
        render_contact_sheet(results, output_dir / "contact-sheet.png")
    print(json.dumps(summary, indent=2))
    if args.fail_on_errors and summary["assets_with_errors"]:
        print(f"Sprite asset audit failed: {summary['assets_with_errors']} assets have hard errors.", file=sys.stderr)
        return 1
    print("Sprite asset audit completed; inspect generated/sprite-audit/report.md.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
