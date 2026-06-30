import { render, screen } from "@testing-library/react";
import App from "./App";

test("la portada muestra la marca Yamacoa", () => {
  render(<App />);
  expect(screen.getAllByText(/yamacoa/i).length).toBeGreaterThan(0);
});
