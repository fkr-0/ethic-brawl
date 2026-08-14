---
generated: true
generated_by: "docs/prompts/item-sprites/render-prompts.py"
job_id: "item_overlay__computer_terminal"
status: pending_render
output_image: "assets/sprites/items/computer_terminal.png"
frames: 8
grid:
  columns: 4
  rows: 2
cell_size: [96, 96]
output_size: [384, 192]
reference_images:
  - "assets/sprites/items/icons-1.png"
  - "assets/sprites/items/icons-2.png"
source_definition: "src/content/items/item-visual-data.ts"
source_sha256: "dfd2fdd56c04ea5b4ccfec1e80c55c847335745b55d0760664a7f19d17dc0558"
---

# Computer Terminal — `item_overlay__computer_terminal`

## Prompt

```text
Create EXACTLY one 384x192 RGBA pixel-art image arranged as a 4x2 grid with 8 equal 96x96 cells, row-major.

TARGET: Computer Terminal.
A production overlay for Computer Terminal; rendering kind tool_overlay, with restrained Terminal Hack Pulse impact language.
Draw the equipment only, with no fighter body. Keep the grip point stable and the object fully inside every cell.
Frames 1-4: held/idle, windup, active use, recovery. Frames 5-8: world pickup, thrown or fired state, impact/empty state, clean icon pose.

Use true alpha transparency, crisp limited-palette pixel art, stable scale and lighting, no gutters, no labels, no checkerboard, no anti-aliased matte fringe, and no marks crossing cell boundaries. Every required cell must be occupied and meaningfully distinct. Keep glow and particles entirely inside the cell.
```

## Acceptance

The real PNG must pass `pnpm assets:audit`, then receive manual contact-sheet and in-engine review. A prompt file or placeholder is never completion.
