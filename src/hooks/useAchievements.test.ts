import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import useAchievements from "./useAchievements";
import { AchievementContext, ACHIEVEMENTS } from "../config/achievements";

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

describe("useAchievements", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("unlocks a newly earned achievement and queues a toast", () => {
    const { result } = renderHook(() => useAchievements());

    act(() => result.current.evaluate({ ...baseCtx, radius: 2, bestTile: 256 }));

    expect(result.current.unlockedIds.has("tile-r2-256")).toBe(true);
    expect(result.current.queue.some((a) => a.id === "tile-r2-256")).toBe(true);
  });

  it("does not re-queue an already unlocked achievement", () => {
    const { result } = renderHook(() => useAchievements());

    act(() => result.current.evaluate({ ...baseCtx, bestTile: 256 }));
    act(() => result.current.dismissToast("tile-r2-256"));
    act(() => result.current.evaluate({ ...baseCtx, bestTile: 256 }));

    expect(result.current.queue.length).toBe(0);
  });

  it("awards completionist once all others are unlocked", () => {
    const { result } = renderHook(() => useAchievements());

    act(() =>
      result.current.evaluate({
        ...baseCtx,
        radius: 1,
        bestTile: 8192,
        finalScore: 20000,
        isWin: true,
        revivedThisRun: true,
        maxComboThisMove: 3,
        maxMergeStreak: 8,
      })
    );
    act(() =>
      result.current.evaluate({
        ...baseCtx,
        radius: 2,
        bestTile: 8192,
        finalScore: 20000,
        isWin: true,
        revivedThisRun: true,
        maxComboThisMove: 3,
        maxMergeStreak: 8,
      })
    );

    ACHIEVEMENTS.forEach((a) => expect(result.current.unlockedIds.has(a.id)).toBe(true));
    expect(result.current.unlockedIds.has("completionist")).toBe(true);
  });

  it("persists unlocks across mounts", () => {
    const first = renderHook(() => useAchievements());
    act(() => first.result.current.evaluate({ ...baseCtx, bestTile: 256 }));

    const second = renderHook(() => useAchievements());
    expect(second.result.current.unlockedIds.has("tile-r2-256")).toBe(true);
  });
});
