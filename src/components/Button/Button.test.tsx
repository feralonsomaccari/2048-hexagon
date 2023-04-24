import { render, screen } from "@testing-library/react";

import Button from ".";

describe("<Button/>", () => {
  it("should render a Button component", () => {
    render(<Button text="New Game" />);
    const buttonEl = screen.getByRole("button");
    expect(buttonEl).toBeTruthy();
  });

  it("should render a Button component with the text 'New Game", () => {
    render(<Button text="New Game" />);
    const buttonEl = screen.getByRole("button");
    expect(buttonEl).toHaveTextContent("New Game");
  });

  it("should render a disabled Button", () => {
    render(<Button text="New Game" disabled={true} />);
    const buttonEl = screen.getByRole("button");
    expect(buttonEl).toHaveProperty("disabled", true);
  });
});
