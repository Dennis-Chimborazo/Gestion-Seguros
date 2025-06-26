import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ListaReembolsoCliente from '../reembolsos/ListaReembolsoCliente';
import ReembolsoFun from '../reembolsos/ReembolsoFun';

jest.mock('../reembolsos/ReembolsoFun');

const mockMostrarSeccion = jest.fn();
const mockNavigate = jest.fn();

const mockData = [
    {
        id_reemb: 1,
        nom_tip_seg: 'Seguro Médico',
        fecha_reemb: '2024-06-01',
        motivo_reemb: 'Consulta general',
        nom_estado: 'Aprobado',
        cedr_cli: '1234567890'
    },
    {
        id_reemb: 2,
        nom_tip_seg: 'Seguro Odontológico',
        fecha_reemb: '2024-06-02',
        motivo_reemb: 'Tratamiento dental',
        nom_estado: 'Pendiente',
        cedr_cli: '0987654321'
    }
];

const renderComponent = () =>
    render(
        <BrowserRouter>
            <ListaReembolsoCliente id={123} mostrarSeccion={mockMostrarSeccion} />
        </BrowserRouter>
    );

describe('ListaReembolsoCliente - Unidad completa', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Sección 1: Carga de datos
    it('llama a buscarReembolsoCliente al montar', async () => {
        ReembolsoFun.buscarReembolsoCliente.mockResolvedValue(mockData);

        renderComponent();

        await waitFor(() => {
            expect(ReembolsoFun.buscarReembolsoCliente).toHaveBeenCalledWith(123, expect.any(Function));
        });
    });

    // Sección 2: Renderizado de título y tabla
    it('muestra título y los datos de la tabla correctamente', async () => {
        ReembolsoFun.buscarReembolsoCliente.mockResolvedValue(mockData);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Lista de Solicitudes')).toBeInTheDocument();
            expect(screen.getByText('Seguro Médico')).toBeInTheDocument();
            expect(screen.getByText('Consulta general')).toBeInTheDocument();
            expect(screen.getByText('Aprobado')).toBeInTheDocument();
            expect(screen.getByText('Seguro Odontológico')).toBeInTheDocument();
        });
    });

    // Sección 3: Carga en progreso
    it('muestra componente de carga mientras se obtienen los datos', async () => {
        ReembolsoFun.buscarReembolsoCliente.mockImplementation(() => new Promise(() => { }));

        renderComponent();

        expect(screen.getByTestId('cargar-tablas')).toBeInTheDocument();
    });

    // Sección 4: Filtro por número de cédula
    it('filtra correctamente por número de cédula', async () => {
        ReembolsoFun.buscarReembolsoCliente.mockResolvedValue(mockData);

        renderComponent();

        // Espera a que los datos aparezcan en la tabla
        await waitFor(() => {
            expect(screen.getByText('Seguro Médico')).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText(/numero de reembolso/i);
        fireEvent.change(input, { target: { value: '123' } });

        // Verifica que el filtro funcione
        expect(screen.getByText('Seguro Médico')).toBeInTheDocument();
        expect(screen.queryByText('Seguro Odontológico')).not.toBeInTheDocument();
    });

    // Sección 5: Botón de limpiar filtro
    it('restaura todos los datos al borrar filtro', async () => {
        ReembolsoFun.buscarReembolsoCliente.mockResolvedValue(mockData);

        renderComponent();

        await waitFor(() => {
            const input = screen.getByPlaceholderText(/numero de reembolso/i);
            fireEvent.change(input, { target: { value: '123' } });
        });

        fireEvent.click(screen.getByTitle('Limpiar filtros'));

        expect(screen.getByText('Seguro Médico')).toBeInTheDocument();
        expect(screen.getByText('Seguro Odontológico')).toBeInTheDocument();
    });
    // Sección 6: No filtra si el input está vacío
    it('no filtra si el input está vacío', async () => {
        ReembolsoFun.buscarReembolsoCliente.mockResolvedValue(mockData);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Seguro Médico')).toBeInTheDocument();
        });

        const input = screen.getByPlaceholderText(/numero de reembolso/i);
        fireEvent.change(input, { target: { value: '' } });

        // No debería alterar los resultados visibles
        expect(screen.getByText('Seguro Médico')).toBeInTheDocument();
        expect(screen.getByText('Seguro Odontológico')).toBeInTheDocument();
    });

    // Sección 7: Simula error durante carga
    it('maneja errores al cargar reembolsos', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
        ReembolsoFun.buscarReembolsoCliente.mockRejectedValue(new Error('Error de red'));

        renderComponent();

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Ha ocurrido un error');
        });

        consoleSpy.mockRestore();
    });

    // Sección 8: Valida estilos por clases CSS
    it('tiene clases de estilo principales aplicadas', async () => {
        ReembolsoFun.buscarReembolsoCliente.mockResolvedValue(mockData);

        renderComponent();

        const contenedor = await screen.findByText('Lista de Solicitudes');
        expect(contenedor.closest('div')).toHaveClass('cliente-form');
    });

    // Sección 9: No renderiza tabla si no hay datos
    it('muestra mensaje si no hay datos', async () => {
        ReembolsoFun.buscarReembolsoCliente.mockResolvedValue([]);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('No hay Solicitudes de Reembolsos para mostrar')).toBeInTheDocument();
        });
    });

});
