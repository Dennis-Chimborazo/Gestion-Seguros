// src/views/test/GestionContratacionFun.test.js
import GestionContratacionFun from "../gestionContratacion/GestionContratacionFun";
import ApiService from "../../services/ApiService";

// Mock completo del módulo ApiService
jest.mock("../../services/ApiService", () => ({
  getAll: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
}));

describe("GestionContratacionFun", () => {
  const navigate = jest.fn(); // mock de navigate
  const formulario = { campo: "valor" };
  const id = 123;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("traerSeguros debe llamar a ApiService.traerDatos con la ruta correcta", async () => {
    ApiService.getAll.mockResolvedValue("datos seguros");

    const result = await GestionContratacionFun.traerSeguros(navigate);

    expect(ApiService.getAll).toHaveBeenCalledWith("seguro/listar", navigate);
    expect(result).toBe("datos seguros");
  });

  test("buscarCliente debe usar ApiService.buscarDatos y devolver response.data", async () => {
    ApiService.get.mockResolvedValue({ data: "cliente X" });

    const result = await GestionContratacionFun.buscarCliente(id, navigate);

    expect(ApiService.get).toHaveBeenCalledWith("client/buscar", id, navigate);
    expect(result).toBe("cliente X");
  });

  test("buscarEmpleado debe usar ApiService.buscarDatos", async () => {
    ApiService.get.mockResolvedValue("empleado Y");

    const result = await GestionContratacionFun.buscarEmpleado(id, navigate);

    expect(ApiService.get).toHaveBeenCalledWith("empleado/buscarempleado", id, navigate);
    expect(result).toBe("empleado Y");
  });

  test("guardarSeguro debe usar ApiService.enviarDatos", async () => {
    ApiService.post.mockResolvedValue("guardado");

    const result = await GestionContratacionFun.guardarSeguro(formulario, navigate);

    expect(ApiService.post).toHaveBeenCalledWith("seguro/saveSeguro", formulario, navigate);
    expect(result).toBe("guardado");
  });

  test("guardarPersonaFact debe usar ApiService.enviarDatos", async () => {
    ApiService.post.mockResolvedValue("persona facturada");

    const result = await GestionContratacionFun.guardarPersonaFact(formulario, navigate);

    expect(ApiService.post).toHaveBeenCalledWith("seguro/personafac/save", formulario, navigate);
    expect(result).toBe("persona facturada");
  });

  test("guardarCuentaBanco debe usar ApiService.enviarDatos", async () => {
    ApiService.post.mockResolvedValue("cuenta banco OK");

    const result = await GestionContratacionFun.guardarCuentaBanco(formulario, navigate);

    expect(ApiService.post).toHaveBeenCalledWith("seguro/cuentabanco/save", formulario, navigate);
    expect(result).toBe("cuenta banco OK");
  });

  test("guardarDependientes debe usar ApiService.enviarDatos", async () => {
    ApiService.post.mockResolvedValue("dependientes OK");

    const result = await GestionContratacionFun.guardarDependientes(formulario, navigate);

    expect(ApiService.post).toHaveBeenCalledWith("seguro/saveDependientes", formulario, navigate);
    expect(result).toBe("dependientes OK");
  });

  test("enviarValidacionEmailGestCont debe usar ApiService.enviarDatos", async () => {
    ApiService.post.mockResolvedValue("correo enviado");

    const result = await GestionContratacionFun.enviarValidacionEmailGestCont(formulario, navigate);

    expect(ApiService.post).toHaveBeenCalledWith("email/correo-Gest-contratacion", formulario, navigate);
    expect(result).toBe("correo enviado");
  });

  test("generarTokenContratacion debe usar ApiService.enviarDatos", async () => {
    ApiService.post.mockResolvedValue("token generado");

    const result = await GestionContratacionFun.generarTokenContratacion(formulario, navigate);

    expect(ApiService.post).toHaveBeenCalledWith("seguro/generar_token_contr", formulario, navigate);
    expect(result).toBe("token generado");
  });

  test("validarTokenContratacion debe usar ApiService.enviarDatos", async () => {
    ApiService.post.mockResolvedValue("token válido");

    const result = await GestionContratacionFun.validarTokenContratacion(formulario, navigate);

    expect(ApiService.post).toHaveBeenCalledWith("seguro/validar-token-contr", formulario, navigate);
    expect(result).toBe("token válido");
  });

  test("activarContratacion debe usar ApiService.actualizarDatos", async () => {
    ApiService.put.mockResolvedValue("contratación activada");

    const result = await GestionContratacionFun.activarContratacion(formulario, navigate);

    expect(ApiService.put).toHaveBeenCalledWith("seguro/activar-seguro", formulario, navigate);
    expect(result).toBe("contratación activada");
  });
});
