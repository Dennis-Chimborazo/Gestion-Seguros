import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import ClientesArchivos from '../clientes/ClientesArchivos';
import ClientesFun from '../clientes/ClientesFun';
import { MemoryRouter } from 'react-router-dom';

// Mocks
jest.mock('../clientes/ClientesFun');
jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
}));
beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => 'mocked-url');
});

afterAll(() => {
  global.URL.createObjectURL.mockReset();
  delete global.URL.createObjectURL;
});

describe('ClientesArchivos', () => {
  beforeEach(() => {
    localStorage.setItem('login', JSON.stringify({ user: 'testuser' }));
    ClientesFun.buscarcliente.mockResolvedValue([{ id_pers: '1', cedr_cli: '9999999999' }]);
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <ClientesArchivos />
      </MemoryRouter>
    );

  it('debe renderizar el mensaje de bienvenida y botones', async () => {
    renderComponent();
    expect(await screen.findByText(/sube los siguientes documentos/i)).toBeInTheDocument();
    expect(screen.getByText('Guardar')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('debe mostrar error si se selecciona una imagen inválida', async () => {
    renderComponent();
    const inputFoto = screen.getByTestId('input-fotoPerfilInput');
    const file = new File(['(⌐□_□)'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(inputFoto, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/imagen válida/i)).toBeInTheDocument();
    });
  });
  it('debe limpiar el error de imagen al cargar una imagen válida después de un error', async () => {
  renderComponent();
  const inputFoto = screen.getByTestId('input-fotoPerfilInput');

  // Cargar archivo inválido primero
  const invalidFile = new File(['dummy'], 'archivo.txt', { type: 'text/plain' });
  fireEvent.change(inputFoto, { target: { files: [invalidFile] } });

  await waitFor(() => {
    expect(screen.getByText(/imagen válida/i)).toBeInTheDocument();
  });

  // Cargar archivo válido
  const validFile = new File(['dummy'], 'foto.jpg', { type: 'image/jpeg' });
  fireEvent.change(inputFoto, { target: { files: [validFile] } });

  await waitFor(() => {
    expect(screen.queryByText(/imagen válida/i)).not.toBeInTheDocument();
  });
});


   it('debe mostrar vista previa al cargar una imagen válida', async () => {
    renderComponent();
    const inputFoto = screen.getByTestId('input-fotoPerfilInput');
    const file = new File(['dummy'], 'foto.jpg', { type: 'image/jpeg' });

    fireEvent.change(inputFoto, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/Vista previa de la imagen/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar error si se selecciona un pdf inválido', async () => {
    renderComponent();
    const inputPdf = screen.getByTestId('input-cedulaPdfInput');
    const file = new File(['dummy'], 'archivo.txt', { type: 'text/plain' });

    fireEvent.change(inputPdf, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/archivo pdf válido/i)).toBeInTheDocument();
    });
  });

  it('debe mostrar nombre de archivo al cargar pdf válido', async () => {
    renderComponent();
    const inputPdf = screen.getByTestId('input-cedulaPdfInput');
    const file = new File(['dummy'], 'cedula.pdf', { type: 'application/pdf' });

    fireEvent.change(inputPdf, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/cedula\.pdf/i)).toBeInTheDocument();
    });
  });
  it('debe limpiar el error de pdf al cargar un pdf válido después de un error', async () => {
  renderComponent();
  const inputPdf = screen.getByTestId('input-cedulaPdfInput');

  // Cargar archivo inválido primero
  const invalidFile = new File(['dummy'], 'archivo.txt', { type: 'text/plain' });
  fireEvent.change(inputPdf, { target: { files: [invalidFile] } });

  await waitFor(() => {
    expect(screen.getByText(/archivo pdf válido/i)).toBeInTheDocument();
  });

  // Cargar archivo válido
  const validFile = new File(['dummy'], 'cedula.pdf', { type: 'application/pdf' });
  fireEvent.change(inputPdf, { target: { files: [validFile] } });

  await waitFor(() => {
    expect(screen.queryByText(/archivo pdf válido/i)).not.toBeInTheDocument();
  });
});
it('debe mostrar la vista previa del PDF cuando se carga un pdf válido', async () => {
  renderComponent();
  const inputPdf = screen.getByTestId('input-cedulaPdfInput');
  const pdfFile = new File(['dummy'], 'cedula.pdf', { type: 'application/pdf' });

  fireEvent.change(inputPdf, { target: { files: [pdfFile] } });

  await waitFor(() => {
    const embed = screen.getByTestId('pdf-preview');
    expect(embed).toBeInTheDocument();
  });
});
it('debe manejar el clic en Cancelar', () => {
  renderComponent();

  const inputFoto = screen.getByTestId('input-fotoPerfilInput');
  const inputPdf = screen.getByTestId('input-cedulaPdfInput');

  // Simula subir archivos válidos
  fireEvent.change(inputFoto, {
    target: { files: [new File(['dummy'], 'foto.jpg', { type: 'image/jpeg' })] }
  });
  fireEvent.change(inputPdf, {
    target: { files: [new File(['dummy'], 'cedula.pdf', { type: 'application/pdf' })] }
  });

  // El botón cancelar debe limpiar los archivos
  const cancelarBtn = screen.getByText('Cancelar');
  fireEvent.click(cancelarBtn);

  // Ahora verifica que ambos muestren "Sin archivo seleccionado"
  const fotoSection = screen.getByText(/Foto de perfil/i).closest('div');
  const pdfSection = screen.getByText(/Cédula escaneada/i).closest('div');

  expect(within(fotoSection).getByText('Sin archivo seleccionado')).toBeInTheDocument();
  expect(within(pdfSection).getByText('Sin archivo seleccionado')).toBeInTheDocument();
});



  it('debe mostrar error si no se seleccionan archivos y se presiona guardar', async () => {
    renderComponent();
    const guardar = screen.getByText('Guardar');
    fireEvent.click(guardar);

    await waitFor(() => {
      expect(screen.getByText(/Por favor, selecciona ambos archivos/i)).toBeInTheDocument();
    });
  });

  it('debe llamar a funciones cuando se cargan archivos válidos y se presiona guardar', async () => {
    ClientesFun.guardarArhivoImagen.mockResolvedValue();
    ClientesFun.guardarArhivoCedula.mockResolvedValue();
    ClientesFun.actualizarEstadoActivo.mockResolvedValue();

    renderComponent();

    const inputFoto = screen.getByTestId('input-fotoPerfilInput');
    const inputPdf = screen.getByTestId('input-cedulaPdfInput');

    const imageFile = new File(['dummy'], 'foto.jpg', { type: 'image/jpeg' });
    fireEvent.change(inputFoto, { target: { files: [imageFile] } });

    const pdfFile = new File(['dummy'], 'cedula.pdf', { type: 'application/pdf' });
    fireEvent.change(inputPdf, { target: { files: [pdfFile] } });

    const guardar = screen.getByText('Guardar');
    fireEvent.click(guardar);

    await waitFor(() => {
      expect(ClientesFun.guardarArhivoImagen).toHaveBeenCalled();
      expect(ClientesFun.guardarArhivoCedula).toHaveBeenCalled();
      expect(ClientesFun.actualizarEstadoActivo).toHaveBeenCalled();
    });
  });
});
