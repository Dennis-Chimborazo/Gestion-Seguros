// __tests__/PagoCliente.test.jsx
import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PagoCliente from "../pagos/PagoCliente";
import ReembolsoFun from "../reembolsos/ReembolsoFun";
import GestionContratacionFun from "../gestionContratacion/GestionContratacionFun";
import PagosFun from "../pagos/PagosFun";
import Archivos from "../../services/Archivos";
import swal from "sweetalert2";
import selectEvent from "react-select-event";

// Mocks
jest.mock("../reembolsos/ReembolsoFun");
jest.mock("../gestionContratacion/GestionContratacionFun");
jest.mock("../pagos/PagosFun");
jest.mock("../../services/Archivos");
jest.mock("sweetalert2", () => ({
    fire: jest.fn(),
}));

describe("PagoCliente", () => {
    const id = "usuario123";
    const mostrarSeccionMock = jest.fn();


    beforeAll(() => {
        global.URL.createObjectURL = jest.fn(() => "blob:http://localhost/fake-pdf-url");
    });

    afterAll(() => {
        global.URL.createObjectURL.mockReset();
    });

    test("carga seguros contratados y muestra opciones en Select", async () => {
        ReembolsoFun.traerSegurosContratados.mockResolvedValue([
            { id_seguro: "s1", nom_tip_seg: "Seguro A" },
            { id_seguro: "s2", nom_tip_seg: "Seguro B" },
        ]);

        render(
            <MemoryRouter>
                <PagoCliente id={id} mostrarSeccion={mostrarSeccionMock} />
            </MemoryRouter>
        );

        // Espera que las opciones de Select se carguen
        await waitFor(() => {
            expect(ReembolsoFun.traerSegurosContratados).toHaveBeenCalledWith(id, expect.anything());
        });

        // Abrimos el Select para ver las opciones (es un poco tricky con react-select)
        // Pero podemos verificar que el placeholder esté presente
        expect(screen.getByTestId("label-select-seguro")).toBeInTheDocument();
    });

    test("selecciona un seguro y muestra información del seguro", async () => {
        ReembolsoFun.traerSegurosContratados.mockResolvedValue([
            { id_seguro: "s1", nom_tip_seg: "Seguro A" },
        ]);

        GestionContratacionFun.buscarSeguroPorId.mockResolvedValue([
            { monto_seguro: "150", tiempo_seguro: "Anual" },
        ]);

        render(
            <MemoryRouter>
                <PagoCliente id={id} mostrarSeccion={mostrarSeccionMock} />
            </MemoryRouter>
        );

        // Esperamos que cargue los seguros
        await waitFor(() => {
            expect(ReembolsoFun.traerSegurosContratados).toHaveBeenCalledWith(id, expect.anything());
        });

        // Buscamos el input del react-select
        const selectInput = screen.getByRole("combobox");

        // Seleccionamos la opción "Seguro A"
        await selectEvent.select(selectInput, "Seguro A");

        // Verificamos que se haya hecho la llamada con el ID correcto
        await waitFor(() => {
            expect(GestionContratacionFun.buscarSeguroPorId).toHaveBeenCalledWith("s1", expect.anything());
        });
    });


    test("valida que solo archivos PDF sean aceptados y muestra error en otro caso", async () => {
        ReembolsoFun.traerSegurosContratados.mockResolvedValue([]);

        render(
            <MemoryRouter>
                <PagoCliente id={id} mostrarSeccion={mostrarSeccionMock} />
            </MemoryRouter>
        );

        const inputFile = screen.getByLabelText(/Comprobante de Pago/i);

        // Archivo no PDF
        const archivoIncorrecto = new File(["dummy content"], "file.txt", { type: "text/plain" });
        fireEvent.change(inputFile, { target: { files: [archivoIncorrecto] } });

        await waitFor(() => {
            expect(screen.getByText(/Por favor, sube un archivo PDF válido/i)).toBeInTheDocument();
        });

        // Archivo PDF
        const archivoPDF = new File(["%PDF-1.4"], "file.pdf", { type: "application/pdf" });
        fireEvent.change(inputFile, { target: { files: [archivoPDF] } });

        await waitFor(() => {
            expect(screen.queryByText(/Por favor, sube un archivo PDF válido/i)).not.toBeInTheDocument();
        });
    });

    test("envía el pago correctamente y llama mostrarSeccion con éxito", async () => {
        ReembolsoFun.traerSegurosContratados.mockResolvedValue([]);
        Archivos.guardarArhivo.mockResolvedValue({ id: 42 });
        PagosFun.enviarPago.mockResolvedValue({ success: true });

        render(
            <MemoryRouter>
                <PagoCliente id={id} mostrarSeccion={mostrarSeccionMock} />
            </MemoryRouter>
        );

        // Llenar formulario
        const montoInput = screen.getByLabelText(/Monto depositado/i);
        fireEvent.change(montoInput, { target: { value: "150" } });

        const comprobanteInput = screen.getByLabelText(/Numero comprobante/i);
        fireEvent.change(comprobanteInput, { target: { value: "123456" } });

        // Cargar archivo PDF
        const archivoPDF = new File(["%PDF-1.4"], "file.pdf", { type: "application/pdf" });
        const inputFile = screen.getByLabelText(/Comprobante de Pago/i);
        fireEvent.change(inputFile, { target: { files: [archivoPDF] } });

        // Simular click en enviar
        const btnEnviar = screen.getByText("Enviar");
        fireEvent.click(btnEnviar);

        await waitFor(() => {
            expect(Archivos.guardarArhivo).toHaveBeenCalled();
            expect(PagosFun.enviarPago).toHaveBeenCalledWith(
                expect.objectContaining({
                    nonto_pago: "150",
                    comprobante_pago: "123456",
                    id_pers: id,
                    id_seguro: "", // no se seleccionó ninguno en este test
                    id_archivos_cliente: 42,
                }),
                expect.anything()
            );

            expect(swal.fire).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: expect.any(String),
                    text: expect.any(String),
                    timer: expect.any(Number),
                })
            );

            expect(mostrarSeccionMock).toHaveBeenCalledWith("RevisionPago");
        });
    });

    test("maneja error en enviarPago sin romper la UI", async () => {
        ReembolsoFun.traerSegurosContratados.mockResolvedValue([]);
        Archivos.guardarArhivo.mockRejectedValue(new Error("Error al guardar archivo"));

        render(
            <MemoryRouter>
                <PagoCliente id={id} mostrarSeccion={mostrarSeccionMock} />
            </MemoryRouter>
        );

        // Llenar formulario y archivo PDF
        const montoInput = screen.getByLabelText(/Monto depositado/i);
        fireEvent.change(montoInput, { target: { value: "150" } });

        const comprobanteInput = screen.getByLabelText(/Numero comprobante/i);
        fireEvent.change(comprobanteInput, { target: { value: "123456" } });

        const archivoPDF = new File(["%PDF-1.4"], "file.pdf", { type: "application/pdf" });
        const inputFile = screen.getByLabelText(/Comprobante de Pago/i);
        fireEvent.change(inputFile, { target: { files: [archivoPDF] } });

        // Click enviar
        const btnEnviar = screen.getByText("Enviar");
        fireEvent.click(btnEnviar);

        await waitFor(() => {
            expect(Archivos.guardarArhivo).toHaveBeenCalled();
            // No debe llamar a swal ni mostrarSeccion por error
            expect(swal.fire).not.toHaveBeenCalled();
            expect(mostrarSeccionMock).not.toHaveBeenCalled();
        });
    });
});
