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
// Nota: Necesitamos usar require ya que vamos a modificar el módulo después
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
    // Almacenar la función de callback para probarla directamente
    mockRouter.routes = mockRouter.routes || {};
    mockRouter.routes[path] = callback;
    return mockRouter;
  }),
  post: jest.fn().mockImplementation((path, callback) => {
    // Almacenar las funciones de callback para las rutas POST
    mockRouter.routes = mockRouter.routes || {};
    mockRouter.routes[path] = callback;
    return mockRouter;
  })
};

// Mock express
jest.mock('express', () => {
  return {
    Router: jest.fn().mockReturnValue(mockRouter)
  };
});

// Importar el módulo después de configurar todos los mocks
const segurosRouter = require('../src/routes/seguros.routes.js');

describe('Pruebas para la ruta de seguros', () => {
  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  describe('GET /listar', () => {
    it('debería obtener todos los seguros correctamente', async () => {
      // Configurar el mock para devolver datos
      const segurosMock = [
        { id_seguro: 1, ciud_seguro: 'Quito', monto_seguro: 500 },
        { id_seguro: 2, ciud_seguro: 'Guayaquil', monto_seguro: 750 }
      ];
      
      mockQuery.mockResolvedValue({
        rows: segurosMock,
        rowCount: 2
      });

      // Crear un objeto de solicitud mock vacío
      const mockReq = {};

      // Ejecutar el controlador de la ruta directamente
      await mockRouter.routes['/listar'](mockReq, mockRes);

      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalledWith({
        rows: segurosMock,
        rowCount: 2
      });
      expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM seguros");
    });

    it('debería manejar errores en la consulta', async () => {
      // Configurar el mock para lanzar un error
      const errorDB = new Error('Error de base de datos');
      mockQuery.mockRejectedValue(errorDB);

      // Crear un objeto de solicitud mock vacío
      const mockReq = {};

      // Ejecutar el controlador de la ruta directamente
      await mockRouter.routes['/listar'](mockReq, mockRes);

      // Verificar la respuesta
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: "Error al obtener datos"
      }));
    });
  });

  describe('POST /save', () => {
    it('debería guardar un seguro correctamente', async () => {
      // Datos de prueba
      const mockSeguro = {
        ciud_seguro: 'Ambato',
        dia_seguro: 15,
        mes_seguro: 5,
        anio_seguro: 2024,
        firma_seguro: true,
        id_pers: 1
      };

      // Respuesta de la base de datos
      mockQuery.mockResolvedValue({
        rows: [{ id_seguro: 123 }]
      });

      // Mock de la solicitud
      const mockReq = {
        body: mockSeguro
      };

      // Ejecutar el controlador
      await mockRouter.routes['/save'](mockReq, mockRes);

      // Verificar que se llamó a la base de datos con los parámetros correctos
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

      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: "Seguro guardado exitosamente"
      }));
    });

    it('debería manejar errores al guardar un seguro', async () => {
      // Datos de prueba
      const mockSeguro = {
        ciud_seguro: 'Ambato',
        dia_seguro: 15,
        mes_seguro: 5,
        anio_seguro: 2024,
        firma_seguro: true,
        id_pers: 1
      };

      // Simular error en la base de datos
      const errorDB = new Error('Error de inserción');
      mockQuery.mockRejectedValue(errorDB);

      // Mock de la solicitud
      const mockReq = {
        body: mockSeguro
      };

      // Ejecutar el controlador
      await mockRouter.routes['/save'](mockReq, mockRes);

      // Verificar la respuesta de error
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        message: "Error al guardar seguro"
      }));
    });
  });

  describe('POST /personafac/save', () => {
    it('debería guardar una persona factura correctamente', async () => {
      // Datos de prueba
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

      // Respuesta de la base de datos
      mockQuery.mockResolvedValue({
        rows: [{ id_pers_fac: 45 }]
      });

      // Mock de la solicitud
      const mockReq = {
        body: mockPersonaFac
      };

      // Ejecutar el controlador
      await mockRouter.routes['/personafac/save'](mockReq, mockRes);

      // Verificar que se llamó a la base de datos con los parámetros correctos
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO persona_fac"),
        [
          mockPersonaFac.cedr_pers_fac,
          mockPersonaFac.razon_pers_fac,
          mockPersonaFac.tipo_pers_fac,
          mockPersonaFac.nacion_pers_fac,
          mockPersonaFac.nom_pers_fac,
          mockPersonaFac.ape_pers_fac,
          mockPersonaFac.tel_pers_fac,
          mockPersonaFac.cel_pers_fac,
          mockPersonaFac.email_pers_fac,
          mockPersonaFac.direc_pers_fac,
          mockPersonaFac.parent_pers_fac
        ]
      );

      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalledWith({
        message: "Persona factura guardada exitosamente",
        id_pers_fac: 45
      });
    });
  });

  describe('POST /cuentabanco/save', () => {
    it('debería guardar una cuenta bancaria correctamente', async () => {
      // Datos de prueba
      const mockCuentaBanco = {
        tipo_cuent_Ban: 'Ahorros',
        nom_cuent_Ban: 'Banco Pichincha',
        mun_cuent_Ban: 500.50
      };

      // Respuesta de la base de datos
      mockQuery.mockResolvedValue({
        rows: [{ id_cuent_ban: 78 }]
      });

      // Mock de la solicitud
      const mockReq = {
        body: mockCuentaBanco
      };

      // Ejecutar el controlador
      await mockRouter.routes['/cuentabanco/save'](mockReq, mockRes);

      // Verificar que se llamó a la base de datos con los parámetros correctos
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO cuenta_banco"),
        [
          mockCuentaBanco.tipo_cuent_Ban,
          mockCuentaBanco.nom_cuent_Ban,
          mockCuentaBanco.mun_cuent_Ban
        ]
      );

      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalledWith({
        message: "Cuenta bancaria guardada exitosamente",
        id_cuent_Ban: 78
      });
    });
  });

  describe('POST /saveSeguro', () => {
    it('debería guardar un seguro completo correctamente', async () => {
      // Datos de prueba
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

      // Respuesta de la base de datos
      mockQuery.mockResolvedValue({
        rows: [{ id_seguro: 500 }]
      });

      // Mock de la solicitud
      const mockReq = {
        body: mockSeguroCompleto
      };

      // Ejecutar el controlador
      await mockRouter.routes['/saveSeguro'](mockReq, mockRes);

      // Verificar que se llamó a la base de datos con los parámetros correctos
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
          3 // id_estado, valor fijo en el código
        ]
      );

      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalledWith({
        message: "Seguro guardado exitosamente",
        id_seguro: 500
      });
    });
  });

  describe('POST /saveDependientes', () => {
    it('debería guardar múltiples dependientes correctamente', async () => {
      // Datos de prueba - array de dependientes
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

      // Respuesta de la base de datos
      mockQuery.mockResolvedValue({
        rowCount: 2
      });

      // Mock de la solicitud
      const mockReq = {
        body: mockDependientes
      };

      // Ejecutar el controlador
      await mockRouter.routes['/saveDependientes'](mockReq, mockRes);

      // Verificar que se llamó a la base de datos
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO dependientes"),
        expect.arrayContaining([
          '1234567890', 'CI', 'Ana', 'García',
          '0987654321', 'CI', 'José', 'García'
        ])
      );

      // Verificar la respuesta
      expect(mockJson).toHaveBeenCalledWith({
        message: "Dependientes guardados exitosamente."
      });
    });

    it('debería manejar un error cuando no se envían dependientes', async () => {
      // Mock de la solicitud con array vacío
      const mockReq = {
        body: []
      };

      // Ejecutar el controlador
      await mockRouter.routes['/saveDependientes'](mockReq, mockRes);

      // Verificar la respuesta de error
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "No se enviaron datos válidos."
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });

    it('debería manejar un error cuando el body no es un array', async () => {
      // Mock de la solicitud con objeto en lugar de array
      const mockReq = {
        body: { dato: "no es un array" }
      };

      // Ejecutar el controlador
      await mockRouter.routes['/saveDependientes'](mockReq, mockRes);

      // Verificar la respuesta de error
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({
        message: "No se enviaron datos válidos."
      });
      expect(mockQuery).not.toHaveBeenCalled();
    });
  });
});