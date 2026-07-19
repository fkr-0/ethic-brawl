# Fine-grained Fighter Animation Prompt Pack

This pack expands the current four-pose idle and locomotion vocabulary without changing combat simulation or root motion.

## Source material

For a character named `<id>`, open `characters/<id>/prompts.yml` and copy these fields into the placeholders used by `prompt-pack.yml`:

- `common_prompt_prefix`
- `character_sprite_brief`
- `negative_prompt`
- `palette_anchors`
- `appearance_bible`
- `animation_bible`

Provide the current approved core sprite sheet as an image reference whenever the rendering model accepts one. Identity continuity is more important than decorative detail.

## Output contract

Each request produces one independent 4×4 RGBA sheet with exactly 16 equal cells. Use a square image of at least 1024×1024 pixels, divisible by four in both dimensions.

- transparent background only;
- no gutters, margins, frame lines, labels, or captions;
- orthographic side-view fighting-game camera;
- one character at a fixed scale and fixed ground anchor;
- full body inside every cell;
- identical costume, face, palette, lighting, outline weight, and pixel density;
- right-facing unless a turn frame explicitly changes facing;
- no baked screen translation: locomotion is shown through pose and weight transfer while the root stays centered;
- no motion trail crossing a cell boundary;
- frame 16 of a looping sheet must connect naturally back to frame 1 where specified.

## Sheets

| Sheet | Frames | Purpose |
|---|---:|---|
| `idle_turn_4x4` | 8 idle + 4 turn left + 4 turn right | Slow breathing, weight shifts, and readable facing changes |
| `walk_forward_backward_4x4` | 8 forward + 8 backward | Separate advance and guarded retreat cycles |
| `run_start_loop_stop_4x4` | 4 start + 8 loop + 4 brake | No instant jump from standing pose to maximum stride |
| `jump_land_recovery_4x4` | 4 takeoff + 4 air + 4 landing + 4 recovery | Continuous vertical action instead of one-frame popping |
| `lane_guard_crouch_4x4` | 4 lane-away + 4 lane-toward + 4 crouch + 4 guard | 2.5D sidesteps and basic defensive transitions |

Suggested output directory:

```text
assets/sprites/roster/<id>/source/animation-v2/
```

Suggested file names are listed in `atlas-manifest.template.yml`.

## Rendering workflow

1. Generate `idle_turn_4x4` first.
2. Reject it if identity, baseline, scale, or cell geometry drifts.
3. Use the approved idle sheet together with the current core sheet as references for every later sheet.
4. Generate locomotion sheets individually. Do not request all 80 frames in one image.
5. Compare frame 1 and frame 8 of each loop at 50% opacity; the silhouette should not jump.
6. Run the checklist in `REVIEW_CHECKLIST.md` before slicing or integrating anything.

## Runtime note

Ethic Brawl v1.3.3 slows and cross-dissolves the existing four-frame cycles and preserves phase when walking changes to running. These prompts are the asset-side follow-up. The new sheets are deliberately separate from the current core and extended atlases so they can be reviewed and integrated without replacing combat frames prematurely.
