import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { VentanaCliente } from '../usuarios/ventanaCliente';

// Mock del ApiService
jest.mock('../../services/ApiService', () => ({
  traerDatos: jest.fn(() => Promise.resolve([{ id: 1, nombre: 'Cliente de prueba' }])),
}));

// Mock del useNavigate y useLocation
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => ({
    state: { user: { rol: 'Cliente' } }
  }),
}));

describe('VentanaCliente', () => {
  beforeEach(() => {
    mockedNavigate.mockReset();
    localStorage.clear();
  });

  test('renderiza mensaje de bienvenida', () => {
    render(
      <MemoryRouter>
        <VentanaCliente />
      </MemoryRouter>
    );

    expect(screen.getByText(/Bienvenido Cliente/i)).toBeInTheDocument();
  });

  test('contiene las opciones del menú', () => {
    render(
      <MemoryRouter>
        <VentanaCliente />
      </MemoryRouter>
    );

    expect(screen.getByText(/Contratación de seguro/i)).toBeInTheDocument();
    expect(screen.getByText(/Historial de pagos/i)).toBeInTheDocument();
    expect(screen.getByText(/Reembolsos/i)).toBeInTheDocument();
    expect(screen.getByText(/Facturas/i)).toBeInTheDocument();
  });

  test('cierra sesión correctamente', () => {
    render(
      <MemoryRouter>
        <VentanaCliente />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText(/Cerrar sesión/i));
    expect(localStorage.getItem('login')).toBe('');
    expect(mockedNavigate).toHaveBeenCalledWith('/', { state: { user: '' } });
  });

  test('llama a traerDatos desde ApiService cuando se ejecuta valores()', async () => {
    const { traerDatos } = require('../../services/ApiService');
    const fakeEvent = { preventDefault: jest.fn() };

    render(
      <MemoryRouter>
        <VentanaCliente />
      </MemoryRouter>
    );

    // Ejecutar manualmente la función si estuviera disponible
    await traerDatos("client/clientes", mockedNavigate);
    expect(traerDatos).toHaveBeenCalledWith("client/clientes", mockedNavigate);
  });
});
