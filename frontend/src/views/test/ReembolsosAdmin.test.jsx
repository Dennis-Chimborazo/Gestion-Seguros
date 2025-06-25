import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ReembolsosAdmin from "../reembolsos/ReembolsosAdmin";
import ClientesFun from "../clientes/ClientesFun";

jest.mock("../clientes/ClientesFun");

describe("ReembolsosAdmin - pruebas unitarias", () => {
  const mockMostrarSeccion = jest.fn();

  const mockClientes = {
    rows: [
      {
        cedr_cli: "1234567890",
        nom_cli: "Juan",
        ape_cli: "Perez",
        tel_pers: "0123456",
        cel_pers: "0987654321",
        email_pers: "juan@example.com",
      },
      {
        cedr_cli: "9876543210",
        nom_cli: "Maria",
        ape_cli: "Lopez",
        tel_pers: "6543210",
        cel_pers: "0123456789",
        email_pers: "maria@example.com",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza título y elementos básicos", () => {
    ClientesFun.obtenerCliente.mockResolvedValue({ rows: [] });

    render(
      <MemoryRouter initialEntries={["/reembolsos"]}>
        <Routes>
          <Route
            path="/reembolsos"
            element={<ReembolsosAdmin mostrarSeccion={mockMostrarSeccion} />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Clientes/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Ingrese numero de cedula/i)).toBeInTheDocument();
    expect(screen.getByRole("img", { hidden: true })).toBeDefined; // FcClearFilters icon present
  });

  it("carga los clientes y muestra la tabla correctamente", async () => {
    ClientesFun.obtenerCliente.mockResolvedValue(mockClientes);

    render(
      <MemoryRouter>
        <ReembolsosAdmin mostrarSeccion={mockMostrarSeccion} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(ClientesFun.obtenerCliente).toHaveBeenCalled();
    });

    expect(screen.getByText("1234567890")).toBeInTheDocument();
    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.getByText("Perez")).toBeInTheDocument();
    expect(screen.getByText("9876543210")).toBeInTheDocument();
    expect(screen.getByText("Maria")).toBeInTheDocument();
  });

  it("filtra clientes correctamente por cédula", async () => {
    ClientesFun.obtenerCliente.mockResolvedValue(mockClientes);

    render(
      <MemoryRouter>
        <ReembolsosAdmin mostrarSeccion={mockMostrarSeccion} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Juan")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Ingrese numero de cedula/i);

    fireEvent.change(input, { target: { value: "123" } });

    // Solo debe aparecer el cliente con cédula que inicia con "123"
    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.queryByText("Maria")).not.toBeInTheDocument();
  });

  it("restaura lista al borrar filtro", async () => {
    ClientesFun.obtenerCliente.mockResolvedValue(mockClientes);

    render(
      <MemoryRouter>
        <ReembolsosAdmin mostrarSeccion={mockMostrarSeccion} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Juan")).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Ingrese numero de cedula/i);

    fireEvent.change(input, { target: { value: "123" } });

    expect(screen.queryByText("Maria")).not.toBeInTheDocument();

    // Clic en icono para borrar filtro
    const clearFilterIcon = screen.getByRole("img", { hidden: true }); // o mejor usar testid si lo tienes
    fireEvent.click(clearFilterIcon);

    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.getByText("Maria")).toBeInTheDocument();
  });

  it("llama mostrarSeccion al hacer click en botones Nuevo Cliente y Validaciones pendientes", async () => {
    ClientesFun.obtenerCliente.mockResolvedValue({ rows: [] });

    render(
      <MemoryRouter>
        <ReembolsosAdmin mostrarSeccion={mockMostrarSeccion} />
      </MemoryRouter>
    );

    const nuevoClienteCard = screen.getByText("Nuevo Cliente");
    fireEvent.click(nuevoClienteCard);
    expect(mockMostrarSeccion).toHaveBeenCalledWith("crearClientes");

    const validacionesCard = screen.getByText("Validaciones pendientes");
    fireEvent.click(validacionesCard);
    expect(mockMostrarSeccion).toHaveBeenCalledWith("clientePendiente");
  });

  it("llama mostrarSeccion con 'EditarCliente' al hacer click en icono de editar cliente", async () => {
    ClientesFun.obtenerCliente.mockResolvedValue(mockClientes);

    render(
      <MemoryRouter>
        <ReembolsosAdmin mostrarSeccion={mockMostrarSeccion} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Juan")).toBeInTheDocument();
    });

    // Busca el icono con testid icono-cliente-0 y click
    const iconoEditar = screen.getByTestId("icono-cliente-0");
    fireEvent.click(iconoEditar);

    expect(mockMostrarSeccion).toHaveBeenCalledWith("EditarCliente");

    // Verificamos que localStorage se haya seteado (opcional)
    const localStorageData = JSON.parse(localStorage.getItem("edit"));
    expect(localStorageData.edit).toBe(true);
    expect(localStorageData.cliente.cedr_cli).toBe("1234567890");
  });
});
