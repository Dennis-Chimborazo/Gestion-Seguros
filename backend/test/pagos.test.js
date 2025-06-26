const request = require('supertest');
const express = require('express');

// Mock del database y dayjs antes de importar
const mockQuery = jest.fn();

jest.doMock('../src/database.js', () => {
  return {
    DataBase: jest.fn().mockImplementation(() => ({
      getConexion: () => ({
        query: mockQuery
      })
    }))
  };
});

jest.doMock('dayjs', () => {
  const mockDayjs = jest.fn(() => ({
    format: jest.fn().mockReturnValue('2025-01-15')
  }));
  return mockDayjs;
});

// Importar el router después de los mocks
const router = require('../src/routes/pagos.routes.js'); // Ajusta la ruta según tu estructura

const app = express();
app.use(express.json());
app.use('/', router);

describe('Rutas de pagos cliente', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /pago-cliente', () => {
    it('debería registrar un pago exitosamente', async () => {
      const mockPago = {
        rows: [{
          id_pago: 1,
          fecha_pago: '2025-01-15',
          nonto_pago: 100.00,
          comprobante_pago: 'COMP123',
          id_pers: 1,
          id_seguro: 1,
          id_archivos_cliente: 1,
          id_estado: 3
        }]
      };

      mockQuery.mockResolvedValueOnce(mockPago);

      const pagoData = {
        nonto_pago: 100.00,
        comprobante_pago: 'COMP123',
        id_pers: 1,
        id_seguro: 1,
        id_archivos_cliente: 1
      };

      const response = await request(app)
        .post('/pago-cliente')
        .send(pagoData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        mensaje: 'Pago registrado exitosamente.',
        pago: mockPago.rows[0]
      });
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO pago_cliente'),
        ['2025-01-15', 100.00, 'COMP123', 1, 1, 1, 3]
      );
    });

    it('debería validar campos obligatorios', async () => {
      const pagoIncompleto = {
        nonto_pago: 100.00,
        comprobante_pago: 'COMP123'
        // Faltan campos obligatorios
      };

      const response = await request(app)
        .post('/pago-cliente')
        .send(pagoIncompleto);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Faltan campos obligatorios.'
      });
    });

    it('debería manejar errores de base de datos', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Error de BD'));

      const pagoData = {
        nonto_pago: 100.00,
        comprobante_pago: 'COMP123',
        id_pers: 1,
        id_seguro: 1,
        id_archivos_cliente: 1
      };

      const response = await request(app)
        .post('/pago-cliente')
        .send(pagoData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Error interno al registrar el pago.'
      });
    });

    it('debería usar el estado 3 por defecto', async () => {
      const mockPago = { rows: [{ id_pago: 1 }] };
      mockQuery.mockResolvedValueOnce(mockPago);

      const pagoData = {
        nonto_pago: 100.00,
        comprobante_pago: 'COMP123',
        id_pers: 1,
        id_seguro: 1,
        id_archivos_cliente: 1
      };

      await request(app)
        .post('/pago-cliente')
        .send(pagoData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([3]) // id_estado = 3
      );
    });
  });

  describe('GET /pago-cliente/estado/1', () => {
    it('debería obtener pagos con estado 1', async () => {
      const mockPagos = {
        rows: [{
          id_pago: 1,
          fecha_pago: '2025-01-15',
          nonto_pago: 100.00,
          comprobante_pago: 'COMP123',
          id_pers: 1,
          nombre: 'Juan Pérez',
          cedr_cli: '1234567890',
          id_seguro: 1,
          nom_tip_seg: 'Seguro de Vida',
          id_archivos_cliente: 1,
          nom_estado: 'Pendiente'
        }]
      };

      mockQuery.mockResolvedValueOnce(mockPagos);

      const response = await request(app)
        .get('/pago-cliente/estado/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPagos);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE p.id_estado = 1')
      );
    });

    it('debería manejar errores en consulta de estado 1', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Error de BD'));

      const response = await request(app)
        .get('/pago-cliente/estado/1');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Error al obtener pagos con estado 1.'
      });
    });
  });

  describe('GET /pago-revision-pendientes', () => {
    it('debería obtener pagos pendientes de revisión', async () => {
      const mockPagosPendientes = [{
        id_pago: 1,
        fecha_pago: '2025-01-15',
        nonto_pago: 100.00,
        comprobante_pago: 'COMP123',
        id_archivos_cliente: 1,
        nom_tip_seg: 'Seguro de Vida',
        nom_estado: 'En Revisión',
        nombre: 'Juan Pérez',
        cedr_cli: '1234567890'
      }];

      mockQuery.mockResolvedValueOnce({ rows: mockPagosPendientes });

      const response = await request(app)
        .get('/pago-revision-pendientes');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPagosPendientes);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE  pg.id_estado = 3')
      );
    });

    it('debería manejar errores en consulta de pendientes', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Error de BD'));

      const response = await request(app)
        .get('/pago-revision-pendientes');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Error al obtener pagos pendientes.'
      });
    });
  });

  describe('GET /pagos-revision-cliente', () => {
    it('debería obtener pagos en revisión de un cliente específico', async () => {
      const mockPagosCliente = [{
        id_pago: 1,
        fecha_pago: '2025-01-15',
        nonto_pago: 100.00,
        comprobante_pago: 'COMP123',
        nom_tip_seg: 'Seguro de Vida',
        nom_estado: 'En Revisión'
      }];

      mockQuery.mockResolvedValueOnce({ rows: mockPagosCliente });

      const response = await request(app)
        .get('/pagos-revision-cliente')
        .query({ id: '1' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPagosCliente);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE pg.id_pers = $1 AND pg.id_estado IN (3, 7)'),
        ['1']
      );
    });

    it('debería manejar array de IDs tomando el primero', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .get('/pagos-revision-cliente')
        .query({ id: ['1', '2', '3'] });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['1'] // Solo el primer elemento
      );
    });

    it('debería validar parámetro id_pers requerido', async () => {
      const response = await request(app)
        .get('/pagos-revision-cliente');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Falta el parámetro 'id_pers'."
      });
    });

    it('debería manejar errores de base de datos', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Error de BD'));

      const response = await request(app)
        .get('/pagos-revision-cliente')
        .query({ id: '1' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Error interno al obtener pagos en revisión.'
      });
    });
  });

  describe('GET /pagos-aprobados-cliente', () => {
    it('debería obtener pagos aprobados de un cliente específico', async () => {
      const mockPagosAprobados = [{
        id_pago: 1,
        fecha_pago: '2025-01-15',
        nonto_pago: 100.00,
        comprobante_pago: 'COMP123',
        nom_tip_seg: 'Seguro de Vida',
        nom_estado: 'Aprobado'
      }];

      mockQuery.mockResolvedValueOnce({ rows: mockPagosAprobados });

      const response = await request(app)
        .get('/pagos-aprobados-cliente')
        .query({ id: '1' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPagosAprobados);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE pg.id_pers = $1 AND pg.id_estado = 6'),
        ['1']
      );
    });

    it('debería validar parámetro id_pers requerido', async () => {
      const response = await request(app)
        .get('/pagos-aprobados-cliente');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Falta el parámetro 'id_pers'."
      });
    });

    it('debería manejar errores de base de datos', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Error de BD'));

      const response = await request(app)
        .get('/pagos-aprobados-cliente')
        .query({ id: '1' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Error interno al obtener pagos en revisión.'
      });
    });
  });

  describe('POST /save-revision-aprovado', () => {
    it('debería guardar revisión aprobada exitosamente', async () => {
      const mockRevision = { rows: [{ id_revision_pago: 1 }] };
      const mockUpdate = { rowCount: 1 };

      mockQuery
        .mockResolvedValueOnce(mockRevision)  // INSERT revision
        .mockResolvedValueOnce(mockUpdate);   // UPDATE pago

      const revisionData = {
        descripcion_revision_pago: 'Pago aprobado correctamente',
        id_pago: 1
      };

      const response = await request(app)
        .post('/save-revision-aprovado')
        .send(revisionData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: ' Revisión guardada exitosamente',
        success: true
      });

      // Verificar que se llamaron ambas queries
      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenNthCalledWith(1,
        expect.stringContaining('INSERT INTO revision_pago'),
        ['2025-01-15', 'Pago aprobado correctamente', 1, 6]
      );
      expect(mockQuery).toHaveBeenNthCalledWith(2,
        expect.stringContaining('UPDATE pago_cliente SET'),
        [6, 1]
      );
    });

    it('debería manejar errores en save-revision-aprovado', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Error de BD'));

      const revisionData = {
        descripcion_revision_pago: 'Pago aprobado',
        id_pago: 1
      };

      const response = await request(app)
        .post('/save-revision-aprovado')
        .send(revisionData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Error al guardar revisión',
        error: expect.any(Object)
      });
    });
  });

  describe('POST /save-revision-rechasada', () => {
    it('debería guardar revisión rechazada exitosamente', async () => {
      const mockRevision = { rows: [{ id_revision_pago: 1 }] };
      const mockUpdate = { rowCount: 1 };

      mockQuery
        .mockResolvedValueOnce(mockRevision)  // INSERT revision
        .mockResolvedValueOnce(mockUpdate);   // UPDATE pago

      const revisionData = {
        descripcion_revision_pago: 'Documentación incompleta',
        id_pago: 1
      };

      const response = await request(app)
        .post('/save-revision-rechasada')
        .send(revisionData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Revisión guardada exitosamente',
        success: true
      });

      // Verificar que se llamaron ambas queries
      expect(mockQuery).toHaveBeenCalledTimes(2);
      expect(mockQuery).toHaveBeenNthCalledWith(1,
        expect.stringContaining('INSERT INTO revision_pago'),
        ['2025-01-15', 'Documentación incompleta', 1, 7]
      );
      expect(mockQuery).toHaveBeenNthCalledWith(2,
        expect.stringContaining('UPDATE pago_cliente SET'),
        [7, 1]
      );
    });

    it('debería manejar errores en save-revision-rechasada', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Error de BD'));

      const revisionData = {
        descripcion_revision_pago: 'Pago rechazado',
        id_pago: 1
      };

      const response = await request(app)
        .post('/save-revision-rechasada')
        .send(revisionData);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: 'Error al guardar revisión',
        error: expect.any(Object)
      });
    });
  });

  describe('GET /buscar-pago-rechazado', () => {
    it('debería obtener información de pago rechazado', async () => {
      const mockPagoRechazado = [{
        fecha_revision_pago: '2025-01-15',
        descripcion_revision_pago: 'Documentación incompleta'
      }];

      mockQuery.mockResolvedValueOnce({ rows: mockPagoRechazado });

      const response = await request(app)
        .get('/buscar-pago-rechazado')
        .query({ id: '1' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPagoRechazado);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('where p.id_pago= $1'),
        ['1']
      );
    });

    it('debería manejar array de IDs tomando el primero', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .get('/buscar-pago-rechazado')
        .query({ id: ['1', '2', '3'] });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['1'] // Solo el primer elemento
      );
    });

    it('debería manejar errores de base de datos', async () => {
      mockQuery.mockRejectedValueOnce(new Error('Error de BD'));

      const response = await request(app)
        .get('/buscar-pago-rechazado')
        .query({ id: '1' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        success: false,
        message: 'Error al obtener datos',
        error: 'Error de BD'
      });
    });
  });

  describe('Casos edge adicionales', () => {
    it('debería manejar valores undefined en query params', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/pagos-revision-cliente')
        .query({ id: undefined });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: "Falta el parámetro 'id_pers'."
      });
    });

    it('debería verificar el uso de parámetros PostgreSQL', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .get('/pagos-revision-cliente')
        .query({ id: '123' });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('$1'),
        ['123']
      );
    });

    it('debería verificar la fecha actual en las inserciones', async () => {
      const mockResult = { rows: [{ id_pago: 1 }] };
      mockQuery.mockResolvedValueOnce(mockResult);

      const pagoData = {
        nonto_pago: 100.00,
        comprobante_pago: 'COMP123',
        id_pers: 1,
        id_seguro: 1,
        id_archivos_cliente: 1
      };

      await request(app)
        .post('/pago-cliente')
        .send(pagoData);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining(['2025-01-15']) // Fecha mockeada
      );
    });

    it('debería manejar diferentes estados en las consultas', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .get('/pagos-revision-cliente')
        .query({ id: '1' });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('id_estado IN (3, 7)'),
        ['1']
      );
    });

    it('debería verificar joins en las consultas complejas', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .get('/pago-cliente/estado/1');

      const queryCall = mockQuery.mock.calls[0][0];
      expect(queryCall).toContain('INNER JOIN cliente c');
      expect(queryCall).toContain('INNER JOIN seguros s');
      expect(queryCall).toContain('INNER JOIN tipo_seguro tp');
      expect(queryCall).toContain('INNER JOIN estado e');
    });
  });

  describe('Validaciones de negocio', () => {
    it('debería usar estado 6 para aprobados', async () => {
      const mockResult = { rows: [{ id_revision_pago: 1 }] };
      mockQuery.mockResolvedValueOnce(mockResult).mockResolvedValueOnce({});

      await request(app)
        .post('/save-revision-aprovado')
        .send({ descripcion_revision_pago: 'OK', id_pago: 1 });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([6]) // Estado aprobado
      );
    });

    it('debería usar estado 7 para rechazados', async () => {
      const mockResult = { rows: [{ id_revision_pago: 1 }] };
      mockQuery.mockResolvedValueOnce(mockResult).mockResolvedValueOnce({});

      await request(app)
        .post('/save-revision-rechasada')
        .send({ descripcion_revision_pago: 'Error', id_pago: 1 });

      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([7]) // Estado rechazado
      );
    });

    it('debería concatenar nombre completo en las consultas', async () => {
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await request(app)
        .get('/pago-revision-pendientes');

      const queryCall = mockQuery.mock.calls[0][0];
      expect(queryCall).toContain("(c.ape_cli || ' ' ||c.nom_cli)as nombre");
    });
  });
});