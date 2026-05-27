import { render, screen, fireEvent } from "@testing-library/react";
import GameMenu from ".";

const props = {};

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
    const onNewGameHandler = vi.fn();
    render(<GameMenu {...props} onNewGameHandler={onNewGameHandler} />);
    fireEvent.click(screen.getByTestId("new-game-btn"));
    expect(onNewGameHandler).toHaveBeenCalledTimes(1);
  });

  it("should call undoHandler when undo is clicked and available", () => {
    const undoHandler = vi.fn();
    render(<GameMenu {...props} undoHandler={undoHandler} isUndoAvailable={true} />);
    fireEvent.click(screen.getByTestId("undo-btn"));
    expect(undoHandler).toHaveBeenCalledTimes(1);
  });

  it("should disable undo button when undo is not available", () => {
    render(<GameMenu {...props} isUndoAvailable={false} />);
    expect(screen.getByTestId("undo-btn")).toBeDisabled();
  });

  it("should render one filled pip per remaining undo out of the max", () => {
    render(<GameMenu {...props} remainingUndos={2} maxUndos={3} />);
    const pips = screen.getByTestId("undo-pips");
    expect(pips.querySelectorAll("[data-pip]")).toHaveLength(3);
    expect(pips.querySelectorAll('[data-pip="filled"]')).toHaveLength(2);
    expect(pips.querySelectorAll('[data-pip="empty"]')).toHaveLength(1);
  });

  it("should always show at least 3 pip slots even for a 1-undo budget", () => {
    render(<GameMenu {...props} remainingUndos={1} maxUndos={1} />);
    const pips = screen.getByTestId("undo-pips");
    expect(pips.querySelectorAll("[data-pip]")).toHaveLength(3);
    expect(pips.querySelectorAll('[data-pip="filled"]')).toHaveLength(1);
    expect(pips.querySelectorAll('[data-pip="empty"]')).toHaveLength(2);
  });

  it("should not render pips when there are no undos available", () => {
    render(<GameMenu {...props} remainingUndos={0} maxUndos={0} />);
    expect(screen.queryByTestId("undo-pips")).not.toBeInTheDocument();
  });

  it("should keep the undo action labelled for assistive tech via aria-label", () => {
    render(<GameMenu {...props} />);
    expect(screen.getByTestId("undo-btn")).toHaveAttribute("aria-label", "Undo last action");
  });

  it("should render the undo arrow icon", () => {
    const { container } = render(<GameMenu {...props} />);
    expect(container.querySelector("[data-testid='undo-btn'] svg")).toBeInTheDocument();
  });

  it("should disable the undo button and show no filled pips when remainingUndos is 0", () => {
    render(<GameMenu {...props} remainingUndos={0} maxUndos={3} isUndoAvailable={true} />);
    expect(screen.getByTestId("undo-btn")).toBeDisabled();
    expect(screen.getByTestId("undo-pips").querySelectorAll('[data-pip="filled"]')).toHaveLength(0);
  });

  it("should render the hamburger menu toggle when menu actions are provided", () => {
    render(<GameMenu {...props} onToggleTheme={vi.fn()} />);
    expect(screen.getByTestId("menu-toggle-btn")).toBeInTheDocument();
  });

  it("should not render the menu toggle when there are no menu actions", () => {
    render(<GameMenu {...props} />);
    expect(screen.queryByTestId("menu-toggle-btn")).not.toBeInTheDocument();
  });

  it("should keep the dropdown contents hidden until the menu is opened", () => {
    render(
      <GameMenu {...props} onToggleTheme={vi.fn()} onToggleMuted={vi.fn()} onHighScoresHandler={vi.fn()} />
    );
    expect(screen.queryByTestId("menu-dropdown")).not.toBeInTheDocument();
    expect(screen.queryByTestId("theme-toggle-btn")).not.toBeInTheDocument();
  });

  it("should reveal theme, sound and scores controls when the menu is opened", () => {
    render(
      <GameMenu {...props} onToggleTheme={vi.fn()} onToggleMuted={vi.fn()} onHighScoresHandler={vi.fn()} />
    );
    fireEvent.click(screen.getByTestId("menu-toggle-btn"));
    expect(screen.getByTestId("theme-toggle-btn")).toBeInTheDocument();
    expect(screen.getByTestId("sound-toggle-btn")).toBeInTheDocument();
    expect(screen.getByTestId("high-scores-btn")).toBeInTheDocument();
  });

  it("should call onToggleTheme and close the menu when the theme control is clicked", () => {
    const onToggleTheme = vi.fn();
    render(<GameMenu {...props} onToggleTheme={onToggleTheme} />);
    fireEvent.click(screen.getByTestId("menu-toggle-btn"));
    fireEvent.click(screen.getByTestId("theme-toggle-btn"));
    expect(onToggleTheme).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("menu-dropdown")).not.toBeInTheDocument();
  });

  it("should close the menu when Escape is pressed", () => {
    render(<GameMenu {...props} onToggleMuted={vi.fn()} />);
    fireEvent.click(screen.getByTestId("menu-toggle-btn"));
    expect(screen.getByTestId("menu-dropdown")).toBeInTheDocument();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByTestId("menu-dropdown")).not.toBeInTheDocument();
  });

  it("should return focus to the trigger after closing with Escape", () => {
    render(<GameMenu {...props} onToggleMuted={vi.fn()} />);
    const trigger = screen.getByTestId("menu-toggle-btn");
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(trigger).toHaveFocus();
  });

  it("should return focus to the trigger after activating a menu item", () => {
    render(<GameMenu {...props} onHighScoresHandler={vi.fn()} />);
    const trigger = screen.getByTestId("menu-toggle-btn");
    fireEvent.click(trigger);
    fireEvent.click(screen.getByTestId("high-scores-btn"));
    expect(trigger).toHaveFocus();
  });

  it("should close the menu on an outside click", () => {
    render(<GameMenu {...props} onToggleMuted={vi.fn()} />);
    fireEvent.click(screen.getByTestId("menu-toggle-btn"));
    expect(screen.getByTestId("menu-dropdown")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByTestId("menu-dropdown")).not.toBeInTheDocument();
  });
});
