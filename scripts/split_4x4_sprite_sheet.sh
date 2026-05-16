#!/usr/bin/env bash
set -euo pipefail

if ! command -v magick >/dev/null 2>&1 && ! command -v convert >/dev/null 2>&1; then
  echo "error: ImageMagick not found. Install imagemagick (magick/convert)." >&2
  exit 1
fi

if [[ $# -ne 2 ]]; then
  echo "usage: $0 <character_slug> <source_sheet_path>" >&2
  echo "example: $0 camus assets/sprites/camus/source/camus_4x4.png" >&2
  exit 1
fi

CHAR="$1"
SRC="$2"
OUT_DIR="assets/sprites/${CHAR}/frames"
mkdir -p "$OUT_DIR"

if [[ ! -f "$SRC" ]]; then
  echo "error: source file not found: $SRC" >&2
  exit 1
fi

TOOL="magick"
if ! command -v magick >/dev/null 2>&1; then
  TOOL="convert"
fi

# Split into 4x4 tiles in reading order and write 01..16.png
TMP_PREFIX="${OUT_DIR}/tmp_tile_"
if [[ "$TOOL" == "magick" ]]; then
  magick "$SRC" -crop 4x4@ +repage "${TMP_PREFIX}%02d.png"
else
  convert "$SRC" -crop 4x4@ +repage "${TMP_PREFIX}%02d.png"
fi

for i in $(seq 0 15); do
  src=$(printf "%s%02d.png" "$TMP_PREFIX" "$i")
  dst=$(printf "%s/%02d.png" "$OUT_DIR" "$((i+1))")
  mv "$src" "$dst"
done

echo "ok: wrote ${OUT_DIR}/01.png .. 16.png"
