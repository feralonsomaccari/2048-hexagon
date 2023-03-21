import { render, screen } from "@testing-library/react";

import GameStatus from ".";

describe("<GameStatus/>", () => {
  it("should render a GameStatus component with 'playing' status", () => {
    render(<GameStatus gameOver={false} />);
    const scoreEl = screen.getByTestId("gamestatus");
    expect(scoreEl).toHaveTextContent("playing");
  });

  it("should render a GameStatus component with 'game-over' status", () => {
    render(<GameStatus gameOver={true} />);
    const scoreEl = screen.getByTestId("gamestatus");
    expect(scoreEl).toHaveTextContent("game-over");
  });
});
