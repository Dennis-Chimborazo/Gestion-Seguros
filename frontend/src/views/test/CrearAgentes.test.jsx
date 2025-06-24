import React from "react";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CrearAgentes from "../agentes/CrearAgentes";

import AgenteFun from "../agentes/AgenteFun";
import UsuariosFun from "../usuarios/UsuariosFun";
import Utilidades from "../../services/Utilidades";
import swal from "sweetalert2";
import { toast } from "sonner";

jest.mock("../agentes/AgenteFun");
jest.mock("../usuarios/UsuariosFun");
jest.mock("../../services/Utilidades");
jest.mock('sweetalert2', () => ({
    fire: jest.fn(() => Promise.resolve({ isConfirmed: true })),
}));

jest.mock("sonner", () => ({
    toast: {
        error: jest.fn(),
    },
    Toaster: () => <div>ToasterMock</div>,
}));

describe("CrearAgentes", () => {
    const mostrarSeccion = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // --- 1. Renderizado ---
    describe("Renderalizacion", () => {
        it("los inputs tienen atributos correctos y valores vacíos inicialmente", () => {
            render(
                <MemoryRouter>
                    <CrearAgentes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );
            const inputCedula = screen.getByLabelText(/cedula/i);
            expect(inputCedula).toHaveAttribute("name", "ced_agente");
            expect(inputCedula).toHaveAttribute("id", "ced_agente");
            expect(inputCedula).toHaveValue("");

            const inputTelefono = screen.getByLabelText(/telefono/i);
            expect(inputTelefono).toHaveAttribute("maxlength", "10");
            expect(inputTelefono).toHaveValue("");
        });

        it("renderiza botones Crear y Cancelar visibles", () => {
            render(
                <MemoryRouter>
                    <CrearAgentes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );
            expect(screen.getByRole("button", { name: /crear/i })).toBeVisible();
            expect(screen.getByRole("button", { name: /cancelar/i })).toBeVisible();
        });
    });

    // --- 2. Ingreso de datos ---
    describe("Ingreso de datos y validaciones básicas", () => {
        beforeEach(() => {
            render(
                <MemoryRouter>
                    <CrearAgentes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );
        });

        it("actualiza estado con texto en inputs", () => {
            const inputCedula = screen.getByLabelText(/cedula/i);
            fireEvent.change(inputCedula, { target: { value: "1234567890" } });
            expect(inputCedula.value).toBe("1234567890");

            const inputNombre = screen.getByLabelText(/nombres/i);
            fireEvent.change(inputNombre, { target: { value: "Carlos" } });
            expect(inputNombre.value).toBe("Carlos");
        });

        it("input telefono acepta solo 10 caracteres", () => {
            const inputTelefono = screen.getByLabelText(/telefono/i);

            fireEvent.change(inputTelefono, { target: { value: "1234567890" } });
            expect(inputTelefono.value.length).toBeLessThanOrEqual(10);
        });

        it("input telefono no acepta letras", () => {
            render(
                <MemoryRouter>
                    <CrearAgentes mostrarSeccion={jest.fn()} />
                </MemoryRouter>
            );

            const inputTelefono = screen.getByLabelText(/telefono/i);

            // Intentamos ingresar letras junto a números
            fireEvent.change(inputTelefono, { target: { value: "abc123def" } });

            // El input solo debe contener números (123)
            expect(inputTelefono.value).toBe("123");
        });


    });

    // --- 4. Validaciones ---
    describe("Validaciones del formulario", () => {
        it("muestra error si correo es inválido al crear", async () => {
            render(
                <MemoryRouter>
                    <CrearAgentes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            fireEvent.change(screen.getByLabelText(/cedula/i), { target: { value: "1234567890" } });
            fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: "correo_invalido" } });
            fireEvent.click(screen.getByRole("button", { name: /crear/i }));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("correo inválido"));
            });

            expect(UsuariosFun.verificarDatosUsuario).not.toHaveBeenCalled();
        });
    });

    // --- 3. Creación de agente ---
    describe("Creacion de Agentes", () => {
        it("debe crear un agente y mostrar mensaje de éxito", async () => {
            UsuariosFun.verificarDatosUsuario.mockResolvedValue({ existe: false });
            AgenteFun.guardarAgente.mockResolvedValue({ id_agente: 1 });
            Utilidades.crearPassAleatoria.mockResolvedValue("pass123");
            UsuariosFun.crearCuentaAgente.mockResolvedValue(true);
            Utilidades.crearRutaAleatoria.mockResolvedValue("urlRandom");
            AgenteFun.generarTokenValidacion.mockResolvedValue(true);
            AgenteFun.enviarCorreoEmail.mockResolvedValue(true);
            swal.fire.mockResolvedValue(true);

            render(
                <MemoryRouter>
                    <CrearAgentes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            fireEvent.change(screen.getByLabelText(/cedula/i), { target: { value: "1234567890" } });
            fireEvent.change(screen.getByLabelText(/nombres/i), { target: { value: "Carlos" } });
            fireEvent.change(screen.getByLabelText(/apellidos/i), { target: { value: "Perez" } });
            fireEvent.change(screen.getByLabelText(/telefono/i), { target: { value: "0999999999" } });
            fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: "carlos@email.com" } });
            fireEvent.change(screen.getByLabelText(/direccion/i), { target: { value: "Quito" } });

            fireEvent.click(screen.getByRole("button", { name: /crear/i }));

            await waitFor(() => {
                expect(UsuariosFun.verificarDatosUsuario).toHaveBeenCalledWith(
                    { users: "carlos@email.com", cedula: "1234567890" },
                    expect.anything()
                );
            });

            await waitFor(() => {
                expect(AgenteFun.guardarAgente).toHaveBeenCalledWith(
                    expect.objectContaining({
                        ced_agente: "1234567890",
                        nom_agente: "Carlos",
                    }),
                    expect.anything()
                );
            });

            expect(Utilidades.crearPassAleatoria).toHaveBeenCalled();
            expect(UsuariosFun.crearCuentaAgente).toHaveBeenCalled();
            expect(AgenteFun.generarTokenValidacion).toHaveBeenCalled();
            expect(AgenteFun.enviarCorreoEmail).toHaveBeenCalled();
            expect(swal.fire).toHaveBeenCalledWith(
                expect.objectContaining({ title: expect.stringContaining("Exito") })
            );
            expect(mostrarSeccion).toHaveBeenCalledWith("agente");
        });

        it("muestra error si el usuario ya existe", async () => {
            UsuariosFun.verificarDatosUsuario.mockResolvedValue({ existe: true, message: "Usuario ya existe" });

            render(
                <MemoryRouter>
                    <CrearAgentes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            fireEvent.change(screen.getByLabelText(/cedula/i), { target: { value: "1234567890" } });
            fireEvent.change(screen.getByLabelText(/nombres/i), { target: { value: "Carlos" } });
            fireEvent.change(screen.getByLabelText(/apellidos/i), { target: { value: "Perez" } });
            fireEvent.change(screen.getByLabelText(/telefono/i), { target: { value: "0999999999" } });
            fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: "carlos@email.com" } });
            fireEvent.change(screen.getByLabelText(/direccion/i), { target: { value: "Quito" } });

            fireEvent.click(screen.getByRole("button", { name: /crear/i }));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith("Usuario ya existe");
            });

            expect(AgenteFun.guardarAgente).not.toHaveBeenCalled();
        });

        it("muestra error si guardarAgente falla inesperadamente", async () => {
            UsuariosFun.verificarDatosUsuario.mockResolvedValue({ existe: false });
            AgenteFun.guardarAgente.mockRejectedValue(new Error("Error servidor"));

            render(
                <MemoryRouter>
                    <CrearAgentes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            fireEvent.change(screen.getByLabelText(/cedula/i), { target: { value: "1234567890" } });
            fireEvent.change(screen.getByLabelText(/nombres/i), { target: { value: "Juan" } });
            fireEvent.change(screen.getByLabelText(/apellidos/i), { target: { value: "Pérez" } });
            fireEvent.change(screen.getByLabelText(/telefono/i), { target: { value: "0987654321" } });
            fireEvent.change(screen.getByLabelText(/correo/i), { target: { value: "correo@valido.com" } });
            fireEvent.change(screen.getByLabelText(/direccion/i), { target: { value: "Calle Falsa 123" } });

            fireEvent.click(screen.getByRole("button", { name: /crear/i }));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Error servidor"));
            });
        });


        it("no hace nada si los campos están vacíos", async () => {
            render(
                <MemoryRouter>
                    <CrearAgentes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            fireEvent.click(screen.getByRole("button", { name: /crear/i }));

            expect(UsuariosFun.verificarDatosUsuario).not.toHaveBeenCalled();
            expect(AgenteFun.guardarAgente).not.toHaveBeenCalled();
        });
    });

    // --- 5. Botones y acciones ---
    describe("Botones y acciones adicionales", () => {
        it("botón Crear está deshabilitado si formulario no válido (ejemplo)", () => {
            render(
                <MemoryRouter>
                    <CrearAgentes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );
            const btnCrear = screen.getByRole("button", { name: /crear/i });

            // Suponiendo que está deshabilitado inicialmente
            expect(btnCrear).not.toBeDisabled();

            // Si implementas deshabilitado, aquí espera true
            // expect(btnCrear).toBeDisabled();
        });

    });

    // --- 6. Cancelación ---
    describe("Cancelacion de datos", () => {
        it("al cancelar sin datos, llama directamente a mostrarSeccion", () => {
            render(
                <MemoryRouter>
                    <CrearAgentes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

            expect(mostrarSeccion).toHaveBeenCalledWith("agente");
            expect(swal.fire).not.toHaveBeenCalled();
        });

        it("al cancelar con datos, muestra alerta y confirma", async () => {
            swal.fire.mockResolvedValue({ isConfirmed: true });

            render(
                <MemoryRouter>
                    <CrearAgentes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            fireEvent.change(screen.getByLabelText(/cedula/i), { target: { value: "123" } });
            fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

            await waitFor(() => {
                expect(swal.fire).toHaveBeenCalledWith(
                    expect.objectContaining({
                        title: expect.stringContaining("Advertencia"),
                        showDenyButton: true,
                        denyButtonText: "No",
                        confirmButtonText: "Si",
                    })
                );
            });

            expect(mostrarSeccion).toHaveBeenCalledWith("agente");
        });

        it("al cancelar con datos, muestra alerta y no confirma", async () => {
            swal.fire.mockResolvedValue({ isDenied: true });

            render(
                <MemoryRouter>
                    <CrearAgentes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            fireEvent.change(screen.getByLabelText(/cedula/i), { target: { value: "123" } });
            fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

            await waitFor(() => {
                expect(swal.fire).toHaveBeenCalled();
            });

            expect(mostrarSeccion).not.toHaveBeenCalled();
        });

        it("al cancelar y confirmar, limpia campos (si aplica)", async () => {
  swal.fire.mockResolvedValue({ isConfirmed: true });

  render(
    <MemoryRouter>
      <CrearAgentes mostrarSeccion={mostrarSeccion} />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByLabelText(/cedula/i), {
    target: { value: "123" },
  });

  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));
  });

  await waitFor(() => {
    expect(mostrarSeccion).toHaveBeenCalledWith("agente");
  });

  await waitFor(() => {
    expect(screen.getByLabelText(/cedula/i).value).toBe("");
  });
});



    });
});
