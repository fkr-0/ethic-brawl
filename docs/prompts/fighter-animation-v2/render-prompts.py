#!/usr/bin/env python3
"""Generate one ready-to-render Markdown file per Animation v2 prompt.

The generator combines:

- ``prompt-pack.yml`` for the shared sheet instructions;
- ``atlas-manifest.template.yml`` for clip metadata; and
- every ``characters/<id>/prompts.yml`` identity bible.

By default it writes 5 render jobs for each character to
``docs/prompts/fighter-animation-v2/render-jobs/<character>/<prompt>.md``
and creates an index plus a machine-readable manifest.

Usage:

    python3 docs/prompts/fighter-animation-v2/render-prompts.py
    python3 docs/prompts/fighter-animation-v2/render-prompts.py --check
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable, Mapping

try:
    import yaml
except ModuleNotFoundError as error:  # pragma: no cover - environment-dependent
    raise SystemExit(
        "PyYAML is required. Install it with `python3 -m pip install PyYAML`."
    ) from error

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[2]
CHARACTERS = REPO / "characters"
DEFAULT_OUTPUT = HERE / "render-jobs"
MANIFEST_NAME = "manifest.json"
INDEX_NAME = "INDEX.md"
GENERATOR_PATH = "docs/prompts/fighter-animation-v2/render-prompts.py"
TOKEN = re.compile(r"\{\{\s*([A-Za-z0-9_]+)\s*\}\}")

CHARACTER_FIELDS = (
    "character_id",
    "common_prompt_prefix",
    "character_sprite_brief",
    "palette_anchors",
    "appearance_bible",
    "animation_bible",
    "negative_prompt",
)


@dataclass(frozen=True)
class RenderJob:
    character_id: str
    character_title: str
    prompt_id: str
    prompt_order: int
    markdown_path: Path
    output_image: str
    reference_images: tuple[str, ...]
    clips: Mapping[str, Mapping[str, Any]]
    prompt: str
    source_character: str


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="Verify generated files are current without writing them.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT,
        help=f"Output directory (default: {DEFAULT_OUTPUT.relative_to(REPO)}).",
    )
    return parser.parse_args()


def load_yaml(path: Path) -> dict[str, Any]:
    try:
        value = yaml.safe_load(path.read_text(encoding="utf-8"))
    except FileNotFoundError as error:
        raise SystemExit(f"Missing source file: {path.relative_to(REPO)}") from error
    if not isinstance(value, dict):
        raise SystemExit(f"Expected a YAML mapping in {path.relative_to(REPO)}")
    return value


def source_digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def substitute(template: str, context: Mapping[str, str], where: str) -> str:
    def replace(match: re.Match[str]) -> str:
        key = match.group(1)
        try:
            return context[key]
        except KeyError as error:
            raise SystemExit(f"Unresolved placeholder {{{{{key}}}}} in {where}") from error

    rendered = TOKEN.sub(replace, template)
    remaining = sorted(set(TOKEN.findall(rendered)))
    if remaining:
        raise SystemExit(f"Unresolved placeholders in {where}: {', '.join(remaining)}")
    return rendered


def require_text(mapping: Mapping[str, Any], key: str, source: Path) -> str:
    value = mapping.get(key)
    if not isinstance(value, str) or not value.strip():
        raise SystemExit(f"Missing non-empty `{key}` in {source.relative_to(REPO)}")
    return value.strip()


def relative_repo_path(path: Path) -> str:
    return path.resolve().relative_to(REPO).as_posix()


def reference_images(character_id: str) -> tuple[str, ...]:
    candidates = (
        REPO
        / "assets"
        / "sprites"
        / "roster"
        / character_id
        / "source"
        / f"{character_id}_core_4x4.png",
        REPO
        / "assets"
        / "sprites"
        / "roster"
        / character_id
        / "source"
        / f"{character_id}_extended_4x4.png",
    )
    return tuple(relative_repo_path(path) for path in candidates if path.is_file())


def clip_key(prompt_id: str) -> str:
    return prompt_id.removesuffix("_4x4")


def build_jobs(
    output_root: Path,
) -> tuple[list[RenderJob], dict[str, str], int]:
    pack_path = HERE / "prompt-pack.yml"
    atlas_path = HERE / "atlas-manifest.template.yml"
    pack = load_yaml(pack_path)
    atlas = load_yaml(atlas_path)

    pack_version = pack.get("version")
    if not isinstance(pack_version, int):
        raise SystemExit("`prompt-pack.yml` must contain an integer `version`")

    prompt_templates = pack.get("prompts")
    if not isinstance(prompt_templates, list) or not prompt_templates:
        raise SystemExit("`prompt-pack.yml` must contain a non-empty `prompts` list")

    sheets = atlas.get("sheets")
    if not isinstance(sheets, dict):
        raise SystemExit("`atlas-manifest.template.yml` must contain a `sheets` mapping")

    shared_context = {
        "shared_contract": require_text(pack, "shared_contract", pack_path),
        "shared_negative_prompt": require_text(pack, "shared_negative_prompt", pack_path),
    }
    source_hashes = {
        relative_repo_path(pack_path): source_digest(pack_path),
        relative_repo_path(atlas_path): source_digest(atlas_path),
    }

    jobs: list[RenderJob] = []
    seen_job_keys: set[tuple[str, str]] = set()
    character_sources = sorted(CHARACTERS.glob("*/prompts.yml"))
    if not character_sources:
        raise SystemExit("No character prompt bibles found under characters/*/prompts.yml")

    for character_path in character_sources:
        character = load_yaml(character_path)
        context = {
            field: require_text(character, field, character_path)
            for field in CHARACTER_FIELDS
        }
        character_id = context["character_id"]
        if character_id != character_path.parent.name:
            raise SystemExit(
                f"Character ID `{character_id}` does not match directory "
                f"`{character_path.parent.name}` in {character_path.relative_to(REPO)}"
            )
        character_title = require_text(character, "title", character_path)
        source_hashes[relative_repo_path(character_path)] = source_digest(character_path)

        for prompt_order, template in enumerate(prompt_templates):
            if not isinstance(template, dict):
                raise SystemExit("Every entry in `prompt-pack.yml.prompts` must be a mapping")
            prompt_id = require_text(template, "id", pack_path)
            output_template = require_text(template, "output", pack_path)
            prompt_template = require_text(template, "prompt", pack_path)
            job_key = (character_id, prompt_id)
            if job_key in seen_job_keys:
                raise SystemExit(f"Duplicate render job: {character_id}/{prompt_id}")
            seen_job_keys.add(job_key)

            sheet = sheets.get(clip_key(prompt_id), {})
            clips = sheet.get("clips", {}) if isinstance(sheet, dict) else {}
            if not isinstance(clips, dict):
                raise SystemExit(f"Invalid clip metadata for `{prompt_id}`")

            full_context = {**context, **shared_context}
            output_image = substitute(
                output_template, full_context, f"{prompt_id}.output"
            )
            rendered_prompt = substitute(
                prompt_template, full_context, f"{prompt_id}.prompt"
            ).strip()
            markdown_path = output_root / character_id / f"{prompt_id}.md"
            jobs.append(
                RenderJob(
                    character_id=character_id,
                    character_title=character_title,
                    prompt_id=prompt_id,
                    prompt_order=prompt_order,
                    markdown_path=markdown_path,
                    output_image=output_image,
                    reference_images=reference_images(character_id),
                    clips=clips,
                    prompt=rendered_prompt,
                    source_character=relative_repo_path(character_path),
                )
            )

    jobs.sort(key=lambda job: (job.character_id, job.prompt_order))
    return jobs, dict(sorted(source_hashes.items())), pack_version


def json_scalar(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def render_clip_table(clips: Mapping[str, Mapping[str, Any]]) -> str:
    if not clips:
        return "_No clip metadata is defined for this sheet._"
    rows = ["| Clip | Frames | Mode | Duration |", "|---|---|---|---:|"]
    for name, info in clips.items():
        frames = info.get("frames", [])
        frame_text = ", ".join(str(frame) for frame in frames)
        rows.append(
            f"| `{name}` | `{frame_text}` | `{info.get('mode', '')}` | "
            f"{info.get('duration', '')} |"
        )
    return "\n".join(rows)


def render_frontmatter(job: RenderJob, pack_version: int) -> str:
    lines = [
        "---",
        "generated: true",
        f"generated_by: {json_scalar(GENERATOR_PATH)}",
        f"prompt_pack_version: {pack_version}",
        f"character_id: {json_scalar(job.character_id)}",
        f"character_title: {json_scalar(job.character_title)}",
        f"prompt_id: {json_scalar(job.prompt_id)}",
        "status: pending_render",
        f"output_image: {json_scalar(job.output_image)}",
        "reference_images:",
    ]
    if job.reference_images:
        lines.extend(f"  - {json_scalar(path)}" for path in job.reference_images)
    else:
        lines[-1] = "reference_images: []"
    lines.extend(
        [
            f"source_character: {json_scalar(job.source_character)}",
            'source_pack: "docs/prompts/fighter-animation-v2/prompt-pack.yml"',
            "---",
        ]
    )
    return "\n".join(lines)


def render_job(job: RenderJob, pack_version: int) -> str:
    references = (
        "\n".join(f"- `{path}`" for path in job.reference_images)
        if job.reference_images
        else "- No approved source sheet was found automatically; provide the closest approved character reference manually."
    )
    return (
        f"{render_frontmatter(job, pack_version)}\n\n"
        f"# {job.character_title} — `{job.prompt_id}`\n\n"
        "This file is one complete Animation v2 render job. Copy only the text in "
        "the **Prompt** block into the rendering model.\n\n"
        "## Render target\n\n"
        f"- Output image: `{job.output_image}`\n"
        "- Sheet geometry: 4×4 cells, 16 frames, row-major\n"
        "- Review state: `pending_render`\n\n"
        "## Suggested reference images\n\n"
        f"{references}\n\n"
        "## Runtime clip plan\n\n"
        f"{render_clip_table(job.clips)}\n\n"
        "## Prompt\n\n"
        "```text\n"
        f"{job.prompt}\n"
        "```\n\n"
        "## Acceptance\n\n"
        "Review the rendered sheet against "
        "[`REVIEW_CHECKLIST.md`](../../REVIEW_CHECKLIST.md) before slicing or "
        "runtime integration.\n"
    )


def path_from_output(output_root: Path, path: Path) -> str:
    return path.resolve().relative_to(output_root.resolve()).as_posix()


def render_index(
    jobs: Iterable[RenderJob], pack_version: int, output_root: Path
) -> str:
    job_list = list(jobs)
    character_count = len({job.character_id for job in job_list})
    rows = [
        "| Character | Render job | Markdown | Output image |",
        "|---|---|---|---|",
    ]
    for job in job_list:
        link = path_from_output(output_root, job.markdown_path)
        rows.append(
            f"| {job.character_title} | `{job.prompt_id}` | "
            f"[`{link}`]({link}) | `{job.output_image}` |"
        )
    return (
        "# Animation v2 Render Jobs\n\n"
        "Generated by `docs/prompts/fighter-animation-v2/render-prompts.py`. "
        "Do not edit the individual job files by hand; update the prompt pack or "
        "a character prompt bible and regenerate them.\n\n"
        f"- Prompt-pack version: {pack_version}\n"
        f"- Characters: {character_count}\n"
        f"- Prompts per character: {len(job_list) // character_count}\n"
        f"- Total render jobs: {len(job_list)}\n\n"
        "Generate or refresh all files:\n\n"
        "```bash\n"
        "pnpm prompts:v2:generate\n"
        "```\n\n"
        "Verify that committed/generated files are current:\n\n"
        "```bash\n"
        "pnpm prompts:v2:check\n"
        "```\n\n"
        "## Jobs\n\n"
        f"{'\n'.join(rows)}\n"
    )


def render_manifest(
    jobs: Iterable[RenderJob],
    source_hashes: Mapping[str, str],
    pack_version: int,
    output_root: Path,
) -> str:
    job_list = list(jobs)
    payload = {
        "version": 1,
        "generatedBy": GENERATOR_PATH,
        "promptPackVersion": pack_version,
        "characterCount": len({job.character_id for job in job_list}),
        "jobCount": len(job_list),
        "sources": source_hashes,
        "jobs": [
            {
                "characterId": job.character_id,
                "promptId": job.prompt_id,
                "promptOrder": job.prompt_order,
                "markdown": path_from_output(output_root, job.markdown_path),
                "outputImage": job.output_image,
                "referenceImages": list(job.reference_images),
                "clips": list(job.clips),
            }
            for job in job_list
        ],
    }
    rendered = json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True)

    # Biome keeps short scalar arrays on one line. Match that canonical
    # representation here so generated output is lint-clean and `--check`
    # remains a deterministic byte-for-byte verification.
    scalar_array = re.compile(
        r'(?m)^(?P<prefix>\s+"(?:clips|referenceImages)":) \[\n'
        r'(?P<values>(?:\s+"(?:[^"\\]|\\.)*",?\n)+)'
        r'\s+\]'
    )

    def compact_short_array(match: re.Match[str]) -> str:
        values = [
            line.strip().removesuffix(",")
            for line in match.group("values").splitlines()
        ]
        compact = f'{match.group("prefix")} [{", ".join(values)}]'
        return compact if len(compact) <= 100 else match.group(0)

    return scalar_array.sub(compact_short_array, rendered) + "\n"


def expected_files(
    output_root: Path,
) -> tuple[dict[Path, str], list[RenderJob], int]:
    jobs, source_hashes, pack_version = build_jobs(output_root)
    files = {job.markdown_path: render_job(job, pack_version) for job in jobs}
    files[output_root / INDEX_NAME] = render_index(jobs, pack_version, output_root)
    files[output_root / MANIFEST_NAME] = render_manifest(
        jobs, source_hashes, pack_version, output_root
    )
    return files, jobs, pack_version


def old_generated_paths(output_root: Path) -> set[Path]:
    manifest_path = output_root / MANIFEST_NAME
    if not manifest_path.is_file():
        return set()
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return set()
    paths = {output_root / INDEX_NAME, manifest_path}
    for job in manifest.get("jobs", []):
        markdown = job.get("markdown") if isinstance(job, dict) else None
        if isinstance(markdown, str):
            candidate = (output_root / markdown).resolve()
            if candidate == output_root.resolve() or output_root.resolve() in candidate.parents:
                paths.add(candidate)
    return paths


def remove_empty_directories(output_root: Path) -> None:
    if not output_root.exists():
        return
    directories = sorted(
        (path for path in output_root.rglob("*") if path.is_dir()),
        key=lambda path: len(path.parts),
        reverse=True,
    )
    for directory in directories:
        try:
            directory.rmdir()
        except OSError:
            pass


def write_files(output_root: Path, files: Mapping[Path, str]) -> None:
    expected_paths = {path.resolve() for path in files}
    for stale_path in old_generated_paths(output_root) - expected_paths:
        if stale_path.is_file():
            stale_path.unlink()
    for path, content in files.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")
    remove_empty_directories(output_root)


def check_files(output_root: Path, files: Mapping[Path, str]) -> int:
    problems: list[str] = []
    expected_paths = {path.resolve() for path in files}
    for path, expected in files.items():
        relative = path.resolve().relative_to(REPO).as_posix()
        if not path.is_file():
            problems.append(f"missing: {relative}")
        elif path.read_text(encoding="utf-8") != expected:
            problems.append(f"outdated: {relative}")
    for stale_path in old_generated_paths(output_root) - expected_paths:
        if stale_path.is_file():
            problems.append(f"stale: {stale_path.relative_to(REPO).as_posix()}")

    if problems:
        print("Animation v2 render jobs are not current:", file=sys.stderr)
        for problem in problems:
            print(f"  - {problem}", file=sys.stderr)
        print("Run `pnpm prompts:v2:generate`.", file=sys.stderr)
        return 1
    print(f"Verified {len(files) - 2} Animation v2 render-job Markdown files.")
    return 0


def main() -> int:
    args = parse_args()
    output_root = args.output_dir
    if not output_root.is_absolute():
        output_root = (REPO / output_root).resolve()
    repo_root = REPO.resolve()
    if output_root != repo_root and repo_root not in output_root.parents:
        raise SystemExit("`--output-dir` must stay inside the repository root")
    files, jobs, _ = expected_files(output_root)

    if args.check:
        return check_files(output_root, files)

    write_files(output_root, files)
    character_count = len({job.character_id for job in jobs})
    print(
        f"Generated {len(jobs)} render-job Markdown files for "
        f"{character_count} characters in {output_root.relative_to(REPO)}."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
