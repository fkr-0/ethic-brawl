/**
 * LocalStorage persistence wrapper with type safety
 */

import { STORAGE_KEYS } from '@/app/config';

/**
 * Campaign progress data
 */
export interface CampaignProgress {
  currentStage: number;
  playerLevel: number;
  xp: number;
  xpToNextLevel: number;
  upgrades: string[];
  selectedCharacter: string;
  maxHealth: number;
  currentHealth: number;
  stats: {
    strength: number;
    defense: number;
    agility: number;
    energy: number;
  };
}

/**
 * Best score record
 */
export interface BestScore {
  character: string;
  score: number;
  stage: number;
  date: string;
}

/**
 * Full save data structure
 */
export interface SaveData {
  version: number;
  settings: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    audioLatencyCalibration: number;
    screenShake: boolean;
  };
  campaignProgress: CampaignProgress | null;
  bestScores: BestScore[];
  unlockedCharacters: string[];
  totalPlayTime: number;
  lastPlayed: string;
}

/**
 * Current save data version
 */
const SAVE_VERSION = 1;

/**
 * Create default save data
 */
export function createDefaultSaveData(): SaveData {
  return {
    version: SAVE_VERSION,
    settings: {
      masterVolume: 0.8,
      musicVolume: 0.6,
      sfxVolume: 0.8,
      audioLatencyCalibration: 0,
      screenShake: true,
    },
    campaignProgress: null,
    bestScores: [],
    unlockedCharacters: ['camus', 'leibniz', 'machiavelli', 'diogenes'],
    totalPlayTime: 0,
    lastPlayed: new Date().toISOString(),
  };
}

/**
 * Load save data from localStorage
 */
export function loadSaveData(): SaveData {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<SaveData>;
      // Merge with defaults for any missing fields
      const defaults = createDefaultSaveData();
      return {
        ...defaults,
        ...parsed,
        settings: { ...defaults.settings, ...parsed.settings },
      };
    }
  } catch (error) {
    console.error('Failed to load save data:', error);
  }
  return createDefaultSaveData();
}

/**
 * Save data to localStorage
 */
export function saveSaveData(data: SaveData): boolean {
  try {
    data.lastPlayed = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save data:', error);
    return false;
  }
}

/**
 * Update campaign progress
 */
export function saveCampaignProgress(progress: CampaignProgress): boolean {
  const data = loadSaveData();
  data.campaignProgress = progress;
  return saveSaveData(data);
}

/**
 * Clear campaign progress
 */
export function clearCampaignProgress(): boolean {
  const data = loadSaveData();
  data.campaignProgress = null;
  return saveSaveData(data);
}

/**
 * Save a new best score
 */
export function saveBestScore(score: BestScore): boolean {
  const data = loadSaveData();

  // Check if we already have a score for this character
  const existingIndex = data.bestScores.findIndex((s) => s.character === score.character);

  if (existingIndex >= 0) {
    const existingScore = data.bestScores[existingIndex];
    // Only update if new score is higher
    if (existingScore && score.score > existingScore.score) {
      data.bestScores[existingIndex] = score;
    }
  } else {
    data.bestScores.push(score);
  }

  // Sort by score descending
  data.bestScores.sort((a, b) => b.score - a.score);

  // Keep only top 10
  data.bestScores = data.bestScores.slice(0, 10);

  return saveSaveData(data);
}

/**
 * Get best score for a character
 */
export function getBestScore(character: string): BestScore | null {
  const data = loadSaveData();
  return data.bestScores.find((s) => s.character === character) ?? null;
}

/**
 * Add play time
 */
export function addPlayTime(seconds: number): void {
  const data = loadSaveData();
  data.totalPlayTime += seconds;
  saveSaveData(data);
}

/**
 * Save settings
 */
export function saveSettings(settings: SaveData['settings']): boolean {
  const data = loadSaveData();
  data.settings = { ...settings };
  return saveSaveData(data);
}

/**
 * Load settings
 */
export function loadSettings(): SaveData['settings'] {
  const data = loadSaveData();
  return data.settings;
}

/**
 * Check if a character is unlocked
 */
export function isCharacterUnlocked(character: string): boolean {
  const data = loadSaveData();
  return data.unlockedCharacters.includes(character);
}

/**
 * Unlock a character
 */
export function unlockCharacter(character: string): boolean {
  const data = loadSaveData();
  if (!data.unlockedCharacters.includes(character)) {
    data.unlockedCharacters.push(character);
    return saveSaveData(data);
  }
  return true;
}

/**
 * Clear all save data
 */
export function clearAllData(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.BEST_SCORES);
    return true;
  } catch (error) {
    console.error('Failed to clear data:', error);
    return false;
  }
}

/**
 * Export save data as JSON string
 */
export function exportSaveData(): string {
  const data = loadSaveData();
  return JSON.stringify(data, null, 2);
}

/**
 * Import save data from JSON string
 */
export function importSaveData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as SaveData;
    // Validate version
    if (typeof data.version !== 'number') {
      throw new Error('Invalid save data: missing version');
    }
    return saveSaveData(data);
  } catch (error) {
    console.error('Failed to import save data:', error);
    return false;
  }
}
