import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ETHIC_ARCADE_PIXI_RUNTIME_VERSION,
  ETHIC_ARCADE_RUNTIME_VERSION,
  ETHIC_CANVAS_PASS_TO_PIXI_LAYER,
  ETHIC_PIXI_BRIDGE_PASSES,
  ETHIC_PIXI_LAYERS,
  ETHIC_PIXI_RENDER_PLAN,
} from "../../src/render/arcade-runtime-contract";

describe("shared Pixi runtime contract", () => {
  it("pins the common runtime and preserves deterministic pass order", () => {
    expect(ETHIC_ARCADE_RUNTIME_VERSION).toBe("0.8.0");
    expect(ETHIC_ARCADE_PIXI_RUNTIME_VERSION).toBe(
      ETHIC_ARCADE_RUNTIME_VERSION,
    );
} from '../../src/render/arcade-runtime-contract';
import { ARCADE_CORE_VERSION as COMPAT_CORE_VERSION } from '../../vendor/arcade-core.mjs';
import { ARCADE_PIXI_RUNTIME_VERSION as COMPAT_PIXI_VERSION } from '../../vendor/arcade-pixi-runtime.mjs';
import { ARCADE_RUNTIME_VERSION as SHARED_RUNTIME_VERSION } from '../../vendor/arcade-runtime.mjs';

describe('shared Pixi runtime contract', () => {
  it('pins the common runtime and preserves deterministic pass order', () => {
    expect(ETHIC_ARCADE_RUNTIME_VERSION).toBe(SHARED_RUNTIME_VERSION);
    expect(ETHIC_ARCADE_PIXI_RUNTIME_VERSION).toBe(ETHIC_ARCADE_RUNTIME_VERSION);
    expect(ETHIC_PIXI_LAYERS).toEqual([
      "backdrop",
      "world-back",
      "world",
      "actors",
      "projectiles",
      "effects",
      "world-front",
      "hud",
      "overlay",
    ]);
    expect(ETHIC_CANVAS_PASS_TO_PIXI_LAYER.fighters).toBe("actors");
    expect(
      ETHIC_PIXI_RENDER_PLAN.map(({ name, layer }) => [name, layer]),
    ).toEqual([
      ["background", "backdrop"],
      ["stage-depth", "world-back"],
      ["arena", "world"],
      ["fighters", "actors"],
      ["projectiles", "projectiles"],
      ["combat-vfx", "effects"],
      ["foreground", "world-front"],
      ["fight-hud", "hud"],
      ["scene-ui", "overlay"],
    ]);
    expect(ETHIC_PIXI_BRIDGE_PASSES.map((pass) => pass.name)).toEqual([
      "background",
      "stage-depth",
      "arena",
      "foreground",
      "fight-hud",
      "scene-ui",
    ]);

    const runtimeModule = readFileSync(
      resolve(process.cwd(), "vendor/arcade-runtime.mjs"),
    );
    const metadata = JSON.parse(
      readFileSync(
        resolve(process.cwd(), "vendor/arcade-runtime.meta.json"),
        "utf8",
      ),
    ) as {
      package: string;
      version: string;
      sha256: string;
      typesSha256: string;
    };
    expect(metadata.package).toBe("@arcade/runtime");
    expect(metadata.version).toBe(ETHIC_ARCADE_RUNTIME_VERSION);
    expect(createHash("sha256").update(runtimeModule).digest("hex")).toBe(
      metadata.sha256,
    );
    const runtimeTypes = readFileSync(
      resolve(process.cwd(), "vendor/arcade-runtime.d.mts"),
    );
    expect(createHash("sha256").update(runtimeTypes).digest("hex")).toBe(
      metadata.typesSha256,
    );
    expect(createHash('sha256').update(runtimeModule).digest('hex')).toBe(metadata.sha256);
    const runtimeTypes = readFileSync(resolve(process.cwd(), 'vendor/arcade-runtime.d.mts'));
    expect(createHash('sha256').update(runtimeTypes).digest('hex')).toBe(metadata.typesSha256);

    expect(COMPAT_CORE_VERSION).toBe(ETHIC_ARCADE_RUNTIME_VERSION);
    expect(COMPAT_PIXI_VERSION).toBe(ETHIC_ARCADE_RUNTIME_VERSION);
    expect(readFileSync(resolve(process.cwd(), 'vendor/arcade-core.mjs'), 'utf8')).toContain(
      "export * from './arcade-runtime.mjs'"
    );
    expect(
      readFileSync(resolve(process.cwd(), 'vendor/arcade-pixi-runtime.mjs'), 'utf8')
    ).toContain("export * from './arcade-runtime.mjs'");
    expect(existsSync(resolve(process.cwd(), 'vendor/arcade-core.meta.json'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'vendor/arcade-pixi-runtime.meta.json'))).toBe(false);
  });
});
