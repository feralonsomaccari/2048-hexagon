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
import { MAX_DOUBLE_BY_RADIUS, MAX_FREEZE_BY_RADIUS, MAX_REMOVE_BY_RADIUS, MAX_SWAP_BY_RADIUS, MAX_UNDO_BY_RADIUS, UNUSED_POWER_UP_BONUS_RATE } from "../../config/gameConfig";

const MOVE_KEYS = ["q", "w", "e", "a", "s", "d"];

const RADIUS_1 = 1;
const WIN_SCORE = 2048;

// Total power-up charges available on radius 1, derived from config so toggling
// any power-up on or off in gameConfig keeps these expectations correct.
const fullPowerUpBudget = (): number =>
  (MAX_UNDO_BY_RADIUS[RADIUS_1] ?? 0) +
  (MAX_REMOVE_BY_RADIUS[RADIUS_1] ?? 0) +
  (MAX_SWAP_BY_RADIUS[RADIUS_1] ?? 0) +
  (MAX_FREEZE_BY_RADIUS[RADIUS_1] ?? 0) +
  (MAX_DOUBLE_BY_RADIUS[RADIUS_1] ?? 0);

const bonusFor = (unusedCharges: number): number =>
  Math.round(WIN_SCORE * UNUSED_POWER_UP_BONUS_RATE * unusedCharges);

const remainingUndos = () => {
  const badge = screen.queryByTestId("power-up-undo-charges");
  return badge ? Number(badge.textContent) : 0;
};

const makeAnyValidMove = async () => {
  for (const key of MOVE_KEYS) {
    fireEvent.keyDown(document, { key });
    try {
      await waitFor(
        () => {
          expect(screen.getByTestId("power-up-undo")).not.toBeDisabled();
        },
        { timeout: 400 }
      );
      return;
    } catch {

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
    const newgameBtn = screen.getByTestId("power-up-newGame");
    fireEvent.click(newgameBtn);
    const newGameMenu = screen.getByTestId("new-game");
    expect(newGameMenu).toBeInTheDocument();
  });

  it("should hide New Game Modal", () => {
    render(<App />);
    const newgameButton = screen.getByTestId("power-up-newGame");
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

  // The undo power-up only exists on radius-1 boards, but the app defaults to
  // radius 2 (no power-ups). Pin lastRadius to 1 and render a fresh module so
  // the undo tile mounts.
  describe("undo budget", () => {
    beforeEach(() => {
      localStorage.clear();
      localStorage.setItem("lastRadius", String(RADIUS_1));
    });

    afterEach(() => {
      cleanup();
      localStorage.clear();
    });

    it("should start with 3 remaining undos shown on the power-up", async () => {
      await renderFreshApp();
      await waitFor(() => {
        expect(remainingUndos()).toBe(3);
      });
    });

    it("should keep the undo power-up disabled before any move is made", async () => {
      await renderFreshApp();
      await waitFor(() => {
        expect(screen.getByTestId("power-up-undo")).toBeInTheDocument();
      });
      expect(screen.getByTestId("power-up-undo")).toBeDisabled();
    });

    it("should decrement the counter after each undo and lock at 0", async () => {
      await renderFreshApp();
      await waitFor(() => {
        expect(screen.getByTestId("power-up-undo")).toBeInTheDocument();
      });

      const totalUndos = MAX_UNDO_BY_RADIUS[RADIUS_1];
      for (let used = 0; used < totalUndos; used += 1) {
        await makeAnyValidMove();
        expect(remainingUndos()).toBe(totalUndos - used);

        await act(async () => {
          fireEvent.click(screen.getByTestId("power-up-undo"));
        });

        await waitFor(() => {
          expect(remainingUndos()).toBe(totalUndos - used - 1);
        });
      }

      expect(remainingUndos()).toBe(0);

      try {
        await makeAnyValidMove();
        throw new Error("Expected no undo to become available after all undos consumed");
      } catch (err) {
        expect((err as Error).message).toMatch(/No movement direction enabled undo/);
      }

      expect(screen.getByTestId("power-up-undo")).toBeDisabled();
    });
  });
});

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

const winningPairTileSet = (): gridElement[] => [
  { x: 0, y: 0, z: 0, value: 1024, id: 1 },
  { x: 0, y: -1, z: 1, value: 1024, id: 2 },
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

  it("dismisses the overlay when the player chooses Keep Playing", async () => {

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

  it("awards the power-up bonus in the win overlay when no power-up was used", async () => {

    const unused = fullPowerUpBudget();
    const bonus = bonusFor(unused);
    seedSavedGame({ isWin: false, hasKeptPlaying: false, undoCount: 0 });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });

    const breakdown = screen.getByTestId("score-breakdown");
    expect(breakdown).toHaveTextContent(String(WIN_SCORE));
    expect(breakdown).toHaveTextContent(`+${bonus}`);

    expect(screen.getByTestId("high-score-prompt")).toHaveTextContent(String(WIN_SCORE + bonus));
  });

  it("awards a partial bonus scaled to the power-ups left unused", async () => {

    const unused = fullPowerUpBudget() - 1;
    const bonus = bonusFor(unused);
    seedSavedGame({ isWin: false, hasKeptPlaying: false, undoCount: 1 });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });

    const breakdown = screen.getByTestId("score-breakdown");
    expect(breakdown).toHaveTextContent(String(WIN_SCORE));
    expect(breakdown).toHaveTextContent(`+${bonus}`);
    expect(screen.getByTestId("high-score-prompt")).toHaveTextContent(String(WIN_SCORE + bonus));
  });

  it("awards no bonus once all power-ups are used", async () => {

    seedSavedGame({
      isWin: false,
      hasKeptPlaying: false,
      undoCount: 3,
      removeCount: 2,
      swapCount: 2,
      freezeCount: 2,
      doubleCount: 2,
    });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("score-breakdown")).not.toBeInTheDocument();

    expect(screen.getByTestId("high-score-prompt")).toHaveTextContent("2048");
  });


  it("tracks the live raw score in My Best during play (no bonus mid-game)", async () => {

    seedSavedGame({ isWin: false, hasKeptPlaying: true, undoCount: 0 });
    await renderFreshApp();

    expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" });
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Score: 2048")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("My Best: 2048")).toBeInTheDocument();
  });

  it("syncs header Score and My Best to the bonus-adjusted final score at win", async () => {

    const finalScore = WIN_SCORE + bonusFor(fullPowerUpBudget());
    seedSavedGame({ isWin: false, hasKeptPlaying: false, undoCount: 0 });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });

    expect(screen.getByLabelText(`Score: ${finalScore}`)).toBeInTheDocument();
    expect(screen.getByLabelText(`My Best: ${finalScore}`)).toBeInTheDocument();
  });

  it("keeps the banked bonus in the header Score after Keep Playing", async () => {

    const finalScore = WIN_SCORE + bonusFor(fullPowerUpBudget());
    seedSavedGame({ isWin: false, hasKeptPlaying: false, undoCount: 0 });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });
    expect(screen.getByLabelText(`Score: ${finalScore}`)).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByText("Keep Playing"));
    });

    await waitFor(() => {
      expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();
    });

    expect(screen.getByLabelText(`Score: ${finalScore}`)).toBeInTheDocument();
    expect(screen.getByLabelText(`My Best: ${finalScore}`)).toBeInTheDocument();
  });

  it("keeps the banked bonus fixed even when an undo is used after Keep Playing", async () => {

    const bonus = bonusFor(fullPowerUpBudget());
    seedSavedGame({ isWin: false, hasKeptPlaying: false, undoCount: 0 });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" });
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

    await act(async () => {
      fireEvent.click(screen.getByTestId("power-up-undo"));
    });
    await waitFor(() => {
      expect(screen.getByLabelText(`Score: ${bonus}`)).toBeInTheDocument();
    });
  });

  it("does not show the win overlay again after Keep Playing when another winning tile is formed", async () => {

    seedSavedGame({ isWin: false, hasKeptPlaying: true });
    await renderFreshApp();

    expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" });
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();
  });
});

const FREEZE_CHARGES = MAX_FREEZE_BY_RADIUS[RADIUS_1];
const DOUBLE_CHARGES = MAX_DOUBLE_BY_RADIUS[RADIUS_1];

const distinctTileSet = (): gridElement[] => [
  { x: -1, y: 1, z: 0, value: 2, id: 21 },
  { x: 0, y: 1, z: -1, value: 4, id: 22 },
  { x: 1, y: 0, z: -1, value: 8, id: 23 },
];

describe("<App/> freeze power-up", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("stays disabled before the first move", async () => {
    seedSavedGame({ tileSet: distinctTileSet(), hasKeptPlaying: true, movesCount: 0 });
    await renderFreshApp();

    await waitFor(() => {
      expect(screen.getByTestId("power-up-freeze")).toBeInTheDocument();
    });
    expect(screen.getByTestId("power-up-freeze")).toBeDisabled();
  });

  it("arms without consuming a charge", async () => {
    seedSavedGame({ tileSet: distinctTileSet(), hasKeptPlaying: true, movesCount: 1 });
    await renderFreshApp();

    await waitFor(() => {
      expect(screen.getByTestId("power-up-freeze")).not.toBeDisabled();
    });
    expect(screen.getByTestId("power-up-freeze-charges")).toHaveTextContent(String(FREEZE_CHARGES));

    await act(async () => {
      fireEvent.click(screen.getByTestId("power-up-freeze"));
    });
    expect(screen.getByTestId("power-up-freeze")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("power-up-freeze-charges")).toHaveTextContent(String(FREEZE_CHARGES));
  });

  it("consumes a charge on the next move and spawns no new tile", async () => {
    seedSavedGame({ tileSet: distinctTileSet(), hasKeptPlaying: true, movesCount: 1 });
    await renderFreshApp();

    await waitFor(() => {
      expect(screen.getAllByTestId("tile")).toHaveLength(3);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("power-up-freeze"));
    });
    expect(screen.getByTestId("power-up-freeze")).toHaveAttribute("aria-pressed", "true");

    for (const key of MOVE_KEYS) {
      await act(async () => {
        fireEvent.keyDown(document, { key });
      });
      if (screen.getByTestId("power-up-freeze").getAttribute("aria-pressed") === "false") break;
    }

    await waitFor(() => {
      expect(screen.getByTestId("power-up-freeze-charges")).toHaveTextContent(String(FREEZE_CHARGES - 1));
    });
    expect(screen.getByTestId("power-up-freeze")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getAllByTestId("tile").length).toBeLessThanOrEqual(3);
  });

  it("disarms with Escape without consuming a charge", async () => {
    seedSavedGame({ tileSet: distinctTileSet(), hasKeptPlaying: true, movesCount: 1 });
    await renderFreshApp();

    await waitFor(() => {
      expect(screen.getByTestId("power-up-freeze")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("power-up-freeze"));
    });
    expect(screen.getByTestId("power-up-freeze")).toHaveAttribute("aria-pressed", "true");

    await act(async () => {
      fireEvent.keyDown(document, { key: "Escape" });
    });

    expect(screen.getByTestId("power-up-freeze")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("power-up-freeze-charges")).toHaveTextContent(String(FREEZE_CHARGES));
  });
});

describe("<App/> double power-up", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("doubles a tapped tile and decrements the remaining charges", async () => {
    seedSavedGame({ tileSet: distinctTileSet(), hasKeptPlaying: true, movesCount: 1 });
    await renderFreshApp();

    await waitFor(() => {
      expect(screen.getAllByTestId("tile")).toHaveLength(3);
    });

    expect(screen.getByTestId("power-up-double-charges")).toHaveTextContent(String(DOUBLE_CHARGES));

    await act(async () => {
      fireEvent.click(screen.getByTestId("power-up-double"));
    });
    expect(screen.getByTestId("power-up-double")).toHaveAttribute("aria-pressed", "true");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Double tile 8" }));
    });

    await waitFor(() => {
      expect(screen.getByTestId("power-up-double-charges")).toHaveTextContent(String(DOUBLE_CHARGES - 1));
    });
    expect(screen.getByRole("img", { name: "Tile 16" })).toBeInTheDocument();
    expect(screen.getByTestId("power-up-double")).toHaveAttribute("aria-pressed", "false");
  });

  it("does not expose tiles of value >= 1024 as double targets", async () => {
    const tileSet: gridElement[] = [
      { x: -1, y: 1, z: 0, value: 256, id: 31 },
      { x: 0, y: 1, z: -1, value: 1024, id: 32 },
    ];
    seedSavedGame({ tileSet, hasKeptPlaying: true, movesCount: 1 });
    await renderFreshApp();

    await waitFor(() => {
      expect(screen.getAllByTestId("tile")).toHaveLength(2);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("power-up-double"));
    });

    expect(screen.getAllByRole("button", { name: /Double tile/ })).toHaveLength(1);
    expect(screen.getByRole("img", { name: "Tile 1024" })).toBeInTheDocument();
  });

  it("disables the double power-up when no tile is <= 512", async () => {
    const tileSet: gridElement[] = [
      { x: -1, y: 1, z: 0, value: 1024, id: 41 },
      { x: 0, y: 1, z: -1, value: 2048, id: 42 },
    ];
    seedSavedGame({ tileSet, hasKeptPlaying: true, movesCount: 1 });
    await renderFreshApp();

    await waitFor(() => {
      expect(screen.getByTestId("power-up-double")).toBeInTheDocument();
    });
    expect(screen.getByTestId("power-up-double")).toBeDisabled();
  });

  it("cancels double mode with Escape without consuming a charge", async () => {
    seedSavedGame({ tileSet: distinctTileSet(), hasKeptPlaying: true, movesCount: 1 });
    await renderFreshApp();

    await waitFor(() => {
      expect(screen.getByTestId("power-up-double")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("power-up-double"));
    });
    expect(screen.getByTestId("power-up-double")).toHaveAttribute("aria-pressed", "true");

    await act(async () => {
      fireEvent.keyDown(document, { key: "Escape" });
    });

    expect(screen.getByTestId("power-up-double")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByTestId("power-up-double-charges")).toHaveTextContent(String(DOUBLE_CHARGES));
  });
});
