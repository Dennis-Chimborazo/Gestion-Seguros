// __tests__/CrearClientes.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CrearClientes from "../clientes/CrearClientes";
import ClientesFun from "../clientes/ClientesFun";

// Mock de Api
jest.mock("../clientes/ClientesFun", () => ({
  traerPaises: jest.fn(),
  traerProvincias: jest.fn(),
  traerCiudades: jest.fn(),
  guardarCliente: jest.fn(),
}));

const mockPaises = {
  rows: [
    { id_pais: 1, nom_pais: "Ecuador" },
    { id_pais: 2, nom_pais: "Colombia" },
  ],
};

const mockProvincias = [
  { id_provin: 1, nom_provin: "Pichincha" },
  { id_provin: 2, nom_provin: "Guayas" },
];

const mockCiudades = [
  { id_ciud: 1, nom_ciud: "Quito" },
  { id_ciud: 2, nom_ciud: "Guayaquil" },
];

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("CrearClientes component", () => {
  const mockMostrarSeccion = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renderiza correctamente el formulario", async () => {
    ClientesFun.traerPaises.mockResolvedValueOnce(mockPaises);

    renderWithRouter(<CrearClientes mostrarSeccion={mockMostrarSeccion} />);

    expect(await screen.findByText("Nuevo cliente")).toBeInTheDocument();
  });

  test("carga y muestra los países", async () => {
    ClientesFun.traerPaises.mockResolvedValueOnce(mockPaises);

    renderWithRouter(<CrearClientes mostrarSeccion={mockMostrarSeccion} />);

    const paisSelect = await screen.findByPlaceholderText("Seleccione el pais");
    fireEvent.change(paisSelect, { target: { value: "Ecuador" } });

    expect(screen.getByText("Ecuador")).toBeInTheDocument();
  });

  test("carga y muestra provincias al seleccionar un país", async () => {
    ClientesFun.traerPaises.mockResolvedValueOnce(mockPaises);
    ClientesFun.traerProvincias.mockResolvedValueOnce(mockProvincias);

    renderWithRouter(<CrearClientes mostrarSeccion={mockMostrarSeccion} />);

    const paisSelect = await screen.findByPlaceholderText("Seleccione el pais");
    fireEvent.change(paisSelect, { target: { value: "Ecuador" } });

    const provinciaSelect = await screen.findByPlaceholderText("Seleccione la provincia");
    fireEvent.change(provinciaSelect, { target: { value: "Pichincha" } });

    expect(screen.getByText("Pichincha")).toBeInTheDocument();
  });

  test("carga y muestra ciudades al seleccionar una provincia", async () => {
    ClientesFun.traerPaises.mockResolvedValueOnce(mockPaises);
    ClientesFun.traerProvincias.mockResolvedValueOnce(mockProvincias);
    ClientesFun.traerCiudades.mockResolvedValueOnce(mockCiudades);

    renderWithRouter(<CrearClientes mostrarSeccion={mockMostrarSeccion} />);

    const paisSelect = await screen.findByPlaceholderText("Seleccione el pais");
    fireEvent.change(paisSelect, { target: { value: "Ecuador" } });

    const provinciaSelect = await screen.findByPlaceholderText("Seleccione la provincia");
    fireEvent.change(provinciaSelect, { target: { value: "Pichincha" } });

    const ciudadSelect = await screen.findByPlaceholderText("Seleccione la ciudad");
    fireEvent.change(ciudadSelect, { target: { value: "Quito" } });

    expect(screen.getByText("Quito")).toBeInTheDocument();
  });

  test("envía correctamente los datos al guardar el cliente", async () => {
    ClientesFun.traerPaises.mockResolvedValueOnce(mockPaises);
    ClientesFun.traerProvincias.mockResolvedValueOnce(mockProvincias);
    ClientesFun.traerCiudades.mockResolvedValueOnce(mockCiudades);
    ClientesFun.guardarCliente.mockResolvedValueOnce(true);

    renderWithRouter(<CrearClientes mostrarSeccion={mockMostrarSeccion} />);

    const inputNombre = screen.getByPlaceholderText("Ingrese los nombres");
    fireEvent.change(inputNombre, { target: { value: "Juan" } });

    const inputApellido = screen.getByPlaceholderText("Ingrese los apellidos");
    fireEvent.change(inputApellido, { target: { value: "Pérez" } });

    const paisSelect = screen.getByPlaceholderText("Seleccione el pais");
    fireEvent.change(paisSelect, { target: { value: "Ecuador" } });

    const provinciaSelect = screen.getByPlaceholderText("Seleccione la provincia");
    fireEvent.change(provinciaSelect, { target: { value: "Pichincha" } });

    const ciudadSelect = screen.getByPlaceholderText("Seleccione la ciudad");
    fireEvent.change(ciudadSelect, { target: { value: "Quito" } });

    const btnGuardar = screen.getByRole("button", { name: /guardar/i });
    fireEvent.click(btnGuardar);

    await waitFor(() => expect(ClientesFun.guardarCliente).toHaveBeenCalled());
  });

  test("cancelar descarta los cambios y regresa a la lista de clientes", async () => {
    ClientesFun.traerPaises.mockResolvedValueOnce(mockPaises);

    renderWithRouter(<CrearClientes mostrarSeccion={mockMostrarSeccion} />);

    const inputNombre = screen.getByPlaceholderText("Ingrese los nombres");
    fireEvent.change(inputNombre, { target: { value: "Juan" } });

    const btnCancelar = screen.getByRole("button", { name: /cancelar/i });
    fireEvent.click(btnCancelar);

    await waitFor(() => expect(mockMostrarSeccion).toHaveBeenCalledWith("clientes"));
  });
});
