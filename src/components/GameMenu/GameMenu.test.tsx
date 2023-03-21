import { render, screen } from "@testing-library/react";

import GameMenu from ".";

const props = {
  gameOver: true,
  score: 100,
}

describe("<GameMenu/>", () => {
  it("should render a GameMenu component", () => {
    render(<GameMenu  {...props} />);
    const gameMenuEl = screen.getByTestId("game-menu");
    expect(gameMenuEl).toHaveClass('gameMenu')
  });

  it("should get the User to the 'How To Play' section", () => {
    render(<GameMenu  {...props} />);
    const anchorEl = screen.getByRole('link')
    expect(anchorEl).toHaveAttribute('href', '#howtoplay');
  });
});
