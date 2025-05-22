import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ValidacionCliente from "../clientes/ValidacionCliente";
import ClientesFun from "../clientes/ClientesFun";
import { MemoryRouter } from "react-router-dom";

// Mock componentes y funciones necesarias
jest.mock("../clientes/ClientesFun");
jest.mock("../clientes/ModalReenvioValidacion", () => () => <div data-testid="modal-reenvio">Modal Reenvío</div>);
jest.mock("../cargando/CargarTablas", () => () => <div data-testid="cargando-tabla">Cargando...</div>);

describe("ValidacionCliente", () => {
  const mockClientes = {
    rows: [
      {
        cedr_cli: "1234567890",
        nom_cli: "Juan",
        ape_cli: "Pérez",
        tel_pers: "2222-2222",
        cel_pers: "8888-8888",
        email_pers: "juan@test.com"
      },
      {
        cedr_cli: "0987654321",
        nom_cli: "Ana",
        ape_cli: "Gómez",
        tel_pers: "1111-1111",
        cel_pers: "9999-9999",
        email_pers: "ana@test.com"
      }
    ]
  };

  beforeEach(() => {
    ClientesFun.obtenerClientePeniente.mockResolvedValue(mockClientes);
    localStorage.clear();
  });

  const renderComponent = () => {
    render(
      <MemoryRouter>
        <ValidacionCliente mostrarSeccion={jest.fn()} />
      </MemoryRouter>
    );
  };

  it("Renderiza correctamente el título y carga clientes", async () => {
    renderComponent();
    expect(screen.getByText(/Vadicacion de cuenta Pendiente/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Juan")).toBeInTheDocument();
      expect(screen.getByText("Ana")).toBeInTheDocument();
    });
  });

  it("Filtra clientes por cédula", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Juan"));

    const inputBuscar = screen.getByPlaceholderText(/Ingrese numero de cedula/i);
    fireEvent.change(inputBuscar, { target: { value: "123" } });

    await waitFor(() => {
      expect(screen.getByText("Juan")).toBeInTheDocument();
      expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    });
  });

  it("Abre el modal al hacer clic en el ícono de reenviar correo", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Juan"));
  
    const iconoCorreo = screen.getByTestId("reenviar-1234567890"); // Usa la cédula del cliente
    fireEvent.click(iconoCorreo);
  
    await waitFor(() => {
      expect(screen.getByTestId("modal-reenvio")).toBeInTheDocument();
    });
  });
  
});
