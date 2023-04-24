import { render, screen } from "@testing-library/react";

import NewGameMenu from ".";

const props = {
  resetGameHandler: () => {},
};

describe("<NewGameMenu/>", () => {
  it("should render a select of radius", () => {
    render(<NewGameMenu {...props} />);
    const selectEl = screen.getByTestId("new-game-select");
    expect(selectEl).toBeInTheDocument();
  });

  it("should a Start New Game button", () => {
    render(<NewGameMenu {...props} />);
    const buttonEl = screen.getByRole("button");
    expect(buttonEl).toBeTruthy();
  });
});
