import { render, screen } from "@testing-library/react";

import GameStatus from ".";

describe("<GameStatus/>", () => {
  it("should render a GameStatus component with 'playing' status", () => {
    render(<GameStatus isGameOver={false} />);
    const scoreEl = screen.getByTestId("game-status");
    expect(scoreEl).toHaveTextContent("playing");
  });

  it("should render a GameStatus component with 'game-over' status", () => {
    render(<GameStatus isGameOver={true} />);
    const scoreEl = screen.getByTestId("game-status");
    expect(scoreEl).toHaveTextContent("game-over");
  });
});
