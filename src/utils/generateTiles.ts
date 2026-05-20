type Point = { x: number; y: number; z: number };

const minusToPlusN = (n: number, f: (i: number) => void): void => {
  Array.from({ length: n * 2 + 1 }, (_, x) => n - x).forEach(f);
};

const getFieldPoints = (radius: number): Point[] => {
  const points: Point[] = [];
  minusToPlusN(radius - 1, (x) =>
    minusToPlusN(radius - 1, (y) =>
      minusToPlusN(radius - 1, (z) => x + y + z === 0 && points.push({ x, y, z }))
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

const fourProbabilityByRadius: Record<number, number> = { 2: 0.1, 3: 0.12, 4: 0.14, 5: 0.16 };
const doubleSpawnProbabilityByRadius: Record<number, number> = { 2: 0, 3: 0.15, 4: 0.3, 5: 0.45 };

export function getRNGPoints(radius: number, userPoints: Point[] = []): (Point & { value: number })[] {
  const availablePositions = getFieldPoints(radius).filter((a) =>
    userPoints.every((b) => !arePointsSame(a, b))
  );
  const fourProbability = fourProbabilityByRadius[radius] ?? 0.1;
  const doubleSpawnProbability = doubleSpawnProbabilityByRadius[radius] ?? 0;
  const spawnCount = 1 + (Math.random() < doubleSpawnProbability ? 1 : 0);
  const pointsCount = Math.min(
    availablePositions.length,
    userPoints.length === 0 ? 3 : spawnCount
  );
  const selectedValue = userPoints.length === 0 ? 2 : Math.random() < 1 - fourProbability ? 2 : 4;
  return pickRandomN(availablePositions, pointsCount).map((p) => ({ ...p, value: selectedValue }));
}
