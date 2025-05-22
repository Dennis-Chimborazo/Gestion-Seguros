import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { VentanaPrincipal } from "../VentanaPrincipal"; // ajusta la ruta según tu estructura

describe("VentanaPrincipal", () => {
  const renderWithUser = (rol) => {
    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: "/",
            state: { user: { rol } },
          },
        ]}
      >
        <Routes>
          <Route path="/" element={<VentanaPrincipal />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test("muestra menú correcto para admin", () => {
    renderWithUser("admin");

    expect(screen.getByText("Bienvenido, admin")).toBeInTheDocument();
    expect(screen.getByText("Cuentas")).toBeInTheDocument();
    expect(screen.getByText("Seguros")).toBeInTheDocument();
  });

  test("muestra menú correcto para trabajador", () => {
    renderWithUser("trabajador");

    expect(screen.getByText("Bienvenido, trabajador")).toBeInTheDocument();
    expect(screen.getByText("Clientes")).toBeInTheDocument();
    expect(screen.getByText("Gestión de contratación")).toBeInTheDocument();
  });

  test("muestra menú correcto para cliente", () => {
    renderWithUser("cliente");

    expect(screen.getByText("Bienvenido, cliente")).toBeInTheDocument();
    expect(screen.getByText("Contratación de seguro")).toBeInTheDocument();
    expect(screen.getByText("Historial de pagos")).toBeInTheDocument();
    expect(screen.getByText("Cerrar sesión")).toBeInTheDocument();
  });
});
