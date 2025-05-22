import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ModalDependientes from "../gestionContratacion/ModalDependientes"; // Ajusta la ruta
import { toast } from "sonner";

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
  Toaster: () => <div data-testid="toaster" />,
}));

const mockCerrarModal = jest.fn();
const mockSetListDependientes = jest.fn();

const setup = () => {
  render(
    <ModalDependientes
      cerrarModal={mockCerrarModal}
      setListDependientes={mockSetListDependientes}
      listDependientes={[]}
    />
  );
};

describe("ModalDependientes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    document.body.innerHTML = "";
  });

  test("renderiza correctamente el formulario", () => {
    setup();
    expect(screen.getByText(/Dependiente/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Cédula")).toBeInTheDocument();
    expect(screen.getByLabelText("Pasaporte")).toBeInTheDocument();
  });

  test("muestra error si faltan campos", async () => {
    setup();
    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Faltan campos por llenar ⚠️");
    });
  });

  test("muestra error si condiciones están incompletas", async () => {
    setup();

    fireEvent.change(screen.getByRole("textbox", { name: "" }), {
      target: { value: "123456" }, // usa el primer textbox vacío (Número de identificación)
    });
    fireEvent.click(screen.getByLabelText("Cédula"));
    fireEvent.change(screen.getByDisplayValue("123456"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByDisplayValue("123456").closest("form").querySelector("#nom_depen"), {
      target: { value: "Juan" },
    });
    fireEvent.change(screen.getByDisplayValue("Juan").closest("form").querySelector("#ape_depen"), {
      target: { value: "Pérez" },
    });
    fireEvent.change(screen.getByDisplayValue("Pérez").closest("form").querySelector("#fecha_naci_depen"), {
      target: { value: "2000-01-01" },
    });
    fireEvent.change(screen.getByDisplayValue("2000-01-01").closest("form").querySelector("#parent_depen"), {
      target: { value: "Hijo" },
    });

    fireEvent.click(screen.getByLabelText("M"));

    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("hay datos incompletos en condiciones medicas ⚠️");
    });
  });

  test("guarda dependiente correctamente si los datos están completos", async () => {
    setup();

    fireEvent.change(screen.getByRole("textbox", { name: "" }), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByLabelText("Pasaporte"));
    fireEvent.change(screen.getByDisplayValue("123456").closest("form").querySelector("#nom_depen"), {
      target: { value: "Lucía" },
    });
    fireEvent.change(screen.getByDisplayValue("Lucía").closest("form").querySelector("#ape_depen"), {
      target: { value: "Ramírez" },
    });
    fireEvent.change(screen.getByDisplayValue("Ramírez").closest("form").querySelector("#fecha_naci_depen"), {
      target: { value: "2010-05-12" },
    });
    fireEvent.change(screen.getByDisplayValue("2010-05-12").closest("form").querySelector("#parent_depen"), {
      target: { value: "Hija" },
    });
    fireEvent.click(screen.getByLabelText("F"));

    fireEvent.change(screen.getByLabelText("Diagnóstico"), {
      target: { value: "Asma" },
    });
    fireEvent.change(screen.getByLabelText(/fecha desde/i), {
      target: { value: "2022-01-01" },
    });
    fireEvent.change(screen.getByLabelText(/Fecha hasta/i), {
      target: { value: "2023-01-01" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Guardar/i }));

    await waitFor(() => {
      expect(mockSetListDependientes).toHaveBeenCalled();
      expect(mockCerrarModal).toHaveBeenCalled();
    });
  });
});
