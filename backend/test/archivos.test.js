const request = require('supertest');
const express = require('express');

// MOCKS
jest.mock('multer', () => {
  const m = () => ({
    single: jest.fn(() => (req, res, next) => {
      // Este middleware será reemplazado por test según se necesite
      next();
    })
  });
  m.diskStorage = jest.fn(() => ({}));
  return m;
});
jest.mock('fs');
jest.mock('path', () => ({
  ...jest.requireActual('path'),
  join: jest.fn((...args) => args.join('/'))
}));

const fs = require('fs');
const path = require('path');

// Importar router después de mocks
const router = require('../src/routes/archivos.routes.js');

const app = express();
app.use(express.json());
app.use(router);

describe('Rutas de archivos', () => {
  let originalSingle;
  beforeEach(() => {
    jest.clearAllMocks();
    // Permite sobrescribir el comportamiento de single en cada test
    const multer = require('multer');
    originalSingle = multer().single;
  });

  describe('POST /foto-perfil/:subfolder', () => {
    it('debería subir una foto de perfil correctamente', async () => {
      // Sobrescribe single para este test
      require('multer')().single.mockImplementationOnce(field => (req, res, next) => {
        req.file = { filename: 'foto.jpg' };
        next();
      });

      const res = await request(app)
        .post('/foto-perfil/pruebasub')
        .attach('profilePhoto', Buffer.from('fake'), 'foto.jpg'); // El archivo no importa

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'Foto de perfil subida correctamente',
        filename: 'foto.jpg'
      });
    });

    it('debería manejar si no se recibe foto', async () => {
      require('multer')().single.mockImplementationOnce(field => (req, res, next) => {
        req.file = undefined;
        next();
      });

      const res = await request(app)
        .post('/foto-perfil/pruebasub')
        .attach('profilePhoto', Buffer.from('fake'), 'foto.jpg');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'No se recibió la foto de perfil' });
    });
  });

  describe('POST /cedula-pdf/:subfolder', () => {
    it('debería subir un PDF de cédula correctamente', async () => {
      require('multer')().single.mockImplementationOnce(field => (req, res, next) => {
        req.file = { filename: 'cedula.pdf' };
        next();
      });

      const res = await request(app)
        .post('/cedula-pdf/subpdf')
        .attach('cedulaPdf', Buffer.from('fake'), 'cedula.pdf');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        message: 'PDF de cédula subido correctamente',
        filename: 'cedula.pdf'
      });
    });

    it('debería manejar si no se recibe el PDF', async () => {
      require('multer')().single.mockImplementationOnce(field => (req, res, next) => {
        req.file = undefined;
        next();
      });

      const res = await request(app)
        .post('/cedula-pdf/subpdf')
        .attach('cedulaPdf', Buffer.from('fake'), 'cedula.pdf');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'No se recibió el PDF de la cédula' });
    });
  });

  describe('GET /buscar/:subfolder', () => {
    it('debería devolver la url de un archivo de imagen', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdir.mockImplementation((dir, cb) => cb(null, ['foto.jpg', 'otra.png']));
      const res = await request(app)
        .get('/buscar/mifolder')
        .query({ tipo: 'imagen' });
      expect(res.status).toBe(200);
      expect(res.body.url).toContain('/uploads/cliente/mifolder/foto.jpg');
    });

    it('debería devolver la url de un archivo PDF', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdir.mockImplementation((dir, cb) => cb(null, ['documento.pdf']));
      const res = await request(app)
        .get('/buscar/mifolder')
        .query({ tipo: 'pdf' });
      expect(res.status).toBe(200);
      expect(res.body.url).toContain('/uploads/cliente/mifolder/documento.pdf');
    });

    it('debería devolver la url del primer archivo si no hay filtro tipo', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdir.mockImplementation((dir, cb) => cb(null, ['algo.doc', 'foto.jpg']));
      const res = await request(app)
        .get('/buscar/otrafolder');
      expect(res.status).toBe(200);
      expect(res.body.url).toContain('/uploads/cliente/otrafolder/algo.doc');
    });

    it('debería manejar carpeta no existente', async () => {
      fs.existsSync.mockReturnValue(false);
      const res = await request(app)
        .get('/buscar/noexiste');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'Carpeta no encontrada' });
    });

    it('debería manejar error de lectura de archivos', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdir.mockImplementation((dir, cb) => cb(new Error('fail'), null));
      const res = await request(app)
        .get('/buscar/mifolder');
      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Error leyendo archivos' });
    });

    it('debería manejar si no encuentra archivos del tipo especificado', async () => {
      fs.existsSync.mockReturnValue(true);
      fs.readdir.mockImplementation((dir, cb) => cb(null, ['algo.txt']));
      const res = await request(app)
        .get('/buscar/mifolder')
        .query({ tipo: 'pdf' });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'No se encontró archivo del tipo especificado' });
    });
  });
});