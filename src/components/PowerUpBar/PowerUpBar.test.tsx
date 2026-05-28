import { render, screen, fireEvent } from "@testing-library/react";
import PowerUpBar from ".";

describe("<PowerUpBar/>", () => {
  it("should not render when there are no power-ups", () => {
    render(<PowerUpBar powerUps={{}} />);
    expect(screen.queryByTestId("power-up-bar")).not.toBeInTheDocument();
  });

  it("should render the undo power-up tile", () => {
    render(<PowerUpBar powerUps={{ undo: { onActivate: vi.fn() } }} />);
    expect(screen.getByTestId("power-up-bar")).toBeInTheDocument();
    expect(screen.getByTestId("power-up-undo")).toBeInTheDocument();
  });

  it("should call onActivate when an enabled tile is clicked", () => {
    const onActivate = vi.fn();
    render(<PowerUpBar powerUps={{ undo: { onActivate, charges: 1, maxCharges: 1 } }} />);
    fireEvent.click(screen.getByTestId("power-up-undo"));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("should show the remaining charges badge", () => {
    render(<PowerUpBar powerUps={{ undo: { onActivate: vi.fn(), charges: 2, maxCharges: 3 } }} />);
    expect(screen.getByTestId("power-up-undo-charges")).toHaveTextContent("2");
  });

  it("should disable the tile when charges are exhausted", () => {
    render(<PowerUpBar powerUps={{ undo: { onActivate: vi.fn(), charges: 0, maxCharges: 3 } }} />);
    expect(screen.getByTestId("power-up-undo")).toBeDisabled();
  });

  it("should disable the tile when explicitly disabled", () => {
    render(<PowerUpBar powerUps={{ undo: { onActivate: vi.fn(), disabled: true, charges: 1, maxCharges: 1 } }} />);
    expect(screen.getByTestId("power-up-undo")).toBeDisabled();
  });

  it("should expose remaining charges via aria-label", () => {
    render(<PowerUpBar powerUps={{ undo: { onActivate: vi.fn(), charges: 1, maxCharges: 1 } }} />);
    expect(screen.getByTestId("power-up-undo")).toHaveAttribute(
      "aria-label",
      "Undo your last move, 1 remaining"
    );
  });

  it("should not render a charges badge when maxCharges is unset", () => {
    render(<PowerUpBar powerUps={{ undo: { onActivate: vi.fn() } }} />);
    expect(screen.queryByTestId("power-up-undo-charges")).not.toBeInTheDocument();
  });

  it("should render the new game power-up tile", () => {
    render(<PowerUpBar powerUps={{ newGame: { onActivate: vi.fn() } }} />);
    expect(screen.getByTestId("power-up-newGame")).toBeInTheDocument();
  });

  it("should call onActivate when the new game tile is clicked", () => {
    const onActivate = vi.fn();
    render(<PowerUpBar powerUps={{ newGame: { onActivate } }} />);
    fireEvent.click(screen.getByTestId("power-up-newGame"));
    expect(onActivate).toHaveBeenCalledTimes(1);
  });

  it("should render power-ups in registry order with undo before new game", () => {
    render(<PowerUpBar powerUps={{ newGame: { onActivate: vi.fn() }, undo: { onActivate: vi.fn() } }} />);
    const tiles = screen.getAllByTestId(/^power-up-(undo|newGame)$/);
    expect(tiles.map((t) => t.getAttribute("data-testid"))).toEqual([
      "power-up-undo",
      "power-up-newGame",
    ]);
  });

  it("should render the remove-tile power-up between undo and new game", () => {
    render(
      <PowerUpBar
        powerUps={{
          newGame: { onActivate: vi.fn() },
          removeTile: { onActivate: vi.fn(), charges: 1, maxCharges: 1 },
          undo: { onActivate: vi.fn() },
        }}
      />
    );
    const tiles = screen.getAllByTestId(/^power-up-(undo|removeTile|newGame)$/);
    expect(tiles.map((t) => t.getAttribute("data-testid"))).toEqual([
      "power-up-undo",
      "power-up-removeTile",
      "power-up-newGame",
    ]);
  });

  it("should reflect active state via aria-pressed on a toggleable power-up", () => {
    const { rerender } = render(
      <PowerUpBar powerUps={{ removeTile: { onActivate: vi.fn(), charges: 1, maxCharges: 1, active: false } }} />
    );
    expect(screen.getByTestId("power-up-removeTile")).toHaveAttribute("aria-pressed", "false");
    rerender(
      <PowerUpBar powerUps={{ removeTile: { onActivate: vi.fn(), charges: 1, maxCharges: 1, active: true } }} />
    );
    expect(screen.getByTestId("power-up-removeTile")).toHaveAttribute("aria-pressed", "true");
  });

  it("should not set aria-pressed on a non-toggleable power-up", () => {
    render(<PowerUpBar powerUps={{ undo: { onActivate: vi.fn() } }} />);
    expect(screen.getByTestId("power-up-undo")).not.toHaveAttribute("aria-pressed");
  });
});
