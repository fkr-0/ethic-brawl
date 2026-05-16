# Sprite Rendering Testing Guide

## Quick Start

### 1. Start Dev Server
```bash
npm run dev
```

### 2. Open Test Page
Navigate to: `http://localhost:3001/test-sprites.html`

This will test all 4 character sprite sheets individually.

### 3. Test In-Game
Open: `http://localhost:3001/`

**Controls:**
- `F1` - Toggle sprite rendering on/off
- `F2` - Validate sprite mappings and log results
- `Shift+?` - Toggle help overlay

## Expected Results

### Test Page
Each character should:
1. Show their 4x4 sprite sheet
2. Display frame grid overlay
3. Show frame numbers (f00-f15)
4. Status: "✓ Loaded" in green

### In-Game
1. Characters should render as sprites (not procedural rectangles)
2. Animations should play based on state (idle, run, attack, etc.)
3. F1 should toggle between sprite and procedural rendering
4. F2 should log validation results to console

## Frame Layout
The 4x4 sprite sheets should have frames in this order:
- Row 0: idle, guard, taunt, run_1
- Row 1: run_2, run_3, run_4, crouch
- Row 2: jump_rise, air_attack, land, attack_1
- Row 3: attack_2, attack_3, victory, spare

## Troubleshooting

### Sprites Not Showing
1. Check browser console for errors
2. Verify sprite files exist: `public/assets/sprites/{character}/source/{character}.png`
3. Press F2 to validate sprite mappings
4. Toggle F1 to switch to procedural rendering

### Console Errors
- "Failed to load sprite assets" → Check file paths
- "Missing clip or atlas" → Sprite didn't load, falling back to procedural
- TypeScript errors during build → Check imports and types

## Validation
Run validation in browser console:
```javascript
// Should return validation results for all characters
validateAllCharacterSprites()
```

Expected output:
```javascript
{
  camus: { valid: true, issues: [] },
  diogenes: { valid: true, issues: [] },
  machiavelli: { valid: true, issues: [] },
  leibniz: { valid: true, issues: [] }
}
```

## Next Steps After Testing
1. If sprites load correctly → Proceed to scene flow hardening
2. If sprites fail → Check file paths and formats
3. If animations don't match → Update frame_labels.json metadata
