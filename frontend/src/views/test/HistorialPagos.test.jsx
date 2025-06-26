// __tests__/HistorialPagos.test.jsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import HistorialPagos from "../pagos/HistorialPagos";
import PagosFun from "../pagos/PagosFun";
import { BrowserRouter } from "react-router-dom";

jest.mock("../pagos/PagosFun");

const pagosMock = [
    {
        comprobante_pago: "ABC123",
        nom_tip_seg: "Seguro Vida",
        fecha_pago: "2023-05-01",
        nonto_pago: 500,
        cedr_cli: "1234567890",
    },
    {
        comprobante_pago: "DEF456",
        nom_tip_seg: "Seguro Salud",
        fecha_pago: "2023-06-10",
        nonto_pago: 300,
        cedr_cli: "0987654321",
    },
];

const renderComponent = () =>
    render(
        <BrowserRouter>
            <HistorialPagos id={1} mostrarSeccion={jest.fn()} />
        </BrowserRouter>
    );

describe("HistorialPagos", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("muestra el componente de carga inicialmente", async () => {
        PagosFun.pagoAprobadosCliente.mockReturnValue(new Promise(() => { })); // promesa pendiente
        renderComponent();
        expect(screen.getByTestId("cargar-tablas")).toBeInTheDocument();
        // Asume que CargarTablas muestra texto "Cargando" o similar
    });

    test("carga y muestra la tabla con datos de pagos", async () => {
        PagosFun.pagoAprobadosCliente.mockResolvedValue(pagosMock);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/Seguro Vida/i)).toBeInTheDocument();
            expect(screen.getByText(/ABC123/i)).toBeInTheDocument();
            expect(screen.getByText(/500/i)).toBeInTheDocument();
        });
    });

    test("filtra los pagos por cédula", async () => {
        PagosFun.pagoAprobadosCliente.mockResolvedValue(pagosMock);

        renderComponent();

        await waitFor(() => screen.getByText(/Seguro Vida/i));

        const input = screen.getByPlaceholderText(/Ingrese numero de reembolso/i);
        fireEvent.change(input, { target: { value: "123" } });

        await waitFor(() => {
            expect(screen.getByText(/Seguro Vida/i)).toBeInTheDocument();
            expect(screen.queryByText(/Seguro Salud/i)).not.toBeInTheDocument();
        });
    });

    test("limpia el filtro y muestra todos los pagos de nuevo", async () => {
        PagosFun.pagoAprobadosCliente.mockResolvedValue(pagosMock);

        renderComponent();

        await waitFor(() => screen.getByText(/Seguro Vida/i));

        const input = screen.getByPlaceholderText(/Ingrese numero de reembolso/i);
        fireEvent.change(input, { target: { value: "123" } });

        await waitFor(() => {
            expect(screen.queryByText(/Seguro Salud/i)).not.toBeInTheDocument();
        });

        const clearBtn = screen.getByTitle(/Limpiar filtros/i);
        fireEvent.click(clearBtn);

        await waitFor(() => {
            expect(screen.getByText(/Seguro Vida/i)).toBeInTheDocument();
            expect(screen.getByText(/Seguro Salud/i)).toBeInTheDocument();
        });
    });

    test("muestra mensaje cuando no hay datos para mostrar", async () => {
        PagosFun.pagoAprobadosCliente.mockResolvedValue([]);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/No hay Solicitudes de Reembolsos para mostrar/i)).toBeInTheDocument();
        });
    });

    test("maneja error en la carga sin romper", async () => {
        // mockear console.log para no ensuciar test
        jest.spyOn(console, "log").mockImplementation(() => { });
        PagosFun.pagoAprobadosCliente.mockRejectedValue(new Error("Error en carga"));

        renderComponent();

        await waitFor(() => {
            // Si quieres, puedes verificar que el loading desaparece y no hay datos
            expect(screen.queryByText(/No hay Solicitudes de Reembolsos para mostrar/i)).toBeInTheDocument();
        });

        console.log.mockRestore();
    });
    // Agregar después de los tests actuales

    test("no filtra si el input está vacío", async () => {
        PagosFun.pagoAprobadosCliente.mockResolvedValue(pagosMock);

        renderComponent();

        await waitFor(() => screen.getByText(/Seguro Vida/i));

        const input = screen.getByPlaceholderText(/Ingrese numero de reembolso/i);
        fireEvent.change(input, { target: { value: "" } });

        // Esperamos que se muestre todo, no filtrado
        await waitFor(() => {
            expect(screen.getByText(/Seguro Vida/i)).toBeInTheDocument();
            expect(screen.getByText(/Seguro Salud/i)).toBeInTheDocument();
        });
    });

    test("no falla si los datos iniciales son undefined o null", async () => {
        PagosFun.pagoAprobadosCliente.mockResolvedValue(null);
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/No hay Solicitudes de Reembolsos para mostrar/i)).toBeInTheDocument();
        });

        // Ahora con undefined
        PagosFun.pagoAprobadosCliente.mockResolvedValue(undefined);
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/No hay Solicitudes de Reembolsos para mostrar/i)).toBeInTheDocument();
        });
    });

    test("filtra pagos sin distinguir mayúsculas o minúsculas", async () => {
        const pagosConCasos = [
            ...pagosMock,
            {
                comprobante_pago: "GHI789",
                nom_tip_seg: "Seguro Dental",
                fecha_pago: "2023-07-01",
                nonto_pago: 700,
                cedr_cli: "abc1234567",
            },
        ];
        PagosFun.pagoAprobadosCliente.mockResolvedValue(pagosConCasos);

        renderComponent();

        await waitFor(() => screen.getByText(/Seguro Dental/i));

        const input = screen.getByPlaceholderText(/Ingrese numero de reembolso/i);

        fireEvent.change(input, { target: { value: "ABC" } }); // filtro mayúscula

        await waitFor(() => {
            expect(screen.getByText(/Seguro Dental/i)).toBeInTheDocument();
        });
    });


    test("la cantidad de filas coincide con los datos filtrados", async () => {
        PagosFun.pagoAprobadosCliente.mockResolvedValue(pagosMock);

        renderComponent();

        await waitFor(() => screen.getByText(/Seguro Vida/i));

        const input = screen.getByPlaceholderText(/Ingrese numero de reembolso/i);
        fireEvent.change(input, { target: { value: "1234567890" } }); // filtrar solo 1 pago

        await waitFor(() => {
            const filas = screen.getAllByRole("row");
            // 1 fila header + 1 fila data = 2 filas
            expect(filas.length).toBe(2);
        });
    });



});
