const request = require('supertest');
const express = require('express');

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

// Mock de multer
jest.mock('multer', () => {
  const multerMock = jest.fn(() => ({
    single: jest.fn(() => (req, res, next) => {
      // Simular el middleware de multer
      if (req.headers['content-type'] && req.headers['content-type'].includes('multipart/form-data')) {
        req.file = {
          buffer: Buffer.from('archivo de prueba'),
          originalname: 'test.pdf',
          mimetype: 'application/pdf'
        };
      }
      next();
    })
  }));
  multerMock.memoryStorage = jest.fn(() => ({}));
  return multerMock;
});

// Importar el router después de configurar los mocks
// CAMBIA ESTA RUTA POR LA CORRECTA DE TU ARCHIVO
const router = require('../src/routes/archivosadicionales.route.js'); // <-- Ajusta el nombre aquí

// Configuración de la app Express para pruebas
const app = express();
app.use(express.json());
app.use(router);

describe('Rutas de archivos cliente', () => {
  // Obtener referencia directa al mock de query
  const { DataBase } = require('../src/database.js');
  const mockQuery = DataBase().getConexion().query;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /subir-archivo', () => {
    it('debería subir un archivo exitosamente', async () => {
      const archivoMock = {
        rows: [{ id_archivos_cliente: 123 }]
      };
      mockQuery.mockResolvedValueOnce(archivoMock);

      const response = await request(app)
        .post('/subir-archivo')
        .field('tipo', 'pdf')
        .field('id_pers', '1')
        .attach('archivo', Buffer.from('contenido del archivo'), 'test.pdf');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Archivo guardado',
        id: 123
      });
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO archivos_cliente'),
        expect.arrayContaining(['pdf', expect.any(Buffer), 'test.pdf', 'application/pdf', '1'])
      );
    });

    it('debería fallar si no se proporciona archivo', async () => {
      const response = await request(app)
        .post('/subir-archivo')
        .field('tipo', 'pdf')
        .field('id_pers', '1');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Archivo requerido'
      });
    });

    it('debería manejar errores de base de datos', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Error de BD'));

      const response = await request(app)
        .post('/subir-archivo')
        .field('tipo', 'pdf')
        .field('id_pers', '1')
        .attach('archivo', Buffer.from('contenido'), 'test.pdf');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Error al guardar el archivo'
      });
    });
  });

  describe('GET /buscar-archivo', () => {
    it('debería encontrar y devolver un archivo', async () => {
      const archivoMock = {
        rows: [{
          nombre_archivo_cliente: 'documento.pdf',
          mime_type_archivo_cliente: 'application/pdf',
          archivo: Buffer.from('contenido del archivo')
        }]
      };
      mockQuery.mockResolvedValueOnce(archivoMock);

      const response = await request(app)
        .get('/buscar-archivo')
        .query({ id: '1' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toBe('inline; filename="documento.pdf"');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id_archivos_cliente = $1'),
        ['1']
      );
    });

    it('debería manejar array de IDs tomando el primero', async () => {
      const archivoMock = {
        rows: [{
          nombre_archivo_cliente: 'test.pdf',
          mime_type_archivo_cliente: 'application/pdf',
          archivo: Buffer.from('contenido')
        }]
      };
      mockQuery.mockResolvedValueOnce(archivoMock);

      const response = await request(app)
        .get('/buscar-archivo')
        .query({ id: ['1', '2', '3'] });

      expect(response.status).toBe(200);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['1'] // Debe tomar solo el primer elemento
      );
    });

    it('debería retornar 404 si no encuentra el archivo', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/buscar-archivo')
        .query({ id: '999' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Archivo no encontrado'
      });
    });

    it('debería manejar errores de base de datos', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Error de BD'));

      const response = await request(app)
        .get('/buscar-archivo')
        .query({ id: '1' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Error al recuperar el archivo'
      });
    });
  });

  describe('GET /buscar-imagen', () => {
    it('debería encontrar una imagen por ID de persona', async () => {
      const imagenMock = {
        rows: [{
          nombre_archivo_cliente: 'foto.jpg',
          mime_type_archivo_cliente: 'image/jpeg',
          archivo: Buffer.from('contenido de imagen')
        }]
      };
      mockQuery.mockResolvedValueOnce(imagenMock);

      const response = await request(app)
        .get('/buscar-imagen')
        .query({ id: '1' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('image/jpeg');
      expect(response.headers['content-disposition']).toBe('inline; filename="foto.jpg"');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("WHERE id_pers = $1 and tipo_archivos_cliente = 'imagen'"),
        ['1']
      );
    });

    it('debería manejar array de IDs en buscar-imagen', async () => {
      const imagenMock = {
        rows: [{
          nombre_archivo_cliente: 'foto.jpg',
          mime_type_archivo_cliente: 'image/jpeg',
          archivo: Buffer.from('imagen')
        }]
      };
      mockQuery.mockResolvedValueOnce(imagenMock);

      const response = await request(app)
        .get('/buscar-imagen')
        .query({ id: ['1', 'extra'] });

      expect(response.status).toBe(200);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['1'] // Solo el primer elemento
      );
    });

    it('debería retornar 404 si no encuentra imagen', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/buscar-imagen')
        .query({ id: '999' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({
        error: 'Archivo no encontrado'
      });
    });

    it('debería manejar errores de base de datos en buscar-imagen', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Error de BD'));

      const response = await request(app)
        .get('/buscar-imagen')
        .query({ id: '1' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Error al recuperar el archivo'
      });
    });

    it('debería verificar que la consulta filtra por tipo imagen', async () => {
      const imagenMock = {
        rows: [{
          nombre_archivo_cliente: 'foto.jpg',
          mime_type_archivo_cliente: 'image/jpeg',
          archivo: Buffer.from('imagen')
        }]
      };
      mockQuery.mockResolvedValueOnce(imagenMock);

      await request(app)
        .get('/buscar-imagen')
        .query({ id: '1' });

      const queryCall = mockQuery.mock.calls[0][0];
      expect(queryCall).toContain("tipo_archivos_cliente = 'imagen'");
      expect(queryCall).toContain("WHERE id_pers = $1");
    });
  });

  describe('Casos edge adicionales', () => {
    it('debería manejar diferentes tipos de archivo', async () => {
      const tiposArchivo = [
        { tipo: 'imagen', mimetype: 'image/jpeg', nombre: 'foto.jpg' },
        { tipo: 'pdf', mimetype: 'application/pdf', nombre: 'documento.pdf' },
        { tipo: 'documento', mimetype: 'application/msword', nombre: 'texto.doc' }
      ];

      for (const tipoArchivo of tiposArchivo) {
        jest.clearAllMocks();
        mockQuery.mockResolvedValueOnce({
          rows: [{ id_archivos_cliente: 456 }]
        });

        const response = await request(app)
          .post('/subir-archivo')
          .field('tipo', tipoArchivo.tipo)
          .field('id_pers', '1')
          .attach('archivo', Buffer.from('contenido'), tipoArchivo.nombre);

        expect(response.status).toBe(200);
        expect(mockQuery).toHaveBeenCalledWith(
          expect.any(String),
          expect.arrayContaining([tipoArchivo.tipo])
        );
      }
    });

    it('debería manejar diferentes tipos MIME en respuesta', async () => {
      const tiposMime = [
        { mime: 'application/pdf', nombre: 'documento.pdf' },
        { mime: 'image/jpeg', nombre: 'foto.jpg' },
        { mime: 'image/png', nombre: 'imagen.png' }
      ];

      for (const tipo of tiposMime) {
        jest.clearAllMocks();
        mockQuery.mockResolvedValueOnce({
          rows: [{
            nombre_archivo_cliente: tipo.nombre,
            mime_type_archivo_cliente: tipo.mime,
            archivo: Buffer.from('contenido')
          }]
        });

        const response = await request(app)
          .get('/buscar-archivo')
          .query({ id: '1' });

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe(tipo.mime);
        expect(response.headers['content-disposition']).toBe(`inline; filename="${tipo.nombre}"`);
      }
    });

    it('debería manejar archivos con nombres especiales', async () => {
      const nombresEspeciales = [
        'archivo con espacios.pdf',
        'archivo_con_guiones.jpg',
        'ARCHIVO_MAYUSCULAS.PNG'
      ];

      for (const nombre of nombresEspeciales) {
        jest.clearAllMocks();
        mockQuery.mockResolvedValueOnce({
          rows: [{
            nombre_archivo_cliente: nombre,
            mime_type_archivo_cliente: 'application/pdf',
            archivo: Buffer.from('contenido')
          }]
        });

        const response = await request(app)
          .get('/buscar-archivo')
          .query({ id: '1' });

        expect(response.status).toBe(200);
        expect(response.headers['content-disposition']).toBe(`inline; filename="${nombre}"`);
      }
    });

    it('debería verificar la estructura de la consulta INSERT', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{ id_archivos_cliente: 123 }]
      });

      await request(app)
        .post('/subir-archivo')
        .field('tipo', 'pdf')
        .field('id_pers', '1')
        .attach('archivo', Buffer.from('contenido'), 'test.pdf');

      const queryCall = mockQuery.mock.calls[0][0];
      expect(queryCall).toContain('INSERT INTO archivos_cliente');
      expect(queryCall).toContain('tipo_archivos_cliente');
      expect(queryCall).toContain('archivo');
      expect(queryCall).toContain('nombre_archivo_cliente');
      expect(queryCall).toContain('mime_type_archivo_cliente');
      expect(queryCall).toContain('id_pers');
      expect(queryCall).toContain('RETURNING id_archivos_cliente');
    });

    it('debería verificar la estructura de la consulta SELECT', async () => {
      mockQuery.mockResolvedValueOnce({
        rows: [{
          nombre_archivo_cliente: 'test.pdf',
          mime_type_archivo_cliente: 'application/pdf',
          archivo: Buffer.from('contenido')
        }]
      });

      await request(app)
        .get('/buscar-archivo')
        .query({ id: '1' });

      const queryCall = mockQuery.mock.calls[0][0];
      expect(queryCall).toContain('SELECT nombre_archivo_cliente, mime_type_archivo_cliente, archivo');
      expect(queryCall).toContain('FROM archivos_cliente');
      expect(queryCall).toContain('WHERE id_archivos_cliente = $1');
    });
  });
});