import { render, screen, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AppProviders } from "./state/AppProviders";

jest.useFakeTimers();

test("renders main menu after splash", async () => {
  render(
    <BrowserRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  );

  // Splash appears first
  expect(screen.getByText(/Vertical Pong Arena/i)).toBeInTheDocument();

  // Advance splash redirect timer
  await act(async () => {
    jest.advanceTimersByTime(700);
  });

  expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
});
