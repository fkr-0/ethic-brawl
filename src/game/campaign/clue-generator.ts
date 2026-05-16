/**
 * Clue generator - creates environmental storytelling elements
 */

import type { CampaignClue, ClueStyle, StageTheme } from './campaign-controller';

/**
 * Headline templates
 */
const HEADLINES: Record<StageTheme, string[]> = {
  neon_streets: [
    'LOCAL PHILOSOPHER QUESTIONS EXISTENCE OF MONDAY',
    'CITIZENS DEMAND ANSWERS: WHY IS THE SKY PURPLE?',
    'MEANING CRISIS HITS RECORD HIGH IN SECTOR 7',
    'TRUTH: NOW WITH 20% MORE UNCERTAINTY',
    'ETHICS BOARD DECLARES "EVERYTHING IS PERMITTED"',
  ],
  data_cathedral: [
    'ALGORITHM PROVES EXISTENCE OF ALGORITHMS',
    'FAITH IN CALCULATIONS AT ALL-TIME HIGH',
    'CATHEDRAL DATABASE: "WE KNOW WHAT YOU DID"',
    'DEUS EX MACHINA PATCH v2.0 NOW AVAILABLE',
    'SACRED PROTOCOL DETERMINES YOUR WORTH',
  ],
  algorithmic_arena: [
    'ENTERTAINMENT VALUE EXCEEDS EXPECTATIONS',
    'COMBAT EFFICIENCY METRICS LOOK PROMISING',
    'GLADIATORS RANKED BY PHILOSOPHICAL MERIT',
    'AUDIENCE ENGAGEMENT ALGORITHM DEMANDS BLOOD',
    'OPTIMAL STRATEGY: UNCERTAIN',
  ],
  philosophers_throne: [
    'FINAL PROVING GROUND INITIALIZED',
    'THE ULTIMATE QUESTION REMAINS UNANSWERED',
    'THRONE VACANT SINCE THE DEATH OF TRUTH',
    'ONLY THE WORTHY MAY ASCEND',
    'VICTORY MEANS NOTHING. DEFEAT MEANS LESS.',
  ],
};

/**
 * Propaganda slogans
 */
const PROPAGANDA: Record<StageTheme, string[]> = {
  neon_streets: [
    'REBELLION IS THE ONLY TRUTH',
    'THE ABSURD EMBRACES ALL',
    'FREEDOM IS A CHOICE WE MAKE DAILY',
    'QUESTION EVERYTHING, INCLUDING THIS SIGN',
  ],
  data_cathedral: [
    'CALCULATION IS SALVATION',
    'TRUST THE ALGORITHM',
    'YOUR DATA IS YOUR SOUL',
    'OPTIMIZATION IS VIRTUE',
  ],
  algorithmic_arena: [
    'ENTERTAINMENT IS PURPOSE',
    'COMBAT IS DIALOGUE',
    'SURVIVAL IS THE ONLY ARGUMENT',
    'WINNING PROVES NOTHING',
  ],
  philosophers_throne: [
    'THE THRONE AWAITS THE WORTHY',
    'WISDOM IS THE ONLY WEAPON',
    'LEGACY TRANSCENDS VICTORY',
    'IDEAS NEVER DIE',
  ],
};

/**
 * Ambient signs
 */
const SIGNS: Record<StageTheme, string[]> = {
  neon_streets: [
    'EXISTENTIAL CRISIS CENTER (OPEN 24/7)',
    'MEANING DEPOT - ALL MEANINGS 50% OFF',
    'FREE WILL TESTING FACILITY',
    'VOID LOOKING BACK - WALK INSIDE',
    'ABSURDIST COMEDY CLUB: "IT\'S ALL A JOKE"',
  ],
  data_cathedral: [
    'CONFESSION BOOTH (UPLOAD YOUR SINS)',
    'SACRED BACKUP IN PROGRESS',
    'PRAYER REQUESTS: PROCESSED IN 3-5 DAYS',
    'FORGIVENESS CACHE: 99% FULL',
  ],
  algorithmic_arena: [
    'TICKETS: YOUR SOUL OR EQUIVALENT',
    'MEDICAL BAY: PHILOSOPHICAL WOUNDS ONLY',
    'FAN ZONE: CHEERING IS MANDATORY',
    "VICTOR'S LOUNGE: ACCESS DENIED",
  ],
  philosophers_throne: [
    'FINAL EXAMINATION IN PROGRESS',
    'THESIS DEFENSE ZONE',
    'THE ANSWER LIES WITHIN',
    'ABANDON DOGMA, ALL YE WHO ENTER',
  ],
};

/**
 * Clue styles
 */
const CLUE_STYLES: Record<CampaignClue['type'], ClueStyle> = {
  headline: {
    color: '#FFFFFF',
    font: 'bold 14px "Courier New", monospace',
    background: '#1A0A2E',
    border: '#FF00FF',
    glow: '#FF00FF44',
  },
  propaganda: {
    color: '#00F5FF',
    font: 'bold 18px "Courier New", monospace',
    background: '#0D0518',
    border: '#00F5FF',
    glow: '#00F5FF44',
  },
  sign: {
    color: '#39FF14',
    font: '12px "Courier New", monospace',
    border: '#39FF14',
    glow: '#39FF1444',
  },
  dialogue: {
    color: '#FFFFFF',
    font: 'italic 12px "Courier New", monospace',
    background: '#2D1B4E',
  },
};

/**
 * Generate clues for a stage
 */
export function generateStageClues(theme: StageTheme, stageIndex: number): CampaignClue[] {
  const clues: CampaignClue[] = [];
  const seed = stageIndex * 1000 + (Date.now() % 1000);

  // Generate headlines
  const headlineCount = 1 + Math.floor(seed % 2);
  const availableHeadlines = [...HEADLINES[theme]];
  for (let i = 0; i < headlineCount && availableHeadlines.length > 0; i++) {
    const index = Math.floor((seed + i * 17) % availableHeadlines.length);
    const text = availableHeadlines.splice(index, 1)[0];
    if (text) {
      clues.push({
        id: `headline_${i}`,
        type: 'headline',
        text,
        position: {
          x: 100 + (seed % 200) + i * 300,
          y: 100 + (seed % 50),
        },
        style: CLUE_STYLES.headline,
      });
    }
  }

  // Generate propaganda
  const propagandaCount = 1 + Math.floor((seed + 7) % 2);
  const availablePropaganda = [...PROPAGANDA[theme]];
  for (let i = 0; i < propagandaCount && availablePropaganda.length > 0; i++) {
    const index = Math.floor((seed + i * 23) % availablePropaganda.length);
    const text = availablePropaganda.splice(index, 1)[0];
    if (text) {
      clues.push({
        id: `propaganda_${i}`,
        type: 'propaganda',
        text,
        position: {
          x: 150 + (seed % 100) + i * 250,
          y: 200 + (seed % 80),
        },
        style: CLUE_STYLES.propaganda,
      });
    }
  }

  // Generate signs
  const signCount = 2 + Math.floor((seed + 13) % 2);
  const availableSigns = [...SIGNS[theme]];
  for (let i = 0; i < signCount && availableSigns.length > 0; i++) {
    const index = Math.floor((seed + i * 31) % availableSigns.length);
    const text = availableSigns.splice(index, 1)[0];
    if (text) {
      clues.push({
        id: `sign_${i}`,
        type: 'sign',
        text,
        position: {
          x: 50 + (seed % 300) + i * 200,
          y: 300 + (seed % 100) + i * 30,
        },
        style: CLUE_STYLES.sign,
      });
    }
  }

  return clues;
}

/**
 * Render clues on canvas
 */
export function renderClues(
  ctx: CanvasRenderingContext2D,
  clues: CampaignClue[],
  _camera: { x: number; y: number }
): void {
  for (const clue of clues) {
    ctx.save();

    // Apply style
    const style = clue.style;

    if (style.background) {
      const metrics = ctx.measureText(clue.text);
      ctx.fillStyle = style.background;
      ctx.fillRect(clue.position.x - 5, clue.position.y - 15, metrics.width + 10, 20);
    }

    if (style.border) {
      ctx.strokeStyle = style.border;
      ctx.lineWidth = 1;
      const metrics = ctx.measureText(clue.text);
      ctx.strokeRect(clue.position.x - 5, clue.position.y - 15, metrics.width + 10, 20);
    }

    if (style.glow) {
      ctx.shadowColor = style.glow;
      ctx.shadowBlur = 10;
    }

    ctx.font = style.font;
    ctx.fillStyle = style.color;
    ctx.textAlign = 'left';
    ctx.fillText(clue.text, clue.position.x, clue.position.y);

    ctx.restore();
  }
}
