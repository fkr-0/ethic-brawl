import type { CharacterId } from './character-data';

/**
 * The curated roster shipped by the 1.1 release.
 *
 * The five additional legacy fighters remain addressable through CHARACTERS so
 * old saves and direct developer scenarios keep working, but they are not
 * exposed in the polished selection flow until their art direction returns to
 * the active roster.
 */
export const RELEASE_ROSTER_IDS = [
  'camus',
  'machiavelli',
  'diogenes',
  'leibniz',
  'foucault',
  'deleuze_guattari',
  'marx',
  'bakunin',
  'schmitt',
  'socrates',
  'kant',
  'kierkegaard',
  'stirner',
] as const satisfies readonly CharacterId[];

export type ReleaseRosterId = (typeof RELEASE_ROSTER_IDS)[number];

export function getReleaseRosterIds(): CharacterId[] {
  return [...RELEASE_ROSTER_IDS];
}
