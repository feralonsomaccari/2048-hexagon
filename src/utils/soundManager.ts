// Procedural sound engine built on the Web Audio API — no audio assets.

type SoundName = "move" | "merge" | "combo" | "win" | "gameOver";

const COMBO_SOUND_ENABLED = false;

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let muted = false;

const getContext = (): AudioContext | null => {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioCtor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtor) return null;
    ctx = new AudioCtor();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
};

const playTone = (
  freq: number,
  {
    duration = 0.15,
    type = "sine",
    gain = 0.3,
    delay = 0,
    glideTo,
  }: {
    duration?: number;
    type?: OscillatorType;
    gain?: number;
    delay?: number;
    glideTo?: number;
  } = {}
): void => {
  const audio = getContext();
  if (!audio || !masterGain) return;

  const start = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const env = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, start + duration);

  // Quick attack, exponential decay — a soft percussive blip rather than a beep.
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + 0.01);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(env);
  env.connect(masterGain);
  osc.start(start);
  osc.stop(start + duration + 0.02);
};

const MERGE_BASE = 330; // ~E4, the pitch of the smallest merge (the new "4" tile)
const SEMITONE = Math.pow(2, 1 / 12);

type SoundOpts = { streak?: number; combo?: number };

const MERGE_PITCH_CEILING = 12; // semitones above base the climb approaches
const MERGE_PITCH_DECAY = 0.93; // <1: smaller share of the remaining gap each step (closer to 1 = slower, longer climb)
const mergePitch = (streak: number): number => {
  const n = Math.max(streak - 1, 0);
  const step = MERGE_PITCH_CEILING * (1 - Math.pow(MERGE_PITCH_DECAY, n));
  return MERGE_BASE * Math.pow(SEMITONE, step);
};

const sounds: Record<SoundName, (opts?: SoundOpts) => void> = {
  move: () =>
    playTone(180, { duration: 0.08, type: "triangle", gain: 0.12, glideTo: 140 }),

  merge: ({ streak = 1 } = {}) => {
    const freq = mergePitch(streak);
    playTone(freq, { duration: 0.1, type: "triangle", gain: 0.22, glideTo: freq * 0.78 });
  },

  combo: ({ combo = 2 } = {}) => {
    if (!COMBO_SOUND_ENABLED) return;
    const steps = Math.min(Math.max(combo, 2), 6); // 2..6 rising notes
    for (let i = 0; i < steps; i++) {
      const freq = MERGE_BASE * Math.pow(SEMITONE, 7 + i * 2); // start a 5th up, climb
      playTone(freq, {
        duration: 0.12,
        type: "triangle",
        gain: 0.2,
        delay: i * 0.07,
        glideTo: freq * 0.9,
      });
    }
  },

  win: () => {
    [261.63, 329.63, 392.0, 523.25].forEach((freq, i) =>
      playTone(freq, { duration: 0.55, type: "triangle", gain: 0.3, delay: i * 0.16 })
    );
  },

  gameOver: () => {
    [196, 164.81, 130.81].forEach((freq, i) =>
      playTone(freq, { duration: 0.6, type: "triangle", gain: 0.26, delay: i * 0.18 })
    );
  },
};

export const playSound = (name: SoundName, opts?: SoundOpts): void => {
  if (muted) return;
  sounds[name](opts);
};

export const setMuted = (value: boolean): void => {
  muted = value;
  if (masterGain && ctx) {
    masterGain.gain.setValueAtTime(value ? 0 : 0.5, ctx.currentTime);
  }
};

export type { SoundName, SoundOpts };
