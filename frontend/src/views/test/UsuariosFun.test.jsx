import UsuariosFun from '../../views/usuarios/UsuariosFun';
import ApiService from '../../services/ApiService';

jest.mock('../../services/ApiService', () => ({
  put: jest.fn(),
  post: jest.fn(),
}));

describe('UsuariosFun', () => {
  const navigateMock = jest.fn();

  const fakeData = {
    usuario: 'testuser',
    password: '1234',
    correo: 'test@example.com',
    rol: 'AGENTE',
    estado: 'ACTIVO',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ───────────────────────────────
  // 🟩 PUT Methods
  // ───────────────────────────────

  describe('actualizarPass', () => {
    it('debe llamar a ApiService.put con la ruta y datos correctos', async () => {
      ApiService.put.mockResolvedValue('respuesta-ok');
      const res = await UsuariosFun.actualizarPass(fakeData, navigateMock);

      expect(ApiService.put).toHaveBeenCalledWith('user/users-password', fakeData, navigateMock);
      expect(res).toBe('respuesta-ok');
    });

    it('debe lanzar error si falla la petición', async () => {
      ApiService.put.mockRejectedValue(new Error('Error de red'));
      await expect(UsuariosFun.actualizarPass(fakeData, navigateMock)).rejects.toThrow('Error de red');
    });

    it('no debe lanzar error si los campos están vacíos pero el servicio responde', async () => {
      ApiService.put.mockResolvedValue('respuesta-vacía');
      const res = await UsuariosFun.actualizarPass({}, navigateMock);
      expect(res).toBe('respuesta-vacía');
    });
  });

  describe('actualizarUserPass', () => {
    it('debe actualizar la contraseña del usuario correctamente', async () => {
      ApiService.put.mockResolvedValue('contraseña-actualizada');
      const res = await UsuariosFun.actualizarUserPass(fakeData, navigateMock);

      expect(ApiService.put).toHaveBeenCalledWith('user/update-usuario-password', fakeData, navigateMock);
      expect(res).toBe('contraseña-actualizada');
    });

    it('debe manejar errores al actualizar la contraseña del usuario', async () => {
      ApiService.put.mockRejectedValue(new Error('Falló update'));
      await expect(UsuariosFun.actualizarUserPass(fakeData, navigateMock)).rejects.toThrow('Falló update');
    });
  });

  // ───────────────────────────────
  // 🟦 POST Methods
  // ───────────────────────────────

  describe('crearCuentaAgente', () => {
    it('debe crear una cuenta para agente correctamente', async () => {
      ApiService.post.mockResolvedValue('agente-creado');
      const res = await UsuariosFun.crearCuentaAgente(fakeData, navigateMock);

      expect(ApiService.post).toHaveBeenCalledWith('user/crear-usuario-agente', fakeData, navigateMock);
      expect(res).toBe('agente-creado');
    });

    it('debe manejar errores al crear cuenta de agente', async () => {
      ApiService.post.mockRejectedValue(new Error('Error creando agente'));
      await expect(UsuariosFun.crearCuentaAgente(fakeData, navigateMock)).rejects.toThrow('Error creando agente');
    });
  });

  describe('verificarDatosUsuario', () => {
    it('debe verificar los datos del usuario correctamente', async () => {
      ApiService.post.mockResolvedValue({ valid: true });
      const res = await UsuariosFun.verificarDatosUsuario({ usuario: 'prueba' }, navigateMock);

      expect(ApiService.post).toHaveBeenCalledWith('user/verificar-datos', { usuario: 'prueba' }, navigateMock);
      expect(res).toEqual({ valid: true });
    });

    it('debe lanzar error si falla verificación de datos', async () => {
      ApiService.post.mockRejectedValue(new Error('Verificación fallida'));
      await expect(
        UsuariosFun.verificarDatosUsuario({ usuario: 'prueba' }, navigateMock)
      ).rejects.toThrow('Verificación fallida');
    });
  });

  describe('verificarUsuario', () => {
    it('debe verificar si el usuario existe', async () => {
      ApiService.post.mockResolvedValue({ existe: true });
      const res = await UsuariosFun.verificarUsuario({ usuario: 'admin' }, navigateMock);

      expect(ApiService.post).toHaveBeenCalledWith('user/usuario-existe', { usuario: 'admin' }, navigateMock);
      expect(res).toEqual({ existe: true });
    });

    it('debe manejar error si falla la verificación de existencia de usuario', async () => {
      ApiService.post.mockRejectedValue(new Error('No se puede verificar'));
      await expect(
        UsuariosFun.verificarUsuario({ usuario: 'admin' }, navigateMock)
      ).rejects.toThrow('No se puede verificar');
    });

    it('debe aceptar llamada con datos vacíos si ApiService responde', async () => {
      ApiService.post.mockResolvedValue({ existe: false });
      const res = await UsuariosFun.verificarUsuario({}, navigateMock);
      expect(res).toEqual({ existe: false });
    });
  });

  // ───────────────────────────────
  // 🔁 Repetidas y combinadas
  // ───────────────────────────────

  it('debe permitir múltiples llamadas sin conflictos', async () => {
    ApiService.post.mockResolvedValueOnce({ existe: true });
    ApiService.post.mockResolvedValueOnce({ existe: false });

    const r1 = await UsuariosFun.verificarUsuario({ usuario: 'uno' }, navigateMock);
    const r2 = await UsuariosFun.verificarUsuario({ usuario: 'dos' }, navigateMock);

    expect(r1.existe).toBe(true);
    expect(r2.existe).toBe(false);
    expect(ApiService.post).toHaveBeenCalledTimes(2);
  });
});
