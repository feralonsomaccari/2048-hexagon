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

export function getRNGPoints(radius: number, userPoints: Point[] = []): (Point & { value: number })[] {
  const availablePositions = getFieldPoints(radius).filter((a) =>
    userPoints.every((b) => !arePointsSame(a, b))
  );
  const pointsCount = Math.min(
    availablePositions.length,
    userPoints.length === 0 ? 3 : 1 + (Math.random() > 0.8 ? 1 : 0)
  );
  const selectedValue = userPoints.length === 0 ? 2 : Math.random() > 0.5 ? 2 : 4;
  return pickRandomN(availablePositions, pointsCount).map((p) => ({ ...p, value: selectedValue }));
}
