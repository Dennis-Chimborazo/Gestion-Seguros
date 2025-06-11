import request from 'supertest';
import app from '../src/index.js';
import nodemailer from 'nodemailer';

// Mock de nodemailer para evitar enviar correos reales durante las pruebas
jest.mock('nodemailer');

describe('Pruebas para las rutas de email', () => {
  let mockSendMail;
  let originalServer;

  beforeAll(() => {
    // Guardar referencia al servidor
    originalServer = app.listen ? app : app.server;
  });

  afterAll(async () => {
    // Cerrar el servidor HTTP
    if (originalServer && originalServer.close) {
      await new Promise((resolve) => {
        originalServer.close(resolve);
      });
    }
    
    // Cerrar la conexión a la base de datos si está disponible
    if (app.locals && app.locals.db && app.locals.db.close) {
      await app.locals.db.close();
    }
    
    // Alternativa si la conexión está en un objeto global
    if (global.db && global.db.close) {
      await global.db.close();
    }
    
    // Si tienes acceso directo a la conexión de la base de datos
    if (app.get && app.get('db') && app.get('db').close) {
      await app.get('db').close();
    }
  });

  beforeEach(() => {
    // Configurar el mock del transportador antes de cada prueba
    mockSendMail = jest.fn().mockResolvedValue({
      response: '250 Message accepted',
      messageId: '<mock-message-id@example.com>'
    });

    // Mock del método createTransport de nodemailer
    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail
    });
  });

  afterEach(() => {
    // Limpiar los mocks después de cada prueba
    jest.clearAllMocks();
  });

  describe('POST /email/enviar-correo', () => {
    it('debería enviar un correo de validación exitosamente', async () => {
      const payload = {
        to: 'cliente.test@ejemplo.com',
        token: 'abc123token'
      };

      const res = await request(app)
        .post('/email/enviar-correo')
        .send(payload)
        .expect(200)
        .expect('Content-Type', /json/);

      // Verificar la respuesta
      expect(res.body).toHaveProperty('message', 'Correo enviado con éxito');
      expect(res.body).toHaveProperty('info');

      // Verificar que se llamó a sendMail con los parámetros correctos
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.to).toBe(payload.to);
      expect(mailOptions.subject).toBe('Validar la creacion de la cuenta');
      expect(mailOptions.text).toContain('Validar mi cuenta');
      expect(mailOptions.text).toContain(payload.token);
    });

    it('debería manejar errores cuando falta el destinatario', async () => {
      const payload = {
        // Falta el campo 'to'
        token: 'abc123token'
      };

      const res = await request(app)
        .post('/email/enviar-correo')
        .send(payload)
        .expect(400);

      expect(res.body).toHaveProperty('message', 'Faltan datos para enviar el correo');
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('debería enviar un correo aun cuando falta el token', async () => {
      const payload = {
        to: 'cliente.test@ejemplo.com'
        // Falta el campo 'token'
      };

      const res = await request(app)
        .post('/email/enviar-correo')
        .send(payload)
        .expect(200);

      // Verificar que se envió el correo, aunque sin token
      expect(res.body).toHaveProperty('message', 'Correo enviado con éxito');
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      
      // Verificar que se usa 'undefined' en lugar del token en la URL
      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.text).toContain('undefined');
    });

    it('debería manejar errores en el envío de correo', async () => {
      // Simular un error en el envío
      mockSendMail.mockRejectedValue(new Error('Error de prueba al enviar'));

      const payload = {
        to: 'cliente.test@ejemplo.com',
        token: 'abc123token'
      };

      const res = await request(app)
        .post('/email/enviar-correo')
        .send(payload)
        .expect(500);

      expect(res.body).toHaveProperty('message', 'Error al enviar el correo');
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('POST /email/correo-Gest-contratacion', () => {
    it('debería enviar un correo de contratación exitosamente', async () => {
      const payload = {
        to: 'cliente.test@ejemplo.com',
        token: 'def456token'
      };

      const res = await request(app)
        .post('/email/correo-Gest-contratacion')
        .send(payload)
        .expect(200)
        .expect('Content-Type', /json/);

      // Verificar la respuesta
      expect(res.body).toHaveProperty('message', 'Correo enviado con éxito');
      expect(res.body).toHaveProperty('info');

      // Verificar que se llamó a sendMail con los parámetros correctos
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.to).toBe(payload.to);
      expect(mailOptions.subject).toBe('Validación de contratación de seguro en Seguros.SA');
      expect(mailOptions.text).toContain('Validar Contrato');
      expect(mailOptions.text).toContain(payload.token);
    });

    it('debería manejar errores cuando falta el destinatario', async () => {
      const payload = {
        // Falta el campo 'to'
        token: 'def456token'
      };

      const res = await request(app)
        .post('/email/correo-Gest-contratacion')
        .send(payload)
        .expect(400);

      expect(res.body).toHaveProperty('message', 'Faltan datos para enviar el correo');
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('debería enviar un correo aun cuando falta el token', async () => {
      const payload = {
        to: 'cliente.test@ejemplo.com'
        // Falta el campo 'token'
      };

      const res = await request(app)
        .post('/email/correo-Gest-contratacion')
        .send(payload)
        .expect(200);

      // Verificar que se envió el correo, aunque sin token
      expect(res.body).toHaveProperty('message', 'Correo enviado con éxito');
      expect(mockSendMail).toHaveBeenCalledTimes(1);
      
      // Verificar que se usa 'undefined' en lugar del token en la URL
      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.text).toContain('undefined');
    });

    it('debería manejar errores en el envío de correo', async () => {
      // Simular un error en el envío
      mockSendMail.mockRejectedValue(new Error('Error de prueba al enviar'));

      const payload = {
        to: 'cliente.test@ejemplo.com',
        token: 'def456token'
      };

      const res = await request(app)
        .post('/email/correo-Gest-contratacion')
        .send(payload)
        .expect(500);

      expect(res.body).toHaveProperty('message', 'Error al enviar el correo');
      expect(res.body).toHaveProperty('error');
    });
  });
});