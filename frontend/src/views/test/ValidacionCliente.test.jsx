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
        email_pers: "juan@test.com",
        id_estado: 3, 
      },
      {
        cedr_cli: "0987654321",
        nom_cli: "Ana",
        ape_cli: "Gómez",
        tel_pers: "1111-1111",
        cel_pers: "9999-9999",
        email_pers: "ana@test.com",
        id_estado: 4, 
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

    const iconoCorreo = screen.getByTestId("icono-correo-0"); // 0 es el índice de Juan
    fireEvent.click(iconoCorreo);

    await waitFor(() => {
      expect(screen.getByTestId("modal-reenvio")).toBeInTheDocument();
    });
  });
  it("Muestra componente de carga mientras se cargan los datos", async () => {
    ClientesFun.obtenerClientePeniente.mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve(mockClientes), 100))
    );

    renderComponent();
    expect(screen.getByTestId("cargando-tabla")).toBeInTheDocument();
  });
  it("Borra el filtro y muestra todos los clientes nuevamente", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Juan"));

    const inputBuscar = screen.getByPlaceholderText(/Ingrese numero de cedula/i);
    fireEvent.change(inputBuscar, { target: { value: "123" } });

    await waitFor(() => {
      expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    });

    const botonLimpiar = screen.getByTestId("btn-borrar-filtro");
    fireEvent.click(botonLimpiar);

    await waitFor(() => {
      expect(screen.getByText("Ana")).toBeInTheDocument();
    });
  });

  it("Muestra error en consola si falla obtener clientes", async () => {
    const spy = jest.spyOn(console, "log").mockImplementation(() => { });
    ClientesFun.obtenerClientePeniente.mockRejectedValue(new Error("Falló carga"));

    renderComponent();

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith("Ha ocurrido un error");
    });

    spy.mockRestore();
  });
  it("Guarda cliente en localStorage al reenviar correo", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Juan"));

    const iconoCorreo = screen.getByTestId("icono-correo-0");
    fireEvent.click(iconoCorreo);

    const stored = JSON.parse(localStorage.getItem("editCorreo"));
    expect(stored).toEqual({
      edit: true,
      cliente: mockClientes.rows[0]
    });
  });
  it("Actualiza los datos al hacer clic en actualizar", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Juan"));

    ClientesFun.obtenerClientePeniente.mockResolvedValueOnce({
      rows: [{
        cedr_cli: "1111111111",
        nom_cli: "Carlos",
        ape_cli: "Lopez",
        email_pers: "carlos@test.com"
      }]
    });

    const botonActualizar = screen.getByTestId("btn-actualizar");
    fireEvent.click(botonActualizar);

    await waitFor(() => {
      expect(screen.getByText("Carlos")).toBeInTheDocument();
      expect(screen.queryByText("Juan")).not.toBeInTheDocument();
    });
  });
  it("Muestra correctamente el texto 'Cambiar contraseña' y 'Cargar Archivos'", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Cambiar contraseña")).toBeInTheDocument();
      expect(screen.getByText("Cargar Archivos")).toBeInTheDocument();
    });
  });

  it("Muestra mensaje personalizado si no hay datos", async () => {
    ClientesFun.obtenerClientePeniente.mockResolvedValueOnce({ rows: [] });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("No ha selecionado ninguna actividad")).toBeInTheDocument();
    });
  });

  it("No encuentra clientes al buscar cédula inexistente", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Juan"));

    const input = screen.getByPlaceholderText(/Ingrese numero de cedula/i);
    fireEvent.change(input, { target: { value: "000" } });

    await waitFor(() => {
      expect(screen.queryByText("Juan")).not.toBeInTheDocument();
      expect(screen.queryByText("Ana")).not.toBeInTheDocument();
    });

    expect(screen.getByText("No ha selecionado ninguna actividad")).toBeInTheDocument();
  });

  it("Ejecuta correctamente el botón de actualizar (refrescar)", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Juan"));

    const iconoRefrescar = screen.getByTestId("btn-actualizar"); // SlRefresh es un ícono sin rol accesible
    fireEvent.click(iconoRefrescar);

    await waitFor(() => {
      expect(ClientesFun.obtenerClientePeniente).toHaveBeenCalledTimes(2);
    });
  });

  it("Abre el modal y guarda el cliente en localStorage", async () => {
    renderComponent();
    await waitFor(() => screen.getByText("Juan"));

    const iconoCorreo = screen.getByTestId("icono-correo-0");
    fireEvent.click(iconoCorreo);

    await waitFor(() => {
      expect(screen.getByTestId("modal-reenvio")).toBeInTheDocument();
    });

    const stored = JSON.parse(localStorage.getItem("editCorreo"));
    expect(stored).toEqual({
      edit: true,
      cliente: expect.objectContaining({ cedr_cli: "1234567890" })
    });
  });


});
