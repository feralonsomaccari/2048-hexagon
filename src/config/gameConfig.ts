// ── Debug ───────────────────────────────────────────────────────────────────
export const FIREBASE_LOGS_ENABLED = false;

// ── Defaults ────────────────────────────────────────────────────────────────
/** Board radius used on first load when no saved game exists. 1=Small, 2=Normal, 3=Large, 4=XL */
export const DEFAULT_RADIUS = 2;

/** Tile value required to win, per board radius. */
export const WIN_TILE_BY_RADIUS: Record<number, number> = {
  1: 512,  // Small
  2: 2048, // Normal
  3: 2048, // Large
  4: 2048, // XL
};

// ── Leaderboard ─────────────────────────────────────────────────────────────
export const LEADERBOARD_SIZE = 5;
export const MAX_NAME_LENGTH = 16;
export const MAX_UNDO_BY_RADIUS: Record<number, number> = {
  1: 3,
  2: 1,
  3: 0,
  4: 0,
};

// ── Board shape ─────────────────────────────────────────────────────────────
export const BLOCKED_RADIUS_BY_RADIUS: Record<number, number> = {
  // 1: -1, // No blocked cells
  2: 0,
  3: 1,
  4: 2,
};

// ── Spawning ────────────────────────────────────────────────────────────────

export const STARTER_SPAWN_COUNT_BY_RADIUS: Record<number, number> = {
  1: 2,
  2: 3,
  3: 3,
  4: 3,
};

/** Per-turn probability that a spawned tile is a 4 instead of a 2. */
export const FOUR_PROBABILITY_BY_RADIUS: Record<number, number> = {
  1: 0, // Small: only 2s
  2: 0.2,
  3: 0.2,
  4: 0.25,
};

/** Per-turn probability of spawning 2 tiles instead of 1. */
export const DOUBLE_SPAWN_PROBABILITY_BY_RADIUS: Record<number, number> = {
  1: 0,
  2: 0.5,
  3: 0.6,
  4: 0.75,
};

/**
 * Per-turn probability of spawning 3 tiles instead of 1.
 */
export const TRIPLE_SPAWN_PROBABILITY_BY_RADIUS: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0.1,
};
