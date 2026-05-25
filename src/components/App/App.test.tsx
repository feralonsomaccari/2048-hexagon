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
        expect(screen.getByTestId("undo-btn")).toHaveTextContent("Undo (1)");
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
        expect(screen.getByTestId("undo-btn")).toHaveTextContent(`Undo (${1 - used})`);

        await act(async () => {
          fireEvent.click(screen.getByTestId("undo-btn"));
        });

        await waitFor(() => {
          expect(screen.getByTestId("undo-btn")).toHaveTextContent(`Undo (${1 - used - 1})`);
        });
      }

      expect(screen.getByTestId("undo-btn")).toHaveTextContent("Undo (0)");

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
