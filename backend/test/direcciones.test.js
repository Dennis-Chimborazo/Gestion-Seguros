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
  routerInstance = require('../src/routes/direcciones.routes.js');
  console.log('Rutas capturadas de direcciones:', Object.keys(routes));
} catch (error) {
  console.error('Error al importar el módulo direcciones.routes.js:', error);
}

// Datos de prueba
const PAISES_MOCK = [
  { id_pais: 1, nom_pais: 'Ecuador' },
  { id_pais: 2, nom_pais: 'Colombia' },
  { id_pais: 3, nom_pais: 'Perú' }
];

const PROVINCIAS_MOCK = [
  { id_provin: 1, nom_provin: 'Tungurahua', id_pais: 1 },
  { id_provin: 2, nom_provin: 'Pichincha', id_pais: 1 },
  { id_provin: 3, nom_provin: 'Guayas', id_pais: 1 }
];

const CIUDADES_MOCK = [
  { id_ciud: 1, nom_ciud: 'Ambato', id_provin: 1 },
  { id_ciud: 2, nom_ciud: 'Quito', id_provin: 2 },
  { id_ciud: 3, nom_ciud: 'Guayaquil', id_provin: 3 }
];

const CLIENT_DATA_MOCK = [
  {
    id_ciud: 1,
    nom_ciud: 'Ambato',
    id_provin: 1,
    nom_provin: 'Tungurahua',
    id_pais: 1,
    nom_pais: 'Ecuador'
  }
];

describe('Pruebas unitarias para la ruta de direcciones', () => {
  
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('GET /pais', () => {
    it('debería retornar la lista de países exitosamente', async () => {
      const routeHandler = routes['GET:/pais'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para devolver datos de países
      mockQuery.mockResolvedValue({
        rows: PAISES_MOCK,
        rowCount: 3
      });

      const mockReq = {};
      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM pais");
      expect(mockJson).toHaveBeenCalledWith({
        rows: PAISES_MOCK,
        rowCount: 3
      });
    });

    it('debería manejar errores en la consulta de países', async () => {
      const routeHandler = routes['GET:/pais'];
      
      mockQuery.mockRejectedValue(new Error('Error de base de datos'));

      const mockReq = {};
      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Error al obtener datos",
        error: new Error('Error de base de datos')
      });
    });
  });

  describe('GET /provincia', () => {
    it('debería retornar provincias por ID de país exitosamente', async () => {
      const routeHandler = routes['GET:/provincia'];
      expect(routeHandler).toBeDefined();
      
      mockQuery.mockResolvedValue({
        rows: PROVINCIAS_MOCK,
        rowCount: 3
      });

      const mockReq = {
        query: { id: '1' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM provincia WHERE id_pais = $1",
        ['1']
      );
      expect(mockJson).toHaveBeenCalledWith(PROVINCIAS_MOCK);
    });

    it('debería manejar array de IDs en provincia', async () => {
      const routeHandler = routes['GET:/provincia'];
      
      mockQuery.mockResolvedValue({
        rows: PROVINCIAS_MOCK,
        rowCount: 3
      });

      const mockReq = {
        query: { id: ['1', 'extra'] }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM provincia WHERE id_pais = $1",
        ['1'] // Debe tomar solo el primer elemento
      );
      expect(mockJson).toHaveBeenCalledWith(PROVINCIAS_MOCK);
    });

    it('debería fallar si no se proporciona el ID de país', async () => {
      const routeHandler = routes['GET:/provincia'];
      
      const mockReq = {
        query: {}
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "El parámetro 'pais' es requerido"
      });
    });

    it('debería fallar si se proporciona ID undefined', async () => {
      const routeHandler = routes['GET:/provincia'];
      
      const mockReq = {
        query: { id: undefined }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "El parámetro 'pais' es requerido"
      });
    });

    it('debería fallar si se proporciona ID null', async () => {
      const routeHandler = routes['GET:/provincia'];
      
      const mockReq = {
        query: { id: null }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "El parámetro 'pais' es requerido"
      });
    });

    it('debería fallar si se proporciona ID vacío', async () => {
      const routeHandler = routes['GET:/provincia'];
      
      const mockReq = {
        query: { id: '' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "El parámetro 'pais' es requerido"
      });
    });

    it('debería manejar errores en la consulta de provincias', async () => {
      const routeHandler = routes['GET:/provincia'];
      
      mockQuery.mockRejectedValue(new Error('Error de consulta provincia'));

      const mockReq = {
        query: { id: '1' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Error al obtener datos",
        error: new Error('Error de consulta provincia')
      });
    });
  });

  describe('GET /ciudad', () => {
    it('debería retornar ciudades por ID de provincia exitosamente', async () => {
      const routeHandler = routes['GET:/ciudad'];
      expect(routeHandler).toBeDefined();
      
      mockQuery.mockResolvedValue({
        rows: CIUDADES_MOCK,
        rowCount: 3
      });

      const mockReq = {
        query: { id: '1' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM ciudad WHERE id_provin = $1",
        ['1']
      );
      expect(mockJson).toHaveBeenCalledWith(CIUDADES_MOCK);
    });

    it('debería manejar array de IDs en ciudad', async () => {
      const routeHandler = routes['GET:/ciudad'];
      
      mockQuery.mockResolvedValue({
        rows: CIUDADES_MOCK,
        rowCount: 3
      });

      const mockReq = {
        query: { id: ['1', 'segundo', 'tercero'] }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM ciudad WHERE id_provin = $1",
        ['1'] // Debe tomar solo el primer elemento
      );
      expect(mockJson).toHaveBeenCalledWith(CIUDADES_MOCK);
    });

    it('debería fallar si no se proporciona el ID de provincia', async () => {
      const routeHandler = routes['GET:/ciudad'];
      
      const mockReq = {
        query: {}
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "El parámetro 'provincia' es requerido"
      });
    });

    it('debería fallar si se proporciona ID undefined en ciudad', async () => {
      const routeHandler = routes['GET:/ciudad'];
      
      const mockReq = {
        query: { id: undefined }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "El parámetro 'provincia' es requerido"
      });
    });

    it('debería fallar si se proporciona ID null en ciudad', async () => {
      const routeHandler = routes['GET:/ciudad'];
      
      const mockReq = {
        query: { id: null }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "El parámetro 'provincia' es requerido"
      });
    });

    it('debería fallar si se proporciona ID vacío en ciudad', async () => {
      const routeHandler = routes['GET:/ciudad'];
      
      const mockReq = {
        query: { id: '' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "El parámetro 'provincia' es requerido"
      });
    });

    it('debería manejar errores en la consulta de ciudades', async () => {
      const routeHandler = routes['GET:/ciudad'];
      
      mockQuery.mockRejectedValue(new Error('Error de consulta ciudad'));

      const mockReq = {
        query: { id: '1' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Error al obtener datos dd",
        error: new Error('Error de consulta ciudad')
      });
    });
  });

  describe('GET /client', () => {
    it('debería retornar información completa de la ciudad exitosamente', async () => {
      const routeHandler = routes['GET:/client'];
      expect(routeHandler).toBeDefined();
      
      mockQuery.mockResolvedValue({
        rows: CLIENT_DATA_MOCK,
        rowCount: 1
      });

      const mockReq = {
        query: { id: '1' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT c.nom_ciud,c.id_ciud,p.nom_provin,p.id_provin,a.nom_pais,a.id_pais FROM ciudad c INNER JOIN provincia p ON p.id_provin=c.id_provin INNER JOIN pais a ON p.id_pais=a.id_pais WHERE c.id_ciud=$1",
        ['1']
      );
      expect(mockJson).toHaveBeenCalledWith(CLIENT_DATA_MOCK);
    });

    it('debería manejar array de IDs en client', async () => {
      const routeHandler = routes['GET:/client'];
      
      mockQuery.mockResolvedValue({
        rows: CLIENT_DATA_MOCK,
        rowCount: 1
      });

      const mockReq = {
        query: { id: ['1', 'otro', 'mas'] }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE c.id_ciud=$1"),
        ['1'] // Debe tomar solo el primer elemento
      );
      expect(mockJson).toHaveBeenCalledWith(CLIENT_DATA_MOCK);
    });

    it('debería fallar si no se proporciona el ID de ciudad', async () => {
      const routeHandler = routes['GET:/client'];
      
      const mockReq = {
        query: {}
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "El parámetro 'ciudad' es requerido"
      });
    });

    it('debería fallar si se proporciona ID undefined en client', async () => {
      const routeHandler = routes['GET:/client'];
      
      const mockReq = {
        query: { id: undefined }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "El parámetro 'ciudad' es requerido"
      });
    });

    it('debería fallar si se proporciona ID null en client', async () => {
      const routeHandler = routes['GET:/client'];
      
      const mockReq = {
        query: { id: null }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "El parámetro 'ciudad' es requerido"
      });
    });

    it('debería fallar si se proporciona ID vacío en client', async () => {
      const routeHandler = routes['GET:/client'];
      
      const mockReq = {
        query: { id: '' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "El parámetro 'ciudad' es requerido"
      });
    });

    it('debería manejar errores en la consulta de client', async () => {
      const routeHandler = routes['GET:/client'];
      
      mockQuery.mockRejectedValue(new Error('Error de consulta client'));

      const mockReq = {
        query: { id: '1' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Error al obtener datos dd",
        error: new Error('Error de consulta client')
      });
    });

    it('debería retornar array vacío si no encuentra la ciudad', async () => {
      const routeHandler = routes['GET:/client'];
      
      mockQuery.mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      const mockReq = {
        query: { id: '999' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith([]);
    });
  });

  describe('Casos edge y validaciones especiales', () => {
    it('debería manejar query params con espacios en provincia', async () => {
      const routeHandler = routes['GET:/provincia'];
      
      mockQuery.mockResolvedValue({
        rows: PROVINCIAS_MOCK,
        rowCount: 3
      });

      const mockReq = {
        query: { id: '  1  ' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM provincia WHERE id_pais = $1",
        ['  1  '] // El valor se pasa tal como viene
      );
    });

    it('debería manejar query params con espacios en ciudad', async () => {
      const routeHandler = routes['GET:/ciudad'];
      
      mockQuery.mockResolvedValue({
        rows: CIUDADES_MOCK,
        rowCount: 3
      });

      const mockReq = {
        query: { id: '  1  ' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM ciudad WHERE id_provin = $1",
        ['  1  ']
      );
    });

    it('debería manejar query params con espacios en client', async () => {
      const routeHandler = routes['GET:/client'];
      
      mockQuery.mockResolvedValue({
        rows: CLIENT_DATA_MOCK,
        rowCount: 1
      });

      const mockReq = {
        query: { id: '  1  ' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE c.id_ciud=$1"),
        ['  1  ']
      );
    });

    it('debería manejar arrays vacíos como falsy en provincia', async () => {
      const routeHandler = routes['GET:/provincia'];
      
      // Un array vacío es truthy en JS, pero el primer elemento será undefined
      const mockReq = {
        query: { id: [] }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "El parámetro 'pais' es requerido"
      });
    });

    it('debería manejar arrays vacíos como falsy en ciudad', async () => {
      const routeHandler = routes['GET:/ciudad'];
      
      const mockReq = {
        query: { id: [] }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "El parámetro 'provincia' es requerido"
      });
    });

    it('debería manejar arrays vacíos como falsy en client', async () => {
      const routeHandler = routes['GET:/client'];
      
      const mockReq = {
        query: { id: [] }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "El parámetro 'ciudad' es requerido"
      });
    });
  });

  describe('Verificación de configuración y rutas', () => {
    it('debería verificar que todas las rutas esperadas están registradas', () => {
      const rutasEsperadas = [
        'GET:/pais',
        'GET:/provincia',
        'GET:/ciudad',
        'GET:/client'
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

    it('debería verificar que todas las rutas son GET', () => {
      Object.keys(routes).forEach(ruta => {
        expect(ruta).toMatch(/^GET:/);
      });
    });
  });

  describe('Cobertura de todas las ramas condicionales', () => {
    it('debería cubrir todas las condiciones falsy en provincia', async () => {
      const routeHandler = routes['GET:/provincia'];
      
      const valoresFalsy = [undefined, null, '', 0, false, NaN];
      
      for (const valor of valoresFalsy) {
        jest.clearAllMocks();
        
        const mockReq = {
          query: { id: valor }
        };

        await routeHandler(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          message: "El parámetro 'pais' es requerido"
        });
      }
    });

    it('debería cubrir todas las condiciones falsy en ciudad', async () => {
      const routeHandler = routes['GET:/ciudad'];
      
      const valoresFalsy = [undefined, null, '', 0, false, NaN];
      
      for (const valor of valoresFalsy) {
        jest.clearAllMocks();
        
        const mockReq = {
          query: { id: valor }
        };

        await routeHandler(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          message: "El parámetro 'provincia' es requerido"
        });
      }
    });

    it('debería cubrir todas las condiciones falsy en client', async () => {
      const routeHandler = routes['GET:/client'];
      
      const valoresFalsy = [undefined, null, '', 0, false, NaN];
      
      for (const valor of valoresFalsy) {
        jest.clearAllMocks();
        
        const mockReq = {
          query: { id: valor }
        };

        await routeHandler(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          message: "El parámetro 'ciudad' es requerido"
        });
      }
    });
  });
});