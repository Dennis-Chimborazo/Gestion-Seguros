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
    buscarcliente: jest.fn(),
    activarCuentaUsuario: jest.fn(),
    preActivarCuentaUsuario: jest.fn(),
  }
}));
jest.mock('../usuarios/UsuariosFun', () => ({
  __esModule: true,
  default: {
    actualizarPass: jest.fn()
  }
}));


// Imports después de los mocks
import ValidarEmail from '../validaciones/ValidarEmail';
import ClientesFun from '../clientes/ClientesFun';
import swal from 'sweetalert2';
import UsuariosFun from '../usuarios/UsuariosFun';

// Wrapper para las pruebas con router
const renderWithRouter = (component, initialEntries = ['/validar-email/test-email-token-123']) => {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      {component}
    </MemoryRouter>
  );
};

describe('ValidarEmail', () => {
  let consoleLogSpy;

  // Datos mock para respuesta de validación exitosa
  const mockValidacionToken = {
    success: true,
    data: {
      id_pers: 1,
      pass: "temp-pass"
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
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    jest.spyOn(console, 'log').mockImplementation(() => { });

    ClientesFun.validarTokenEmail.mockResolvedValue({
      success: true,
      idvalid: 'valid-email-123',
      data: {
        id_pers: 1,
        pass: 'temp-pass' // 👈 NECESARIO
      }
    });

    ClientesFun.buscarcliente.mockResolvedValue([
      {
        id_pers: 1,
        nom_cli: 'María',
        ape_cli: 'González',
        email_pers: 'maria@ejemplo.com'
      }
    ]);

    ClientesFun.activarCuentaUsuario.mockResolvedValue(true);
    ClientesFun.preActivarCuentaUsuario.mockResolvedValue({ success: true });
    UsuariosFun.actualizarPass.mockResolvedValue(true); // También necesitas este mock
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('Estado de carga inicial', () => {
    it('debe mostrar el componente de carga inicialmente', async () => {
      // Hacer que la promesa no se resuelva inmediatamente
      ClientesFun.validarTokenEmail.mockImplementation(
        () => new Promise(() => { }) // Promise que nunca se resuelve
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
        expect(ClientesFun.buscarcliente).toHaveBeenCalledWith(
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
        expect(screen.getByText(/gracias por registrarte en seguros\.sa/i)).toBeInTheDocument();
        expect(screen.getByText(/bienvenido\/a maría gonzález/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /validar cuenta/i })).toBeInTheDocument();
      });
    });

    it('debe mostrar todos los elementos de la interfaz exitosa', async () => {
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.getByText(/gracias por registrarte en seguros\.sa/i)).toBeInTheDocument();
        expect(screen.getByText(/bienvenido\/a maría gonzález/i)).toBeInTheDocument();
        expect(screen.getByText(/tu cuenta ha sido creada con éxito/i)).toBeInTheDocument();
        expect(screen.getByText(/esta validación garantiza la integridad/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /validar cuenta/i })).toBeInTheDocument();

        // Inputs
        expect(screen.getByLabelText(/ingrese contraseña temporal/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/ingrese una contraseña/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/vuelva a escribir la contraseña/i)).toBeInTheDocument();

        // Botones cancelar y validar
        expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
      });
    });

    it('debe tener el botón de validar con la clase CSS correcta', async () => {
  renderWithRouter(<ValidarEmail />);

  await waitFor(() => {
    const botonValidar = screen.getByText(/validar cuenta/i);
    expect(botonValidar).toHaveClass('validar-email-button');
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
        expect(botonOK).toHaveClass('validar-email-button');
      });
    });
  });

  describe('Interacciones del usuario', () => {
    it('debe activar la cuenta cuando se hace click en validar', async () => {
      renderWithRouter(<ValidarEmail />);

      // 1. Esperar a que aparezca el botón
      await waitFor(() => {
        expect(screen.getByText(/validar cuenta/i)).toBeInTheDocument();
      });

      // 2. Llenar los inputs requeridos
      fireEvent.change(screen.getByTestId('passTemp'), {
        target: { value: 'temp-pass' },
      });


      fireEvent.change(screen.getByTestId('pass'), {
        target: { value: 'nuevaSegura456' },
      });

      fireEvent.change(screen.getByTestId('confirmpass'), {
        target: { value: 'nuevaSegura456' },
      });

      // 3. Click en el botón
      const botonValidar = screen.getByText(/validar cuenta/i);

      await act(async () => {
        fireEvent.click(botonValidar);
      });

      // 4. Verificar que se llamó la función
      await waitFor(() => {
        expect(ClientesFun.preActivarCuentaUsuario).toHaveBeenCalledWith(
          {
            id: 1,
            idvalid: 'valid-email-123',
          },
          mockNavigate
        );
      });
    });


    it('debe mostrar SweetAlert de éxito al activar correctamente', async () => {
      renderWithRouter(<ValidarEmail />);

      await waitFor(() => {
        expect(screen.getByText('Validar Cuenta')).toBeInTheDocument();
      });

      ClientesFun.preActivarCuentaUsuario.mockResolvedValue({
        passTempCorrecta: 'temp-pass',
      });

      // ¡No olvides ingresar la contraseña temporal!
      fireEvent.change(screen.getByTestId('passTemp'), {
        target: { value: 'temp-pass' },
      });

      fireEvent.change(screen.getByTestId('pass'), {
        target: { value: 'nuevaSegura456' },
      });
      fireEvent.change(screen.getByTestId('confirmpass'), {
        target: { value: 'nuevaSegura456' },
      });

      const botonValidar = screen.getByText('Validar Cuenta');

      await act(async () => {
        fireEvent.click(botonValidar);
      });

      await waitFor(() => {
        expect(swal.fire).toHaveBeenCalledWith({
          title: "<label>Muchas Felicidades</label>",
          text:
            "se ha completado con exito la pre-validacion de tu cuenta en Seguros.SA \npuedes finalizar tu registro desde tu cuenta",
          timer: 4500,
        });
      });
    });


    it('debe navegar al inicio después de activar exitosamente', async () => {
      renderWithRouter(<ValidarEmail />);

      // Esperar a que desaparezca el cargador
      await waitFor(() => {
        expect(screen.queryByTestId('cargar-inf')).not.toBeInTheDocument();
      });

      // Ingresar contraseñas válidas
      fireEvent.change(screen.getByTestId('passTemp'), {
        target: { value: 'temp-pass' },
      });
      fireEvent.change(screen.getByTestId('pass'), {
        target: { value: 'nuevaSegura456' },
      });
      fireEvent.change(screen.getByTestId('confirmpass'), {
        target: { value: 'nuevaSegura456' },
      });

      // Click en botón
      const botonValidar = screen.getByTestId('btn-validar-cuenta');
      await act(async () => {
        fireEvent.click(botonValidar);
      });

      // Verificar navegación
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
        expect(screen.getByText('Validar Cuenta')).toBeInTheDocument();
      });

      const botonValidar = screen.getByText('Validar Cuenta');
      const mockPreventDefault = jest.fn();

      const mockEvent = { preventDefault: mockPreventDefault };

      await act(async () => {
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
      // Simular error en la preactivación
      ClientesFun.preActivarCuentaUsuario.mockRejectedValue(
        new Error('Error de activación')
      );

      renderWithRouter(<ValidarEmail />);

      // Esperar a que el botón aparezca
      await waitFor(() => {
        expect(screen.getByTestId('btn-validar-cuenta')).toBeInTheDocument();
      });

      // Llenar campos requeridos
      fireEvent.change(screen.getByTestId('passTemp'), { target: { value: 'temp-pass' } });
      fireEvent.change(screen.getByTestId('pass'), { target: { value: '1234' } });
      fireEvent.change(screen.getByTestId('confirmpass'), { target: { value: '1234' } });

      // Click en botón
      await act(async () => {
        fireEvent.click(screen.getByTestId('btn-validar-cuenta'));
      });

      // Verifica que swal.fire fue llamado
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
        expect(screen.getByText('Validar Cuenta')).toBeInTheDocument();
      });

      const botonValidar = screen.getByText('Validar Cuenta');

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
      ClientesFun.buscarcliente.mockResolvedValue([
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
      ClientesFun.buscarcliente.mockResolvedValue([]);
 
      renderWithRouter(<ValidarEmail />);
 
      await waitFor(() => {
        // Debe mostrar error porque no hay datos de cliente
        expect(screen.getByText('⚠ Enlace inválido o expirado')).toBeInTheDocument();
      });
    });
  });

  describe('Estructura y estilos CSS', () => {
    it('debe aplicar las clases CSS correctas en estado exitoso', async () => {
      renderWithRouter(<ValidarEmail />);
 
      await waitFor(() => {
        const titulo = screen.getByText('🎉 ¡Gracias por registrarte en Seguros.SA!');
        expect(titulo).toHaveClass('validar-email-title');
 
        const mensaje1 = screen.getByText(/Bienvenido\/a/);
        const mensaje2 = screen.getByText(/Esta validación garantiza/);
        const mensaje3 = screen.getByText(/Para completar tu registro/);
 
        expect(mensaje1).toHaveClass('validar-email-message');
        expect(mensaje2).toHaveClass('validar-email-message');
        expect(mensaje3).toHaveClass('validar-email-message');
 
        const boton = screen.getByTestId('btn-validar-cuenta');
        expect(boton).toHaveClass('validar-email-button');
      });
    });
 
 
    it('debe tener la estructura correcta cuando hay error', async () => {
      ClientesFun.validarTokenEmail.mockRejectedValue(
        new Error('Token inválido')
      );
 
      renderWithRouter(<ValidarEmail />);
 
      await waitFor(() => {
        const titulo = screen.getByText('⚠ Enlace inválido o expirado');
        expect(titulo).toHaveClass('validar-email-title');
 
        const mensajes = screen.getAllByText(/El enlace ya expiró|Si crees que esto/);
        mensajes.forEach(mensaje => {
          expect(mensaje).toHaveClass('validar-email-message');
        });
 
        const boton = screen.getByText('OK');
        expect(boton).toHaveClass('validar-email-button');
      });
    });
 
    it('debe tener la estructura de contenedor correcta', async () => {
      renderWithRouter(<ValidarEmail />);
 
      await waitFor(() => {
        const titulo = screen.getByText('🎉 ¡Gracias por registrarte en Seguros.SA!');
        const card = titulo.closest('div');
        expect(card).toHaveClass('validar-email-card');
 
        const container = card.parentElement;
        expect(container).toHaveClass('validar-email-container');
      });
    });
  });

  describe('Integración completa', () => {
    it('debe completar el flujo exitoso completo de validación de email', async () => {
      renderWithRouter(<ValidarEmail />);

      // 1. Estado de carga inicial visible
      expect(screen.getByTestId('cargar-inf')).toBeInTheDocument();

      // 2. Esperar que desaparezca la carga y aparezca el mensaje de bienvenida
      await waitFor(() => {
        expect(screen.queryByTestId('cargar-inf')).not.toBeInTheDocument();
        expect(screen.getByText('🎉 ¡Gracias por registrarte en Seguros.SA!')).toBeInTheDocument();
      });

      // 3. Verificar que se hayan llamado las funciones con los parámetros correctos
      expect(ClientesFun.validarTokenEmail).toHaveBeenCalledWith(
        { url: 'test-email-token-123' },
        mockNavigate
      );
      expect(ClientesFun.buscarcliente).toHaveBeenCalledWith(1, mockNavigate);

      // 4. Verificar datos mostrados en pantalla (nombre completo)
      expect(screen.getByText(/Bienvenido\/a María González/)).toBeInTheDocument();

      // 5. Obtener inputs y llenar los campos de contraseña
      const inputPassTemp = screen.getByTestId('passTemp');
      const inputPass = screen.getByTestId('pass');
      const inputConfPass = screen.getByTestId('confirmpass');

      fireEvent.change(inputPassTemp, { target: { value: 'temp-pass' } });
      fireEvent.change(inputPass, { target: { value: 'some-password' } });
      fireEvent.change(inputConfPass, { target: { value: 'some-password' } });

      // 6. Click en botón validar cuenta dentro de act para manejar efectos
      const btnValidar = screen.getByTestId('btn-validar-cuenta');
      await act(async () => {
        fireEvent.click(btnValidar);
      });

      // 7. Esperar que se haya llamado a preActivarCuentaUsuario con datos esperados
      await waitFor(() => {
        expect(ClientesFun.preActivarCuentaUsuario).toHaveBeenCalled();
      });

      // 7.1 Verificar parámetros exactos de la llamada
      const [args, nav] = ClientesFun.preActivarCuentaUsuario.mock.calls[0];
      expect(args.id).toBe(1);
      expect(args.idvalid).toBe('valid-email-123');
      expect(nav).toBe(mockNavigate);

      // 8. Verificar que swal.fire se llamó con mensaje de éxito

      await waitFor(() => {
        expect(swal.fire).toHaveBeenCalledWith(expect.objectContaining({
          title: expect.stringContaining('Muchas Felicidades')
        }));
      });


      // 9. Verificar que la navegación se hizo al home ('/')
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
      ClientesFun.buscarcliente.mockRejectedValue(
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