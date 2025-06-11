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
    it('debería autenticar un usuario válido y devolver un token', async () => {
      // Preparar datos de prueba
      const credenciales = { user: 'usuario1', pass: 'pass1' };
      const resultadoBD = { 
        rowCount: 1, 
        rows: [{ users: 'usuario1', pass: 'pass1', nom_rol: 'cliente' }] 
      };
      
      // Configurar los mocks
      mockQuery.mockResolvedValueOnce(resultadoBD);

      // Realizar la solicitud de prueba
      const response = await request(app)
        .post('/ingreso')
        .send(credenciales);
      
      // Verificar que la función query fue llamada correctamente
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT u.users,u.pass,nom_rol FROM usuarios'),
        ['usuario1', 'pass1']
      );
      
      // Verificar que se llamó a jwt.sign
      expect(jwt.sign).toHaveBeenCalled();
      
      // Verificar la respuesta
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        user: resultadoBD.rows[0],
        token: 'token-de-prueba'
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
        user: 'credenciales no encontradas'
      });
    });

    it('debería manejar errores del servidor', async () => {
      // Configurar el mock para lanzar un error
      mockQuery.mockRejectedValueOnce(new Error('Error de prueba'));

      // Realizar la solicitud de prueba
      const response = await request(app)
        .post('/ingreso')
        .send({ user: 'usuario1', pass: 'pass1' });
      
      // Verificar la respuesta
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: false,
        message: 'Error interno del servidor'
      });
    });

    it('debería manejar arrays en user y pass', async () => {
      // Preparar datos de prueba con arrays
      const credenciales = { user: ['usuario1'], pass: ['pass1'] };
      const resultadoBD = { 
        rowCount: 1, 
        rows: [{ users: 'usuario1', pass: 'pass1', nom_rol: 'cliente' }] 
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
      const nuevoUsuario = { user: 'nuevo_usuario', pass: 'nueva_pass' };
      const resultadoBD = { 
        rows: [{ users: 'nuevo_usuario', pass: 'nueva_pass', id_rol: '3' }] 
      };
      
      // Configurar el mock
      mockQuery.mockResolvedValueOnce(resultadoBD);

      // Realizar la solicitud de prueba
      const response = await request(app)
        .post('/crearusuariocliente')
        .send(nuevoUsuario);
      
      // Verificar que la función query fue llamada correctamente
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO usuarios'),
        ['nuevo_usuario', 'nueva_pass', '3']
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
        .send({ user: 'usuario_error', pass: 'pass_error' });
      
      // Verificar la respuesta
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Error interno del servidor'
      });
    });
  });

  describe('POST /generar_token_email', () => {
    it('debería generar un token para validación de email', async () => {
      // Preparar datos de prueba
      const datos = { id_pers: 1, url: 'https://ejemplo.com/validar' };
      
      // Configurar los mocks
      mockQuery.mockResolvedValueOnce({ rowCount: 1 });

      // Realizar la solicitud de prueba
      const response = await request(app)
        .post('/generar_token_email')
        .send(datos);
      
      // Verificar que jwt.sign fue llamado correctamente
      expect(jwt.sign).toHaveBeenCalledWith(
        { id_pers: 1 },
        'emailCliente',
        { expiresIn: '1h' }
      );
      
      // Verificar que la función query fue llamada correctamente
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO validar_email'),
        ['https://ejemplo.com/validar', 'token-email-prueba']
      );
      
      // Verificar la respuesta
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        token: 'token-email-prueba',
        message: 'Token creado y guardado exitosamente.'
      });
    });

    it('debería manejar errores del servidor', async () => {
      // Configurar el mock para lanzar un error
      mockQuery.mockRejectedValueOnce(new Error('Error de prueba'));

      // Realizar la solicitud de prueba
      const response = await request(app)
        .post('/generar_token_email')
        .send({ id_pers: 1, url: 'https://ejemplo.com/validar' });
      
      // Verificar la respuesta
      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Error del servidor'
      });
    });
  });
});