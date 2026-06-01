import { render, screen } from "@testing-library/react";
import Leaderboard from ".";

describe("<Leaderboard/>", () => {
  it("shows the under-development notice while the app version is below 1.0", () => {
    render(<Leaderboard scores={{}} />);
    const major = Number(__APP_VERSION__.split(".")[0]);
    const notice = screen.queryByTestId("leaderboard-dev-notice");
    if (major < 1) {
      expect(notice).toBeInTheDocument();
      expect(notice).toHaveTextContent(/under development/i);
    } else {
      expect(notice).not.toBeInTheDocument();
    }
  });
});
