// __tests__/InfoPagoRechazado.test.jsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import InfoPagoRechazado from "../pagos/InfoPagoRechazado";
import PagosFun from "../pagos/PagosFun";
import { BrowserRouter } from "react-router-dom";

jest.mock("../pagos/PagosFun");

const mockRevisionPago = {
    revision: {
        id_pago: 123,
    },
};

const mockInfoPago = [
    {
        descripcion_revision_pago: "Pago rechazado por documentación incompleta",
        fecha_revision_pago: "2023-06-25",
    },
];

const renderComponent = (cerrarModalRechazado = jest.fn()) =>
    render(
        <BrowserRouter>
            <InfoPagoRechazado cerrarModalRechazado={cerrarModalRechazado} />
        </BrowserRouter>
    );

describe("InfoPagoRechazado", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
    });

    test("muestra texto de carga inicialmente", () => {
        // localStorage vacio => no infoRevision
        renderComponent();
        expect(screen.getByText(/Cargando datos.../i)).toBeInTheDocument();
    });

    test("carga y muestra la información de rechazo correctamente", async () => {
        localStorage.setItem("revisionPago", JSON.stringify(mockRevisionPago));
        PagosFun.infoPagoRechazado.mockResolvedValue(mockInfoPago);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/Motivo del rechazo/i)).toBeInTheDocument();
            expect(screen.getByText(/Pago rechazado por documentación incompleta/i)).toBeInTheDocument();
            expect(screen.getByText(/Fecha de revisión/i)).toBeInTheDocument();
            expect(screen.getByText(/2023-06-25/i)).toBeInTheDocument();
        });

        // El texto de carga ya no debe estar
        expect(screen.queryByText(/Cargando datos.../i)).not.toBeInTheDocument();

        // localStorage debe quedar vacío
        expect(localStorage.getItem("revisionPago")).toBeNull();
    });

    test("no llama a PagosFun si no hay revisionPago en localStorage", async () => {
        // Sin nada en localStorage
        PagosFun.infoPagoRechazado.mockResolvedValue([]);

        renderComponent();

        await waitFor(() => {
            // Espera que el texto de carga desaparezca (ya que no hay datos)
            expect(screen.getByText(/Cargando datos.../i)).toBeInTheDocument();
        });

        expect(PagosFun.infoPagoRechazado).not.toHaveBeenCalled();
    });

    test("al hacer click en cerrar se llama a la función cerrarModalRechazado", async () => {
        localStorage.setItem("revisionPago", JSON.stringify(mockRevisionPago));
        PagosFun.infoPagoRechazado.mockResolvedValue(mockInfoPago);

        const cerrarMock = jest.fn();
        renderComponent(cerrarMock);

        await waitFor(() => screen.getByText(/Motivo del rechazo/i));

        const btnCerrar = screen.getByRole("button", { name: /cerrar/i });
        fireEvent.click(btnCerrar);

        expect(cerrarMock).toHaveBeenCalledTimes(1);
    });

    test("maneja error en la carga sin romper", async () => {
        localStorage.setItem("revisionPago", JSON.stringify(mockRevisionPago));
        PagosFun.infoPagoRechazado.mockRejectedValue(new Error("Error en carga"));

        // mock console.log para evitar mensajes en test
        jest.spyOn(console, "log").mockImplementation(() => { });

        renderComponent();

        await waitFor(() => {
            // Debe seguir mostrando cargando o vacío
            expect(screen.getByText(/Cargando datos.../i)).toBeInTheDocument();
        });

        console.log.mockRestore();
    });
    test("no borra localStorage si no existe revisionPago", async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText(/Cargando datos.../i)).toBeInTheDocument();
        });
        expect(localStorage.getItem("revisionPago")).toBeNull();
    });

    test("no llama a la API si revisionPago está mal formado", async () => {
        localStorage.setItem("revisionPago", JSON.stringify({ incorrect: "data" }));
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText(/Cargando datos.../i)).toBeInTheDocument();
        });

        expect(PagosFun.infoPagoRechazado).not.toHaveBeenCalled();
        expect(localStorage.getItem("revisionPago")).toBeTruthy(); // No borra si no tiene revision
    });

    test("muestra solo título y botón cuando no hay infoRevision", () => {
        renderComponent();

        expect(screen.getByText(/Solicitud de reembolso rechazada/i)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /cerrar/i })).toBeInTheDocument();

        expect(screen.queryByText(/Motivo del rechazo/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Fecha de revisión/i)).not.toBeInTheDocument();
    });

    test("doble clic rápido en cerrar llama dos veces cerrarModalRechazado", async () => {
        localStorage.setItem("revisionPago", JSON.stringify(mockRevisionPago));
        PagosFun.infoPagoRechazado.mockResolvedValue(mockInfoPago);

        const cerrarMock = jest.fn();
        renderComponent(cerrarMock);

        await waitFor(() => screen.getByText(/Motivo del rechazo/i));

        const btnCerrar = screen.getByRole("button", { name: /cerrar/i });
        fireEvent.click(btnCerrar);
        fireEvent.click(btnCerrar);

        expect(cerrarMock).toHaveBeenCalledTimes(2);
    });

    test("función cancelar previene el evento por defecto", async () => {
        localStorage.setItem("revisionPago", JSON.stringify(mockRevisionPago));
        PagosFun.infoPagoRechazado.mockResolvedValue(mockInfoPago);
        const cerrarMock = jest.fn();

        renderComponent(cerrarMock);

        await waitFor(() => screen.getByText(/Motivo del rechazo/i));

        // Espiamos el método preventDefault del prototipo Event
        const preventDefaultSpy = jest.spyOn(Event.prototype, "preventDefault");

        const btnCerrar = screen.getByRole("button", { name: /cerrar/i });

        fireEvent.click(btnCerrar);

        expect(preventDefaultSpy).toHaveBeenCalled();

        preventDefaultSpy.mockRestore();
    });



});
