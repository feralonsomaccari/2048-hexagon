import { useEffect, useRef } from "react";

export type HexDirection =
  | "north"
  | "northEast"
  | "southEast"
  | "south"
  | "southWest"
  | "northWest";

const DIRECTIONS: HexDirection[] = [
  "southEast",
  "south",
  "southWest",
  "northWest",
  "north",
  "northEast",
];

const MIN_SWIPE_DISTANCE = 24;
const MAX_AXIS_DEVIATION_DEG = 25;

const classify = (dx: number, dy: number): HexDirection | null => {
  if (Math.hypot(dx, dy) < MIN_SWIPE_DISTANCE) return null;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const normalized = (angle + 360) % 360;
  const wedge = Math.floor(normalized / 60);
  const wedgeCenter = wedge * 60 + 30;
  const fromCenter = Math.abs(((normalized - wedgeCenter + 540) % 360) - 180);
  if (fromCenter > MAX_AXIS_DEVIATION_DEG) return null;
  return DIRECTIONS[wedge];
};

const useSwipe = (
  targetRef: React.RefObject<HTMLElement>,
  onSwipe: (direction: HexDirection) => void
) => {
  const handlerRef = useRef(onSwipe);
  handlerRef.current = onSwipe;

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    let startX = 0;
    let startY = 0;
    let activePointerId: number | null = null;

    const onPointerDown = (e: PointerEvent) => {
      if (activePointerId !== null) return;
      activePointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId) return;
      activePointerId = null;
      const direction = classify(e.clientX - startX, e.clientY - startY);
      if (direction) handlerRef.current(direction);
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId) return;
      activePointerId = null;
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerCancel);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [targetRef]);
};

export default useSwipe;
