import { render, screen, fireEvent } from "@testing-library/react";
import Button from ".";

describe("<Button/>", () => {
  it("should render with the given text", () => {
    render(<Button text="New Game" />);
    expect(screen.getByRole("button")).toHaveTextContent("New Game");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button text="New Game" disabled={true} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should call clickHandler when clicked", () => {
    const clickHandler = jest.fn();
    render(<Button text="New Game" clickHandler={clickHandler} />);
    fireEvent.click(screen.getByRole("button"));
    expect(clickHandler).toHaveBeenCalledTimes(1);
  });

  it("should not call clickHandler when disabled", () => {
    const clickHandler = jest.fn();
    render(<Button text="New Game" disabled={true} clickHandler={clickHandler} />);
    fireEvent.click(screen.getByRole("button"));
    expect(clickHandler).not.toHaveBeenCalled();
  });
});
