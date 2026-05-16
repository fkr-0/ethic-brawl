#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <character_slug|all>" >&2
  exit 2
fi

python3 scripts/generate_sprite_manifest.py "$1"
