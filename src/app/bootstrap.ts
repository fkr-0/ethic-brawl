/**
 * Game initialization and bootstrap
 */

import { CANVAS_HEIGHT, CANVAS_WIDTH, DEFAULT_SETTINGS } from './config';
import type { GameSettings } from './config';

/**
 * Initialize the canvas element
 */
export function initCanvas(): HTMLCanvasElement {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement | null;
  if (!canvas) {
    throw new Error('Canvas element not found');
  }

  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;

  // Get 2D context
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  // Enable image smoothing for crisp pixels
  ctx.imageSmoothingEnabled = false;

  return canvas;
}

/**
 * Load settings from localStorage
 */
export function loadSettings(): GameSettings {
  try {
    const stored = localStorage.getItem('ethic_brawl_settings');
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<GameSettings>;
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // Ignore parse errors
  }
  return { ...DEFAULT_SETTINGS };
}

/**
 * Save settings to localStorage
 */
export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem('ethic_brawl_settings', JSON.stringify(settings));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Hide the loading screen
 */
export function hideLoading(): void {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.classList.add('hidden');
  }
}

/**
 * Show the loading screen
 */
export function showLoading(message?: string): void {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.classList.remove('hidden');
    if (message) {
      loading.textContent = message;
    }
  }
}

/**
 * Bootstrap the game
 */
export async function bootstrap(): Promise<{
  canvas: HTMLCanvasElement;
  settings: GameSettings;
}> {
  // Initialize canvas
  const canvas = initCanvas();

  // Load settings
  const settings = loadSettings();

  // Wait for fonts (if we had custom fonts)
  await document.fonts.ready;

  // Small delay to ensure everything is ready
  await new Promise((resolve) => setTimeout(resolve, 100));

  return { canvas, settings };
}
