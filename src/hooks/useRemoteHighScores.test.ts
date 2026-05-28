import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const addDocMock = vi.fn();
const getDbMock = vi.fn();
const isConfiguredMock = vi.fn();

type Listener = {
  radius: number;
  onNext: (snap: { docs: Array<{ data: () => unknown }> }) => void;
  onError: (err: Error) => void;
};

const listeners: Listener[] = [];

const onSnapshotMock = vi.fn(
  (
    q: { args: Array<{ value?: number }> },
    onNext: Listener["onNext"],
    onError: Listener["onError"]
  ) => {
    const whereClause = q.args.find((a) => a && typeof a === "object" && "value" in a);
    const radius = whereClause?.value as number;
    listeners.push({ radius, onNext, onError });
    return () => {
      const idx = listeners.findIndex((l) => l.onNext === onNext);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }
);

vi.mock("firebase/firestore", () => ({
  addDoc: (...args: unknown[]) => addDocMock(...args),
  onSnapshot: (...args: unknown[]) =>
    onSnapshotMock(args[0] as never, args[1] as never, args[2] as never),
  collection: (_db: unknown, name: string) => ({ name }),
  doc: (_db: unknown, coll: string, id: string) => ({ coll, id }),
  query: (...args: unknown[]) => ({ args }),
  where: (field: string, op: string, value: unknown) => ({ field, op, value }),
  orderBy: (field: string, dir: string) => ({ field, dir }),
  limit: (n: number) => ({ limit: n }),
  serverTimestamp: () => ({ __serverTimestamp: true }),
}));

vi.mock("../services/firebase", () => ({
  getDb: async () => getDbMock(),
  isFirebaseConfigured: () => isConfiguredMock(),
}));

import useRemoteHighScores from "./useRemoteHighScores";

const makeSnapshot = (docs: Array<{ name: string; score: number }>) => ({
  docs: docs.map((d) => ({
    data: () => ({
      name: d.name,
      score: d.score,
      createdAt: { toDate: () => new Date("2026-01-01T00:00:00Z") },
    }),
  })),
});

const waitForListeners = (count = 4) =>
  waitFor(() => expect(listeners).toHaveLength(count));

const emitInitialEmptySnapshots = async () => {

  await waitForListeners();
  act(() => {
    listeners.forEach((l) => l.onNext(makeSnapshot([])));
  });
};

beforeEach(() => {
  localStorage.clear();
  addDocMock.mockReset();
  getDbMock.mockReset();
  isConfiguredMock.mockReset();
  onSnapshotMock.mockClear();
  listeners.length = 0;
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useRemoteHighScores — no Firebase configured", () => {
  beforeEach(() => {
    isConfiguredMock.mockReturnValue(false);
    getDbMock.mockReturnValue(null);
  });

  it("reports isRemote=false and returns empty scores initially", () => {
    const { result } = renderHook(() => useRemoteHighScores());
    expect(result.current.isRemote).toBe(false);
    expect(result.current.scores).toEqual({});
  });

  it("does not register any Firestore listeners", async () => {
    renderHook(() => useRemoteHighScores());
    await Promise.resolve();
    expect(onSnapshotMock).not.toHaveBeenCalled();
  });

  it("submit returns null when no Firestore is configured", async () => {
    const { result } = renderHook(() => useRemoteHighScores());
    let returned;
    await act(async () => {
      returned = await result.current.submit(1, 500, "Alice");
    });
    expect(returned).toBeNull();
    expect(addDocMock).not.toHaveBeenCalled();
  });

  it("clears any stale localStorage highScores key on mount", () => {
    localStorage.setItem("highScores", JSON.stringify({ 1: [{ name: "old", score: 1 }] }));
    renderHook(() => useRemoteHighScores());
    expect(localStorage.getItem("highScores")).toBeNull();
  });
});

describe("useRemoteHighScores — Firebase configured", () => {
  beforeEach(() => {
    isConfiguredMock.mockReturnValue(true);
    getDbMock.mockReturnValue({ __db: true });
  });

  it("registers one listener per board on mount", async () => {
    renderHook(() => useRemoteHighScores());
    await waitForListeners();
    expect(onSnapshotMock).toHaveBeenCalledTimes(4);
    expect(listeners.map((l) => l.radius).sort()).toEqual([1, 2, 3, 4]);
  });

  it("populates scores when snapshots arrive", async () => {
    const { result } = renderHook(() => useRemoteHighScores());
    await waitForListeners();
    act(() => {
      listeners
        .find((l) => l.radius === 2)
        ?.onNext(makeSnapshot([{ name: "Top", score: 999 }]));
    });
    await waitFor(() => {
      expect(result.current.scores[2]?.[0]?.name).toBe("Top");
    });
  });

  it("clears isLoading once every board has emitted its first snapshot", async () => {
    const { result } = renderHook(() => useRemoteHighScores());
    expect(result.current.isLoading).toBe(true);
    await emitInitialEmptySnapshots();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("submit adds a new doc to the collection", async () => {
    addDocMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRemoteHighScores());
    await emitInitialEmptySnapshots();

    await act(async () => {
      await result.current.submit(1, 500, "Alice");
    });

    expect(addDocMock).toHaveBeenCalledTimes(1);
    const [collRef, payload] = addDocMock.mock.calls[0];
    expect(collRef).toMatchObject({ name: "highScores" });
    expect(payload).toMatchObject({ name: "Alice", score: 500, boardRadius: 1, undosUsed: 0 });
  });

  it("submit records the number of undos used, defaulting to 0 when omitted", async () => {
    addDocMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRemoteHighScores());
    await emitInitialEmptySnapshots();

    await act(async () => {
      await result.current.submit(1, 500, "Alice", { undosUsed: 2 });
      await result.current.submit(1, 400, "Bob");
    });

    expect(addDocMock.mock.calls[0][1]).toMatchObject({ name: "Alice", undosUsed: 2 });
    expect(addDocMock.mock.calls[1][1]).toMatchObject({ name: "Bob", undosUsed: 0 });
  });

  it("submit records the combo and power-up bonuses, defaulting to 0 when omitted", async () => {
    addDocMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRemoteHighScores());
    await emitInitialEmptySnapshots();

    await act(async () => {
      await result.current.submit(1, 1536, "Alice", { comboBonus: 512, nonUsedPowerUpBonus: 0 });
      await result.current.submit(1, 400, "Bob");
    });

    expect(addDocMock.mock.calls[0][1]).toMatchObject({
      name: "Alice",
      comboBonus: 512,
      nonUsedPowerUpBonus: 0,
    });
    expect(addDocMock.mock.calls[1][1]).toMatchObject({
      name: "Bob",
      comboBonus: 0,
      nonUsedPowerUpBonus: 0,
    });
  });

  it("submit records removes and swaps used, defaulting to 0 when omitted", async () => {
    addDocMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRemoteHighScores());
    await emitInitialEmptySnapshots();

    await act(async () => {
      await result.current.submit(1, 1536, "Alice", { removesUsed: 1, swapsUsed: 2 });
      await result.current.submit(1, 400, "Bob");
    });

    expect(addDocMock.mock.calls[0][1]).toMatchObject({
      name: "Alice",
      removesUsed: 1,
      swapsUsed: 2,
    });
    expect(addDocMock.mock.calls[1][1]).toMatchObject({
      name: "Bob",
      removesUsed: 0,
      swapsUsed: 0,
    });
  });

  it("submit adds a separate doc per submission, even for a repeated name", async () => {
    addDocMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRemoteHighScores());
    await emitInitialEmptySnapshots();

    await act(async () => {
      await result.current.submit(1, 99, "Liz");
      await result.current.submit(1, 110, "Liz");
    });

    expect(addDocMock).toHaveBeenCalledTimes(2);
    expect(addDocMock.mock.calls[0][1]).toMatchObject({ name: "Liz", score: 99 });
    expect(addDocMock.mock.calls[1][1]).toMatchObject({ name: "Liz", score: 110 });
  });

  it("submit adds a doc even when the new score is lower than a prior one", async () => {
    addDocMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRemoteHighScores());
    await emitInitialEmptySnapshots();

    await act(async () => {
      await result.current.submit(1, 800, "Alice");
      await result.current.submit(1, 500, "Alice");
    });

    expect(addDocMock).toHaveBeenCalledTimes(2);
    expect(addDocMock.mock.calls[1][1]).toMatchObject({ name: "Alice", score: 500 });
  });

  it("submit preserves the name casing as entered", async () => {
    addDocMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRemoteHighScores());
    await emitInitialEmptySnapshots();

    await act(async () => {
      await result.current.submit(2, 100, "PePe");
    });

    expect(addDocMock.mock.calls[0][1]).toMatchObject({ name: "PePe" });
  });

  it("submit captures Firestore errors and returns null", async () => {
    addDocMock.mockRejectedValue(new Error("permission-denied"));
    const { result } = renderHook(() => useRemoteHighScores());
    await emitInitialEmptySnapshots();

    let returned;
    await act(async () => {
      returned = await result.current.submit(1, 500, "Alice");
    });

    expect(returned).toBeNull();
    await waitFor(() => {
      expect(result.current.error?.message).toBe("permission-denied");
    });
  });

  it("captures listener errors", async () => {
    const { result } = renderHook(() => useRemoteHighScores());
    await waitForListeners();
    act(() => {
      listeners.find((l) => l.radius === 1)?.onError(new Error("listener-failed"));
    });
    await waitFor(() => {
      expect(result.current.error?.message).toBe("listener-failed");
    });
  });

  it("unregisters all listeners on unmount", async () => {
    const { unmount } = renderHook(() => useRemoteHighScores());
    await waitForListeners();
    expect(listeners).toHaveLength(4);
    unmount();
    expect(listeners).toHaveLength(0);
  });

  it("applies live updates pushed after the initial snapshot", async () => {
    const { result } = renderHook(() => useRemoteHighScores());
    await emitInitialEmptySnapshots();

    act(() => {
      listeners
        .find((l) => l.radius === 3)
        ?.onNext(makeSnapshot([{ name: "Bob", score: 4242 }]));
    });

    await waitFor(() => {
      expect(result.current.scores[3]?.[0]).toMatchObject({ name: "Bob", score: 4242 });
    });
  });
});

describe("useRemoteHighScores — input validation", () => {
  beforeEach(() => {
    isConfiguredMock.mockReturnValue(true);
    getDbMock.mockReturnValue({ __db: true });
    addDocMock.mockResolvedValue(undefined);
  });

  it.each([
    { name: "", score: 100, reason: "empty name" },
    { name: "   ", score: 100, reason: "whitespace-only name" },
    { name: "Alice", score: 0, reason: "zero score" },
    { name: "Alice", score: -5, reason: "negative score" },
    { name: "Alice", score: 10_000_001, reason: "above sanity cap" },
  ])("rejects $reason", async ({ name, score }) => {
    const { result } = renderHook(() => useRemoteHighScores());
    await emitInitialEmptySnapshots();

    let returned;
    await act(async () => {
      returned = await result.current.submit(1, score, name);
    });
    expect(returned).toBeNull();
    expect(addDocMock).not.toHaveBeenCalled();
  });

  it("trims and caps name length at 16 characters", async () => {
    const { result } = renderHook(() => useRemoteHighScores());
    await emitInitialEmptySnapshots();

    let returned: { name: string; score: number; date: string } | null = null;
    await act(async () => {
      returned = await result.current.submit(1, 100, "  ThisNameIsWayTooLongForOurLimit  ");
    });
    expect(returned!.name).toBe("ThisNameIsWayToo");
    expect(returned!.name.length).toBe(16);
  });
});
