import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VentanaCliente from '../usuarios/VentanaCliente'; // Ajusta la ruta real
import ClientesFun from '../clientes/ClientesFun';

// Mock de ClientesFun
jest.mock('../clientes/ClientesFun', () => ({
  buscarcliente: jest.fn(),
  buscarArchivos: jest.fn(),
}));

// Mock de estilos para evitar problemas en tests
jest.mock('../estilos/VentanaCliente.module.css', () => ({}));
jest.mock('../estilos/VentanaAdmin.module.css', () => ({}));

// Mock de componentes hijos para simplificar test
jest.mock('../reembolsos/ReembolsoCliente', () => () => <div>Reembolso Cliente Componente Mock</div>);
jest.mock('../clientes/ClientesArchivos', () => () => <div>Clientes Archivos Componente Mock</div>);
jest.mock('../cargando/cargarArchivos', () => () => <div>Cargando...</div>);

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: { user: { rol: 'Cliente' } }
  }),
}));

describe('VentanaCliente', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.setItem('login', JSON.stringify({ user: 'usuario1' }));
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  test('Carga y muestra datos básicos del cliente', async () => {
    const clienteMock = [{
      id_estado: 1,
      nom_cli: 'Juan',
      ape_cli: 'Pérez',
      id_pers: 123,
    }];

    ClientesFun.buscarcliente.mockResolvedValue(clienteMock);
    ClientesFun.buscarArchivos.mockResolvedValue('http://ruta.a.imagen/perfil.jpg');

    render(
      <MemoryRouter>
        <VentanaCliente />
      </MemoryRouter>
    );

    // Verifica que aparece el texto con el rol (desde location.state)
    expect(screen.getByText(/Bienvenido Cliente/i)).toBeInTheDocument();

    // Espera que se carguen y muestren nombres completos
    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    // Espera que cargue la imagen de perfil
    await waitFor(() => {
      const img = screen.getByAltText('Imagen perfil');
      expect(img).toBeInTheDocument();
      expect(img.src).toBe('http://ruta.a.imagen/perfil.jpg');
    });
  });

  test('Permite cambiar de sección a Reembolsos y cerrar sesión', async () => {
    const clienteMock = [{
      id_estado: 1,
      nom_cli: 'Juan',
      ape_cli: 'Pérez',
      id_pers: 123,
    }];

    ClientesFun.buscarcliente.mockResolvedValue(clienteMock);
    ClientesFun.buscarArchivos.mockResolvedValue(null);

    render(
      <MemoryRouter>
        <VentanaCliente />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    });

    // Cambiar a sección "Reembolso"
    const linkReembolso = screen.getByText('Reembolsos');
    fireEvent.click(linkReembolso);

    // Verifica que componente ReembolsoCliente mockeado se muestra
    expect(screen.getByText(/Reembolso Cliente Componente Mock/i)).toBeInTheDocument();

    // Click en cerrar sesión
    const cerrarSesionLink = screen.getByText('Cerrar sesión');
    fireEvent.click(cerrarSesionLink);

    expect(mockNavigate).toHaveBeenCalledWith("/", { state: { user: "" } });
    expect(window.localStorage.getItem('login')).toBeNull();
  });
});
