import { render, screen, fireEvent } from "@testing-library/react";
import NewGameMenu from ".";

const props = {
  resetGameHandler: vi.fn(),
};

describe("<NewGameMenu/>", () => {
  it("should render all size options", () => {
    render(<NewGameMenu {...props} />);
    expect(screen.getByText("Small")).toBeInTheDocument();
    expect(screen.getByText("Normal")).toBeInTheDocument();
    expect(screen.queryByText("Medium")).not.toBeInTheDocument();
    expect(screen.queryByText("Large")).not.toBeInTheDocument();
    expect(screen.queryByText("XL")).not.toBeInTheDocument();
  });

  it("should note power ups on Small and none on Normal", () => {
    render(<NewGameMenu {...props} />);
    expect(screen.getByText("Power ups")).toBeInTheDocument();
    expect(screen.getByText("No power ups")).toBeInTheDocument();
  });

  it("should render the start button", () => {
    render(<NewGameMenu {...props} />);
    expect(screen.getByText("Start Game")).toBeInTheDocument();
  });

  it("should call resetGameHandler with the selected radius on start", () => {
    const resetGameHandler = vi.fn();
    render(<NewGameMenu resetGameHandler={resetGameHandler} />);
    fireEvent.click(screen.getByText("Small"));
    fireEvent.click(screen.getByText("Start Game"));
    expect(resetGameHandler).toHaveBeenCalledWith(1);
  });

  it("should default to Normal (radius 2)", () => {
    const resetGameHandler = vi.fn();
    render(<NewGameMenu resetGameHandler={resetGameHandler} />);
    fireEvent.click(screen.getByText("Start Game"));
    expect(resetGameHandler).toHaveBeenCalledWith(2);
  });
});
