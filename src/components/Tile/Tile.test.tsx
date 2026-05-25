import { render, screen } from "@testing-library/react";

import Tile from ".";

describe("<Tile/>", () => {
  it("should render a Tile component with value of 2", () => {
    const value = 2;
    render(<Tile value={value} />);
    const tileEl = screen.getByTestId("tile");
    expect(tileEl).toHaveTextContent(value.toString());
  });

  const gameTestValues = [
    2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768,
    65536,
  ];
  gameTestValues.forEach((value) =>
    it(`should render a Tile component with color of value ${value}`, () => {
      render(<Tile value={value} />);
      const tileEl = screen.getByTestId("tile");
      expect(tileEl.firstElementChild).toHaveClass(`color-${value}`);
    })
  );

  it("falls back to the final color for values beyond the defined tiers", () => {
    render(<Tile value={131072} />);
    const tileEl = screen.getByTestId("tile");
    // No dedicated color-131072 class exists, so it must not render uncolored.
    expect(tileEl.firstElementChild).toHaveClass("color-final");
    expect(tileEl.firstElementChild).not.toHaveClass("color-131072");
  });
});
