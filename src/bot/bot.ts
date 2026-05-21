import {
  Cell,
  Direction,
  applyMove,
  cloneGrid,
  legalMoves,
  maxTile,
  mergeReachable,
} from "./sim";

// Heuristic for the small board. Components:
//   empties   — more empty cells = more breathing room.
//   maxLog    — reward having a big tile at all.
//   cornerBias — reward the max tile sitting on the outer ring (corner-ish).
//                On a 7-cell hex the "corners" are the 6 outer cells; we'd
//                rather not stash the max in the centre (which has 6 neighbours
//                and gets walked into).
//   monotone  — count of neighbour pairs whose values are ordered (one is the
//               other doubled or equal). Encourages a smooth gradient.
//   smoothPenalty — sum of |log2(a)-log2(b)| over neighbours, penalising sharp
//                   value jumps between adjacent tiles.
const log2 = (n: number) => (n <= 1 ? 0 : Math.log2(n));

const neighbourPairs = (grid: Cell[]): Array<[Cell, Cell]> => {
  const index = new Map<string, Cell>();
  for (const c of grid) index.set(`${c.x},${c.y},${c.z}`, c);
  const dirs = [
    [+1, -1, 0],
    [+1, 0, -1],
    [0, +1, -1],
  ];
  const pairs: Array<[Cell, Cell]> = [];
  for (const c of grid) {
    for (const [dx, dy, dz] of dirs) {
      const nb = index.get(`${c.x + dx},${c.y + dy},${c.z + dz}`);
      if (nb) pairs.push([c, nb]);
    }
  }
  return pairs;
};

const isCenter = (c: Cell) => c.x === 0 && c.y === 0 && c.z === 0;

export const evaluate = (grid: Cell[]): number => {
  const empties = grid.filter((c) => c.value === 0).length;
  const max = maxTile(grid);

  let cornerBias = 0;
  if (max >= 4) {
    const maxCell = grid.find((c) => c.value === max)!;
    cornerBias = isCenter(maxCell) ? -log2(max) : log2(max);
  }

  let monotone = 0;
  let smoothPenalty = 0;
  for (const [a, b] of neighbourPairs(grid)) {
    if (a.value === 0 || b.value === 0) continue;
    if (a.value === b.value || a.value === b.value * 2 || b.value === a.value * 2) {
      monotone += 1;
    }
    smoothPenalty += Math.abs(log2(a.value) - log2(b.value));
  }

  return (
    empties * 2.7 +
    log2(max) * 1.0 +
    cornerBias * 1.5 +
    monotone * 1.2 -
    smoothPenalty * 0.1
  );
};

// Expectimax. depth = number of player plies remaining.
// At each player node we pick the max-value move; at each chance node we
// average over (a) which empty cell the spawn lands in and (b) value 2 vs 4.
//
// The chance node only models a single-tile spawn even on Medium/Large/XL
// where the game can spawn 2 or 3 tiles at once. That's a deliberate
// approximation: full multi-tile fanout would blow the search budget, and the
// move chosen against a single-spawn model is still a reasonable choice
// against multi-spawn reality. fourProb shifts per radius.
//
// `radius` is threaded through so the player node can apply the real-game
// spawn rule on the Small board (radius 1): a non-merging move skips the
// chance node entirely, unless no further merge is reachable from the new
// position (soft-lock guard). Other radii always go through the chance node.
const expectimax = (
  grid: Cell[],
  depth: number,
  isPlayer: boolean,
  fourProb: number,
  maxChanceBranches: number,
  radius: number,
): number => {
  if (depth === 0) return evaluate(grid);

  if (isPlayer) {
    const moves = legalMoves(grid);
    if (moves.length === 0) return evaluate(grid) - 1000; // terminal: heavy penalty
    let best = -Infinity;
    for (const d of moves) {
      const next = cloneGrid(grid);
      const res = applyMove(next, d);
      const merged = res.gained > 0;
      const skipSpawn = radius === 1 && !merged && mergeReachable(next);
      // If the spawn is skipped the next ply is another player turn on the
      // same board state minus this slide; we still spend a depth tick on it
      // so search budget stays bounded and the bot can't spin forever inside
      // its own search tree.
      const v = expectimax(
        next,
        depth - 1,
        skipSpawn ? true : false,
        fourProb,
        maxChanceBranches,
        radius,
      );
      if (v > best) best = v;
    }
    return best;
  }

  // Chance node: spawn one tile across empty cells, value 2 or 4.
  const empties = grid.filter((c) => c.value === 0);
  if (empties.length === 0) return evaluate(grid);

  // On larger boards the empties count gets too big to enumerate. Sample up
  // to `maxChanceBranches` empties uniformly; the result is an unbiased
  // estimate of the true expectation.
  let cells = empties;
  if (cells.length > maxChanceBranches) {
    const shuffled = cells.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    cells = shuffled.slice(0, maxChanceBranches);
  }

  let acc = 0;
  for (const cell of cells) {
    for (const [val, p] of [
      [2, 1 - fourProb],
      [4, fourProb],
    ] as const) {
      const next = cloneGrid(grid);
      const target = next.find(
        (c) => c.x === cell.x && c.y === cell.y && c.z === cell.z,
      )!;
      target.value = val;
      acc += (p / cells.length) * expectimax(next, depth - 1, true, fourProb, maxChanceBranches, radius);
    }
  }
  return acc;
};

const FOUR_PROB_BY_RADIUS: Record<number, number> = {
  1: 0.1,
  2: 0.15,
  3: 0.2,
  4: 0.25,
};

export interface BotConfig {
  depth: number;
  radius: number;
  maxChanceBranches?: number;
}

export const chooseMove = (
  grid: Cell[],
  config: BotConfig,
): Direction | null => {
  const moves = legalMoves(grid);
  if (moves.length === 0) return null;
  const fourProb = FOUR_PROB_BY_RADIUS[config.radius] ?? 0.1;
  // Empties × 2 values × depth — keep the search budget bounded on big boards.
  const maxChanceBranches = config.maxChanceBranches ?? (config.radius <= 1 ? 7 : 6);
  let best: Direction = moves[0];
  let bestScore = -Infinity;
  for (const d of moves) {
    const next = cloneGrid(grid);
    const res = applyMove(next, d);
    const merged = res.gained > 0;
    // Same skip-spawn rule applied to the top-level chooser: if the move
    // didn't merge and a future merge is still possible on the Small board,
    // no spawn happens, so the next ply is another player turn.
    const skipSpawn = config.radius === 1 && !merged && mergeReachable(next);
    const v = expectimax(
      next,
      config.depth - 1,
      skipSpawn,
      fourProb,
      maxChanceBranches,
      config.radius,
    );
    if (v > bestScore) {
      bestScore = v;
      best = d;
    }
  }
  return best;
};
