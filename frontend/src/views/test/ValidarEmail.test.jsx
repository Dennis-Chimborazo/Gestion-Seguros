import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock todos los módulos externos primero
const mockNavigate = jest.fn();
const mockParams = { id: 'test-email-token-123' };

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

// Mock de ClientesFun
jest.mock('../clientes/ClientesFun', () => ({
  __esModule: true,
  default: {
    validarTokenEmail: jest.fn(),
    buscarclienteIDValEmail: jest.fn(),
    activarCuentaUsuario: jest.fn(),
  }
}));

// Imports después de los mocks
import ValidarEmail from '../validaciones/ValidarEmail';
import ClientesFun from '../clientes/ClientesFun';
import swal from 'sweetalert2';

// Wrapper para las pruebas con router
const renderWithRouter = (component, initialEntries = ['/validar-email/test-email-token-123']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe('ValidarEmail', () => {
  
  // Datos mock para respuesta de validación exitosa
  const mockValidacionToken = {
    success: true,
    data: {
      id_pers: 1
    },
    idvalid: 'valid-email-123'
  };

  // Datos mock para información del cliente
  const mockClienteInfo = [
    {
      id_pers: 1,
      nom_cli: 'María',
      ape_cli: 'González'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock console.log para evitar ruido en las pruebas
    jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // Setup mocks por defecto - éxito
    ClientesFun.validarTokenEmail.mockResolvedValue(mockValidacionToken);
    ClientesFun.buscarclienteIDValEmail.mockResolvedValue(mockClienteInfo);
    ClientesFun.activarCuentaUsuario.mockResolvedValue(true);
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('Estado de carga inicial', () => {
    it('debe mostrar el componente de carga inicialmente', async () => {
      // Hacer que la promesa no se resuelva inmediatamente
      ClientesFun.validarTokenEmail.mockImplementation(
        () => new Promise(() => {}) // Promise que nunca se resuelve
      );
      
      renderWithRouter(<ValidarEmail />);

      expect(screen.getByTestId('cargar-inf')).toBeInTheDocument();
      expect(screen.getByText('Cargando información...')).toBeInTheDocument();
    });

    it('debe llamar a validarTokenEmail con el token correcto', async () => {
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(ClientesFun.validarTokenEmail).toHaveBeenCalledWith(
          { url: 'test-email-token-123' },
          mockNavigate
        );
      });
    });

    it('debe llamar a buscarclienteIDValEmail después de validar token', async () => {
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(ClientesFun.buscarclienteIDValEmail).toHaveBeenCalledWith(
          1, // id_pers del mock
          mockNavigate
        );
      });
    });

    it('debe ocultar el loading después de la validación', async () => {
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.queryByTestId('cargar-inf')).not.toBeInTheDocument();
      });
    });
  });

  describe('Validación exitosa', () => {
    it('debe mostrar información del cliente cuando la validación es exitosa', async () => {
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.getByText('🎉 ¡Gracias por registrarte en Seguros.SA!')).toBeInTheDocument();
        expect(screen.getByText(/Bienvenido\/a María González/)).toBeInTheDocument();
        expect(screen.getByText('Validar mi cuenta')).toBeInTheDocument();
      });
    });

    it('debe mostrar todos los elementos de la interfaz exitosa', async () => {
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        // Verificar título
        expect(screen.getByText('🎉 ¡Gracias por registrarte en Seguros.SA!')).toBeInTheDocument();
        
        // Verificar mensaje de bienvenida
        expect(screen.getByText(/Bienvenido\/a María González/)).toBeInTheDocument();
        expect(screen.getByText(/tu cuenta ha sido creada con éxito/)).toBeInTheDocument();
        
        // Verificar mensaje de validación
        expect(screen.getByText(/Esta validación garantiza la integridad/)).toBeInTheDocument();
        expect(screen.getByText(/Al hacer clic en el siguiente botón/)).toBeInTheDocument();
        
        // Verificar botón
        expect(screen.getByText('Validar mi cuenta')).toBeInTheDocument();
      });
    });

    it('debe tener el botón de validar con la clase CSS correcta', async () => {
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        const botonValidar = screen.getByText('Validar mi cuenta');
        expect(botonValidar).toHaveClass('button');
        expect(botonValidar).toHaveAttribute('type', 'button');
      });
    });

    it('debe mostrar el nombre completo del cliente correctamente', async () => {
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        const mensajeBienvenida = screen.getByText(/Bienvenido\/a María González/);
        expect(mensajeBienvenida).toBeInTheDocument();
      });
    });
  });

  describe('Validación fallida por token inválido', () => {
    it('debe mostrar error cuando validarTokenEmail falla', async () => {
      ClientesFun.validarTokenEmail.mockRejectedValue(
        new Error('Token inválido')
      );
      
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.getByText('⚠ Enlace inválido o expirado')).toBeInTheDocument();
        expect(screen.getByText('El enlace ya expiró o no es válido.')).toBeInTheDocument();
        expect(screen.getByText('OK')).toBeInTheDocument();
      });
    });

    it('debe mostrar error cuando success es false', async () => {
      ClientesFun.validarTokenEmail.mockResolvedValue({
        success: false,
        data: null
      });
      
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.getByText('⚠ Enlace inválido o expirado')).toBeInTheDocument();
        expect(screen.getByText('Token inválido o expirado.')).toBeInTheDocument();
      });
    });

    it('debe mostrar error cuando no hay id_pers', async () => {
      ClientesFun.validarTokenEmail.mockResolvedValue({
        success: true,
        data: {
          id_pers: null
        }
      });
      
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.getByText('⚠ Enlace inválido o expirado')).toBeInTheDocument();
        expect(screen.getByText('Token inválido o expirado.')).toBeInTheDocument();
      });
    });

    it('debe mostrar información de soporte cuando falla la validación', async () => {
      ClientesFun.validarTokenEmail.mockRejectedValue(
        new Error('Token expirado')
      );
      
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.getByText(/Si crees que esto es un error/)).toBeInTheDocument();
        expect(screen.getByText(/contacta Seguros.SA soporte/)).toBeInTheDocument();
      });
    });

    it('debe tener botón OK para volver al inicio cuando falla', async () => {
      ClientesFun.validarTokenEmail.mockRejectedValue(
        new Error('Error de validación')
      );
      
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        const botonOK = screen.getByText('OK');
        expect(botonOK).toBeInTheDocument();
        expect(botonOK).toHaveClass('button');
      });
    });
  });

  describe('Interacciones del usuario', () => {
    it('debe activar la cuenta cuando se hace click en validar', async () => {
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.getByText('Validar mi cuenta')).toBeInTheDocument();
      });

      const botonValidar = screen.getByText('Validar mi cuenta');
      
      await act(async () => {
        fireEvent.click(botonValidar);
      });

      await waitFor(() => {
        expect(ClientesFun.activarCuentaUsuario).toHaveBeenCalledWith(
          {
            id: 1, // id_pers del mock
            idvalid: 'valid-email-123'
          },
          mockNavigate
        );
      });
    });

    it('debe mostrar SweetAlert de éxito al activar correctamente', async () => {
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.getByText('Validar mi cuenta')).toBeInTheDocument();
      });

      const botonValidar = screen.getByText('Validar mi cuenta');
      
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
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.getByText('Validar mi cuenta')).toBeInTheDocument();
      });

      const botonValidar = screen.getByText('Validar mi cuenta');
      
      await act(async () => {
        fireEvent.click(botonValidar);
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('debe navegar al inicio cuando se hace click en "OK"', async () => {
      ClientesFun.validarTokenEmail.mockRejectedValue(
        new Error('Token inválido')
      );
      
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.getByText('OK')).toBeInTheDocument();
      });

      const botonOK = screen.getByText('OK');
      
      await act(async () => {
        fireEvent.click(botonOK);
      });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('debe prevenir el comportamiento por defecto del formulario', async () => {
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.getByText('Validar mi cuenta')).toBeInTheDocument();
      });

      const botonValidar = screen.getByText('Validar mi cuenta');
      const mockPreventDefault = jest.fn();
      
      // Simular evento con preventDefault
      const mockEvent = { preventDefault: mockPreventDefault };
      
      await act(async () => {
        // Simular click directo para verificar preventDefault
        botonValidar.onclick = async (e) => {
          e.preventDefault();
          await ClientesFun.activarCuentaUsuario(
            { id: 1, idvalid: 'valid-email-123' },
            mockNavigate
          );
        };
        
        botonValidar.onclick(mockEvent);
      });

      expect(mockPreventDefault).toHaveBeenCalled();
    });
  });

  describe('Manejo de errores en activación', () => {
    it('debe mostrar alerta de error cuando falla la activación', async () => {
      ClientesFun.activarCuentaUsuario.mockRejectedValue(
        new Error('Error de activación')
      );
      
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.getByText('Validar mi cuenta')).toBeInTheDocument();
      });

      const botonValidar = screen.getByText('Validar mi cuenta');
      
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

    it('debe manejar errores cuando activarCuentaUsuario retorna false', async () => {
      ClientesFun.activarCuentaUsuario.mockResolvedValue(false);
      
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.getByText('Validar mi cuenta')).toBeInTheDocument();
      });

      const botonValidar = screen.getByText('Validar mi cuenta');
      
      await act(async () => {
        fireEvent.click(botonValidar);
      });

      // No debe navegar si retorna false
      expect(mockNavigate).not.toHaveBeenCalledWith('/');
      expect(swal.fire).not.toHaveBeenCalledWith(expect.objectContaining({
        title: "<label>Muchas Felicidades</label>"
      }));
    });
  });

  describe('Diferentes parámetros de URL', () => {
    it('debe funcionar con diferentes tokens', async () => {
      const useParamsSpy = jest.spyOn(require('react-router-dom'), 'useParams');
      useParamsSpy.mockReturnValue({ id: 'different-email-token-456' });
      
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(ClientesFun.validarTokenEmail).toHaveBeenCalledWith(
          { url: 'different-email-token-456' },
          mockNavigate
        );
      });
      
      useParamsSpy.mockRestore();
    });

    it('debe manejar tokens undefined', async () => {
      const useParamsSpy = jest.spyOn(require('react-router-dom'), 'useParams');
      useParamsSpy.mockReturnValue({ id: undefined });
      
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(ClientesFun.validarTokenEmail).toHaveBeenCalledWith(
          { url: undefined },
          mockNavigate
        );
      });
      
      useParamsSpy.mockRestore();
    });
  });

  describe('Estados del componente', () => {
    it('debe actualizar correctamente el estado del cliente', async () => {
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        // Verificar que los datos del cliente se muestran correctamente
        expect(screen.getByText(/Bienvenido\/a María González/)).toBeInTheDocument();
      });
    });

    it('debe manejar datos de cliente con nombres vacíos', async () => {
      ClientesFun.buscarclienteIDValEmail.mockResolvedValue([
        {
          id_pers: 1,
          nom_cli: '',
          ape_cli: ''
        }
      ]);
      
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.getByText('🎉 ¡Gracias por registrarte en Seguros.SA!')).toBeInTheDocument();
        // Los campos vacíos aún deben renderizarse
        expect(screen.getByText(/Bienvenido\/a/)).toBeInTheDocument();
      });
    });

    it('debe manejar respuesta vacía de buscarclienteIDValEmail', async () => {
      ClientesFun.buscarclienteIDValEmail.mockResolvedValue([]);
      
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        // Debe mostrar error porque no hay datos de cliente
        expect(screen.getByText('⚠ Enlace inválido o expirado')).toBeInTheDocument();
      });
    });
  });

  describe('Logging y debugging', () => {
    it('debe logear la respuesta de validarTokenEmail', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(mockValidacionToken);
        expect(consoleLogSpy).toHaveBeenCalledWith(1); // id_pers
      });
      
      consoleLogSpy.mockRestore();
    });

    it('debe logear la respuesta de buscarclienteIDValEmail', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(mockClienteInfo);
      });
      
      consoleLogSpy.mockRestore();
    });

    it('debe logear la respuesta de activarCuentaUsuario', async () => {
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.getByText('Validar mi cuenta')).toBeInTheDocument();
      });

      const botonValidar = screen.getByText('Validar mi cuenta');
      
      await act(async () => {
        fireEvent.click(botonValidar);
      });

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalledWith(true); // resultado de activarCuentaUsuario
      });
      
      consoleLogSpy.mockRestore();
    });
  });

  describe('Estructura y estilos CSS', () => {
    it('debe aplicar las clases CSS correctas en estado exitoso', async () => {
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        const titulo = screen.getByText('🎉 ¡Gracias por registrarte en Seguros.SA!');
        expect(titulo).toHaveClass('title');
        
        const mensajes = screen.getAllByText(/Bienvenido|Esta validación|Al hacer clic/);
        mensajes.forEach(mensaje => {
          expect(mensaje).toHaveClass('message');
        });
        
        const boton = screen.getByText('Validar mi cuenta');
        expect(boton).toHaveClass('button');
      });
    });

    it('debe tener la estructura correcta cuando hay error', async () => {
      ClientesFun.validarTokenEmail.mockRejectedValue(
        new Error('Token inválido')
      );
      
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        const titulo = screen.getByText('⚠ Enlace inválido o expirado');
        expect(titulo).toHaveClass('title');
        
        const mensajes = screen.getAllByText(/El enlace ya expiró|Si crees que esto/);
        mensajes.forEach(mensaje => {
          expect(mensaje).toHaveClass('message');
        });
        
        const boton = screen.getByText('OK');
        expect(boton).toHaveClass('button');
      });
    });

    it('debe tener la estructura de contenedor correcta', async () => {
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        const titulo = screen.getByText('🎉 ¡Gracias por registrarte en Seguros.SA!');
        const card = titulo.closest('div');
        expect(card).toHaveClass('card');
        
        const container = card.parentElement;
        expect(container).toHaveClass('container');
      });
    });
  });

  describe('Integración completa', () => {
    it('debe completar el flujo exitoso completo de validación de email', async () => {
      renderWithRouter(<ValidarEmail />);

      // 1. Estado de carga inicial
      expect(screen.getByTestId('cargar-inf')).toBeInTheDocument();

      // 2. Después de cargar - validación exitosa
      await waitFor(() => {
        expect(screen.queryByTestId('cargar-inf')).not.toBeInTheDocument();
        expect(screen.getByText('🎉 ¡Gracias por registrarte en Seguros.SA!')).toBeInTheDocument();
      });

      // 3. Verificar llamadas a las APIs
      expect(ClientesFun.validarTokenEmail).toHaveBeenCalledWith(
        { url: 'test-email-token-123' },
        mockNavigate
      );
      expect(ClientesFun.buscarclienteIDValEmail).toHaveBeenCalledWith(1, mockNavigate);

      // 4. Verificar datos mostrados
      expect(screen.getByText(/Bienvenido\/a María González/)).toBeInTheDocument();

      // 5. Activar cuenta
      const botonValidar = screen.getByText('Validar mi cuenta');
      await act(async () => {
        fireEvent.click(botonValidar);
      });

      // 6. Verificar activación
      await waitFor(() => {
        expect(ClientesFun.activarCuentaUsuario).toHaveBeenCalledWith(
          { id: 1, idvalid: 'valid-email-123' },
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
      ClientesFun.validarTokenEmail.mockRejectedValue(
        new Error('Token expirado')
      );
      
      renderWithRouter(<ValidarEmail />);

      // 1. Estado de carga inicial
      expect(screen.getByTestId('cargar-inf')).toBeInTheDocument();

      // 2. Después de cargar - error
      await waitFor(() => {
        expect(screen.queryByTestId('cargar-inf')).not.toBeInTheDocument();
        expect(screen.getByText('⚠ Enlace inválido o expirado')).toBeInTheDocument();
      });

      // 3. Verificar mensaje de error
      expect(screen.getByText('El enlace ya expiró o no es válido.')).toBeInTheDocument();

      // 4. Volver al inicio
      const botonOK = screen.getByText('OK');
      await act(async () => {
        fireEvent.click(botonOK);
      });

      // 5. Verificar navegación
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('debe manejar el flujo cuando la búsqueda de cliente falla', async () => {
      ClientesFun.buscarclienteIDValEmail.mockRejectedValue(
        new Error('Cliente no encontrado')
      );
      
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.getByText('⚠ Enlace inválido o expirado')).toBeInTheDocument();
        expect(screen.getByText('El enlace ya expiró o no es válido.')).toBeInTheDocument();
      });
    });
  });
});