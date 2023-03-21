import { render, screen } from "@testing-library/react";

import Instructions from ".";

describe("<Instructions/>", () => {
  it("should have 'howtoplay' in the how to play section", () => {
    render(<Instructions />);
    const instructionsEl = screen.getByTestId("instructions");
    expect(instructionsEl).toHaveAttribute("id", "howtoplay");
  });

  it("should get the User to the 'Game' section", () => {
    render(<Instructions />);
    const anchorEl = screen.getByRole("link");
    expect(anchorEl).toHaveAttribute("href", "#game");
  });
});
