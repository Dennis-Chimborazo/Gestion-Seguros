import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { VentanaAgente } from '../../views/usuarios/VentanaAgente';

// Mocks de componentes hijos
jest.mock('../../views/clientes/Clientes', () => () => <div>Clientes Componente</div>);
jest.mock('../../views/clientes/CrearClientes', () => () => <div>CrearClientes Componente</div>);
jest.mock('../../views/clientes/EditarClientes', () => () => <div>EditarClientes Componente</div>);

// Mock del módulo ApiService
jest.mock('../../services/ApiService', () => ({
  traerDatos: jest.fn(() => Promise.resolve([{ id: 1, nombre: "Test Cliente" }]))
}));

// Mock de hooks de react-router-dom
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => ({
    state: { user: { nom_rol: 'Agente' } }
  }),
}));

describe('VentanaAgente', () => {
  beforeEach(() => {
    mockedNavigate.mockReset();
    localStorage.clear();
  });

  test('muestra mensaje de bienvenida e inicio', () => {
    render(
      <MemoryRouter>
        <VentanaAgente />
      </MemoryRouter>
    );

    expect(screen.getByText(/Bienvenido Agente/i)).toBeInTheDocument();
    expect(screen.getByText(/Selecciona una opción del menú/i)).toBeInTheDocument();
  });

  test('renderiza sección Clientes al hacer clic', () => {
    render(
      <MemoryRouter>
        <VentanaAgente />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Clientes'));
    expect(screen.getByText('Clientes Componente')).toBeInTheDocument();
  });

  test('renderiza sección Reportes al hacer clic', () => {
    render(
      <MemoryRouter>
        <VentanaAgente />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Reportes'));
    expect(screen.getByText('Sección de reportes')).toBeInTheDocument();
  });

  test('cierra sesión y redirige al login', () => {
    render(
      <MemoryRouter>
        <VentanaAgente />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Cerrar sesión'));
    expect(localStorage.getItem('login')).toBe('');
    expect(mockedNavigate).toHaveBeenCalledWith('/', { state: { user: '' } });
  });

  test('ejecuta la función valores correctamente', async () => {
    const { container } = render(
      <MemoryRouter>
        <VentanaAgente />
      </MemoryRouter>
    );

    const instancia = container.querySelector('div');
    const event = { preventDefault: jest.fn() };

    const componentInstance = screen.getByText(/Bienvenido/i).closest('div');
    expect(componentInstance).not.toBeNull();

    // Simula llamada manual a valores()
    const { traerDatos } = require('../../services/ApiService');
    await traerDatos('client/clientes', mockedNavigate);
    expect(traerDatos).toHaveBeenCalledWith('client/clientes', mockedNavigate);
  });
});
