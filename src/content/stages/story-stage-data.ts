/**
 * Story mode stage catalogue.
 */

export type StoryStageId =
  | 'babylon'
  | 'babylon_postapocalypse'
  | 'sprawl'
  | 'arcology_entrance'
  | 'arcology_labs'
  | 'arcology_penthouse';

export type EnemyArchetypeId =
  | 'air_drone'
  | 'ground_drone'
  | 'thug_1'
  | 'thug_2'
  | 'thug_3'
  | 'massive_thug'
  | 'ninja'
  | 'ninja_mob'
  | 'citizen_1'
  | 'citizen_riot'
  | 'zombified_citizen'
  | 'postapocalypse_heavy_evolutionary_selection_citizen';

export type StageHazardId =
  | 'falling_brick'
  | 'neon_short'
  | 'riot_surge'
  | 'drone_crossfire'
  | 'lab_decontamination_burst'
  | 'penthouse_laser_grid';

export interface StoryStageWave {
  wave: number;
  enemies: readonly EnemyArchetypeId[];
  note: string;
}

import type { StageSocialDynamics } from '@/game/social/social-arousal';

export interface StoryStageDefinition {
  id: StoryStageId;
  name: string;
  act: number;
  order: number;
  tagline: string;
  narrative: string;
  visualDirection: string;
  musicDirection: string;
  hazards: readonly StageHazardId[];
  waves: readonly StoryStageWave[];
  rewardItemIds: readonly string[];
  unlocksAfterClear: readonly StoryStageId[];
  socialDynamics: StageSocialDynamics;
}

const COMMON_SOCIAL_ACTIONS = [
  {
    action: 'protect_citizen',
    antiBossDelta: 7,
    antiPlayerDelta: -9,
    volatilityDelta: 2,
    ideologyShift: { authority: -3, insurgency: 4 },
  },
  {
    action: 'hurt_citizen',
    antiBossDelta: -4,
    antiPlayerDelta: 18,
    volatilityDelta: 10,
    ideologyShift: { authority: 5, nationalism: 3 },
  },
  {
    action: 'destroy_security_drone',
    antiBossDelta: 10,
    antiPlayerDelta: -4,
    volatilityDelta: 6,
    ideologyShift: { authority: -4, insurgency: 6 },
  },
  {
    action: 'destroy_public_shelter',
    antiBossDelta: -8,
    antiPlayerDelta: 16,
    volatilityDelta: 9,
    ideologyShift: { collectivism: -5, authority: 4 },
  },
  {
    action: 'spare_enemy',
    antiBossDelta: 2,
    antiPlayerDelta: -5,
    volatilityDelta: -3,
    ideologyShift: { insurgency: -2 },
  },
  {
    action: 'execute_enemy',
    antiBossDelta: 5,
    antiPlayerDelta: 7,
    volatilityDelta: 8,
    ideologyShift: { authority: 4, insurgency: 5 },
  },
  {
    action: 'loot_shop',
    antiBossDelta: -2,
    antiPlayerDelta: 12,
    volatilityDelta: 6,
    ideologyShift: { collectivism: -3, insurgency: 3 },
  },
  {
    action: 'share_items',
    antiBossDelta: 6,
    antiPlayerDelta: -10,
    volatilityDelta: 1,
    ideologyShift: { collectivism: 5, authority: -2 },
  },
  {
    action: 'deface_boss_symbol',
    antiBossDelta: 12,
    antiPlayerDelta: 1,
    volatilityDelta: 8,
    ideologyShift: { authority: -5, insurgency: 8 },
  },
  {
    action: 'collateral_fire',
    antiBossDelta: -6,
    antiPlayerDelta: 20,
    volatilityDelta: 12,
    ideologyShift: { nationalism: 6, authority: 6 },
  },
] as const;

export const STORY_STAGES: Record<StoryStageId, StoryStageDefinition> = {
  babylon: {
    id: 'babylon',
    name: 'Babylon',
    act: 1,
    order: 1,
    tagline: 'A mythic city where debt, law, and neon commerce learned to punch.',
    narrative:
      'The philosophers enter a restored Babylon simulation used by the regime to train obedience through spectacle. Merchant-priests, drones, and paid thugs defend the first archive of civic lies.',
    visualDirection:
      'Bronze ziggurats, cyan market holograms, wet stone roads, cuneiform billboards, torchlight mixed with magenta ad screens.',
    musicDirection:
      'Slow industrial percussion, hand drums, distant market chants, low synth bass.',
    hazards: ['falling_brick', 'neon_short'],
    waves: [
      {
        wave: 1,
        enemies: ['citizen_1', 'thug_1', 'ground_drone'],
        note: 'Teach crowd spacing and drone interrupts.',
      },
      { wave: 2, enemies: ['thug_1', 'thug_2', 'air_drone'], note: 'Introduce vertical pressure.' },
      {
        wave: 3,
        enemies: ['thug_3', 'massive_thug'],
        note: 'Mini-boss gatekeeper at the ziggurat stairs.',
      },
    ],
    rewardItemIds: ['life_potion_small', 'rusted_short_sword', 'book_stoic_body'],
    unlocksAfterClear: ['babylon_postapocalypse'],
    socialDynamics: {
      baseline: {
        antiBoss: 34,
        antiPlayer: 18,
        volatility: 28,
        ideology: { collectivism: 12, authority: -18, nationalism: 18, insurgency: 35 },
      },
      bossGate: {
        minimumAntiBoss: 45,
        maximumAntiPlayer: 68,
        infiniteWaveEnemyIds: ['citizen_riot', 'thug_1'],
        note: 'The ziggurat boss appears once the market crowd believes rebellion is safer than obedience.',
      },
      characterAffinities: [
        {
          character: 'camus',
          acceptance: 16,
          actionMultiplier: 1.18,
          notes: 'Absurd revolt reads as plausible anti-empire courage.',
        },
        {
          character: 'diogenes',
          acceptance: 22,
          actionMultiplier: 1.25,
          notes: 'Cynic poverty plays well in the market crowd.',
        },
        {
          character: 'machiavelli',
          acceptance: -8,
          actionMultiplier: 1.05,
          notes: 'Courtiers suspect another palace operator.',
        },
        {
          character: 'leibniz',
          acceptance: 2,
          actionMultiplier: 0.92,
          notes: 'Too polished, but useful against machine order.',
        },
      ],
      actionEffects: COMMON_SOCIAL_ACTIONS,
      speech: {
        antiPlayer: [
          'Foreign blade!',
          'Stop breaking our stalls!',
          'You are another tax collector!',
        ],
        antiBoss: [
          'Down with the archive-priests!',
          'The ziggurat eats our children!',
          'No more bronze laws!',
        ],
        chaotic: ['Choose a side!', 'The street has not decided!', 'More guards are coming!'],
      },
      designNotes: [
        'Moving market windows slide by as the brawl advances.',
        'Low acceptance means stones from balconies; high acceptance means bread, potions, and enemy trip-lines.',
      ],
    },
  },
  babylon_postapocalypse: {
    id: 'babylon_postapocalypse',
    name: 'Babylon: Postapocalypse',
    act: 1,
    order: 2,
    tagline: 'Same empire, no paint left on the propaganda.',
    narrative:
      'The simulation collapses into the future it tried to hide. The marketplace is ash, the ziggurat is cracked, and survivors enforce brutal selection rules.',
    visualDirection:
      'Sandstorms, broken cuneiform LEDs, half-buried statues, rusted drone husks, orange sky, scavenger barricades.',
    musicDirection: 'Distorted drums, broken radio choirs, wind noise, metallic impacts.',
    hazards: ['falling_brick', 'riot_surge'],
    waves: [
      {
        wave: 1,
        enemies: ['zombified_citizen', 'citizen_riot'],
        note: 'Slow pressure and panic movement.',
      },
      {
        wave: 2,
        enemies: ['postapocalypse_heavy_evolutionary_selection_citizen', 'thug_2'],
        note: 'Heavy survivor anchors mixed skirmishers.',
      },
      {
        wave: 3,
        enemies: ['massive_thug', 'air_drone', 'ground_drone'],
        note: 'Collapsed security system returns as boss support.',
      },
    ],
    rewardItemIds: ['life_potion_large', 'civic_mace', 'temp_boost_armor_gel'],
    unlocksAfterClear: ['sprawl'],
    socialDynamics: {
      baseline: {
        antiBoss: 52,
        antiPlayer: 26,
        volatility: 58,
        ideology: { collectivism: -8, authority: 12, nationalism: 42, insurgency: 72 },
      },
      bossGate: {
        minimumAntiBoss: 62,
        maximumAntiPlayer: 72,
        infiniteWaveEnemyIds: ['zombified_citizen', 'citizen_riot'],
        note: 'Ruined Babylon loops survival waves until the crowd either sees the player as useful or turns fully predatory.',
      },
      characterAffinities: [
        {
          character: 'camus',
          acceptance: 8,
          actionMultiplier: 1.08,
          notes: 'Revolt still resonates, but survivalists distrust sentiment.',
        },
        {
          character: 'diogenes',
          acceptance: 18,
          actionMultiplier: 1.22,
          notes: 'Ascetic survival has credibility here.',
        },
        {
          character: 'machiavelli',
          acceptance: 4,
          actionMultiplier: 1.18,
          notes: 'Harsh pragmatism makes sense in the ruins.',
        },
        {
          character: 'leibniz',
          acceptance: -12,
          actionMultiplier: 0.85,
          notes: 'Optimism sounds like old regime propaganda.',
        },
      ],
      actionEffects: COMMON_SOCIAL_ACTIONS,
      speech: {
        antiPlayer: ['Meat for the dust!', 'Outsider brought the drones!', 'Take their water!'],
        antiBoss: [
          'The bunker lord hoards the filters!',
          'Break the sealed stores!',
          'No more selection pits!',
        ],
        chaotic: ['Storm wave!', 'Hide or hunt!', 'The weak get counted!'],
      },
      designNotes: [
        'Background caravans and dust walls move constantly; windows become bunker slits.',
        'Molotov-equivalent is fuel bombs from ruins; allied support is rare but powerful.',
      ],
    },
  },
  sprawl: {
    id: 'sprawl',
    name: 'The Sprawl',
    act: 2,
    order: 3,
    tagline: 'Endless streets, endless ads, no public square.',
    narrative:
      'The crew reaches the city perimeter: crowded megablocks, black markets, courier gangs, and civilians one bad broadcast away from riot.',
    visualDirection:
      'Stacked apartments, noodle signs, cable webs, rain-slick alleys, polluted canal reflections, corporate checkpoint lights.',
    musicDirection: 'Fast breakbeat, sub bass, sirens used as rhythm, chopped voice samples.',
    hazards: ['neon_short', 'riot_surge', 'drone_crossfire'],
    waves: [
      { wave: 1, enemies: ['thug_1', 'thug_2', 'citizen_1'], note: 'Street brawl baseline.' },
      {
        wave: 2,
        enemies: ['citizen_riot', 'ninja', 'ground_drone'],
        note: 'Fast flanker appears during crowd surge.',
      },
      {
        wave: 3,
        enemies: ['ninja_mob', 'thug_3', 'air_drone'],
        note: 'Mob rush with aerial zoning.',
      },
    ],
    rewardItemIds: ['energy_potion_large', 'neon_duelist_sword', 'book_dialectic_reflexes'],
    unlocksAfterClear: ['arcology_entrance'],
    socialDynamics: {
      baseline: {
        antiBoss: 46,
        antiPlayer: 22,
        volatility: 48,
        ideology: { collectivism: 38, authority: -46, nationalism: 12, insurgency: 66 },
      },
      bossGate: {
        minimumAntiBoss: 58,
        maximumAntiPlayer: 65,
        infiniteWaveEnemyIds: ['citizen_riot', 'ninja_mob', 'ground_drone'],
        note: 'The sprawl can become an endless riot corridor until enough anti-corporate demand coheres.',
      },
      characterAffinities: [
        {
          character: 'camus',
          acceptance: 24,
          actionMultiplier: 1.32,
          notes:
            'Camus is warmly read by anti-authoritarian insurgents in a 1789-like street mood.',
        },
        {
          character: 'diogenes',
          acceptance: 20,
          actionMultiplier: 1.24,
          notes: 'Street cynicism looks authentic.',
        },
        {
          character: 'machiavelli',
          acceptance: -18,
          actionMultiplier: 1.1,
          notes: 'A strategist is suspected of hijacking the uprising.',
        },
        {
          character: 'leibniz',
          acceptance: -4,
          actionMultiplier: 0.95,
          notes: 'Technocratic optimism is tolerated only if he protects civilians.',
        },
      ],
      actionEffects: COMMON_SOCIAL_ACTIONS,
      speech: {
        antiPlayer: ['No kings, no heroes!', 'You fight like a cop!', 'Leave our block!'],
        antiBoss: ['Rent lord out!', 'The tower bleeds us!', 'Barricades up!'],
        chaotic: ['The avenue keeps moving!', 'Barricade left!', 'Windows are watching!'],
      },
      designNotes: [
        'Moving tenement facades create speech-bubble lanes and window projectile lanes.',
        'Acceptance swings sharply: rescue civilians and get drops; collateral damage summons ambush cells.',
      ],
    },
  },
  arcology_entrance: {
    id: 'arcology_entrance',
    name: 'Arcology Entrance',
    act: 3,
    order: 4,
    tagline: 'The building smiles while its security systems count your bones.',
    narrative:
      'A gated vertical city rises above the sprawl. The lobby sells virtue while private security deletes dissent from the marble floor.',
    visualDirection:
      'White marble, gold-black corporate sigils, turnstiles, biometric gates, calm plants beside violent turrets.',
    musicDirection: 'Clean corporate pads interrupted by harsh alarm stabs and precise kick drums.',
    hazards: ['drone_crossfire', 'penthouse_laser_grid'],
    waves: [
      {
        wave: 1,
        enemies: ['ground_drone', 'air_drone', 'thug_2'],
        note: 'Security tutorial wave.',
      },
      {
        wave: 2,
        enemies: ['thug_3', 'massive_thug'],
        note: 'Lobby enforcers guard elevator access.',
      },
      {
        wave: 3,
        enemies: ['ninja', 'ninja_mob', 'air_drone'],
        note: 'Executive assassin team drops from upper balcony.',
      },
    ],
    rewardItemIds: ['energy_potion_small', 'book_arcology_rhetoric', 'temp_boost_focus_lens'],
    unlocksAfterClear: ['arcology_labs'],
    socialDynamics: {
      baseline: {
        antiBoss: 30,
        antiPlayer: 35,
        volatility: 32,
        ideology: { collectivism: -20, authority: 38, nationalism: 58, insurgency: 34 },
      },
      bossGate: {
        minimumAntiBoss: 48,
        maximumAntiPlayer: 74,
        infiniteWaveEnemyIds: ['thug_2', 'ground_drone'],
        note: 'Lobby citizens may initially prefer order; the player must expose corporate force to shift demand.',
      },
      characterAffinities: [
        {
          character: 'camus',
          acceptance: -6,
          actionMultiplier: 1.02,
          notes: 'Moral ambiguity unnerves security-minded residents.',
        },
        {
          character: 'diogenes',
          acceptance: -22,
          actionMultiplier: 1.12,
          notes: 'Lobby elites read cynicism as vagrancy and threat.',
        },
        {
          character: 'machiavelli',
          acceptance: 12,
          actionMultiplier: 1.18,
          notes: 'Power literacy is legible in authoritarian spaces.',
        },
        {
          character: 'leibniz',
          acceptance: 14,
          actionMultiplier: 1.05,
          notes: 'Formal reason gets provisional trust near the gates.',
        },
      ],
      actionEffects: COMMON_SOCIAL_ACTIONS,
      speech: {
        antiPlayer: ['Security! Remove them!', 'You are lowering property values!', 'Order first!'],
        antiBoss: ['The board lied!', 'Open the elevators!', 'No more biometric tribute!'],
        chaotic: ['Lockdown cycling!', 'The lobby is splitting!', 'Choose order or uprising!'],
      },
      designNotes: [
        'Reception balconies move upward behind glass; comments feel like elevator callouts.',
        'Fascist or boss-loyalist color is plausible if the player harms civilians or loots visibly.',
      ],
    },
  },
  arcology_labs: {
    id: 'arcology_labs',
    name: 'Arcology Labs',
    act: 3,
    order: 5,
    tagline: 'Where ethics becomes a firmware setting.',
    narrative:
      'The lower truth is mechanical: riot behavior, citizen obedience, and philosopher countermeasures are all tested in glass rooms.',
    visualDirection:
      'Cold blue laboratories, specimen tanks, robotic arms, operating lights, red quarantine doors, reflective floors.',
    musicDirection: 'Minimal techno, heart monitors, glitch arpeggios, compressed lab ambience.',
    hazards: ['lab_decontamination_burst', 'drone_crossfire'],
    waves: [
      {
        wave: 1,
        enemies: ['ground_drone', 'air_drone', 'zombified_citizen'],
        note: 'Mixed control and failed experiment.',
      },
      {
        wave: 2,
        enemies: ['postapocalypse_heavy_evolutionary_selection_citizen', 'citizen_riot'],
        note: 'Human experiments escape containment.',
      },
      {
        wave: 3,
        enemies: ['ninja_mob', 'massive_thug', 'air_drone'],
        note: 'Containment team attempts cleanup.',
      },
    ],
    rewardItemIds: ['book_machine_ethics', 'riot_breaker_mace', 'temp_boost_overclock_scroll'],
    unlocksAfterClear: ['arcology_penthouse'],
    socialDynamics: {
      baseline: {
        antiBoss: 57,
        antiPlayer: 28,
        volatility: 54,
        ideology: { collectivism: 62, authority: 44, nationalism: 18, insurgency: 58 },
      },
      bossGate: {
        minimumAntiBoss: 70,
        maximumAntiPlayer: 70,
        infiniteWaveEnemyIds: ['zombified_citizen', 'ground_drone', 'air_drone'],
        note: 'Lab escapees need a clear revolutionary demand before they risk opening the penthouse route.',
      },
      characterAffinities: [
        {
          character: 'camus',
          acceptance: 10,
          actionMultiplier: 1.08,
          notes: 'Solidarity matters, but lab survivors want concrete liberation.',
        },
        {
          character: 'diogenes',
          acceptance: 5,
          actionMultiplier: 1.02,
          notes: 'Anti-institutional posture helps, but not enough for organized cells.',
        },
        {
          character: 'machiavelli',
          acceptance: -10,
          actionMultiplier: 1.15,
          notes: 'Manipulation fears multiply every violent action.',
        },
        {
          character: 'leibniz',
          acceptance: 18,
          actionMultiplier: 1.2,
          notes: 'A rationalist can be accepted if he breaks the machine ethic from inside.',
        },
      ],
      actionEffects: COMMON_SOCIAL_ACTIONS,
      speech: {
        antiPlayer: [
          'Do not experiment on us again!',
          'You wear the same clean hands!',
          'Contain the intruder!',
        ],
        antiBoss: ['Open every tank!', 'No party of technicians!', 'The protocol is the prison!'],
        chaotic: ['Decon wave!', 'The cells disagree!', 'Who commands after the glass breaks?'],
      },
      designNotes: [
        'Bolshevist coloration appears when anti-boss demand is high but authoritarian trust remains high.',
        'Council-communist coloration appears when lab workers organize without command hierarchy.',
      ],
    },
  },
  arcology_penthouse: {
    id: 'arcology_penthouse',
    name: 'Arcology Penthouse',
    act: 4,
    order: 6,
    tagline: 'Above the clouds, the final argument owns the weather.',
    narrative:
      'The tower top is a private sky-temple where board members, philosopher-avatars, and automated doctrine engines decide what the city is allowed to believe.',
    visualDirection:
      'Glass floor over clouds, storm-lit skyline, gold server altars, executive garden, holographic throne table.',
    musicDirection: 'Grand synth choir, orchestral hits, thunder, precise machine percussion.',
    hazards: ['penthouse_laser_grid', 'drone_crossfire', 'lab_decontamination_burst'],
    waves: [
      { wave: 1, enemies: ['ninja', 'air_drone', 'ground_drone'], note: 'Quiet elite opener.' },
      {
        wave: 2,
        enemies: ['massive_thug', 'ninja_mob', 'thug_3'],
        note: 'Human security burns all remaining budget.',
      },
      {
        wave: 3,
        enemies: [
          'postapocalypse_heavy_evolutionary_selection_citizen',
          'zombified_citizen',
          'air_drone',
        ],
        note: 'The tower deploys every ideology it manufactured.',
      },
    ],
    rewardItemIds: ['life_potion_large', 'energy_potion_large', 'temp_boost_overclock_scroll'],
    unlocksAfterClear: [],
    socialDynamics: {
      baseline: {
        antiBoss: 68,
        antiPlayer: 32,
        volatility: 62,
        ideology: { collectivism: 34, authority: -22, nationalism: 10, insurgency: 64 },
      },
      bossGate: {
        minimumAntiBoss: 75,
        maximumAntiPlayer: 78,
        infiniteWaveEnemyIds: ['ninja', 'air_drone', 'citizen_riot'],
        note: 'The penthouse can remain infinite until the city below agrees whether this is liberation or another coup.',
      },
      characterAffinities: [
        {
          character: 'camus',
          acceptance: 18,
          actionMultiplier: 1.16,
          notes: 'Final revolt symbolism favors Camus if collateral damage stays low.',
        },
        {
          character: 'diogenes',
          acceptance: 8,
          actionMultiplier: 1.08,
          notes: 'His anti-luxury posture plays well against the sky temple.',
        },
        {
          character: 'machiavelli',
          acceptance: -24,
          actionMultiplier: 1.28,
          notes: 'Every tactical move risks being read as a new princely coup.',
        },
        {
          character: 'leibniz',
          acceptance: 6,
          actionMultiplier: 1.0,
          notes: 'The crowd accepts formal reason only after visible anti-boss proof.',
        },
      ],
      actionEffects: COMMON_SOCIAL_ACTIONS,
      speech: {
        antiPlayer: [
          'Another ruler in the elevator!',
          'Do not sell the clouds twice!',
          'Throw them back down!',
        ],
        antiBoss: ['Storm the table!', 'Cut the weather engine!', 'No gods above rent!'],
        chaotic: [
          'The city has not voted!',
          'The tower keeps rising!',
          'More guards from the garden!',
        ],
      },
      designNotes: [
        'Windows become drone screens, executive balconies, and lower-city broadcast overlays.',
        'Boss appearance can be beloved strongman, isolated tyrant, guarded commander, or besieged overseer.',
      ],
    },
  },
};

export const STORY_STAGE_ORDER: readonly StoryStageId[] = [
  'babylon',
  'babylon_postapocalypse',
  'sprawl',
  'arcology_entrance',
  'arcology_labs',
  'arcology_penthouse',
];

export function getStoryStage(stageId: StoryStageId): StoryStageDefinition {
  return STORY_STAGES[stageId];
}

export function getStoryStageList(): StoryStageDefinition[] {
  return STORY_STAGE_ORDER.map((stageId) => STORY_STAGES[stageId]);
}
