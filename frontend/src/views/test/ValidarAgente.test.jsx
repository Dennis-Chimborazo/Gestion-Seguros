import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ValidarAgente from '../validaciones/ValidarAgente';
import AgenteFun from '../agentes/AgenteFun';
import UsuariosFun from '../usuarios/UsuariosFun';
import swal from 'sweetalert2';

// Mock de sweetalert2
jest.mock('sweetalert2', () => ({
    fire: jest.fn(() => Promise.resolve({ isConfirmed: true })),
}));
jest.mock('../cargando/CargarInf', () => () => <div data-testid="loading-spinner">Cargando...</div>);


// Mock para sonner toast
jest.mock('sonner', () => ({
    Toaster: () => <div data-testid="toaster" />,
    toast: { error: jest.fn() },
}));

// Mocks de módulos propios
jest.mock('../agentes/AgenteFun');
jest.mock('../usuarios/UsuariosFun');

// MOCK del navigate (importante: declarar antes del jest.mock)
const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => {
    const originalModule = jest.requireActual('react-router-dom');
    return {
        __esModule: true,
        ...originalModule,
        useNavigate: () => mockedNavigate,
    };
});

const renderWithRouter = (idParam = 'test-token') =>
    render(
        <MemoryRouter initialEntries={[`/validar/${idParam}`]}>
            <Routes>
                <Route path="/validar/:id" element={<ValidarAgente />} />
                <Route path="/" element={<div>Redireccionado a inicio</div>} />
            </Routes>
        </MemoryRouter>
    );

describe('✅ ValidarAgente', () => {
    const mockAgente = {
        id_pers: '123',
        idvalid: 'abc',
        nom_agente: 'Juan',
        ape_agente: 'Pérez',
        pass: 'temp123',
        email_agente: 'juan@example.com',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('muestra formulario si el token es válido', async () => {
        AgenteFun.validarTokenEmail.mockResolvedValue({
            success: true,
            data: { id_pers: mockAgente.id_pers, pass: mockAgente.pass },
            idvalid: mockAgente.idvalid,
        });

        AgenteFun.buscarAgente.mockResolvedValue([mockAgente]);

        renderWithRouter();

        expect(await screen.findByText(/¡Bienvenido a Seguros\.SA!/i)).toBeInTheDocument();
        expect(screen.getByText(/Juan Pérez/i)).toBeInTheDocument();
        expect(screen.getByText(/Tu usuario por defecto es: juan@example.com/i)).toBeInTheDocument();
    });

    it('muestra mensaje de error si el token es inválido', async () => {
        AgenteFun.validarTokenEmail.mockResolvedValue({ success: false });

        renderWithRouter();

        expect(await screen.findByText(/Enlace inválido o expirado/i)).toBeInTheDocument();
    });

    it('muestra errores si faltan campos o claves no coinciden', async () => {
        AgenteFun.validarTokenEmail.mockResolvedValue({
            success: true,
            data: { id_pers: mockAgente.id_pers, pass: mockAgente.pass },
            idvalid: mockAgente.idvalid,
        });

        AgenteFun.buscarAgente.mockResolvedValue([mockAgente]);

        renderWithRouter();

        fireEvent.change(await screen.findByLabelText(/Contraseña temporal/i), {
            target: { name: 'passtemp', value: 'temp123' },
        });

        fireEvent.change(screen.getByLabelText(/Nueva Contraseña/i), {
            target: { name: 'pass', value: '1234' },
        });

        fireEvent.change(screen.getByLabelText(/Confirme contraseña/i), {
            target: { name: 'confirmPassword', value: '9999' },
        });

        fireEvent.click(screen.getByText(/Validar cuenta/i));

        await waitFor(() => {
            expect(require('sonner').toast.error).toHaveBeenCalledWith('Las contraseña no coinciden');
        });
    });

    it('ejecuta flujo completo cuando el formulario es válido', async () => {
        AgenteFun.validarTokenEmail.mockResolvedValue({
            success: true,
            data: { id_pers: mockAgente.id_pers, pass: mockAgente.pass },
            idvalid: mockAgente.idvalid,
        });

        AgenteFun.buscarAgente.mockResolvedValue([mockAgente]);
        AgenteFun.activarCuentaAgente.mockResolvedValue(true);
        UsuariosFun.actualizarPass.mockResolvedValue({ success: true });

        renderWithRouter();

        fireEvent.change(await screen.findByLabelText(/Contraseña temporal/i), {
            target: { name: 'passtemp', value: 'temp123' },
        });
        fireEvent.change(screen.getByLabelText(/Nueva Contraseña/i), {
            target: { name: 'pass', value: '123456' },
        });
        fireEvent.change(screen.getByLabelText(/Confirme contraseña/i), {
            target: { name: 'confirmPassword', value: '123456' },
        });

        fireEvent.click(screen.getByText(/Validar cuenta/i));

        await waitFor(() => {
            expect(AgenteFun.activarCuentaAgente).toHaveBeenCalled();
            expect(UsuariosFun.actualizarPass).toHaveBeenCalled();
            expect(mockedNavigate).toHaveBeenCalledWith('/');
        });
    });
    it('botón OK en pantalla de error navega al inicio', async () => {
        AgenteFun.validarTokenEmail.mockResolvedValue({ success: false });

        renderWithRouter();

        await screen.findByText(/Enlace inválido o expirado/i);

        fireEvent.click(screen.getByText(/^OK$/i));

        expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
    it('verificarDatos muestra error para campos faltantes o contraseñas no coinciden', async () => {
        AgenteFun.validarTokenEmail.mockResolvedValue({
            success: true,
            data: { id_pers: mockAgente.id_pers, pass: mockAgente.pass },
            idvalid: mockAgente.idvalid,
        });
        AgenteFun.buscarAgente.mockResolvedValue([mockAgente]);

        renderWithRouter();

        await screen.findByText(/¡Bienvenido a Seguros\.SA!/i);

        // Faltando contraseña temporal
        fireEvent.change(screen.getByLabelText(/Contraseña temporal/i), { target: { name: 'passtemp', value: '' } });
        fireEvent.click(screen.getByText(/Validar cuenta/i));
        await waitFor(() => {
            expect(require('sonner').toast.error).toHaveBeenCalledWith("Clave Temporal no coincide");
        });

        // Contraseña temporal incorrecta
        fireEvent.change(screen.getByLabelText(/Contraseña temporal/i), { target: { name: 'passtemp', value: 'wrongtemp' } });
        fireEvent.click(screen.getByText(/Validar cuenta/i));
        await waitFor(() => {
            expect(require('sonner').toast.error).toHaveBeenCalledWith("Clave Temporal no coincide");
        });

        // Contraseñas no coinciden
        fireEvent.change(screen.getByLabelText(/Contraseña temporal/i), { target: { name: 'passtemp', value: 'temp123' } });
        fireEvent.change(screen.getByLabelText(/Nueva Contraseña/i), { target: { name: 'pass', value: 'abc' } });
        fireEvent.change(screen.getByLabelText(/Confirme contraseña/i), { target: { name: 'confirmPassword', value: 'xyz' } });
        fireEvent.click(screen.getByText(/Validar cuenta/i));
        await waitFor(() => {
            expect(require('sonner').toast.error).toHaveBeenCalledWith("Las contraseña no coinciden");
        });

        // Campos vacíos en formulario
        fireEvent.change(screen.getByLabelText(/Nueva Contraseña/i), { target: { name: 'pass', value: '' } });
        fireEvent.change(screen.getByLabelText(/Confirme contraseña/i), { target: { name: 'confirmPassword', value: '' } });
        fireEvent.click(screen.getByText(/Validar cuenta/i));
        await waitFor(() => {
            expect(require('sonner').toast.error).toHaveBeenCalledWith("Faltan campos por llenar los campos");
        });
    });
    it('muestra alerta de error si validarCuenta lanza excepción', async () => {
        AgenteFun.validarTokenEmail.mockResolvedValue({
            success: true,
            data: { id_pers: mockAgente.id_pers, pass: mockAgente.pass },
            idvalid: mockAgente.idvalid,
        });
        AgenteFun.buscarAgente.mockResolvedValue([mockAgente]);
        AgenteFun.activarCuentaAgente.mockRejectedValue(new Error('Error en servidor'));

        renderWithRouter();

        // Esperar formulario
        await screen.findByText(/¡Bienvenido a Seguros\.SA!/i);

        fireEvent.change(screen.getByLabelText(/Contraseña temporal/i), {
            target: { name: 'passtemp', value: 'temp123' },
        });
        fireEvent.change(screen.getByLabelText(/Nueva Contraseña/i), {
            target: { name: 'pass', value: '123456' },
        });
        fireEvent.change(screen.getByLabelText(/Confirme contraseña/i), {
            target: { name: 'confirmPassword', value: '123456' },
        });

        fireEvent.click(screen.getByText(/Validar cuenta/i));

        await waitFor(() => {
            expect(swal.fire).toHaveBeenCalledWith(expect.objectContaining({
                title: expect.stringContaining('Advertencia'),
                text: expect.stringContaining('fallo'),
            }));
            expect(mockedNavigate).not.toHaveBeenCalled();
        });
    });
    it('no navega al inicio si el usuario cancela la confirmación en cancelarCuenta', async () => {
        // Simula respuesta deny de SweetAlert
        swal.fire.mockResolvedValueOnce({ isConfirmed: false });

        AgenteFun.validarTokenEmail.mockResolvedValue({
            success: true,
            data: { id_pers: mockAgente.id_pers, pass: mockAgente.pass },
            idvalid: mockAgente.idvalid,
        });
        AgenteFun.buscarAgente.mockResolvedValue([mockAgente]);

        renderWithRouter();

        // Esperar que formulario se muestre
        await screen.findByText(/¡Bienvenido a Seguros\.SA!/i);

        fireEvent.click(screen.getByText(/Cancelar/i));

        await waitFor(() => {
            expect(swal.fire).toHaveBeenCalled();
            expect(mockedNavigate).not.toHaveBeenCalled();
        });
    });
    it('muestra el loader mientras loading es true', () => {
        AgenteFun.validarTokenEmail.mockReturnValue(new Promise(() => { })); // promesa pendiente
        const { getByTestId } = renderWithRouter();
        expect(getByTestId('loading-spinner')).toBeInTheDocument();
    });


});
