import React from "react";
import { render, screen } from "@testing-library/react";
import App from "../../App";

// Mockea el componente AppRoutes para simplificar el test
jest.mock("../../AppRoutes", () => () => <div>Mocked AppRoutes</div>);

describe("App", () => {
  test("renderiza AppRoutes dentro de BrowserRouter", () => {
    render(<App />);
    
    // Verifica que AppRoutes fue renderizado
    expect(screen.getByText("Mocked AppRoutes")).toBeInTheDocument();
  });
});
