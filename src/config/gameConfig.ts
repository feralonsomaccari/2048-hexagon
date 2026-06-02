
export const FIREBASE_LOGS_ENABLED = false;

export const DEFAULT_RADIUS = 1;

export const WIN_TILE_BY_RADIUS: Record<number, number> = {
  1: 2048,
  2: 2048,
  3: 2048,
  4: 2048,
};

export const LEADERBOARD_SIZE = 5;
export const LEADERBOARD_SHOW_MOVES = true;
export const MAX_NAME_LENGTH = 16;
export const MAX_UNDO_BY_RADIUS: Record<number, number> = {
  1: 3,
  2: 0,
  3: 0,
  4: 0,
};

export const MAX_REMOVE_BY_RADIUS: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
};

export const MAX_SWAP_BY_RADIUS: Record<number, number> = {
  1: 2,
  2: 0,
  3: 0,
  4: 0,
};

export const MAX_FREEZE_BY_RADIUS: Record<number, number> = {
  1: 2,
  2: 0,
  3: 0,
  4: 0,
};

export const MAX_DOUBLE_BY_RADIUS: Record<number, number> = {
  1: 2,
  2: 0,
  3: 0,
  4: 0,
};

export const DOUBLE_MAX_VALUE = 512;

export const UNUSED_POWER_UP_BONUS_RATE = 0.03;

export type PowerUpId = "undo" | "removeTile" | "swap" | "freeze" | "double" | "newGame";

export type PowerUpDef = {
  id: PowerUpId;
  label: string;
  description: string;
};

// available power-ups, they rendered in order
// Add new power-ups here
export const POWER_UPS: PowerUpDef[] = [
  {
    id: "undo",
    label: "Undo",
    description: "Undo your last move",
  },
  {
    id: "removeTile",
    label: "Remove",
    description: "Remove a tile from the board",
  },
  {
    id: "swap",
    label: "Swap",
    description: "Swap two tiles on the board",
  },
  {
    id: "freeze",
    label: "Freeze",
    description: "Skip the next tile spawn",
  },
  {
    id: "double",
    label: "Double",
    description: "Double a tile's value (up to 512)",
  },
  {
    id: "newGame",
    label: "New Game",
    description: "Start a new game",
  },
];

export const BLOCKED_RADIUS_BY_RADIUS: Record<number, number> = {
  1: -1,
  2: 0,
  3: 1,
  4: 2,
};

export const STARTER_SPAWN_COUNT_BY_RADIUS: Record<number, number> = {
  1: 2,
  2: 3,
  3: 3,
  4: 3,
};

export const FOUR_PROBABILITY_BY_RADIUS: Record<number, number> = {
  1: 0.2,
  2: 0.2,
  3: 0.2,
  4: 0.25,
};

export const DOUBLE_SPAWN_PROBABILITY_BY_RADIUS: Record<number, number> = {
  1: 0,
  2: 0.5,
  3: 0.6,
  4: 0.75,
};

export const TRIPLE_SPAWN_PROBABILITY_BY_RADIUS: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0.1,
};
