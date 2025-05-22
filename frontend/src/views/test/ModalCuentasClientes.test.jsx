import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ModalCuentasClientes from "../clientes/ModalCuentasClientes";
import ClientesFun from "../clientes/ClientesFun";
import { MemoryRouter } from "react-router-dom";

// Mocks
jest.mock("../clientes/ClientesFun");
jest.mock("sweetalert2", () => ({
  fire: jest.fn(),
}));
jest.mock("sonner", () => ({
    toast: {
      error: jest.fn(),
    },
    Toaster: () => <div data-testid="toaster" />,
  }));
  

describe("ModalCuentasClientes", () => {
  const datosCliente = {
    email_pers: "cliente@test.com",
    nombre: "Juan",
  };

  const cerrarModalMock = jest.fn();
  const mostrarSeccionMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renderiza correctamente el formulario", () => {
    render(
      <MemoryRouter>
        <ModalCuentasClientes
          cerrarModal={cerrarModalMock}
          datosCliente={datosCliente}
          mostrarSeccion={mostrarSeccionMock}
        />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText("Usuario")).toHaveValue("cliente@test.com");
    expect(screen.getByPlaceholderText("Ingrese una contraseña")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Vuelva a escribir la contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /crear/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
  });

  test("muestra error si los campos están vacíos", async () => {
    render(
      <MemoryRouter>
        <ModalCuentasClientes
          cerrarModal={cerrarModalMock}
          datosCliente={datosCliente}
          mostrarSeccion={mostrarSeccionMock}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /crear/i }));

    await waitFor(() => {
      expect(require("sonner").toast.error).toHaveBeenCalledWith("Faltan campos por llenar modal⚠️");
    });
  });

  test("muestra error si las contraseñas no coinciden", async () => {
    render(
      <MemoryRouter>
        <ModalCuentasClientes
          cerrarModal={cerrarModalMock}
          datosCliente={datosCliente}
          mostrarSeccion={mostrarSeccionMock}
        />
      </MemoryRouter>
    );
  
    fireEvent.change(screen.getByPlaceholderText("Ingrese una contraseña"), {
      target: { value: "12345678" },
    });
  
    fireEvent.change(screen.getByPlaceholderText("Vuelva a escribir la contraseña"), {
      target: { value: "87654321" },
    });
  
    fireEvent.click(screen.getByRole("button", { name: /crear/i }));
  
    await waitFor(() => {
      expect(require("sonner").toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Las contraseñas no coinciden")
      );
    });
  });
  

  test("crea cuenta exitosamente si los datos son válidos", async () => {
    ClientesFun.guardarCliente.mockResolvedValue({ id_pers: 1 });
    ClientesFun.crearCuenta.mockResolvedValue(true);
    ClientesFun.generarTokenValidacion.mockResolvedValue(true);
    ClientesFun.enviarCorreoEmail.mockResolvedValue(true);

    render(
      <MemoryRouter>
        <ModalCuentasClientes
          cerrarModal={cerrarModalMock}
          datosCliente={datosCliente}
          mostrarSeccion={mostrarSeccionMock}
        />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText("Ingrese una contraseña"), {
      target: { value: "password123" },
    });

    fireEvent.change(screen.getByPlaceholderText("Vuelva a escribir la contraseña"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /crear/i }));

    await waitFor(() => {
      expect(ClientesFun.guardarCliente).toHaveBeenCalled();
      expect(ClientesFun.crearCuenta).toHaveBeenCalled();
      expect(ClientesFun.enviarCorreoEmail).toHaveBeenCalled();
      expect(mostrarSeccionMock).toHaveBeenCalledWith("clientes");
    });
  });
});
