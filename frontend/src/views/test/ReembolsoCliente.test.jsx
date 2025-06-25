import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReembolsoCliente from '../reembolsos/ReembolsoCliente';
import ReembolsoFun from '../reembolsos/ReembolsoFun';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../reembolsos/ReembolsoFun');
beforeAll(() => {
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/fake-pdf-url');
});
const mockMostrarSeccion = jest.fn();
const mockNavigate = jest.fn();
const id = 123;

const mockSeguros = [
    { id_seguro: 1, nom_tip_seg: 'Seguro Médico' },
    { id_seguro: 2, nom_tip_seg: 'Seguro Dental' }
];

describe('ReembolsoCliente - pruebas completas', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = () =>
        render(
            <BrowserRouter>
                <ReembolsoCliente id={id} mostrarSeccion={mockMostrarSeccion} />
            </BrowserRouter>
        );

    // Sección 1: Render inicial y carga de seguros
    it('muestra los seguros en el dropdown', async () => {
        ReembolsoFun.traerSegurosContratados.mockResolvedValue(mockSeguros);

        renderComponent();

        await waitFor(() => {
            expect(ReembolsoFun.traerSegurosContratados).toHaveBeenCalledWith(id, expect.any(Function));
        });
    });

    // Sección 2: Validación archivo no seleccionado
    it('muestra error si no se selecciona archivo PDF', async () => {
        ReembolsoFun.traerSegurosContratados.mockResolvedValue(mockSeguros);
        renderComponent();

        await screen.findByText('Motivo de reembolso');

        fireEvent.change(screen.getByPlaceholderText('Motivo de reembolso'), { target: { value: 'Consulta médica' } });
        fireEvent.click(screen.getByText('Enviar'));

        await waitFor(() => {
            expect(screen.getByText('Por favor, suba su factura en formato pdf.')).toBeInTheDocument();
        });
    });

    // Sección 3: Validación de tipo de archivo incorrecto
    it('muestra error si el archivo no es PDF', async () => {
        ReembolsoFun.traerSegurosContratados.mockResolvedValue(mockSeguros);
        renderComponent();

        const input = await screen.findByLabelText('Seleccionar archivo');
        const file = new File(['contenido'], 'archivo.jpg', { type: 'image/jpeg' });

        fireEvent.change(screen.getByLabelText(/seleccionar/i), { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByText('Por favor, sube un archivo PDF válido.')).toBeInTheDocument();
        });
    });

    


    // Sección 5: Envío completo exitoso
    it('envía el formulario correctamente con archivo válido', async () => {
        ReembolsoFun.traerSegurosContratados.mockResolvedValue(mockSeguros);
        ReembolsoFun.enviarReembolso.mockResolvedValue({ id_reemb: 99 });
        ReembolsoFun.guardarArhivoReembolso.mockResolvedValue({ success: true });

        renderComponent();

        fireEvent.change(await screen.findByPlaceholderText('Motivo de reembolso'), { target: { value: 'Chequeo médico' } });
        fireEvent.change(screen.getByLabelText(/seleccionar/i), {
            target: {
                files: [new File(['contenido'], 'archivo.pdf', { type: 'application/pdf' })],
            },
        });

        const selectInput = screen.getByText('Seleccione su seguro');
        fireEvent.keyDown(selectInput, { key: 'ArrowDown' });
        await waitFor(() => screen.getByText('Seguro Médico'));
        fireEvent.click(screen.getByText('Seguro Médico'));

        fireEvent.click(screen.getByText('Enviar'));

        await waitFor(() => {
            expect(ReembolsoFun.enviarReembolso).toHaveBeenCalled();
            expect(ReembolsoFun.guardarArhivoReembolso).toHaveBeenCalled();
            expect(mockMostrarSeccion).toHaveBeenCalledWith('Reembolsos');
        });
    });

   
});
