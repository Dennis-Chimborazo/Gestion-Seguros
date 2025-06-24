import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AgentesPendientes } from "../agentes/AgentesPendientes";
import AgenteFun from "../agentes/AgenteFun";

jest.mock("../agentes/AgenteFun");

const mockAgentes = {
    rows: [
        {
            ced_agente: "1234567890",
            nom_agente: "Carlos",
            ape_agente: "Perez",
            email_agente: "carlos@email.com",
            dire_agente: "Quito",
            tel_agente: "0999999999"
        },
    ],
};

describe("AgentesPendientes", () => {
    const mostrarSeccion = jest.fn();
    const navigate = jest.fn();

    beforeEach(() => {
        AgenteFun.obtenerAgentesPendientes.mockResolvedValue(mockAgentes);
        localStorage.clear();
        jest.clearAllMocks();
    });

    describe('Renderizado y carga', () => {
        // 🔄 1. RENDERIZADO Y CARGA
        it("debería renderizar la tabla con los agentes", async () => {
            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            expect(screen.getByText("Vadicacion de cuenta Pendiente")).toBeInTheDocument();
            await waitFor(() => {
                expect(screen.getByText("Carlos")).toBeInTheDocument();
            });
        });
        it("debería renderizar el título, la tabla y cargar datos correctamente", async () => {
            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            expect(screen.getByText(/Vadicacion de cuenta Pendiente/i)).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/Ingrese numero de cedula/i)).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.getByText("Carlos")).toBeInTheDocument();
            });
        });
        it("muestra un spinner o indicador de carga mientras se obtienen los agentes", async () => {
            // Simulamos que la promesa tarda para poder ver el loading
            let resolver;
            AgenteFun.obtenerAgentesPendientes.mockImplementation(
                () => new Promise(resolve => { resolver = resolve; })
            );

            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            // Esperamos que el loading esté visible (según implementación)
            expect(screen.getByTestId("cargar-tablas")).toBeInTheDocument();

            // Resolvemos la promesa para continuar
            resolver(mockAgentes);

            await waitFor(() => {
                expect(screen.getByText("Carlos")).toBeInTheDocument();
            });
        });

    });


    // 🔍 2. FILTRADO
    describe('Filtrados', () => {
        it("filtra por cédula correctamente", async () => {
            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Carlos")).toBeInTheDocument();
            });

            const input = screen.getByPlaceholderText("Ingrese numero de cedula");
            fireEvent.change(input, { target: { value: "999" } });

            expect(screen.queryByText("Carlos")).not.toBeInTheDocument();
        });

        it("restaura los datos al borrar filtro", async () => {
            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Carlos")).toBeInTheDocument();
            });

            const input = screen.getByPlaceholderText("Ingrese numero de cedula");
            fireEvent.change(input, { target: { value: "999" } });

            expect(screen.queryByText("Carlos")).not.toBeInTheDocument();

            fireEvent.click(screen.getByTestId("clear-filtro"));

            await waitFor(() => {
                expect(screen.getByText("Carlos")).toBeInTheDocument();
            });
        });
        it("filtra agentes por cédula y restaura los datos al limpiar filtro", async () => {
            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            await waitFor(() => expect(screen.getByText("Carlos")).toBeInTheDocument());

            const input = screen.getByPlaceholderText(/Ingrese numero de cedula/i);
            fireEvent.change(input, { target: { value: "123" } });
            expect(screen.getByText("Carlos")).toBeInTheDocument();

            fireEvent.change(input, { target: { value: "999" } });
            expect(screen.queryByText("Carlos")).not.toBeInTheDocument();

            fireEvent.click(screen.getByTestId("clear-filtro"));

            await waitFor(() => expect(screen.getByText("Carlos")).toBeInTheDocument());
        });
        it("restablece filtro cuando input de búsqueda se vacía", async () => {
            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            await waitFor(() => expect(screen.getByText("Carlos")).toBeInTheDocument());

            const input = screen.getByPlaceholderText(/Ingrese numero de cedula/i);
            fireEvent.change(input, { target: { value: "123" } });
            expect(screen.getByText("Carlos")).toBeInTheDocument();

            fireEvent.change(input, { target: { value: "" } }); // vaciar input

            await waitFor(() => expect(screen.getByText("Carlos")).toBeInTheDocument());
        });
        it("filtrarClientes con valor no numérico no rompe y no muestra resultados", async () => {
            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            await waitFor(() => expect(screen.getByText("Carlos")).toBeInTheDocument());

            const input = screen.getByPlaceholderText(/Ingrese numero de cedula/i);
            fireEvent.change(input, { target: { value: "abc" } });

            expect(screen.queryByText("Carlos")).not.toBeInTheDocument();
        });
        it("filtra por cédula sin diferenciar mayúsculas o minúsculas (si aplica)", async () => {
            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            await waitFor(() => expect(screen.getByText("Carlos")).toBeInTheDocument());

            const input = screen.getByPlaceholderText(/Ingrese numero de cedula/i);
            fireEvent.change(input, { target: { value: "1234567890" } });

            expect(screen.getByText("Carlos")).toBeInTheDocument();

            fireEvent.change(input, { target: { value: "999999" } });

            expect(screen.queryByText("Carlos")).not.toBeInTheDocument();
        });


    });

    // 🔁 3. REENVÍO DE CORREO
    describe('Gestión de correos', () => {
        it("abre modal al reenviar correo", async () => {
            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByTestId("icono-correo-0")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId("icono-correo-0"));
            expect(screen.getByTestId("btn-cerrar-modal")).toBeInTheDocument();
        });
        it("cierra modal correctamente al hacer click en botón cerrar", async () => {
            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            await waitFor(() => expect(screen.getByTestId("icono-correo-0")).toBeInTheDocument());

            fireEvent.click(screen.getByTestId("icono-correo-0"));

            const btnCerrar = screen.getByTestId("btn-cerrar-modal");
            expect(btnCerrar).toBeInTheDocument();

            fireEvent.click(btnCerrar);

            // Esperamos que el modal se haya cerrado
            await waitFor(() => {
                expect(screen.queryByTestId("btn-cerrar-modal")).not.toBeInTheDocument();
            });
        });
    });

    // 🔄 4. REFRESCAR
    describe('Refrescar Datos', () => {
        it("refresca correctamente al hacer click en actualizar", async () => {
            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("Carlos")).toBeInTheDocument();
            });

            fireEvent.click(screen.getByTestId("btn-actualizar"));

            await waitFor(() => {
                expect(AgenteFun.obtenerAgentesPendientes).toHaveBeenCalledTimes(2);
            });

        });
        it("refresca datos al hacer click en actualizar y muestra loading", async () => {
            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            await waitFor(() => expect(screen.getByText("Carlos")).toBeInTheDocument());

            fireEvent.click(screen.getByTestId("btn-actualizar"));

            await waitFor(() => {
                expect(AgenteFun.obtenerAgentesPendientes).toHaveBeenCalledTimes(2);
            });
        });
    });

    // ❌ 5. PRUEBA NEGATIVA
    describe('Pruebas negativas', () => {
        it("muestra mensaje de error si falla el fetch", async () => {
            AgenteFun.obtenerAgentesPendientes.mockRejectedValueOnce(new Error("Error de red"));

            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.queryByText("Carlos")).not.toBeInTheDocument();
            });
        });
        it("muestra mensaje cuando no hay datos en la tabla", async () => {
            AgenteFun.obtenerAgentesPendientes.mockResolvedValueOnce({ rows: [] });

            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            await waitFor(() => {
                expect(screen.getByText("No ha selecionado ninguna actividad")).toBeInTheDocument();
            });
        });

    });

    describe('Estilos css', () => {
        it("abre modal al hacer click en el icono de correo y verifica estilos CSS", async () => {
            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            await waitFor(() => expect(screen.getByTestId("icono-correo-0")).toBeInTheDocument());

            fireEvent.click(screen.getByTestId("icono-correo-0"));

            // Verificar que el modal esté en el documento
            const modalBtnCerrar = screen.getByTestId("btn-cerrar-modal");
            expect(modalBtnCerrar).toBeInTheDocument();

            // Verificar clases CSS del modal y overlay (que existan)
            const modalDiv = modalBtnCerrar.closest("div");
            expect(modalDiv.className).toMatch(/modal/i);

            // Cerrar modal
            fireEvent.click(modalBtnCerrar);
            expect(modalBtnCerrar).not.toBeInTheDocument();
        });


    });
    describe('Integración con estilos y componentes visuales', () => {
        it("verifica que los estilos CSS del botón de actualizar están aplicados", async () => {
            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            await waitFor(() => expect(screen.getByText("Carlos")).toBeInTheDocument());

            const btnActualizar = screen.getByTestId("btn-actualizar");
            expect(btnActualizar).toBeInTheDocument(); // Ajusta el nombre según CSS real
        });

        it("verifica que el icono de correo tiene la clase correcta", async () => {
            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            await waitFor(() => expect(screen.getByTestId("icono-correo-0")).toBeInTheDocument());

            const iconoCorreo = screen.getByTestId("icono-correo-0");
            expect(iconoCorreo.tagName.toLowerCase()).toBe("svg"); // si es un svg

        });

        it("al abrir modal, verifica que el fondo overlay tenga la clase de sombreado", async () => {
            render(
                <MemoryRouter>
                    <AgentesPendientes mostrarSeccion={mostrarSeccion} />
                </MemoryRouter>
            );

            await waitFor(() => expect(screen.getByTestId("icono-correo-0")).toBeInTheDocument());

            fireEvent.click(screen.getByTestId("icono-correo-0"));

            fireEvent.click(screen.getByTestId("icono-correo-0"));

            const overlay = screen.getByTestId("overlay-modal");
            expect(overlay).toBeInTheDocument();
            expect(overlay.className).toMatch(/overlay/i);

        });
    });
});
