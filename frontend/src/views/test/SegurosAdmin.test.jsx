import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SegurosAdmin from '../segurosAdmin/SegurosAdmin';  // Ajusta ruta
import SegurosAdminFun from '../segurosAdmin/SegurosAdminFun'; // Importa la clase entera

const mockMostrarSeccion = jest.fn();

const mockData = {
  rows: [
    { nom_tip_seg: 'Seguro Vida', descrip_tip_seg: 'Cobertura completa', pago_tip_seg: 100 },
    { nom_tip_seg: 'Seguro Auto', descrip_tip_seg: 'Cobertura parcial', pago_tip_seg: 50 },
  ],
};

describe('SegurosAdmin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('debe mostrar loading inicialmente', async () => {
    jest.spyOn(SegurosAdminFun, 'traerTiposSeguros').mockImplementation(() => new Promise(() => { }));

    render(
      <BrowserRouter>
        <SegurosAdmin mostrarSeccion={mockMostrarSeccion} />
      </BrowserRouter>
    );

    expect(screen.getByTestId('cargar-tablas')).toBeInTheDocument();
  });

  it('debe renderizar título y botón Crear después de cargar', async () => {
    jest.spyOn(SegurosAdminFun, 'traerTiposSeguros').mockResolvedValue(mockData);

    render(
      <BrowserRouter>
        <SegurosAdmin mostrarSeccion={mockMostrarSeccion} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Gestión de Tipos de Seguros/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Nuevo Tipo de Seguro/i })).toBeInTheDocument();
    });
  });

  it('debe llamar a traerTiposSeguros al montar', async () => {
    jest.spyOn(SegurosAdminFun, 'traerTiposSeguros').mockResolvedValue(mockData);

    render(
      <BrowserRouter>
        <SegurosAdmin mostrarSeccion={mockMostrarSeccion} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(SegurosAdminFun.traerTiposSeguros).toHaveBeenCalledTimes(1);
    });
  });

  it('filtra los seguros al escribir en el input', async () => {
    jest.spyOn(SegurosAdminFun, 'traerTiposSeguros').mockResolvedValue(mockData);

    render(
      <BrowserRouter>
        <SegurosAdmin mostrarSeccion={mockMostrarSeccion} />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.queryByTestId('cargar-tablas')).not.toBeInTheDocument());

    const inputBuscar = screen.getByPlaceholderText('Ingrese nombre del seguro');

    fireEvent.change(inputBuscar, { target: { value: 'Seguro Vida' } });

    expect(screen.getByText('Seguro Vida')).toBeInTheDocument();
    expect(screen.queryByText('Seguro Auto')).not.toBeInTheDocument();
  });

  it('borra el filtro al hacer click en el botón limpiar filtro', async () => {
    jest.spyOn(SegurosAdminFun, 'traerTiposSeguros').mockResolvedValue(mockData);

    render(
      <BrowserRouter>
        <SegurosAdmin mostrarSeccion={mockMostrarSeccion} />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.queryByTestId('cargar-tablas')).not.toBeInTheDocument());

    const inputBuscar = screen.getByPlaceholderText('Ingrese nombre del seguro');
    fireEvent.change(inputBuscar, { target: { value: 'Seguro Vida' } });

    expect(screen.getByText('Seguro Vida')).toBeInTheDocument();
    expect(screen.queryByText('Seguro Auto')).not.toBeInTheDocument();

    const botonLimpiar = screen.getByRole('button', { name: /Limpiar filtros/i });
    fireEvent.click(botonLimpiar);

    expect(screen.getByText('Seguro Vida')).toBeInTheDocument();
    expect(screen.getByText('Seguro Auto')).toBeInTheDocument();
  });

  it('llama a mostrarSeccion con "CrearSeguroAdmin" al hacer click en Crear', async () => {
    jest.spyOn(SegurosAdminFun, 'traerTiposSeguros').mockResolvedValue({ rows: [] });

    render(
      <BrowserRouter>
        <SegurosAdmin mostrarSeccion={mockMostrarSeccion} />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.queryByTestId('cargar-tablas')).not.toBeInTheDocument());

    const botonCrear = screen.getByRole('button', { name: /Nuevo Tipo de Seguro/i });
    fireEvent.click(botonCrear);

    expect(mockMostrarSeccion).toHaveBeenCalledWith('CrearSeguroAdmin');
  });

  it('guarda seguro editado y llama a mostrarSeccion al hacer click en el icono de editar', async () => {
    jest.spyOn(SegurosAdminFun, 'traerTiposSeguros').mockResolvedValue({
      rows: [{ nom_tip_seg: 'Seguro Vida', descrip_tip_seg: 'Cobertura completa', pago_tip_seg: 100 }],
    });

    render(
      <BrowserRouter>
        <SegurosAdmin mostrarSeccion={mockMostrarSeccion} />
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.queryByTestId('cargar-tablas')).not.toBeInTheDocument());

    const iconoEditar = screen.getByTestId('icono-seguro-0');
    fireEvent.click(iconoEditar);

    const editSeguro = JSON.parse(localStorage.getItem('editSeguro'));

    expect(editSeguro).toEqual({
      edit: true,
      seguro: {
        nom_tip_seg: 'Seguro Vida',
        descrip_tip_seg: 'Cobertura completa',
        pago_tip_seg: 100,
      },
    });

    expect(mockMostrarSeccion).toHaveBeenCalledWith('EditarSeguroAdmin');
  });

  // --- Bloque agregado para visualización de datos ---

  describe('Visualización de datos en tabla', () => {
    beforeEach(async () => {
      jest.spyOn(SegurosAdminFun, 'traerTiposSeguros').mockResolvedValue(mockData);
      render(
        <BrowserRouter>
          <SegurosAdmin mostrarSeccion={mockMostrarSeccion} />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(SegurosAdminFun.traerTiposSeguros).toHaveBeenCalled();
      });
    });

    it('debe mostrar todos los datos de los seguros', async () => {
      expect(screen.getByText('Seguro Vida')).toBeInTheDocument();
      expect(screen.getByText('Cobertura completa')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();

      expect(screen.getByText('Seguro Auto')).toBeInTheDocument();
      expect(screen.getByText('Cobertura parcial')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('debe mostrar iconos de opciones para cada fila', async () => {
      expect(screen.getByTestId('icono-seguro-0')).toBeInTheDocument();
      expect(screen.getByTestId('icono-seguro-1')).toBeInTheDocument();
    });
  });
});
