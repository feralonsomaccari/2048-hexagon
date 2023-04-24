import { render, screen } from "@testing-library/react";

import Score from ".";

describe("<Score/>", () => {
  it("should render a Score component with 'Best' as title and a score value of 2", () => {
    const value = 2;
    const title = "Best";
    render(<Score title={title} score={value} />);
    const scoreEl = screen.getByTestId("score");
    const titleEl = scoreEl.querySelector("h3");
    const valueEl = scoreEl.querySelector("p");
    expect(titleEl).toHaveTextContent(title);
    expect(valueEl).toHaveTextContent(value.toString());
  });
});
