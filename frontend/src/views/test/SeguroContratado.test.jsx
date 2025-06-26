// __tests__/SeguroContrado.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import SeguroContrado from '../clientes/SeguroContrado';
import ClientesFun from '../clientes/ClientesFun';
import GestionContratacionFun from '../gestionContratacion/GestionContratacionFun';
import swal from 'sweetalert2';
import { BrowserRouter } from 'react-router-dom';

jest.mock('../clientes/ClientesFun');
jest.mock('../gestionContratacion/GestionContratacionFun');

// Mock de sweetalert2 que devuelve una promesa resuelta con isConfirmed = true
jest.mock('sweetalert2', () => ({
  fire: jest.fn(() => Promise.resolve({ isConfirmed: true }))
}));

const renderComponent = (id = 1) => {
  return render(
    <BrowserRouter>
      <SeguroContrado mostrarSeccion={jest.fn()} id={id} />
    </BrowserRouter>
  );
};

test('muestra los seguros contratados correctamente', async () => {
  ClientesFun.buscarSegurosContatados.mockResolvedValue([
    { id_seguro: 1, id_estado: 3, nom_tip_seg: 'Seguro Vida', numbeneficios: 5, fecha: '2023-01-01', monto_seguro: 1000, tiempo_seguro: 'Anual' }
  ]);

  renderComponent();

  await waitFor(() => {
    expect(screen.getByText(/Seguro Vida/i)).toBeInTheDocument();
  });
});

test('no muestra seguros si la lista está vacía', async () => {
  ClientesFun.buscarSegurosContatados.mockResolvedValue([]);

  renderComponent();

  await waitFor(() => {
    expect(screen.queryByText(/Seguro Vida/i)).not.toBeInTheDocument();
  });
});

test('muestra alerta si el seguro ya fue procesado (estado diferente de 3)', async () => {
  ClientesFun.buscarSegurosContatados.mockResolvedValue([
    { id_seguro: 2, id_estado: 1, nom_tip_seg: 'Seguro Hogar', numbeneficios: 2, fecha: '2023-03-01', monto_seguro: 300, tiempo_seguro: 'Mensual' }
  ]);

  renderComponent();

  await waitFor(() => {
    expect(screen.getByText(/Seguro Hogar/i)).toBeInTheDocument();
  });

  await act(async () => {
    fireEvent.click(screen.getByText(/Seguro Hogar/i));
  });

  expect(swal.fire).toHaveBeenCalledWith(expect.objectContaining({
    title: "⚠️ Advertencia",
    text: "Este seguro ya fue procesado.",
    timer: 3000,
  }));
});



test('limpia seguros y recarga cuando cambia el id', async () => {
  ClientesFun.buscarSegurosContatados
    .mockResolvedValueOnce([
      { id_seguro: 1, id_estado: 3, nom_tip_seg: 'Seguro Vida' }
    ])
    .mockResolvedValueOnce([
      { id_seguro: 2, id_estado: 3, nom_tip_seg: 'Seguro Auto' }
    ]);

  const { rerender } = render(
    <BrowserRouter>
      <SeguroContrado mostrarSeccion={jest.fn()} id={1} />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.getByText(/Seguro Vida/i)).toBeInTheDocument();
  });

  // Cambiar la prop id y rerenderizar
  rerender(
    <BrowserRouter>
      <SeguroContrado mostrarSeccion={jest.fn()} id={2} />
    </BrowserRouter>
  );

  await waitFor(() => {
    expect(screen.queryByText(/Seguro Vida/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Seguro Auto/i)).toBeInTheDocument();
  });
});
test('muestra varios seguros contratados correctamente', async () => {
  ClientesFun.buscarSegurosContatados.mockResolvedValue([
    { id_seguro: 1, id_estado: 3, nom_tip_seg: 'Seguro Vida', numbeneficios: 5, fecha: '2023-01-01', monto_seguro: 1000, tiempo_seguro: 'Anual' },
    { id_seguro: 2, id_estado: 1, nom_tip_seg: 'Seguro Hogar', numbeneficios: 2, fecha: '2023-03-01', monto_seguro: 300, tiempo_seguro: 'Mensual' },
    { id_seguro: 3, id_estado: 3, nom_tip_seg: 'Seguro Auto', numbeneficios: 4, fecha: '2023-05-01', monto_seguro: 700, tiempo_seguro: 'Anual' }
  ]);

  renderComponent();

  await waitFor(() => {
    expect(screen.getByText(/Seguro Vida/i)).toBeInTheDocument();
    expect(screen.getByText(/Seguro Hogar/i)).toBeInTheDocument();
    expect(screen.getByText(/Seguro Auto/i)).toBeInTheDocument();
  });
});
test('muestra alerta correcta si se intenta validar un seguro con estado diferente a 3', async () => {
  ClientesFun.buscarSegurosContatados.mockResolvedValue([
    { id_seguro: 4, id_estado: 2, nom_tip_seg: 'Seguro Vida Plus', numbeneficios: 3, fecha: '2023-06-01', monto_seguro: 800, tiempo_seguro: 'Semestral' }
  ]);

  renderComponent();

  await waitFor(() => {
    expect(screen.getByText(/Seguro Vida Plus/i)).toBeInTheDocument();
  });

  await act(async () => {
    fireEvent.click(screen.getByText(/Seguro Vida Plus/i));
  });

  expect(swal.fire).toHaveBeenCalledWith(expect.objectContaining({
    title: "⚠️ Advertencia",
    text: "Este seguro ya fue procesado.",
    timer: 3000,
  }));
});

test('el contenedor principal tiene estilos de flex y gap correctos', async () => {
  ClientesFun.buscarSegurosContatados.mockResolvedValue([]);

  const { container } = renderComponent();

  const divContenedor = container.querySelector('div');

  expect(divContenedor).toHaveStyle({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '20px'
  });
});


