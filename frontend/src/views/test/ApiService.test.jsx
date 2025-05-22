import ApiService from '../../services/ApiService';
import axios from 'axios';
import swal from 'sweetalert';

jest.mock('axios');
jest.mock('sweetalert');

describe('ApiService', () => {
  const navigateMock = jest.fn();

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('traerDatos', () => {
    it('debe retornar datos cuando el token es válido', async () => {
      localStorage.setItem('login', JSON.stringify({ token: 'fake-token' }));
      
      const mockData = { data: { message: "OK", results: [1, 2, 3] } };
      axios.get.mockResolvedValueOnce(mockData);

      const result = await ApiService.traerDatos('ruta/fake', navigateMock);

      expect(axios.get).toHaveBeenCalledWith(
        "http://localhost:4000/ruta/fake",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer fake-token"
          })
        })
      );
      expect(result).toEqual(mockData.data);
      expect(navigateMock).not.toHaveBeenCalled();
    });

    it('debe mostrar alerta y redirigir cuando el token es inválido o expirado', async () => {
      localStorage.setItem('login', JSON.stringify({ token: 'expired-token' }));
      
      const mockData = { data: { message: "Token inválido o expirado" } };
      axios.get.mockResolvedValueOnce(mockData);

      const result = await ApiService.traerDatos('ruta/fake', navigateMock);

      expect(swal).toHaveBeenCalledWith({
        title: "Acceso restringuido",
        text: "Ha excedido el tiempo límite de la sesión",
        timer: 3000,
        icon: "error",
      });

      expect(navigateMock).toHaveBeenCalledWith("/");
      expect(result).toBeUndefined();
    });
  });

});
