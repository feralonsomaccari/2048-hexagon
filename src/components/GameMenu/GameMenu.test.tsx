import { render, screen, fireEvent } from "@testing-library/react";
import GameMenu from ".";

const props = {};

describe("<GameMenu/>", () => {
  it("should render the game menu", () => {
    render(<GameMenu {...props} />);
    expect(screen.getByTestId("game-menu")).toBeInTheDocument();
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
