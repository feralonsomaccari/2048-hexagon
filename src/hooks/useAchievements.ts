import { useCallback, useMemo, useRef, useState } from "react";
import useLocalStorage from "./useLocalStorage";
import {
  Achievement,
  AchievementContext,
  ACHIEVEMENTS,
  COMPLETIONIST,
  isCompletionistEarned,
} from "../config/achievements";

type UnlockedMap = Record<string, number>;

const useAchievements = () => {
  const [unlocked, setUnlocked] = useLocalStorage<UnlockedMap>("achievements", {});
  const [queue, setQueue] = useState<Achievement[]>([]);
  const unlockedRef = useRef(unlocked);
  unlockedRef.current = unlocked;

  const evaluate = useCallback((ctx: AchievementContext) => {
    const current = unlockedRef.current;
    const newlyEarned = ACHIEVEMENTS.filter((a) => !current[a.id] && a.check(ctx));

    const earnedIds = new Set<string>([
      ...Object.keys(current),
      ...newlyEarned.map((a) => a.id),
    ]);

    let completionistJustEarned = false;
    if (!current[COMPLETIONIST.id] && isCompletionistEarned(earnedIds)) {
      completionistJustEarned = true;
    }

    if (!newlyEarned.length && !completionistJustEarned) return;

    const now = Date.now();
    setUnlocked((prev) => {
      const next = { ...prev };
      newlyEarned.forEach((a) => {
        if (!next[a.id]) next[a.id] = now;
      });
      if (completionistJustEarned && !next[COMPLETIONIST.id]) {
        next[COMPLETIONIST.id] = now;
      }
      return next;
    });

    const toShow = completionistJustEarned ? [...newlyEarned, COMPLETIONIST] : newlyEarned;
    setQueue((prev) => [...prev, ...toShow]);
  }, [setUnlocked]);

  const dismissToast = useCallback((id: string) => {
    setQueue((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const unlockedIds = useMemo(() => new Set(Object.keys(unlocked)), [unlocked]);

  return { unlockedIds, evaluate, queue, dismissToast };
};

export default useAchievements;
