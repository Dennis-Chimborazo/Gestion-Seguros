import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EditarSeguroAdmin from "../segurosAdmin/EditarSeguroAdmin";
import SegurosAdminFun from "../segurosAdmin/SegurosAdminFun";

// Simular funciones necesarias
jest.mock("../segurosAdmin/SegurosAdminFun", () => ({
  categoria: jest.fn(),
  SeguroBeneficios: jest.fn(),
  beneficios: jest.fn(),
}));

beforeEach(() => {
  const mockSeguro = {
    seguro: {
      nom_tip_seg: "Seguro Vida Plus",
      descrip_tip_seg: "Protección completa para tu familia",
      pago_tip_seg: "$100/mes",
      suma_tip_seg: "$200,000",
      id_estado: "activo",
      id_tip_seg: 1,
    },
    beneficios: [1, 2],
  };

  localStorage.setItem("editSeguro", JSON.stringify(mockSeguro));

  SegurosAdminFun.categoria.mockResolvedValue([
    { id_categoria: 1, nom_categoria: "Vida" }
  ]);

  SegurosAdminFun.SeguroBeneficios.mockResolvedValue([
    { id_beneficios: 1, id_categoria: 1 },
    { id_beneficios: 2, id_categoria: 1 },
  ]);

  SegurosAdminFun.beneficios.mockResolvedValue([
    { id_beneficios: 1, nom_beneficios: "Cobertura total" },
    { id_beneficios: 2, nom_beneficios: "Atención médica" },
  ]);
});

it("debe renderizar correctamente el formulario con datos precargados", async () => {
  const mockMostrarSeccion = jest.fn();

  render(
    <MemoryRouter>
      <EditarSeguroAdmin mostrarSeccion={mockMostrarSeccion} />
    </MemoryRouter>
  );

  await waitFor(async () => {
    const inputPago = await screen.findByPlaceholderText("Ej.: $50/mes");
    expect(inputPago.value).toBe("$100/mes");
  });
  

  await waitFor(async () => {
    const inputSuma = await screen.findByPlaceholderText("En caso de fallecimiento");
    expect(inputSuma.value).toBe("$200,000");
  });
  
});
it("debe mostrar los beneficios seleccionados precargados", async () => {
  render(
    <MemoryRouter>
      <EditarSeguroAdmin mostrarSeccion={jest.fn()} />
    </MemoryRouter>
  );

  await waitFor(() => {
    expect(screen.findByPlaceholderText("Cobertura total"));
    expect(screen.findByPlaceholderText("Atención médica"));
  });
});
it("debe permitir editar el campo de pago", async () => {
  render(
    <MemoryRouter>
      <EditarSeguroAdmin mostrarSeccion={jest.fn()} />
    </MemoryRouter>
  );

  const inputPago = await screen.findByPlaceholderText("Ej.: $50/mes");
  fireEvent.change(inputPago, { target: { value: "$150/mes" } });

  expect(inputPago.value).toBe("$150/mes");
});

it("debe llamar a mostrarSeccion al hacer clic en Cancelar", async () => {
  const mockMostrarSeccion = jest.fn();

  render(
    <MemoryRouter>
      <EditarSeguroAdmin mostrarSeccion={mockMostrarSeccion} />
    </MemoryRouter>
  );

  const botonCancelar = screen.getByText(/Cancelar/i);
  fireEvent.click(botonCancelar);

  expect(mockMostrarSeccion).toHaveBeenCalled();
});

it("debe permitir cambiar el estado del seguro", async () => {
  render(
    <MemoryRouter>
      <EditarSeguroAdmin mostrarSeccion={jest.fn()} />
    </MemoryRouter>
  );

  // Encuentra el botón "Desactivar Seguro" y haz clic en él
  const botonDesactivar = await screen.findByRole("button", { name: /Desactivar Seguro/i });
  fireEvent.click(botonDesactivar);

  expect(botonDesactivar).toBeInTheDocument();
});

