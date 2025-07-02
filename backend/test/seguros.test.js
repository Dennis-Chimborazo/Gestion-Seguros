import { jest } from '@jest/globals';

// 1. Mocks mejorados para Express y respuesta HTTP
const mockJson = jest.fn().mockReturnThis();
const mockStatus = jest.fn().mockReturnThis();
const mockRes = { 
  json: mockJson, 
  status: mockStatus,
  setHeader: jest.fn()
};

// 2. Mock completo para Express Router
const mockRouter = {
  routes: {},
  _methods: {},
  get: jest.fn(function(path, ...handlers) {
    this.routes[`GET:${path}`] = handlers.pop();
    this._methods[`GET:${path}`] = handlers; // Middlewares
    return this;
  }),
  post: jest.fn(function(path, ...handlers) {
    this.routes[`POST:${path}`] = handlers.pop();
    this._methods[`POST:${path}`] = handlers;
    return this;
  }),
  put: jest.fn(function(path, ...handlers) {
    this.routes[`PUT:${path}`] = handlers.pop();
    this._methods[`PUT:${path}`] = handlers;
    return this;
  }),
  delete: jest.fn(function(path, ...handlers) {
    this.routes[`DELETE:${path}`] = handlers.pop();
    this._methods[`DELETE:${path}`] = handlers;
    return this;
  }),
  use: jest.fn() // Para middlewares globales
};

// 3. Mock para JWT
const mockJwt = {
  sign: jest.fn().mockReturnValue('mocked-token'),
  verify: jest.fn().mockImplementation((token, secret, cb) => {
    cb(null, { id_seguro: 1, id_pers: 1 }); // Mock verification success
  })
};

// 4. Mock para la base de datos
const mockQuery = jest.fn();
const mockDb = {
  query: mockQuery,
  release: jest.fn()
};

// 5. Configuración de mocks globales
beforeAll(() => {
  jest.mock('express', () => ({
    Router: () => mockRouter
  }));
  
  jest.mock('jsonwebtoken', () => mockJwt);
  
  jest.mock('../src/database.js', () => ({
    DataBase: jest.fn().mockImplementation(() => ({
      getConexion: jest.fn().mockResolvedValue(mockDb)
    }))
  }));
});

// 6. Importar el router después de configurar los mocks
const router = require('../src/routes/seguros.routes.js');

// 7. Limpieza entre pruebas
beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockReset();
});

// 8. Pruebas principales
describe('Pruebas para seguros.routes.js', () => {
  describe('POST /save', () => {
    const validBody = {
      ciud_seguro: "Quito",
      dia_seguro: 15,
      mes_seguro: 6,
      anio_seguro: 2023,
      firma_seguro: true,
      id_pers: 1
    };

    it('debería guardar un seguro exitosamente', async () => {
      mockQuery.mockResolvedValue({ rows: [{ id_seguro: 1 }] });
      
      await mockRouter.routes['POST:/save']({ body: validBody }, mockRes);
      
      expect(mockQuery).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        message: "Seguro guardado exitosamente",
        data: { rows: [{ id_seguro: 1 }] }
      });
    });

    it('debería manejar errores de base de datos', async () => {
      mockQuery.mockRejectedValue(new Error('Database error'));
      
      await mockRouter.routes['POST:/save']({ body: validBody }, mockRes);
      
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Error al guardar seguro",
        error: expect.any(Error)
      });
    });

    it('debería validar datos faltantes', async () => {
      await mockRouter.routes['POST:/save']({ body: {} }, mockRes);
      expect(mockStatus).toHaveBeenCalledWith(400);
    });
  });

  describe('GET /listar', () => {
    it('debería listar seguros exitosamente', async () => {
      const mockSeguros = [
        { id_seguro: 1, monto_seguro: 1000 },
        { id_seguro: 2, monto_seguro: 2000 }
      ];
      
      mockQuery.mockResolvedValue({ rows: mockSeguros, rowCount: 2 });
      
      await mockRouter.routes['GET:/listar']({ query: { id: 1 } }, mockRes);
      
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT s.id_seguro'),
        [1]
      );
      expect(mockJson).toHaveBeenCalledWith({
        rows: mockSeguros,
        rowCount: 2
      });
    });
  });

  describe('POST /generar_token_contr', () => {
    it('debería generar token correctamente', async () => {
      const mockBody = {
        id_seguro: 1,
        url: "http://test.com",
        id_pers: 1
      };
      
      mockQuery.mockResolvedValue({ rowCount: 1 });
      
      await mockRouter.routes['POST:/generar_token_contr']({ body: mockBody }, mockRes);
      
      expect(mockJwt.sign).toHaveBeenCalledWith(
        { id_seguro: 1, id_pers: 1 },
        "nuevacontratacion",
        { expiresIn: "24h" }
      );
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        token: 'mocked-token',
        message: "Token creado y guardado exitosamente."
      });
    });
  });

  describe('POST /validar-token-contr', () => {
    it('debería validar token correctamente', async () => {
      const mockTokenData = { 
        token_val_contra: 'valid-token', 
        id_val_contra: 1 
      };
      
      mockQuery
        .mockResolvedValueOnce({ rowCount: 1, rows: [mockTokenData] })
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // Cliente
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Seguro
      
      await mockRouter.routes['POST:/validar-token-contr']({ 
        body: { url: "test-url" } 
      }, mockRes);
      
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Token válido.",
        data: { id_seguro: 1, id_pers: 1 },
        client: [{ id: 1 }],
        contr: [{ id: 1 }],
        idvalid: 1
      });
    });
  });

  describe('PUT /activar-seguro', () => {
    const validBody = { id: 1, idvalid: 1 };

    it('debería activar seguro correctamente', async () => {
      mockQuery
        .mockResolvedValueOnce({ rowCount: 1 }) // Update
        .mockResolvedValueOnce({ rowCount: 1 }); // Delete
      
      await mockRouter.routes['PUT:/activar-seguro']({ body: validBody }, mockRes);
      
      expect(mockJson).toHaveBeenCalledWith({
        message: "Contrato de seguro valiado correctamente."
      });
    });

    it('debería manejar contratación no encontrada', async () => {
      mockQuery.mockResolvedValue({ rowCount: 0 });
      
      await mockRouter.routes['PUT:/activar-seguro']({ body: validBody }, mockRes);
      
      expect(mockStatus).toHaveBeenCalledWith(404);
    });
  });

  // Pruebas para otras rutas...
});

// 9. Verificación de configuración de rutas
describe('Configuración de rutas', () => {
  it('debería tener todas las rutas registradas', () => {
    const expectedRoutes = [
      'POST:/save',
      'GET:/listar',
      'POST:/personafac/save',
      'POST:/cuentabanco/save',
      'POST:/saveSeguro',
      'POST:/saveDependientes',
      'POST:/generar_token_contr',
      'POST:/validar-token-contr',
      'PUT:/activar-seguro'
    ];
    
    expectedRoutes.forEach(route => {
      expect(mockRouter.routes[route]).toBeDefined();
    });
  });
});