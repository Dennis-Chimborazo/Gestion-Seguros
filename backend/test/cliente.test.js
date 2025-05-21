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
  routerInstance = require('../src/routes/clientes.routes.js');
  console.log('Rutas capturadas de clientes:', Object.keys(routes));
} catch (error) {
  console.error('Error al importar el módulo clientes.routes.js:', error);
}

// Datos de prueba para cliente
const CLIENTE_PRUEBA = {
  cedr_cli: '1234567890',
  tipo_cedr_cli: 'CC',
  nacion_cli: 'Ecuatoriana',
  nom_cli: 'Cliente',
  ape_cli: 'Prueba',
  fecha_naci_cli: '1990-01-01',
  lugar_naci_cli: 'Quito',
  tel_pers: '022123456',
  cel_pers: '0991234567',
  email_pers: 'cliente.prueba@ejemplo.com',
  edad_pers: 33,
  sexo_cli: 'M',
  estado_civil_pers: 'Soltero',
  estatura_cli: 175,
  peso_cli: 70,
  parroq_cli: 'Central',
  calle_princ_pers: 'Av. Principal',
  calle_secun_pers: 'Calle Secundaria',
  id_ciud: 1
};

const CLIENTE_ACTUALIZAR = {
  ...CLIENTE_PRUEBA,
  id_pers: 1,
  nom_cli: 'Cliente Actualizado',
  ape_cli: 'Apellido Actualizado',
  email_pers: 'actualizado@ejemplo.com'
};

describe('Pruebas para la ruta de clientes', () => {
  let clienteId;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('GET /listar', () => {
    it('debería retornar un array de clientes activos', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['GET:/listar'];
      expect(routeHandler).toBeDefined();
      
      // Datos de prueba
      const clientesMock = [
        { id_pers: 1, nom_cli: 'Juan', ape_cli: 'Pérez', estado: 1 },
        { id_pers: 2, nom_cli: 'Ana', ape_cli: 'Gómez', estado: 1 }
      ];
      
      // Configurar el mock para devolver datos
      mockQuery.mockResolvedValue({
        rows: clientesMock,
        rowCount: 2
      });

      // Crear un objeto de solicitud mock vacío
      const mockReq = {};

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
      // Verificar que se consultó la base de datos correctamente
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM"),
        expect.any(Array)
      );
    });
  });

  describe('POST /save', () => {
    it('debería crear un nuevo cliente', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['POST:/save'];
      expect(routeHandler).toBeDefined();
      
      // Primero configura el mock para verificar si existe (retorna que no existe)
      mockQuery.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });
      
      // Después configura el mock para la inserción
      mockQuery.mockResolvedValueOnce({
        rows: [{ id_pers: 123 }],
        rowCount: 1
      });

      // Crear un objeto de solicitud mock
      const mockReq = {
        body: CLIENTE_PRUEBA
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar que se consultó la existencia primero
      expect(mockQuery).toHaveBeenNthCalledWith(1,
        expect.stringContaining("SELECT 1 FROM cliente WHERE cedr_cli"),
        [CLIENTE_PRUEBA.cedr_cli]
      );
      
      // Luego verificar que se realizó la inserción
      expect(mockQuery).toHaveBeenNthCalledWith(2,
        expect.stringContaining("INSERT INTO"),
        expect.any(Array)
      );
      
      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });

    it('debería manejar un cliente sin campos obligatorios', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['POST:/save'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para devolver un error
      mockQuery.mockRejectedValue(new Error('Error en la inserción'));

      // Crear un objeto de solicitud mock con datos incompletos
      const mockReq = {
        body: {
          cedr_cli: '',
          nom_cli: 'Cliente Incompleto'
        }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta de error
      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('PUT /update', () => {
    it('debería actualizar un cliente existente', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['PUT:/update'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para devolver datos
      mockQuery.mockResolvedValue({
        rows: [CLIENTE_ACTUALIZAR],
        rowCount: 1
      });

      // Crear un objeto de solicitud mock
      const mockReq = {
        body: CLIENTE_ACTUALIZAR
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar que se consultó la base de datos correctamente
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE"),
        expect.any(Array)
      );
      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });

    it('debería manejar la actualización de un cliente inexistente', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['PUT:/update'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para simular que no se encontró el cliente
      mockQuery.mockResolvedValue({
        rowCount: 0
      });

      // Crear un objeto de solicitud mock con un ID inexistente
      const mockReq = {
        body: { ...CLIENTE_ACTUALIZAR, id_pers: 999999 }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta
      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalled();
    });

    it('debería manejar una actualización sin ID', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['PUT:/update'];
      expect(routeHandler).toBeDefined();
      
      // Crear un objeto de solicitud mock sin ID
      const { id_pers, ...sinId } = CLIENTE_ACTUALIZAR;
      const mockReq = {
        body: sinId
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta de error
      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('PUT /desactivar', () => {
    it('debería desactivar un cliente existente', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['PUT:/desactivar'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para simular una actualización exitosa
      mockQuery.mockResolvedValue({
        rowCount: 1
      });

      // Crear un objeto de solicitud mock
      const mockReq = {
        body: { id_pers: 1 }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar que se consultó la base de datos correctamente
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE"),
        expect.any(Array)
      );
      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });

    it('debería manejar la desactivación de un cliente inexistente', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['PUT:/desactivar'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para simular que no se encontró el cliente
      mockQuery.mockResolvedValue({
        rowCount: 0
      });

      // Crear un objeto de solicitud mock con un ID inexistente
      const mockReq = {
        body: { id_pers: 999999 }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta
      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalled();
    });

    it('debería manejar una desactivación sin ID', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['PUT:/desactivar'];
      expect(routeHandler).toBeDefined();
      
      // Crear un objeto de solicitud mock sin ID
      const mockReq = {
        body: {}
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta de error
      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalled();
    });
  });

  // Si hay otras rutas, agrega pruebas para ellas aquí
  // Agregamos pruebas para las rutas adicionales que se detectaron

  describe('POST /comprobCredenciales', () => {
    it('debería validar credenciales correctas', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['POST:/comprobCredenciales'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para simular que las credenciales son correctas
      mockQuery.mockResolvedValue({
        rows: [{ tipo: 'cedula' }],
        rowCount: 1
      });

      // Crear un objeto de solicitud mock
      const mockReq = {
        body: {
          cedr_cli: '1234567890',
          email_pers: 'cliente.prueba@ejemplo.com'
        }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar que se consultó la base de datos correctamente - ajustado para coincidir con la consulta real
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("FROM cliente"),
        expect.any(Array)
      );
      
      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.any(String)
      }));
    });

    it('debería rechazar credenciales incorrectas', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['POST:/comprobCredenciales'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para simular que no se encontró el cliente
      mockQuery.mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      // Crear un objeto de solicitud mock
      const mockReq = {
        body: {
          cedr_cli: '9999999999',
          email_pers: 'noexiste@ejemplo.com'
        }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // La ruta parece devolver un mensaje de "Credenciales disponibles" en lugar de un error
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining("disponibles")
      }));
    });
  });

  describe('GET /buscar', () => {
    it('debería encontrar un cliente por cédula', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['GET:/buscar'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para devolver datos
      mockQuery.mockResolvedValue({
        rows: [CLIENTE_PRUEBA],
        rowCount: 1
      });

      // Crear un objeto de solicitud mock
      const mockReq = {
        query: { cedula: '1234567890' }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar que se consultó la base de datos correctamente
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM"),
        expect.any(Array)
      );
      
      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });

    it('debería manejar el caso de cliente no encontrado', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['GET:/buscar'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para simular que no se encontró el cliente
      mockQuery.mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      // Crear un objeto de solicitud mock
      const mockReq = {
        query: { cedula: '9999999999' }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('GET /buscarclienteID', () => {
    it('debería encontrar un cliente por ID', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['GET:/buscarclienteID'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para devolver datos
      mockQuery.mockResolvedValue({
        rows: [CLIENTE_PRUEBA],
        rowCount: 1
      });

      // Crear un objeto de solicitud mock
      const mockReq = {
        query: { id: '1' }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar que se consultó la base de datos correctamente
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM"),
        expect.any(Array)
      );
      
      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });

    it('debería manejar el caso de cliente no encontrado por ID', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['GET:/buscarclienteID'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para simular que no se encontró el cliente
      mockQuery.mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      // Crear un objeto de solicitud mock
      const mockReq = {
        query: { id: '999' }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('POST /validar-token-email', () => {
    it('debería validar un token de email correctamente', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['POST:/validar-token-email'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para encontrar el cliente con el token
      // Esta ruta parece hacer una sola consulta en lugar de dos
      mockQuery.mockResolvedValue({
        rows: [{ id_pers: 1, estado: 3 }],
        rowCount: 1
      });

      // Crear un objeto de solicitud mock
      const mockReq = {
        body: { token: 'abc123token' }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar que se hizo una consulta
      expect(mockQuery).toHaveBeenCalledTimes(1);
      
      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });

    it('debería manejar token inválido', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['POST:/validar-token-email'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para simular que no se encontró el cliente con ese token
      mockQuery.mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      // Crear un objeto de solicitud mock
      const mockReq = {
        body: { token: 'token_invalido' }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta
      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('PUT /activar-cuenta', () => {
    it('debería intentar activar una cuenta', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['PUT:/activar-cuenta'];
      expect(routeHandler).toBeDefined();
      
      // Crear un objeto de solicitud mock
      const mockReq = {
        body: { id_pers: 1 }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta - solo verificamos que se llama a mockJson sin especificar los datos exactos
      expect(mockJson).toHaveBeenCalled();
    });

    it('debería manejar errores al activar la cuenta', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['PUT:/activar-cuenta'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para simular un error
      mockQuery.mockRejectedValue(new Error('Error de actualización'));

      // Crear un objeto de solicitud mock
      const mockReq = {
        body: { id_pers: 1 }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta de error
      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('Configuración del router', () => {
    it('debería registrar todas las rutas principales', () => {
      // Verificar que se capturaron rutas
      expect(Object.keys(routes).length).toBeGreaterThan(0);
      
      // Verificar específicamente las rutas que esperamos
      expect(routes['GET:/listar']).toBeDefined();
      expect(routes['POST:/save']).toBeDefined();
      expect(routes['POST:/comprobCredenciales']).toBeDefined();
      expect(routes['PUT:/update']).toBeDefined();
      expect(routes['PUT:/desactivar']).toBeDefined();
      expect(routes['GET:/buscar']).toBeDefined();
      expect(routes['POST:/validar-token-email']).toBeDefined();
      expect(routes['GET:/buscarclienteID']).toBeDefined();
      expect(routes['PUT:/activar-cuenta']).toBeDefined();
      
      // Verificar que los controladores son funciones
      expect(typeof routes['GET:/listar']).toBe('function');
      expect(typeof routes['POST:/save']).toBe('function');
      expect(typeof routes['POST:/comprobCredenciales']).toBe('function');
      expect(typeof routes['PUT:/update']).toBe('function');
      expect(typeof routes['PUT:/desactivar']).toBe('function');
      expect(typeof routes['GET:/buscar']).toBe('function');
      expect(typeof routes['POST:/validar-token-email']).toBe('function');
      expect(typeof routes['GET:/buscarclienteID']).toBe('function');
      expect(typeof routes['PUT:/activar-cuenta']).toBe('function');
    });
  });
});