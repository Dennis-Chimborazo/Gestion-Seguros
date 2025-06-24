// EditarAgente.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EditarAgente from "../agentes/EditarAgente";
import swal from "sweetalert2";
import AgenteFun from "../agentes/AgenteFun";

jest.mock("sweetalert2", () => ({
    fire: jest.fn(),
}));

jest.mock("../agentes/AgenteFun", () => ({
    actualizarAgente: jest.fn(),
}));

jest.mock("../usuarios/UsuariosFun", () => ({
    verificarUsuario: jest.fn(),
}));

beforeEach(() => {
    localStorage.setItem("editAgente", JSON.stringify({
        agente: {
            ced_agente: "123",
            nom_agente: "John",
            ape_agente: "Doe",
            tel_agente: "0999999999",
            email_agente: "john@example.com",
            dire_agente: "Quito"
        }
    }));
});

afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
});

describe('Editar Agente', () => {
    describe('Carga Inicial', () => {
        it("carga los datos del localStorage al montar", () => {
            render(<MemoryRouter><EditarAgente mostrarSeccion={jest.fn()} /></MemoryRouter>);

            expect(screen.getByLabelText(/cedula/i).value).toBe("123");
            expect(screen.getByLabelText(/nombres/i).value).toBe("John");
        });

        it("actualiza el valor del campo cuando el usuario escribe", () => {
            render(<MemoryRouter><EditarAgente mostrarSeccion={jest.fn()} /></MemoryRouter>);

            const input = screen.getByLabelText(/nombres/i);
            fireEvent.change(input, { target: { value: "Juan" } });
            expect(input.value).toBe("Juan");
        });
    });

    describe('Integracion', () => {
        it("muestra error si hay campos vacíos al editar", async () => {
            const toast = require("sonner").toast;
            jest.spyOn(toast, "error").mockImplementation(() => { });

            render(<MemoryRouter><EditarAgente mostrarSeccion={jest.fn()} /></MemoryRouter>);

            fireEvent.change(screen.getByLabelText(/cedula/i), { target: { value: "" } });
            fireEvent.click(screen.getByRole("button", { name: /editar/i }));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith("Faltan campos por llenar ");
            });
        });

        it("muestra error si no se realizaron cambios", async () => {
            const toast = require("sonner").toast;
            jest.spyOn(toast, "error").mockImplementation(() => { });

            render(<MemoryRouter><EditarAgente mostrarSeccion={jest.fn()} /></MemoryRouter>);

            fireEvent.click(screen.getByRole("button", { name: /editar/i }));

            await waitFor(() => {
                expect(toast.error).toHaveBeenCalledWith("No se aplicado ningun cambio ");
            });
        });

        it("edita y actualiza correctamente al confirmar", async () => {
            swal.fire.mockResolvedValue({ isConfirmed: true });
            AgenteFun.actualizarAgente.mockResolvedValue({});
            const mostrarSeccion = jest.fn();

            render(<MemoryRouter><EditarAgente mostrarSeccion={mostrarSeccion} /></MemoryRouter>);

            fireEvent.change(screen.getByLabelText(/nombres/i), {
                target: { value: "Juan" }
            });

            fireEvent.click(screen.getByRole("button", { name: /editar/i }));

            await waitFor(() => {
                expect(AgenteFun.actualizarAgente).toHaveBeenCalled();
                expect(mostrarSeccion).toHaveBeenCalledWith("agente");
            });
        });
    });

    describe('Cancelacion', () => {
        it("confirma al cancelar si hay cambios", async () => {
            swal.fire.mockResolvedValue({ isConfirmed: true });
            const mostrarSeccion = jest.fn();

            render(<MemoryRouter><EditarAgente mostrarSeccion={mostrarSeccion} /></MemoryRouter>);

            fireEvent.change(screen.getByLabelText(/nombres/i), {
                target: { value: "Juan" }
            });

            fireEvent.click(screen.getByRole("button", { name: /cancelar/i }));

            await waitFor(() => {
                expect(swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                    text: "Desea descartar los cambios realizados"
                }));
                expect(mostrarSeccion).toHaveBeenCalledWith("agente");
            });
        });
    });

    describe('Estilos y Accesibilidad', () => {
        it("todos los inputs están vinculados a un label", () => {
            const { container } = render(<MemoryRouter><EditarAgente mostrarSeccion={() => { }} /></MemoryRouter>);

            const labels = container.querySelectorAll("label");
            labels.forEach(label => {
                const htmlFor = label.htmlFor;  // acá debe ser htmlFor en React
                expect(htmlFor).toBeTruthy(); // Que tenga 'htmlFor' definido

                const input = container.querySelector(`#${htmlFor}`);
                expect(input).toBeTruthy();

                // Verificar que el input sea un elemento labellable
                expect(['INPUT', 'SELECT', 'TEXTAREA']).toContain(input.tagName);
            });
        });

        it("botones tienen roles y nombres accesibles", () => {
            render(<MemoryRouter><EditarAgente mostrarSeccion={() => { }} /></MemoryRouter>);

            expect(screen.getByRole("button", { name: /cancelar/i })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: /editar/i })).toBeInTheDocument();
        });
    });
});
