import request from 'supertest';
import app from '../src/index'; // Asegúrate de que esta exporta tu app de Express correctamente
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
    if (originalServer && originalServer.close) {
      await new Promise((resolve) => {
        originalServer.close(resolve);
      });
    }
    if (app.locals && app.locals.db && app.locals.db.close) {
      await app.locals.db.close();
    }
    if (global.db && global.db.close) {
      await global.db.close();
    }
    if (app.get && app.get('db') && app.get('db').close) {
      await app.get('db').close();
    }
  });

  beforeEach(() => {
    mockSendMail = jest.fn().mockResolvedValue({
      response: '250 Message accepted',
      messageId: '<mock-message-id@example.com>'
    });
    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /email/enviar-correo', () => {
    it('debería enviar un correo de validación exitosamente', async () => {
      const payload = {
        to: 'cliente.test@ejemplo.com',
        token: 'abc123token',
        pass: 'claveTemporal123'
      };

      const res = await request(app)
        .post('/email/enviar-correo')
        .send(payload)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(res.body).toHaveProperty('message', 'Correo enviado con éxito');
      expect(res.body).toHaveProperty('info');
      expect(mockSendMail).toHaveBeenCalledTimes(1);

      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.to).toBe(payload.to);
      expect(mailOptions.subject).toBe('Validar la creacion de la cuenta');
      expect(mailOptions.text).toContain('Validar mi cuenta');
      expect(mailOptions.text).toContain(payload.token);
      expect(mailOptions.text).toContain(payload.pass);
    });

    it('debería manejar errores cuando falta el destinatario', async () => {
      const payload = {
        token: 'abc123token',
        pass: 'claveTemporal123'
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
        to: 'cliente.test@ejemplo.com',
        pass: 'claveTemporal123'
      };

      const res = await request(app)
        .post('/email/enviar-correo')
        .send(payload)
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Correo enviado con éxito');
      expect(mockSendMail).toHaveBeenCalledTimes(1);

      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.text).toContain('undefined'); // El texto tendrá 'undefined' en la URL del token
    });

    it('debería manejar errores en el envío de correo', async () => {
      mockSendMail.mockRejectedValue(new Error('Error de prueba al enviar'));

      const payload = {
        to: 'cliente.test@ejemplo.com',
        token: 'abc123token',
        pass: 'claveTemporal123'
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

      expect(res.body).toHaveProperty('message', 'Correo enviado con éxito');
      expect(res.body).toHaveProperty('info');
      expect(mockSendMail).toHaveBeenCalledTimes(1);

      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.to).toBe(payload.to);
      expect(mailOptions.subject).toBe('Validación de contratación de seguro en Seguros.SA');
      expect(mailOptions.text).toContain('Validación de Contratación de Seguro');
      expect(mailOptions.text).toContain(payload.token);
    });

    it('debería manejar errores cuando falta el destinatario', async () => {
      const payload = {
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
      };

      const res = await request(app)
        .post('/email/correo-Gest-contratacion')
        .send(payload)
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Correo enviado con éxito');
      expect(mockSendMail).toHaveBeenCalledTimes(1);

      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.text).toContain('undefined');
    });

    it('debería manejar errores en el envío de correo', async () => {
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

  describe('POST /email/correo-agente', () => {
    it('debería enviar un correo de agente exitosamente', async () => {
      const payload = {
        to: 'agente.test@ejemplo.com',
        token: 'xyz789token',
        pass: 'claveAgente'
      };

      const res = await request(app)
        .post('/email/correo-agente')
        .send(payload)
        .expect(200)
        .expect('Content-Type', /json/);

      expect(res.body).toHaveProperty('message', 'Correo enviado con éxito');
      expect(res.body).toHaveProperty('info');
      expect(mockSendMail).toHaveBeenCalledTimes(1);

      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.to).toBe(payload.to);
      expect(mailOptions.subject).toBe('Validación de cuenta de Agente');
      expect(mailOptions.text).toContain(payload.token);
      expect(mailOptions.text).toContain(payload.pass);
    });

    it('debería manejar errores cuando falta el destinatario', async () => {
      const payload = {
        token: 'xyz789token',
        pass: 'claveAgente'
      };

      const res = await request(app)
        .post('/email/correo-agente')
        .send(payload)
        .expect(400);

      expect(res.body).toHaveProperty('message', 'Faltan datos para enviar el correo');
      expect(mockSendMail).not.toHaveBeenCalled();
    });

    it('debería enviar un correo aun cuando falta el token', async () => {
      const payload = {
        to: 'agente.test@ejemplo.com',
        pass: 'claveAgente'
      };

      const res = await request(app)
        .post('/email/correo-agente')
        .send(payload)
        .expect(200);

      expect(res.body).toHaveProperty('message', 'Correo enviado con éxito');
      expect(mockSendMail).toHaveBeenCalledTimes(1);

      const mailOptions = mockSendMail.mock.calls[0][0];
      expect(mailOptions.text).toContain('undefined');
    });

    it('debería manejar errores en el envío de correo', async () => {
      mockSendMail.mockRejectedValue(new Error('Error de prueba al enviar'));

      const payload = {
        to: 'agente.test@ejemplo.com',
        token: 'xyz789token',
        pass: 'claveAgente'
      };

      const res = await request(app)
        .post('/email/correo-agente')
        .send(payload)
        .expect(500);

      expect(res.body).toHaveProperty('message', 'Error al enviar el correo');
      expect(res.body).toHaveProperty('error');
    });
  });

});