import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import CrearSeguroAdmin from "../segurosAdmin/CrearSeguroAdmin";
import SegurosAdminFun from "../segurosAdmin/SegurosAdminFun";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";

// Mock de funciones externas
jest.mock("../segurosAdmin/SegurosAdminFun", () => ({
  categoria: jest.fn(),
  beneficios: jest.fn(),
  guardarTipoSeguro: jest.fn(),
  guardarBeneficioSeguro: jest.fn(),
}));

jest.mock("sweetalert2", () => ({
  fire: jest.fn(() => Promise.resolve({ isConfirmed: true })),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}));

const renderComponent = () => {
  return render(
    <BrowserRouter>
      <CrearSeguroAdmin mostrarSeccion={jest.fn()} />
    </BrowserRouter>
  );
};

describe("CrearSeguroAdmin", () => {
  beforeEach(() => {
    SegurosAdminFun.categoria.mockResolvedValue([
      { id_categoria: 1, nom_categoria: "Vida" },
    ]);
    SegurosAdminFun.beneficios.mockResolvedValue([
      { id_beneficios: 101, nom_beneficios: "Cobertura por accidente" },
    ]);
    SegurosAdminFun.guardarTipoSeguro.mockResolvedValue({
      data: { id_tip_seg: 123 },
    });
    SegurosAdminFun.guardarBeneficioSeguro.mockResolvedValue({});
  });

  test("renderiza campos del formulario", async () => {
    renderComponent();

    expect(await screen.findByLabelText("Nombre del seguro")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
    expect(screen.getByText("Guardar")).toBeInTheDocument();
    expect(screen.getByText("Cancelar")).toBeInTheDocument();
  });

  test("muestra error si se envía el formulario vacío", async () => {
    renderComponent();

    const botonGuardar = await screen.findByText("Guardar");
    fireEvent.click(botonGuardar);

    await waitFor(() => {
      expect(require("sonner").toast.error).toHaveBeenCalledWith("Faltan campos por llenar ⚠️");
    });
  });

  test("permite completar el formulario y guardar", async () => {
    renderComponent();
  
    fireEvent.change(await screen.findByLabelText("Nombre del seguro"), {
      target: { value: "Seguro Vida Básico" },
    });
    fireEvent.change(screen.getByLabelText("Descripción"), {
      target: { value: "Cobertura básica por fallecimiento" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej.: $50/mes"), {
      target: { value: "$50/mes" },
    });
    fireEvent.change(screen.getByPlaceholderText("En caso de fallecimiento"), {
      target: { value: "$10,000" },
    });
  
    // ✅ Abrir el select de categoría correctamente con react-select
    const categoriaInput = screen.getByRole("combobox"); // o: getByRole("combobox", { name: "Categoría" }) si configuraste inputId
    await userEvent.click(categoriaInput);
  
    // Seleccionar la opción "Vida"
    const optionVida = await screen.findByText((content, element) =>
      element.tagName.toLowerCase() === "div" && content === "Vida"
    );
    await userEvent.click(optionVida);
  
    // Esperar a que se carguen los beneficios
    await waitFor(() => {
      expect(SegurosAdminFun.beneficios).toHaveBeenCalled();
    });
  
    const checkbox = await screen.findByRole("checkbox");
    fireEvent.click(checkbox);
  
    const botonGuardar = screen.getByText("Guardar");
    fireEvent.click(botonGuardar);
  
    await waitFor(() => {
      expect(SegurosAdminFun.guardarTipoSeguro).toHaveBeenCalled();
      expect(SegurosAdminFun.guardarBeneficioSeguro).toHaveBeenCalled();
    });
  });
  test("Cancelar sin haber llenado campos: cambia de vista sin alerta", async () => {
    const mockMostrarSeccion = jest.fn();
    render(
      <BrowserRouter>
        <CrearSeguroAdmin mostrarSeccion={mockMostrarSeccion} />
      </BrowserRouter>
    );
  
    fireEvent.click(screen.getByText("Cancelar"));
  
    await waitFor(() => {
      expect(mockMostrarSeccion).toHaveBeenCalledWith("segurosAdmin");
    });
  
    // Verifica que no se llama SweetAlert (no hay confirmación)
    expect(require("sweetalert2").fire).not.toHaveBeenCalled();
  });
  
  
  test("Guardar con algunos campos vacíos: muestra mensaje de campos vacíos", async () => {
    renderComponent();
  
    fireEvent.change(await screen.findByLabelText("Nombre del seguro"), {
      target: { value: "Seguro Incompleto" },
    });
  
    fireEvent.click(screen.getByText("Guardar"));
  
    await waitFor(() => {
      expect(require("sonner").toast.error).toHaveBeenCalledWith("Faltan campos por llenar ⚠️");
    });
  });
  
  test("Guardar con todos los campos pero sin beneficios: muestra mensaje de incompleto", async () => {
    renderComponent();
  
    fireEvent.change(await screen.findByLabelText("Nombre del seguro"), {
      target: { value: "Seguro sin beneficios" },
    });
    fireEvent.change(screen.getByLabelText("Descripción"), {
      target: { value: "Descripción válida" },
    });
    fireEvent.change(screen.getByPlaceholderText("Ej.: $50/mes"), {
      target: { value: "$40/mes" },
    });
    fireEvent.change(screen.getByPlaceholderText("En caso de fallecimiento"), {
      target: { value: "$10000" },
    });
  
    const categoriaInput = screen.getByRole("combobox");
    await userEvent.click(categoriaInput);
    const opcion = await screen.findByText("Vida");
    await userEvent.click(opcion);
  
    // NO se seleccionan beneficios
  
    fireEvent.click(screen.getByText("Guardar"));
  
    await waitFor(() => {
      expect(require("sonner").toast.error).toHaveBeenCalledWith("Debe seleccionar minimo un beneficio ⚠️");
    });
  });
  
});
