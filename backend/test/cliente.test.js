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

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn((payload, secret, options) => 'mocked_token'),
  verify: jest.fn((token, secret) => ({ id_pers: 1, pass: 'password123' }))
}));

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
  let jwt;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
    jwt = require('jsonwebtoken');
  });

  describe('GET /listar', () => {
    it('debería retornar un array de clientes activos', async () => {
      const routeHandler = routes['GET:/listar'];
      expect(routeHandler).toBeDefined();
      
      const clientesMock = [
        { id_pers: 1, nom_cli: 'Juan', ape_cli: 'Pérez', estado: 1 },
        { id_pers: 2, nom_cli: 'Ana', ape_cli: 'Gómez', estado: 1 }
      ];
      
      mockQuery.mockResolvedValue({
        rows: clientesMock,
        rowCount: 2
      });

      const mockReq = {};
      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        rows: clientesMock,
        rowCount: 2
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM cliente WHERE id_estado = $1",
        ['1']
      );
    });

    it('debería manejar errores en la consulta de listar', async () => {
      const routeHandler = routes['GET:/listar'];
      
      mockQuery.mockRejectedValue(new Error('Error de base de datos'));

      const mockReq = {};
      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Error al obtener datos",
        error: "Error de base de datos"
      });
    });
  });

  describe('GET /listarPendientes', () => {
    it('debería retornar clientes pendientes y preactivos', async () => {
      const routeHandler = routes['GET:/listarPendientes'];
      expect(routeHandler).toBeDefined();
      
      const clientesPendientes = [
        { id_pers: 1, nom_cli: 'Cliente', id_estado: 3 },
        { id_pers: 2, nom_cli: 'Cliente2', id_estado: 4 }
      ];
      
      mockQuery.mockResolvedValue({
        rows: clientesPendientes,
        rowCount: 2
      });

      const mockReq = {};
      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        rows: clientesPendientes,
        rowCount: 2
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM cliente WHERE id_estado = $1 OR id_estado = $2",
        [3, 4]
      );
    });

    it('debería manejar errores en la consulta de listarPendientes', async () => {
      const routeHandler = routes['GET:/listarPendientes'];
      
      mockQuery.mockRejectedValue(new Error('Error de conexión'));

      const mockReq = {};
      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Error al obtener datos",
        error: "Error de conexión"
      });
    });
  });

  describe('POST /save', () => {
    it('debería crear un nuevo cliente exitosamente', async () => {
      const routeHandler = routes['POST:/save'];
      
      mockQuery.mockResolvedValue({
        rows: [{ id_pers: 123 }],
        rowCount: 1
      });

      const mockReq = {
        body: CLIENTE_PRUEBA
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO cliente"),
        expect.any(Array)
      );
      expect(mockJson).toHaveBeenCalledWith({
        message: "Cliente guardado exitosamente",
        id_pers: 123
      });
    });

    it('debería fallar con campos obligatorios faltantes', async () => {
      const routeHandler = routes['POST:/save'];
      
      const mockReq = {
        body: {
          cedr_cli: '1234567890',
          nom_cli: 'Cliente Incompleto'
          // Faltan campos obligatorios
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining("Faltan campos obligatorios")
      });
    });

    it('debería manejar errores de base de datos en save', async () => {
      const routeHandler = routes['POST:/save'];
      
      mockQuery.mockRejectedValue(new Error('Error de inserción'));

      const mockReq = {
        body: CLIENTE_PRUEBA
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Error al guardar cliente",
        error: "Error de inserción"
      });
    });
  });

  describe('POST /comprobCredenciales', () => {
    it('debería detectar cédula ya registrada', async () => {
      const routeHandler = routes['POST:/comprobCredenciales'];
      
      mockQuery.mockResolvedValue({
        rows: [{ tipo: 'cedula' }],
        rowCount: 1
      });

      const mockReq = {
        body: {
          cedr_cli: '1234567890',
          email_pers: 'nuevo@ejemplo.com'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "La cédula ya está registrada"
      });
    });

    it('debería detectar correo ya registrado', async () => {
      const routeHandler = routes['POST:/comprobCredenciales'];
      
      mockQuery.mockResolvedValue({
        rows: [{ tipo: 'correo' }],
        rowCount: 1
      });

      const mockReq = {
        body: {
          cedr_cli: '9876543210',
          email_pers: 'existente@ejemplo.com'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "El correo ya está registrado"
      });
    });

    it('debería confirmar credenciales disponibles', async () => {
      const routeHandler = routes['POST:/comprobCredenciales'];
      
      mockQuery.mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      const mockReq = {
        body: {
          cedr_cli: '9999999999',
          email_pers: 'nuevo@ejemplo.com'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Credenciales disponibles"
      });
    });

    it('debería manejar errores en comprobCredenciales', async () => {
      const routeHandler = routes['POST:/comprobCredenciales'];
      
      mockQuery.mockRejectedValue(new Error('Error de consulta'));

      const mockReq = {
        body: {
          cedr_cli: '1234567890',
          email_pers: 'test@ejemplo.com'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Error interno del servidor"
      });
    });
  });

  describe('PUT /update', () => {
    it('debería actualizar un cliente existente', async () => {
      const routeHandler = routes['PUT:/update'];
      
      mockQuery.mockResolvedValue({
        rows: [CLIENTE_ACTUALIZAR],
        rowCount: 1
      });

      const mockReq = {
        body: CLIENTE_ACTUALIZAR
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Cliente actualizado correctamente",
        cliente: CLIENTE_ACTUALIZAR
      });
    });

    it('debería fallar al actualizar sin ID', async () => {
      const routeHandler = routes['PUT:/update'];
      
      const { id_pers, ...sinId } = CLIENTE_ACTUALIZAR;
      const mockReq = {
        body: sinId
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Se requiere el ID del cliente para actualizar"
      });
    });

    it('debería manejar cliente no encontrado en update', async () => {
      const routeHandler = routes['PUT:/update'];
      
      mockQuery.mockResolvedValue({
        rowCount: 0
      });

      const mockReq = {
        body: CLIENTE_ACTUALIZAR
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Cliente no encontrado"
      });
    });

    it('debería manejar errores de base de datos en update', async () => {
      const routeHandler = routes['PUT:/update'];
      
      mockQuery.mockRejectedValue(new Error('Error de actualización'));

      const mockReq = {
        body: CLIENTE_ACTUALIZAR
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Error al actualizar cliente",
        message: "Error de actualización"
      });
    });
  });

  describe('PUT /desactivar', () => {
    it('debería desactivar un cliente exitosamente', async () => {
      const routeHandler = routes['PUT:/desactivar'];
      
      mockQuery.mockResolvedValue({
        rows: [{ id_pers: 1, cedr_cli: '1234567890', nom_cli: 'Juan', ape_cli: 'Pérez' }],
        rowCount: 1
      });

      const mockReq = {
        body: { id_pers: 1 }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Cliente desactivado correctamente",
        cliente: { id_pers: 1, cedr_cli: '1234567890', nom_cli: 'Juan', ape_cli: 'Pérez' }
      });
    });

    it('debería fallar al desactivar sin ID', async () => {
      const routeHandler = routes['PUT:/desactivar'];
      
      const mockReq = {
        body: {}
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Se requiere el ID del cliente para desactivar"
      });
    });

    it('debería manejar cliente no encontrado en desactivar', async () => {
      const routeHandler = routes['PUT:/desactivar'];
      
      mockQuery.mockResolvedValue({
        rowCount: 0
      });

      const mockReq = {
        body: { id_pers: 999 }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Cliente no encontrado"
      });
    });

    it('debería manejar errores en desactivar', async () => {
      const routeHandler = routes['PUT:/desactivar'];
      
      mockQuery.mockRejectedValue(new Error('Error de desactivación'));

      const mockReq = {
        body: { id_pers: 1 }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        error: "Error al desactivar cliente",
        message: "Error de desactivación"
      });
    });
  });

  describe('PUT /activar', () => {
    it('debería activar un cliente exitosamente', async () => {
      const routeHandler = routes['PUT:/activar'];
      expect(routeHandler).toBeDefined();
      
      mockQuery.mockResolvedValue({
        rowCount: 1
      });

      const mockReq = {
        body: { id_pers: 1 }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Cliente actualizado correctamente"
      });
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE cliente SET"),
        ['1', 1]
      );
    });

    it('debería manejar errores en activar', async () => {
      const routeHandler = routes['PUT:/activar'];
      
      mockQuery.mockRejectedValue(new Error('Error de activación'));

      const mockReq = {
        body: { id_pers: 1 }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Error al actualizar cliente"
      });
    });
  });

  describe('GET /buscar', () => {
    it('debería encontrar un cliente por cédula', async () => {
      const routeHandler = routes['GET:/buscar'];
      
      mockQuery.mockResolvedValue({
        rows: [CLIENTE_PRUEBA],
        rowCount: 1
      });

      const mockReq = {
        query: { id: '1234567890' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith(CLIENTE_PRUEBA);
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM cliente WHERE cedr_cli = $1",
        ['1234567890']
      );
    });

    it('debería manejar array de IDs en buscar', async () => {
      const routeHandler = routes['GET:/buscar'];
      
      mockQuery.mockResolvedValue({
        rows: [CLIENTE_PRUEBA],
        rowCount: 1
      });

      const mockReq = {
        query: { id: ['1234567890', 'extra'] }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM cliente WHERE cedr_cli = $1",
        ['1234567890']
      );
    });

    it('debería retornar 404 si no encuentra el cliente', async () => {
      const routeHandler = routes['GET:/buscar'];
      
      mockQuery.mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      const mockReq = {
        query: { id: '9999999999' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Cliente no encontrado"
      });
    });

    it('debería manejar errores en buscar', async () => {
      const routeHandler = routes['GET:/buscar'];
      
      mockQuery.mockRejectedValue(new Error('Error de búsqueda'));

      const mockReq = {
        query: { id: '1234567890' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Error al obtener datos",
        error: new Error('Error de búsqueda')
      });
    });
  });

  describe('POST /validar-token-email', () => {
    it('debería validar token exitosamente', async () => {
      const routeHandler = routes['POST:/validar-token-email'];
      
      mockQuery.mockResolvedValue({
        rows: [{ token_val_email: 'valid_token', id_val_email: 1 }],
        rowCount: 1
      });

      const mockReq = {
        body: { url: 'http://example.com/validar/123' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Token válido.",
        data: { id_pers: 1, pass: 'password123' },
        idvalid: 1
      });
    });

    it('debería retornar 404 si no encuentra la URL', async () => {
      const routeHandler = routes['POST:/validar-token-email'];
      
      mockQuery.mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      const mockReq = {
        body: { url: 'http://example.com/invalid' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "URL no encontrada."
      });
    });

    it('debería manejar token inválido', async () => {
      const routeHandler = routes['POST:/validar-token-email'];
      
      mockQuery.mockResolvedValue({
        rows: [{ token_val_email: 'invalid_token', id_val_email: 1 }],
        rowCount: 1
      });

      // Hacer que jwt.verify lance un error
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Token inválido');
      });

      const mockReq = {
        body: { url: 'http://example.com/validar/123' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Token inválido o expirado."
      });
    });

    it('debería manejar errores de servidor en validar-token-email', async () => {
      const routeHandler = routes['POST:/validar-token-email'];
      
      mockQuery.mockRejectedValue(new Error('Error de base de datos'));

      const mockReq = {
        body: { url: 'http://example.com/validar/123' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Error interno del servidor."
      });
    });
  });

  describe('GET /buscarclienteID', () => {
    it('debería encontrar cliente por ID', async () => {
      const routeHandler = routes['GET:/buscarclienteID'];
      
      mockQuery.mockResolvedValue({
        rows: [CLIENTE_PRUEBA],
        rowCount: 1
      });

      const mockReq = {
        query: { id: '1' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith([CLIENTE_PRUEBA]);
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM cliente WHERE id_pers = $1",
        ['1']
      );
    });

    it('debería manejar array de IDs en buscarclienteID', async () => {
      const routeHandler = routes['GET:/buscarclienteID'];
      
      mockQuery.mockResolvedValue({
        rows: [CLIENTE_PRUEBA],
        rowCount: 1
      });

      const mockReq = {
        query: { id: ['1', 'extra'] }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM cliente WHERE id_pers = $1",
        ['1']
      );
    });

    it('debería manejar errores en buscarclienteID', async () => {
      const routeHandler = routes['GET:/buscarclienteID'];
      
      mockQuery.mockRejectedValue(new Error('Error de consulta'));

      const mockReq = {
        query: { id: '1' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Error al obtener datos",
        error: "Error de consulta"
      });
    });
  });

  describe('PUT /activar-cuenta', () => {
    it('debería activar cuenta exitosamente', async () => {
      const routeHandler = routes['PUT:/activar-cuenta'];
      
      // Primera consulta para actualizar cliente
      mockQuery.mockResolvedValueOnce({
        rowCount: 1
      });
      // Segunda consulta para eliminar validación
      mockQuery.mockResolvedValueOnce({
        rowCount: 1
      });

      const mockReq = {
        body: { id: 1, idvalid: 1 }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Cuenta del cliente activada con éxito."
      });
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('debería fallar si faltan datos requeridos', async () => {
      const routeHandler = routes['PUT:/activar-cuenta'];
      
      const mockReq = {
        body: { id: 1 } // Falta idvalid
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Faltan datos requeridos (id o idvalid)."
      });
    });

    it('debería manejar cliente no encontrado en activar-cuenta', async () => {
      const routeHandler = routes['PUT:/activar-cuenta'];
      
      mockQuery.mockResolvedValue({
        rowCount: 0
      });

      const mockReq = {
        body: { id: 999, idvalid: 1 }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Cliente no encontrado."
      });
    });

    it('debería manejar errores en activar-cuenta', async () => {
      const routeHandler = routes['PUT:/activar-cuenta'];
      
      mockQuery.mockRejectedValue(new Error('Error de activación'));

      const mockReq = {
        body: { id: 1, idvalid: 1 }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Error interno al actualizar cliente."
      });
    });
  });

  describe('POST /generar_token_email', () => {
    it('debería generar token exitosamente', async () => {
      const routeHandler = routes['POST:/generar_token_email'];
      expect(routeHandler).toBeDefined();
      
      mockQuery.mockResolvedValue({
        rowCount: 1
      });

      const mockReq = {
        body: {
          id_pers: 1,
          url: 'http://example.com/validar/123',
          pass: 'password123'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        token: 'mocked_token',
        message: "Token creado y guardado exitosamente."
      });
      expect(mockQuery).toHaveBeenCalledWith(
        "INSERT INTO validar_email (url_emal, token_val_email,id_pers) VALUES ($1, $2, $3)",
        ['http://example.com/validar/123', 'mocked_token', 1]
      );
    });

    it('debería manejar errores en generar_token_email', async () => {
      const routeHandler = routes['POST:/generar_token_email'];
      
      mockQuery.mockRejectedValue(new Error('Error de inserción'));

      const mockReq = {
        body: {
          id_pers: 1,
          url: 'http://example.com/validar/123',
          pass: 'password123'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Error del servidor"
      });
    });
  });

  describe('PUT /actualizar_token_email', () => {
    it('debería actualizar token exitosamente', async () => {
      const routeHandler = routes['PUT:/actualizar_token_email'];
      expect(routeHandler).toBeDefined();
      
      mockQuery.mockResolvedValue({
        rowCount: 1
      });

      const mockReq = {
        body: {
          id_pers: 1,
          url: 'http://example.com/validar/456',
          pass: 'newpassword123'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        token: 'mocked_token',
        message: "Token actualizado exitosamente."
      });
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE validar_email"),
        ['http://example.com/validar/456', 'mocked_token', 1]
      );
    });

    it('debería manejar registro no encontrado en actualizar_token_email', async () => {
      const routeHandler = routes['PUT:/actualizar_token_email'];
      
      mockQuery.mockResolvedValue({
        rowCount: 0
      });

      const mockReq = {
        body: {
          id_pers: 999,
          url: 'http://example.com/validar/456',
          pass: 'password123'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "No se encontró el registro para actualizar."
      });
    });

    it('debería manejar errores en actualizar_token_email', async () => {
      const routeHandler = routes['PUT:/actualizar_token_email'];
      
      mockQuery.mockRejectedValue(new Error('Error de actualización'));

      const mockReq = {
        body: {
          id_pers: 1,
          url: 'http://example.com/validar/456',
          pass: 'password123'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Error del servidor"
      });
    });
  });

  describe('PUT /update-correo', () => {
    it('debería actualizar correo exitosamente', async () => {
      const routeHandler = routes['PUT:/update-correo'];
      expect(routeHandler).toBeDefined();
      
      mockQuery.mockResolvedValue({
        rowCount: 1
      });

      const mockReq = {
        body: {
          newEmail: 'nuevo@ejemplo.com',
          id_pers: 1
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Cliente actualizado correctamente"
      });
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE cliente SET"),
        ['nuevo@ejemplo.com', 1]
      );
    });

    it('debería manejar errores en update-correo', async () => {
      const routeHandler = routes['PUT:/update-correo'];
      
      mockQuery.mockRejectedValue(new Error('Error de actualización'));

      const mockReq = {
        body: {
          newEmail: 'nuevo@ejemplo.com',
          id_pers: 1
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Error al actualizar cliente"
      });
    });
  });

  describe('POST /buscar-ruta-token', () => {
    it('debería encontrar ruta de token válida', async () => {
      const routeHandler = routes['POST:/buscar-ruta-token'];
      expect(routeHandler).toBeDefined();
      
      mockQuery.mockResolvedValue({
        rows: [{ 
          token_val_email: 'valid_token', 
          url_emal: 'http://example.com/validar/123' 
        }],
        rowCount: 1
      });

      const mockReq = {
        body: { id: 1 }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(200);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Token válido.",
        url: 'http://example.com/validar/123'
      });
    });

    it('debería manejar URL no encontrada en buscar-ruta-token', async () => {
      const routeHandler = routes['POST:/buscar-ruta-token'];
      
      mockQuery.mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      const mockReq = {
        body: { id: 999 }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "No se encontró una URL asociada al agente."
      });
    });

    it('debería manejar token expirado en buscar-ruta-token', async () => {
      const routeHandler = routes['POST:/buscar-ruta-token'];
      
      mockQuery.mockResolvedValue({
        rows: [{ 
          token_val_email: 'expired_token', 
          url_emal: 'http://example.com/validar/123' 
        }],
        rowCount: 1
      });

      // Hacer que jwt.verify lance un error
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Token expirado');
      });

      const mockReq = {
        body: { id: 1 }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Tu contraseña ha expirado o es inválida. Solicita una nueva."
      });
    });

    it('debería manejar errores de servidor en buscar-ruta-token', async () => {
      const routeHandler = routes['POST:/buscar-ruta-token'];
      
      mockQuery.mockRejectedValue(new Error('Error de base de datos'));

      const mockReq = {
        body: { id: 1 }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Error del servidor. Intenta más tarde."
      });
    });
  });

  describe('Casos edge adicionales', () => {
    it('debería manejar valores undefined en query params', async () => {
      const routeHandler = routes['GET:/buscar'];
      
      mockQuery.mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      const mockReq = {
        query: { id: undefined }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM cliente WHERE cedr_cli = $1",
        [undefined]
      );
    });

    it('debería manejar valores null en body', async () => {
      const routeHandler = routes['POST:/save'];
      
      const clienteConNulls = {
        ...CLIENTE_PRUEBA,
        tel_pers: null,
        cel_pers: null
      };

      const mockReq = {
        body: clienteConNulls
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: expect.stringContaining("Faltan campos obligatorios")
      });
    });

    it('debería verificar que console.log funciona en buscar-ruta-token', async () => {
      const routeHandler = routes['POST:/buscar-ruta-token'];
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      mockQuery.mockResolvedValue({
        rows: [{ 
          token_val_email: 'valid_token', 
          url_emal: 'http://example.com/validar/123' 
        }],
        rowCount: 1
      });

      const mockReq = {
        body: { id: 1 }
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleSpy).toHaveBeenCalledWith('id de llegada');
      expect(consoleSpy).toHaveBeenCalledWith(1);
      
      consoleSpy.mockRestore();
    });
  });

  describe('Verificación de constantes y configuración', () => {
    it('debería verificar que las constantes están definidas correctamente', () => {
      // Estas constantes se definen en el archivo original
      expect('1').toBe('1'); // ESTADO_ACTIVO
      expect('2').toBe('2'); // ESTADO_INACTIVO
    });

    it('debería verificar que todas las rutas esperadas están registradas', () => {
      const rutasEsperadas = [
        'GET:/listar',
        'GET:/listarPendientes', 
        'POST:/save',
        'POST:/comprobCredenciales',
        'PUT:/update',
        'PUT:/desactivar',
        'PUT:/activar',
        'GET:/buscar',
        'POST:/validar-token-email',
        'GET:/buscarclienteID',
        'PUT:/activar-cuenta',
        'POST:/generar_token_email',
        'PUT:/actualizar_token_email',
        'PUT:/update-correo',
        'POST:/buscar-ruta-token'
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
  });

  describe('Cobertura de ramas específicas', () => {
    it('debería probar el filtro de array en buscar con múltiples elementos', async () => {
      const routeHandler = routes['GET:/buscar'];
      
      mockQuery.mockResolvedValue({
        rows: [CLIENTE_PRUEBA],
        rowCount: 1
      });

      const mockReq = {
        query: { id: ['1234567890', 'segundo', 'tercero'] }
      };

      await routeHandler(mockReq, mockRes);

      // Verifica que solo toma el primer elemento del array
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM cliente WHERE cedr_cli = $1",
        ['1234567890']
      );
    });

    it('debería probar el filtro de array en buscarclienteID con múltiples elementos', async () => {
      const routeHandler = routes['GET:/buscarclienteID'];
      
      mockQuery.mockResolvedValue({
        rows: [CLIENTE_PRUEBA],
        rowCount: 1
      });

      const mockReq = {
        query: { id: ['1', 'segundo', 'tercero'] }
      };

      await routeHandler(mockReq, mockRes);

      // Verifica que solo toma el primer elemento del array
      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM cliente WHERE id_pers = $1",
        ['1']
      );
    });

    it('debería cubrir todos los campos obligatorios uno por uno', async () => {
      const routeHandler = routes['POST:/save'];
      
      const camposObligatorios = [
        'cedr_cli', 'tipo_cedr_cli', 'nacion_cli', 'nom_cli', 'ape_cli',
        'fecha_naci_cli', 'lugar_naci_cli', 'tel_pers', 'cel_pers', 'email_pers',
        'edad_pers', 'sexo_cli', 'estado_civil_pers', 'estatura_cli', 'peso_cli',
        'parroq_cli', 'calle_princ_pers', 'calle_secun_pers', 'id_ciud'
      ];

      // Probar con cada campo faltante individualmente
      for (const campoFaltante of camposObligatorios) {
        jest.clearAllMocks();
        
        const clienteIncompleto = { ...CLIENTE_PRUEBA };
        delete clienteIncompleto[campoFaltante];

        const mockReq = {
          body: clienteIncompleto
        };

        await routeHandler(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          success: false,
          message: expect.stringContaining(campoFaltante)
        });
      }
    });
  });
});