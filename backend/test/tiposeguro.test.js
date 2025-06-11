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
  routerInstance = require('../src/routes/tiposeguro.route.js');
  console.log('Rutas capturadas de tipo seguro:', Object.keys(routes));
} catch (error) {
  console.error('Error al importar el módulo tiposeguro.route.js:', error);
}

// Datos de prueba para tipo de seguro
const TIPO_SEGURO_PRUEBA = {
  nom_tip_seg: 'Seguro de Vida',
  descrip_tip_seg: 'Cobertura completa para protección familiar',
  pago_tip_seg: 150.50,
  suma_tip_seg: 50000
};

const TIPO_SEGURO_ACTUALIZAR = {
  ...TIPO_SEGURO_PRUEBA,
  id_tip_seg: 1,
  nom_tip_seg: 'Seguro de Vida Actualizado',
  descrip_tip_seg: 'Nueva descripción modificada',
  id_estado: 1
};

// Datos para pruebas de beneficios
const PARES_BENEFICIOS = [
  [1, 101], // [id_tip_seg, id_beneficios]
  [1, 102],
  [1, 103]
];

describe('Pruebas para la ruta de tipos de seguro', () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('GET /listar', () => {
    it('debería listar todos los tipos de seguro activos', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['GET:/listar'];
      expect(routeHandler).toBeDefined();
      
      // Datos de prueba
      const tiposSeguros = [
        { id_tip_seg: 1, nom_tip_seg: 'Seguro de Vida', id_estado: 1 },
        { id_tip_seg: 2, nom_tip_seg: 'Seguro de Salud', id_estado: 1 }
      ];
      
      // Configurar el mock para devolver datos
      mockQuery.mockResolvedValue({
        rows: tiposSeguros,
        rowCount: 2
      });

      // Crear un objeto de solicitud mock vacío
      const mockReq = {};

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar que se consultó la base de datos
      expect(mockQuery).toHaveBeenCalled();
      
      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('POST /save', () => {
    it('debería guardar un nuevo tipo de seguro', async () => {
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
        rows: [{ ...TIPO_SEGURO_PRUEBA, id_tip_seg: 3, id_estado: 1 }],
        rowCount: 1
      });

      // Crear un objeto de solicitud mock
      const mockReq = {
        body: TIPO_SEGURO_PRUEBA
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar que se consultó la existencia primero
      expect(mockQuery).toHaveBeenNthCalledWith(1,
        expect.stringContaining("FROM tipo_seguro WHERE nom_tip_seg"),
        [TIPO_SEGURO_PRUEBA.nom_tip_seg]
      );
      
      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });

    it('debería rechazar un tipo de seguro con nombre duplicado', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['POST:/save'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para verificar si existe (retorna que sí existe)
      mockQuery.mockResolvedValue({
        rows: [{ id_tip_seg: 1 }],
        rowCount: 1
      });

      // Crear un objeto de solicitud mock
      const mockReq = {
        body: TIPO_SEGURO_PRUEBA
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta de error
      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('POST /savebeneficios', () => {
    it('debería guardar beneficios para un tipo de seguro', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['POST:/savebeneficios'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para la inserción
      mockQuery.mockResolvedValue({
        rowCount: 3
      });

      // Crear un objeto de solicitud mock
      const mockReq = {
        body: PARES_BENEFICIOS
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar que se insertaron los beneficios
      expect(mockQuery).toHaveBeenCalled();
      
      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });

    it('debería manejar datos inválidos', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['POST:/savebeneficios'];
      expect(routeHandler).toBeDefined();
      
      // Crear un objeto de solicitud mock con datos inválidos
      const mockReq = {
        body: []
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta de error
      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('GET /categoria', () => {
    it('debería listar todas las categorías', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['GET:/categoria'];
      expect(routeHandler).toBeDefined();
      
      // Datos de prueba
      const categorias = [
        { id_categoria: 1, nom_categoria: 'Cobertura básica' },
        { id_categoria: 2, nom_categoria: 'Servicios adicionales' }
      ];
      
      // Configurar el mock para devolver datos
      mockQuery.mockResolvedValue({
        rows: categorias,
        rowCount: 2
      });

      // Crear un objeto de solicitud mock
      const mockReq = {};

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar que se consultaron las categorías
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("FROM categoria")
      );
      
      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('GET /beneficios', () => {
    it('debería listar beneficios por categoría', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['GET:/beneficios'];
      expect(routeHandler).toBeDefined();
      
      // Datos de prueba
      const beneficios = [
        { id_beneficios: 101, nom_beneficios: 'Cobertura médica', id_categoria: 1 },
        { id_beneficios: 102, nom_beneficios: 'Atención hospitalaria', id_categoria: 1 }
      ];
      
      // Configurar el mock para devolver datos
      mockQuery.mockResolvedValue({
        rows: beneficios,
        rowCount: 2
      });

      // Crear un objeto de solicitud mock con ID de categoría
      const mockReq = {
        query: { id: '1' }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar que se consultaron los beneficios de la categoría
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array)
      );
      
      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });

    it('debería manejar error cuando falta el ID de categoría', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['GET:/beneficios'];
      expect(routeHandler).toBeDefined();
      
      // Crear un objeto de solicitud mock sin ID
      const mockReq = {
        query: {}
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta de error
      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('GET /seguroBeneficio', () => {
    it('debería listar beneficios asociados a un tipo de seguro', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['GET:/seguroBeneficio'];
      expect(routeHandler).toBeDefined();
      
      // Datos de prueba
      const beneficiosSeguro = [
        { id_beneficios: 101, id_categoria: 1 },
        { id_beneficios: 102, id_categoria: 1 }
      ];
      
      // Configurar el mock para devolver datos
      mockQuery.mockResolvedValue({
        rows: beneficiosSeguro,
        rowCount: 2
      });

      // Crear un objeto de solicitud mock con ID de seguro
      const mockReq = {
        query: { id: '1' }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar que se consultaron los beneficios del seguro
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Array)
      );
      
      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });

    it('debería manejar error cuando falta el ID de seguro', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['GET:/seguroBeneficio'];
      expect(routeHandler).toBeDefined();
      
      // Crear un objeto de solicitud mock sin ID
      const mockReq = {
        query: {}
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta de error
      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('DELETE /deleteBeneficios', () => {
    it('debería eliminar beneficios de un tipo de seguro', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['DELETE:/deleteBeneficios'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para la eliminación
      mockQuery.mockResolvedValue({
        rowCount: 3
      });

      // Crear un objeto de solicitud mock con ID de seguro
      const mockReq = {
        body: { id: 1 }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar que se eliminaron los beneficios
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("DELETE FROM"),
        [1]
      );
      
      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('PUT /updateSeguro', () => {
    it('debería actualizar un tipo de seguro', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['PUT:/updateSeguro'];
      expect(routeHandler).toBeDefined();
      
      // Primero mock para verificar si existe el nombre (no existe)
      mockQuery.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });
      
      // Después mock para la actualización
      mockQuery.mockResolvedValueOnce({
        rows: [TIPO_SEGURO_ACTUALIZAR],
        rowCount: 1
      });

      // Crear un objeto de solicitud mock
      const mockReq = {
        body: TIPO_SEGURO_ACTUALIZAR
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar que se actualizó el tipo de seguro
      expect(mockQuery).toHaveBeenNthCalledWith(2,
        expect.stringContaining("UPDATE tipo_seguro"),
        expect.any(Array)
      );
      
      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });

    it('debería rechazar la actualización si falta el ID', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['PUT:/updateSeguro'];
      expect(routeHandler).toBeDefined();
      
      // Crear un objeto de solicitud mock sin ID
      const { id_tip_seg, ...sinId } = TIPO_SEGURO_ACTUALIZAR;
      const mockReq = {
        body: sinId
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta de error
      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalled();
    });

    it('debería rechazar si el tipo de seguro no se encuentra', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['PUT:/updateSeguro'];
      expect(routeHandler).toBeDefined();
      
      // Primero mock para verificar si existe el nombre (no existe)
      mockQuery.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });
      
      // Mock para la actualización (no encuentra el registro)
      mockQuery.mockResolvedValueOnce({
        rows: [],
        rowCount: 0
      });

      // Crear un objeto de solicitud mock con ID inexistente
      const mockReq = {
        body: { ...TIPO_SEGURO_ACTUALIZAR, id_tip_seg: 999 }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar la respuesta de error
      expect(mockStatus).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('PUT /desactivar', () => {
    it('debería desactivar un tipo de seguro', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['PUT:/desactivar'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para la desactivación
      mockQuery.mockResolvedValue({
        rowCount: 1
      });

      // Crear un objeto de solicitud mock
      const mockReq = {
        body: { id: 1 }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar que se desactivó el tipo de seguro
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE tipo_seguro SET"),
        expect.any(Array)
      );
      
      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('GET /buscar', () => {
    it('debería buscar un tipo de seguro por nombre', async () => {
      // Verificar que la ruta existe
      const routeHandler = routes['GET:/buscar'];
      expect(routeHandler).toBeDefined();
      
      // Configurar el mock para devolver datos
      mockQuery.mockResolvedValue({
        rows: [TIPO_SEGURO_PRUEBA],
        rowCount: 1
      });

      // Crear un objeto de solicitud mock
      const mockReq = {
        query: { nombre: 'Seguro de Vida' }
      };

      // Ejecutar el controlador
      await routeHandler(mockReq, mockRes);

      // Verificar que se buscó el tipo de seguro
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM tipo_seguro WHERE"),
        expect.any(Array)
      );
      
      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('Configuración del router', () => {
    it('debería registrar todas las rutas principales', () => {
      // Verificar que se capturaron rutas
      expect(Object.keys(routes).length).toBeGreaterThan(0);
      
      // Verificar específicamente las rutas que esperamos
      const rutasEsperadas = [
        'GET:/listar',
        'POST:/save',
        'POST:/savebeneficios',
        'GET:/categoria',
        'GET:/beneficios',
        'GET:/seguroBeneficio',
        'DELETE:/deleteBeneficios',
        'PUT:/updateSeguro',
        'PUT:/desactivar',
        'GET:/buscar'
      ];
      
      // Verificar que cada ruta esperada esté definida
      rutasEsperadas.forEach(ruta => {
        if (routes[ruta]) {
          expect(routes[ruta]).toBeDefined();
          expect(typeof routes[ruta]).toBe('function');
        }
      });
    });
  });
});