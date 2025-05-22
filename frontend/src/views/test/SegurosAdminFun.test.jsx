import SegurosAdminFun from '../segurosAdmin/SegurosAdminFun';
import ApiService from '../../services/ApiService';

// Mock del ApiService
jest.mock('../../services/ApiService');

describe('SegurosAdminFun', () => {
  const mockNavigate = jest.fn();
  const mockResponse = { data: "respuesta_mock", success: true };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('traerTiposSeguros', () => {
    it('debe llamar a ApiService.traerDatos con los parámetros correctos', async () => {
      ApiService.traerDatos.mockResolvedValue(mockResponse);

      const result = await SegurosAdminFun.traerTiposSeguros(mockNavigate);

      expect(ApiService.traerDatos).toHaveBeenCalledWith("tiposeguro/listar", mockNavigate);
      expect(result).toEqual(mockResponse);
    });

    it('debe manejar errores correctamente', async () => {
      const errorMock = new Error('Error al cargar tipos de seguros');
      ApiService.traerDatos.mockRejectedValue(errorMock);

      await expect(SegurosAdminFun.traerTiposSeguros(mockNavigate)).rejects.toThrow('Error al cargar tipos de seguros');
      expect(ApiService.traerDatos).toHaveBeenCalledWith("tiposeguro/listar", mockNavigate);
    });

    it('debe retornar la respuesta exacta del ApiService', async () => {
      const responseEspecifico = { 
        rows: [
          { id: 1, nombre: 'Seguro Vida' },
          { id: 2, nombre: 'Seguro Auto' }
        ],
        total: 2
      };
      ApiService.traerDatos.mockResolvedValue(responseEspecifico);

      const result = await SegurosAdminFun.traerTiposSeguros(mockNavigate);

      expect(result).toEqual(responseEspecifico);
      expect(result.rows).toHaveLength(2);
    });
  });

  describe('categoria', () => {
    it('debe llamar a ApiService.traerDatos para obtener categorías', async () => {
      ApiService.traerDatos.mockResolvedValue(mockResponse);

      const result = await SegurosAdminFun.categoria(mockNavigate);

      expect(ApiService.traerDatos).toHaveBeenCalledWith("tiposeguro/categoria", mockNavigate);
      expect(result).toEqual(mockResponse);
    });

    it('debe manejar errores al obtener categorías', async () => {
      const errorMock = new Error('Error al cargar categorías');
      ApiService.traerDatos.mockRejectedValue(errorMock);

      await expect(SegurosAdminFun.categoria(mockNavigate)).rejects.toThrow('Error al cargar categorías');
    });

    it('debe retornar datos de categorías correctamente', async () => {
      const categoriasResponse = {
        rows: [
          { id: 1, nombre: 'Vida' },
          { id: 2, nombre: 'Salud' },
          { id: 3, nombre: 'Auto' }
        ]
      };
      ApiService.traerDatos.mockResolvedValue(categoriasResponse);

      const result = await SegurosAdminFun.categoria(mockNavigate);

      expect(result.rows).toHaveLength(3);
      expect(result.rows[0].nombre).toBe('Vida');
    });
  });

  describe('beneficios', () => {
    it('debe llamar a ApiService.buscarDatos con ID específico', async () => {
      ApiService.buscarDatos.mockResolvedValue(mockResponse);

      const result = await SegurosAdminFun.beneficios(123, mockNavigate);

      expect(ApiService.buscarDatos).toHaveBeenCalledWith("tiposeguro/beneficios", 123, mockNavigate);
      expect(result).toEqual(mockResponse);
    });

    it('debe manejar diferentes tipos de ID', async () => {
      ApiService.buscarDatos.mockResolvedValue(mockResponse);

      // Probar con ID como string
      await SegurosAdminFun.beneficios("456", mockNavigate);
      expect(ApiService.buscarDatos).toHaveBeenCalledWith("tiposeguro/beneficios", "456", mockNavigate);

      // Probar con ID como número
      await SegurosAdminFun.beneficios(789, mockNavigate);
      expect(ApiService.buscarDatos).toHaveBeenCalledWith("tiposeguro/beneficios", 789, mockNavigate);
    });

    it('debe manejar errores al buscar beneficios', async () => {
      const errorMock = new Error('Beneficios no encontrados');
      ApiService.buscarDatos.mockRejectedValue(errorMock);

      await expect(SegurosAdminFun.beneficios(999, mockNavigate)).rejects.toThrow('Beneficios no encontrados');
    });

    it('debe retornar lista de beneficios correctamente', async () => {
      const beneficiosResponse = [
        { id: 1, descripcion: 'Cobertura médica completa' },
        { id: 2, descripcion: 'Asistencia 24/7' }
      ];
      ApiService.buscarDatos.mockResolvedValue(beneficiosResponse);

      const result = await SegurosAdminFun.beneficios(1, mockNavigate);

      expect(result).toEqual(beneficiosResponse);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('guardarTipoSeguro', () => {
    it('debe llamar a ApiService.enviarDatos con formulario correcto', async () => {
      const formulario = {
        nombre: 'Seguro Dental',
        descripcion: 'Cobertura dental completa',
        precio: 500,
        categoria: 'Salud'
      };
      ApiService.enviarDatos.mockResolvedValue(mockResponse);

      const result = await SegurosAdminFun.guardarTipoSeguro(formulario, mockNavigate);

      expect(ApiService.enviarDatos).toHaveBeenCalledWith("tiposeguro/save", formulario, mockNavigate);
      expect(result).toEqual(mockResponse);
    });

    it('debe manejar formularios con diferentes estructuras', async () => {
      const formularioMinimo = { nombre: 'Seguro Básico' };
      const formularioCompleto = {
        nombre: 'Seguro Premium',
        descripcion: 'Cobertura premium',
        precio: 1000,
        categoria: 'Vida',
        beneficios: ['Beneficio 1', 'Beneficio 2']
      };

      ApiService.enviarDatos.mockResolvedValue(mockResponse);

      await SegurosAdminFun.guardarTipoSeguro(formularioMinimo, mockNavigate);
      expect(ApiService.enviarDatos).toHaveBeenCalledWith("tiposeguro/save", formularioMinimo, mockNavigate);

      await SegurosAdminFun.guardarTipoSeguro(formularioCompleto, mockNavigate);
      expect(ApiService.enviarDatos).toHaveBeenCalledWith("tiposeguro/save", formularioCompleto, mockNavigate);
    });

    it('debe manejar errores al guardar tipo de seguro', async () => {
      const formulario = { nombre: 'Seguro Test' };
      const errorMock = new Error('Error al guardar seguro');
      ApiService.enviarDatos.mockRejectedValue(errorMock);

      await expect(SegurosAdminFun.guardarTipoSeguro(formulario, mockNavigate)).rejects.toThrow('Error al guardar seguro');
    });

    it('debe retornar respuesta de creación exitosa', async () => {
      const formulario = { nombre: 'Nuevo Seguro' };
      const respuestaCreacion = {
        success: true,
        id: 123,
        message: 'Seguro creado exitosamente'
      };
      ApiService.enviarDatos.mockResolvedValue(respuestaCreacion);

      const result = await SegurosAdminFun.guardarTipoSeguro(formulario, mockNavigate);

      expect(result.success).toBe(true);
      expect(result.id).toBe(123);
    });
  });

  describe('guardarBeneficioSeguro', () => {
    it('debe llamar a ApiService.enviarDatos para guardar beneficios', async () => {
      const formulario = {
        id_seguro: 1,
        beneficios: ['Consulta médica', 'Exámenes de laboratorio']
      };
      ApiService.enviarDatos.mockResolvedValue(mockResponse);

      const result = await SegurosAdminFun.guardarBeneficioSeguro(formulario, mockNavigate);

      expect(ApiService.enviarDatos).toHaveBeenCalledWith("tiposeguro/savebeneficios", formulario, mockNavigate);
      expect(result).toEqual(mockResponse);
    });

    it('debe manejar múltiples beneficios', async () => {
      const formularioConBeneficios = {
        id_seguro: 2,
        beneficios: [
          { descripcion: 'Hospitalización', monto: 5000 },
          { descripcion: 'Cirugías', monto: 10000 },
          { descripcion: 'Medicamentos', monto: 1000 }
        ]
      };
      ApiService.enviarDatos.mockResolvedValue(mockResponse);

      const result = await SegurosAdminFun.guardarBeneficioSeguro(formularioConBeneficios, mockNavigate);

      expect(ApiService.enviarDatos).toHaveBeenCalledWith("tiposeguro/savebeneficios", formularioConBeneficios, mockNavigate);
      expect(result).toEqual(mockResponse);
    });

    it('debe manejar errores al guardar beneficios', async () => {
      const formulario = { id_seguro: 1, beneficios: [] };
      const errorMock = new Error('Error al guardar beneficios');
      ApiService.enviarDatos.mockRejectedValue(errorMock);

      await expect(SegurosAdminFun.guardarBeneficioSeguro(formulario, mockNavigate)).rejects.toThrow('Error al guardar beneficios');
    });
  });

  describe('SeguroBeneficios', () => {
    it('debe llamar a ApiService.buscarDatos para obtener beneficios de seguro', async () => {
      ApiService.buscarDatos.mockResolvedValue(mockResponse);

      const result = await SegurosAdminFun.SeguroBeneficios(456, mockNavigate);

      expect(ApiService.buscarDatos).toHaveBeenCalledWith("tiposeguro/seguroBeneficio", 456, mockNavigate);
      expect(result).toEqual(mockResponse);
    });

    it('debe manejar diferentes formatos de ID', async () => {
      const beneficiosResponse = [
        { id: 1, beneficio: 'Cobertura A', activo: true },
        { id: 2, beneficio: 'Cobertura B', activo: false }
      ];
      ApiService.buscarDatos.mockResolvedValue(beneficiosResponse);

      const result = await SegurosAdminFun.SeguroBeneficios('789', mockNavigate);

      expect(ApiService.buscarDatos).toHaveBeenCalledWith("tiposeguro/seguroBeneficio", '789', mockNavigate);
      expect(result).toEqual(beneficiosResponse);
    });

    it('debe manejar errores al buscar beneficios de seguro', async () => {
      const errorMock = new Error('Seguro no encontrado');
      ApiService.buscarDatos.mockRejectedValue(errorMock);

      await expect(SegurosAdminFun.SeguroBeneficios(999, mockNavigate)).rejects.toThrow('Seguro no encontrado');
    });
  });

  describe('actualizarTipoSeguro', () => {
    it('debe llamar a ApiService.actualizarDatos con formulario de actualización', async () => {
      const formulario = {
        id: 1,
        nombre: 'Seguro Actualizado',
        descripcion: 'Nueva descripción',
        precio: 750
      };
      ApiService.actualizarDatos.mockResolvedValue(mockResponse);

      const result = await SegurosAdminFun.actualizarTipoSeguro(formulario, mockNavigate);

      expect(ApiService.actualizarDatos).toHaveBeenCalledWith("tiposeguro/updateSeguro", formulario, mockNavigate);
      expect(result).toEqual(mockResponse);
    });

    it('debe manejar actualizaciones parciales', async () => {
      const actualizacionParcial = {
        id: 2,
        precio: 900 // Solo actualizar precio
      };
      ApiService.actualizarDatos.mockResolvedValue(mockResponse);

      const result = await SegurosAdminFun.actualizarTipoSeguro(actualizacionParcial, mockNavigate);

      expect(ApiService.actualizarDatos).toHaveBeenCalledWith("tiposeguro/updateSeguro", actualizacionParcial, mockNavigate);
      expect(result).toEqual(mockResponse);
    });

    it('debe manejar errores al actualizar tipo de seguro', async () => {
      const formulario = { id: 1, nombre: 'Test' };
      const errorMock = new Error('Error al actualizar seguro');
      ApiService.actualizarDatos.mockRejectedValue(errorMock);

      await expect(SegurosAdminFun.actualizarTipoSeguro(formulario, mockNavigate)).rejects.toThrow('Error al actualizar seguro');
    });

    it('debe retornar confirmación de actualización', async () => {
      const formulario = { id: 3, nombre: 'Seguro Modificado' };
      const respuestaActualizacion = {
        success: true,
        message: 'Seguro actualizado correctamente',
        data: { id: 3, nombre: 'Seguro Modificado' }
      };
      ApiService.actualizarDatos.mockResolvedValue(respuestaActualizacion);

      const result = await SegurosAdminFun.actualizarTipoSeguro(formulario, mockNavigate);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(3);
    });
  });

  describe('borrarBeneficios', () => {
    it('debe llamar a ApiService.borrarDatos con ID específico', async () => {
      ApiService.borrarDatos.mockResolvedValue(mockResponse);

      const result = await SegurosAdminFun.borrarBeneficios(123, mockNavigate);

      expect(ApiService.borrarDatos).toHaveBeenCalledWith("tiposeguro/deleteBeneficios", 123, mockNavigate);
      expect(result).toEqual(mockResponse);
    });

    it('debe manejar diferentes tipos de ID para borrado', async () => {
      ApiService.borrarDatos.mockResolvedValue(mockResponse);

      // ID como número
      await SegurosAdminFun.borrarBeneficios(456, mockNavigate);
      expect(ApiService.borrarDatos).toHaveBeenCalledWith("tiposeguro/deleteBeneficios", 456, mockNavigate);

      // ID como string
      await SegurosAdminFun.borrarBeneficios("789", mockNavigate);
      expect(ApiService.borrarDatos).toHaveBeenCalledWith("tiposeguro/deleteBeneficios", "789", mockNavigate);
    });

    it('debe manejar errores al borrar beneficios', async () => {
      const errorMock = new Error('No se pudo borrar el beneficio');
      ApiService.borrarDatos.mockRejectedValue(errorMock);

      await expect(SegurosAdminFun.borrarBeneficios(999, mockNavigate)).rejects.toThrow('No se pudo borrar el beneficio');
    });

    it('debe retornar confirmación de borrado', async () => {
      const respuestaBorrado = {
        success: true,
        message: 'Beneficio eliminado correctamente'
      };
      ApiService.borrarDatos.mockResolvedValue(respuestaBorrado);

      const result = await SegurosAdminFun.borrarBeneficios(111, mockNavigate);

      expect(result.success).toBe(true);
      expect(result.message).toContain('eliminado');
    });
  });

  describe('actualizarEstado', () => {
    it('debe llamar a ApiService.actualizarDatos para cambiar estado', async () => {
      const formulario = {
        id: 1,
        estado: false // Desactivar
      };
      ApiService.actualizarDatos.mockResolvedValue(mockResponse);

      const result = await SegurosAdminFun.actualizarEstado(formulario, mockNavigate);

      expect(ApiService.actualizarDatos).toHaveBeenCalledWith("tiposeguro/desactivar", formulario, mockNavigate);
      expect(result).toEqual(mockResponse);
    });

    it('debe manejar activación y desactivación', async () => {
      const formularioDesactivar = { id: 1, estado: false };
      const formularioActivar = { id: 2, estado: true };

      ApiService.actualizarDatos.mockResolvedValue(mockResponse);

      await SegurosAdminFun.actualizarEstado(formularioDesactivar, mockNavigate);
      expect(ApiService.actualizarDatos).toHaveBeenCalledWith("tiposeguro/desactivar", formularioDesactivar, mockNavigate);

      await SegurosAdminFun.actualizarEstado(formularioActivar, mockNavigate);
      expect(ApiService.actualizarDatos).toHaveBeenCalledWith("tiposeguro/desactivar", formularioActivar, mockNavigate);
    });

    it('debe manejar errores al actualizar estado', async () => {
      const formulario = { id: 1, estado: false };
      const errorMock = new Error('Error al cambiar estado del seguro');
      ApiService.actualizarDatos.mockRejectedValue(errorMock);

      await expect(SegurosAdminFun.actualizarEstado(formulario, mockNavigate)).rejects.toThrow('Error al cambiar estado del seguro');
    });

    it('debe retornar confirmación de cambio de estado', async () => {
      const formulario = { id: 5, estado: false };
      const respuestaEstado = {
        success: true,
        message: 'Estado actualizado correctamente',
        nuevoEstado: false
      };
      ApiService.actualizarDatos.mockResolvedValue(respuestaEstado);

      const result = await SegurosAdminFun.actualizarEstado(formulario, mockNavigate);

      expect(result.success).toBe(true);
      expect(result.nuevoEstado).toBe(false);
    });
  });

  describe('Manejo de parámetros navigate', () => {
    it('debe pasar el parámetro navigate a todos los métodos que usan traerDatos', async () => {
      const customNavigate = jest.fn();
      ApiService.traerDatos.mockResolvedValue(mockResponse);

      await SegurosAdminFun.traerTiposSeguros(customNavigate);
      expect(ApiService.traerDatos).toHaveBeenCalledWith("tiposeguro/listar", customNavigate);

      await SegurosAdminFun.categoria(customNavigate);
      expect(ApiService.traerDatos).toHaveBeenCalledWith("tiposeguro/categoria", customNavigate);
    });

    it('debe pasar el parámetro navigate a todos los métodos que usan buscarDatos', async () => {
      const customNavigate = jest.fn();
      ApiService.buscarDatos.mockResolvedValue(mockResponse);

      await SegurosAdminFun.beneficios(1, customNavigate);
      expect(ApiService.buscarDatos).toHaveBeenCalledWith("tiposeguro/beneficios", 1, customNavigate);

      await SegurosAdminFun.SeguroBeneficios(2, customNavigate);
      expect(ApiService.buscarDatos).toHaveBeenCalledWith("tiposeguro/seguroBeneficio", 2, customNavigate);
    });

    it('debe pasar el parámetro navigate a métodos de modificación de datos', async () => {
      const customNavigate = jest.fn();
      const formulario = { test: 'data' };
      
      ApiService.enviarDatos.mockResolvedValue(mockResponse);
      ApiService.actualizarDatos.mockResolvedValue(mockResponse);
      ApiService.borrarDatos.mockResolvedValue(mockResponse);

      await SegurosAdminFun.guardarTipoSeguro(formulario, customNavigate);
      expect(ApiService.enviarDatos).toHaveBeenCalledWith("tiposeguro/save", formulario, customNavigate);

      await SegurosAdminFun.actualizarTipoSeguro(formulario, customNavigate);
      expect(ApiService.actualizarDatos).toHaveBeenCalledWith("tiposeguro/updateSeguro", formulario, customNavigate);

      await SegurosAdminFun.borrarBeneficios(1, customNavigate);
      expect(ApiService.borrarDatos).toHaveBeenCalledWith("tiposeguro/deleteBeneficios", 1, customNavigate);
    });
  });

  describe('Casos edge y validaciones', () => {
    it('debe manejar valores null y undefined como parámetros', async () => {
      ApiService.buscarDatos.mockResolvedValue([]);
      ApiService.enviarDatos.mockResolvedValue(mockResponse);

      // ID null
      await SegurosAdminFun.beneficios(null, mockNavigate);
      expect(ApiService.buscarDatos).toHaveBeenCalledWith("tiposeguro/beneficios", null, mockNavigate);

      // ID undefined
      await SegurosAdminFun.beneficios(undefined, mockNavigate);
      expect(ApiService.buscarDatos).toHaveBeenCalledWith("tiposeguro/beneficios", undefined, mockNavigate);

      // Formulario null
      await SegurosAdminFun.guardarTipoSeguro(null, mockNavigate);
      expect(ApiService.enviarDatos).toHaveBeenCalledWith("tiposeguro/save", null, mockNavigate);
    });

    it('debe manejar objetos formulario vacíos', async () => {
      const formularioVacio = {};
      ApiService.enviarDatos.mockResolvedValue(mockResponse);

      const result = await SegurosAdminFun.guardarTipoSeguro(formularioVacio, mockNavigate);

      expect(ApiService.enviarDatos).toHaveBeenCalledWith("tiposeguro/save", formularioVacio, mockNavigate);
      expect(result).toEqual(mockResponse);
    });

    it('debe manejar respuestas vacías del ApiService', async () => {
      ApiService.traerDatos.mockResolvedValue(null);
      
      const result = await SegurosAdminFun.traerTiposSeguros(mockNavigate);
      
      expect(result).toBeNull();
    });

    it('debe propagar errores de ApiService sin modificar', async () => {
      const errorOriginal = new Error('Error específico del API');
      errorOriginal.status = 404;
      errorOriginal.code = 'NOT_FOUND';
      
      ApiService.traerDatos.mockRejectedValue(errorOriginal);

      try {
        await SegurosAdminFun.traerTiposSeguros(mockNavigate);
      } catch (error) {
        expect(error.message).toBe('Error específico del API');
        expect(error.status).toBe(404);
        expect(error.code).toBe('NOT_FOUND');
      }
    });
  });

  describe('Cobertura completa de métodos', () => {
    it('debe tener todos los métodos implementados correctamente', () => {
      // Verificar que todos los métodos estáticos existen
      expect(typeof SegurosAdminFun.traerTiposSeguros).toBe('function');
      expect(typeof SegurosAdminFun.categoria).toBe('function');
      expect(typeof SegurosAdminFun.beneficios).toBe('function');
      expect(typeof SegurosAdminFun.guardarTipoSeguro).toBe('function');
      expect(typeof SegurosAdminFun.guardarBeneficioSeguro).toBe('function');
      expect(typeof SegurosAdminFun.SeguroBeneficios).toBe('function');
      expect(typeof SegurosAdminFun.actualizarTipoSeguro).toBe('function');
      expect(typeof SegurosAdminFun.borrarBeneficios).toBe('function');
      expect(typeof SegurosAdminFun.actualizarEstado).toBe('function');
    });

    it('debe retornar promesas para todos los métodos', () => {
      ApiService.traerDatos.mockResolvedValue(mockResponse);
      ApiService.buscarDatos.mockResolvedValue(mockResponse);
      ApiService.enviarDatos.mockResolvedValue(mockResponse);
      ApiService.actualizarDatos.mockResolvedValue(mockResponse);
      ApiService.borrarDatos.mockResolvedValue(mockResponse);

      const promesas = [
        SegurosAdminFun.traerTiposSeguros(mockNavigate),
        SegurosAdminFun.categoria(mockNavigate),
        SegurosAdminFun.beneficios(1, mockNavigate),
        SegurosAdminFun.guardarTipoSeguro({}, mockNavigate),
        SegurosAdminFun.guardarBeneficioSeguro({}, mockNavigate),
        SegurosAdminFun.SeguroBeneficios(1, mockNavigate),
        SegurosAdminFun.actualizarTipoSeguro({}, mockNavigate),
        SegurosAdminFun.borrarBeneficios(1, mockNavigate),
        SegurosAdminFun.actualizarEstado({}, mockNavigate)
      ];

      promesas.forEach(promesa => {
        expect(promesa).toBeInstanceOf(Promise);
      });
    });
  });
});