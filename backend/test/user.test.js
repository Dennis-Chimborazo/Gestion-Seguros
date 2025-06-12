const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// Mock de database.js antes de importar el router
jest.mock('../src/database.js', () => {
  const mockQuery = jest.fn();
  return {
    DataBase: jest.fn().mockImplementation(() => ({
      getConexion: jest.fn().mockReturnValue({
        query: mockQuery
      })
    }))
  };
});

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn((payload, secret, options, callback) => {
    if (callback) {
      return callback(null, 'token-de-prueba');
    }
    return 'token-email-prueba';
  })
}));

// Importar el router después de configurar los mocks
const router = require('../src/routes/usuarios.routes');

// Configuración de la app Express para pruebas
const app = express();
app.use(express.json());
app.use(router);

describe('Rutas de usuarios', () => {
  // Obtener referencia directa al mock de query
  const { DataBase } = require('../src/database.js');
  const mockQuery = DataBase().getConexion().query;
  
  beforeEach(() => {
    // Reiniciar los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('debería devolver todos los usuarios', async () => {
      // Configurar el mock para devolver datos de prueba
      const usuariosPrueba = [{ id: 1, users: 'usuario1', pass: 'pass1' }];
      mockQuery.mockResolvedValueOnce({ rows: usuariosPrueba });

      // Realizar la solicitud de prueba
      const response = await request(app).get('/users');
      
      // Verificar que la función query fue llamada correctamente
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM usuarios');
      
      // Verificar la respuesta
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ rows: usuariosPrueba });
    });
  });

  describe('POST /ingreso', () => {
    it('debería autenticar un admin válido y devolver un token', async () => {
      // Preparar datos de prueba
      const credenciales = { user: 'admin1', pass: 'pass1' };
      const resultadoBD = { 
        rowCount: 1, 
        rows: [{ 
          users: 'admin1', 
          pass: 'pass1', 
          id_persona: 1,
          nom_rol: 'admin' 
        }] 
      };
      
      // Configurar los mocks
      mockQuery.mockResolvedValueOnce(resultadoBD);

      // Realizar la solicitud de prueba
      const response = await request(app)
        .post('/ingreso')
        .send(credenciales);
      
      // Verificar que la función query fue llamada correctamente
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT u.users, u.pass, u.id_persona, r.nom_rol'),
        ['admin1', 'pass1']
      );
      
      // Verificar que se llamó a jwt.sign
      expect(jwt.sign).toHaveBeenCalled();
      
      // Verificar la respuesta
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        user: {
          success: true,
          nom_rol: "admin",
          estado: 1,
          id: 1
        },
        token: 'token-de-prueba'
      });
    });

    it('debería autenticar un cliente válido y devolver un token', async () => {
      // Preparar datos de prueba
      const credenciales = { user: 'cliente1', pass: 'pass1' };
      const resultadoBD = { 
        rowCount: 1, 
        rows: [{ 
          users: 'cliente1', 
          pass: 'pass1', 
          id_persona: 2,
          nom_rol: 'cliente' 
        }] 
      };
      const estadoCliente = { 
        rowCount: 1, 
        rows: [{ id_estado: 1 }] 
      };
      
      // Configurar los mocks
      mockQuery
        .mockResolvedValueOnce(resultadoBD) // Primera consulta (login)
        .mockResolvedValueOnce(estadoCliente); // Segunda consulta (estado cliente)

      // Realizar la solicitud de prueba
      const response = await request(app)
        .post('/ingreso')
        .send(credenciales);
      
      // Verificar las consultas
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT u.users, u.pass, u.id_persona, r.nom_rol'),
        ['cliente1', 'pass1']
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id_estado FROM cliente WHERE id_pers = $1'),
        [2]
      );
      
      // Verificar la respuesta
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        user: {
          success: true,
          nom_rol: "cliente",
          estado: 1,
          id: 2
        },
        token: 'token-de-prueba'
      });
    });

    it('debería manejar cliente desactivado', async () => {
      // Preparar datos de prueba
      const credenciales = { user: 'cliente2', pass: 'pass2' };
      const resultadoBD = { 
        rowCount: 1, 
        rows: [{ 
          users: 'cliente2', 
          pass: 'pass2', 
          id_persona: 3,
          nom_rol: 'cliente' 
        }] 
      };
      const estadoCliente = { 
        rowCount: 1, 
        rows: [{ id_estado: 2 }] 
      };
      
      // Configurar los mocks
      mockQuery
        .mockResolvedValueOnce(resultadoBD)
        .mockResolvedValueOnce(estadoCliente);

      // Realizar la solicitud de prueba
      const response = await request(app)
        .post('/ingreso')
        .send(credenciales);
      
      // Verificar la respuesta
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: false,
        user: "El cliente está desactivado."
      });
    });

    it('debería manejar credenciales inválidas', async () => {
      // Configurar el mock para devolver resultado vacío
      mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      // Realizar la solicitud de prueba
      const response = await request(app)
        .post('/ingreso')
        .send({ user: 'usuario_invalido', pass: 'pass_invalida' });
      
      // Verificar la respuesta
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: false,
        user: "Credenciales no encontradas"
      });
    });

    it('debería manejar arrays en user y pass', async () => {
      // Preparar datos de prueba con arrays
      const credenciales = { user: ['usuario1'], pass: ['pass1'] };
      const resultadoBD = { 
        rowCount: 1, 
        rows: [{ 
          users: 'usuario1', 
          pass: 'pass1', 
          id_persona: 1,
          nom_rol: 'admin' 
        }] 
      };
      
      // Configurar los mocks
      mockQuery.mockResolvedValueOnce(resultadoBD);

      // Realizar la solicitud de prueba
      const response = await request(app)
        .post('/ingreso')
        .send(credenciales);
      
      // Verificar que la función query fue llamada con los valores extraídos correctamente
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['usuario1', 'pass1']
      );
      
      // Verificar la respuesta
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /crearusuariocliente', () => {
    it('debería crear un nuevo usuario cliente', async () => {
      // Preparar datos de prueba
      const nuevoUsuario = { 
        user: 'nuevo_usuario', 
        pass: 'nueva_pass',
        idpersona: 1
      };
      const resultadoBD = { 
        rows: [{ 
          users: 'nuevo_usuario', 
          pass: 'nueva_pass', 
          id_rol: '3',
          id_persona: 1
        }] 
      };
      
      // Configurar el mock
      mockQuery.mockResolvedValueOnce(resultadoBD);

      // Realizar la solicitud de prueba
      const response = await request(app)
        .post('/crearusuariocliente')
        .send(nuevoUsuario);
      
      // Verificar que la función query fue llamada correctamente
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO usuarios (users, pass,id_persona, id_rol)'),
        ['nuevo_usuario', 'nueva_pass', 1, '3']
      );
      
      // Verificar la respuesta
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: 'Usuario creado correctamente',
        usuario: resultadoBD.rows[0]
      });
    });

    it('debería manejar campos faltantes', async () => {
      // Datos incompletos
      const usuarioIncompleto = { user: 'usuario_incompleto' };

      // Realizar la solicitud de prueba
      const response = await request(app)
        .post('/crearusuariocliente')
        .send(usuarioIncompleto);
      
      // Verificar que query no fue llamado
      expect(mockQuery).not.toHaveBeenCalled();
      
      // Verificar la respuesta
      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Faltan campos obligatorios'
      });
    });

    it('debería manejar errores del servidor', async () => {
      // Configurar el mock para lanzar un error
      mockQuery.mockRejectedValueOnce(new Error('Error de prueba'));

      // Realizar la solicitud de prueba
      const response = await request(app)
        .post('/crearusuariocliente')
        .send({ user: 'usuario_error', pass: 'pass_error', idpersona: 1 });
      
      // Verificar la respuesta
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('POST /crear-usuario-agente', () => {
    it('debería crear un nuevo usuario agente', async () => {
      // Preparar datos de prueba
      const nuevoUsuario = { 
        user: 'nuevo_agente', 
        pass: 'nueva_pass',
        idpersona: 2
      };
      const resultadoBD = { 
        rows: [{ 
          users: 'nuevo_agente', 
          pass: 'nueva_pass', 
          id_rol: '2',
          id_persona: 2
        }] 
      };
      
      // Configurar el mock
      mockQuery.mockResolvedValueOnce(resultadoBD);

      // Realizar la solicitud de prueba
      const response = await request(app)
        .post('/crear-usuario-agente')
        .send(nuevoUsuario);
      
      // Verificar que la función query fue llamada correctamente
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO usuarios (users, pass,id_persona, id_rol)'),
        ['nuevo_agente', 'nueva_pass', 2, '2']
      );
      
      // Verificar la respuesta
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: 'Usuario creado correctamente',
        usuario: resultadoBD.rows[0]
      });
    });
  });

  describe('POST /verificar-datos', () => {
    it('debería verificar que un usuario no existe', async () => {
      // Configurar mocks para respuestas vacías
      mockQuery
        .mockResolvedValueOnce({ rows: [] }) // Usuario no existe
        .mockResolvedValueOnce({ rows: [] }) // Cédula no existe en agentes
        .mockResolvedValueOnce({ rows: [] }); // Cédula no existe en clientes

      // Realizar la solicitud de prueba
      const response = await request(app)
        .post('/verificar-datos')
        .send({ users: 'nuevo_usuario', cedula: '1234567890' });
      
      // Verificar las consultas
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT 1 FROM usuarios WHERE users = $1'),
        ['nuevo_usuario']
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT 1 FROM agente WHERE ced_agente = $1'),
        ['1234567890']
      );
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT 1 FROM cliente WHERE cedr_cli = $1'),
        ['1234567890']
      );
      
      // Verificar la respuesta
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        existe: false,
        message: "El nombre de usuario y la cédula están disponibles."
      });
    });

    it('debería detectar un usuario existente', async () => {
      // Configurar mock para usuario existente
      mockQuery.mockResolvedValueOnce({ rows: [{}] });

      // Realizar la solicitud de prueba
      const response = await request(app)
        .post('/verificar-datos')
        .send({ users: 'usuario_existente', cedula: '1234567890' });
      
      // Verificar la respuesta
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        existe: true,
        message: "El correo electronico ya está en uso."
      });
    });
  });

  describe('PUT /users-password', () => {
    it('debería actualizar la contraseña de un usuario', async () => {
      // Configurar mock para actualización exitosa
      const resultadoBD = { 
        rowCount: 1, 
        rows: [{ id_persona: 1, pass: 'nueva_pass' }] 
      };
      mockQuery.mockResolvedValueOnce(resultadoBD);

      // Realizar la solicitud de prueba
      const response = await request(app)
        .put('/users-password')
        .send({ id_pers: 1, pass: 'nueva_pass' });
      
      // Verificar la consulta
      expect(mockQuery).toHaveBeenCalledWith(
        "UPDATE usuarios SET pass = $1 WHERE id_persona = $2 RETURNING *",
        ['nueva_pass', 1]
      );
      
      // Verificar la respuesta
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: "Contraseña actualizada correctamente",
        usuario: resultadoBD.rows[0]
      });
    });

    it('debería manejar usuario no encontrado', async () => {
      // Configurar mock para usuario no encontrado
      mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });

      // Realizar la solicitud de prueba
      const response = await request(app)
        .put('/users-password')
        .send({ id_pers: 999, pass: 'nueva_pass' });
      
      // Verificar la respuesta
      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: "Usuario no encontrado"
      });
    });
  });
});