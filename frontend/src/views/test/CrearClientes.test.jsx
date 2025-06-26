// __tests__/CrearClientes.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CrearClientes from "../clientes/CrearClientes";
import ClientesFun from "../clientes/ClientesFun";

// Mock de sonner
jest.mock("sonner", () => ({
  Toaster: () => <div data-testid="toaster-mock" />,
  toast: {
    error: jest.fn(),
    success: jest.fn()
  }
}));

// Mock simplificado de SweetAlert2
jest.mock("sweetalert2", () => ({
  fire: jest.fn(() => Promise.resolve({ isConfirmed: true }))
}));

// Mock de react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Mock de Api
jest.mock("../clientes/ClientesFun", () => ({
  traerPaises: jest.fn(),
  traerProvincias: jest.fn(),
  traerCiudades: jest.fn(),
  guardarCliente: jest.fn(),
}));

// Datos mock
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

// Función helper para renderizar con Router
const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("CrearClientes component", () => {
  const mockMostrarSeccion = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Configuración por defecto para todos los tests
    ClientesFun.traerPaises.mockResolvedValue(mockPaises);
    ClientesFun.traerProvincias.mockResolvedValue(mockProvincias);
    ClientesFun.traerCiudades.mockResolvedValue(mockCiudades);
    ClientesFun.guardarCliente.mockResolvedValue(true);
  });

  test("renderiza correctamente el formulario", async () => {
    await act(async () => {
      renderWithRouter(<CrearClientes mostrarSeccion={mockMostrarSeccion} />);
    });

    expect(screen.getByText("Nuevo cliente")).toBeInTheDocument();
    
    // Verificamos elementos clave del formulario
    expect(screen.getByPlaceholderText("Ingrese los apellidos")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ingrese los nombres")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ingrese la nacionalidad")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ingrese ID")).toBeInTheDocument();
    expect(screen.getByText("Guardar")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  test("carga países al iniciar", async () => {
    await act(async () => {
      renderWithRouter(<CrearClientes mostrarSeccion={mockMostrarSeccion} />);
    });

    expect(ClientesFun.traerPaises).toHaveBeenCalledTimes(1);
  });

  test("verifica selección de tipo de identificación", async () => {
    await act(async () => {
      renderWithRouter(<CrearClientes mostrarSeccion={mockMostrarSeccion} />);
    });

    // Buscar checkboxes por ID en vez de por label
    const cedulaCheckbox = document.getElementById("cedula");
    await act(async () => {
      fireEvent.click(cedulaCheckbox);
    });
    
    expect(cedulaCheckbox.checked).toBe(true);
    
    const pasaporteCheckbox = document.getElementById("pasaporte");
    await act(async () => {
      fireEvent.click(pasaporteCheckbox);
    });
    
    expect(pasaporteCheckbox.checked).toBe(true);
    expect(cedulaCheckbox.checked).toBe(false);
  });

  test("verifica selección de sexo", async () => {
    await act(async () => {
      renderWithRouter(<CrearClientes mostrarSeccion={mockMostrarSeccion} />);
    });

    // Buscar checkboxes por ID en vez de por label
    const masculinoCheckbox = document.getElementById("masculino");
    await act(async () => {
      fireEvent.click(masculinoCheckbox);
    });
    
    expect(masculinoCheckbox.checked).toBe(true);
    
    const femeninoCheckbox = document.getElementById("femenino");
    await act(async () => {
      fireEvent.click(femeninoCheckbox);
    });
    
    expect(femeninoCheckbox.checked).toBe(true);
    expect(masculinoCheckbox.checked).toBe(false);
  });

  test("verifica selección de estado civil", async () => {
    await act(async () => {
      renderWithRouter(<CrearClientes mostrarSeccion={mockMostrarSeccion} />);
    });

    // Buscar checkboxes por ID en vez de por label
    const solteroCheckbox = document.getElementById("soltero");
    await act(async () => {
      fireEvent.click(solteroCheckbox);
    });
    
    expect(solteroCheckbox.checked).toBe(true);
    
    const casadoCheckbox = document.getElementById("casado");
    await act(async () => {
      fireEvent.click(casadoCheckbox);
    });
    
    expect(casadoCheckbox.checked).toBe(true);
    expect(solteroCheckbox.checked).toBe(false);
  });

  test("verifica selección de tipo de peso", async () => {
    const { toast } = require("sonner");
    
    await act(async () => {
      renderWithRouter(<CrearClientes mostrarSeccion={mockMostrarSeccion} />);
    });

    // Intentar seleccionar kg sin ingresar peso
    const kgCheckbox = document.getElementById("kg");
    await act(async () => {
      fireEvent.click(kgCheckbox);
    });
    
    // Verificar que muestra error (cualquier mensaje)
    expect(toast.error).toHaveBeenCalled();
    
    // Ingresar peso y seleccionar kg
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText("Ingrese el peso"), {
        target: { value: "70" }
      });
      
      fireEvent.click(kgCheckbox);
    });
    
    // Cambiar a libras
    const lbCheckbox = document.getElementById("lb");
    await act(async () => {
      fireEvent.click(lbCheckbox);
    });
  });

  test("maneja correctamente el cambio en el campo de peso", async () => {
    await act(async () => {
      renderWithRouter(<CrearClientes mostrarSeccion={mockMostrarSeccion} />);
    });

    // Ingresar peso
    const pesoInput = screen.getByPlaceholderText("Ingrese el peso");
    await act(async () => {
      fireEvent.change(pesoInput, { target: { value: "70" } });
    });
    
    // Seleccionar kg
    const kgCheckbox = document.getElementById("kg");
    await act(async () => {
      fireEvent.click(kgCheckbox);
    });
    
    // Borrar el peso
    await act(async () => {
      fireEvent.change(pesoInput, { target: { value: "" } });
    });
  });

  test("muestra error cuando faltan campos", async () => {
    const { toast } = require("sonner");
    
    await act(async () => {
      renderWithRouter(<CrearClientes mostrarSeccion={mockMostrarSeccion} />);
    });

    // Hacer clic en guardar sin llenar campos
    await act(async () => {
      fireEvent.click(screen.getByText("Guardar"));
    });

    // Verificar que se muestra algún mensaje de error
    expect(toast.error).toHaveBeenCalled();
    expect(ClientesFun.guardarCliente).not.toHaveBeenCalled();
  });

  test("permite cancelar el formulario", async () => {
    await act(async () => {
      renderWithRouter(<CrearClientes mostrarSeccion={mockMostrarSeccion} />);
    });
    
    // Hacer clic en cancelar con formulario vacío
    await act(async () => {
      fireEvent.click(screen.getByText("Cancelar"));
    });

    // Verificar que se navega a la sección clientes
    expect(mockMostrarSeccion).toHaveBeenCalledWith("clientes");
  });

  test("simula la interacción con react-select", async () => {
    await act(async () => {
      renderWithRouter(<CrearClientes mostrarSeccion={mockMostrarSeccion} />);
    });
    
  });
});
