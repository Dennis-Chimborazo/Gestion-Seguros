// __tests__/Clientes.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Clientes from "../clientes/Clientes";
import ClientesFun from "../clientes/ClientesFun";

// Mock de Api
jest.mock("../clientes/ClientesFun", () => ({
  obtenerCliente: jest.fn(),
}));

const mockClientes = {
  rows: [
    {
      cedr_cli: "1234567890",
      nom_cli: "Juan",
      ape_cli: "Pérez",
      tel_pers: "1234567",
      cel_pers: "0987654321",
      email_pers: "juan@example.com",
    },
    {
      cedr_cli: "9876543210",
      nom_cli: "Ana",
      ape_cli: "López",
      tel_pers: "7654321",
      cel_pers: "0912345678",
      email_pers: "ana@example.com",
    },
  ],
}

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("Clientes component", () => {
  const mockMostrarSeccion = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renderiza correctamente y llama a obtenerCliente", async () => {
    ClientesFun.obtenerCliente.mockResolvedValueOnce(mockClientes);

    renderWithRouter(<Clientes mostrarSeccion={mockMostrarSeccion} />);

    expect(await screen.findByText("Clientes")).toBeInTheDocument();
    await waitFor(() =>
      expect(ClientesFun.obtenerCliente).toHaveBeenCalled()
    );
  });

  test("muestra datos de los clientes", async () => {
    ClientesFun.obtenerCliente.mockResolvedValueOnce(mockClientes);

    renderWithRouter(<Clientes mostrarSeccion={mockMostrarSeccion} />);

    expect(await screen.findByText("Juan")).toBeInTheDocument();
    expect(screen.getByText("Ana")).toBeInTheDocument();
  });

  test("filtra clientes por cédula", async () => {
    ClientesFun.obtenerCliente.mockResolvedValueOnce(mockClientes);

    renderWithRouter(<Clientes mostrarSeccion={mockMostrarSeccion} />);

    await screen.findByText("Juan");

    const input = screen.getByPlaceholderText("Ingrese número de cédula");
    fireEvent.change(input, { target: { value: "123" } });

    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
  });

  test("botón 'Crear' llama a mostrarSeccion", async () => {
    ClientesFun.obtenerCliente.mockResolvedValueOnce(mockClientes);

    renderWithRouter(<Clientes mostrarSeccion={mockMostrarSeccion} />);

    await screen.findByText("Clientes");

    fireEvent.click(screen.getByRole("button", { name: /crear/i }));
    expect(mockMostrarSeccion).toHaveBeenCalledWith("crearClientes");
  });
});
