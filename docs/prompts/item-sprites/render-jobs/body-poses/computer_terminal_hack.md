---
generated: true
generated_by: "docs/prompts/item-sprites/render-prompts.py"
job_id: "item_body_pose__computer_terminal_hack"
status: pending_render
output_image: "assets/sprites/items/computer_terminal_hack.png"
frames: 1
grid:
  columns: 1
  rows: 1
cell_size: [256, 256]
output_size: [256, 256]
reference_images:
  - "assets/sprites/items/icons-1.png"
  - "assets/sprites/items/icons-2.png"
  - "assets/sprites/roster/camus/source/camus_core_4x4.png"
source_definition: "src/content/items/item-visual-data.ts"
source_sha256: "dfd2fdd56c04ea5b4ccfec1e80c55c847335745b55d0760664a7f19d17dc0558"
---

# Computer Terminal Hack — `item_body_pose__computer_terminal_hack`

## Prompt

```text
Create EXACTLY one 256x256 RGBA pixel-art image arranged as a 1x1 grid with 1 equal 256x256 cells, row-major.

TARGET: Computer Terminal Hack.
A reusable full-body equipment pose template for Computer Terminal Hack. Preserve the Ethic Brawl side-view fighter proportions while making grip, weight, recoil, and silhouette mechanically unambiguous.
Draw a neutral modular fighter silhouette plus the named equipment interaction; no recognizable philosopher identity, text, scenery, or UI.
One complete side-view pose in the single cell, centered on the same root and baseline used by 256 px fighter frames.

Use true alpha transparency, crisp limited-palette pixel art, stable scale and lighting, no gutters, no labels, no checkerboard, no anti-aliased matte fringe, and no marks crossing cell boundaries. Every required cell must be occupied and meaningfully distinct. Keep glow and particles entirely inside the cell.
```

## Acceptance

The real PNG must pass `pnpm assets:audit`, then receive manual contact-sheet and in-engine review. A prompt file or placeholder is never completion.
