import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import { tileSet, grid } from "./dummyData";
import { createHexGrid } from "../../utils/gameLogic";
import GameContainer from ".";
import useSwipe from "../../hooks/useSwipe";

const props = {
  tileSet: tileSet,
  grid: grid,
  isGameOver: false,
  isWin: false,
  radius: 1
};

describe("<GameContainer/>", () => {
  it("should render a 3 Tiles", () => {
    render(<GameContainer {...props} />);
    const gameContainerEl = screen.getAllByTestId("tile");
    expect(gameContainerEl).toHaveLength(3);
  });

  it("should render a Grid of radius 2", () => {
    const grid = createHexGrid(1) 
    render(<GameContainer {...props} grid={grid} />);
    const gameContainerEl = screen.getAllByTestId("block");
    expect(gameContainerEl).toHaveLength(7);
  });

  it("should render a Grid of radius 3", () => {
    const grid = createHexGrid(2) 
    render(<GameContainer {...props} grid={grid} />);
    const gameContainerEl = screen.getAllByTestId("block");
    expect(gameContainerEl).toHaveLength(19);
  });

  it("should render a Grid of radius 4", () => {
    const grid = createHexGrid(3) 
    render(<GameContainer {...props} grid={grid} />);
    const gameContainerEl = screen.getAllByTestId("block");
    expect(gameContainerEl).toHaveLength(37);
  });

  it("should render a Grid of radius 5", () => {
    const grid = createHexGrid(4) 
    render(<GameContainer {...props} grid={grid} />);
    const gameContainerEl = screen.getAllByTestId("block");
    expect(gameContainerEl).toHaveLength(61);
  });

  it("should render a Grid of radius 6", () => {
    const grid = createHexGrid(5) 
    render(<GameContainer {...props} grid={grid} />);
    const gameContainerEl = screen.getAllByTestId("block");
    expect(gameContainerEl).toHaveLength(91);
  });

  it("should render a Game Over overlay", () => {
    render(<GameContainer {...props} isGameOver={true} />);
    const gameContainerEl = screen.queryByTestId("overlay");
    expect(gameContainerEl).toBeInTheDocument();
  });

  it("should not render a Game Over overlay", () => {
    render(<GameContainer {...props} />);
    const gameContainerEl = screen.queryByTestId("overlay");
    expect(gameContainerEl).not.toBeInTheDocument();
  });

  it("should show the score and move count in the overlay (pluralized)", () => {
    render(<GameContainer {...props} isGameOver={true} score={512} movesCount={42} />);
    expect(screen.getByTestId("overlay-moves")).toHaveTextContent("Score: 512 in 42 moves");
  });

  it("should show the score and move count in the overlay (singular)", () => {
    render(<GameContainer {...props} isGameOver={true} score={512} movesCount={1} />);
    expect(screen.getByTestId("overlay-moves")).toHaveTextContent("Score: 512 in 1 move");
  });

  it("should call resetGameHandler with the current radius when Try Again is clicked", () => {
    const resetGameHandler = vi.fn();
    render(
      <GameContainer
        {...props}
        radius={3}
        isGameOver={true}
        resetGameHandler={resetGameHandler}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "Try Again" }));
    expect(resetGameHandler).toHaveBeenCalledWith(3);
  });

  it("should expose tiles as buttons in remove mode", () => {
    render(<GameContainer {...props} isRemoveMode={true} onRemoveTile={vi.fn()} />);
    expect(screen.getAllByRole("button", { name: /Remove tile/ })).toHaveLength(3);
  });

  it("should keep tiles as images when not in remove mode", () => {
    render(<GameContainer {...props} />);
    expect(screen.queryAllByRole("button", { name: /Remove tile/ })).toHaveLength(0);
    expect(screen.getAllByRole("img", { name: /^Tile/ })).toHaveLength(3);
  });

  it("should call onRemoveTile with the tapped tile in remove mode", () => {
    const onRemoveTile = vi.fn();
    render(<GameContainer {...props} isRemoveMode={true} onRemoveTile={onRemoveTile} />);
    fireEvent.click(screen.getAllByRole("button", { name: /Remove tile/ })[0]);
    expect(onRemoveTile).toHaveBeenCalledTimes(1);
    expect(onRemoveTile).toHaveBeenCalledWith(expect.objectContaining({ id: expect.any(Number) }));
  });

  it("should not consume taps on the Try Again button via swipe gestures", () => {
    const TestHarness = () => {
      const ref = React.useRef<HTMLElement>(null);
      const onSwipe = vi.fn();
      useSwipe(ref, onSwipe);
      return (
        <GameContainer
          {...props}
          ref={ref}
          isGameOver={true}
          resetGameHandler={vi.fn()}
        />
      );
    };
    render(<TestHarness />);
    const tryAgain = screen.getByRole("button", { name: "Try Again" });
    fireEvent.pointerDown(tryAgain, { pointerId: 1, clientX: 100, clientY: 100 });
    const wrapper = tryAgain.closest("main");
    expect(wrapper).not.toBeNull();
    expect(wrapper!.hasPointerCapture?.(1) ?? false).toBe(false);
  });
});
