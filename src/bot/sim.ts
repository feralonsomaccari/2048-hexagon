// Headless simulator for the hex-2048 small board (radius 1, 7 cells).
// Mirrors the in-game movement/merge semantics from src/utils/gameLogic.ts
// and src/components/App/index.tsx.

export type Cell = { x: number; y: number; z: number; value: number };
export type Direction =
  | "northWest"
  | "north"
  | "northEast"
  | "southWest"
  | "south"
  | "southEast";

export const DIRECTIONS: Direction[] = [
  "northWest",
  "north",
  "northEast",
  "southWest",
  "south",
  "southEast",
];

export const createHexGrid = (radius: number): Cell[] => {
  const grid: Cell[] = [];
  for (let i = -radius; i <= radius; i++) {
    for (let j = -radius; j <= radius; j++) {
      for (let k = -radius; k <= radius; k++) {
        if (i + j + k === 0) grid.push({ x: i, y: j, z: k, value: 0 });
      }
    }
  }
  return grid;
};

const stepCoord = (
  c: { x: number; y: number; z: number },
  direction: Direction,
): { x: number; y: number; z: number } => {
  switch (direction) {
    case "northWest":
      return { x: c.x - 1, y: c.y + 1, z: c.z };
    case "north":
      return { x: c.x, y: c.y + 1, z: c.z - 1 };
    case "northEast":
      return { x: c.x + 1, y: c.y, z: c.z - 1 };
    case "southWest":
      return { x: c.x - 1, y: c.y, z: c.z + 1 };
    case "south":
      return { x: c.x, y: c.y - 1, z: c.z + 1 };
    case "southEast":
      return { x: c.x + 1, y: c.y - 1, z: c.z };
  }
};

// Tile-processing order per direction — taken verbatim from sortTileSet in
// src/utils/gameLogic.ts. Tiles furthest in the move direction are processed
// first so a cascade resolves correctly.
const sortByDirection = (cells: Cell[], direction: Direction): Cell[] => {
  const arr = cells.slice();
  switch (direction) {
    case "northWest":
      arr.sort((a, b) => a.x - b.x || b.y - a.y);
      break;
    case "north":
      arr.sort((a, b) => b.y - a.y || a.z - b.z);
      break;
    case "northEast":
      arr.sort((a, b) => b.x - a.x || a.z - b.z);
      break;
    case "southWest":
      arr.sort((a, b) => a.x - b.x || b.z - a.z);
      break;
    case "south":
      arr.sort((a, b) => a.y - b.y || b.z - a.z);
      break;
    case "southEast":
      arr.sort((a, b) => b.x - a.x || a.y - b.y);
      break;
  }
  return arr;
};

const keyOf = (c: { x: number; y: number; z: number }) =>
  `${c.x},${c.y},${c.z}`;

// Apply one move and return the merge-score gained. The grid is mutated in
// place. Caller must check legality first via legalMoves / cloneGrid.
export const applyMove = (
  grid: Cell[],
  direction: Direction,
): { moved: boolean; gained: number; reached2048: boolean } => {
  const index = new Map<string, Cell>();
  for (const c of grid) index.set(keyOf(c), c);

  const merged = new Set<string>();
  let moved = false;
  let gained = 0;
  let reached2048 = false;

  // Iterate over non-empty cells in the correct order. Each tile slides as far
  // as it can, merging with one tile of equal value at most once per move.
  const tiles = grid.filter((c) => c.value > 0);
  const sorted = sortByDirection(tiles, direction);

  for (const tile of sorted) {
    let cur = index.get(keyOf(tile));
    if (!cur || cur.value === 0) continue;

    while (true) {
      const nextCoord = stepCoord(cur, direction);
      const next = index.get(keyOf(nextCoord));
      if (!next) break; // off-grid
      if (next.value === 0) {
        next.value = cur.value;
        cur.value = 0;
        moved = true;
        cur = next;
      } else if (next.value === cur.value && !merged.has(keyOf(next))) {
        const newValue = cur.value * 2;
        next.value = newValue;
        cur.value = 0;
        merged.add(keyOf(next));
        gained += newValue;
        if (newValue >= 2048) reached2048 = true;
        moved = true;
        break;
      } else {
        break;
      }
    }
  }

  return { moved, gained, reached2048 };
};

export const cloneGrid = (grid: Cell[]): Cell[] =>
  grid.map((c) => ({ x: c.x, y: c.y, z: c.z, value: c.value }));

export const legalMoves = (grid: Cell[]): Direction[] => {
  const out: Direction[] = [];
  for (const d of DIRECTIONS) {
    const probe = cloneGrid(grid);
    if (applyMove(probe, d).moved) out.push(d);
  }
  return out;
};

// Spawn parameters mirror src/utils/generateTiles.ts. The UI radius (1..4) is
// passed to getRNGPoints(uiRadius + 1, …), so the table key is uiRadius + 1.
// Re-stated here keyed by the UI radius the bot consumes.
const fourProbabilityByRadius: Record<number, number> = {
  1: 0.1,   // Small
  2: 0.15,  // Medium
  3: 0.2,   // Large
  4: 0.25,  // XL
};
const doubleSpawnProbabilityByRadius: Record<number, number> = {
  1: 0,
  2: 0.25,
  3: 0.6,
  4: 0.75,
};
const tripleSpawnProbabilityByRadius: Record<number, number> = {
  1: 0,
  2: 0,
  3: 0,
  4: 0.1,
};

const pickSpawnCount = (radius: number, rng: () => number): number => {
  const tripleProb = tripleSpawnProbabilityByRadius[radius] ?? 0;
  const doubleProb = doubleSpawnProbabilityByRadius[radius] ?? 0;
  const roll = rng();
  if (roll < tripleProb) return 3;
  if (roll < tripleProb + doubleProb) return 2;
  return 1;
};

// Initial spawn places N tiles of value 2 (game default = 3).
export const initialSpawn = (
  grid: Cell[],
  count: number = 3,
  rng: () => number = Math.random,
): void => {
  const empties = grid.filter((c) => c.value === 0);
  shuffleInPlace(empties, rng);
  for (let i = 0; i < count && i < empties.length; i++) empties[i].value = 2;
};

export const spawnAfterMove = (
  grid: Cell[],
  radius: number,
  rng: () => number = Math.random,
): boolean => {
  const empties = grid.filter((c) => c.value === 0);
  if (empties.length === 0) return false;
  const count = Math.min(empties.length, pickSpawnCount(radius, rng));
  const fourProb = fourProbabilityByRadius[radius] ?? 0.1;
  // The game picks one value per move (not per tile) — see generateTiles.ts:49.
  const value = rng() < 1 - fourProb ? 2 : 4;
  shuffleInPlace(empties, rng);
  for (let i = 0; i < count; i++) empties[i].value = value;
  return true;
};

// Number of empty cells and number of (cell, value) outcomes a chance node
// needs to consider. Exposed so bot.ts can branch over the right distribution.
export const spawnOutcomes = (
  radius: number,
): { count: 1 | 2 | 3; probability: number; value: 2 | 4; valueProb: number }[] => {
  // For expectimax we only model the most common (single-tile) spawn case —
  // double/triple branches blow up the chance fanout. Sound approximation
  // because the bot evaluates after the spawn anyway.
  const fourProb = fourProbabilityByRadius[radius] ?? 0.1;
  return [
    { count: 1, probability: 1, value: 2, valueProb: 1 - fourProb },
    { count: 1, probability: 1, value: 4, valueProb: fourProb },
  ];
};

const shuffleInPlace = <T,>(arr: T[], rng: () => number): void => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

export const isGameOver = (grid: Cell[]): boolean => legalMoves(grid).length === 0;

export const maxTile = (grid: Cell[]): number =>
  grid.reduce((m, c) => (c.value > m ? c.value : m), 0);

// Mirrors mergeReachable in src/utils/gameLogic.ts: returns true iff some
// slide direction would actually combine two tiles (walks past empties along
// each axis). Used by the Small-board spawn rule to detect soft-locks.
export const mergeReachable = (grid: Cell[]): boolean => {
  const index = new Map<string, Cell>();
  for (const c of grid) index.set(keyOf(c), c);

  const tiles = grid.filter((c) => c.value > 0);
  for (const tile of tiles) {
    for (const d of DIRECTIONS) {
      let cur: Cell | undefined = tile;
      while (cur) {
        const next = index.get(keyOf(stepCoord(cur, d)));
        if (!next) break; // edge
        if (next.value === 0) {
          cur = next;
          continue;
        }
        if (next.value === tile.value) return true;
        break;
      }
    }
  }
  return false;
};
