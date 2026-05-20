import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const setDocMock = vi.fn();
const getDocMock = vi.fn();
const getDocsMock = vi.fn();
const getDbMock = vi.fn();

vi.mock("firebase/firestore", () => ({
  setDoc: (...args: unknown[]) => setDocMock(...args),
  getDoc: (...args: unknown[]) => getDocMock(...args),
  getDocs: (...args: unknown[]) => getDocsMock(...args),
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

beforeEach(() => {
  localStorage.clear();
  setDocMock.mockReset();
  getDocMock.mockReset();
  getDocsMock.mockReset();
  getDbMock.mockReset();
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

  it("does not call Firestore on mount", () => {
    renderHook(() => useRemoteHighScores());
    expect(getDocsMock).not.toHaveBeenCalled();
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
    getDocsMock.mockResolvedValue(makeSnapshot([]));
  });

  it("reports isRemote=true and fetches all four boards on mount", async () => {
    const { result } = renderHook(() => useRemoteHighScores());
    expect(result.current.isRemote).toBe(true);
    await waitFor(() => {
      expect(getDocsMock).toHaveBeenCalledTimes(4);
    });
  });

  it("populates scores from the initial fetch", async () => {
    getDocsMock.mockImplementation((q: { args: unknown[] }) => {
      const whereClause = (q.args as Array<{ value?: number }>).find((a) => a && "value" in a);
      const radius = whereClause?.value;
      if (radius === 2) return Promise.resolve(makeSnapshot([{ name: "Top", score: 999 }]));
      return Promise.resolve(makeSnapshot([]));
    });
    const { result } = renderHook(() => useRemoteHighScores());
    await waitFor(() => {
      expect(result.current.scores[2]?.[0]?.name).toBe("Top");
    });
  });

  it("submit writes a new doc when no entry exists for that name+board", async () => {
    getDocMock.mockResolvedValue({ exists: () => false, data: () => ({}) });
    setDocMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRemoteHighScores());
    await waitFor(() => expect(getDocsMock).toHaveBeenCalledTimes(4));

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
    await waitFor(() => expect(getDocsMock).toHaveBeenCalledTimes(4));

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
    await waitFor(() => expect(getDocsMock).toHaveBeenCalledTimes(4));

    await act(async () => {
      await result.current.submit(1, 500, "Alice");
    });

    expect(setDocMock).not.toHaveBeenCalled();
  });

  it("submit normalizes the doc id to lowercase so name casing collapses", async () => {
    getDocMock.mockResolvedValue({ exists: () => false, data: () => ({}) });
    setDocMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useRemoteHighScores());
    await waitFor(() => expect(getDocsMock).toHaveBeenCalledTimes(4));

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
    await waitFor(() => expect(getDocsMock).toHaveBeenCalledTimes(4));

    let returned;
    await act(async () => {
      returned = await result.current.submit(1, 500, "Alice");
    });

    expect(returned).toBeNull();
    await waitFor(() => {
      expect(result.current.error?.message).toBe("permission-denied");
    });
  });
});

describe("useRemoteHighScores — input validation", () => {
  beforeEach(() => {
    getDbMock.mockReturnValue({ __db: true });
    getDocsMock.mockResolvedValue(makeSnapshot([]));
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
    await waitFor(() => expect(getDocsMock).toHaveBeenCalledTimes(4));

    let returned;
    await act(async () => {
      returned = await result.current.submit(1, score, name);
    });
    expect(returned).toBeNull();
    expect(setDocMock).not.toHaveBeenCalled();
  });

  it("trims and caps name length at 16 characters", async () => {
    const { result } = renderHook(() => useRemoteHighScores());
    await waitFor(() => expect(getDocsMock).toHaveBeenCalledTimes(4));

    let returned: { name: string; score: number; date: string } | null = null;
    await act(async () => {
      returned = await result.current.submit(1, 100, "  ThisNameIsWayTooLongForOurLimit  ");
    });
    expect(returned!.name).toBe("ThisNameIsWayToo");
    expect(returned!.name.length).toBe(16);
  });
});
