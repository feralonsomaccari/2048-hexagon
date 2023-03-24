import { render, screen } from "@testing-library/react";
import { tileSet, grid } from "./dummyData";
import { createHexGrid } from "../../utils";
import GameContainer from ".";

const props = {
  tileSet: tileSet,
  grid: grid,
  isGameOver: false,
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
});
