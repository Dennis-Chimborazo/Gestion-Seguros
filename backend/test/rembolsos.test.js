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

// Mock de dayjs
const mockDayjs = jest.fn();
jest.mock('dayjs', () => {
  const mockDayjsInstance = {
    format: jest.fn().mockReturnValue('2024-01-15')
  };
  mockDayjs.mockReturnValue(mockDayjsInstance);
  return mockDayjs;
});

// Importamos el módulo a probar después de configurar todos los mocks
let routerInstance;
try {
  routerInstance = require('../src/routes/reembolsos.routes.js');
  console.log('Rutas capturadas de reembolsos:', Object.keys(routes));
} catch (error) {
  console.error('Error al importar el módulo reembolsos.routes.js:', error);
}

// Datos de prueba
const REEMBOLSO_MOCK = {
  motivo_reemb: 'Accidente vehicular',
  id_pers: 1,
  id_seguro: 1
};

const REEMBOLSOS_LIST_MOCK = [
  {
    id_reemb: 1,
    fecha_reemb: '2024-01-15',
    motivo_reemb: 'Accidente vehicular',
    id_pers: 1,
    nombre: 'Pérez Juan',
    cedr_cli: '1234567890',
    id_seguro: 1,
    nom_estado: 'Pendiente',
    nom_tip_seg: 'Auto'
  },
  {
    id_reemb: 2,
    fecha_reemb: '2024-01-14',
    motivo_reemb: 'Daño por granizo',
    id_pers: 2,
    nombre: 'García María',
    cedr_cli: '0987654321',
    id_seguro: 2,
    nom_estado: 'Aprobado',
    nom_tip_seg: 'Hogar'
  }
];

const REVISION_MOCK = {
  descripcion_revision: 'Revisión aprobada por cumplir todos los requisitos',
  id_reemb: 1
};

describe('Pruebas unitarias para la ruta de reembolsos', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /save-reembolso', () => {
    it('debería crear un reembolso exitosamente', async () => {
      const routeHandler = routes['POST:/save-reembolso'];
      expect(routeHandler).toBeDefined();
      
      mockQuery.mockResolvedValue({
        rows: [{ id_reemb: 123 }]
      });

      const mockReq = {
        body: REEMBOLSO_MOCK
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO reembolso"),
        ['2024-01-15', 'Accidente vehicular', 1, 1, 3]
      );
      expect(mockJson).toHaveBeenCalledWith({
        message: "Reembolso guardado exitosamente",
        id_reemb: 123
      });
    });

    it('debería manejar error de base de datos en save-reembolso', async () => {
      const routeHandler = routes['POST:/save-reembolso'];
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockQuery.mockRejectedValue(new Error('Error de inserción'));

      const mockReq = {
        body: REEMBOLSO_MOCK
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error al guardar reembolso:", expect.any(Error));
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Error al guardar reembolso",
        error: expect.any(Error)
      });

      consoleErrorSpy.mockRestore();
    });

    it('debería usar la fecha actual formateada correctamente', async () => {
      const routeHandler = routes['POST:/save-reembolso'];
      
      // Configurar dayjs para retornar una fecha específica
      const dayjs = require('dayjs');
      dayjs().format.mockReturnValue('2024-12-25');
      
      mockQuery.mockResolvedValue({
        rows: [{ id_reemb: 456 }]
      });

      const mockReq = {
        body: REEMBOLSO_MOCK
      };

      await routeHandler(mockReq, mockRes);

      expect(dayjs().format).toHaveBeenCalledWith("YYYY-MM-DD");
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['2024-12-25', 'Accidente vehicular', 1, 1, 3]
      );
    });
  });

  describe('GET /listar', () => {
    it('debería retornar lista de reembolsos exitosamente', async () => {
      const routeHandler = routes['GET:/listar'];
      expect(routeHandler).toBeDefined();
      
      mockQuery.mockResolvedValue({
        rows: REEMBOLSOS_LIST_MOCK,
        rowCount: 2
      });

      const mockReq = {};
      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SELECT r.id_reemb,r.fecha_reemb, r.motivo_reemb")
      );
      expect(mockJson).toHaveBeenCalledWith({
        rows: REEMBOLSOS_LIST_MOCK,
        rowCount: 2
      });
    });

    it('debería manejar error de base de datos en listar', async () => {
      const routeHandler = routes['GET:/listar'];
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockQuery.mockRejectedValue(new Error('Error de consulta'));

      const mockReq = {};
      await routeHandler(mockReq, mockRes);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error en consulta:", expect.any(Error));
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Error al obtener datos",
        error: "Error de consulta"
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('GET /buscar-reembolso-cliente', () => {
    it('debería buscar reembolsos por ID de cliente exitosamente', async () => {
      const routeHandler = routes['GET:/buscar-reembolso-cliente'];
      expect(routeHandler).toBeDefined();
      
      const reembolsosCliente = [
        {
          id_reemb: 1,
          fecha_reemb: '2024-01-15',
          motivo_reemb: 'Accidente',
          id_pers: 1,
          id_seguro: 1,
          nom_estado: 'Pendiente',
          nom_tip_seg: 'Auto'
        }
      ];
      
      mockQuery.mockResolvedValue({
        rows: reembolsosCliente
      });

      const mockReq = {
        query: { id: '1' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE r.id_pers = $1"),
        ['1']
      );
      expect(mockJson).toHaveBeenCalledWith(reembolsosCliente);
    });

    it('debería manejar array de IDs en buscar-reembolso-cliente', async () => {
      const routeHandler = routes['GET:/buscar-reembolso-cliente'];
      
      mockQuery.mockResolvedValue({
        rows: []
      });

      const mockReq = {
        query: { id: ['1', 'extra'] }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['1'] // Debe tomar solo el primer elemento
      );
    });

    it('debería manejar error de base de datos en buscar-reembolso-cliente', async () => {
      const routeHandler = routes['GET:/buscar-reembolso-cliente'];
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockQuery.mockRejectedValue(new Error('Error de búsqueda'));

      const mockReq = {
        query: { id: '1' }
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error en consulta:", expect.any(Error));
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Error al obtener datos",
        error: "Error de búsqueda"
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('POST /save-revision-aprovado', () => {
    it('debería guardar revisión aprobada exitosamente', async () => {
      const routeHandler = routes['POST:/save-revision-aprovado'];
      expect(routeHandler).toBeDefined();
      
      // Primera consulta: insertar revisión
      mockQuery.mockResolvedValueOnce({
        rows: [{ id_revision: 1 }]
      });
      
      // Segunda consulta: actualizar estado del reembolso
      mockQuery.mockResolvedValueOnce({
        rowCount: 1
      });

      const mockReq = {
        body: REVISION_MOCK
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenNthCalledWith(1,
        expect.stringContaining("INSERT INTO revision"),
        ['2024-01-15', 'Revisión aprobada por cumplir todos los requisitos', 1, 6]
      );
      expect(mockQuery).toHaveBeenNthCalledWith(2,
        expect.stringContaining("UPDATE reembolso SET"),
        [6, 1]
      );
      expect(mockJson).toHaveBeenCalledWith({
        message: "✅ Revisión guardada exitosamente",
        success: true
      });
    });

    it('debería manejar error de base de datos en save-revision-aprovado', async () => {
      const routeHandler = routes['POST:/save-revision-aprovado'];
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockQuery.mockRejectedValue(new Error('Error de revisión'));

      const mockReq = {
        body: REVISION_MOCK
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleErrorSpy).toHaveBeenCalledWith("❌ Error al guardar revisión:", expect.any(Error));
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Error al guardar revisión",
        error: expect.any(Error)
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('POST /save-revision-rechasada', () => {
    it('debería guardar revisión rechazada exitosamente', async () => {
      const routeHandler = routes['POST:/save-revision-rechasada'];
      expect(routeHandler).toBeDefined();
      
      // Primera consulta: insertar revisión
      mockQuery.mockResolvedValueOnce({
        rows: [{ id_revision: 2 }]
      });
      
      // Segunda consulta: actualizar estado del reembolso
      mockQuery.mockResolvedValueOnce({
        rowCount: 1
      });

      const revisionRechazada = {
        descripcion_revision: 'No cumple con los requisitos mínimos',
        id_reemb: 1
      };

      const mockReq = {
        body: revisionRechazada
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenNthCalledWith(1,
        expect.stringContaining("INSERT INTO revision"),
        ['2024-01-15', 'No cumple con los requisitos mínimos', 1, 7]
      );
      expect(mockQuery).toHaveBeenNthCalledWith(2,
        expect.stringContaining("UPDATE reembolso SET"),
        [7, 1]
      );
      expect(mockJson).toHaveBeenCalledWith({
        message: "✅ Revisión guardada exitosamente",
        success: true
      });
    });

    it('debería manejar error de base de datos en save-revision-rechasada', async () => {
      const routeHandler = routes['POST:/save-revision-rechasada'];
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockQuery.mockRejectedValue(new Error('Error de revisión rechazada'));

      const mockReq = {
        body: REVISION_MOCK
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleErrorSpy).toHaveBeenCalledWith("❌ Error al guardar revisión:", expect.any(Error));
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Error al guardar revisión",
        error: expect.any(Error)
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('GET /buscar-reembolso-aceptado', () => {
    it('debería buscar reembolso aceptado exitosamente', async () => {
      const routeHandler = routes['GET:/buscar-reembolso-aceptado'];
      expect(routeHandler).toBeDefined();
      
      const reembolsoAceptado = [
        {
          fecha_revision: '2024-01-16',
          descripcion_revision: 'Aprobado correctamente',
          id_reemb: 1,
          tipo_cuent_Ban: 'Ahorros',
          nom_cuent_Ban: 'Banco Nacional',
          mun_cuent_Ban: 'Quito'
        }
      ];
      
      mockQuery.mockResolvedValue({
        rows: reembolsoAceptado
      });

      const mockReq = {
        query: { id: '1' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("where rm.id_reemb=$1"),
        ['1']
      );
      expect(mockJson).toHaveBeenCalledWith(reembolsoAceptado);
    });

    it('debería manejar array de IDs en buscar-reembolso-aceptado', async () => {
      const routeHandler = routes['GET:/buscar-reembolso-aceptado'];
      
      mockQuery.mockResolvedValue({
        rows: []
      });

      const mockReq = {
        query: { id: ['1', 'segundo', 'tercero'] }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['1'] // Debe tomar solo el primer elemento
      );
    });

    it('debería manejar error de base de datos en buscar-reembolso-aceptado', async () => {
      const routeHandler = routes['GET:/buscar-reembolso-aceptado'];
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockQuery.mockRejectedValue(new Error('Error de consulta aceptado'));

      const mockReq = {
        query: { id: '1' }
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error en consulta:", expect.any(Error));
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Error al obtener datos",
        error: "Error de consulta aceptado"
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('GET /buscar-reembolso-rechazado', () => {
    it('debería buscar reembolso rechazado exitosamente', async () => {
      const routeHandler = routes['GET:/buscar-reembolso-rechazado'];
      expect(routeHandler).toBeDefined();
      
      const reembolsoRechazado = [
        {
          fecha_revision: '2024-01-16',
          descripcion_revision: 'No cumple con los documentos requeridos'
        }
      ];
      
      mockQuery.mockResolvedValue({
        rows: reembolsoRechazado
      });

      const mockReq = {
        query: { id: '1' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("where rm.id_reemb= $1"),
        ['1']
      );
      expect(mockJson).toHaveBeenCalledWith(reembolsoRechazado);
    });

    it('debería manejar array de IDs en buscar-reembolso-rechazado', async () => {
      const routeHandler = routes['GET:/buscar-reembolso-rechazado'];
      
      mockQuery.mockResolvedValue({
        rows: []
      });

      const mockReq = {
        query: { id: ['1', 'otro'] }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['1'] // Debe tomar solo el primer elemento
      );
    });

    it('debería manejar error de base de datos en buscar-reembolso-rechazado', async () => {
      const routeHandler = routes['GET:/buscar-reembolso-rechazado'];
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockQuery.mockRejectedValue(new Error('Error de consulta rechazado'));

      const mockReq = {
        query: { id: '1' }
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error en consulta:", expect.any(Error));
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Error al obtener datos",
        error: "Error de consulta rechazado"
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Casos edge y validaciones adicionales', () => {
    it('debería manejar valores undefined en query params', async () => {
      const routeHandler = routes['GET:/buscar-reembolso-cliente'];
      
      mockQuery.mockResolvedValue({
        rows: []
      });

      const mockReq = {
        query: { id: undefined }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        [undefined]
      );
    });

    it('debería manejar diferentes fechas con dayjs', async () => {
      const routeHandler = routes['POST:/save-reembolso'];
      
      // Cambiar la fecha que retorna dayjs
      const dayjs = require('dayjs');
      dayjs().format.mockReturnValue('2025-06-25');
      
      mockQuery.mockResolvedValue({
        rows: [{ id_reemb: 789 }]
      });

      const mockReq = {
        body: REEMBOLSO_MOCK
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['2025-06-25', 'Accidente vehicular', 1, 1, 3]
      );
    });

    it('debería verificar estados correctos en revisiones', async () => {
      const routeHandlerAprobado = routes['POST:/save-revision-aprovado'];
      const routeHandlerRechazado = routes['POST:/save-revision-rechasada'];
      
      mockQuery.mockResolvedValue({
        rows: [{ id_revision: 1 }]
      });
      mockQuery.mockResolvedValue({
        rowCount: 1
      });

      // Verificar estado 6 para aprobado
      await routeHandlerAprobado({ body: REVISION_MOCK }, mockRes);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([6])
      );

      jest.clearAllMocks();
      mockQuery.mockResolvedValue({
        rows: [{ id_revision: 1 }]
      });
      mockQuery.mockResolvedValue({
        rowCount: 1
      });

      // Verificar estado 7 para rechazado
      await routeHandlerRechazado({ body: REVISION_MOCK }, mockRes);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([7])
      );
    });
  });

  describe('Verificación de configuración y rutas', () => {
    it('debería verificar que todas las rutas esperadas están registradas', () => {
      const rutasEsperadas = [
        'POST:/save-reembolso',
        'GET:/listar',
        'GET:/buscar-reembolso-cliente',
        'POST:/save-revision-aprovado',
        'POST:/save-revision-rechasada',
        'GET:/buscar-reembolso-aceptado',
        'GET:/buscar-reembolso-rechazado'
      ];

      rutasEsperadas.forEach(ruta => {
        expect(routes[ruta]).toBeDefined();
        expect(typeof routes[ruta]).toBe('function');
      });

      expect(Object.keys(routes).length).toBe(rutasEsperadas.length);
    });

    it('debería verificar que el módulo se exporta correctamente', () => {
      expect(routerInstance).toBeDefined();
    });

    it('debería verificar que dayjs fue mockeado correctamente', () => {
      const dayjs = require('dayjs');
      expect(dayjs).toBeDefined();
      expect(typeof dayjs).toBe('function');
    });
  });

  describe('Cobertura de consultas SQL complejas', () => {
    it('debería verificar la consulta JOIN completa en listar', async () => {
      const routeHandler = routes['GET:/listar'];
      
      mockQuery.mockResolvedValue({
        rows: REEMBOLSOS_LIST_MOCK,
        rowCount: 2
      });

      await routeHandler({}, mockRes);

      const queryCall = mockQuery.mock.calls[0][0];
      expect(queryCall).toContain('INNER JOIN seguros s ON r.id_seguro = s.id_seguro');
      expect(queryCall).toContain('INNER JOIN tipo_seguro tp ON tp.id_tip_seg = s.id_tip_seg');
      expect(queryCall).toContain('INNER JOIN estado e ON e.id_estado = r.id_estado');
      expect(queryCall).toContain('INNER JOIN cliente c ON c.id_pers = r.id_pers');
    });

    it('debería verificar consulta específica de reembolso aceptado', async () => {
      const routeHandler = routes['GET:/buscar-reembolso-aceptado'];
      
      mockQuery.mockResolvedValue({
        rows: []
      });

      await routeHandler({ query: { id: '1' } }, mockRes);

      const queryCall = mockQuery.mock.calls[0][0];
      expect(queryCall).toContain('FROM public.revision r');
      expect(queryCall).toContain('INNER JOIN cuenta_banco cb ON cb.id_cuent_Ban = s.id_cuent_Ban');
    });
  });
});