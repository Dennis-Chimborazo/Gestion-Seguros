const request = require('supertest');
const express = require('express');

// Primero creamos el mock antes de importar cualquier cosa
const mockQuery = jest.fn();

// Mock del database directamente
jest.doMock('../src/database.js', () => {
  return {
    DataBase: jest.fn().mockImplementation(() => ({
      getConexion: () => ({
        query: mockQuery
      })
    }))
  };
});

// Ahora importamos el router después del mock
const router = require('../src/routes/archivosadicionales.route');

const app = express();
app.use(express.json());
app.use('/', router);

describe('Rutas de archivos cliente', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /subir-archivo', () => {
    it('debería subir un archivo exitosamente', async () => {
      // Mock exitoso con estructura PostgreSQL
      mockQuery.mockResolvedValueOnce({
        rows: [{ id_archivos_cliente: 123 }]
      });

      const response = await request(app)
        .post('/subir-archivo')
        .field('tipo', 'documento')
        .field('id_pers', '1')
        .attach('archivo', Buffer.from('contenido del archivo'), 'test.pdf');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Archivo guardado',
        id: 123
      });
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO archivos_cliente'),
        ['documento', expect.any(Buffer), 'test.pdf', 'application/pdf', '1']
      );
    });

    it('debería manejar errores de base de datos en subir archivo', async () => {
      // Mock que falla
      mockQuery.mockRejectedValueOnce(new Error('Error de BD'));

      const response = await request(app)
        .post('/subir-archivo')
        .field('tipo', 'documento')
        .field('id_pers', '1')
        .attach('archivo', Buffer.from('contenido'), 'test.pdf');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Error al guardar el archivo'
      });
    });

    it('debería manejar diferentes tipos de archivo', async () => {
      const tiposArchivo = [
        { nombre: 'test.pdf', mimeType: 'application/pdf' },
        { nombre: 'test.jpg', mimeType: 'image/jpeg' },
        { nombre: 'test.png', mimeType: 'image/png' },
        { nombre: 'test.doc', mimeType: 'application/msword' }
      ];

      for (const tipoArchivo of tiposArchivo) {
        mockQuery.mockResolvedValueOnce({ 
          rows: [{ id_archivos_cliente: 123 }] 
        });

        const response = await request(app)
          .post('/subir-archivo')
          .field('tipo', 'documento')
          .field('id_pers', '1')
          .attach('archivo', Buffer.from('contenido'), tipoArchivo.nombre);

        expect(response.status).toBe(200);
        expect(mockQuery).toHaveBeenCalledWith(
          expect.any(String),
          [
            'documento',
            expect.any(Buffer),
            tipoArchivo.nombre,
            tipoArchivo.mimeType,
            '1'
          ]
        );
      }
    });

    it('debería manejar cuando no hay archivo en la subida', async () => {
      const response = await request(app)
        .post('/subir-archivo')
        .field('tipo', 'documento')
        .field('id_pers', '1');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Archivo requerido'
      });
    });
  });

  describe('GET /buscar-archivo', () => {
    it('debería encontrar y devolver un archivo', async () => {
      const mockArchivo = {
        rows: [{
          archivo: Buffer.from('contenido del archivo'),
          mime_type_archivo_cliente: 'application/pdf',
          nombre_archivo_cliente: 'documento.pdf'
        }]
      };

      mockQuery.mockResolvedValueOnce(mockArchivo);

      const response = await request(app)
        .get('/buscar-archivo')
        .query({ id: '1' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('application/pdf');
      expect(response.headers['content-disposition']).toBe('inline; filename="documento.pdf"');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT nombre_archivo_cliente, mime_type_archivo_cliente, archivo'),
        ['1']
      );
    });

    it('debería manejar array de IDs tomando el primero', async () => {
      const mockArchivo = {
        rows: [{
          archivo: Buffer.from('contenido'),
          mime_type_archivo_cliente: 'application/pdf',
          nombre_archivo_cliente: 'test.pdf'
        }]
      };

      mockQuery.mockResolvedValueOnce(mockArchivo);

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
      mockQuery.mockResolvedValueOnce({ rows: [] }); // Array vacío = no encontrado

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

    it('debería manejar diferentes tipos MIME en respuesta', async () => {
      const tiposMime = [
        { mime: 'application/pdf', nombre: 'documento.pdf' },
        { mime: 'image/jpeg', nombre: 'imagen.jpg' },
        { mime: 'text/plain', nombre: 'texto.txt' }
      ];

      for (const tipo of tiposMime) {
        const mockArchivo = {
          rows: [{
            archivo: Buffer.from('contenido'),
            mime_type_archivo_cliente: tipo.mime,
            nombre_archivo_cliente: tipo.nombre
          }]
        };

        mockQuery.mockResolvedValueOnce(mockArchivo);

        const response = await request(app)
          .get('/buscar-archivo')
          .query({ id: '1' });

        expect(response.status).toBe(200);
        expect(response.headers['content-type']).toBe(tipo.mime);
        expect(response.headers['content-disposition']).toBe(`inline; filename="${tipo.nombre}"`);
      }
    });

    it('debería verificar manejo de parámetros undefined', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/buscar-archivo')
        .query({ id: undefined });

      expect(response.status).toBe(404);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        [undefined]
      );
    });
  });

  describe('GET /buscar-imagen', () => {
    it('debería encontrar una imagen por ID de persona', async () => {
      const mockImagen = {
        rows: [{
          archivo: Buffer.from('imagen contenido'),
          mime_type_archivo_cliente: 'image/jpeg',
          nombre_archivo_cliente: 'foto.jpg'
        }]
      };

      mockQuery.mockResolvedValueOnce(mockImagen);

      const response = await request(app)
        .get('/buscar-imagen')
        .query({ id: '1' });

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('image/jpeg');
      expect(response.headers['content-disposition']).toBe('inline; filename="foto.jpg"');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("tipo_archivos_cliente = 'imagen'"),
        ['1']
      );
    });

    it('debería manejar array de IDs en buscar-imagen', async () => {
      const mockImagen = {
        rows: [{
          archivo: Buffer.from('imagen'),
          mime_type_archivo_cliente: 'image/png',
          nombre_archivo_cliente: 'foto.png'
        }]
      };

      mockQuery.mockResolvedValueOnce(mockImagen);

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
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .get('/buscar-imagen')
        .query({ id: '1' });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("tipo_archivos_cliente = 'imagen'"),
        ['1']
      );
    });

    it('debería manejar valores undefined en búsqueda de imagen', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/buscar-imagen')
        .query({ id: undefined });

      expect(response.status).toBe(404);
    });
  });

  describe('Casos edge adicionales', () => {
    it('debería manejar archivos con nombres especiales', async () => {
      const nombresEspeciales = [
        'archivo con espacios.pdf',
        'archivo-con-guiones.jpg',
        'archivo_con_underscore.png'
      ];

      for (const nombre of nombresEspeciales) {
        const mockArchivo = {
          rows: [{
            archivo: Buffer.from('contenido'),
            mime_type_archivo_cliente: 'application/pdf',
            nombre_archivo_cliente: nombre
          }]
        };

        mockQuery.mockResolvedValueOnce(mockArchivo);

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
        .field('tipo', 'documento')
        .field('id_pers', '1')
        .attach('archivo', Buffer.from('contenido'), 'test.pdf');

      expect(mockQuery).toHaveBeenCalled();
      const queryCall = mockQuery.mock.calls[0][0];
      expect(queryCall).toContain('INSERT INTO archivos_cliente');
      expect(queryCall).toContain('tipo_archivos_cliente');
      expect(queryCall).toContain('archivo');
      expect(queryCall).toContain('nombre_archivo_cliente');
      expect(queryCall).toContain('mime_type_archivo_cliente');
      expect(queryCall).toContain('RETURNING id_archivos_cliente');
    });

    it('debería verificar la estructura de la consulta SELECT', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .get('/buscar-archivo')
        .query({ id: '1' });

      const queryCall = mockQuery.mock.calls[0][0];
      expect(queryCall).toContain('SELECT nombre_archivo_cliente, mime_type_archivo_cliente, archivo');
      expect(queryCall).toContain('FROM archivos_cliente');
      expect(queryCall).toContain('WHERE id_archivos_cliente = $1');
    });

    it('debería manejar valores undefined en MIME type', async () => {
      const mockArchivo = {
        rows: [{
          archivo: Buffer.from('contenido'),
          mime_type_archivo_cliente: undefined,
          nombre_archivo_cliente: 'archivo.bin'
        }]
      };

      mockQuery.mockResolvedValueOnce(mockArchivo);

      const response = await request(app)
        .get('/buscar-archivo')
        .query({ id: '1' });

      expect(response.status).toBe(200);
      // El código actual no maneja undefined, pero debería funcionar
      expect(response.headers['content-disposition']).toBe('inline; filename="archivo.bin"');
    });

    it('debería manejar valores null en MIME type', async () => {
      const mockArchivo = {
        rows: [{
          archivo: Buffer.from('contenido'),
          mime_type_archivo_cliente: null,
          nombre_archivo_cliente: 'archivo.bin'
        }]
      };

      mockQuery.mockResolvedValueOnce(mockArchivo);

      const response = await request(app)
        .get('/buscar-archivo')
        .query({ id: '1' });

      expect(response.status).toBe(200);
      expect(response.headers['content-disposition']).toBe('inline; filename="archivo.bin"');
    });

    it('debería verificar manejo de arrays vacíos en query params', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/buscar-archivo')
        .query({ id: [] });

      // Array vacío se convierte en undefined
      expect(response.status).toBe(404);
    });

    it('debería verificar que los parámetros se pasan correctamente en PostgreSQL', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .get('/buscar-archivo')
        .query({ id: '123' });

      // Verificar que usa parámetros PostgreSQL ($1, $2, etc.)
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('$1'),
        ['123']
      );
    });

    it('debería verificar el campo específico en buscar-imagen', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .get('/buscar-imagen')
        .query({ id: '1' });

      // Verificar que usa id_pers en lugar de id_archivos_cliente
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE id_pers = $1'),
        ['1']
      );
    });
  });

  describe('Validaciones específicas del campo tipo', () => {
    it('debería incluir el campo tipo en la inserción', async () => {
      mockQuery.mockResolvedValueOnce({ 
        rows: [{ id_archivos_cliente: 123 }] 
      });

      await request(app)
        .post('/subir-archivo')
        .field('tipo', 'imagen')
        .field('id_pers', '1')
        .attach('archivo', Buffer.from('contenido'), 'test.jpg');

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['imagen'])
      );
    });

    it('debería manejar diferentes tipos de archivo', async () => {
      const tipos = ['documento', 'imagen', 'certificado', 'identificacion'];

      for (const tipo of tipos) {
        mockQuery.mockResolvedValueOnce({ 
          rows: [{ id_archivos_cliente: 123 }] 
        });

        const response = await request(app)
          .post('/subir-archivo')
          .field('tipo', tipo)
          .field('id_pers', '1')
          .attach('archivo', Buffer.from('contenido'), 'test.pdf');

        expect(response.status).toBe(200);
        expect(mockQuery).toHaveBeenCalledWith(
          expect.any(String),
          expect.arrayContaining([tipo])
        );
      }
    });
  });
});