import { useEffect, useRef, useState } from "react";

const easeOut = (t: number): number => 1 - Math.pow(1 - t, 3);

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const useCountUp = (target: number, durationMs = 400): number => {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  const frameRef = useRef<number | null>(null);

  displayRef.current = display;

  useEffect(() => {
    const from = displayRef.current;

    if (target <= from || prefersReducedMotion() || typeof requestAnimationFrame !== "function") {
      setDisplay(target);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setDisplay(Math.round(from + (target - from) * easeOut(t)));
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        frameRef.current = null;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [target, durationMs]);

  return display;
};

export default useCountUp;
