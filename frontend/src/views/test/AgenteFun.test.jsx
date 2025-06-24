import AgenteFun from '../agentes/AgenteFun';
import ApiService from '../../services/ApiService';

jest.mock('../../services/ApiService');

describe('AgenteFun', () => {
    const mockNavigate = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ✅ 1. GESTIÓN DE AGENTES
    describe('Gestion de Agentes', () => {
        it('guardarAgente debería llamar ApiService.post con datos correctos', async () => {
            const form = { nombre: 'Carlos', email: 'test@email.com' };
            const mockResponse = { success: true };
            ApiService.post.mockResolvedValue(mockResponse);

            const result = await AgenteFun.guardarAgente(form, mockNavigate);
            expect(ApiService.post).toHaveBeenCalledWith('agente/save-agente', form, mockNavigate);
            expect(result).toEqual(mockResponse);
        });

        it('buscarAgente debería llamar ApiService.get correctamente', async () => {
            const id = 10;
            const mockResponse = { id: 10, nombre: 'Luis' };
            ApiService.get.mockResolvedValue(mockResponse);

            const result = await AgenteFun.buscarAgente(id, mockNavigate);
            expect(ApiService.get).toHaveBeenCalledWith('agente/buscar-agente', id, mockNavigate);
            expect(result).toEqual(mockResponse);
        });

        it('actualizarAgente debería llamar ApiService.put con formulario', async () => {
            const form = { id: 1, nombre: 'Actualizado' };
            const mockResponse = { actualizado: true };
            ApiService.put.mockResolvedValue(mockResponse);

            const result = await AgenteFun.actualizarAgente(form, mockNavigate);
            expect(ApiService.put).toHaveBeenCalledWith('agente/update-agente', form, mockNavigate);
            expect(result).toEqual(mockResponse);
        });

        it('actualizarEmailAgente debería llamar ApiService.put con id', async () => {
            const id = 25;
            const mockResponse = { actualizado: true };
            ApiService.put.mockResolvedValue(mockResponse);

            const result = await AgenteFun.actualizarEmailAgente(id, mockNavigate);
            expect(ApiService.put).toHaveBeenCalledWith('agente/update-correo', id, mockNavigate);
            expect(result).toEqual(mockResponse);
        });

        it('activarCuentaAgente debería llamar ApiService.put correctamente', async () => {
            const id = 5;
            const mockResponse = { activado: true };
            ApiService.put.mockResolvedValue(mockResponse);

            const result = await AgenteFun.activarCuentaAgente(id, mockNavigate);
            expect(ApiService.put).toHaveBeenCalledWith('agente/activar-cuenta', id, mockNavigate);
            expect(result).toEqual(mockResponse);
        });
    });

    // 📋 2. LISTADO DE AGENTES
    describe('Listado Agentes', () => {
        it('obtenerAgentes debería llamar ApiService.getAll con la ruta correcta', async () => {
            const mockResponse = [{ nombre: 'Juan' }];
            ApiService.getAll.mockResolvedValue(mockResponse);

            const result = await AgenteFun.obtenerAgentes(mockNavigate);
            expect(ApiService.getAll).toHaveBeenCalledWith('agente/listar', mockNavigate);
            expect(result).toEqual(mockResponse);
        });

        it('obtenerAgentesPendientes debería llamar ApiService.getAll correctamente', async () => {
            const mockResponse = [{ nombre: 'Ana' }];
            ApiService.getAll.mockResolvedValue(mockResponse);

            const result = await AgenteFun.obtenerAgentesPendientes(mockNavigate);
            expect(ApiService.getAll).toHaveBeenCalledWith('agente/listarPendientes', mockNavigate);
            expect(result).toEqual(mockResponse);
        });
    });

    // 📧 3. EMAIL Y TOKENS
    describe('Email y tokens', () => {
        it('generarTokenValidacion debería llamar ApiService.post con formulario', async () => {
            const form = { id: 1 };
            const mockResponse = { token: 'ABC123' };
            ApiService.post.mockResolvedValue(mockResponse);

            const result = await AgenteFun.generarTokenValidacion(form, mockNavigate);
            expect(ApiService.post).toHaveBeenCalledWith('agente/generar-token', form, mockNavigate);
            expect(result).toEqual(mockResponse);
        });

        it('enviarCorreoEmail debería llamar ApiService.post correctamente', async () => {
            const form = { correo: 'agente@email.com' };
            const mockResponse = { enviado: true };
            ApiService.post.mockResolvedValue(mockResponse);

            const result = await AgenteFun.enviarCorreoEmail(form, mockNavigate);
            expect(ApiService.post).toHaveBeenCalledWith('email/correo-agente', form, mockNavigate);
            expect(result).toEqual(mockResponse);
        });

        it('BuscarRutaValidacion debería llamar ApiService.post correctamente', async () => {
            const form = { token: 'abc123' };
            const mockResponse = { ruta: '/validar' };
            ApiService.post.mockResolvedValue(mockResponse);

            const result = await AgenteFun.BuscarRutaValidacion(form, mockNavigate);
            expect(ApiService.post).toHaveBeenCalledWith('agente/buscar-ruta-token', form, mockNavigate);
            expect(result).toEqual(mockResponse);
        });

        it('validarTokenEmail debería llamar ApiService.post con el token', async () => {
            const form = { token: 'xyz789' };
            const mockResponse = { valido: true };
            ApiService.post.mockResolvedValue(mockResponse);

            const result = await AgenteFun.validarTokenEmail(form, mockNavigate);
            expect(ApiService.post).toHaveBeenCalledWith('agente/validar-token-email', form, mockNavigate);
            expect(result).toEqual(mockResponse);
        });

        it('actualizarTokenValidacion debería llamar ApiService.put correctamente', async () => {
            const form = { id: 1, nuevoToken: 'zzz999' };
            const mockResponse = { actualizado: true };
            ApiService.put.mockResolvedValue(mockResponse);

            const result = await AgenteFun.actualizarTokenValidacion(form, mockNavigate);
            expect(ApiService.put).toHaveBeenCalledWith('agente/actualizar-token-email', form, mockNavigate);
            expect(result).toEqual(mockResponse);
        });
    });

    // 👤 4. USUARIO
    describe('Usuarios', () => {
        it('verificarUsuario debería llamar ApiService.post con ID', async () => {
            const userId = { id: 123 };
            const mockResponse = { existe: true };
            ApiService.post.mockResolvedValue(mockResponse);

            const result = await AgenteFun.verificarUsuario(userId, mockNavigate);
            expect(ApiService.post).toHaveBeenCalledWith('user/usuario-existe', userId, mockNavigate);
            expect(result).toEqual(mockResponse);
        });
    });

    // ❌ 5. PRUEBA NEGATIVA
    describe('Pruebas negativas', () => {
        it('guardarAgente lanza error si falla ApiService.post', async () => {
            const form = { nombre: 'ErrorTest' };
            ApiService.post.mockRejectedValue(new Error('Falla de red'));

            await expect(AgenteFun.guardarAgente(form, mockNavigate)).rejects.toThrow('Falla de red');
        });
    });

  // 🔗 6. PRUEBA DE INTEGRACIÓN FUNCIONAL
  describe('Integración entre funciones y backend simulado', () => {
    it('guardarAgente + buscarAgente flujo combinado', async () => {
      const form = { nombre: 'Lucía', email: 'lucia@email.com' };
      const guardado = { id: 101, ...form };

      ApiService.post.mockResolvedValue(guardado);
      ApiService.get.mockResolvedValue(guardado);

      const guardar = await AgenteFun.guardarAgente(form, mockNavigate);
      const buscar = await AgenteFun.buscarAgente(guardar.id, mockNavigate);

      expect(guardar).toEqual(buscar);
      expect(ApiService.post).toHaveBeenCalledTimes(1);
      expect(ApiService.get).toHaveBeenCalledWith('agente/buscar-agente', guardar.id, mockNavigate);
    });
  });
});
