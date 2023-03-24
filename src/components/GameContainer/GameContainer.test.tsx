import { render, screen } from "@testing-library/react";
import {tileSet, grid } from "./dummyData"
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
    render(<GameContainer {...props} />);
    const gameContainerEl = screen.getAllByTestId("block");
    expect(gameContainerEl).toHaveLength(7);
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
