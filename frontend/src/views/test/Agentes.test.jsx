import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import Agentes from '../agentes/Agentes'; // Ajusta la ruta según la ubicación real del archivo
import AgenteFun from '../agentes/AgenteFun';

// Mock de los datos de ejemplo
const mockAgentes = {
  rows: [
    {
      ced_agente: '1234567890',
      nom_agente: 'Juan',
      ape_agente: 'Pérez',
      email_agente: 'juan@correo.com',
      dire_agente: 'Dirección 123',
      tel_agente: '0987654321',
    },
  ]
};

// Mock de funciones externas
jest.mock('../agentes/AgenteFun', () => ({
  obtenerAgentes: jest.fn(),
}));

// Mock del componente InfoCard
jest.mock('../cargando/InfoCards', () => ({ text, onClick }) => (
  <div onClick={onClick}>{text}</div>
));

// Mock de CargarTablas
jest.mock('../cargando/CargarTablas', () => () => (
  <div>Cargando...</div>
));

describe('Agentes Component', () => {
  test('renderiza campos e interfaz correctamente', async () => {
    AgenteFun.obtenerAgentes.mockResolvedValueOnce(mockAgentes);

    const mockMostrarSeccion = jest.fn();

    render(
      <MemoryRouter>
        <Agentes mostrarSeccion={mockMostrarSeccion} />
      </MemoryRouter>
    );

    // Espera a que se muestre el título
    expect(await screen.findByText('Gestión de Agentes')).toBeInTheDocument();

    // Inputs
    expect(screen.getByTestId("buscar-agente")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Ingrese número de cédula" )).toBeInTheDocument();

    // Botones de InfoCard
    expect(screen.getByText('Nuevo Agente')).toBeInTheDocument();
    expect(screen.getByText('Validaciones Pendientes')).toBeInTheDocument();

    // Datos del agente
    expect(await screen.findByText('1234567890')).toBeInTheDocument();
    expect(await screen.findByText('Juan')).toBeInTheDocument();
    expect(await screen.findByText('Pérez')).toBeInTheDocument();
    expect(await screen.findByText('juan@correo.com')).toBeInTheDocument();
  });


  test('filtra por cédula correctamente', async () => {
    AgenteFun.obtenerAgentes.mockResolvedValueOnce(mockAgentes);

    render(
      <MemoryRouter>
        <Agentes mostrarSeccion={() => { }} />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('1234567890')).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Ingrese número de cédula/i);
    fireEvent.change(input, { target: { value: '999' } });

    expect(screen.queryByText('1234567890')).not.toBeInTheDocument();
  });
  test('borra el filtro y muestra todos los datos', async () => {
    AgenteFun.obtenerAgentes.mockResolvedValueOnce(mockAgentes);

    render(
      <MemoryRouter>
        <Agentes mostrarSeccion={() => { }} />
      </MemoryRouter>
    );

    await screen.findByText('1234567890');
    const input = screen.getByPlaceholderText(/Ingrese número de cédula/i);
    fireEvent.change(input, { target: { value: '999' } });

    expect(screen.queryByText('1234567890')).not.toBeInTheDocument();

    const clearBtn = screen.getByTestId('boton-borrar-filtro');
    fireEvent.click(clearBtn);

    expect(await screen.findByText('1234567890')).toBeInTheDocument();
  });

  test('navega a sección crearAgentes y AgentePendiente', async () => {
    AgenteFun.obtenerAgentes.mockResolvedValueOnce(mockAgentes);
    const mockMostrarSeccion = jest.fn();

    render(
      <MemoryRouter>
        <Agentes mostrarSeccion={mockMostrarSeccion} />
      </MemoryRouter>
    );

    await screen.findByText('1234567890');

    fireEvent.click(screen.getByText('Nuevo Agente'));
    expect(mockMostrarSeccion).toHaveBeenCalledWith('crearAgentes');

    fireEvent.click(screen.getByText('Validaciones Pendientes'));
    expect(mockMostrarSeccion).toHaveBeenCalledWith('AgentePendiente');
  });

  test('al hacer click en el ícono de editar guarda en localStorage y navega', async () => {
  localStorage.clear();
  AgenteFun.obtenerAgentes.mockResolvedValueOnce(mockAgentes);
  const mockMostrarSeccion = jest.fn();

  render(
    <MemoryRouter>
      <Agentes mostrarSeccion={mockMostrarSeccion} />
    </MemoryRouter>
  );

  const iconosEditar = await screen.findAllByTestId('icono-editar-0');
  fireEvent.click(iconosEditar[0]);

  await waitFor(() => {
    const item = localStorage.getItem('editAgente');
    expect(item).not.toBeNull();
    expect(JSON.parse(item)).toEqual({
      edit: true,
      agente: mockAgentes.rows[0],
    });
  });

  expect(mockMostrarSeccion).toHaveBeenCalledWith('EditarAgente');
});



});
