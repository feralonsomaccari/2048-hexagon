import { render, screen, fireEvent } from "@testing-library/react";
import NewGameMenu from ".";

const props = {
  resetGameHandler: jest.fn(),
};

describe("<NewGameMenu/>", () => {
  it("should render all size options", () => {
    render(<NewGameMenu {...props} />);
    expect(screen.getByText("Small")).toBeInTheDocument();
    expect(screen.getByText("Medium")).toBeInTheDocument();
    expect(screen.getByText("Large")).toBeInTheDocument();
    expect(screen.getByText("XL")).toBeInTheDocument();
  });

  it("should render the start button", () => {
    render(<NewGameMenu {...props} />);
    expect(screen.getByText("Start Game")).toBeInTheDocument();
  });

  it("should call resetGameHandler with the selected radius on start", () => {
    const resetGameHandler = jest.fn();
    render(<NewGameMenu resetGameHandler={resetGameHandler} />);
    fireEvent.click(screen.getByText("Medium"));
    fireEvent.click(screen.getByText("Start Game"));
    expect(resetGameHandler).toHaveBeenCalledWith(2);
  });

  it("should default to Small (radius 1)", () => {
    const resetGameHandler = jest.fn();
    render(<NewGameMenu resetGameHandler={resetGameHandler} />);
    fireEvent.click(screen.getByText("Start Game"));
    expect(resetGameHandler).toHaveBeenCalledWith(1);
  });
});
