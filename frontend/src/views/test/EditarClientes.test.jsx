// __tests__/EditarClientes.test.jsx
import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import EditarClientes from "../clientes/EditarClientes";
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
  actualizarCliente: jest.fn(),
  actualizarEstadoCliente: jest.fn(),
  buscarDireccionCliente: jest.fn(),
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

// Setup mock edit data for localStorage
const mockEditData = {
  cliente: {
    id_pers: 123,
    cedr_cli: "1234567890",
    tipo_cedr_cli: "cedula",
    nom_cli: "Juan",
    ape_cli: "Perez",
    nacion_cli: "Ecuatoriana",
    fecha_naci_cli: "1990-01-01",
    lugar_naci_cli: "Quito",
    tel_pers: "02223344",
    cel_pers: "0998765432",
    email_pers: "juan.perez@example.com",
    edad_pers: "30",
    estatura_cli: "170",
    peso_cli: "70 kg",
    parroq_cli: "Parroquia",
    calle_princ_pers: "Calle 1",
    calle_secun_pers: "Calle 2",
    sexo_cli: "masculino",
    estado_civil_pers: "soltero",
    id_ciud: 1,
  }
};

const renderWithRouter = (ui) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe("EditarClientes component", () => {
  const mockMostrarSeccion = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem("edit", JSON.stringify(mockEditData));
    ClientesFun.traerPaises.mockResolvedValue(mockPaises);
    ClientesFun.traerProvincias.mockResolvedValue(mockProvincias);
    ClientesFun.traerCiudades.mockResolvedValue(mockCiudades);
    ClientesFun.actualizarCliente.mockResolvedValue(true);
    ClientesFun.actualizarEstadoCliente.mockResolvedValue(true);
    ClientesFun.buscarDireccionCliente.mockResolvedValue([
      {
        id_pais: 1,
        id_provin: 1,
        id_ciud: 1,
        nom_pais: "Ecuador",
        nom_provin: "Pichincha",
        nom_ciud: "Quito"
      }
    ]);
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("renderiza correctamente el formulario con datos cargados", async () => {
    await act(async () => {
      renderWithRouter(<EditarClientes mostrarSeccion={mockMostrarSeccion} />);
    });

    expect(screen.getByText("Editar Cliente")).toBeInTheDocument();

    expect(screen.getByPlaceholderText("Ingrese los apellidos")).toHaveValue("Perez");
    expect(screen.getByPlaceholderText("Ingrese los nombres")).toHaveValue("Juan");
    expect(screen.getByPlaceholderText("Ingrese la nacionalidad")).toHaveValue("Ecuatoriana");
    expect(screen.getByPlaceholderText("Ingrese ID")).toHaveValue("1234567890");
    expect(screen.getByText("Guardar Cambios")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();

    await waitFor(() => {
  expect(document.getElementById("cedula").checked).toBe(true);
});
    expect(document.getElementById("masculino").checked).toBe(true);
    expect(document.getElementById("soltero").checked).toBe(true);

    expect(screen.getByPlaceholderText("Ingrese el peso")).toHaveValue("70");
    expect(document.getElementById("kg").checked).toBe(true);
  });

  test("carga países al iniciar", async () => {
    await act(async () => {
      renderWithRouter(<EditarClientes mostrarSeccion={mockMostrarSeccion} />);
    });

    expect(ClientesFun.traerPaises).toHaveBeenCalledTimes(1);
  });

  test("verifica selección de tipo de identificación", async () => {
    await act(async () => {
      renderWithRouter(<EditarClientes mostrarSeccion={mockMostrarSeccion} />);
    });

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
      renderWithRouter(<EditarClientes mostrarSeccion={mockMostrarSeccion} />);
    });

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
      renderWithRouter(<EditarClientes mostrarSeccion={mockMostrarSeccion} />);
    });

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

  test("verifica selección de tipo de peso y errores", async () => {
    const { toast } = require("sonner");

    await act(async () => {
      renderWithRouter(<EditarClientes mostrarSeccion={mockMostrarSeccion} />);
    });

    const pesoInput = screen.getByPlaceholderText("Ingrese el peso");
    const kgCheckbox = document.getElementById("kg");
    const lbCheckbox = document.getElementById("lb");

    // Sin peso, intentar seleccionar kg
    await act(async () => {
      fireEvent.change(pesoInput, { target: { value: "" } });
      fireEvent.click(kgCheckbox);
    });
    expect(toast.error).toHaveBeenCalled();

    // Ingresar peso y seleccionar kg
    await act(async () => {
      fireEvent.change(pesoInput, { target: { value: "70" } });
      fireEvent.click(kgCheckbox);
    });
    expect(kgCheckbox.checked).toBe(true);

    // Cambiar a libras
    await act(async () => {
      fireEvent.click(lbCheckbox);
    });
    expect(lbCheckbox.checked).toBe(true);
    expect(kgCheckbox.checked).toBe(false);
  });

  test("maneja correctamente el cambio en el campo de peso", async () => {
    await act(async () => {
      renderWithRouter(<EditarClientes mostrarSeccion={mockMostrarSeccion} />);
    });

    const pesoInput = screen.getByPlaceholderText("Ingrese el peso");
    const kgCheckbox = document.getElementById("kg");

    await act(async () => {
      fireEvent.change(pesoInput, { target: { value: "70" } });
      fireEvent.click(kgCheckbox);
      fireEvent.change(pesoInput, { target: { value: "" } });
    });

    expect(kgCheckbox.checked).toBe(false);
    expect(pesoInput.value).toBe("");
  });

  test("muestra error cuando no hay cambios y se intenta guardar", async () => {
    // Render component
    await act(async () => {
      renderWithRouter(<EditarClientes mostrarSeccion={mockMostrarSeccion} />);
    });

    // Dispara el clic en el botón de guardar
    const btnGuardar = screen.getByRole('button', { name: /guardar cambios/i });
    await act(async () => {
      fireEvent.click(btnGuardar);
    });

    // Espera que toast.error haya sido llamado
    await waitFor(() => {
      expect(require("sonner").toast.error).toHaveBeenCalled();
    });

    expect(ClientesFun.actualizarCliente).not.toHaveBeenCalled();
  });


  test("permite cancelar el formulario con confirmación", async () => {
    const swal = require("sweetalert2");
    swal.fire.mockResolvedValue({ isConfirmed: true });

    await act(async () => {
      renderWithRouter(<EditarClientes mostrarSeccion={mockMostrarSeccion} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Cancelar"));
    });

    await waitFor(() => {
      expect(mockMostrarSeccion).toHaveBeenCalledWith("clientes");
    });
  });


  test("permite cancelar el formulario sin confirmación", async () => {
    const swal = require("sweetalert2");
    // No se simula la confirmación
    swal.fire.mockResolvedValue({ isConfirmed: false }); // Esta línea se elimina

    await act(async () => {
      renderWithRouter(<EditarClientes mostrarSeccion={mockMostrarSeccion} />);
    });

    await act(async () => {
      fireEvent.click(screen.getByText("Cancelar"));
    });
  });


});
