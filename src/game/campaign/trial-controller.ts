/**
 * Trial controller for post-fight philosophical challenges
 */

import type { StageTheme } from '../campaign/campaign-controller';

/**
 * Trial types
 */
export type TrialType = 'moral_dilemma' | 'logic_puzzle' | 'accusation';

/**
 * Trial definition
 */
export interface TrialDefinition {
  id: string;
  type: TrialType;
  prompt: string;
  context: string;
  options: TrialOption[];
  correctOption?: string;
  keywords?: string[];
  stanceKeywords?: {
    idealist: string[];
    pragmatist: string[];
    cynic: string[];
  };
  points: {
    correct: number;
    partial: number;
    creative: number;
  };
}

/**
 * Trial option
 */
export interface TrialOption {
  id: string;
  text: string;
  stance: 'idealist' | 'pragmatist' | 'cynic';
  consequence: {
    type: 'buff' | 'debuff' | 'xp_bonus' | 'xp_penalty' | 'unlock';
    value: number;
    description: string;
  };
}

/**
 * Moral dilemmas by theme
 */
const MORAL_DILEMMAS: Record<StageTheme, TrialDefinition[]> = {
  neon_streets: [
    {
      id: 'dilemma_freedom',
      type: 'moral_dilemma',
      prompt:
        'A citizen asks whether they should rebel against an unjust system, knowing rebellion may harm innocent bystanders.',
      context:
        'The streets flicker with neon promises of freedom, but every revolution has casualties.',
      options: [
        {
          id: 'rebel',
          text: 'Rebellion is always justified against tyranny',
          stance: 'idealist',
          consequence: { type: 'buff', value: 5, description: 'Revolutionary Zeal' },
        },
        {
          id: 'calculate',
          text: 'Consider the consequences before acting',
          stance: 'pragmatist',
          consequence: { type: 'xp_bonus', value: 25, description: 'Calculated Wisdom' },
        },
        {
          id: 'peace',
          text: 'Violence begets violence - seek peaceful change',
          stance: 'idealist',
          consequence: { type: 'buff', value: 3, description: 'Peaceful Resolve' },
        },
        {
          id: 'choose',
          text: 'Each must choose their own path',
          stance: 'cynic',
          consequence: { type: 'debuff', value: 2, description: 'Existential Weight' },
        },
      ],
      points: { correct: 50, partial: 30, creative: 40 },
    },
  ],
  data_cathedral: [
    {
      id: 'dilemma_algorithm',
      type: 'moral_dilemma',
      prompt:
        'An algorithm determines who receives medical treatment. It works perfectly but ignores individual circumstances.',
      context: "The Cathedral's calculations maximize total welfare, but at what cost to humanity?",
      options: [
        {
          id: 'trust',
          text: 'The algorithm serves the greater good',
          stance: 'pragmatist',
          consequence: { type: 'xp_bonus', value: 20, description: 'Systematic Thinking' },
        },
        {
          id: 'reject',
          text: 'Every individual deserves personal consideration',
          stance: 'idealist',
          consequence: { type: 'buff', value: 4, description: 'Human Dignity' },
        },
        {
          id: 'improve',
          text: 'The algorithm can be refined to include more factors',
          stance: 'pragmatist',
          consequence: { type: 'xp_bonus', value: 30, description: 'Optimization Mind' },
        },
        {
          id: 'burn',
          text: "Burn it all down - some things shouldn't be calculated",
          stance: 'cynic',
          consequence: { type: 'buff', value: 6, description: 'Radical Freedom' },
        },
      ],
      points: { correct: 50, partial: 30, creative: 40 },
    },
  ],
  algorithmic_arena: [
    {
      id: 'dilemma_spectacle',
      type: 'moral_dilemma',
      prompt:
        "Your victory will inspire millions, but a loss would save your opponent's family from debt slavery.",
      context: 'The Arena demands entertainment, but real lives hang in the balance.',
      options: [
        {
          id: 'win',
          text: 'Victory is the only answer - their debt is not your responsibility',
          stance: 'cynic',
          consequence: { type: 'buff', value: 4, description: 'Victorious Will' },
        },
        {
          id: 'lose',
          text: 'Lose intentionally to save them',
          stance: 'idealist',
          consequence: { type: 'xp_bonus', value: 50, description: 'Selfless Champion' },
        },
        {
          id: 'share',
          text: 'Win and share your prize with them',
          stance: 'pragmatist',
          consequence: { type: 'xp_bonus', value: 35, description: 'Noble Victory' },
        },
        {
          id: 'demand',
          text: 'Refuse to fight until the system changes',
          stance: 'idealist',
          consequence: { type: 'buff', value: 8, description: 'Revolutionary Spirit' },
        },
      ],
      points: { correct: 50, partial: 30, creative: 40 },
    },
  ],
  philosophers_throne: [
    {
      id: 'dilemma_throne',
      type: 'moral_dilemma',
      prompt:
        "The Philosopher's Throne grants absolute truth, but sitting upon it destroys your capacity for wonder.",
      context: 'The ultimate question: is knowledge worth the death of mystery?',
      options: [
        {
          id: 'sit',
          text: 'Sit upon the throne - truth is worth any price',
          stance: 'pragmatist',
          consequence: { type: 'buff', value: 10, description: 'Enlightened Being' },
        },
        {
          id: 'refuse',
          text: 'Refuse - wonder is the essence of philosophy',
          stance: 'idealist',
          consequence: { type: 'xp_bonus', value: 60, description: 'Wisdom Preserved' },
        },
        {
          id: 'destroy',
          text: 'Destroy the throne - no one should have such power',
          stance: 'cynic',
          consequence: { type: 'unlock', value: 0, description: 'Thronebreaker' },
        },
        {
          id: 'question',
          text: 'Question whether the throne truly offers truth at all',
          stance: 'cynic',
          consequence: { type: 'xp_bonus', value: 45, description: 'Socratic Doubt' },
        },
      ],
      points: { correct: 60, partial: 35, creative: 50 },
    },
  ],
};

/**
 * Logic puzzles by theme
 */
const LOGIC_PUZZLES: Record<StageTheme, TrialDefinition[]> = {
  neon_streets: [
    {
      id: 'puzzle_syllogism',
      type: 'logic_puzzle',
      prompt: 'All rebels are free. Some free people are unhappy. Which conclusion is valid?',
      context: 'The logic of the streets demands precision.',
      options: [
        {
          id: 'all',
          text: 'All rebels are unhappy',
          stance: 'cynic',
          consequence: { type: 'xp_penalty', value: 10, description: 'Logical Error' },
        },
        {
          id: 'some',
          text: 'Some rebels may be unhappy',
          stance: 'pragmatist',
          consequence: { type: 'xp_bonus', value: 40, description: 'Correct Logic' },
        },
        {
          id: 'none',
          text: 'No rebels are unhappy',
          stance: 'idealist',
          consequence: { type: 'xp_penalty', value: 10, description: 'Logical Error' },
        },
        {
          id: 'unknown',
          text: 'Cannot be determined from premises',
          stance: 'pragmatist',
          consequence: { type: 'xp_bonus', value: 40, description: 'Correct Logic' },
        },
      ],
      correctOption: 'some',
      points: { correct: 50, partial: 25, creative: 20 },
    },
  ],
  data_cathedral: [
    {
      id: 'puzzle_paradox',
      type: 'logic_puzzle',
      prompt: '"This statement is false." Is the statement true or false?',
      context: "The Cathedral's processors overheat on such questions.",
      options: [
        {
          id: 'true',
          text: 'True',
          stance: 'idealist',
          consequence: { type: 'xp_penalty', value: 15, description: 'Paradox Trap' },
        },
        {
          id: 'false',
          text: 'False',
          stance: 'cynic',
          consequence: { type: 'xp_penalty', value: 15, description: 'Paradox Trap' },
        },
        {
          id: 'neither',
          text: "Neither - it's undecidable",
          stance: 'pragmatist',
          consequence: { type: 'xp_bonus', value: 50, description: "Gödel's Student" },
        },
        {
          id: 'meaningless',
          text: 'The question is meaningless',
          stance: 'cynic',
          consequence: { type: 'xp_bonus', value: 40, description: 'Wittgenstein Would Approve' },
        },
      ],
      correctOption: 'neither',
      points: { correct: 60, partial: 30, creative: 35 },
    },
  ],
  algorithmic_arena: [
    {
      id: 'puzzle_utility',
      type: 'logic_puzzle',
      prompt:
        'If utility is defined as happiness × people, which creates more utility: 100 people with 10 happiness each, or 10 people with 200 happiness each?',
      context: "The Arena's calculators process moral mathematics.",
      options: [
        {
          id: 'option_a',
          text: 'Option A (1000 total utility)',
          stance: 'idealist',
          consequence: { type: 'xp_penalty', value: 5, description: 'Math Error' },
        },
        {
          id: 'option_b',
          text: 'Option B (2000 total utility)',
          stance: 'pragmatist',
          consequence: { type: 'xp_bonus', value: 45, description: 'Utilitarian Correctness' },
        },
        {
          id: 'cannot',
          text: 'Happiness cannot be quantified this way',
          stance: 'cynic',
          consequence: { type: 'xp_bonus', value: 55, description: 'Anti-Utilitarian Insight' },
        },
        {
          id: 'reject',
          text: 'The premise is flawed',
          stance: 'idealist',
          consequence: { type: 'xp_bonus', value: 50, description: 'Deontological Critique' },
        },
      ],
      correctOption: 'option_b',
      points: { correct: 45, partial: 35, creative: 50 },
    },
  ],
  philosophers_throne: [
    {
      id: 'puzzle_cogito',
      type: 'logic_puzzle',
      prompt: '"I think, therefore I am." What follows if thinking ceases?',
      context: 'The ultimate philosophical question awaits.',
      options: [
        {
          id: 'cease',
          text: 'I cease to exist',
          stance: 'idealist',
          consequence: { type: 'xp_penalty', value: 10, description: 'Non Sequitur' },
        },
        {
          id: 'still',
          text: 'I may still exist, but cannot prove it',
          stance: 'pragmatist',
          consequence: { type: 'xp_bonus', value: 55, description: 'Critical Thinking' },
        },
        {
          id: 'question',
          text: 'The "I" was already questionable',
          stance: 'cynic',
          consequence: { type: 'xp_bonus', value: 60, description: 'Humean Skepticism' },
        },
        {
          id: 'never',
          text: 'The self never truly existed',
          stance: 'cynic',
          consequence: { type: 'xp_bonus', value: 50, description: 'Buddhist Insight' },
        },
      ],
      correctOption: 'still',
      points: { correct: 55, partial: 30, creative: 45 },
    },
  ],
};

/**
 * Accusations by theme
 */
const ACCUSATIONS: Record<StageTheme, TrialDefinition[]> = {
  neon_streets: [
    {
      id: 'accusation_hypocrisy',
      type: 'accusation',
      prompt:
        'You are accused of HYPOCRISY: You preach freedom while seeking to impose your philosophy on others through combat.',
      context: 'A troublesome disciple emerges from the shadows to challenge your authenticity.',
      options: [
        {
          id: 'deny',
          text: 'I deny this accusation - my actions are consistent',
          stance: 'idealist',
          consequence: { type: 'xp_bonus', value: 20, description: 'Self-Defense' },
        },
        {
          id: 'accept',
          text: 'I accept the paradox - hypocrisy is the human condition',
          stance: 'cynic',
          consequence: { type: 'xp_bonus', value: 40, description: 'Authentic Hypocrisy' },
        },
        {
          id: 'reframe',
          text: 'Combat is dialogue, not imposition',
          stance: 'pragmatist',
          consequence: { type: 'xp_bonus', value: 35, description: 'Philosophical Reframe' },
        },
        {
          id: 'challenge',
          text: 'What hypocrisy do YOU carry, accuser?',
          stance: 'cynic',
          consequence: { type: 'buff', value: 5, description: 'Socratic Counter' },
        },
      ],
      points: { correct: 40, partial: 25, creative: 45 },
    },
  ],
  data_cathedral: [
    {
      id: 'accusation_dogma',
      type: 'accusation',
      prompt:
        "You are accused of DOGMATISM: You claim to seek truth while dismissing the Cathedral's algorithmic wisdom.",
      context: 'The High Priests of Data demand accountability for your skepticism.',
      options: [
        {
          id: 'submit',
          text: "I submit to the algorithm's superior processing",
          stance: 'pragmatist',
          consequence: { type: 'xp_bonus', value: 15, description: 'Submission' },
        },
        {
          id: 'challenge_def',
          text: 'Truth is not mere data processing',
          stance: 'idealist',
          consequence: { type: 'xp_bonus', value: 45, description: 'Philosophical Defense' },
        },
        {
          id: 'accept_label',
          text: 'If questioning is dogmatism, then I am a dogmatist',
          stance: 'cynic',
          consequence: { type: 'buff', value: 4, description: 'Proud Skeptic' },
        },
        {
          id: 'propose',
          text: 'Let us test whose method finds better truth',
          stance: 'pragmatist',
          consequence: { type: 'xp_bonus', value: 40, description: 'Empirical Challenge' },
        },
      ],
      points: { correct: 40, partial: 25, creative: 45 },
    },
  ],
  algorithmic_arena: [
    {
      id: 'accusation_violence',
      type: 'accusation',
      prompt: 'You are accused of BARBARISM: A philosopher should persuade with words, not fists.',
      context: "The Arena's philosophers question your methods.",
      options: [
        {
          id: 'apologize',
          text: 'You are right - I should find another way',
          stance: 'idealist',
          consequence: { type: 'xp_penalty', value: 10, description: 'Capitulation' },
        },
        {
          id: 'defend',
          text: 'Ideas have always been worth fighting for',
          stance: 'idealist',
          consequence: { type: 'buff', value: 5, description: 'Philosopher-Warrior' },
        },
        {
          id: 'question_dichotomy',
          text: 'The distinction between word and fist is false',
          stance: 'cynic',
          consequence: { type: 'xp_bonus', value: 50, description: 'Deconstructive' },
        },
        {
          id: 'historical',
          text: 'History shows philosophers have always dueled',
          stance: 'pragmatist',
          consequence: { type: 'xp_bonus', value: 35, description: 'Historical Defense' },
        },
      ],
      points: { correct: 40, partial: 25, creative: 45 },
    },
  ],
  philosophers_throne: [
    {
      id: 'accusation_unworthy',
      type: 'accusation',
      prompt:
        'You are accused of UNWORTHINESS: A true philosopher would reject the Throne entirely.',
      context: 'The Guardian of the Throne questions your very nature.',
      options: [
        {
          id: 'agree',
          text: 'You are right - I withdraw my claim',
          stance: 'idealist',
          consequence: { type: 'xp_bonus', value: 60, description: 'True Wisdom' },
        },
        {
          id: 'reframe_throne',
          text: 'Perhaps the Throne itself tests worthiness',
          stance: 'pragmatist',
          consequence: { type: 'xp_bonus', value: 45, description: 'Meta-Philosophy' },
        },
        {
          id: 'challenge_guard',
          text: 'Who appointed you the arbiter of worthiness?',
          stance: 'cynic',
          consequence: { type: 'buff', value: 8, description: "Challenger's Spirit" },
        },
        {
          id: 'accept_unworthy',
          text: 'I am unworthy - and so is everyone else',
          stance: 'cynic',
          consequence: { type: 'xp_bonus', value: 55, description: 'Universal Unworthiness' },
        },
      ],
      points: { correct: 50, partial: 30, creative: 50 },
    },
  ],
};

const FALLBACK_TRIALS: readonly [TrialDefinition] = [
  {
    id: 'fallback',
    type: 'moral_dilemma',
    prompt: 'Choose your path.',
    context: 'A choice must be made.',
    options: [
      {
        id: 'a',
        text: 'Option A',
        stance: 'idealist',
        consequence: { type: 'xp_bonus', value: 20, description: 'Choice Made' },
      },
    ],
    points: { correct: 50, partial: 25, creative: 20 },
  },
];

/**
 * Generate a trial for a stage
 */
export function generateStageTrial(theme: StageTheme, stageIndex: number): TrialDefinition {
  const rand = Math.random();
  let trials: TrialDefinition[];

  if (stageIndex < 2) {
    // Early stages: mostly moral dilemmas
    if (rand < 0.7) {
      trials = MORAL_DILEMMAS[theme] ?? [];
    } else {
      trials = LOGIC_PUZZLES[theme] ?? [];
    }
  } else if (stageIndex < 3) {
    // Mid stages: mix
    if (rand < 0.4) {
      trials = MORAL_DILEMMAS[theme] ?? [];
    } else if (rand < 0.7) {
      trials = LOGIC_PUZZLES[theme] ?? [];
    } else {
      trials = ACCUSATIONS[theme] ?? [];
    }
  } else {
    // Final stage: harder challenges
    if (rand < 0.3) {
      trials = MORAL_DILEMMAS[theme] ?? [];
    } else if (rand < 0.5) {
      trials = LOGIC_PUZZLES[theme] ?? [];
    } else {
      trials = ACCUSATIONS[theme] ?? [];
    }
  }

  if (trials.length === 0) {
    trials = MORAL_DILEMMAS.neon_streets ?? FALLBACK_TRIALS;
  }

  return trials[Math.floor(Math.random() * trials.length)] ?? trials[0] ?? FALLBACK_TRIALS[0];
}

/**
 * Score a typed response
 */
export function scoreTypedResponse(
  response: string,
  trial: TrialDefinition
): { score: number; stance: 'idealist' | 'pragmatist' | 'cynic' | 'neutral' } {
  const text = response.toLowerCase().trim();

  let score = 0;
  let idealistScore = 0;
  let pragmatistScore = 0;
  let cynicScore = 0;

  // Keyword matching
  if (trial.keywords) {
    for (const keyword of trial.keywords) {
      if (text.includes(keyword.toLowerCase())) {
        score += 5;
      }
    }
  }

  // Stance keyword matching
  if (trial.stanceKeywords) {
    for (const keyword of trial.stanceKeywords.idealist) {
      if (text.includes(keyword.toLowerCase())) idealistScore++;
    }
    for (const keyword of trial.stanceKeywords.pragmatist) {
      if (text.includes(keyword.toLowerCase())) pragmatistScore++;
    }
    for (const keyword of trial.stanceKeywords.cynic) {
      if (text.includes(keyword.toLowerCase())) cynicScore++;
    }
  }

  // Rhetorical flair
  if (text.includes('?')) score += 3;
  if (text.includes('!')) score += 2;
  if (text.includes('"') || text.includes("'")) score += 3;
  if (text.includes('therefore') || text.includes('thus')) score += 4;

  // Length bonus
  const wordCount = text.split(/\s+/).length;
  score += Math.min(15, wordCount);

  // Determine stance
  let stance: 'idealist' | 'pragmatist' | 'cynic' | 'neutral' = 'neutral';
  const maxStanceScore = Math.max(idealistScore, pragmatistScore, cynicScore);
  if (maxStanceScore > 0) {
    if (idealistScore === maxStanceScore) stance = 'idealist';
    else if (pragmatistScore === maxStanceScore) stance = 'pragmatist';
    else stance = 'cynic';
  }

  score = Math.min(100, Math.max(0, score));

  return { score, stance };
}
