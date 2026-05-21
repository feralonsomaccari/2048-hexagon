import {
  DOUBLE_SPAWN_PROBABILITY_BY_RADIUS,
  FOUR_PROBABILITY_BY_RADIUS,
  STARTER_SPAWN_COUNT_BY_RADIUS,
  TRIPLE_SPAWN_PROBABILITY_BY_RADIUS,
} from "../config/gameConfig";

type Point = { x: number; y: number; z: number };

const minusToPlusN = (n: number, f: (i: number) => void): void => {
  Array.from({ length: n * 2 + 1 }, (_, x) => n - x).forEach(f);
};

const getFieldPoints = (radius: number): Point[] => {
  const points: Point[] = [];
  minusToPlusN(radius, (x) =>
    minusToPlusN(radius, (y) =>
      minusToPlusN(radius, (z) => x + y + z === 0 && points.push({ x, y, z }))
    )
  );
  return points;
};

const pickRandomN = <T>(array: T[], n: number): T[] =>
  array
    .map((a) => ({ order: Math.random(), value: a }))
    .sort((a, b) => a.order - b.order)
    .map((a) => a.value)
    .slice(0, n);

const arePointsSame = (a: Point, b: Point): boolean =>
  !["x", "y", "z"].some((v) => a[v as keyof Point] !== b[v as keyof Point]);

const pickSpawnCount = (radius: number): number => {
  const tripleProb = TRIPLE_SPAWN_PROBABILITY_BY_RADIUS[radius] ?? 0;
  const doubleProb = DOUBLE_SPAWN_PROBABILITY_BY_RADIUS[radius] ?? 0;
  const roll = Math.random();
  if (roll < tripleProb) return 3;
  if (roll < tripleProb + doubleProb) return 2;
  return 1;
};

export function getRNGPoints(
  radius: number,
  userPoints: Point[] = [],
  blockedPoints: Point[] = []
): (Point & { value: number })[] {
  const excluded = [...userPoints, ...blockedPoints];
  const availablePositions = getFieldPoints(radius).filter((a) =>
    excluded.every((b) => !arePointsSame(a, b))
  );
  const fourProbability = FOUR_PROBABILITY_BY_RADIUS[radius] ?? 0.1;
  const starterCount = STARTER_SPAWN_COUNT_BY_RADIUS[radius] ?? 3;
  const pointsCount = Math.min(
    availablePositions.length,
    userPoints.length === 0 ? starterCount : pickSpawnCount(radius)
  );
  const selectedValue = userPoints.length === 0 ? 2 : Math.random() < 1 - fourProbability ? 2 : 4;
  return pickRandomN(availablePositions, pointsCount).map((p) => ({ ...p, value: selectedValue }));
}
