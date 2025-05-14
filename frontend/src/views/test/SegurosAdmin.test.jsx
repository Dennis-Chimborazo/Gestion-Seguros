import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SegurosAdmin } from '../segurosAdmin/SegurosAdmin'; // Ruta a tu componente
import SegurosAdminFun from '../segurosAdmin/SegurosAdminFun'; // Ruta al módulo con traerTiposSeguros
import { BrowserRouter } from 'react-router-dom';

// Mock del módulo SegurosAdminFun
jest.mock('../segurosAdmin/SegurosAdminFun', () => ({
__esModule: true,
default: {
traerTiposSeguros: jest.fn()
}
}));

const mockMostrarSeccion = jest.fn();

const mockData = {
rows: [
{
nom_tip_seg: 'Seguro Vida',
descrip_tip_seg: 'Cobertura completa',
pago_tip_seg: 100
},
{
nom_tip_seg: 'Seguro Auto',
descrip_tip_seg: 'Cobertura parcial',
pago_tip_seg: 50
}
]
};

const renderWithRouter = (ui) => {
return render(<BrowserRouter>{ui}</BrowserRouter>);
};

describe('SegurosAdmin', () => {
beforeEach(async () => {
SegurosAdminFun.traerTiposSeguros.mockResolvedValueOnce(mockData);
renderWithRouter(<SegurosAdmin mostrarSeccion={mockMostrarSeccion} />);
await waitFor(() =>
expect(SegurosAdminFun.traerTiposSeguros).toHaveBeenCalled()
);
});

it('renderiza título y botón Crear', () => {
expect(screen.getByText(/Tipos de Seguros/i)).toBeInTheDocument();
expect(screen.getByRole('button', { name: /crear/i })).toBeInTheDocument();
});

it('muestra datos en la tabla', async () => {
expect(await screen.findByText('Seguro Vida')).toBeInTheDocument();
expect(screen.getByText('Cobertura completa')).toBeInTheDocument();
expect(screen.getByText('100')).toBeInTheDocument();
});

it('filtra seguros al escribir', async () => {
const input = screen.getByPlaceholderText(/Ingrese código del seguro/i);
fireEvent.change(input, { target: { value: 'Vida' } });

await waitFor(() => {
  expect(screen.getByText('Seguro Vida')).toBeInTheDocument();
  expect(screen.queryByText('Seguro Auto')).not.toBeInTheDocument();
});
});

it('restaura filtro con el botón de borrar', async () => {
const input = screen.getByPlaceholderText(/Ingrese código del seguro/i);
fireEvent.change(input, { target: { value: 'Vida' } });

const clearButton = screen.getByTestId('clear-filter-icon');
fireEvent.click(clearButton);


await waitFor(() => {
  expect(screen.getByText('Seguro Vida')).toBeInTheDocument();
  expect(screen.getByText('Seguro Auto')).toBeInTheDocument();
});
});

it('al hacer click en Crear llama a mostrarSeccion con CrearSeguroAdmin', () => {
fireEvent.click(screen.getByRole('button', { name: /crear/i }));
expect(mockMostrarSeccion).toHaveBeenCalledWith('CrearSeguroAdmin');
});

it('al hacer click en el ícono de editar llama a mostrarSeccion con EditarSeguroAdmin', async () => {
const icon = await screen.findByTestId('editar-icon-Seguro Vida');
fireEvent.click(icon);
expect(mockMostrarSeccion).toHaveBeenCalledWith('EditarSeguroAdmin');
});
});
