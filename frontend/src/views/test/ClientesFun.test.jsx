// src/__tests__/ClientesFun.test.js
import ClientesFun from "../clientes/ClientesFun";
import ApiService from "../../services/ApiService";

// Mocks del ApiService
jest.mock("../../services/ApiService");
const mockNavigate = jest.fn();
const mockResponse = { data: "respuesta_mock" };

describe("ClientesFun", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Pruebas existentes
  test("traerPaises llama a ApiService.traerDatos", async () => {
    ApiService.getAll.mockResolvedValue(mockResponse);
    const result = await ClientesFun.traerPaises(mockNavigate);
    expect(ApiService.getAll).toHaveBeenCalledWith("direccion/pais", mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("traerProvincias llama a ApiService.buscarDatos", async () => {
    ApiService.get.mockResolvedValue(mockResponse);
    const result = await ClientesFun.traerProvincias(1, mockNavigate);
    expect(ApiService.get).toHaveBeenCalledWith("direccion/provincia", 1, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("guardarCliente llama a ApiService.enviarDatos", async () => {
    const form = { nombre: "Ejemplo" };
    ApiService.post.mockResolvedValue(mockResponse);
    const result = await ClientesFun.guardarCliente(form, mockNavigate);
    expect(ApiService.post).toHaveBeenCalledWith("client/save", form, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("obtenerCliente llama a ApiService.traerDatos", async () => {
    ApiService.getAll.mockResolvedValue(mockResponse);
    const result = await ClientesFun.obtenerCliente(mockNavigate);
    expect(ApiService.getAll).toHaveBeenCalledWith("client/listar", mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("validarTokenEmail llama a ApiService.enviarDatos", async () => {
    const form = { token: "1234" };
    ApiService.post.mockResolvedValue(mockResponse);
    const result = await ClientesFun.validarTokenEmail(form, mockNavigate);
    expect(ApiService.post).toHaveBeenCalledWith("client/validar-token-email", form, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  // Nuevas pruebas para métodos faltantes
  test("traerCiudades llama a ApiService.buscarDatos", async () => {
    ApiService.get.mockResolvedValue(mockResponse);
    const result = await ClientesFun.traerCiudades(5, mockNavigate);
    expect(ApiService.get).toHaveBeenCalledWith("direccion/ciudad", 5, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("buscarDireccionCliente llama a ApiService.buscarDatos", async () => {
    ApiService.get.mockResolvedValue(mockResponse);
    const result = await ClientesFun.buscarDireccionCliente(10, mockNavigate);
    expect(ApiService.get).toHaveBeenCalledWith("direccion/client", 10, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("actualizarCliente llama a ApiService.actualizarDatos", async () => {
    const form = { id: 1, nombre: "Cliente Actualizado", email: "test@test.com" };
    ApiService.put.mockResolvedValue(mockResponse);
    const result = await ClientesFun.actualizarCliente(form, mockNavigate);
    expect(ApiService.put).toHaveBeenCalledWith("client/update", form, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("actualizarEstadoCliente llama a ApiService.actualizarDatos", async () => {
    const form = { id: 1, estado: false };
    ApiService.put.mockResolvedValue(mockResponse);
    const result = await ClientesFun.actualizarEstadoCliente(form, mockNavigate);
    expect(ApiService.put).toHaveBeenCalledWith("client/desactivar", form, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("comprobarCredenciales llama a ApiService.enviarDatos", async () => {
    const form = { email: "test@test.com", password: "123456" };
    ApiService.post.mockResolvedValue(mockResponse);
    const result = await ClientesFun.comprobarCredenciales(form, mockNavigate);
    expect(ApiService.post).toHaveBeenCalledWith("client/comprobCredenciales", form, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("crearCuenta llama a ApiService.enviarDatos", async () => {
    const form = {
      nombre: "Nuevo Usuario",
      email: "nuevo@test.com",
      password: "password123"
    };
    ApiService.post.mockResolvedValue(mockResponse);
    const result = await ClientesFun.crearCuenta(form, mockNavigate);
    expect(ApiService.post).toHaveBeenCalledWith("user/crearusuariocliente", form, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("generarTokenValidacion llama a ApiService.enviarDatos", async () => {
    const form = { email: "test@test.com" };
    ApiService.post.mockResolvedValue(mockResponse);
    const result = await ClientesFun.generarTokenValidacion(form, mockNavigate);
    expect(ApiService.post).toHaveBeenCalledWith("client/generar_token_email", form, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("enviarCorreoEmail llama a ApiService.enviarDatos", async () => {
    const form = {
      destinatario: "test@test.com",
      asunto: "Validación de cuenta",
      mensaje: "Confirma tu cuenta"
    };
    ApiService.post.mockResolvedValue(mockResponse);
    const result = await ClientesFun.enviarCorreoEmail(form, mockNavigate);
    expect(ApiService.post).toHaveBeenCalledWith("email/enviar-correo", form, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("buscarcliente llama a ApiService.getNull", async () => {
    const mockResponse = [{ id: 15, nombre: 'Juan' }]; // ejemplo respuesta mock
    const mockNavigate = jest.fn();

    // Mockeamos getNull, no get
    ApiService.getNull = jest.fn().mockResolvedValue(mockResponse);

    const result = await ClientesFun.buscarcliente(15, mockNavigate);

    expect(ApiService.getNull).toHaveBeenCalledWith("client/buscarclienteID", 15, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("preActivarCuentaUsuario llama a ApiService.put", async () => {
    ApiService.put = jest.fn().mockResolvedValue(mockResponse); // espía y mock
    const result = await ClientesFun.preActivarCuentaUsuario(20, mockNavigate);
    expect(ApiService.put).toHaveBeenCalledWith("client/activar-cuenta", 20, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("obtenerClientePeniente llama a ApiService.traerDatos", async () => {
    ApiService.getAll.mockResolvedValue(mockResponse);
    const result = await ClientesFun.obtenerClientePeniente(mockNavigate);
    expect(ApiService.getAll).toHaveBeenCalledWith("client/listarPendientes", mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("actualizarTokenValidacion llama a ApiService.actualizarDatos", async () => {
    ApiService.put.mockResolvedValue(mockResponse);
    const result = await ClientesFun.actualizarTokenValidacion(25, mockNavigate);
    expect(ApiService.put).toHaveBeenCalledWith("client/actualizar_token_email", 25, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("actualizarEmailCliente llama a ApiService.actualizarDatos", async () => {
    ApiService.put.mockResolvedValue(mockResponse);
    const result = await ClientesFun.actualizarEmailCliente(30, mockNavigate);
    expect(ApiService.put).toHaveBeenCalledWith("client/update-correo", 30, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  // Pruebas adicionales para casos de error
  describe("Manejo de errores", () => {
    test("traerPaises maneja errores correctamente", async () => {
      const errorMock = new Error("Error de red");
      ApiService.getAll.mockRejectedValue(errorMock);

      await expect(ClientesFun.traerPaises(mockNavigate)).rejects.toThrow("Error de red");
      expect(ApiService.getAll).toHaveBeenCalledWith("direccion/pais", mockNavigate);
    });

    test("guardarCliente maneja errores correctamente", async () => {
      const errorMock = new Error("Error al guardar");
      const form = { nombre: "Test" };
      ApiService.post.mockRejectedValue(errorMock);

      await expect(ClientesFun.guardarCliente(form, mockNavigate)).rejects.toThrow("Error al guardar");
      expect(ApiService.post).toHaveBeenCalledWith("client/save", form, mockNavigate);
    });

    test("comprobarCredenciales maneja errores correctamente", async () => {
      const errorMock = new Error("Credenciales inválidas");
      const form = { email: "test@test.com", password: "wrong" };
      ApiService.post.mockRejectedValue(errorMock);

      await expect(ClientesFun.comprobarCredenciales(form, mockNavigate)).rejects.toThrow("Credenciales inválidas");
      expect(ApiService.post).toHaveBeenCalledWith("client/comprobCredenciales", form, mockNavigate);
    });
  });

  // Pruebas de integración simuladas
  describe("Flujos de trabajo completos", () => {
    test("flujo completo de registro de cliente", async () => {
      const userData = {
        nombre: "Juan Pérez",
        email: "juan@test.com",
        password: "123456"
      };
      const tokenData = { email: "juan@test.com" };
      const validationData = { token: "abc123" };

      ApiService.post
        .mockResolvedValueOnce({ success: true, message: "Usuario creado" })
        .mockResolvedValueOnce({ success: true, token: "abc123" })
        .mockResolvedValueOnce({ success: true, message: "Token válido" });

      const createResult = await ClientesFun.crearCuenta(userData, mockNavigate);
      const tokenResult = await ClientesFun.generarTokenValidacion(tokenData, mockNavigate);
      const validationResult = await ClientesFun.validarTokenEmail(validationData, mockNavigate);

      expect(createResult.success).toBe(true);
      expect(tokenResult.success).toBe(true);
      expect(validationResult.success).toBe(true);
      expect(ApiService.post).toHaveBeenCalledTimes(3);
    });

    test("flujo de obtención de ubicaciones", async () => {
      ApiService.getAll.mockResolvedValueOnce({ data: [{ id: 1, nombre: "Ecuador" }] });
      ApiService.get
        .mockResolvedValueOnce({ data: [{ id: 1, nombre: "Tungurahua" }] })
        .mockResolvedValueOnce({ data: [{ id: 1, nombre: "Ambato" }] });

      const paises = await ClientesFun.traerPaises(mockNavigate);
      const provincias = await ClientesFun.traerProvincias(1, mockNavigate);
      const ciudades = await ClientesFun.traerCiudades(1, mockNavigate);

      expect(paises.data).toHaveLength(1);
      expect(provincias.data).toHaveLength(1);
      expect(ciudades.data).toHaveLength(1);
      expect(ApiService.getAll).toHaveBeenCalledTimes(1);
      expect(ApiService.get).toHaveBeenCalledTimes(2);
    });
  });
});