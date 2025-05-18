const { expect } = require('chai');
const request = require('supertest');
const app = require('../../src/index');
const jwt = require('jsonwebtoken');


const USUARIO_VALIDO = {
  user: 'admin', 
  pass: 'admin'  
};

const USUARIO_INVALIDO = {
  user: 'fake', 
  pass: 'fake'
};

describe('Pruebas para la ruta /user', () => {
  let token;  // almacena el token y usarlo en pruebas que requieran autenticación

  // Antes de todas las pruebas, obtener un token válido
  before(async () => {
    try {
      const response = await request(app)
        .post('/user/ingreso')
        .send(USUARIO_VALIDO);
      
      if (response.body.success) {
        token = response.body.token;
      } else {
        console.warn('⚠️ No se pudo obtener token. Verifica las credenciales de prueba.');
      }
    } catch (error) {
      console.error('Error en la configuración de pruebas:', error);
    }
  });

  // Prueba GET /user/users
  describe('GET /user/users', () => {
    it('debería retornar un array de usuarios', async () => {
      const res = await request(app)
        .get('/user/users')
        .expect(200)
        .expect('Content-Type', /json/);
       
      
      if (res.body.rows) {
        expect(res.body.rows).to.be.an('array');
        if (res.body.rows.length > 0) {
          const primerUsuario = res.body.rows[0];
          expect(primerUsuario).to.have.property('users');
        }
      } else {
        expect(res.body).to.be.an('array');
        if (res.body.length > 0) {
          const primerUsuario = res.body[0];
          expect(primerUsuario).to.have.property('users');
        }
      }
    });
  });

  // Pruebas para POST /user/ingreso
  describe('POST /user/ingreso', () => {
    // Prueba de autenticación exitosa
    it('debería autenticar un usuario con credenciales válidas', async () => {
      const response = await request(app)
        .post('/user/ingreso')
        .send(USUARIO_VALIDO)
        .expect(200);

      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('token');
      expect(response.body).to.have.property('user');
      
      // Verificar que el token es válido
      const token = response.body.token;
      const decoded = jwt.verify(token, 'gestionPruebas');
      expect(decoded).to.exist;
    });

    // Prueba con credenciales inválidas
    it('debería fallar con credenciales incorrectas', async () => {
      const response = await request(app)
        .post('/user/ingreso')
        .send(USUARIO_INVALIDO)
        .expect(200);

      expect(response.body.success).to.be.false;
      expect(response.body).to.have.property('user', 'credenciales no encontradas');
      expect(response.body).to.not.have.property('token');
    });

    // Prueba adicional para el formato del formulario
    it('debería manejar cuando el usuario/contraseña vienen como arrays', async () => {
      const response = await request(app)
        .post('/user/ingreso')
        .send({
          user: [USUARIO_VALIDO.user],
          pass: [USUARIO_VALIDO.pass]
        })
        .expect(200);

      expect(response.body).to.have.property('success', true);
      expect(response.body).to.have.property('token');
    });
  });


});