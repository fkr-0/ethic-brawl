/**
 * Web Audio API engine for music and SFX
 */

/**
 * Audio configuration
 */
export interface AudioConfig {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  latencyCalibration: number;
}

/**
 * Audio engine state
 */
export interface AudioEngine {
  context: AudioContext;
  masterGain: GainNode;
  musicGain: GainNode;
  sfxGain: GainNode;
  config: AudioConfig;
  isInitialized: boolean;
}

let engine: AudioEngine | null = null;

/**
 * Initialize the audio engine
 */
export function initAudio(config: Partial<AudioConfig> = {}): AudioEngine {
  if (engine) return engine;

  const audioContext = new AudioContext();

  // Create gain nodes
  const masterGain = audioContext.createGain();
  const musicGain = audioContext.createGain();
  const sfxGain = audioContext.createGain();

  // Connect nodes
  musicGain.connect(masterGain);
  sfxGain.connect(masterGain);
  masterGain.connect(audioContext.destination);

  engine = {
    context: audioContext,
    masterGain,
    musicGain,
    sfxGain,
    config: {
      masterVolume: 0.8,
      musicVolume: 0.6,
      sfxVolume: 0.8,
      latencyCalibration: 0,
      ...config,
    },
    isInitialized: true,
  };

  // Apply initial volumes
  updateVolumes(engine);

  return engine;
}

/**
 * Get the audio engine
 */
export function getAudioEngine(): AudioEngine | null {
  return engine;
}

/**
 * Update volume levels
 */
export function updateVolumes(audioEngine: AudioEngine): void {
  const { config } = audioEngine;
  audioEngine.masterGain.gain.value = config.masterVolume;
  audioEngine.musicGain.gain.value = config.musicVolume;
  audioEngine.sfxGain.gain.value = config.sfxVolume;
}

/**
 * Resume audio context (required after user interaction)
 */
export async function resumeAudio(audioEngine: AudioEngine): Promise<void> {
  if (audioEngine.context.state === 'suspended') {
    await audioEngine.context.resume();
  }
}

/**
 * Play a synthesized sound effect
 */
export function playSFX(
  audioEngine: AudioEngine,
  type: SFXType,
  options: Partial<SFXOptions> = {}
): void {
  const { context, sfxGain } = audioEngine;
  const now = context.currentTime;

  const opts: SFXOptions = {
    frequency: 440,
    detune: 0,
    type: 'square',
    attack: 0.01,
    decay: 0.1,
    sustain: 0.3,
    release: 0.1,
    volume: 0.5,
    ...DEFAULT_SFX[type],
    ...options,
  };

  // Create oscillator
  const osc = context.createOscillator();
  osc.type = opts.type;
  osc.frequency.value = opts.frequency;
  osc.detune.value = opts.detune;

  // Create gain for envelope
  const gain = context.createGain();
  gain.gain.value = 0;

  // Apply envelope
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(opts.volume ?? 0.5, now + (opts.attack ?? 0.01));
  gain.gain.linearRampToValueAtTime(
    (opts.volume ?? 0.5) * (opts.sustain ?? 0.3),
    now + (opts.attack ?? 0.01) + (opts.decay ?? 0.1)
  );
  gain.gain.linearRampToValueAtTime(
    0,
    now + (opts.attack ?? 0.01) + (opts.decay ?? 0.1) + (opts.release ?? 0.1)
  );

  // Connect
  osc.connect(gain);
  gain.connect(sfxGain);

  // Play
  osc.start(now);
  osc.stop(now + (opts.attack ?? 0.01) + (opts.decay ?? 0.1) + (opts.release ?? 0.1));
}

/**
 * Sound effect types
 */
export type SFXType =
  | 'hit_light'
  | 'hit_medium'
  | 'hit_heavy'
  | 'block'
  | 'perfect_block'
  | 'jump'
  | 'land'
  | 'special'
  | 'combo'
  | 'round_start'
  | 'victory'
  | 'defeat'
  | 'select'
  | 'confirm'
  | 'cancel';

/**
 * Sound effect options
 */
export interface SFXOptions {
  frequency: number;
  detune: number;
  type: OscillatorType;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  volume: number;
  filter?: {
    type: BiquadFilterType;
    frequency: number;
    Q: number;
  };
  sweep?: {
    endFrequency: number;
    duration: number;
  };
}

/**
 * Default sound effect configurations
 */
const DEFAULT_SFX: Record<SFXType, Partial<SFXOptions>> = {
  hit_light: {
    frequency: 200,
    type: 'square',
    attack: 0.005,
    decay: 0.05,
    sustain: 0.2,
    release: 0.05,
    volume: 0.3,
    sweep: { endFrequency: 80, duration: 0.05 },
  },
  hit_medium: {
    frequency: 150,
    type: 'sawtooth',
    attack: 0.005,
    decay: 0.08,
    sustain: 0.2,
    release: 0.08,
    volume: 0.4,
    sweep: { endFrequency: 60, duration: 0.08 },
  },
  hit_heavy: {
    frequency: 100,
    type: 'sawtooth',
    attack: 0.005,
    decay: 0.12,
    sustain: 0.3,
    release: 0.1,
    volume: 0.5,
    sweep: { endFrequency: 40, duration: 0.12 },
  },
  block: {
    frequency: 300,
    type: 'triangle',
    attack: 0.01,
    decay: 0.05,
    sustain: 0.3,
    release: 0.05,
    volume: 0.25,
  },
  perfect_block: {
    frequency: 600,
    type: 'sine',
    attack: 0.01,
    decay: 0.1,
    sustain: 0.4,
    release: 0.1,
    volume: 0.3,
  },
  jump: {
    frequency: 200,
    type: 'sine',
    attack: 0.01,
    decay: 0.1,
    sustain: 0.3,
    release: 0.1,
    volume: 0.2,
    sweep: { endFrequency: 400, duration: 0.15 },
  },
  land: {
    frequency: 100,
    type: 'triangle',
    attack: 0.005,
    decay: 0.08,
    sustain: 0.2,
    release: 0.05,
    volume: 0.2,
  },
  special: {
    frequency: 400,
    type: 'sine',
    attack: 0.02,
    decay: 0.2,
    sustain: 0.4,
    release: 0.3,
    volume: 0.4,
    sweep: { endFrequency: 800, duration: 0.3 },
  },
  combo: {
    frequency: 500,
    type: 'sine',
    attack: 0.01,
    decay: 0.1,
    sustain: 0.5,
    release: 0.15,
    volume: 0.3,
  },
  round_start: {
    frequency: 440,
    type: 'sine',
    attack: 0.01,
    decay: 0.3,
    sustain: 0.4,
    release: 0.2,
    volume: 0.35,
  },
  victory: {
    frequency: 523,
    type: 'sine',
    attack: 0.02,
    decay: 0.4,
    sustain: 0.5,
    release: 0.3,
    volume: 0.4,
  },
  defeat: {
    frequency: 200,
    type: 'sawtooth',
    attack: 0.02,
    decay: 0.5,
    sustain: 0.3,
    release: 0.5,
    volume: 0.35,
    sweep: { endFrequency: 100, duration: 0.5 },
  },
  select: {
    frequency: 600,
    type: 'sine',
    attack: 0.005,
    decay: 0.05,
    sustain: 0.3,
    release: 0.05,
    volume: 0.2,
  },
  confirm: {
    frequency: 800,
    type: 'sine',
    attack: 0.005,
    decay: 0.1,
    sustain: 0.4,
    release: 0.1,
    volume: 0.25,
  },
  cancel: {
    frequency: 300,
    type: 'triangle',
    attack: 0.005,
    decay: 0.08,
    sustain: 0.3,
    release: 0.08,
    volume: 0.2,
  },
};

/**
 * Procedural music player
 */
export interface MusicPlayer {
  isPlaying: boolean;
  intensity: number;
}

/**
 * Create a procedural music player
 */
export function createMusicPlayer(_audioEngine: AudioEngine): MusicPlayer {
  return {
    isPlaying: false,
    intensity: 0.5,
  };
}

/**
 * Play procedural background music
 */
export function startMusic(player: MusicPlayer): void {
  player.isPlaying = true;
  // TODO: Implement procedural music generation
}

/**
 * Stop background music
 */
export function stopMusic(player: MusicPlayer): void {
  player.isPlaying = false;
}

/**
 * Set music intensity (for dynamic music)
 */
export function setMusicIntensity(player: MusicPlayer, intensity: number): void {
  player.intensity = Math.max(0, Math.min(1, intensity));
}
