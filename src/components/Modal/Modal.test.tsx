import { render, screen, fireEvent } from "@testing-library/react";
import Modal from ".";

const props = {
  setIsModalShown: vi.fn(),
};

describe("<Modal/>", () => {
  it("should render children", () => {
    render(<Modal {...props}><div data-testid="child">content</div></Modal>);
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("should render a close button", () => {
    render(<Modal {...props} />);
    expect(screen.getByTestId("close-btn")).toBeInTheDocument();
  });

  it("should call setIsModalShown when close button is clicked", () => {
    const setIsModalShown = vi.fn();
    render(<Modal setIsModalShown={setIsModalShown} />);
    fireEvent.click(screen.getByTestId("close-btn"));
    expect(setIsModalShown).toHaveBeenCalledWith(false);
  });

  it("should call setIsModalShown when overlay is clicked", () => {
    const setIsModalShown = vi.fn();
    render(<Modal setIsModalShown={setIsModalShown} />);
    fireEvent.click(screen.getByTestId("modal-overlay"));
    expect(setIsModalShown).toHaveBeenCalledWith(false);
  });
});
