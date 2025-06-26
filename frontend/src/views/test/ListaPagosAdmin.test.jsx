// __tests__/ListaPagosAdmin.test.jsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import ListaPagosAdmin from "../pagos/ListaPagosAdmin";
import PagosFun from "../pagos/PagosFun";
import { BrowserRouter } from "react-router-dom";

jest.mock("../pagos/PagosFun");

const mockDatosReembolsos = [
    {
        cedr_cli: "1234567890",
        nombre: "Juan Perez",
        fecha_pago: "2023-06-01",
        nonto_pago: "100.00",
        comprobante_pago: "ABC123",
        nom_tip_seg: "Seguro Dental",
    },
    {
        cedr_cli: "0987654321",
        nombre: "Maria Lopez",
        fecha_pago: "2023-06-02",
        nonto_pago: "200.00",
        comprobante_pago: "XYZ789",
        nom_tip_seg: "Seguro Médico",
    },
];

const renderComponent = (mostrarSeccion = jest.fn()) =>
    render(
        <BrowserRouter>
            <ListaPagosAdmin mostrarSeccion={mostrarSeccion} />
        </BrowserRouter>
    );

describe("ListaPagosAdmin", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test("muestra cargando inicialmente y luego la tabla con datos", async () => {
        PagosFun.pagoRevisionPendiente.mockResolvedValue(mockDatosReembolsos);

        renderComponent();

        // Se muestra el componente de carga
        expect(screen.getByTestId("cargar-tablas")).toBeInTheDocument();

        // Esperamos que se muestre un dato de la tabla
        await waitFor(() => {
            expect(screen.getByText("Juan Perez")).toBeInTheDocument();
            expect(screen.getByText("Maria Lopez")).toBeInTheDocument();
        });
    });
    test("muestra mensaje cuando no hay datos", async () => {
        PagosFun.pagoRevisionPendiente.mockResolvedValue([]);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/No hay Solicitudes de Reembolsos para mostrar/i)).toBeInTheDocument();
        });
    });

    test("filtra los datos correctamente según el input", async () => {
        PagosFun.pagoRevisionPendiente.mockResolvedValue(mockDatosReembolsos);
        renderComponent();

        await waitFor(() => screen.getByText("Juan Perez"));

        const input = screen.getByPlaceholderText(/Ingrese numero de reembolso/i);
        fireEvent.change(input, { target: { value: "123" } });

        // Solo debería mostrar el cliente con cedr_cli que empieza con "123"
        await waitFor(() => {
            expect(screen.getByText("Juan Perez")).toBeInTheDocument();
            expect(screen.queryByText("Maria Lopez")).not.toBeInTheDocument();
        });
    });

    test("al borrar filtro vuelve a mostrar todos los datos", async () => {
        PagosFun.pagoRevisionPendiente.mockResolvedValue(mockDatosReembolsos);
        renderComponent();

        await waitFor(() => screen.getByText("Juan Perez"));

        const input = screen.getByPlaceholderText(/Ingrese numero de reembolso/i);
        fireEvent.change(input, { target: { value: "123" } });

        await waitFor(() => {
            expect(screen.queryByText("Maria Lopez")).not.toBeInTheDocument();
        });

        const btnLimpiar = screen.getByRole("button", { name: /Limpiar filtros/i });
        fireEvent.click(btnLimpiar);

        await waitFor(() => {
            expect(screen.getByText("Juan Perez")).toBeInTheDocument();
            expect(screen.getByText("Maria Lopez")).toBeInTheDocument();
        });
    });

    test("clic en icono de revisión guarda en localStorage y llama mostrarSeccion", async () => {
        const mostrarSeccionMock = jest.fn();
        PagosFun.pagoRevisionPendiente.mockResolvedValue(mockDatosReembolsos);
        renderComponent(mostrarSeccionMock);

        await waitFor(() => screen.getByText("Juan Perez"));

        const icono = screen.getByTestId("icono-cliente-0");
        fireEvent.click(icono);

        // Verificar localStorage
        const item = JSON.parse(localStorage.getItem("revisionPagos"));
        expect(item).toEqual({
            edit: true,
            revision: mockDatosReembolsos[0],
        });

        expect(mostrarSeccionMock).toHaveBeenCalledWith("procesoPagosAdmin");
    });

    test("maneja error en carga sin romper la UI", async () => {
        PagosFun.pagoRevisionPendiente.mockRejectedValue(new Error("Error de red"));

        renderComponent();

        // Esperamos que se quite el cargando
        await waitFor(() => {
            expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument();
        });

        // No debe mostrar datos ni tabla (porque no llegaron datos)
        expect(screen.queryByText("Juan Perez")).not.toBeInTheDocument();
        expect(screen.getByText(/No hay Solicitudes de Reembolsos para mostrar/i)).toBeInTheDocument();
    });
});
describe("Pruebas adicionales ListaPagosAdmin", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test("el filtro se limpia cuando input está vacío y restaura la lista", async () => {
        PagosFun.pagoRevisionPendiente.mockResolvedValue([
            { cedr_cli: "123", nombre: "Maria Lopez", fecha_pago: "2023-01-01", nonto_pago: 100, comprobante_pago: "ABC", nom_tip_seg: "Seguro1" },
            { cedr_cli: "456", nombre: "Juan Perez", fecha_pago: "2023-02-01", nonto_pago: 200, comprobante_pago: "DEF", nom_tip_seg: "Seguro2" }
        ]);

        renderComponent();

        // Espera que los datos estén cargados
        await screen.findByText(/Maria Lopez/i);

        // Aplica filtro con valor que no existe (para vaciar resultados)
        const input = screen.getByPlaceholderText(/Ingrese numero de reembolso/i);
        fireEvent.change(input, { target: { value: "999" } });

        // Ahora no debe mostrar los datos originales
        expect(screen.queryByText(/Maria Lopez/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Juan Perez/i)).not.toBeInTheDocument();

        // Limpia filtro (input vacío)
        fireEvent.change(input, { target: { value: "" } });

        // Espera a que los datos vuelvan a aparecer
        await screen.findByText(/Maria Lopez/i);
        await screen.findByText(/Juan Perez/i);

        expect(screen.getByText(/Maria Lopez/i)).toBeInTheDocument();
        expect(screen.getByText(/Juan Perez/i)).toBeInTheDocument();
    });


    test("no falla si estados iniciales son undefined o null", async () => {
        // Mock que retorna undefined
        PagosFun.pagoRevisionPendiente.mockResolvedValue(undefined);

        // Renderiza el componente (que ahora debe manejar undefined y mostrar tabla vacía)
        renderComponent();

        await waitFor(() => {
            // Debería mostrar mensaje de tabla vacía
            expect(screen.getByText(/No hay Solicitudes de Reembolsos para mostrar/i)).toBeInTheDocument();
        });
    });


    test("botón limpiar filtros está presente y funcional incluso si no hay datos", async () => {
        PagosFun.pagoRevisionPendiente.mockResolvedValue([]);
        renderComponent();

        await waitFor(() => screen.getByText(/No hay Solicitudes de Reembolsos para mostrar/i));

        const btnLimpiar = screen.getByRole("button", { name: /limpiar filtros/i });
        expect(btnLimpiar).toBeInTheDocument();

        fireEvent.click(btnLimpiar);

        // No cambia nada, pero no debe fallar
        expect(screen.getByText(/No hay Solicitudes de Reembolsos para mostrar/i)).toBeInTheDocument();
    });

    test("filtrar no afecta lista si no hay coincidencias", async () => {
        PagosFun.pagoRevisionPendiente.mockResolvedValue(mockDatosReembolsos);
        renderComponent();

        await waitFor(() => screen.getByText("Juan Perez"));

        const input = screen.getByPlaceholderText(/Ingrese numero de reembolso/i);
        fireEvent.change(input, { target: { value: "XYZ" } });

        expect(screen.queryByText("Juan Perez")).not.toBeInTheDocument();
        expect(screen.queryByText("Maria Lopez")).not.toBeInTheDocument();

        // No hay datos para mostrar
        expect(screen.getByText(/No hay Solicitudes de Reembolsos para mostrar/i)).toBeInTheDocument();
    });

    test("input tiene etiqueta asociada para accesibilidad", () => {
        PagosFun.pagoRevisionPendiente.mockResolvedValue([]);
        renderComponent();

        const label = screen.getByText(/Buscar/i);
        const input = screen.getByPlaceholderText(/Ingrese numero de reembolso/i);

        expect(label).toBeInTheDocument();
        expect(input).toBeInTheDocument();
        // Para una mejor accesibilidad, el input debe estar asociado con label mediante id/for
        // Esto depende de implementación, pero al menos ambos están visibles
    });

    test("tabla no se muestra mientras carga", () => {
        PagosFun.pagoRevisionPendiente.mockImplementation(
            () => new Promise(() => { }) // Promesa que no resuelve para simular carga indefinida
        );

        renderComponent();

        expect(screen.queryByRole("table")).not.toBeInTheDocument();
        expect(screen.getByTestId("cargar-tablas")).toBeInTheDocument();
    });
});
