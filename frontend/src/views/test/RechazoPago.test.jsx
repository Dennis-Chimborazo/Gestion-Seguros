import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";  // <-- Importa esto
import RechazoPago from "../pagos/RechazoPago";
import PagosFun from "../pagos/PagosFun";
import swal from "sweetalert2";

jest.mock("../pagos/PagosFun");
jest.mock("sweetalert2", () => ({
    fire: jest.fn(),
}));

const localStorageMock = (() => {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
    };
})();
Object.defineProperty(window, "localStorage", {
    value: localStorageMock,
});

describe("RechazoPago", () => {
    const cerrarModalMock = jest.fn();
    const mostrarSeccionMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        localStorageMock.getItem.mockReturnValue(
            JSON.stringify({ revision: { id_pago: "pago123" } })
        );
    });

    function renderComponent() {
        return render(
            <MemoryRouter>  {/* <-- Envuelve aquí */}
                <RechazoPago cerrarModal={cerrarModalMock} mostrarSeccion={mostrarSeccionMock} />
            </MemoryRouter>
        );
    }

    test("renderiza y carga datos desde localStorage", () => {
        renderComponent();

        expect(localStorage.getItem).toHaveBeenCalledWith("revisionReembolso");
        expect(localStorage.removeItem).toHaveBeenCalledWith("revisionReembolso");

        expect(screen.getByPlaceholderText("Motivo de rechazo")).toBeInTheDocument();
        expect(screen.getByText("cancelar")).toBeInTheDocument();
        expect(screen.getByText("Aceptar")).toBeInTheDocument();
    });

    test("cancela y llama cerrarModal", () => {
        renderComponent();
        fireEvent.click(screen.getByText("cancelar"));
        expect(cerrarModalMock).toHaveBeenCalled();
    });

    test("rechaza pago con confirmación exitosa", async () => {
        renderComponent();
        const motivoInput = screen.getByPlaceholderText("Motivo de rechazo");
        fireEvent.change(motivoInput, { target: { value: "Motivo de prueba" } });

        swal.fire.mockResolvedValueOnce({ isConfirmed: true });
        PagosFun.rechazarRevisionPago.mockResolvedValue({ success: true });
        swal.fire.mockResolvedValueOnce();

        fireEvent.click(screen.getByText("Aceptar"));

        await waitFor(() => {
            expect(swal.fire).toHaveBeenCalledWith({
                title: "<label>Confirmacion</label>",
                text: "Esta seguro de que este pago no es valido",
                showDenyButton: true,
                denyButtonText: "No",
                confirmButtonText: "Si",
            });
        });

        await waitFor(() => {
            expect(PagosFun.rechazarRevisionPago).toHaveBeenCalledWith(
                { descripcion_revision_pago: "Motivo de prueba", id_pago: "pago123" },
                expect.anything()
            );
        });

        await waitFor(() => {
            expect(swal.fire).toHaveBeenCalledWith({
                title: "<label>Éxito</label>",
                text: "Se ha rechazado el pago ",
                timer: 3500,
            });
        });

        expect(mostrarSeccionMock).toHaveBeenCalledWith("reviPagosAdmin");
    });

    test("rechaza pago pero usuario cancela confirmación", async () => {
        renderComponent();
        swal.fire.mockResolvedValueOnce({ isConfirmed: false });

        fireEvent.click(screen.getByText("Aceptar"));

        await waitFor(() => {
            expect(swal.fire).toHaveBeenCalled();
        });

        expect(PagosFun.rechazarRevisionPago).not.toHaveBeenCalled();
        expect(mostrarSeccionMock).not.toHaveBeenCalled();
    });

    test("rechaza pago y ocurre error en la llamada", async () => {
        renderComponent();
        const motivoInput = screen.getByPlaceholderText("Motivo de rechazo");
        fireEvent.change(motivoInput, { target: { value: "Motivo error" } });

        swal.fire.mockResolvedValueOnce({ isConfirmed: true });
        PagosFun.rechazarRevisionPago.mockRejectedValue(new Error("Error en servidor"));
        swal.fire.mockResolvedValueOnce();

        fireEvent.click(screen.getByText("Aceptar"));

        await waitFor(() => {
            expect(PagosFun.rechazarRevisionPago).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(swal.fire).toHaveBeenCalledWith({
                title: "<label>Advertencia</label>",
                text: "Verifique los datos ",
                timer: 3500,
            });
        });

        expect(mostrarSeccionMock).not.toHaveBeenCalled();
    });
   
    test("actualiza el estado motivo al escribir en el input", () => {
        renderComponent();

        const input = screen.getByPlaceholderText("Motivo de rechazo");
        fireEvent.change(input, { target: { value: "Motivo test" } });

        expect(input.value).toBe("Motivo test");
    });
    test("no rechaza pago si no hay datos de pago", async () => {
        localStorageMock.getItem.mockReturnValue(null); // No hay pago
        renderComponent();

        swal.fire.mockResolvedValueOnce({ isConfirmed: true });

        fireEvent.change(screen.getByPlaceholderText("Motivo de rechazo"), {
            target: { value: "Motivo prueba" },
        });

        fireEvent.click(screen.getByText("Aceptar"));

        await waitFor(() => {
            expect(PagosFun.rechazarRevisionPago).not.toHaveBeenCalled();
        });
    });
    test("botón 'Aceptar' está habilitado al inicio (motivo vacío)", () => {
        renderComponent();
        const btnAceptar = screen.getByText("Aceptar");

        expect(btnAceptar).not.toBeDisabled();
    });


});
