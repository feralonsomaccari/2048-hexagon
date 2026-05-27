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
    masterGain.gain.value = 0.3;
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
    attack = 0.01,
    vary = 0,
  }: {
    duration?: number;
    type?: OscillatorType;
    gain?: number;
    delay?: number;
    glideTo?: number;
    attack?: number;
    vary?: number; // ± fraction of random pitch jitter per play (e.g. 0.06 = ±6%)
  } = {}
): void => {
  const audio = getContext();
  if (!audio || !masterGain) return;

  // Nudge the pitch a touch each play so repeats don't sound identical.
  const detune = vary ? 1 + (Math.random() * 2 - 1) * vary : 1;

  const start = audio.currentTime + delay;
  const osc = audio.createOscillator();
  const env = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq * detune, start);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo * detune, start + duration);

  // Quick attack, exponential decay — a soft percussive blip rather than a beep.
  env.gain.setValueAtTime(0.0001, start);
  env.gain.exponentialRampToValueAtTime(gain, start + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(env);
  env.connect(masterGain);
  osc.start(start);
  osc.stop(start + duration + 0.02);
};

const MERGE_BASE = 330; // ~E4, the pitch of the smallest merge (the new "4" tile)
const SEMITONE = Math.pow(2, 1 / 12);

type SoundOpts = { streak?: number; combo?: number };

const sounds: Record<SoundName, (opts?: SoundOpts) => void> = {
  move: () =>
    playTone(180, { duration: 0.04, type: "triangle", gain: 0.5, glideTo: 140, vary: 0.08 }),

  merge: () => {
    // Same sound as a move.
    playTone(180, { duration: 0.04, type: "triangle", gain: 1, glideTo: 140, vary: 0.08 });
  },

  combo: ({ combo = 2 } = {}) => {
    if (!COMBO_SOUND_ENABLED) return;
    const steps = Math.min(Math.max(combo, 2), 6); // 2..6 rising notes
    for (let i = 0; i < steps; i++) {
      const freq = MERGE_BASE * Math.pow(SEMITONE, 7 + i * 2); // start a 5th up, climb
      playTone(freq, {
        duration: 0.06,
        type: "triangle",
        gain: 0.2,
        delay: i * 0.04,
        glideTo: freq * 0.9,
      });
    }
  },

  win: () => {
    [261.63, 329.63, 392.0, 523.25].forEach((freq, i) =>
      playTone(freq, { duration: 0.22, type: "triangle", gain: 0.3, delay: i * 0.08 })
    );
  },

  gameOver: () => {
    [196, 164.81, 130.81].forEach((freq, i) =>
      playTone(freq, { duration: 0.25, type: "triangle", gain: 0.26, delay: i * 0.09 })
    );
  },
};

export const playSound = (name: SoundName, opts?: SoundOpts): void => {
  if (muted) return;
  sounds[name](opts);
};

// Haptic feedback for big moments. Honors the same mute flag as sound.
// Note: the Vibration API is unsupported on iOS Safari, so this is a no-op
// on iPhones/iPads — Android Chrome/Firefox will buzz.
const vibrationPatterns: Partial<Record<SoundName, number | number[]>> = {
  // A short triple buzz to celebrate.
  win: [60, 50, 60, 50, 120],
  // A single longer buzz for the loss.
  gameOver: 250,
};

export const vibrate = (name: SoundName): void => {
  if (muted) return;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  const pattern = vibrationPatterns[name];
  if (pattern === undefined) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Some browsers throw if called outside a user gesture; ignore.
  }
};

export const setMuted = (value: boolean): void => {
  muted = value;
  if (masterGain && ctx) {
    masterGain.gain.setValueAtTime(value ? 0 : 0.3, ctx.currentTime);
  }
};

export type { SoundName, SoundOpts };
