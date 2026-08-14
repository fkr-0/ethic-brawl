# Item sprite render jobs

This generated corpus covers every equipment overlay and exceptional full-body pose declared by `item-visual-data.ts`. Overlay sheets are 4×2 at 96 px per cell; body-pose templates are one 256 px cell. No job is complete until its real PNG is rendered, structurally audited, visually reviewed, and integrated.

```bash
pnpm prompts:items:generate
pnpm prompts:items:check
```
