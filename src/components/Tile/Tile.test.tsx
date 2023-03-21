import { render, screen } from "@testing-library/react";

import Tile from ".";

describe("<Tile/>", () => {
  it("should render a Tile component with value of 2", () => {
    const value = 2;
    render(<Tile value={value} />);
    const tileEl = screen.getByTestId("tile");
    expect(tileEl).toHaveTextContent(value.toString());
  });

  const gameTestValues = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048];
  gameTestValues.forEach((value) =>
    it(`should render a Tile component with color of value ${value}`, () => {
      render(<Tile value={value} />);
      const tileEl = screen.getByTestId("tile");
      expect(tileEl).toHaveClass(`color-${value}`);
    })
  );
});
