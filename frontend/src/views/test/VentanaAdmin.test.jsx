import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { VentanaAdmin } from '../../views/usuarios/VentanaAdmin';

// Mocks para subcomponentes
jest.mock('../../views/clientes/Clientes', () => () => <div>Clientes Componente</div>);
jest.mock('../../views/clientes/CrearClientes', () => () => <div>CrearClientes Componente</div>);
jest.mock('../../views/clientes/EditarClientes', () => () => <div>EditarClientes Componente</div>);
jest.mock('../../views/clientes/ValidacionCliente', () => () => <div>ValidacionCliente Componente</div>);
jest.mock('../../views/segurosAdmin/SegurosAdmin', () => () => <div>SegurosAdmin Componente</div>);
jest.mock('../../views/segurosAdmin/CrearSeguroAdmin', () => () => <div>CrearSeguroAdmin Componente</div>);
jest.mock('../../views/segurosAdmin/EditarSeguroAdmin', () => () => <div>EditarSeguroAdmin Componente</div>);
jest.mock('../../views/gestionContratacion/gestionContratacion', () => () => <div>GestionContratacion Componente</div>);
jest.mock('../../views/gestionContratacion/CrearContratacion', () => () => <div>CrearContratacion Componente</div>);

// Mock de useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
  useLocation: () => ({
    state: { user: { nom_rol: 'Administrador' } }
  }),
}));

describe('VentanaAdmin', () => {
  beforeEach(() => {
    mockedNavigate.mockReset();
    localStorage.clear();
  });

  test('debe mostrar el rol del usuario y mensaje de inicio', () => {
    render(
      <MemoryRouter>
        <VentanaAdmin />
      </MemoryRouter>
    );
    expect(screen.getByText(/Bienvenido Administrador/i)).toBeInTheDocument();
    expect(screen.getByText(/Selecciona una opción del menú/i)).toBeInTheDocument();
  });

  test('debe renderizar la sección de Clientes al hacer clic en el menú', () => {
    render(
      <MemoryRouter>
        <VentanaAdmin />
      </MemoryRouter>
    );

    const linkClientes = screen.getByText('Clientes');
    fireEvent.click(linkClientes);

    expect(screen.getByText('Clientes Componente')).toBeInTheDocument();
  });

  test('debe renderizar la sección de Seguros al hacer clic en el menú', () => {
    render(
      <MemoryRouter>
        <VentanaAdmin />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Seguros'));

    expect(screen.getByText('SegurosAdmin Componente')).toBeInTheDocument();
  });

  test('debe cerrar sesión y redirigir al login', () => {
    render(
      <MemoryRouter>
        <VentanaAdmin />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Cerrar sesión'));

    expect(localStorage.getItem('login')).toBe('');
    expect(mockedNavigate).toHaveBeenCalledWith('/', { state: { user: '' } });
  });

  test('debe renderizar sección de reportes al hacer clic en el menú', () => {
    render(
      <MemoryRouter>
        <VentanaAdmin />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Reportes'));

    expect(screen.getByText('Sección de reportes')).toBeInTheDocument();
  });
});
