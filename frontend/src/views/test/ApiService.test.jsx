import ApiService from '../../services/ApiService';
import axios from 'axios';
import swal from 'sweetalert';

jest.mock('axios');
jest.mock('sweetalert');

describe('ApiService', () => {
  const navigateMock = jest.fn();
  const mockAxios = axios;

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('traerDatos', () => {
    it('debe retornar datos cuando el token es válido', async () => {
      localStorage.setItem('login', JSON.stringify({ token: 'fake-token' }));

      const mockData = { data: { message: "OK", results: [1, 2, 3] } };
      mockAxios.get.mockResolvedValueOnce(mockData);

      const result = await ApiService.getAll('ruta/fake', navigateMock);

      // CORRECCIÓN: Usar toEqual en lugar de objectContaining para mayor flexibilidad
      expect(mockAxios.get).toHaveBeenCalledWith(
        "https://gestion-seguros-backend.onrender.com/ruta/fake",
        {
          headers: {
            "Content-Type": "application/json", // Sin el espacio extra
            Authorization: "Bearer fake-token"
          }
        }
      );
      expect(result).toEqual(mockData.data);
      expect(navigateMock).not.toHaveBeenCalled();
    });

    it('debe mostrar alerta y redirigir cuando el token es inválido', async () => {
      localStorage.setItem('login', JSON.stringify({ token: 'expired-token' }));

      const mockData = { data: { message: "Token inválido o expirado" } };
      mockAxios.get.mockResolvedValueOnce(mockData);

      const result = await ApiService.getAll('ruta/fake', navigateMock);

      expect(swal).toHaveBeenCalledWith({
        title: "Acceso restringuido",
        text: "Ha excedido el tiempo límite de la sesión",
        timer: 3000,
        icon: "error",
      });
      expect(navigateMock).toHaveBeenCalledWith("/");
      expect(result).toBeUndefined();
    });

    it('debe mostrar alerta y redirigir cuando no hay token proporcionado', async () => {
      localStorage.setItem('login', JSON.stringify({ token: 'some-token' }));

      const mockData = { data: { message: "Token no proporcionado" } };
      mockAxios.get.mockResolvedValueOnce(mockData);

      const result = await ApiService.getAll('ruta/fake', navigateMock);

      expect(swal).toHaveBeenCalledWith({
        title: "Acceso restringuido",
        text: "Ha excedido el tiempo límite de la sesión",
        timer: 3000,
        icon: "error",
      });
      expect(navigateMock).toHaveBeenCalledWith("/");
      expect(result).toBeUndefined();
    });

    it('debe usar token vacío cuando no hay datos de login en localStorage', async () => {
      const mockData = { data: { message: "OK", results: [] } };
      mockAxios.get.mockResolvedValueOnce(mockData);

      const result = await ApiService.getAll('ruta/fake', navigateMock);

      expect(mockAxios.get).toHaveBeenCalledWith(
        "https://gestion-seguros-backend.onrender.com/ruta/fake",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer "
          }
        }
      );
      expect(result).toEqual(mockData.data);
    });

    it('debe manejar errores de red', async () => {
      localStorage.setItem('login', JSON.stringify({ token: 'fake-token' }));

      const networkError = new Error('Network Error');
      mockAxios.get.mockRejectedValueOnce(networkError);

      await expect(ApiService.getAll('ruta/fake', navigateMock)).rejects.toThrow('Network Error');
    });

    // NUEVA PRUEBA: Manejo de respuesta null/undefined
    it('debe manejar respuestas null o undefined correctamente', async () => {
      localStorage.setItem('login', JSON.stringify({ token: 'valid-token' }));

      // Caso 1: data es null
      const mockResponseNull = { data: null };
      mockAxios.get.mockResolvedValueOnce(mockResponseNull);

      const result1 = await ApiService.getAll('test/endpoint', navigateMock);
      expect(result1).toBeNull();

      // Caso 2: data es undefined
      const mockResponseUndefined = { data: undefined };
      mockAxios.get.mockResolvedValueOnce(mockResponseUndefined);

      const result2 = await ApiService.getAll('test/endpoint', navigateMock);
      expect(result2).toBeUndefined();

      // Caso 3: response.data no existe
      const mockResponseEmpty = {};
      mockAxios.get.mockResolvedValueOnce(mockResponseEmpty);

      const result3 = await ApiService.getAll('test/endpoint', navigateMock);
      expect(result3).toBeUndefined();
    });
  });

  describe('enviarDatos', () => {
    it('debe enviar datos correctamente', async () => {
      const mockForm = { nombre: 'Test', email: 'test@test.com' };
      const mockResponse = { data: { success: true, message: 'Datos enviados' } };

      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.post('user/create', mockForm, navigateMock);

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://gestion-seguros-backend.onrender.com/user/create',
        mockForm,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('debe manejar errores al enviar datos', async () => {
      const mockForm = { nombre: 'Test' };
      const serverError = new Error('Server Error');

      mockAxios.post.mockRejectedValueOnce(serverError);

      await expect(ApiService.post('user/create', mockForm, navigateMock)).rejects.toThrow('Server Error');
    });

    it('debe construir la URL correctamente', async () => {
      const mockForm = { data: 'test' };
      const mockResponse = { data: { success: true } };

      mockAxios.post.mockResolvedValueOnce(mockResponse);

      // Spy en console.log para verificar que se llama
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await ApiService.post('api/endpoint', mockForm, navigateMock);

      expect(consoleSpy).toHaveBeenCalledWith('https://gestion-seguros-backend.onrender.com/api/endpoint');

      consoleSpy.mockRestore();
    });
  });

  describe('buscarDatos', () => {
    it('debe buscar datos con token válido', async () => {
      localStorage.setItem('login', JSON.stringify({ token: 'valid-token' }));

      const mockResponse = { data: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }] };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.get('search/endpoint', 123, navigateMock);

      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://gestion-seguros-backend.onrender.com/search/endpoint?id=123',
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer valid-token"
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('debe retornar array vacío cuando la respuesta no es un array', async () => {
      localStorage.setItem('login', JSON.stringify({ token: 'valid-token' }));

      const mockResponse = { data: { message: 'Not an array' } };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.get('search/endpoint', 123, navigateMock);

      expect(result).toEqual([]);
    });

    it('debe usar token vacío cuando no hay datos de login', async () => {
      const mockResponse = { data: [] };
      mockAxios.get.mockResolvedValueOnce(mockResponse);

      // Asegurar que no hay token guardado
      localStorage.removeItem('login');

      const result = await ApiService.get('search/endpoint', 456, navigateMock);

      expect(mockAxios.get).toHaveBeenCalledWith(
        'https://gestion-seguros-backend.onrender.com/search/endpoint?id=456',
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer "
          },
        }
      );
      expect(result).toEqual([]);
    });


    it('debe manejar errores en búsqueda', async () => {
      localStorage.setItem('login', JSON.stringify({ token: 'valid-token' }));

      const searchError = new Error('Search failed');
      mockAxios.get.mockRejectedValueOnce(searchError);

      await expect(ApiService.get('search/endpoint', 123, navigateMock)).rejects.toThrow('Search failed');
    });
  });

  describe('actualizarDatos', () => {
    it('debe actualizar datos correctamente', async () => {
      const mockForm = { id: 1, nombre: 'Updated Name' };
      const mockResponse = { data: { success: true, message: 'Datos actualizados' } };

      mockAxios.put.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.put('user/update', mockForm, navigateMock);

      expect(mockAxios.put).toHaveBeenCalledWith(
        'https://gestion-seguros-backend.onrender.com/user/update',
        mockForm,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('debe manejar errores al actualizar', async () => {
      const mockForm = { id: 1, nombre: 'Test' };
      const updateError = new Error('Update failed');

      mockAxios.put.mockRejectedValueOnce(updateError);

      await expect(ApiService.put('user/update', mockForm, navigateMock)).rejects.toThrow('Update failed');
    });
  });

  describe('borrarDatos', () => {
    it('debe borrar datos correctamente', async () => {
      const mockForm = { id: 1 };
      const mockResponse = { data: { success: true }, status: 200 };

      mockAxios.delete.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.delete('user/delete', mockForm);

      expect(mockAxios.delete).toHaveBeenCalledWith(
        'https://gestion-seguros-backend.onrender.com/user/delete',
        {
          data: mockForm,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('debe manejar errores al borrar', async () => {
      const mockForm = { id: 1 };
      const deleteError = new Error('Delete failed');

      mockAxios.delete.mockRejectedValueOnce(deleteError);

      await expect(ApiService.delete('user/delete', mockForm)).rejects.toThrow('Delete failed');
    });
  });

  describe('login', () => {
    it('debe realizar login correctamente', async () => {
      const mockForm = { email: 'user@test.com', password: 'password123' };
      const mockResponse = {
        data: {
          success: true,
          token: 'auth-token',
          user: { id: 1, email: 'user@test.com' }
        }
      };

      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.login(mockForm);

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://gestion-seguros-backend.onrender.com/user/ingreso',
        mockForm,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('debe manejar errores de login', async () => {
      const mockForm = { email: 'user@test.com', password: 'wrongpassword' };
      const loginError = new Error('Login failed');

      mockAxios.post.mockRejectedValueOnce(loginError);

      await expect(ApiService.login(mockForm)).rejects.toThrow('Login failed');
    });

    it('debe usar el endpoint correcto para login', async () => {
      const mockForm = { email: 'test@test.com', password: '123' };
      const mockResponse = { data: { success: false, message: 'Invalid credentials' } };

      mockAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await ApiService.login(mockForm);

      expect(mockAxios.post).toHaveBeenCalledWith(
        'https://gestion-seguros-backend.onrender.com/user/ingreso',
        mockForm,
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json"
          })
        })
      );
      expect(result).toEqual(mockResponse.data);
    });
  });
});