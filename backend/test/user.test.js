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
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('debería devolver todos los usuarios', async () => {
      const usuariosPrueba = [{ id: 1, users: 'usuario1', pass: 'pass1' }];
      mockQuery.mockResolvedValueOnce({ rows: usuariosPrueba });
      const response = await request(app).get('/users');
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM usuarios');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ rows: usuariosPrueba });
    });

    it('debería manejar errores del servidor', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB error'));
      const response = await request(app).get('/users');
      expect(response.status).toBe(500);
      expect(response.body).toEqual({});
      // o si quieres asegurar el status code solamente:
      expect(response.status).toBe(500);
    });

    describe('POST /ingreso', () => {
      it('debería autenticar un admin válido y devolver un token', async () => {
        const credenciales = { user: 'admin1', pass: 'pass1' };
        const resultadoBD = {
          rowCount: 1,
          rows: [{ users: 'admin1', pass: 'pass1', id_persona: 1, nom_rol: 'admin' }]
        };
        mockQuery.mockResolvedValueOnce(resultadoBD);

        const response = await request(app)
          .post('/ingreso')
          .send(credenciales);

        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('SELECT u.users, u.pass, u.id_persona, r.nom_rol'),
          ['admin1', 'pass1']
        );
        expect(jwt.sign).toHaveBeenCalled();
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
        const credenciales = { user: 'cliente1', pass: 'pass1' };
        const resultadoBD = {
          rowCount: 1,
          rows: [{ users: 'cliente1', pass: 'pass1', id_persona: 2, nom_rol: 'cliente' }]
        };
        const estadoCliente = { rowCount: 1, rows: [{ id_estado: 1 }] };
        mockQuery
          .mockResolvedValueOnce(resultadoBD)
          .mockResolvedValueOnce(estadoCliente);

        const response = await request(app)
          .post('/ingreso')
          .send(credenciales);

        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('SELECT u.users, u.pass, u.id_persona, r.nom_rol'),
          ['cliente1', 'pass1']
        );
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('SELECT id_estado FROM cliente WHERE id_pers = $1'),
          [2]
        );
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
        const credenciales = { user: 'cliente2', pass: 'pass2' };
        const resultadoBD = {
          rowCount: 1,
          rows: [{ users: 'cliente2', pass: 'pass2', id_persona: 3, nom_rol: 'cliente' }]
        };
        const estadoCliente = { rowCount: 1, rows: [{ id_estado: 2 }] };
        mockQuery
          .mockResolvedValueOnce(resultadoBD)
          .mockResolvedValueOnce(estadoCliente);

        const response = await request(app)
          .post('/ingreso')
          .send(credenciales);

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          success: false,
          user: "El cliente está desactivado."
        });
      });

      it('debería manejar credenciales inválidas', async () => {
        mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });
        const response = await request(app)
          .post('/ingreso')
          .send({ user: 'usuario_invalido', pass: 'pass_invalida' });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          success: false,
          user: "Credenciales no encontradas"
        });
      });

      it('debería manejar arrays en user y pass', async () => {
        const credenciales = { user: ['usuario1'], pass: ['pass1'] };
        const resultadoBD = {
          rowCount: 1,
          rows: [{ users: 'usuario1', pass: 'pass1', id_persona: 1, nom_rol: 'admin' }]
        };
        mockQuery.mockResolvedValueOnce(resultadoBD);

        const response = await request(app)
          .post('/ingreso')
          .send(credenciales);

        expect(mockQuery).toHaveBeenCalledWith(
          expect.any(String),
          ['usuario1', 'pass1']
        );
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
      });

      it('debería manejar error de base de datos', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));
        const response = await request(app)
          .post('/ingreso')
          .send({ user: 'user', pass: 'pass' });
        expect(response.status).toBe(500);
        expect(response.body).toEqual({ success: false, message: "Error interno del servidor" });
      });
    });

    describe('POST /crearusuariocliente', () => {
      it('debería crear un nuevo usuario cliente', async () => {
        const nuevoUsuario = {
          user: 'nuevo_usuario', pass: 'nueva_pass', idpersona: 1
        };
        const resultadoBD = { rows: [{ users: 'nuevo_usuario', pass: 'nueva_pass', id_rol: '3', id_persona: 1 }] };
        mockQuery.mockResolvedValueOnce(resultadoBD);

        const response = await request(app)
          .post('/crearusuariocliente')
          .send(nuevoUsuario);

        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO usuarios (users, pass,id_persona, id_rol)'),
          ['nuevo_usuario', 'nueva_pass', 1, '3']
        );
        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          success: true,
          message: 'Usuario creado correctamente',
          usuario: resultadoBD.rows[0]
        });
      });

      it('debería manejar campos faltantes', async () => {
        const usuarioIncompleto = { user: 'usuario_incompleto' };
        const response = await request(app)
          .post('/crearusuariocliente')
          .send(usuarioIncompleto);

        expect(mockQuery).not.toHaveBeenCalled();
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          success: false,
          message: 'Faltan campos obligatorios'
        });
      });

      it('debería manejar errores del servidor', async () => {
        mockQuery.mockRejectedValueOnce(new Error('Error de prueba'));
        const response = await request(app)
          .post('/crearusuariocliente')
          .send({ user: 'usuario_error', pass: 'pass_error', idpersona: 1 });
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          success: false,
          message: 'Error interno del servidor'
        });
      });
    });

    describe('POST /crear-usuario-agente', () => {
      it('debería crear un nuevo usuario agente', async () => {
        const nuevoUsuario = {
          user: 'nuevo_agente', pass: 'nueva_pass', idpersona: 2
        };
        const resultadoBD = { rows: [{ users: 'nuevo_agente', pass: 'nueva_pass', id_rol: '2', id_persona: 2 }] };
        mockQuery.mockResolvedValueOnce(resultadoBD);

        const response = await request(app)
          .post('/crear-usuario-agente')
          .send(nuevoUsuario);

        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO usuarios (users, pass,id_persona, id_rol)'),
          ['nuevo_agente', 'nueva_pass', 2, '2']
        );
        expect(response.status).toBe(201);
        expect(response.body).toEqual({
          success: true,
          message: 'Usuario creado correctamente',
          usuario: resultadoBD.rows[0]
        });
      });

      it('debería manejar campos faltantes', async () => {
        const usuarioIncompleto = { user: 'agente_incompleto' };
        const response = await request(app)
          .post('/crear-usuario-agente')
          .send(usuarioIncompleto);

        expect(mockQuery).not.toHaveBeenCalled();
        expect(response.status).toBe(400);
        expect(response.body).toEqual({
          success: false,
          message: 'Faltan campos obligatorios'
        });
      });

      it('debería manejar errores del servidor', async () => {
        mockQuery.mockRejectedValueOnce(new Error('Error de prueba'));
        const response = await request(app)
          .post('/crear-usuario-agente')
          .send({ user: 'usuario_error', pass: 'pass_error', idpersona: 2 });
        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          success: false,
          message: 'Error interno del servidor'
        });
      });
    });

    describe('POST /verificar-datos', () => {
      it('debería verificar que un usuario no existe', async () => {
        mockQuery
          .mockResolvedValueOnce({ rows: [] }) // Usuario no existe
          .mockResolvedValueOnce({ rows: [] }) // Cédula no existe en agentes
          .mockResolvedValueOnce({ rows: [] }); // Cédula no existe en clientes

        const response = await request(app)
          .post('/verificar-datos')
          .send({ users: 'nuevo_usuario', cedula: '1234567890' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          existe: false,
          message: "El nombre de usuario y la cédula están disponibles."
        });
      });

      it('debería detectar un usuario existente', async () => {
        mockQuery.mockResolvedValueOnce({ rows: [{}] });

        const response = await request(app)
          .post('/verificar-datos')
          .send({ users: 'usuario_existente', cedula: '1234567890' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          existe: true,
          message: "El correo electronico ya está en uso."
        });
      });

      it('debería detectar una cédula existente en agente', async () => {
        mockQuery
          .mockResolvedValueOnce({ rows: [] }) // Usuario no existe
          .mockResolvedValueOnce({ rows: [{}] }); // Cédula existe en agente

        const response = await request(app)
          .post('/verificar-datos')
          .send({ users: 'usuario_libre', cedula: '1234567890' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          existe: true,
          message: "El número de cédula ya existe en agentes."
        });
      });

      it('debería detectar una cédula existente en cliente', async () => {
        mockQuery
          .mockResolvedValueOnce({ rows: [] }) // Usuario no existe
          .mockResolvedValueOnce({ rows: [] }) // Cédula no existe en agente
          .mockResolvedValueOnce({ rows: [{}] }); // Cédula existe en cliente

        const response = await request(app)
          .post('/verificar-datos')
          .send({ users: 'usuario_libre', cedula: '1234567890' });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
          existe: true,
          message: "El número de cédula ya existe en clientes."
        });
      });

      it('debería manejar error de base de datos', async () => {
        mockQuery.mockRejectedValueOnce(new Error('DB error'));
        const response = await request(app)
          .post('/verificar-datos')
          .send({ users: 'user', cedula: 'cedula' });

        expect(response.status).toBe(500);
        expect(response.body).toEqual({
          message: "Error al verificar si el usuario existe",
          error: expect.any(Object)
        });
      });

      describe('PUT /users-password', () => {
        it('debería actualizar la contraseña de un usuario', async () => {
          const resultadoBD = {
            rowCount: 1,
            rows: [{ id_persona: 1, pass: 'nueva_pass' }]
          };
          mockQuery.mockResolvedValueOnce(resultadoBD);

          const response = await request(app)
            .put('/users-password')
            .send({ id_pers: 1, pass: 'nueva_pass' });

          expect(mockQuery).toHaveBeenCalledWith(
            "UPDATE usuarios SET pass = $1 WHERE id_persona = $2 RETURNING *",
            ['nueva_pass', 1]
          );
          expect(response.status).toBe(200);
          expect(response.body).toEqual({
            message: "Contraseña actualizada correctamente",
            usuario: resultadoBD.rows[0]
          });
        });

        it('debería manejar usuario no encontrado', async () => {
          mockQuery.mockResolvedValueOnce({ rowCount: 0, rows: [] });

          const response = await request(app)
            .put('/users-password')
            .send({ id_pers: 999, pass: 'nueva_pass' });

          expect(response.status).toBe(404);
          expect(response.body).toEqual({
            error: "Usuario no encontrado"
          });
        });

        it('debería manejar campos faltantes', async () => {
          const response = await request(app)
            .put('/users-password')
            .send({ id_pers: 1 }); // Falta el campo pass

          expect(mockQuery).not.toHaveBeenCalled();
          expect(response.status).toBe(400);
          expect(response.body).toEqual({
            error: "Faltan datos requeridos"
          });
        });

        it('debería manejar error de base de datos', async () => {
          mockQuery.mockRejectedValueOnce(new Error('DB error'));
          const response = await request(app)
            .put('/users-password')
            .send({ id_pers: 1, pass: 'fail' });

          expect(response.status).toBe(500);
          expect(response.body).toEqual({
            error: "Error interno del servidor"
          });
        });
      });
    });
  });
});