import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ModalReenvioValidacion from "../clientes/ModalReenvioValidacion";
import ClientesFun from "../clientes/ClientesFun";
import { toast } from "sonner";
import { MemoryRouter } from "react-router-dom";

jest.mock("../clientes/ClientesFun");
jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
  Toaster: () => <div />,
}));

const mockCerrarModal = jest.fn();
const mockMostrarSeccion = jest.fn();

beforeEach(() => {
  localStorage.setItem("editCorreo", JSON.stringify({
    cliente: {
      email_pers: "test@correo.com",
      id_pers: 1,
    }
  }));
  jest.clearAllMocks();
});

const renderWithRouter = (ui) => {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
};

test("Renderiza correctamente y muestra el email inicial", () => {
  renderWithRouter(
    <ModalReenvioValidacion cerrarModal={mockCerrarModal} mostrarSeccion={mockMostrarSeccion} />
  );
  expect(screen.getByText(/Reenvio de validacion de cuenta/i)).toBeInTheDocument();
  expect(screen.getByDisplayValue("test@correo.com")).toBeInTheDocument();
});

test("Muestra campo 'newEmail' al marcar checkbox", () => {
  renderWithRouter(<ModalReenvioValidacion cerrarModal={mockCerrarModal} mostrarSeccion={mockMostrarSeccion} />);
  const checkbox = screen.getByRole("checkbox");
  fireEvent.click(checkbox);
  expect(screen.getByLabelText(/Ingrese el nuevo Correo/i)).toBeInTheDocument();
});

test("Lanza error si se intenta actualizar sin ingresar nuevo correo", async () => {
  renderWithRouter(<ModalReenvioValidacion cerrarModal={mockCerrarModal} mostrarSeccion={mockMostrarSeccion} />);
  const checkbox = screen.getByRole("checkbox");
  fireEvent.click(checkbox);

  const boton = screen.getByRole("button", { name: /Actualizar y reenviar/i });
  fireEvent.click(boton);

  await waitFor(() => {
    expect(toast.error).toHaveBeenCalledWith("Ingrese el nuevo CorreoElectronico⚠️");
  });
});
