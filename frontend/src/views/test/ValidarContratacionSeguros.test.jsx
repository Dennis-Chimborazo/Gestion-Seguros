import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock todos los módulos externos primero
const mockNavigate = jest.fn();
const mockParams = { id: 'test-token-123' };

// Mock de hooks de React Router
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockParams
}));

// Mock de SweetAlert2
jest.mock('sweetalert2', () => ({
  __esModule: true,
  default: {
    fire: jest.fn().mockResolvedValue({ isConfirmed: true })
  }
}));

// Mock de CSS modules
jest.mock('../estilos/validarEmail.module.css', () => ({
  container: 'container',
  card: 'card',
  title: 'title',
  message: 'message',
  button: 'button'
}));

// Mock del componente CargarInf
jest.mock('../cargando/CargarInf', () => {
  return function MockCargarInf() {
    return <div data-testid="cargar-inf">Cargando información...</div>;
  };
});

// Mock de GestionContratacionFun
jest.mock('../gestionContratacion/GestionContratacionFun', () => ({
  __esModule: true,
  default: {
    validarTokenContratacion: jest.fn(),
    activarContratacion: jest.fn(),
  }
}));

// Imports después de los mocks
import ValidarContratacionSeguro from '../validaciones/ValidarContratacionSeguro';
import GestionContratacionFun from '../gestionContratacion/GestionContratacionFun';
import swal from 'sweetalert2';

// Wrapper para las pruebas con router
const renderWithRouter = (component, initialEntries = ['/validar/test-token-123']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe('ValidarContratacionSeguro', () => {
  
  // Datos mock para respuesta exitosa
  const mockValidacionExitosa = {
    idvalid: 'valid-123',
    client: [{
      id_pers: 1,
      nom_cli: 'Juan',
      ape_cli: 'Pérez',
      cedr_cli: '1234567890'
    }],
    contr: [{
      id_tip_seg: 1,
      monto_seguro: '1200.00',
      tiempo_seguro: 'Mensual'
    }],
    data: {
      id_seguro: 100
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console.log para evitar ruido en las pruebas
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Setup mock por defecto - éxito
    GestionContratacionFun.validarTokenContratacion.mockResolvedValue(mockValidacionExitosa);
    GestionContratacionFun.activarContratacion.mockResolvedValue(true);
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('Estado de carga inicial', () => {
    it('debe mostrar el componente de carga inicialmente', async () => {
      // Hacer que la promesa no se resuelva inmediatamente
      GestionContratacionFun.validarTokenContratacion.mockImplementation(
        () => new Promise(() => {}) // Promise que nunca se resuelve
      );
      
      renderWithRouter(<ValidarContratacionSeguro />);

      expect(screen.getByTestId('cargar-inf')).toBeInTheDocument();
      expect(screen.getByText('Cargando información...')).toBeInTheDocument();
    });

    it('debe llamar a validarTokenContratacion con el token correcto', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(GestionContratacionFun.validarTokenContratacion).toHaveBeenCalledWith(
          { url: 'test-token-123' },
          mockNavigate
        );
      });
    });

    it('debe ocultar el loading después de la validación', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.queryByTestId('cargar-inf')).not.toBeInTheDocument();
      });
    });
  });

  describe('Validación exitosa', () => {
    it('debe mostrar información del cliente cuando la validación es exitosa', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.getByText('🎉 ¡Validación de Contratación Exitosa!')).toBeInTheDocument();
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        expect(screen.getByText('1234567890')).toBeInTheDocument();
        expect(screen.getByText('$1200.00')).toBeInTheDocument();
        expect(screen.getByText('Mensual')).toBeInTheDocument();
      });
    });

    it('debe mostrar todos los elementos de la interfaz exitosa', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        // Verificar título
        expect(screen.getByText('🎉 ¡Validación de Contratación Exitosa!')).toBeInTheDocument();
        
        // Verificar mensaje de bienvenida
        expect(screen.getByText(/Estimado\/a/)).toBeInTheDocument();
        expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument();
        
        // Verificar información del seguro
        expect(screen.getByText(/Nos complace informarte/)).toBeInTheDocument();
        expect(screen.getByText(/🪪 Cédula:/)).toBeInTheDocument();
        expect(screen.getByText(/💰 Monto asegurado:/)).toBeInTheDocument();
        expect(screen.getByText(/📆 Frecuencia de pago:/)).toBeInTheDocument();
        
        // Verificar botón
        expect(screen.getByText('Validar contratación')).toBeInTheDocument();
      });
    });

    it('debe tener el botón de validar con la clase CSS correcta', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        const botonValidar = screen.getByText('Validar contratación');
        expect(botonValidar).toHaveClass('button');
        expect(botonValidar).toHaveAttribute('type', 'button');
      });
    });

    it('debe mostrar la información en formato de lista', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        const lista = screen.getByRole('list');
        expect(lista).toBeInTheDocument();
        
        const items = screen.getAllByRole('listitem');
        expect(items).toHaveLength(2); // Monto y frecuencia
      });
    });
  });

  describe('Validación fallida', () => {
    it('debe mostrar mensaje de error cuando el token es inválido', async () => {
      GestionContratacionFun.validarTokenContratacion.mockRejectedValue(
        new Error('Token inválido')
      );
      
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.getByText('⚠️ Enlace inválido o expirado')).toBeInTheDocument();
        expect(screen.getByText('El enlace ya expiró o no es válido.')).toBeInTheDocument();
        expect(screen.getByText('Volver al inicio')).toBeInTheDocument();
      });
    });

    it('debe mostrar información de soporte cuando falla la validación', async () => {
      GestionContratacionFun.validarTokenContratacion.mockRejectedValue(
        new Error('Token expirado')
      );
      
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.getByText(/Si consideras que esto es un error/)).toBeInTheDocument();
        expect(screen.getByText(/equipo de soporte de Seguros.SA/)).toBeInTheDocument();
      });
    });

    it('debe tener botón para volver al inicio cuando falla', async () => {
      GestionContratacionFun.validarTokenContratacion.mockRejectedValue(
        new Error('Error de validación')
      );
      
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        const botonVolver = screen.getByText('Volver al inicio');
        expect(botonVolver).toBeInTheDocument();
        expect(botonVolver).toHaveClass('button');
      });
    });
  });

  describe('Interacciones del usuario', () => {
    it('debe activar la contratación cuando se hace click en validar', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.getByText('Validar contratación')).toBeInTheDocument();
      });

      const botonValidar = screen.getByText('Validar contratación');
      
      await act(async () => {
        fireEvent.click(botonValidar);
      });

      await waitFor(() => {
        expect(GestionContratacionFun.activarContratacion).toHaveBeenCalledWith(
          {
            id: 100, // id_seguro del mock
            idvalid: 'valid-123'
          },
          mockNavigate
        );
      });
    });

    it('debe mostrar SweetAlert de éxito al activar correctamente', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.getByText('Validar contratación')).toBeInTheDocument();
      });

      const botonValidar = screen.getByText('Validar contratación');
      
      await act(async () => {
        fireEvent.click(botonValidar);
      });

      await waitFor(() => {
        expect(swal.fire).toHaveBeenCalledWith({
          title: "<label>Muchas Felicidades</label>",
          text: "se ha completado con exito la validacion de tu cuenta en Seguros.SA \nYa puedes comenzar desde ahora mismo",
          timer: 4500,
        });
      });
    });

    it('debe navegar al inicio después de activar exitosamente', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.getByText('Validar contratación')).toBeInTheDocument();
      });

      const botonValidar = screen.getByText('Validar contratación');
      
      await act(async () => {
        fireEvent.click(botonValidar);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('debe navegar al inicio cuando se hace click en "Volver al inicio"', async () => {
      GestionContratacionFun.validarTokenContratacion.mockRejectedValue(
        new Error('Token inválido')
      );
      
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.getByText('Volver al inicio')).toBeInTheDocument();
      });

      const botonVolver = screen.getByText('Volver al inicio');
      
      await act(async () => {
        fireEvent.click(botonVolver);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Manejo de errores en activación', () => {
    it('debe mostrar alerta de error cuando falla la activación', async () => {
      GestionContratacionFun.activarContratacion.mockRejectedValue(
        new Error('Error de activación')
      );
      
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.getByText('Validar contratación')).toBeInTheDocument();
      });

      const botonValidar = screen.getByText('Validar contratación');
      
      await act(async () => {
        fireEvent.click(botonValidar);
      });

      await waitFor(() => {
        expect(swal.fire).toHaveBeenCalledWith({
          title: "<label>Advertencia</label>",
          text: "A ocurrido un fallo en tu validacion",
          timer: 3500,
        });
      });
    });

    it('debe logear el error cuando falla la activación', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const errorActivacion = new Error('Error de servidor');
      
      GestionContratacionFun.activarContratacion.mockRejectedValue(errorActivacion);
      
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.getByText('Validar contratación')).toBeInTheDocument();
      });

      const botonValidar = screen.getByText('Validar contratación');
      
      await act(async () => {
        fireEvent.click(botonValidar);
      });

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(errorActivacion);
      });
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('Diferentes parámetros de URL', () => {
    it('debe funcionar con diferentes tokens', async () => {
      const useParamsSpy = jest.spyOn(require('react-router-dom'), 'useParams');
      useParamsSpy.mockReturnValue({ id: 'different-token-456' });
      
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(GestionContratacionFun.validarTokenContratacion).toHaveBeenCalledWith(
          { url: 'different-token-456' },
          mockNavigate
        );
      });
      
      useParamsSpy.mockRestore();
    });

    it('debe manejar tokens undefined', async () => {
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

  describe('Estados del componente', () => {
    it('debe actualizar correctamente el estado del cliente', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        // Verificar que los datos del cliente se muestran correctamente
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
        expect(screen.getByText('1234567890')).toBeInTheDocument();
        expect(screen.getByText('$1200.00')).toBeInTheDocument();
        expect(screen.getByText('Mensual')).toBeInTheDocument();
      });
    });

    it('debe manejar datos de cliente incompletos', async () => {
      const mockIncompleto = {
        ...mockValidacionExitosa,
        client: [{
          id_pers: 1,
          nom_cli: '',
          ape_cli: '',
          cedr_cli: ''
        }]
      };
      
      GestionContratacionFun.validarTokenContratacion.mockResolvedValue(mockIncompleto);
      
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        expect(screen.getByText('🎉 ¡Validación de Contratación Exitosa!')).toBeInTheDocument();
        // Los campos vacíos aún deben renderizarse
        expect(screen.getByText('Estimado/a')).toBeInTheDocument();
      });
    });
  });

  describe('Estructura y estilos CSS', () => {
    it('debe aplicar las clases CSS correctas', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        const container = screen.getByText('🎉 ¡Validación de Contratación Exitosa!').closest('div');
        expect(container.parentElement).toHaveClass('card');
        expect(container.parentElement.parentElement).toHaveClass('container');
      });
    });

    it('debe tener la estructura correcta cuando hay error', async () => {
      GestionContratacionFun.validarTokenContratacion.mockRejectedValue(
        new Error('Token inválido')
      );
      
      renderWithRouter(<ValidarContratacionSeguro />);

      await waitFor(() => {
        const titulo = screen.getByText('⚠️ Enlace inválido o expirado');
        expect(titulo).toHaveClass('title');
        
        const mensaje = screen.getByText('El enlace ya expiró o no es válido.');
        expect(mensaje).toHaveClass('message');
        
        const boton = screen.getByText('Volver al inicio');
        expect(boton).toHaveClass('button');
      });
    });
  });

  describe('Integración completa', () => {
    it('debe completar el flujo exitoso completo', async () => {
      renderWithRouter(<ValidarContratacionSeguro />);

      // 1. Estado de carga inicial
      expect(screen.getByTestId('cargar-inf')).toBeInTheDocument();

      // 2. Después de cargar - validación exitosa
      await waitFor(() => {
        expect(screen.queryByTestId('cargar-inf')).not.toBeInTheDocument();
        expect(screen.getByText('🎉 ¡Validación de Contratación Exitosa!')).toBeInTheDocument();
      });

      // 3. Verificar llamada a la API
      expect(GestionContratacionFun.validarTokenContratacion).toHaveBeenCalledWith(
        { url: 'test-token-123' },
        mockNavigate
      );

      // 4. Verificar datos mostrados
      expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      expect(screen.getByText('$1200.00')).toBeInTheDocument();

      // 5. Activar contratación
      const botonValidar = screen.getByText('Validar contratación');
      await act(async () => {
        fireEvent.click(botonValidar);
      });

      // 6. Verificar activación
      await waitFor(() => {
        expect(GestionContratacionFun.activarContratacion).toHaveBeenCalledWith(
          { id: 100, idvalid: 'valid-123' },
          mockNavigate
        );
      });

      // 7. Verificar alerta de éxito y navegación
      expect(swal.fire).toHaveBeenCalledWith(expect.objectContaining({
        title: "<label>Muchas Felicidades</label>"
      }));
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('debe completar el flujo de error completo', async () => {
      GestionContratacionFun.validarTokenContratacion.mockRejectedValue(
        new Error('Token expirado')
      );
      
      renderWithRouter(<ValidarContratacionSeguro />);

      // 1. Estado de carga inicial
      expect(screen.getByTestId('cargar-inf')).toBeInTheDocument();

      // 2. Después de cargar - error
      await waitFor(() => {
        expect(screen.queryByTestId('cargar-inf')).not.toBeInTheDocument();
        expect(screen.getByText('⚠️ Enlace inválido o expirado')).toBeInTheDocument();
      });

      // 3. Verificar mensaje de error
      expect(screen.getByText('El enlace ya expiró o no es válido.')).toBeInTheDocument();

      // 4. Volver al inicio
      const botonVolver = screen.getByText('Volver al inicio');
      await act(async () => {
        fireEvent.click(botonVolver);
      });

      // 5. Verificar navegación
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});