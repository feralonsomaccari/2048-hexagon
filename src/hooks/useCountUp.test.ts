import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useCountUp from "./useCountUp";

describe("useCountUp", () => {
  beforeEach(() => {
    window.matchMedia = (query: string) =>
      ({ matches: false, media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false }) as MediaQueryList;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts at the initial target", () => {
    const { result } = renderHook(({ t }) => useCountUp(t), { initialProps: { t: 100 } });
    expect(result.current).toBe(100);
  });

  it("animates upward toward a new target and lands exactly on it", async () => {
    let now = 0;
    vi.spyOn(performance, "now").mockImplementation(() => now);
    const frames: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      frames.push(cb);
      return frames.length;
    });

    const { result, rerender } = renderHook(({ t }) => useCountUp(t, 400), { initialProps: { t: 0 } });
    rerender({ t: 1000 });

    now = 200;
    act(() => frames.shift()?.(now));
    expect(result.current).toBeGreaterThan(0);
    expect(result.current).toBeLessThan(1000);

    now = 400;
    act(() => frames.shift()?.(now));
    expect(result.current).toBe(1000);
  });

  it("snaps instantly when the target decreases", () => {
    const { result, rerender } = renderHook(({ t }) => useCountUp(t, 400), { initialProps: { t: 500 } });
    act(() => rerender({ t: 120 }));
    expect(result.current).toBe(120);
  });

  it("jumps straight to the target when reduced motion is preferred", () => {
    window.matchMedia = (query: string) =>
      ({ matches: query.includes("prefers-reduced-motion"), media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false }) as MediaQueryList;
    const { result, rerender } = renderHook(({ t }) => useCountUp(t, 400), { initialProps: { t: 0 } });
    act(() => rerender({ t: 800 }));
    expect(result.current).toBe(800);
  });
});
