import { render, screen } from "@testing-library/react";
import Instructions from ".";

describe("<Instructions/>", () => {
  it("should render the instructions section", () => {
    render(<Instructions />);
    expect(screen.getByTestId("instructions")).toBeInTheDocument();
  });

  it("should mention the movement keys", () => {
    render(<Instructions />);
    expect(screen.getByTestId("instructions")).toHaveTextContent("q, w, e, a, s, d");
  });

  it("should mention arrow keys", () => {
    render(<Instructions />);
    expect(screen.getByTestId("instructions")).toHaveTextContent("arrow keys");
  });

  it("should mention 2048 as the target", () => {
    render(<Instructions />);
    expect(screen.getByTestId("instructions")).toHaveTextContent("2048");
  });
});
