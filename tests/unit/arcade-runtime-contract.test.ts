import { describe, expect, it } from 'vitest';
import {
	ETHIC_ARCADE_PIXI_RUNTIME_VERSION,
	ETHIC_CANVAS_PASS_TO_PIXI_LAYER,
	ETHIC_PIXI_LAYERS
} from '../../src/render/arcade-runtime-contract';

describe('shared Pixi runtime contract', () => {
	it('pins the common runtime and preserves deterministic pass order', () => {
		expect(ETHIC_ARCADE_PIXI_RUNTIME_VERSION).toBe('0.2.0');
		expect(ETHIC_PIXI_LAYERS).toEqual([
			'backdrop',
			'world-back',
			'world',
			'actors',
			'effects',
			'world-front',
			'hud',
			'overlay'
		]);
		expect(ETHIC_CANVAS_PASS_TO_PIXI_LAYER.fighters).toBe('actors');
	});
});
