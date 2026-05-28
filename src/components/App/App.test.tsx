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

  describe("undo budget", () => {
    it("should start with 1 remaining undo shown on the power-up", async () => {
      render(<App />);
      await waitFor(() => {
        expect(remainingUndos()).toBe(1);
      });
    });

    it("should keep the undo power-up disabled before any move is made", async () => {
      render(<App />);
      await waitFor(() => {
        expect(screen.getByTestId("power-up-undo")).toBeInTheDocument();
      });
      expect(screen.getByTestId("power-up-undo")).toBeDisabled();
    });

    it("should decrement the counter after each undo and lock at 0", async () => {
      render(<App />);
      await waitFor(() => {
        expect(screen.getByTestId("power-up-undo")).toBeInTheDocument();
      });

      for (let used = 0; used < 1; used += 1) {
        await makeAnyValidMove();
        expect(remainingUndos()).toBe(1 - used);

        await act(async () => {
          fireEvent.click(screen.getByTestId("power-up-undo"));
        });

        await waitFor(() => {
          expect(remainingUndos()).toBe(1 - used - 1);
        });
      }

      expect(remainingUndos()).toBe(0);

      try {
        await makeAnyValidMove();
        throw new Error("Expected no undo to become available after 1 undo consumed");
      } catch (err) {
        expect((err as Error).message).toMatch(/No movement direction enabled undo/);
      }

      expect(screen.getByTestId("power-up-undo")).toBeDisabled();
    });
  });
});

const RADIUS_1 = 1;

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

  it("awards the no-undo bonus in the win overlay when no undo was used", async () => {

    seedSavedGame({ isWin: false, hasKeptPlaying: false, undoCount: 0 });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });

    const breakdown = screen.getByTestId("score-breakdown");
    expect(breakdown).toHaveTextContent("512");
    expect(breakdown).toHaveTextContent("+154");

    expect(screen.getByTestId("high-score-prompt")).toHaveTextContent("666");
  });

  it("awards a partial bonus scaled to the undos left unused", async () => {

    seedSavedGame({ isWin: false, hasKeptPlaying: false, undoCount: 1 });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" });
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

    seedSavedGame({ isWin: false, hasKeptPlaying: false, undoCount: 3 });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });

    expect(screen.queryByTestId("score-breakdown")).not.toBeInTheDocument();

    expect(screen.getByTestId("high-score-prompt")).toHaveTextContent("512");
  });

  it("breaks out the combo bonus earned from chained merges", async () => {

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
      fireEvent.keyDown(document, { key: "w" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });

    const breakdown = screen.getByTestId("score-breakdown");
    expect(breakdown).toHaveTextContent("Combo bonus");
    expect(breakdown).toHaveTextContent("+512");
    expect(breakdown).toHaveTextContent("1024");

    expect(screen.getByTestId("high-score-prompt")).toHaveTextContent("1536");
  });

  it("tracks the live raw score in My Best during play (no bonus mid-game)", async () => {

    seedSavedGame({ isWin: false, hasKeptPlaying: true, undoCount: 0 });
    await renderFreshApp();

    expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" });
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Score: 512")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("My Best: 512")).toBeInTheDocument();
  });

  it("syncs header Score and My Best to the bonus-adjusted final score at win", async () => {

    seedSavedGame({ isWin: false, hasKeptPlaying: false, undoCount: 0 });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" });
    });

    await waitFor(() => {
      expect(screen.getByTestId("overlay")).toBeInTheDocument();
    });

    expect(screen.getByLabelText("Score: 666")).toBeInTheDocument();
    expect(screen.getByLabelText("My Best: 666")).toBeInTheDocument();
  });

  it("keeps the banked bonus in the header Score after Keep Playing", async () => {

    seedSavedGame({ isWin: false, hasKeptPlaying: false, undoCount: 0 });
    await renderFreshApp();

    await act(async () => {
      fireEvent.keyDown(document, { key: "w" });
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

    expect(screen.getByLabelText("Score: 666")).toBeInTheDocument();
    expect(screen.getByLabelText("My Best: 666")).toBeInTheDocument();
  });

  it("keeps the banked bonus fixed even when an undo is used after Keep Playing", async () => {

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
      expect(screen.getByLabelText("Score: 154")).toBeInTheDocument();
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

const threeTileSet = (): gridElement[] => [
  { x: 0, y: 0, z: 0, value: 2, id: 11 },
  { x: 1, y: 0, z: -1, value: 4, id: 12 },
  { x: -1, y: 1, z: 0, value: 8, id: 13 },
];

describe("<App/> remove-tile power-up", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("removes a tapped tile and decrements the remaining charges", async () => {
    seedSavedGame({ tileSet: threeTileSet(), hasKeptPlaying: true });
    await renderFreshApp();

    await waitFor(() => {
      expect(screen.getAllByTestId("tile")).toHaveLength(3);
    });

    expect(screen.getByTestId("power-up-removeTile-charges")).toHaveTextContent("2");

    await act(async () => {
      fireEvent.click(screen.getByTestId("power-up-removeTile"));
    });
    expect(screen.getByTestId("power-up-removeTile")).toHaveAttribute("aria-pressed", "true");

    await act(async () => {
      fireEvent.click(screen.getAllByRole("button", { name: /Remove tile/ })[0]);
    });

    await waitFor(() => {
      expect(screen.getAllByTestId("tile")).toHaveLength(2);
    });
    expect(screen.getByTestId("power-up-removeTile-charges")).toHaveTextContent("1");
    expect(screen.getByTestId("power-up-removeTile")).toHaveAttribute("aria-pressed", "false");
  });

  it("cancels remove mode with Escape without consuming a charge", async () => {
    seedSavedGame({ tileSet: threeTileSet(), hasKeptPlaying: true });
    await renderFreshApp();

    await waitFor(() => {
      expect(screen.getAllByTestId("tile")).toHaveLength(3);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("power-up-removeTile"));
    });
    expect(screen.getByTestId("power-up-removeTile")).toHaveAttribute("aria-pressed", "true");

    await act(async () => {
      fireEvent.keyDown(document, { key: "Escape" });
    });

    expect(screen.getByTestId("power-up-removeTile")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getAllByTestId("tile")).toHaveLength(3);
    expect(screen.getByTestId("power-up-removeTile-charges")).toHaveTextContent("2");
  });

  it("toggles remove mode off when the power-up is clicked again", async () => {
    seedSavedGame({ tileSet: threeTileSet(), hasKeptPlaying: true });
    await renderFreshApp();

    await waitFor(() => {
      expect(screen.getAllByTestId("tile")).toHaveLength(3);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId("power-up-removeTile"));
    });
    expect(screen.getByTestId("power-up-removeTile")).toHaveAttribute("aria-pressed", "true");

    await act(async () => {
      fireEvent.click(screen.getByTestId("power-up-removeTile"));
    });
    expect(screen.getByTestId("power-up-removeTile")).toHaveAttribute("aria-pressed", "false");
    expect(screen.getAllByTestId("tile")).toHaveLength(3);
  });
});
