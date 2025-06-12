import { jest } from '@jest/globals';

// Mock para el objeto de respuesta express
const mockJson = jest.fn().mockImplementation(function() { return this; });
const mockStatus = jest.fn().mockImplementation(function() { return this; });
const mockRes = {
  json: mockJson,
  status: mockStatus
};

// Mock para la consulta a la base de datos
const mockQuery = jest.fn();
// Base de datos mock
const mockDb = { query: mockQuery };

// Importar el módulo del router directamente
jest.mock('../src/database.js', () => {
  return {
    DataBase: jest.fn().mockImplementation(() => {
      return {
        getConexion: jest.fn().mockReturnValue(mockDb)
      };
    })
  };
});

// Crear un router Express mock
const mockRouter = {
  get: jest.fn().mockImplementation((path, callback) => {
    mockRouter.routes = mockRouter.routes || {};
    mockRouter.routes[path] = callback;
    return mockRouter;
  }),
  post: jest.fn().mockImplementation((path, callback) => {
    mockRouter.routes = mockRouter.routes || {};
    mockRouter.routes[path] = callback;
    return mockRouter;
  }),
  put: jest.fn().mockImplementation((path, callback) => {
    mockRouter.routes = mockRouter.routes || {};
    mockRouter.routes[path] = callback;
    return mockRouter;
  })
};

jest.mock('express', () => {
  return {
    Router: jest.fn().mockReturnValue(mockRouter)
  };
});

// Importar el router después de los mocks
const segurosRouter = require('../src/routes/seguros.routes.js');

describe('Pruebas para la ruta de seguros', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /listar', () => {
    it('debería obtener todos los seguros correctamente', async () => {
      const segurosMock = [
        {
          id_seguro: 1,
          monto_seguro: 500,
          tiempo_seguro: 12,
          nom_cli: "Juan",
          ape_cli: "Perez",
          cedr_cli: "1234567890",
          nom_tip_seg: "Vida",
          pago_tip_seg: "Anual"
        }
      ];
      mockQuery.mockResolvedValue({
        rows: segurosMock,
        rowCount: segurosMock.length
      });

      const mockReq = {};

      await mockRouter.routes['/listar'](mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        rows: segurosMock,
        rowCount: segurosMock.length
      });
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("SELECT s.id_seguro"), [1]);
    });

    it('debería manejar errores en la consulta', async () => {
      const errorDB = new Error('Error de base de datos');
      mockQuery.mockRejectedValue(errorDB);

      const mockReq = {};
      await mockRouter.routes['/listar'](mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: "Error al obtener datos"
      }));
    });
  });

  describe('POST /save', () => {
    it('debería guardar un seguro correctamente', async () => {
      const mockSeguro = {
        ciud_seguro: 'Ambato',
        dia_seguro: 15,
        mes_seguro: 5,
        anio_seguro: 2024,
        firma_seguro: true,
        id_pers: 1
      };

      const dbResult = { rows: [{ id_seguro: 123 }] };
      mockQuery.mockResolvedValue(dbResult);

      const mockReq = { body: mockSeguro };

      await mockRouter.routes['/save'](mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO seguros"),
        [
          mockSeguro.ciud_seguro,
          mockSeguro.dia_seguro,
          mockSeguro.mes_seguro,
          mockSeguro.anio_seguro,
          mockSeguro.firma_seguro,
          mockSeguro.id_pers
        ]
      );
      expect(mockJson).toHaveBeenCalledWith({
        message: "Seguro guardado exitosamente",
        data: dbResult
      });
    });

    it('debería manejar errores al guardar un seguro', async () => {
      const mockSeguro = {
        ciud_seguro: 'Ambato',
        dia_seguro: 15,
        mes_seguro: 5,
        anio_seguro: 2024,
        firma_seguro: true,
        id_pers: 1
      };

      const errorDB = new Error('Error de inserción');
      mockQuery.mockRejectedValue(errorDB);

      const mockReq = { body: mockSeguro };

      await mockRouter.routes['/save'](mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: "Error al guardar seguro"
      }));
    });
  });

  describe('POST /personafac/save', () => {
    it('debería guardar una persona factura correctamente', async () => {
      const mockPersonaFac = {
        cedr_pers_fac: '1234567890',
        razon_pers_fac: 'Facturación',
        tipo_pers_fac: 'Natural',
        nacion_pers_fac: 'Ecuatoriana',
        nom_pers_fac: 'Juan',
        ape_pers_fac: 'Pérez',
        tel_pers_fac: '022123456',
        cel_pers_fac: '0991234567',
        email_pers_fac: 'juan@ejemplo.com',
        direc_pers_fac: 'Calle Principal',
        parent_pers_fac: 'Titular'
      };

      mockQuery.mockResolvedValue({ rows: [{ id_pers_fac: 45 }] });

      const mockReq = { body: mockPersonaFac };

      await mockRouter.routes['/personafac/save'](mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        message: "Persona factura guardada exitosamente",
        id_pers_fac: 45
      });
    });
  });

  describe('POST /cuentabanco/save', () => {
    it('debería guardar una cuenta bancaria correctamente', async () => {
      const mockCuentaBanco = {
        tipo_cuent_Ban: 'Ahorros',
        nom_cuent_Ban: 'Banco Pichincha',
        mun_cuent_Ban: 500.50
      };

      mockQuery.mockResolvedValue({ rows: [{ id_cuent_ban: 78 }] });

      const mockReq = { body: mockCuentaBanco };

      await mockRouter.routes['/cuentabanco/save'](mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        message: "Cuenta bancaria guardada exitosamente",
        id_cuent_Ban: 78 // Ojo con la mayúscula, debe coincidir con el código de tu router
      });
    });
  });

  describe('POST /saveSeguro', () => {
    it('debería guardar un seguro completo correctamente', async () => {
      const mockSeguroCompleto = {
        ciud_seguro: 'Ambato',
        dia_seguro: 15,
        mes_seguro: 5,
        anio_seguro: 2024,
        monto_seguro: 1000,
        tiempo_seguro: 12,
        id_pers: 101,
        id_emple: 202,
        id_tip_seg: 1,
        id_pers_fac: 45,
        id_cuent_Ban: 78
      };

      mockQuery.mockResolvedValue({ rows: [{ id_seguro: 500 }] });

      const mockReq = { body: mockSeguroCompleto };

      await mockRouter.routes['/saveSeguro'](mockReq, mockRes);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO seguros"),
        [
          mockSeguroCompleto.ciud_seguro,
          mockSeguroCompleto.dia_seguro,
          mockSeguroCompleto.mes_seguro,
          mockSeguroCompleto.anio_seguro,
          mockSeguroCompleto.monto_seguro,
          mockSeguroCompleto.tiempo_seguro,
          mockSeguroCompleto.id_pers,
          mockSeguroCompleto.id_emple,
          mockSeguroCompleto.id_tip_seg,
          mockSeguroCompleto.id_pers_fac,
          mockSeguroCompleto.id_cuent_Ban,
          3 // id_estado fijo
        ]
      );
      expect(mockJson).toHaveBeenCalledWith({
        message: "Seguro guardado exitosamente",
        id_seguro: 500
      });
    });
  });

  describe('POST /saveDependientes', () => {
    it('debería guardar múltiples dependientes correctamente', async () => {
      const mockDependientes = [
        {
          cedr_depen: '1234567890',
          tipo_cedr_depen: 'CI',
          nom_depen: 'Ana',
          ape_depen: 'García',
          fecha_naci_depen: '2000-01-01',
          parent_depen: 'Hija',
          discap_depen: false,
          cond_depen: null,
          fecha_fin_cond: null,
          fecha_ini_cond: null,
          id_seguro: 500
        },
        {
          cedr_depen: '0987654321',
          tipo_cedr_depen: 'CI',
          nom_depen: 'José',
          ape_depen: 'García',
          fecha_naci_depen: '2005-05-10',
          parent_depen: 'Hijo',
          discap_depen: false,
          cond_depen: null,
          fecha_fin_cond: null,
          fecha_ini_cond: null,
          id_seguro: 500
        }
      ];

      mockQuery.mockResolvedValue({ rowCount: 2 });

      const mockReq = { body: mockDependientes };

      await mockRouter.routes['/saveDependientes'](mockReq, mockRes);

      expect(mockJson).toHaveBeenCalledWith({
        message: "Dependientes guardados exitosamente."
      });
    });

    it('debería manejar un error cuando no se envían dependientes', async () => {
      const mockReq = { body: [] };

      await mockRouter.routes['/saveDependientes'](mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "No se enviaron datos válidos."
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('debería manejar un error cuando el body no es un array', async () => {
      const mockReq = { body: { dato: "no es un array" } };

      await mockRouter.routes['/saveDependientes'](mockReq, mockRes);

      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "No se enviaron datos válidos."
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });
  });
});