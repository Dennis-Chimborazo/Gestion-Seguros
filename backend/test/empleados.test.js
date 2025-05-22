import { jest } from '@jest/globals';

// Mock para el objeto de respuesta express
const mockJson = jest.fn().mockImplementation(function() { return this; });
const mockStatus = jest.fn().mockImplementation(function() { return this; });
const mockRes = { 
  json: mockJson, 
  status: mockStatus 
};

// Mock para la consulta a la base de datos
const mockQuery = jest.fn();

// Definimos rutas para capturar los controladores
const routes = {};

// Mock de express antes de importar el módulo
jest.mock('express', () => {
  // Mock del router
  const router = {
    get: jest.fn((path, handler) => {
      routes[`GET:${path}`] = handler;
      return router;
    }),
    post: jest.fn((path, handler) => {
      routes[`POST:${path}`] = handler;
      return router;
    }),
    put: jest.fn((path, handler) => {
      routes[`PUT:${path}`] = handler;
      return router;
    }),
    delete: jest.fn((path, handler) => {
      routes[`DELETE:${path}`] = handler;
      return router;
    })
  };
  
  return {
    Router: jest.fn(() => router),
  };
});

// Mock del módulo de la base de datos
jest.mock('../src/database.js', () => {
  const mockDb = { query: mockQuery };
  
  return {
    DataBase: jest.fn().mockImplementation(() => {
      return {
        getConexion: jest.fn().mockReturnValue(mockDb)
      };
    })
  };
});

// Importamos el módulo a probar después de configurar todos los mocks
let routerInstance;
try {
  // Importamos el módulo real para que se registren las rutas
  routerInstance = require('../src/routes/empleados.routes.js');
  console.log('Rutas capturadas:', Object.keys(routes));
} catch (error) {
  console.error('Error al importar el módulo empleados.routes.js:', error);
}

describe('Pruebas para la ruta de empleados', () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('GET /buscarempleado', () => {
    it('debería encontrar un empleado por cédula', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['GET:/buscarempleado'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para devolver datos
      const empleadoMock = {
        ced_emple: '1234567890',
        nom_emple: 'Juan Pérez',
        cargo_emple: 'Gerente'
      };
      
      mockQuery.mockResolvedValue({
        rows: [empleadoMock],
        rowCount: 1
      });

      // Crear un objeto de solicitud mock con la cédula
      const mockReq = {
        query: { id: '1234567890' }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalledWith([empleadoMock]);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM empleado WHERE ced_emple = $1',
        ['1234567890']
      );
    });

    it('debería retornar un array vacío cuando no encuentra al empleado', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['GET:/buscarempleado'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para devolver un resultado vacío
      mockQuery.mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      // Crear un objeto de solicitud mock con una cédula inexistente
      const mockReq = {
        query: { id: '9999999999' }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM empleado WHERE ced_emple = $1',
        ['9999999999']
      );
    });

    it('debería retornar error 400 cuando no se proporciona la cédula', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['GET:/buscarempleado'];
      expect(routeHandler).toBeDefined();
      
      // Crear un objeto de solicitud mock sin ID
      const mockReq = {
        query: {}
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta de error
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalled();
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('debería manejar errores de base de datos', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['GET:/buscarempleado'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para lanzar un error
      const errorDB = new Error('Error de conexión a la base de datos');
      mockQuery.mockRejectedValue(errorDB);

      // Crear un objeto de solicitud mock con la cédula
      const mockReq = {
        query: { id: '1234567890' }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta de error
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Error al obtener el empleado'
      }));
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM empleado WHERE ced_emple = $1',
        ['1234567890']
      );
    });
  });

  // Prueba para verificar la estructura del módulo y la configuración de rutas
  describe('Configuración del router', () => {
    it('debería registrar las rutas correctamente', () => {
      // Verificar que se capturaron rutas
      expect(Object.keys(routes).length).toBeGreaterThan(0);
      
      // Verificar específicamente la ruta que esperamos
      expect(routes['GET:/buscarempleado']).toBeDefined();
      expect(typeof routes['GET:/buscarempleado']).toBe('function');
    });
  });
});