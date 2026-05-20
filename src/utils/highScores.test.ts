import { describe, it, expect } from "vitest";
import {
  HighScores,
  MAX_ENTRIES_PER_BOARD,
  insertHighScore,
  qualifiesForHighScore,
} from "./highScores";

const makeEntry = (name: string, score: number) => ({
  name,
  score,
  date: "2026-01-01T00:00:00.000Z",
});

const fillBoard = (radius: number, scoresList: number[]): HighScores => ({
  [radius]: scoresList.map((s, i) => makeEntry(`p${i}`, s)),
});

describe("qualifiesForHighScore", () => {
  it("returns false for non-positive scores", () => {
    expect(qualifiesForHighScore({}, 1, 0)).toBe(false);
    expect(qualifiesForHighScore({}, 1, -10)).toBe(false);
  });

  it("returns true when the board has empty slots", () => {
    expect(qualifiesForHighScore({}, 1, 100)).toBe(true);
    const partial = fillBoard(1, [200, 150]);
    expect(qualifiesForHighScore(partial, 1, 10)).toBe(true);
  });

  it("returns true when score beats the lowest entry on a full board", () => {
    const full = fillBoard(2, [500, 400, 300, 200, 100]);
    expect(qualifiesForHighScore(full, 2, 101)).toBe(true);
  });

  it("returns false when score equals the lowest entry on a full board", () => {
    const full = fillBoard(2, [500, 400, 300, 200, 100]);
    expect(qualifiesForHighScore(full, 2, 100)).toBe(false);
  });

  it("returns false when score is below the lowest entry on a full board", () => {
    const full = fillBoard(2, [500, 400, 300, 200, 100]);
    expect(qualifiesForHighScore(full, 2, 50)).toBe(false);
  });

  it("treats different boards independently", () => {
    const scores = fillBoard(1, [500, 400, 300, 200, 100]);
    expect(qualifiesForHighScore(scores, 1, 50)).toBe(false);
    expect(qualifiesForHighScore(scores, 2, 50)).toBe(true);
  });
});

describe("insertHighScore", () => {
  it("inserts into an empty board", () => {
    const result = insertHighScore({}, 1, makeEntry("a", 100));
    expect(result[1]).toHaveLength(1);
    expect(result[1][0].name).toBe("a");
  });

  it("keeps entries sorted in descending order by score", () => {
    let scores: HighScores = {};
    scores = insertHighScore(scores, 1, makeEntry("a", 100));
    scores = insertHighScore(scores, 1, makeEntry("b", 300));
    scores = insertHighScore(scores, 1, makeEntry("c", 200));
    expect(scores[1].map((e) => e.score)).toEqual([300, 200, 100]);
  });

  it("caps the list at MAX_ENTRIES_PER_BOARD", () => {
    let scores: HighScores = {};
    for (let i = 1; i <= MAX_ENTRIES_PER_BOARD + 3; i += 1) {
      scores = insertHighScore(scores, 1, makeEntry(`p${i}`, i * 10));
    }
    expect(scores[1]).toHaveLength(MAX_ENTRIES_PER_BOARD);
    expect(scores[1][0].score).toBe((MAX_ENTRIES_PER_BOARD + 3) * 10);
  });

  it("drops the lowest entry when a new score beats it on a full board", () => {
    let scores = fillBoard(1, [400, 300, 200, 100]);
    scores = insertHighScore(scores, 1, makeEntry("new", 250));
    expect(scores[1]).toHaveLength(MAX_ENTRIES_PER_BOARD);
    expect(scores[1][0].score).toBe(400);
    expect(scores[1].at(-1)!.score).toBe(200);
    expect(scores[1].some((e) => e.score === 100)).toBe(false);
  });

  it("does not mutate the original scores object", () => {
    const original = fillBoard(1, [100]);
    const snapshot = JSON.stringify(original);
    insertHighScore(original, 1, makeEntry("new", 200));
    expect(JSON.stringify(original)).toBe(snapshot);
  });

  it("preserves entries on other boards", () => {
    const scores = {
      ...fillBoard(1, [100]),
      ...fillBoard(2, [500]),
    };
    const result = insertHighScore(scores, 1, makeEntry("new", 200));
    expect(result[2]).toEqual(scores[2]);
  });
});
