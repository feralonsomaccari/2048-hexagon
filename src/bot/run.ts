import {
  Cell,
  applyMove,
  createHexGrid,
  initialSpawn,
  isGameOver,
  maxTile,
  mergeReachable,
  spawnAfterMove,
} from "./sim";
import { chooseMove } from "./bot";

interface GameResult {
  score: number;
  maxTile: number;
  moves: number;
  reached2048: boolean;
}

const BOARD_LABELS: Record<number, string> = {
  1: "Small (7 cells)",
  2: "Medium (19 cells)",
  3: "Large (37 cells)",
  4: "XL (61 cells)",
};

const playOne = (
  radius: number,
  depth: number,
  initialTiles: number,
  spawnOnMergeOnly: boolean,
): GameResult => {
  const grid: Cell[] = createHexGrid(radius);
  initialSpawn(grid, initialTiles);
  let score = 0;
  let moves = 0;
  let reached2048 = false;

  const moveCap = 5000; // safety: prevents any pathological non-terminating run
  // Anti-pingpong: track board hashes seen since the last merge. The Small-
  // board "no spawn unless merge" rule lets the bot ping-pong between equal-
  // value heuristic positions indefinitely. If we revisit any position
  // without a merge in between, force a spawn to break the loop.
  const gridHash = (g: Cell[]) =>
    g.map((c) => `${c.x},${c.y},${c.z}:${c.value}`).join("|");
  let seenSinceMerge = new Set<string>();
  while (!isGameOver(grid) && moves < moveCap) {
    const dir = chooseMove(grid, { depth, radius });
    if (!dir) break;
    const res = applyMove(grid, dir);
    score += res.gained;
    if (res.reached2048) reached2048 = true;
    moves += 1;
    // Mirror the real-game rule (src/components/App/index.tsx):
    //   - Small board (radius 1): spawn only when the move merged OR no
    //     further merge is reachable (soft-lock guard).
    //   - Other boards: spawn every move.
    // The opt-in --spawnOnMergeOnly flag forces the small-board rule on any
    // radius for experimentation.
    const merged = res.gained > 0;
    const useSmallRule = radius === 1 || spawnOnMergeOnly;
    const hash = gridHash(grid);
    const repeated = !merged && seenSinceMerge.has(hash);
    const shouldSpawn =
      !useSmallRule || merged || !mergeReachable(grid) || repeated;
    if (merged) {
      seenSinceMerge = new Set();
    } else {
      seenSinceMerge.add(hash);
    }
    if (shouldSpawn) {
      if (!spawnAfterMove(grid, radius)) break;
      seenSinceMerge = new Set();
    }
  }

  return { score, maxTile: maxTile(grid), moves, reached2048 };
};

const main = () => {
  const args = process.argv.slice(2);
  const getArg = (name: string, def: number) => {
    const i = args.indexOf(`--${name}`);
    return i >= 0 ? Number(args[i + 1]) : def;
  };
  const games = getArg("games", 100);
  const radius = getArg("radius", 1);
  // Bigger boards have more empties → chance fanout is bigger → use shallower
  // default depth so a run finishes in reasonable time. Override with --depth.
  const defaultDepth = radius <= 1 ? 4 : radius === 2 ? 3 : 2;
  const depth = getArg("depth", defaultDepth);
  const initialTiles = getArg("initial", 3);
  const spawnOnMergeOnly = args.includes("--spawnOnMergeOnly");

  if (!BOARD_LABELS[radius]) {
    console.error(`Invalid --radius ${radius}. Must be 1, 2, 3, or 4.`);
    process.exit(1);
  }

  const ruleNote =
    radius === 1
      ? "spawn-on-merge-or-soft-lock (real game)"
      : spawnOnMergeOnly
        ? "spawn-on-merge-only (forced)"
        : "spawn-every-move";
  console.log(
    `Running ${games} games on ${BOARD_LABELS[radius]} at depth ${depth}, initial tiles ${initialTiles}, rule: ${ruleNote}...`,
  );
  const results: GameResult[] = [];
  const t0 = Date.now();
  for (let i = 0; i < games; i++) {
    results.push(playOne(radius, depth, initialTiles, spawnOnMergeOnly));
    if ((i + 1) % 10 === 0) {
      process.stdout.write(`  ${i + 1}/${games}\r`);
    }
  }
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);

  const dist: Record<number, number> = {};
  let totalScore = 0;
  let totalMoves = 0;
  let wins = 0;
  for (const r of results) {
    dist[r.maxTile] = (dist[r.maxTile] ?? 0) + 1;
    totalScore += r.score;
    totalMoves += r.moves;
    if (r.reached2048) wins += 1;
  }

  console.log(`\nDone in ${elapsed}s.`);
  console.log(`Average score : ${(totalScore / games).toFixed(1)}`);
  console.log(`Average moves : ${(totalMoves / games).toFixed(1)}`);
  console.log(`Wins (>=2048) : ${wins}/${games}`);
  console.log(`Max-tile distribution:`);
  const tiles = Object.keys(dist)
    .map(Number)
    .sort((a, b) => a - b);
  for (const t of tiles) {
    const n = dist[t];
    const pct = ((n / games) * 100).toFixed(1).padStart(5);
    const bar = "#".repeat(Math.round((n / games) * 40));
    console.log(`  ${String(t).padStart(5)} : ${String(n).padStart(4)} (${pct}%) ${bar}`);
  }
};

main();
