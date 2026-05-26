export type HighScoreEntry = {
  name: string;
  score: number;
  date: string;
  /** Number of undos the player used during the run. Optional for legacy entries. */
  undosUsed?: number;
  /** Extra points earned from chained merges (combos). Optional for legacy entries. */
  comboBonus?: number;
  /** Bonus points earned for leaving undos unused. Optional for legacy entries. */
  noUndoBonus?: number;
};

export type HighScores = Record<string, HighScoreEntry[]>;

import { LEADERBOARD_SIZE } from "../config/gameConfig";

export const MAX_ENTRIES_PER_BOARD = LEADERBOARD_SIZE;

export const BOARD_LABELS: Record<number, string> = {
  1: "Small",
  2: "Normal",
  3: "Large",
  4: "XL",
};

export const qualifiesForHighScore = (
  scores: HighScores,
  radius: number,
  score: number
): boolean => {
  if (score <= 0) return false;
  const list = scores[radius] ?? [];
  if (list.length < MAX_ENTRIES_PER_BOARD) return true;
  return score > list[list.length - 1].score;
};

export const insertHighScore = (
  scores: HighScores,
  radius: number,
  entry: HighScoreEntry
): HighScores => {
  const list = scores[radius] ?? [];
  const next = [...list, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ENTRIES_PER_BOARD);
  return { ...scores, [radius]: next };
};
