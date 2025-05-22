// src/views/test/GestionContratacionFun.test.js
import GestionContratacionFun from "../gestionContratacion/GestionContratacionFun";
import ApiService from "../../services/ApiService";

// Mock completo del módulo ApiService
jest.mock("../../services/ApiService", () => ({
  traerDatos: jest.fn(),
  buscarDatos: jest.fn(),
  enviarDatos: jest.fn(),
  actualizarDatos: jest.fn(),
}));

describe("GestionContratacionFun", () => {
  const navigate = jest.fn(); // mock de navigate
  const formulario = { campo: "valor" };
  const id = 123;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("traerSeguros debe llamar a ApiService.traerDatos con la ruta correcta", async () => {
    ApiService.traerDatos.mockResolvedValue("datos seguros");

    const result = await GestionContratacionFun.traerSeguros(navigate);

    expect(ApiService.traerDatos).toHaveBeenCalledWith("seguro/listar", navigate);
    expect(result).toBe("datos seguros");
  });

  test("buscarCliente debe usar ApiService.buscarDatos y devolver response.data", async () => {
    ApiService.buscarDatos.mockResolvedValue({ data: "cliente X" });

    const result = await GestionContratacionFun.buscarCliente(id, navigate);

    expect(ApiService.buscarDatos).toHaveBeenCalledWith("client/buscar", id, navigate);
    expect(result).toBe("cliente X");
  });

  test("buscarEmpleado debe usar ApiService.buscarDatos", async () => {
    ApiService.buscarDatos.mockResolvedValue("empleado Y");

    const result = await GestionContratacionFun.buscarEmpleado(id, navigate);

    expect(ApiService.buscarDatos).toHaveBeenCalledWith("empleado/buscarempleado", id, navigate);
    expect(result).toBe("empleado Y");
  });

  test("guardarSeguro debe usar ApiService.enviarDatos", async () => {
    ApiService.enviarDatos.mockResolvedValue("guardado");

    const result = await GestionContratacionFun.guardarSeguro(formulario, navigate);

    expect(ApiService.enviarDatos).toHaveBeenCalledWith("seguro/saveSeguro", formulario, navigate);
    expect(result).toBe("guardado");
  });

  test("guardarPersonaFact debe usar ApiService.enviarDatos", async () => {
    ApiService.enviarDatos.mockResolvedValue("persona facturada");

    const result = await GestionContratacionFun.guardarPersonaFact(formulario, navigate);

    expect(ApiService.enviarDatos).toHaveBeenCalledWith("seguro/personafac/save", formulario, navigate);
    expect(result).toBe("persona facturada");
  });

  test("guardarCuentaBanco debe usar ApiService.enviarDatos", async () => {
    ApiService.enviarDatos.mockResolvedValue("cuenta banco OK");

    const result = await GestionContratacionFun.guardarCuentaBanco(formulario, navigate);

    expect(ApiService.enviarDatos).toHaveBeenCalledWith("seguro/cuentabanco/save", formulario, navigate);
    expect(result).toBe("cuenta banco OK");
  });

  test("guardarDependientes debe usar ApiService.enviarDatos", async () => {
    ApiService.enviarDatos.mockResolvedValue("dependientes OK");

    const result = await GestionContratacionFun.guardarDependientes(formulario, navigate);

    expect(ApiService.enviarDatos).toHaveBeenCalledWith("seguro/saveDependientes", formulario, navigate);
    expect(result).toBe("dependientes OK");
  });

  test("enviarValidacionEmailGestCont debe usar ApiService.enviarDatos", async () => {
    ApiService.enviarDatos.mockResolvedValue("correo enviado");

    const result = await GestionContratacionFun.enviarValidacionEmailGestCont(formulario, navigate);

    expect(ApiService.enviarDatos).toHaveBeenCalledWith("email/correo-Gest-contratacion", formulario, navigate);
    expect(result).toBe("correo enviado");
  });

  test("generarTokenContratacion debe usar ApiService.enviarDatos", async () => {
    ApiService.enviarDatos.mockResolvedValue("token generado");

    const result = await GestionContratacionFun.generarTokenContratacion(formulario, navigate);

    expect(ApiService.enviarDatos).toHaveBeenCalledWith("seguro/generar_token_contr", formulario, navigate);
    expect(result).toBe("token generado");
  });

  test("validarTokenContratacion debe usar ApiService.enviarDatos", async () => {
    ApiService.enviarDatos.mockResolvedValue("token válido");

    const result = await GestionContratacionFun.validarTokenContratacion(formulario, navigate);

    expect(ApiService.enviarDatos).toHaveBeenCalledWith("seguro/validar-token-contr", formulario, navigate);
    expect(result).toBe("token válido");
  });

  test("activarContratacion debe usar ApiService.actualizarDatos", async () => {
    ApiService.actualizarDatos.mockResolvedValue("contratación activada");

    const result = await GestionContratacionFun.activarContratacion(formulario, navigate);

    expect(ApiService.actualizarDatos).toHaveBeenCalledWith("seguro/activar-seguro", formulario, navigate);
    expect(result).toBe("contratación activada");
  });
});
