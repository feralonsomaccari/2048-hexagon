import { WIN_TILE_BY_RADIUS } from "./gameConfig";

export type AchievementContext = {
  radius: number;
  bestTile: number;
  finalScore: number;
  movesCount: number;
  isWin: boolean;
  hasKeptPlaying: boolean;
  usedAnyPowerUp: boolean;
  maxComboThisMove: number;
  maxMergeStreak: number;
  revivedThisRun: boolean;
};

export type AchievementGroup = "small" | "default" | "general";

export type Achievement = {
  id: string;
  name: string;
  description: string;
  group: AchievementGroup;
  check: (ctx: AchievementContext) => boolean;
};

export const ACHIEVEMENT_GROUP_LABELS: Record<AchievementGroup, string> = {
  small: "Small board",
  default: "Default board",
  general: "General",
};

export const ACHIEVEMENT_GROUP_ORDER: AchievementGroup[] = ["small", "default", "general"];

const tileAchievement = (
  radius: number,
  group: AchievementGroup,
  tile: number,
  name: string
): Achievement => {
  const isWinTile = (WIN_TILE_BY_RADIUS[radius] ?? Infinity) === tile;
  const boardName = ACHIEVEMENT_GROUP_LABELS[group];
  return {
    id: `tile-r${radius}-${tile}`,
    name,
    description: isWinTile
      ? `Win on the ${boardName} by reaching ${tile}`
      : `Reach a ${tile} tile on the ${boardName}`,
    group,
    check: (ctx) => ctx.radius === radius && ctx.bestTile >= tile,
  };
};

export const ACHIEVEMENTS: Achievement[] = [
  tileAchievement(1, "small", 128, "First Steps"),
  tileAchievement(1, "small", 256, "Warming Up"),
  tileAchievement(1, "small", 512, "Small Champion"),
  tileAchievement(1, "small", 1024, "Beyond Small"),

  tileAchievement(2, "default", 256, "Getting Started"),
  tileAchievement(2, "default", 512, "Getting Serious"),
  tileAchievement(2, "default", 1024, "So Close"),
  tileAchievement(2, "default", 2048, "Hexagon Master"),
  tileAchievement(2, "default", 4096, "Beyond 2048"),
  tileAchievement(2, "default", 8192, "Legend"),

  {
    id: "score-5000",
    name: "Five Grand",
    description: "Score 5,000 points in a single game",
    group: "general",
    check: (ctx) => ctx.finalScore >= 5000,
  },
  {
    id: "score-20000",
    name: "Big Spender",
    description: "Score 20,000 points in a single game",
    group: "general",
    check: (ctx) => ctx.finalScore >= 20000,
  },
  {
    id: "combo-3",
    name: "Combo Artist",
    description: "Merge 3 or more pairs in a single move",
    group: "general",
    check: (ctx) => ctx.maxComboThisMove >= 3,
  },
  {
    id: "streak-8",
    name: "Unstoppable",
    description: "Merge on 8 moves in a row",
    group: "general",
    check: (ctx) => ctx.maxMergeStreak >= 8,
  },
  {
    id: "purist",
    name: "Purist",
    description: "Win a game without using any power-up",
    group: "general",
    check: (ctx) => ctx.isWin && !ctx.usedAnyPowerUp,
  },
  {
    id: "clutch",
    name: "Clutch",
    description: "Win a game after reviving from game over",
    group: "general",
    check: (ctx) => ctx.isWin && ctx.revivedThisRun,
  },
];

export const COMPLETIONIST: Achievement = {
  id: "completionist",
  name: "Completionist",
  description: "Unlock every other achievement",
  group: "general",
  check: () => false,
};

export const ALL_ACHIEVEMENTS: Achievement[] = [...ACHIEVEMENTS, COMPLETIONIST];

export const isCompletionistEarned = (unlockedIds: Set<string>): boolean =>
  ACHIEVEMENTS.every((a) => unlockedIds.has(a.id));
