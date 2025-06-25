import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import styles from '../estilos/validarEmail.module.css';

// Mocks generales

const mockNavigate = jest.fn();
const mockParams = { id: 'test-token-123' };

// Mock de React Router hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
}));

// Mock SweetAlert2
jest.mock('sweetalert2', () => ({
  __esModule: true,
  default: {
    fire: jest.fn().mockResolvedValue({ isConfirmed: true }),
  },
}));

// Mock CSS modules
jest.mock('../estilos/validarEmail.module.css', () => ({
  container: 'validar-email-container',
  card: 'validar-email-card',
  title: 'validar-email-title',
  message: 'validar-email-message',
  button: 'validar-email-button',
}));

// Mock componente de carga
jest.mock('../cargando/CargarInf', () => () => (
  <div data-testid="cargar-inf">Cargando información...</div>
));

// Mock funciones de negocio
jest.mock('../gestionContratacion/GestionContratacionFun', () => ({
  __esModule: true,
  default: {
    validarTokenContratacion: jest.fn(),
    activarContratacion: jest.fn(),
  },
}));

import ValidarContratacionSeguro from '../validaciones/ValidarContratacionSeguro';
import GestionContratacionFun from '../gestionContratacion/GestionContratacionFun';
import swal from 'sweetalert2';

// Helper para renderizar con router
const renderWithRouter = (ui, initialEntries = ['/validar/test-token-123']) =>
  render(<MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>);

describe('ValidarContratacionSeguro', () => {
  const mockValidacionExitosa = {
    idvalid: 'valid-123',
    client: [{
      id_pers: 1,
      nom_cli: 'Juan',
      ape_cli: 'Pérez',
      cedr_cli: '1234567890',
    }],
    contr: [{
      id_tip_seg: 1,
      monto_seguro: '1200.00',
      tiempo_seguro: 'Mensual',
    }],
    data: {
      id_seguro: 100,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    GestionContratacionFun.validarTokenContratacion.mockResolvedValue(mockValidacionExitosa);
    GestionContratacionFun.activarContratacion.mockResolvedValue(true);
  });

  describe('Estado inicial y carga', () => {
    it('muestra el componente de carga inicialmente', async () => {
      // Simular promesa pendiente para mantener el loading
      GestionContratacionFun.validarTokenContratacion.mockImplementation(() => new Promise(() => {}));

      renderWithRouter(<ValidarContratacionSeguro />);

      expect(screen.getByTestId('cargar-inf')).toBeInTheDocument();
      expect(screen.getByText('Cargando información...')).toBeInTheDocument();
    });

    it('llama a validarTokenContratacion con token correcto', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(GestionContratacionFun.validarTokenContratacion).toHaveBeenCalledWith(
          { url: 'test-token-123' },
          mockNavigate
        );
      });
    });

    it('oculta el loading tras la validación', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.queryByTestId('cargar-inf')).not.toBeInTheDocument();
      });
    });
  });

  describe('Validación exitosa', () => {
    it('muestra la información del cliente correctamente', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.getByText('🎉 ¡Validación de Contratación Exitosa!')).toBeInTheDocument();
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        expect(screen.getByText('1234567890')).toBeInTheDocument();
        expect(screen.getByText('$1200.00')).toBeInTheDocument();
        expect(screen.getByText('Mensual')).toBeInTheDocument();
      });
    });

    it('muestra todos los elementos de la UI exitosa', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.getByText('🎉 ¡Validación de Contratación Exitosa!')).toBeInTheDocument();
        expect(screen.getByText(/Estimado\/a/)).toBeInTheDocument();
        expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument();
        expect(screen.getByText(/Nos complace informarte/)).toBeInTheDocument();
        expect(screen.getByText(/🪪 Cédula:/)).toBeInTheDocument();
        expect(screen.getByText(/💰 Monto asegurado:/)).toBeInTheDocument();
        expect(screen.getByText(/📆 Frecuencia de pago:/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /validar contratación/i })).toBeInTheDocument();
      });
    });

    it('botón validar tiene clase y tipo correctos', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        const btn = screen.getByRole('button', { name: /validar contratación/i });
        expect(btn).toHaveClass(styles.button);
        expect(btn).toHaveAttribute('type', 'button');
      });
    });

    it('muestra la información en lista con dos elementos', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        const list = screen.getByRole('list');
        expect(list).toBeInTheDocument();

        const items = screen.getAllByRole('listitem');
        expect(items).toHaveLength(2);
      });
    });
  });

  describe('Validación fallida', () => {
    beforeEach(() => {
      GestionContratacionFun.validarTokenContratacion.mockRejectedValue(new Error('Token inválido'));
    });

    it('muestra mensaje de error para token inválido', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.getByText('⚠️ Enlace inválido o expirado')).toBeInTheDocument();
        expect(screen.getByText('El enlace ya expiró o no es válido.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /volver al inicio/i })).toBeInTheDocument();
      });
    });

    it('muestra información de soporte en caso de error', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.getByText(/Si consideras que esto es un error/)).toBeInTheDocument();
        expect(screen.getByText(/equipo de soporte de Seguros.SA/)).toBeInTheDocument();
      });
    });

    it('botón "Volver al inicio" tiene clase correcta', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        const btn = screen.getByRole('button', { name: /volver al inicio/i });
        expect(btn).toHaveClass(styles.button);
      });
    });
  });

  describe('Interacciones usuario', () => {
    it('activa la contratación al hacer click en validar', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /validar contratación/i })).toBeInTheDocument();
      });

      const btn = screen.getByRole('button', { name: /validar contratación/i });

      await act(async () => {
        fireEvent.click(btn);
      });

      await waitFor(() => {
        expect(GestionContratacionFun.activarContratacion).toHaveBeenCalledWith(
          { id: 100, idvalid: 'valid-123' },
          mockNavigate
        );
      });
    });

    it('muestra alerta de éxito con swal al activar correctamente', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      const btn = await screen.findByRole('button', { name: /validar contratación/i });

      await act(async () => {
        fireEvent.click(btn);
      });

      await waitFor(() => {
        expect(swal.fire).toHaveBeenCalledWith({
          title: "<label>Muchas Felicidades</label>",
          text: expect.stringContaining('se ha completado con exito'),
          timer: 4500,
        });
      });
    });

    it('navega a "/" después de activar exitosamente', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      const btn = await screen.findByRole('button', { name: /validar contratación/i });

      await act(async () => {
        fireEvent.click(btn);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('navega a "/" al hacer click en "Volver al inicio" en error', async () => {
      GestionContratacionFun.validarTokenContratacion.mockRejectedValue(new Error('Token inválido'));

      renderWithRouter(<ValidarContratacionSeguro />);

      const btn = await screen.findByRole('button', { name: /volver al inicio/i });

      await act(async () => {
        fireEvent.click(btn);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Manejo de errores en activación', () => {
    it('muestra alerta de error si falla la activación', async () => {
      GestionContratacionFun.activarContratacion.mockRejectedValue(new Error('Error de activación'));

      renderWithRouter(<ValidarContratacionSeguro />);

      const btn = await screen.findByRole('button', { name: /validar contratación/i });

      await act(async () => {
        fireEvent.click(btn);
      });

      await waitFor(() => {
        expect(swal.fire).toHaveBeenCalledWith({
          title: "<label>Advertencia</label>",
          text: "A ocurrido un fallo en tu validacion",
          timer: 3500,
        });
      });
    });

    it('loggea el error en consola si falla la activación', async () => {
      const error = new Error('Error de servidor');
      GestionContratacionFun.activarContratacion.mockRejectedValue(error);
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      renderWithRouter(<ValidarContratacionSeguro />);

      const btn = await screen.findByRole('button', { name: /validar contratación/i });

      await act(async () => {
        fireEvent.click(btn);
      });

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(error);
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Diferentes parámetros de URL', () => {
    it('funciona con distintos tokens', async () => {
      const useParamsSpy = jest.spyOn(require('react-router-dom'), 'useParams');
      useParamsSpy.mockReturnValue({ id: 'otro-token-456' });

      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(GestionContratacionFun.validarTokenContratacion).toHaveBeenCalledWith(
          { url: 'otro-token-456' },
          mockNavigate
        );
      });

      useParamsSpy.mockRestore();
    });

    it('maneja token undefined sin romperse', async () => {
      const useParamsSpy = jest.spyOn(require('react-router-dom'), 'useParams');
      useParamsSpy.mockReturnValue({ id: undefined });

      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(GestionContratacionFun.validarTokenContratacion).toHaveBeenCalledWith(
          { url: undefined },
          mockNavigate
        );
      });

      useParamsSpy.mockRestore();
    });
  });

  describe('Estado interno y manejo datos', () => {
    it('actualiza el estado del cliente correctamente', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        expect(screen.getByText('1234567890')).toBeInTheDocument();
        expect(screen.getByText('$1200.00')).toBeInTheDocument();
        expect(screen.getByText('Mensual')).toBeInTheDocument();
      });
    });

    it('muestra UI incluso con datos de cliente incompletos', async () => {
      const mockIncompleto = {
        ...mockValidacionExitosa,
        client: [{
          id_pers: 1,
          nom_cli: '',
          ape_cli: '',
          cedr_cli: '',
        }],
      };
      GestionContratacionFun.validarTokenContratacion.mockResolvedValue(mockIncompleto);

      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.getByText('🎉 ¡Validación de Contratación Exitosa!')).toBeInTheDocument();
        // Verificar que aparece texto genérico aunque nombres estén vacíos
        expect(screen.getByText(/Estimado\/a/i)).toBeInTheDocument();
      });
    });
  });

  describe('Estructura y estilos CSS', () => {
    it('aplica las clases CSS correctas en elementos principales', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        const container = screen.getByTestId('container');
        const card = screen.getByTestId('card');

        expect(container).toHaveClass(styles.container);
        expect(card).toHaveClass(styles.card);
      });
    });

    it('estructura correcta en estado de error', async () => {
      GestionContratacionFun.validarTokenContratacion.mockRejectedValue(new Error('Token inválido'));

      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        const titulo = screen.getByText('⚠️ Enlace inválido o expirado');
        const mensaje = screen.getByText('El enlace ya expiró o no es válido.');
        const boton = screen.getByRole('button', { name: /volver al inicio/i });

        expect(titulo).toHaveClass(styles.title);
        expect(mensaje).toHaveClass(styles.message);
        expect(boton).toHaveClass(styles.button);
      });
    });
  });

  describe('Flujos completos de integración', () => {
    it('completa exitosamente todo el flujo', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      // Loading inicial
      expect(screen.getByTestId('cargar-inf')).toBeInTheDocument();

      // Después de cargar - validación exitosa
      await waitFor(() => {
        expect(screen.queryByTestId('cargar-inf')).not.toBeInTheDocument();
        expect(screen.getByText('🎉 ¡Validación de Contratación Exitosa!')).toBeInTheDocument();
      });

      expect(GestionContratacionFun.validarTokenContratacion).toHaveBeenCalledWith(
        { url: 'test-token-123' },
        mockNavigate
      );

      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('$1200.00')).toBeInTheDocument();

      // Activar contratación
      const btn = screen.getByRole('button', { name: /validar contratación/i });
      await act(async () => {
        fireEvent.click(btn);
      });

      await waitFor(() => {
        expect(GestionContratacionFun.activarContratacion).toHaveBeenCalledWith(
          { id: 100, idvalid: 'valid-123' },
          mockNavigate
        );
      });

      expect(swal.fire).toHaveBeenCalledWith(expect.objectContaining({
        title: "<label>Muchas Felicidades</label>",
      }));

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('completa correctamente el flujo de error', async () => {
      GestionContratacionFun.validarTokenContratacion.mockRejectedValue(new Error('Token expirado'));

      renderWithRouter(<ValidarContratacionSeguro />);

      // Loading inicial
      expect(screen.getByTestId('cargar-inf')).toBeInTheDocument();

      // Después error
      await waitFor(() => {
        expect(screen.queryByTestId('cargar-inf')).not.toBeInTheDocument();
        expect(screen.getByText('⚠️ Enlace inválido o expirado')).toBeInTheDocument();
      });

      expect(screen.getByText('El enlace ya expiró o no es válido.')).toBeInTheDocument();

      const btnVolver = screen.getByRole('button', { name: /volver al inicio/i });
      await act(async () => {
        fireEvent.click(btnVolver);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
