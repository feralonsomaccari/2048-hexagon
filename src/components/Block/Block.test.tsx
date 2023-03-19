import { render, screen } from "@testing-library/react";

import Block from ".";

describe("<Block/>", () => {
  it("should render a Hexagon Block component", () => {
    const coords = { x: 0, y: 1, z: -1 }
    render(<Block x={coords.x} y={coords.y} z={coords.z} value={2} />);
    const hexagonEl = screen.getByTestId("hexagon-el");
    expect(hexagonEl).toHaveAttribute('data-x', '0')
    expect(hexagonEl).toHaveAttribute('data-y', '1')
    expect(hexagonEl).toHaveAttribute('data-z', '-1')
  });
});
