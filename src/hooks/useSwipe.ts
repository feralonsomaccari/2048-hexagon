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

const classify = (dx: number, dy: number): HexDirection | null => {
  if (Math.hypot(dx, dy) < MIN_SWIPE_DISTANCE) return null;
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const index = Math.floor(((angle + 30 + 360) % 360) / 60);
  return DIRECTIONS[index];
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
    let tracking = false;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      tracking = true;
      startX = e.clientX;
      startY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!tracking) return;
      if (Math.hypot(e.clientX - startX, e.clientY - startY) > 10) {
        e.preventDefault();
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!tracking) return;
      tracking = false;
      const direction = classify(e.clientX - startX, e.clientY - startY);
      if (direction) handlerRef.current(direction);
    };

    const onPointerCancel = () => {
      tracking = false;
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerCancel);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [targetRef]);
};

export default useSwipe;
