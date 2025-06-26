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

// Mock de jsonwebtoken
const mockJwtSign = jest.fn();
jest.mock('jsonwebtoken', () => ({
  sign: mockJwtSign
}));

// Importamos el módulo a probar después de configurar todos los mocks
let routerInstance;
try {
  routerInstance = require('../src/routes/usuarios.routes.js');
  console.log('Rutas capturadas de usuarios:', Object.keys(routes));
} catch (error) {
  console.error('Error al importar el módulo usuarios.routes.js:', error);
}

describe('Pruebas unitarias para la ruta de usuarios', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('debería retornar todos los usuarios exitosamente', async () => {
      const routeHandler = routes['GET:/users'];
      expect(routeHandler).toBeDefined();
      
      const usuariosMock = [
        { id: 1, users: 'admin', pass: 'pass1' },
        { id: 2, users: 'cliente1', pass: 'pass2' }
      ];
      
      mockQuery.mockResolvedValue({
        rows: usuariosMock,
        rowCount: 2
      });

      const mockReq = {};
      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM usuarios");
      expect(mockJson).toHaveBeenCalledWith({
        rows: usuariosMock,
        rowCount: 2
      });
    });

    it('debería manejar errores en la consulta de usuarios', async () => {
      const routeHandler = routes['GET:/users'];
      
      mockQuery.mockRejectedValue(new Error('Error de base de datos'));

      const mockReq = {};
      await routeHandler(mockReq, mockRes);

      // Cuando hay error, no hay manejo específico, por lo que se propagará
      expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM usuarios");
    });
  });

  describe('POST /ingreso', () => {
    it('debería autenticar admin exitosamente', async () => {
      const routeHandler = routes['POST:/ingreso'];
      
      mockQuery.mockResolvedValue({
        rowCount: 1,
        rows: [{ users: 'admin', pass: 'pass', id_persona: 1, nom_rol: 'admin' }]
      });

      mockJwtSign.mockImplementation((payload, secret, options, callback) => {
        callback(null, 'test_token');
      });

      const mockReq = {
        body: { user: 'admin', pass: 'pass' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("SELECT u.users, u.pass, u.id_persona, r.nom_rol"),
        ['admin', 'pass']
      );
      expect(mockJwtSign).toHaveBeenCalled();
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        user: { success: true, nom_rol: "admin", estado: 1, id: 1 },
        token: 'test_token'
      });
    });

    it('debería autenticar cliente activo exitosamente', async () => {
      const routeHandler = routes['POST:/ingreso'];
      
      // Primera consulta: autenticación
      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ users: 'cliente', pass: 'pass', id_persona: 2, nom_rol: 'cliente' }]
      });
      
      // Segunda consulta: estado del cliente
      mockQuery.mockResolvedValueOnce({
        rows: [{ id_estado: 1 }]
      });

      mockJwtSign.mockImplementation((payload, secret, options, callback) => {
        callback(null, 'test_token');
      });

      const mockReq = {
        body: { user: 'cliente', pass: 'pass' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        user: { success: true, nom_rol: "cliente", estado: 1, id: 2 },
        token: 'test_token'
      });
    });

    it('debería manejar cliente desactivado (estado 2)', async () => {
      const routeHandler = routes['POST:/ingreso'];
      
      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ users: 'cliente', pass: 'pass', id_persona: 2, nom_rol: 'cliente' }]
      });
      
      mockQuery.mockResolvedValueOnce({
        rows: [{ id_estado: 2 }]
      });

      const mockReq = {
        body: { user: 'cliente', pass: 'pass' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        user: "El cliente está desactivado."
      });
    });

    it('debería manejar cliente pendiente (estado 3)', async () => {
      const routeHandler = routes['POST:/ingreso'];
      
      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ users: 'cliente', pass: 'pass', id_persona: 2, nom_rol: 'cliente' }]
      });
      
      mockQuery.mockResolvedValueOnce({
        rows: [{ id_estado: 3 }]
      });

      const mockReq = {
        body: { user: 'cliente', pass: 'pass' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        user: { nom_rol: "cliente", estado: 3, id: 2 }
      });
    });

    it('debería manejar cliente preactivo (estado 4)', async () => {
      const routeHandler = routes['POST:/ingreso'];
      
      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ users: 'cliente', pass: 'pass', id_persona: 2, nom_rol: 'cliente' }]
      });
      
      mockQuery.mockResolvedValueOnce({
        rows: [{ id_estado: 4 }]
      });

      mockJwtSign.mockImplementation((payload, secret, options, callback) => {
        callback(null, 'test_token');
      });

      const mockReq = {
        body: { user: 'cliente', pass: 'pass' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        user: { success: true, nom_rol: "cliente", estado: 4, id: 2 },
        token: 'test_token'
      });
    });

    it('debería autenticar agente exitosamente', async () => {
      const routeHandler = routes['POST:/ingreso'];
      
      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ users: 'agente', pass: 'pass', id_persona: 3, nom_rol: 'agente' }]
      });
      
      mockQuery.mockResolvedValueOnce({
        rows: [{ id_estado: 1 }]
      });

      mockJwtSign.mockImplementation((payload, secret, options, callback) => {
        callback(null, 'test_token');
      });

      const mockReq = {
        body: { user: 'agente', pass: 'pass' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        user: { success: true, nom_rol: "agente", estado: 1, id: 3 },
        token: 'test_token'
      });
    });

    it('debería manejar agente desactivado (estado 2)', async () => {
      const routeHandler = routes['POST:/ingreso'];
      
      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ users: 'agente', pass: 'pass', id_persona: 3, nom_rol: 'agente' }]
      });
      
      mockQuery.mockResolvedValueOnce({
        rows: [{ id_estado: 2 }]
      });

      const mockReq = {
        body: { user: 'agente', pass: 'pass' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        user: "El agente está desactivado."
      });
    });

    it('debería manejar agente pendiente (estado 3)', async () => {
      const routeHandler = routes['POST:/ingreso'];
      
      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ users: 'agente', pass: 'pass', id_persona: 3, nom_rol: 'agente' }]
      });
      
      mockQuery.mockResolvedValueOnce({
        rows: [{ id_estado: 3 }]
      });

      const mockReq = {
        body: { user: 'agente', pass: 'pass' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        user: { nom_rol: "agente", estado: 3, id: 3 }
      });
    });

    it('debería manejar arrays en user y pass', async () => {
      const routeHandler = routes['POST:/ingreso'];
      
      mockQuery.mockResolvedValue({
        rowCount: 1,
        rows: [{ users: 'admin', pass: 'pass', id_persona: 1, nom_rol: 'admin' }]
      });

      mockJwtSign.mockImplementation((payload, secret, options, callback) => {
        callback(null, 'test_token');
      });

      const mockReq = {
        body: { user: ['admin', 'extra'], pass: ['pass', 'extra'] }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['admin', 'pass'] // Debe tomar solo el primer elemento
      );
    });

    it('debería manejar credenciales no encontradas', async () => {
      const routeHandler = routes['POST:/ingreso'];
      
      mockQuery.mockResolvedValue({
        rowCount: 0,
        rows: []
      });

      const mockReq = {
        body: { user: 'inexistente', pass: 'pass' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        user: "Credenciales no encontradas"
      });
    });

    it('debería manejar error en JWT', async () => {
      const routeHandler = routes['POST:/ingreso'];
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockQuery.mockResolvedValue({
        rowCount: 1,
        rows: [{ users: 'admin', pass: 'pass', id_persona: 1, nom_rol: 'admin' }]
      });

      mockJwtSign.mockImplementation((payload, secret, options, callback) => {
        callback(new Error('JWT Error'), null);
      });

      const mockReq = {
        body: { user: 'admin', pass: 'pass' }
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error generando token:", expect.any(Error));
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Error generando token"
      });

      consoleErrorSpy.mockRestore();
    });

    it('debería manejar error de base de datos', async () => {
      const routeHandler = routes['POST:/ingreso'];
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockQuery.mockRejectedValue(new Error('DB Error'));

      const mockReq = {
        body: { user: 'admin', pass: 'pass' }
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error en /ingreso:", expect.any(Error));
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Error interno del servidor"
      });

      consoleErrorSpy.mockRestore();
    });

    it('debería manejar cliente sin estado definido', async () => {
      const routeHandler = routes['POST:/ingreso'];
      
      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ users: 'cliente', pass: 'pass', id_persona: 2, nom_rol: 'cliente' }]
      });
      
      mockQuery.mockResolvedValueOnce({
        rows: [{}] // Sin id_estado
      });

      mockJwtSign.mockImplementation((payload, secret, options, callback) => {
        callback(null, 'test_token');
      });

      const mockReq = {
        body: { user: 'cliente', pass: 'pass' }
      };

      await routeHandler(mockReq, mockRes);

      // Si no hay estado definido, debería pasar al else del agente
      expect(mockJson).toHaveBeenCalled();
    });
  });

  describe('POST /crearusuariocliente', () => {
    it('debería crear usuario cliente exitosamente', async () => {
      const routeHandler = routes['POST:/crearusuariocliente'];
      
      const usuarioCreado = {
        users: 'cliente@test.com',
        pass: 'password123',
        id_persona: 1,
        id_rol: '3'
      };

      mockQuery.mockResolvedValue({
        rows: [usuarioCreado]
      });

      const mockReq = {
        body: {
          user: 'cliente@test.com',
          pass: 'password123',
          idpersona: 1
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO usuarios"),
        ['cliente@test.com', 'password123', 1, '3']
      );
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Usuario creado correctamente",
        usuario: usuarioCreado
      });
    });

    it('debería fallar si faltan campos obligatorios', async () => {
      const routeHandler = routes['POST:/crearusuariocliente'];
      
      const mockReq = {
        body: {
          user: 'cliente@test.com'
          // Faltan pass e idpersona
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Faltan campos obligatorios"
      });
    });

    it('debería manejar error de base de datos', async () => {
      const routeHandler = routes['POST:/crearusuariocliente'];
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockQuery.mockRejectedValue(new Error('DB Error'));

      const mockReq = {
        body: {
          user: 'cliente@test.com',
          pass: 'password123',
          idpersona: 1
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error al crear usuario:", expect.any(Error));
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Error interno del servidor"
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('POST /crear-usuario-agente', () => {
    it('debería crear usuario agente exitosamente', async () => {
      const routeHandler = routes['POST:/crear-usuario-agente'];
      
      const usuarioCreado = {
        users: 'agente@test.com',
        pass: 'password123',
        id_persona: 2,
        id_rol: '2'
      };

      mockQuery.mockResolvedValue({
        rows: [usuarioCreado]
      });

      const mockReq = {
        body: {
          user: 'agente@test.com',
          pass: 'password123',
          idpersona: 2
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO usuarios"),
        ['agente@test.com', 'password123', 2, '2']
      );
      expect(mockStatus).toHaveBeenCalledWith(201);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "Usuario creado correctamente",
        usuario: usuarioCreado
      });
    });

    it('debería fallar si faltan campos obligatorios', async () => {
      const routeHandler = routes['POST:/crear-usuario-agente'];
      
      const mockReq = {
        body: {
          user: 'agente@test.com'
          // Faltan pass e idpersona
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Faltan campos obligatorios"
      });
    });

    it('debería manejar error de base de datos', async () => {
      const routeHandler = routes['POST:/crear-usuario-agente'];
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockQuery.mockRejectedValue(new Error('DB Error'));

      const mockReq = {
        body: {
          user: 'agente@test.com',
          pass: 'password123',
          idpersona: 2
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error al crear usuario:", expect.any(Error));
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: "Error interno del servidor"
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('POST /verificar-datos', () => {
    it('debería confirmar que datos están disponibles', async () => {
      const routeHandler = routes['POST:/verificar-datos'];
      
      // Todas las consultas retornan vacío (datos disponibles)
      mockQuery.mockResolvedValueOnce({ rows: [] }); // Usuario no existe
      mockQuery.mockResolvedValueOnce({ rows: [] }); // Cédula no en agente
      mockQuery.mockResolvedValueOnce({ rows: [] }); // Cédula no en cliente

      const mockReq = {
        body: {
          users: 'nuevo@test.com',
          cedula: '1234567890'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledTimes(3);
      expect(mockJson).toHaveBeenCalledWith({
        existe: false,
        message: "El nombre de usuario y la cédula están disponibles."
      });
    });

    it('debería detectar usuario existente', async () => {
      const routeHandler = routes['POST:/verificar-datos'];
      
      mockQuery.mockResolvedValueOnce({ rows: [{}] }); // Usuario existe

      const mockReq = {
        body: {
          users: 'existente@test.com',
          cedula: '1234567890'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledTimes(1);
      expect(mockJson).toHaveBeenCalledWith({
        existe: true,
        message: "El correo electronico ya está en uso."
      });
    });

    it('debería detectar cédula en agente', async () => {
      const routeHandler = routes['POST:/verificar-datos'];
      
      mockQuery.mockResolvedValueOnce({ rows: [] }); // Usuario no existe
      mockQuery.mockResolvedValueOnce({ rows: [{}] }); // Cédula en agente

      const mockReq = {
        body: {
          users: 'nuevo@test.com',
          cedula: '1234567890'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockJson).toHaveBeenCalledWith({
        existe: true,
        message: "El número de cédula ya existe en agentes."
      });
    });

    it('debería detectar cédula en cliente', async () => {
      const routeHandler = routes['POST:/verificar-datos'];
      
      mockQuery.mockResolvedValueOnce({ rows: [] }); // Usuario no existe
      mockQuery.mockResolvedValueOnce({ rows: [] }); // Cédula no en agente
      mockQuery.mockResolvedValueOnce({ rows: [{}] }); // Cédula en cliente

      const mockReq = {
        body: {
          users: 'nuevo@test.com',
          cedula: '1234567890'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledTimes(3);
      expect(mockJson).toHaveBeenCalledWith({
        existe: true,
        message: "El número de cédula ya existe en clientes."
      });
    });

    it('debería fallar si no se proporciona users', async () => {
      const routeHandler = routes['POST:/verificar-datos'];
      
      const mockReq = {
        body: {
          cedula: '1234567890'
          // Falta users
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Debe proporcionar el nombre de usuario (users)"
      });
    });

    it('debería manejar error de base de datos', async () => {
      const routeHandler = routes['POST:/verificar-datos'];
      
      mockQuery.mockRejectedValue(new Error('DB Error'));

      const mockReq = {
        body: {
          users: 'test@test.com',
          cedula: '1234567890'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Error al verificar si el usuario existe",
        error: expect.any(Error)
      });
    });
  });

  describe('POST /usuario-existe', () => {
    it('debería confirmar que usuario no existe', async () => {
      const routeHandler = routes['POST:/usuario-existe'];
      
      mockQuery.mockResolvedValue({ rows: [] });

      const mockReq = {
        body: { users: 'nuevo@test.com' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT 1 FROM usuarios WHERE users = $1 LIMIT 1",
        ['nuevo@test.com']
      );
      // No hay respuesta definida cuando no existe
    });

    it('debería detectar usuario existente', async () => {
      const routeHandler = routes['POST:/usuario-existe'];
      
      mockQuery.mockResolvedValue({ rows: [{}] });

      const mockReq = {
        body: { users: 'existente@test.com' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        existe: true,
        message: "El correo electronico ya está en uso."
      });
    });

    it('debería fallar si no se proporciona users', async () => {
      const routeHandler = routes['POST:/usuario-existe'];
      
      const mockReq = {
        body: {}
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Debe proporcionar el nombre de usuario (users)"
      });
    });

    it('debería manejar error de base de datos', async () => {
      const routeHandler = routes['POST:/usuario-existe'];
      
      mockQuery.mockRejectedValue(new Error('DB Error'));

      const mockReq = {
        body: { users: 'test@test.com' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Error al verificar si el usuario existe",
        error: expect.any(Error)
      });
    });
  });

  describe('PUT /users-password', () => {
    it('debería actualizar contraseña exitosamente', async () => {
      const routeHandler = routes['PUT:/users-password'];
      
      const usuarioActualizado = {
        id_persona: 1,
        users: 'usuario@test.com',
        pass: 'nueva_password'
      };

      mockQuery.mockResolvedValue({
        rowCount: 1,
        rows: [usuarioActualizado]
      });

      const mockReq = {
        body: {
          id_pers: 1,
          pass: 'nueva_password'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        "UPDATE usuarios SET pass = $1 WHERE id_persona = $2 RETURNING *",
        ['nueva_password', 1]
      );
      expect(mockJson).toHaveBeenCalledWith({
        message: "Contraseña actualizada correctamente",
        usuario: usuarioActualizado
      });
    });

    it('debería fallar si faltan datos requeridos', async () => {
      const routeHandler = routes['PUT:/users-password'];
      
      const mockReq = {
        body: {
          id_pers: 1
          // Falta pass
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Faltan datos requeridos"
      });
    });

    it('debería manejar usuario no encontrado', async () => {
      const routeHandler = routes['PUT:/users-password'];
      
      mockQuery.mockResolvedValue({
        rowCount: 0,
        rows: []
      });

      const mockReq = {
        body: {
          id_pers: 999,
          pass: 'nueva_password'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Usuario no encontrado"
      });
    });

    it('debería manejar error de base de datos', async () => {
      const routeHandler = routes['PUT:/users-password'];
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockQuery.mockRejectedValue(new Error('DB Error'));

      const mockReq = {
        body: {
          id_pers: 1,
          pass: 'nueva_password'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error al actualizar la contraseña:", expect.any(Error));
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Error interno del servidor"
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('PUT /update-usuario-password', () => {
    it('debería actualizar usuario y contraseña exitosamente', async () => {
      const routeHandler = routes['PUT:/update-usuario-password'];
      
      const usuarioActualizado = {
        id_persona: 1,
        users: 'nuevo@test.com',
        pass: 'nueva_password'
      };

      mockQuery.mockResolvedValue({
        rowCount: 1,
        rows: [usuarioActualizado]
      });

      const mockReq = {
        body: {
          id_pers: 1,
          pass: 'nueva_password',
          user: 'nuevo@test.com'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        "UPDATE usuarios SET users=$1, pass = $2 WHERE id_persona = $3 RETURNING *",
        ['nuevo@test.com', 'nueva_password', 1]
      );
      expect(mockJson).toHaveBeenCalledWith({
        message: "Contraseña actualizada correctamente",
        usuario: usuarioActualizado
      });
    });

    it('debería fallar si faltan datos requeridos', async () => {
      const routeHandler = routes['PUT:/update-usuario-password'];
      
      const mockReq = {
        body: {
          id_pers: 1
          // Falta pass
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Faltan datos requeridos"
      });
    });

    it('debería manejar usuario no encontrado', async () => {
      const routeHandler = routes['PUT:/update-usuario-password'];
      
      mockQuery.mockResolvedValue({
        rowCount: 0,
        rows: []
      });

      const mockReq = {
        body: {
          id_pers: 999,
          pass: 'nueva_password',
          user: 'nuevo@test.com'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Usuario no encontrado"
      });
    });

    it('debería manejar error de base de datos', async () => {
      const routeHandler = routes['PUT:/update-usuario-password'];
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      mockQuery.mockRejectedValue(new Error('DB Error'));

      const mockReq = {
        body: {
          id_pers: 1,
          pass: 'nueva_password',
          user: 'nuevo@test.com'
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(consoleErrorSpy).toHaveBeenCalledWith("Error al actualizar la contraseña:", expect.any(Error));
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Error interno del servidor"
      });

      consoleErrorSpy.mockRestore();
    });

    it('debería actualizar sin campo user (opcional)', async () => {
      const routeHandler = routes['PUT:/update-usuario-password'];
      
      const usuarioActualizado = {
        id_persona: 1,
        users: undefined,
        pass: 'nueva_password'
      };

      mockQuery.mockResolvedValue({
        rowCount: 1,
        rows: [usuarioActualizado]
      });

      const mockReq = {
        body: {
          id_pers: 1,
          pass: 'nueva_password'
          // Sin campo user
        }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        "UPDATE usuarios SET users=$1, pass = $2 WHERE id_persona = $3 RETURNING *",
        [undefined, 'nueva_password', 1]
      );
    });
  });

  describe('Casos edge y validaciones adicionales', () => {
    it('debería manejar estado de cliente undefined', async () => {
      const routeHandler = routes['POST:/ingreso'];
      
      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ users: 'cliente', pass: 'pass', id_persona: 2, nom_rol: 'cliente' }]
      });
      
      mockQuery.mockResolvedValueOnce({
        rows: [{ id_estado: undefined }]
      });

      mockJwtSign.mockImplementation((payload, secret, options, callback) => {
        callback(null, 'test_token');
      });

      const mockReq = {
        body: { user: 'cliente', pass: 'pass' }
      };

      await routeHandler(mockReq, mockRes);

      // El código no maneja estados undefined explícitamente
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('debería manejar agente con estado undefined (caso else)', async () => {
      const routeHandler = routes['POST:/ingreso'];
      
      mockQuery.mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ users: 'agente', pass: 'pass', id_persona: 3, nom_rol: 'agente' }]
      });
      
      mockQuery.mockResolvedValueOnce({
        rows: [{ id_estado: 1 }] // Estado 1 (no 2 ni 3)
      });

      mockJwtSign.mockImplementation((payload, secret, options, callback) => {
        callback(null, 'test_token');
      });

      const mockReq = {
        body: { user: 'agente', pass: 'pass' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        user: { success: true, nom_rol: "agente", estado: 1, id: 3 },
        token: 'test_token'
      });
    });

    it('debería manejar valores falsy en users para verificar-datos', async () => {
      const routeHandler = routes['POST:/verificar-datos'];
      
      const valoresFalsy = ['', null, undefined, 0, false];
      
      for (const valor of valoresFalsy) {
        jest.clearAllMocks();
        
        const mockReq = {
          body: {
            users: valor,
            cedula: '1234567890'
          }
        };

        await routeHandler(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          message: "Debe proporcionar el nombre de usuario (users)"
        });
      }
    });

    it('debería manejar valores falsy en users para usuario-existe', async () => {
      const routeHandler = routes['POST:/usuario-existe'];
      
      const valoresFalsy = ['', null, undefined, 0, false];
      
      for (const valor of valoresFalsy) {
        jest.clearAllMocks();
        
        const mockReq = {
          body: { users: valor }
        };

        await routeHandler(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          message: "Debe proporcionar el nombre de usuario (users)"
        });
      }
    });

    it('debería manejar valores falsy en datos requeridos para users-password', async () => {
      const routeHandler = routes['PUT:/users-password'];
      
      const casosFalsy = [
        { id_pers: null, pass: 'password' },
        { id_pers: 1, pass: null },
        { id_pers: '', pass: 'password' },
        { id_pers: 1, pass: '' },
        { id_pers: undefined, pass: 'password' },
        { id_pers: 1, pass: undefined },
        { id_pers: 0, pass: 'password' },
        { id_pers: 1, pass: 0 },
        { id_pers: false, pass: 'password' },
        { id_pers: 1, pass: false }
      ];
      
      for (const caso of casosFalsy) {
        jest.clearAllMocks();
        
        const mockReq = {
          body: caso
        };

        await routeHandler(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          error: "Faltan datos requeridos"
        });
      }
    });

    it('debería manejar valores falsy en datos requeridos para update-usuario-password', async () => {
      const routeHandler = routes['PUT:/update-usuario-password'];
      
      const casosFalsy = [
        { id_pers: null, pass: 'password', user: 'test' },
        { id_pers: 1, pass: null, user: 'test' },
        { id_pers: '', pass: 'password', user: 'test' },
        { id_pers: 1, pass: '', user: 'test' }
      ];
      
      for (const caso of casosFalsy) {
        jest.clearAllMocks();
        
        const mockReq = {
          body: caso
        };

        await routeHandler(mockReq, mockRes);

        expect(mockStatus).toHaveBeenCalledWith(400);
        expect(mockJson).toHaveBeenCalledWith({
          error: "Faltan datos requeridos"
        });
      }
    });
  });

  describe('Verificación de configuración y rutas', () => {
    it('debería verificar que todas las rutas esperadas están registradas', () => {
      const rutasEsperadas = [
        'GET:/users',
        'POST:/ingreso',
        'POST:/crearusuariocliente',
        'POST:/crear-usuario-agente',
        'POST:/verificar-datos',
        'POST:/usuario-existe',
        'PUT:/users-password',
        'PUT:/update-usuario-password'
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

    it('debería verificar que JWT fue mockeado correctamente', () => {
      expect(mockJwtSign).toBeDefined();
      expect(typeof mockJwtSign).toBe('function');
    });
  });

  describe('Cobertura de todas las ramas del ingreso', () => {
    it('debería cubrir todas las ramas de estados de cliente', async () => {
      const routeHandler = routes['POST:/ingreso'];
      const estadosCliente = [1, 2, 3, 4, 5, undefined, null];
      
      for (const estado of estadosCliente) {
        jest.clearAllMocks();
        
        mockQuery.mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ users: 'cliente', pass: 'pass', id_persona: 2, nom_rol: 'cliente' }]
        });
        
        mockQuery.mockResolvedValueOnce({
          rows: [{ id_estado: estado }]
        });

        if (estado === 1 || estado === 4) {
          mockJwtSign.mockImplementation((payload, secret, options, callback) => {
            callback(null, 'test_token');
          });
        }

        const mockReq = {
          body: { user: 'cliente', pass: 'pass' }
        };

        await routeHandler(mockReq, mockRes);

        expect(mockQuery).toHaveBeenCalledTimes(2);
        expect(mockJson).toHaveBeenCalled();
      }
    });

    it('debería cubrir todas las ramas de estados de agente', async () => {
      const routeHandler = routes['POST:/ingreso'];
      const estadosAgente = [1, 2, 3, 4, undefined, null];
      
      for (const estado of estadosAgente) {
        jest.clearAllMocks();
        
        mockQuery.mockResolvedValueOnce({
          rowCount: 1,
          rows: [{ users: 'agente', pass: 'pass', id_persona: 3, nom_rol: 'agente' }]
        });
        
        mockQuery.mockResolvedValueOnce({
          rows: [{ id_estado: estado }]
        });

        if (estado !== 2 && estado !== 3) {
          mockJwtSign.mockImplementation((payload, secret, options, callback) => {
            callback(null, 'test_token');
          });
        }

        const mockReq = {
          body: { user: 'agente', pass: 'pass' }
        };

        await routeHandler(mockReq, mockRes);

        expect(mockQuery).toHaveBeenCalledTimes(2);
        expect(mockJson).toHaveBeenCalled();
      }
    });

    it('debería manejar rol no reconocido', async () => {
      const routeHandler = routes['POST:/ingreso'];
      
      mockQuery.mockResolvedValue({
        rowCount: 1,
        rows: [{ users: 'usuario', pass: 'pass', id_persona: 4, nom_rol: 'otro_rol' }]
      });

      mockJwtSign.mockImplementation((payload, secret, options, callback) => {
        callback(null, 'test_token');
      });

      const mockReq = {
        body: { user: 'usuario', pass: 'pass' }
      };

      await routeHandler(mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        user: { users: 'usuario', pass: 'pass', id_persona: 4, nom_rol: 'otro_rol' },
        token: 'test_token'
      });
    });
  });
});