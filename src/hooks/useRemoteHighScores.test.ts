import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const setDocMock = vi.fn();
const getDocMock = vi.fn();
const getDbMock = vi.fn();

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
  setDoc: (...args: unknown[]) => setDocMock(...args),
  getDoc: (...args: unknown[]) => getDocMock(...args),
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
  getDb: () => getDbMock(),
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

const emitInitialEmptySnapshots = () => {
  // Fires every registered listener with an empty snapshot so initial loading resolves.
  act(() => {
    listeners.forEach((l) => l.onNext(makeSnapshot([])));
  });
};

beforeEach(() => {
  localStorage.clear();
  setDocMock.mockReset();
  getDocMock.mockReset();
  getDbMock.mockReset();
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
    getDbMock.mockReturnValue(null);
  });

  it("reports isRemote=false and returns empty scores initially", () => {
    const { result } = renderHook(() => useRemoteHighScores());
    expect(result.current.isRemote).toBe(false);
    expect(result.current.scores).toEqual({});
  });

  it("does not register any Firestore listeners", () => {
    renderHook(() => useRemoteHighScores());
    expect(onSnapshotMock).not.toHaveBeenCalled();
  });

  it("submit returns null when no Firestore is configured", async () => {
    const { result } = renderHook(() => useRemoteHighScores());
    let returned;
    await act(async () => {
      returned = await result.current.submit(1, 500, "Alice");
    });
    expect(returned).toBeNull();
    expect(setDocMock).not.toHaveBeenCalled();
  });

  it("clears any stale localStorage highScores key on mount", () => {
    localStorage.setItem("highScores", JSON.stringify({ 1: [{ name: "old", score: 1 }] }));
    renderHook(() => useRemoteHighScores());
    expect(localStorage.getItem("highScores")).toBeNull();
  });
});

describe("useRemoteHighScores — Firebase configured", () => {
  beforeEach(() => {
    getDbMock.mockReturnValue({ __db: true });
  });

  it("registers one listener per board on mount", () => {
    renderHook(() => useRemoteHighScores());
    expect(onSnapshotMock).toHaveBeenCalledTimes(4);
    expect(listeners.map((l) => l.radius).sort()).toEqual([1, 2, 3, 4]);
  });

  it("populates scores when snapshots arrive", async () => {
    const { result } = renderHook(() => useRemoteHighScores());
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
    emitInitialEmptySnapshots();
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it("submit writes a new doc when no entry exists for that name+board", async () => {
    getDocMock.mockResolvedValue({ exists: () => false, data: () => ({}) });
    setDocMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRemoteHighScores());
    emitInitialEmptySnapshots();

    await act(async () => {
      await result.current.submit(1, 500, "Alice");
    });

    expect(getDocMock).toHaveBeenCalledTimes(1);
    const docRef = getDocMock.mock.calls[0][0];
    expect(docRef).toMatchObject({ coll: "highScores", id: "1_alice" });
    expect(setDocMock).toHaveBeenCalledTimes(1);
    const [, payload] = setDocMock.mock.calls[0];
    expect(payload).toMatchObject({ name: "Alice", score: 500, boardRadius: 1 });
  });

  it("submit overwrites the existing doc when the new score is higher", async () => {
    getDocMock.mockResolvedValue({ exists: () => true, data: () => ({ score: 300 }) });
    setDocMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRemoteHighScores());
    emitInitialEmptySnapshots();

    await act(async () => {
      await result.current.submit(1, 500, "Alice");
    });

    expect(setDocMock).toHaveBeenCalledTimes(1);
    const [, payload] = setDocMock.mock.calls[0];
    expect(payload.score).toBe(500);
  });

  it("submit skips writing when the existing score is higher", async () => {
    getDocMock.mockResolvedValue({ exists: () => true, data: () => ({ score: 800 }) });
    const { result } = renderHook(() => useRemoteHighScores());
    emitInitialEmptySnapshots();

    await act(async () => {
      await result.current.submit(1, 500, "Alice");
    });

    expect(setDocMock).not.toHaveBeenCalled();
  });

  it("submit normalizes the doc id to lowercase so name casing collapses", async () => {
    getDocMock.mockResolvedValue({ exists: () => false, data: () => ({}) });
    setDocMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRemoteHighScores());
    emitInitialEmptySnapshots();

    await act(async () => {
      await result.current.submit(2, 100, "PePe");
    });

    expect(getDocMock.mock.calls[0][0]).toMatchObject({ id: "2_pepe" });
    const [, payload] = setDocMock.mock.calls[0];
    expect(payload.name).toBe("PePe");
  });

  it("submit captures Firestore errors and returns null", async () => {
    getDocMock.mockResolvedValue({ exists: () => false, data: () => ({}) });
    setDocMock.mockRejectedValue(new Error("permission-denied"));
    const { result } = renderHook(() => useRemoteHighScores());
    emitInitialEmptySnapshots();

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
    act(() => {
      listeners.find((l) => l.radius === 1)?.onError(new Error("listener-failed"));
    });
    await waitFor(() => {
      expect(result.current.error?.message).toBe("listener-failed");
    });
  });

  it("unregisters all listeners on unmount", () => {
    const { unmount } = renderHook(() => useRemoteHighScores());
    expect(listeners).toHaveLength(4);
    unmount();
    expect(listeners).toHaveLength(0);
  });

  it("applies live updates pushed after the initial snapshot", async () => {
    const { result } = renderHook(() => useRemoteHighScores());
    emitInitialEmptySnapshots();

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
    getDbMock.mockReturnValue({ __db: true });
    getDocMock.mockResolvedValue({ exists: () => false, data: () => ({}) });
    setDocMock.mockResolvedValue(undefined);
  });

  it.each([
    { name: "", score: 100, reason: "empty name" },
    { name: "   ", score: 100, reason: "whitespace-only name" },
    { name: "Alice", score: 0, reason: "zero score" },
    { name: "Alice", score: -5, reason: "negative score" },
    { name: "Alice", score: 10_000_001, reason: "above sanity cap" },
  ])("rejects $reason", async ({ name, score }) => {
    const { result } = renderHook(() => useRemoteHighScores());
    emitInitialEmptySnapshots();

    let returned;
    await act(async () => {
      returned = await result.current.submit(1, score, name);
    });
    expect(returned).toBeNull();
    expect(setDocMock).not.toHaveBeenCalled();
  });

  it("trims and caps name length at 16 characters", async () => {
    const { result } = renderHook(() => useRemoteHighScores());
    emitInitialEmptySnapshots();

    let returned: { name: string; score: number; date: string } | null = null;
    await act(async () => {
      returned = await result.current.submit(1, 100, "  ThisNameIsWayTooLongForOurLimit  ");
    });
    expect(returned!.name).toBe("ThisNameIsWayToo");
    expect(returned!.name.length).toBe(16);
  });
});
