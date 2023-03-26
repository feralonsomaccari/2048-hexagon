import { render, screen } from "@testing-library/react";

import Modal from ".";
import NewGameMenu from "../NewGameMenu";

const props = {
    setIsModalShown: () => {},
};

describe("<Modal/>", () => {
  it("should render children component", () => {
    render(<Modal {...props}> <NewGameMenu resetGameHandler={() => {}}/> </Modal>);
    const selectEl = screen.getByTestId("new-game-select");
    expect(selectEl).toBeInTheDocument();
  });

  it("should have a close button", () => {
    render(<Modal {...props}/>);
    const closeBtn = screen.getByTestId("close-btn");
    expect(closeBtn).toBeInTheDocument();
  });

});
