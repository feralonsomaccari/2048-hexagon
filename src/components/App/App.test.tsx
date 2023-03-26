import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from "@testing-library/react";
import { tileSet } from "./dummyData";
import { fetchServer } from "../../services";
const serverCall = fetchServer as jest.Mock;
jest.mock("../../services");

import { App } from ".";

describe("<App/>", () => {
  afterEach(() => {
    serverCall.mockRestore();
  });

  it("should render New Game Modal", () => {
    render(<App />);
    const newgameBtn = screen.getByTestId("new-game-btn");
    fireEvent.click(newgameBtn);
    const newGameMenu = screen.getByTestId("new-game");
    expect(newGameMenu).toBeInTheDocument();
  });

  it("should hide New Game Modal", () => {
    render(<App />);
    const newgameButton = screen.getByTestId("new-game-btn");
    fireEvent.click(newgameButton);
    const closBtn = screen.getByTestId("close-btn");
    const newGameMenu = screen.getByTestId("new-game");
    fireEvent.click(closBtn);
    expect(newGameMenu).not.toBeInTheDocument();
  });

  it("should fetch initial Tiles from the server", async () => {
    serverCall.mockResolvedValueOnce(tileSet);

    await waitFor(async () => {
      await render(<App />);
      const tile = await screen.getAllByTestId("tile");
      await expect(tile).toHaveLength(3);
    });
    await cleanup();
  });

});
