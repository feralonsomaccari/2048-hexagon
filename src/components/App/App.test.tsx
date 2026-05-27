import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  act,
} from "@testing-library/react";
import { vi, beforeEach, afterEach } from "vitest";

vi.mock("../../services/firebase", () => ({
  getDb: async () => null,
  isFirebaseConfigured: () => false,
}));

vi.mock("firebase/firestore", () => ({
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  onSnapshot: vi.fn(() => () => {}),
  collection: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  serverTimestamp: vi.fn(),
}));

import { App } from ".";

const MOVE_KEYS = ["q", "w", "e", "a", "s", "d"];

// Count the filled undo pips currently rendered on the undo button.
const filledPips = () =>
  screen.queryByTestId("undo-pips")?.querySelectorAll('[data-pip="filled"]').length ?? 0;

const makeAnyValidMove = async () => {
  for (const key of MOVE_KEYS) {
    fireEvent.keyDown(document, { key });
    try {
      await waitFor(
        () => {
          expect(screen.getByTestId("undo-btn")).not.toBeDisabled();
        },
        { timeout: 400 }
      );
      return;
    } catch {
      // try the next direction
    }
  }
  throw new Error("No movement direction enabled undo from the starting board");
};

describe("<App/>", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render New Game Modal", () => {
    render(<App />);
    const newgameBtn = screen.getByTestId("new-game-btn");
    fireEvent.click(newgameBtn);
    const newGameMenu = screen.getByTestId("new-game");
    expect(newGameMenu).toBeInTheDocument();
  });

  it("should hide New Game Modal", () => {
    render(<App />);
    const newgameButton = screen.getByTestId("new-game-btn");
    fireEvent.click(newgameButton);
    const closBtn = screen.getByTestId("close-btn");
    const newGameMenu = screen.getByTestId("new-game");
    fireEvent.click(closBtn);
    expect(newGameMenu).not.toBeInTheDocument();
  });

  it("should render initial tiles", async () => {
    await waitFor(() => {
      render(<App />);
      const tiles = screen.getAllByTestId("tile");
      expect(tiles.length).toBeGreaterThan(0);
    });
  });

  describe("undo budget", () => {
    it("should start with 1 remaining undo shown on the button", async () => {
      render(<App />);
      await waitFor(() => {
        expect(filledPips()).toBe(1);
      });
    });

    it("should keep the undo button disabled before any move is made", async () => {
      render(<App />);
      await waitFor(() => {
        expect(screen.getByTestId("undo-btn")).toBeInTheDocument();
      });
      expect(screen.getByTestId("undo-btn")).toBeDisabled();
    });

    it("should decrement the counter after each undo and lock at 0", async () => {
      render(<App />);
      await waitFor(() => {
        expect(screen.getByTestId("undo-btn")).toBeInTheDocument();
      });

      for (let used = 0; used < 1; used += 1) {
        await makeAnyValidMove();
        expect(filledPips()).toBe(1 - used);

        await act(async () => {
          fireEvent.click(screen.getByTestId("undo-btn"));
        });

        await waitFor(() => {
          expect(filledPips()).toBe(1 - used - 1);
        });
      }

      expect(filledPips()).toBe(0);

      try {
        await makeAnyValidMove();
        throw new Error("Expected no undo to become available after 1 undo consumed");
      } catch (err) {
        expect((err as Error).message).toMatch(/No movement direction enabled undo/);
      }

      expect(screen.getByTestId("undo-btn")).toBeDisabled();
    });
  });
});

// ── Win overlay / "Keep Playing" ────────────────────────────────────────────
// Radius 1 (Small) wins at 512, only ever spawns single 2-tiles, and has no
// blocked cells — which makes a merge into the winning tile fully deterministic.
const RADIUS_1 = 1;
const WIN_VALUE = 512;

// The seven cells of a radius-1 hex grid (x + y + z === 0).
const RADIUS_1_CELLS: Array<[number, number, number]> = [
  [0, 0, 0],
  [0, 1, -1],
  [0, -1, 1],
  [1, 0, -1],
  [1, -1, 0],
  [-1, 0, 1],
  [-1, 1, 0],
];

const buildRadius1Grid = (): gridElement[] =>
  RADIUS_1_CELLS.map(([x, y, z]) => ({ x, y, z, value: 0 }));

// Two 256 tiles aligned on the "north" axis: the tile at (0,-1,1) moves north
// into (0,0,0), merging the pair into 512.
const winningPairTileSet = (): gridElement[] => [
  { x: 0, y: 0, z: 0, value: 256, id: 1 },
  { x: 0, y: -1, z: 1, value: 256, id: 2 },
];

const seedSavedGame = (overrides: Partial<savedGame>): void => {
  const tileSet = overrides.tileSet ?? winningPairTileSet();
  const saved: savedGame = {
    tileSet,
    grid: buildRadius1Grid(),
    score: 0,
    radius: RADIUS_1,
    historyTileSet: tileSet,
    historyScore: 0,
    undoCount: 0,
    isUndoAvailable: false,
    isMaxUndo: false,
    isWin: false,
    hasKeptPlaying: false,
    ...overrides,
  };
  localStorage.setItem("savedGame", JSON.stringify(saved));
  localStorage.setItem("lastRadius", String(RADIUS_1));
};

// `initialSavedGame` is captured at module-load time, so each test seeds
// localStorage and then imports a fresh copy of <App/>.
const renderFreshApp = async () => {
  vi.resetModules();
  const { App: FreshApp } = await import(".");
  return render(<FreshApp />);
};

describe("<App/> win overlay", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("shows the win overlay when a tile first reaches the winning value", async () => {
    seedSavedGame({ isWin: false, hasKeptPlaying: false });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" }); // north: merges the 256 pair into 512
    });

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toHaveTextContent(`You reached ${WIN_VALUE}!`);
    });
    expect(screen.getByText("Keep Playing")).toBeInTheDocument();
  });

  it("dismisses the overlay when the player chooses Keep Playing", async () => {
    // Start already won so the overlay is on screen at mount.
    seedSavedGame({ isWin: true, hasKeptPlaying: false });
    await renderFreshApp();

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Keep Playing"));
    });

    await waitFor(() => {
      expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();
    });
  });

  it("awards the no-undo bonus in the win overlay when no undo was used", async () => {
    // Radius 1 allows 3 undos (MAX_UNDO_BY_RADIUS[1] = 3), so the bonus scales
    // to 3 × 10%. Merging the 256 pair scores 512; with 0 undos the bonus is
    // round(512 * 0.1 * 3) = 154, for a final score of 666.
    seedSavedGame({ isWin: false, hasKeptPlaying: false, undoCount: 0 });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" }); // merges the 256 pair into 512
    });

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });

    const breakdown = screen.getByTestId("score-breakdown");
    expect(breakdown).toHaveTextContent("512");
    expect(breakdown).toHaveTextContent("+154");
    // Empty leaderboard => the high-score prompt renders and shows the
    // bonus-adjusted final score (512 + 154 = 666) as the value being submitted.
    expect(screen.getByTestId("high-score-prompt")).toHaveTextContent("666");
  });

  it("awards a partial bonus scaled to the undos left unused", async () => {
    // Radius 1 has 3 undos; using 1 leaves 2 unused → bonus = round(512*0.1*2)
    // = 102, for a final score of 614.
    seedSavedGame({ isWin: false, hasKeptPlaying: false, undoCount: 1 });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" }); // merges the 256 pair into 512
    });

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });

    const breakdown = screen.getByTestId("score-breakdown");
    expect(breakdown).toHaveTextContent("512");
    expect(breakdown).toHaveTextContent("+102");
    expect(screen.getByTestId("high-score-prompt")).toHaveTextContent("614");
  });

  it("awards no bonus once all undos are used", async () => {
    // Radius 1 has 3 undos; using all 3 leaves 0 unused → no bonus, raw score.
    seedSavedGame({ isWin: false, hasKeptPlaying: false, undoCount: 3 });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" }); // merges the 256 pair into 512
    });

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("score-breakdown")).not.toBeInTheDocument();
    // No bonus: the prompt shows the raw score (512) unchanged.
    expect(screen.getByTestId("high-score-prompt")).toHaveTextContent("512");
  });

  it("breaks out the combo bonus earned from chained merges", async () => {
    // Two 256 pairs aligned on the north axis (x=1 and x=-1 columns) both merge
    // to 512 in a single "north" move. The first merge scores 512 (×1) and the
    // second 1024 (×2) — so the raw score is 1536, of which 512 is the combo
    // bonus and 1024 the base merge points. undoCount=3 zeroes the no-undo bonus
    // so the breakdown isolates the combo line. The first 512 also wins, opening
    // the overlay.
    const comboPairs: gridElement[] = [
      { x: 1, y: 0, z: -1, value: 256, id: 1 },
      { x: 1, y: -1, z: 0, value: 256, id: 2 },
      { x: -1, y: 1, z: 0, value: 256, id: 3 },
      { x: -1, y: 0, z: 1, value: 256, id: 4 },
    ];
    seedSavedGame({
      tileSet: comboPairs,
      historyTileSet: comboPairs,
      isWin: false,
      hasKeptPlaying: false,
      undoCount: 3,
    });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" }); // north: merges both 256 pairs
    });

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });

    const breakdown = screen.getByTestId("score-breakdown");
    expect(breakdown).toHaveTextContent("Combo bonus");
    expect(breakdown).toHaveTextContent("+512"); // combo bonus
    expect(breakdown).toHaveTextContent("1024"); // base merge points
    // Final score = 1024 base + 512 combo = 1536 (no no-undo bonus).
    expect(screen.getByTestId("high-score-prompt")).toHaveTextContent("1536");
  });

  // ── Header "Score" / "My Best" sync ─────────────────────────────────────
  // The header Score and My Best components expose an aria-label of
  // `${title}: ${value}`, which uniquely targets the header (the overlay's
  // breakdown uses separate testids), so we query them by label text.

  it("tracks the live raw score in My Best during play (no bonus mid-game)", async () => {
    // A saved game one merge short of winning, with an existing best below the
    // score we are about to reach. Radius 1 has 3 undos; mid-play the bonus must
    // NOT be applied, so both Score and My Best should read the raw 512.
    seedSavedGame({ isWin: false, hasKeptPlaying: true, undoCount: 0 });
    await renderFreshApp();

    expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" }); // merges the 256 pair into 512
    });

    // hasKeptPlaying: true keeps the win overlay suppressed, so the game is
    // still "in play" — the raw score (512), not the bonus-adjusted 666.
    await waitFor(() => {
      expect(screen.getByLabelText("Score: 512")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("My Best: 512")).toBeInTheDocument();
  });

  it("syncs header Score and My Best to the bonus-adjusted final score at win", async () => {
    // 0 undos used on radius 1 → bonus round(512 * 0.1 * 3) = 154, final 666.
    seedSavedGame({ isWin: false, hasKeptPlaying: false, undoCount: 0 });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" }); // merges the 256 pair into 512
    });

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });

    // With the overlay up, both header values jump to the final score and match.
    expect(screen.getByLabelText("Score: 666")).toBeInTheDocument();
    expect(screen.getByLabelText("My Best: 666")).toBeInTheDocument();
  });

  it("pops only the raw move gain (not the bonus) when the win applies the bonus", async () => {
    // The "+N gained" pop animation must reflect the raw merge points (512),
    // NOT the bonus-inflated jump in the displayed total. Regression guard for
    // the bonus leaking into the gain animation as a fake +154-style pop.
    seedSavedGame({ isWin: false, hasKeptPlaying: false, undoCount: 0 });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" }); // merges the 256 pair into 512
    });

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });

    // The header Score shows 666 (with bonus) but the gain pop is the raw +512.
    const headerScore = screen.getByLabelText("Score: 666");
    expect(headerScore).toHaveAttribute("data-value", "+512");
  });

  it("keeps the banked bonus in the header Score after Keep Playing", async () => {
    // Win first (final 666 = raw 512 + banked 154), then keep playing: the
    // bonus stays banked, so the header Score remains 666 (not the raw 512) and
    // My Best holds the same 666.
    seedSavedGame({ isWin: false, hasKeptPlaying: false, undoCount: 0 });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" }); // merges the 256 pair into 512
    });

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Score: 666")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText("Keep Playing"));
    });

    await waitFor(() => {
      expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();
    });
    // Bonus stays banked: header Score and My Best both remain at 666.
    expect(screen.getByLabelText("Score: 666")).toBeInTheDocument();
    expect(screen.getByLabelText("My Best: 666")).toBeInTheDocument();
  });

  it("keeps the banked bonus fixed even when an undo is used after Keep Playing", async () => {
    // Win with 0 undos → banked bonus 154, final 666. After Keep Playing, using
    // an undo must NOT shrink the banked bonus: the score reverts to the raw
    // pre-win value (0 here) but the +154 stays, so the header reads 154.
    seedSavedGame({ isWin: false, hasKeptPlaying: false, undoCount: 0 });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" }); // merges the 256 pair into 512
    });
    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Keep Playing"));
    });
    await waitFor(() => {
      expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();
    });

    // historyScore was 0 (captured before the winning move), so undo reverts the
    // raw score to 0; the banked 154 remains → header Score 154.
    await act(async () => {
      fireEvent.click(screen.getByTestId("undo-btn"));
    });
    await waitFor(() => {
      expect(screen.getByLabelText("Score: 154")).toBeInTheDocument();
    });
  });

  it("does not show the win overlay again after Keep Playing when another winning tile is formed", async () => {
    // hasKeptPlaying: true represents a game where the player already won once
    // and chose to keep playing. Forming another 512 must NOT re-trigger the overlay.
    seedSavedGame({ isWin: false, hasKeptPlaying: true });
    await renderFreshApp();

    expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" }); // merges another 256 pair into 512
    });

    // Give the win-detection path time to run; the overlay must stay hidden.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();
  });
});
