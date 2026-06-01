import { describe, expect, it } from "vitest";
import {
  ACHIEVEMENTS,
  ALL_ACHIEVEMENTS,
  AchievementContext,
  COMPLETIONIST,
  isCompletionistEarned,
} from "./achievements";

const baseCtx: AchievementContext = {
  radius: 2,
  bestTile: 0,
  finalScore: 0,
  movesCount: 0,
  isWin: false,
  hasKeptPlaying: false,
  usedAnyPowerUp: false,
  maxComboThisMove: 0,
  maxMergeStreak: 0,
  revivedThisRun: false,
};

const find = (id: string) => ALL_ACHIEVEMENTS.find((a) => a.id === id)!;

describe("achievement checks", () => {
  it("has unique ids", () => {
    const ids = ALL_ACHIEVEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("tile achievements are board-specific", () => {
    const smallWin = find("tile-r1-512");
    const defaultMid = find("tile-r2-1024");

    expect(smallWin.check({ ...baseCtx, radius: 1, bestTile: 512 })).toBe(true);
    expect(smallWin.check({ ...baseCtx, radius: 2, bestTile: 512 })).toBe(false);

    expect(defaultMid.check({ ...baseCtx, radius: 2, bestTile: 1024 })).toBe(true);
    expect(defaultMid.check({ ...baseCtx, radius: 1, bestTile: 1024 })).toBe(false);
  });

  it("unlocks lower tile milestones when a higher tile is reached", () => {
    const ctx = { ...baseCtx, radius: 2, bestTile: 2048 };
    expect(find("tile-r2-1024").check(ctx)).toBe(true);
    expect(find("tile-r2-2048").check(ctx)).toBe(true);
    expect(find("tile-r2-4096").check(ctx)).toBe(false);
  });

  it("score achievements use finalScore", () => {
    expect(find("score-5000").check({ ...baseCtx, finalScore: 5000 })).toBe(true);
    expect(find("score-5000").check({ ...baseCtx, finalScore: 4999 })).toBe(false);
    expect(find("score-20000").check({ ...baseCtx, finalScore: 20000 })).toBe(true);
  });

  it("combo and streak track peaks", () => {
    expect(find("combo-3").check({ ...baseCtx, maxComboThisMove: 4 })).toBe(true);
    expect(find("combo-3").check({ ...baseCtx, maxComboThisMove: 3 })).toBe(false);
    expect(find("streak-8").check({ ...baseCtx, maxMergeStreak: 12 })).toBe(true);
    expect(find("streak-8").check({ ...baseCtx, maxMergeStreak: 11 })).toBe(false);
    expect(find("streak-16").check({ ...baseCtx, maxMergeStreak: 16 })).toBe(true);
    expect(find("streak-16").check({ ...baseCtx, maxMergeStreak: 15 })).toBe(false);
  });

  it("purist requires a win with no power-ups", () => {
    expect(find("purist").check({ ...baseCtx, isWin: true, usedAnyPowerUp: false })).toBe(true);
    expect(find("purist").check({ ...baseCtx, isWin: true, usedAnyPowerUp: true })).toBe(false);
    expect(find("purist").check({ ...baseCtx, isWin: false, usedAnyPowerUp: false })).toBe(false);
  });

  it("clutch requires a win after reviving", () => {
    expect(find("clutch").check({ ...baseCtx, isWin: true, revivedThisRun: true })).toBe(true);
    expect(find("clutch").check({ ...baseCtx, isWin: true, revivedThisRun: false })).toBe(false);
  });
});

describe("completionist", () => {
  it("its own check never returns true on game state alone", () => {
    expect(COMPLETIONIST.check(baseCtx)).toBe(false);
  });

  it("is earned only when every other achievement is unlocked", () => {
    const allButOne = new Set(ACHIEVEMENTS.map((a) => a.id));
    allButOne.delete(ACHIEVEMENTS[0].id);
    expect(isCompletionistEarned(allButOne)).toBe(false);

    const all = new Set(ACHIEVEMENTS.map((a) => a.id));
    expect(isCompletionistEarned(all)).toBe(true);
  });
});
