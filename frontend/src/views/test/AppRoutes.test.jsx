import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppRoutes from '../../AppRoutes';

// Mocks
jest.mock('../../views/Login.jsx', () => () => <div>Login Page</div>);
jest.mock('../../views/usuarios/VentanaAdmin.jsx', () => () => <div>Admin Page</div>);
jest.mock('../../views/usuarios/VentanaAgente.jsx', () => () => <div>Agente Page</div>);
jest.mock('../../views/usuarios/ventanaCliente.jsx', () => () => <div>Cliente Page</div>);
jest.mock('../../views/validaciones/ValidarContratacionSeguro', () => () => <div>Validar Contratación</div>);
jest.mock('../../views/validaciones/ValidarEmail', () => () => <div>Validar Email</div>);

describe('App Routing', () => {
  test('debe mostrar Login en ruta "/"', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  test('debe mostrar VentanaAdmin en ruta "/admin"', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText('Admin Page')).toBeInTheDocument();
  });

  test('debe mostrar VentanaAgente en ruta "/agente"', () => {
    render(
      <MemoryRouter initialEntries={['/agente']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText('Agente Page')).toBeInTheDocument();
  });

  test('debe mostrar VentanaCliente en ruta "/cliente"', () => {
    render(
      <MemoryRouter initialEntries={['/cliente']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText('Cliente Page')).toBeInTheDocument();
  });

  test('debe mostrar ValidarContratacionSeguro con parámetro de ruta', () => {
    render(
      <MemoryRouter initialEntries={['/validacionContratacion/123']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText('Validar Contratación')).toBeInTheDocument();
  });

  test('debe mostrar ValidarEmail con parámetro de ruta', () => {
    render(
      <MemoryRouter initialEntries={['/validacionEmail/456']}>
        <AppRoutes />
      </MemoryRouter>
    );
    expect(screen.getByText('Validar Email')).toBeInTheDocument();
  });
});
