import { render, screen, fireEvent } from "@testing-library/react";
import GameMenu from ".";

const props = {
  isGameOver: false,
};

describe("<GameMenu/>", () => {
  it("should render the game menu", () => {
    render(<GameMenu {...props} />);
    expect(screen.getByTestId("game-menu")).toBeInTheDocument();
  });

  it("should render the undo button", () => {
    render(<GameMenu {...props} />);
    expect(screen.getByTestId("undo-btn")).toBeInTheDocument();
  });

  it("should render the new game button", () => {
    render(<GameMenu {...props} />);
    expect(screen.getByTestId("new-game-btn")).toBeInTheDocument();
  });

  it("should call onNewGameHandler when new game is clicked", () => {
    const onNewGameHandler = jest.fn();
    render(<GameMenu {...props} onNewGameHandler={onNewGameHandler} />);
    fireEvent.click(screen.getByTestId("new-game-btn"));
    expect(onNewGameHandler).toHaveBeenCalledTimes(1);
  });

  it("should call undoHandler when undo is clicked and available", () => {
    const undoHandler = jest.fn();
    render(<GameMenu {...props} undoHandler={undoHandler} isUndoAvailable={true} />);
    fireEvent.click(screen.getByTestId("undo-btn"));
    expect(undoHandler).toHaveBeenCalledTimes(1);
  });

  it("should disable undo button when undo is not available", () => {
    render(<GameMenu {...props} isUndoAvailable={false} />);
    expect(screen.getByTestId("undo-btn")).toBeDisabled();
  });
});
