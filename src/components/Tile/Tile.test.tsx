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
    expect(tileEl.firstElementChild).toHaveClass("color-final");
    expect(tileEl.firstElementChild).not.toHaveClass("color-131072");
  });

  it("labels the tile as a swap target in swap targeting mode", () => {
    render(<Tile value={8} targeting targetingAction="swap" onSelect={() => {}} />);
    const tileEl = screen.getByRole("button", { name: "Swap tile 8" });
    expect(tileEl).toBeInTheDocument();
    expect(tileEl).toHaveAttribute("aria-pressed", "false");
  });

  it("marks a selected swap target via aria-pressed", () => {
    render(<Tile value={8} targeting targetingAction="swap" selected onSelect={() => {}} />);
    expect(screen.getByRole("button", { name: "Swap tile 8" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("renders two splitting halves while removing", () => {
    render(<Tile value={8} removing />);
    const tileEl = screen.getByRole("img", { name: "Removing tile 8" });
    expect(tileEl).toBeInTheDocument();
    // Both halves keep the value visible as they split apart.
    expect(tileEl.querySelectorAll("div")).toHaveLength(2);
    expect(tileEl).toHaveTextContent("88");
  });

  const fontSizeCases: [number, string][] = [
    [2048, "42px"],
    [16384, "34px"],
    [131072, "28px"],
    [1048576, "24px"],
  ];
  fontSizeCases.forEach(([value, expected]) =>
    it(`scales font size to ${expected} for ${value}`, () => {
      render(<Tile value={value} />);
      const tileEl = screen.getByTestId("tile");
      expect(tileEl.firstElementChild).toHaveStyle({ fontSize: expected });
    })
  );
});
