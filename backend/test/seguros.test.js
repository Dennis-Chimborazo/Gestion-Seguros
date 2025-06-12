import { jest } from '@jest/globals';

// Mock para el objeto de respuesta express
const mockJson = jest.fn().mockImplementation(function() { return this; });
const mockStatus = jest.fn().mockImplementation(function() { return this; });
const mockRes = { json: mockJson, status: mockStatus };

// Mock para la consulta a la base de datos
const mockQuery = jest.fn();
const mockDb = { query: mockQuery };

// Mock para JWT
const mockSign = jest.fn();
const mockVerify = jest.fn();
jest.mock("jsonwebtoken", () => ({
  sign: (...args) => mockSign(...args),
  verify: (...args) => mockVerify(...args),
}));

// Mock database.js
jest.mock('../src/database.js', () => ({
  DataBase: jest.fn().mockImplementation(() => ({
    getConexion: jest.fn().mockReturnValue(mockDb)
  }))
}));

// Mock express
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
jest.mock('express', () => ({
  Router: jest.fn().mockReturnValue(mockRouter)
}));

// Importar el router después de los mocks
require('../src/routes/seguros.routes.js');

describe('Cobertura completa para la ruta de seguros', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSign.mockReset();
    mockVerify.mockReset();
  });

  // GET /listar
  describe('GET /listar', () => {
    it('éxito', async () => {
      const segurosMock = [{ id_seguro: 1, monto_seguro: 500, tiempo_seguro: 12 }];
      mockQuery.mockResolvedValue({ rows: segurosMock, rowCount: segurosMock.length });
      await mockRouter.routes['/listar']({}, mockRes);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining("SELECT s.id_seguro"), [1]);
      expect(mockJson).toHaveBeenCalledWith({ rows: segurosMock, rowCount: segurosMock.length });
    });

    it('error DB', async () => {
      mockQuery.mockRejectedValue(new Error('db error'));
      await mockRouter.routes['/listar']({}, mockRes);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ message: "Error al obtener datos" }));
    });
  });

  // POST /save
  describe('POST /save', () => {
    const safeBody = {
      ciud_seguro: "Quito", dia_seguro: 1, mes_seguro: 1, anio_seguro: 2025, firma_seguro: true, id_pers: 1
    };

    it('éxito', async () => {
      mockQuery.mockResolvedValue({ rows: [{ id: 1 }] });
      await mockRouter.routes['/save']({ body: safeBody }, mockRes);
      expect(mockJson).toHaveBeenCalledWith({ message: "Seguro guardado exitosamente", data: { rows: [{ id: 1 }] } });
    });

    it('error DB', async () => {
      mockQuery.mockRejectedValue(new Error('fail'));
      await mockRouter.routes['/save']({ body: safeBody }, mockRes);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ message: "Error al guardar seguro" }));
    });
  });

  // POST /personafac/save
  describe('POST /personafac/save', () => {
    const body = {
      cedr_pers_fac: "1", razon_pers_fac: "x", tipo_pers_fac: "y", nacion_pers_fac: "z",
      nom_pers_fac: "a", ape_pers_fac: "b", tel_pers_fac: "c", cel_pers_fac: "d",
      email_pers_fac: "e", direc_pers_fac: "f", parent_pers_fac: "g"
    };
    it('éxito', async () => {
      mockQuery.mockResolvedValue({ rows: [{ id_pers_fac: 10 }] });
      await mockRouter.routes['/personafac/save']({ body }, mockRes);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Persona factura guardada exitosamente",
        id_pers_fac: 10
      });
    });
    it('error DB', async () => {
      mockQuery.mockRejectedValue(new Error('fail'));
      await mockRouter.routes['/personafac/save']({ body }, mockRes);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ message: "Error al guardar persona_factura" }));
    });
  });

  // POST /cuentabanco/save
  describe('POST /cuentabanco/save', () => {
    const body = { tipo_cuent_Ban: "Ahorros", nom_cuent_Ban: "Banco", mun_cuent_Ban: 100.5 };
    it('éxito', async () => {
      mockQuery.mockResolvedValue({ rows: [{ id_cuent_ban: 5 }] });
      await mockRouter.routes['/cuentabanco/save']({ body }, mockRes);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Cuenta bancaria guardada exitosamente",
        id_cuent_Ban: 5
      });
    });
    it('error DB', async () => {
      mockQuery.mockRejectedValue(new Error('fail'));
      await mockRouter.routes['/cuentabanco/save']({ body }, mockRes);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ message: "Error al guardar cuenta bancaria" }));
    });
  });

  // POST /saveSeguro
  describe('POST /saveSeguro', () => {
    const body = {
      ciud_seguro: "Quito", dia_seguro: 1, mes_seguro: 1, anio_seguro: 2025, monto_seguro: 100,
      tiempo_seguro: 12, id_pers: 1, id_emple: 2, id_tip_seg: 3, id_pers_fac: 4, id_cuent_Ban: 5
    };
    it('éxito', async () => {
      mockQuery.mockResolvedValue({ rows: [{ id_seguro: 9 }] });
      await mockRouter.routes['/saveSeguro']({ body }, mockRes);
      expect(mockJson).toHaveBeenCalledWith({
        message: "Seguro guardado exitosamente",
        id_seguro: 9
      });
    });
    it('error DB', async () => {
      mockQuery.mockRejectedValue(new Error('fail'));
      await mockRouter.routes['/saveSeguro']({ body }, mockRes);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ message: "Error al guardar seguro" }));
    });
  });

  // POST /saveDependientes
  describe('POST /saveDependientes', () => {
    const dep = [{
      cedr_depen: "1", tipo_cedr_depen: "CI", nom_depen: "Ana", ape_depen: "Perez",
      fecha_naci_depen: "2000-01-01", parent_depen: "Hija", discap_depen: false,
      cond_depen: null, fecha_fin_cond: null, fecha_ini_cond: null, id_seguro: 7
    }];

    it('éxito', async () => {
      mockQuery.mockResolvedValue({ rowCount: 1 });
      await mockRouter.routes['/saveDependientes']({ body: dep }, mockRes);
      expect(mockJson).toHaveBeenCalledWith({ message: "Dependientes guardados exitosamente." });
    });

    it('error DB', async () => {
      mockQuery.mockRejectedValue(new Error('fail'));
      await mockRouter.routes['/saveDependientes']({ body: dep }, mockRes);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ message: "Error al insertar dependientes" }));
    });

    it('body vacío', async () => {
      await mockRouter.routes['/saveDependientes']({ body: [] }, mockRes);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: "No se enviaron datos válidos." });
    });
    it('body no es array', async () => {
      await mockRouter.routes['/saveDependientes']({ body: {} }, mockRes);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ message: "No se enviaron datos válidos." });
    });
  });

  // POST /generar_token_contr
  describe('POST /generar_token_contr', () => {
    const body = { id_seguro: 5, url: "url", id_pers: 10 };
    it('éxito', async () => {
      mockSign.mockReturnValue("signed-token");
      mockQuery.mockResolvedValue({});
      await mockRouter.routes['/generar_token_contr']({ body }, mockRes);
      expect(mockSign).toHaveBeenCalledWith({ id_seguro: 5, id_pers: 10 }, "nuevacontratacion", { expiresIn: "24h" });
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        token: "signed-token",
        message: "Token creado y guardado exitosamente."
      });
    });
    it('error DB', async () => {
      mockSign.mockReturnValue("signed-token");
      mockQuery.mockRejectedValue(new Error('fail'));
      await mockRouter.routes['/generar_token_contr']({ body }, mockRes);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ success: false, message: "Error del servidor" });
    });
  });

  // POST /validar-token-contr
  describe('POST /validar-token-contr', () => {
    const url = "test-url";
    const token = "tok";
    const id_pers = 1, id_seguro = 2, id_val_contra = 99;
    const payload = { id_pers, id_seguro };

    it('éxito', async () => {
      mockQuery
        .mockResolvedValueOnce({ rowCount: 1, rows: [{ token_val_contra: token, id_val_contra }] }) // buscar token
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }) // cliente
        .mockResolvedValueOnce({ rows: [{ id: 2 }] }); // seguros
      mockVerify.mockReturnValue(payload);

      await mockRouter.routes['/validar-token-contr']({ body: { url } }, mockRes);
      expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        message: "Token válido.",
        data: payload,
        client: [{ id: 1 }],
        contr: [{ id: 2 }],
        idvalid: id_val_contra
      }));
    });

    it('url no encontrada', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });
      await mockRouter.routes['/validar-token-contr']({ body: { url } }, mockRes);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ success: false, message: "URL no encontrada." });
    });

    it('token inválido', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 1, rows: [{ token_val_contra: token, id_val_contra }] });
      mockVerify.mockImplementation(() => { throw new Error("bad token"); });
      await mockRouter.routes['/validar-token-contr']({ body: { url } }, mockRes);
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ success: false, message: "Token inválido o expirado." });
    });

    it('error DB', async () => {
      mockQuery.mockRejectedValue(new Error('fail'));
      await mockRouter.routes['/validar-token-contr']({ body: { url } }, mockRes);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ success: false, message: "Error interno del servidor." });
    });
  });

  // PUT /activar-seguro
  describe('PUT /activar-seguro', () => {
    const body = { id: 1, idvalid: 2 };
    it('éxito', async () => {
      mockQuery
        .mockResolvedValueOnce({ rowCount: 1 }) // update
        .mockResolvedValueOnce({}); // delete
      await mockRouter.routes['/activar-seguro']({ body }, mockRes);
      expect(mockJson).toHaveBeenCalledWith({ message: "Contrato de seguro valiado correctamente." });
    });
    it('faltan datos', async () => {
      await mockRouter.routes['/activar-seguro']({ body: { id: 1 } }, mockRes);
      expect(mockStatus).toHaveBeenCalledWith(400);
      expect(mockJson).toHaveBeenCalledWith({ error: "Faltan datos requeridos (id o idvalid)." });
    });
    it('contratacion no encontrada', async () => {
      mockQuery.mockResolvedValueOnce({ rowCount: 0 });
      await mockRouter.routes['/activar-seguro']({ body }, mockRes);
      expect(mockStatus).toHaveBeenCalledWith(404);
      expect(mockJson).toHaveBeenCalledWith({ error: "contratacion no encontrada no encontrado." });
    });
    it('error DB', async () => {
      mockQuery.mockRejectedValue(new Error('fail'));
      await mockRouter.routes['/activar-seguro']({ body }, mockRes);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: "Error interno al actualizar cliente." });
    });
  });
});