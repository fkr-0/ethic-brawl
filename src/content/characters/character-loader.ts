import type { FighterStats } from '@/game/fight/fighter-state';

export interface PromptCharacterStats {
  strength: number;
  defense?: number;
  intelligence: number;
  agility: number;
  vitality: number;
  energy: number;
}

export interface PromptCharacterData {
  id: string;
  title: string;
  stats: PromptCharacterStats;
  abilities?: string[];
}

// Compile-safe mirror of assets/sprites/prompt.yml gameplay metadata.
// Keep this file deterministic and data-only; prompt.yml remains the authoring surface.
export const PROMPT_CHARACTER_DATA: PromptCharacterData[] = [
  {
    id: 'camus',
    title: 'Albert Camus',
    stats: { intelligence: 8, strength: 6, agility: 8, vitality: 6, energy: 7 },
  },
  {
    id: 'leibniz',
    title: 'Gottfried Wilhelm Leibniz',
    stats: { intelligence: 10, strength: 5, agility: 6, vitality: 6, energy: 9 },
  },
  {
    id: 'machiavelli',
    title: 'Niccolo Machiavelli',
    stats: { intelligence: 8, strength: 7, agility: 9, vitality: 5, energy: 6 },
  },
  {
    id: 'diogenes',
    title: 'Diogenes',
    stats: { intelligence: 7, strength: 6, agility: 7, vitality: 8, energy: 6 },
  },
  {
    id: 'focault',
    title: 'Michel Foucault',
    stats: { intelligence: 10, strength: 4, agility: 6, vitality: 6, energy: 8 },
  },
  {
    id: 'aristotle',
    title: 'Aristotle',
    stats: { intelligence: 9, strength: 7, agility: 5, vitality: 8, energy: 6 },
  },
  {
    id: 'socrates',
    title: 'Socrates',
    stats: { intelligence: 10, strength: 3, agility: 5, vitality: 7, energy: 9 },
    abilities: ['elenchus_reflect'],
  },
  {
    id: 'aquinas',
    title: 'Thomas Aquinas',
    stats: { intelligence: 8, strength: 8, agility: 3, vitality: 10, energy: 7 },
  },
  {
    id: 'anselm',
    title: 'Anselm of Canterbury',
    stats: { intelligence: 9, strength: 4, agility: 4, vitality: 6, energy: 9 },
  },
  {
    id: 'marx',
    title: 'Karl Marx',
    stats: { intelligence: 9, strength: 7, agility: 4, vitality: 8, energy: 7 },
  },
  {
    id: 'bakunin',
    title: 'Mikhail Bakunin',
    stats: { intelligence: 7, strength: 8, agility: 7, vitality: 7, energy: 6 },
  },
  {
    id: 'schmitt',
    title: 'Carl Schmitt',
    stats: { intelligence: 8, strength: 7, agility: 4, vitality: 9, energy: 6 },
  },
  {
    id: 'kant',
    title: 'Immanuel Kant',
    stats: { intelligence: 10, strength: 5, agility: 5, vitality: 7, energy: 8 },
  },
  {
    id: 'hegel',
    title: 'G.W.F. Hegel',
    stats: { intelligence: 10, strength: 6, agility: 5, vitality: 8, energy: 8 },
    abilities: ['dialectic_build'],
  },
  {
    id: 'nietzsche',
    title: 'Friedrich Nietzsche',
    stats: { intelligence: 9, strength: 8, agility: 7, vitality: 5, energy: 8 },
  },
  {
    id: 'foucault',
    title: 'Michel Foucault',
    stats: { intelligence: 9, strength: 4, agility: 6, vitality: 6, energy: 9 },
  },
  {
    id: 'deleuze_guattari',
    title: 'Gilles Deleuze / Félix Guattari',
    stats: { intelligence: 9, strength: 4, agility: 8, vitality: 5, energy: 9 },
  },
  {
    id: 'kierkegaard',
    title: 'Søren Kierkegaard',
    stats: { intelligence: 8, strength: 4, agility: 8, vitality: 5, energy: 9 },
  },
  {
    id: 'stirner',
    title: 'Max Stirner',
    stats: { intelligence: 8, strength: 5, agility: 8, vitality: 5, energy: 8 },
  },
];

export function getPromptCharacterData(id: string): PromptCharacterData | undefined {
  return PROMPT_CHARACTER_DATA.find((character) => character.id === id);
}

export function buildCharacterStats(id: string, health = 100): FighterStats {
  const character = getPromptCharacterData(id);
  if (!character) throw new Error(`Missing prompt character metadata for ${id}`);

  const defense = character.stats.defense ?? character.stats.vitality;
  return {
    health,
    maxHealth: health,
    strength: character.stats.strength,
    defense,
    intelligence: character.stats.intelligence,
    agility: character.stats.agility,
    vitality: character.stats.vitality,
    energy: character.stats.energy,
  };
}

export function buildCharacterAbilities(id: string): string[] {
  return getPromptCharacterData(id)?.abilities ?? [];
}
