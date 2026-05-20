import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
  act,
} from "@testing-library/react";
import { vi } from "vitest";

vi.mock("../../services/firebase", () => ({
  getDb: () => null,
}));

vi.mock("firebase/firestore", () => ({
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
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
    it("should start with 3 remaining undos shown on the button", async () => {
      render(<App />);
      await waitFor(() => {
        expect(screen.getByTestId("undo-btn")).toHaveTextContent("Undo (3)");
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

      for (let used = 0; used < 3; used += 1) {
        await makeAnyValidMove();
        expect(screen.getByTestId("undo-btn")).toHaveTextContent(`Undo (${3 - used})`);

        await act(async () => {
          fireEvent.click(screen.getByTestId("undo-btn"));
        });

        await waitFor(() => {
          expect(screen.getByTestId("undo-btn")).toHaveTextContent(`Undo (${3 - used - 1})`);
        });
      }

      expect(screen.getByTestId("undo-btn")).toHaveTextContent("Undo (0)");

      try {
        await makeAnyValidMove();
        throw new Error("Expected no undo to become available after 3 undos consumed");
      } catch (err) {
        expect((err as Error).message).toMatch(/No movement direction enabled undo/);
      }

      expect(screen.getByTestId("undo-btn")).toBeDisabled();
    });
  });
});
