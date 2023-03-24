import { render, screen } from "@testing-library/react";

import GameContainer from ".";

const props = {
  tileSet: [
    {
      x: 1,
      y: 0,
      z: -1,
      value: 2,
      id: 0.519859284427105,
    },
    {
      x: -1,
      y: 1,
      z: 0,
      value: 2,
      id: 0.9714689909376073,
    },
    {
      x: 0,
      y: 1,
      z: -1,
      value: 2,
      id: 0.41289545040663955,
    },
  ],
  grid: [
    {
      x: -1,
      y: 0,
      z: 1,
      value: 0,
    },
    {
      x: -1,
      y: 1,
      z: 0,
      value: 0,
    },
    {
      x: 0,
      y: -1,
      z: 1,
      value: 0,
    },
    {
      x: 0,
      y: 0,
      z: 0,
      value: 0,
    },
    {
      x: 0,
      y: 1,
      z: -1,
      value: 0,
    },
    {
      x: 1,
      y: -1,
      z: 0,
      value: 0,
    },
    {
      x: 1,
      y: 0,
      z: -1,
      value: 0,
    },
  ],
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
