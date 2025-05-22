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
    ApiService.traerDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.traerPaises(mockNavigate);
    expect(ApiService.traerDatos).toHaveBeenCalledWith("direccion/pais", mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("traerProvincias llama a ApiService.buscarDatos", async () => {
    ApiService.buscarDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.traerProvincias(1, mockNavigate);
    expect(ApiService.buscarDatos).toHaveBeenCalledWith("direccion/provincia", 1, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("guardarCliente llama a ApiService.enviarDatos", async () => {
    const form = { nombre: "Ejemplo" };
    ApiService.enviarDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.guardarCliente(form, mockNavigate);
    expect(ApiService.enviarDatos).toHaveBeenCalledWith("client/save", form, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("obtenerCliente llama a ApiService.traerDatos", async () => {
    ApiService.traerDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.obtenerCliente(mockNavigate);
    expect(ApiService.traerDatos).toHaveBeenCalledWith("client/listar", mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("validarTokenEmail llama a ApiService.enviarDatos", async () => {
    const form = { token: "1234" };
    ApiService.enviarDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.validarTokenEmail(form, mockNavigate);
    expect(ApiService.enviarDatos).toHaveBeenCalledWith("client/validar-token-email", form, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  // Nuevas pruebas para métodos faltantes
  test("traerCiudades llama a ApiService.buscarDatos", async () => {
    ApiService.buscarDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.traerCiudades(5, mockNavigate);
    expect(ApiService.buscarDatos).toHaveBeenCalledWith("direccion/ciudad", 5, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("buscarDireccionCliente llama a ApiService.buscarDatos", async () => {
    ApiService.buscarDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.buscarDireccionCliente(10, mockNavigate);
    expect(ApiService.buscarDatos).toHaveBeenCalledWith("direccion/client", 10, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("actualizarCliente llama a ApiService.actualizarDatos", async () => {
    const form = { id: 1, nombre: "Cliente Actualizado", email: "test@test.com" };
    ApiService.actualizarDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.actualizarCliente(form, mockNavigate);
    expect(ApiService.actualizarDatos).toHaveBeenCalledWith("client/update", form, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("actualizarEstadoCliente llama a ApiService.actualizarDatos", async () => {
    const form = { id: 1, estado: false };
    ApiService.actualizarDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.actualizarEstadoCliente(form, mockNavigate);
    expect(ApiService.actualizarDatos).toHaveBeenCalledWith("client/desactivar", form, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("comprobarCredenciales llama a ApiService.enviarDatos", async () => {
    const form = { email: "test@test.com", password: "123456" };
    ApiService.enviarDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.comprobarCredenciales(form, mockNavigate);
    expect(ApiService.enviarDatos).toHaveBeenCalledWith("client/comprobCredenciales", form, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("crearCuenta llama a ApiService.enviarDatos", async () => {
    const form = { 
      nombre: "Nuevo Usuario", 
      email: "nuevo@test.com", 
      password: "password123" 
    };
    ApiService.enviarDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.crearCuenta(form, mockNavigate);
    expect(ApiService.enviarDatos).toHaveBeenCalledWith("user/crearusuariocliente", form, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("generarTokenValidacion llama a ApiService.enviarDatos", async () => {
    const form = { email: "test@test.com" };
    ApiService.enviarDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.generarTokenValidacion(form, mockNavigate);
    expect(ApiService.enviarDatos).toHaveBeenCalledWith("client/generar_token_email", form, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("enviarCorreoEmail llama a ApiService.enviarDatos", async () => {
    const form = { 
      destinatario: "test@test.com", 
      asunto: "Validación de cuenta", 
      mensaje: "Confirma tu cuenta" 
    };
    ApiService.enviarDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.enviarCorreoEmail(form, mockNavigate);
    expect(ApiService.enviarDatos).toHaveBeenCalledWith("email/enviar-correo", form, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("buscarclienteIDValEmail llama a ApiService.buscarDatos", async () => {
    ApiService.buscarDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.buscarclienteIDValEmail(15, mockNavigate);
    expect(ApiService.buscarDatos).toHaveBeenCalledWith("client/buscarclienteID", 15, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("activarCuentaUsuario llama a ApiService.actualizarDatos", async () => {
    ApiService.actualizarDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.activarCuentaUsuario(20, mockNavigate);
    expect(ApiService.actualizarDatos).toHaveBeenCalledWith("client/activar-cuenta", 20, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("obtenerClientePeniente llama a ApiService.traerDatos", async () => {
    ApiService.traerDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.obtenerClientePeniente(mockNavigate);
    expect(ApiService.traerDatos).toHaveBeenCalledWith("client/listarPendientes", mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("actualizarTokenValidacion llama a ApiService.actualizarDatos", async () => {
    ApiService.actualizarDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.actualizarTokenValidacion(25, mockNavigate);
    expect(ApiService.actualizarDatos).toHaveBeenCalledWith("client/actualizar_token_email", 25, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  test("actualizarEmailCliente llama a ApiService.actualizarDatos", async () => {
    ApiService.actualizarDatos.mockResolvedValue(mockResponse);
    const result = await ClientesFun.actualizarEmailCliente(30, mockNavigate);
    expect(ApiService.actualizarDatos).toHaveBeenCalledWith("client/update-correo", 30, mockNavigate);
    expect(result).toEqual(mockResponse);
  });

  // Pruebas adicionales para casos de error
  describe("Manejo de errores", () => {
    test("traerPaises maneja errores correctamente", async () => {
      const errorMock = new Error("Error de red");
      ApiService.traerDatos.mockRejectedValue(errorMock);
      
      await expect(ClientesFun.traerPaises(mockNavigate)).rejects.toThrow("Error de red");
      expect(ApiService.traerDatos).toHaveBeenCalledWith("direccion/pais", mockNavigate);
    });

    test("guardarCliente maneja errores correctamente", async () => {
      const errorMock = new Error("Error al guardar");
      const form = { nombre: "Test" };
      ApiService.enviarDatos.mockRejectedValue(errorMock);
      
      await expect(ClientesFun.guardarCliente(form, mockNavigate)).rejects.toThrow("Error al guardar");
      expect(ApiService.enviarDatos).toHaveBeenCalledWith("client/save", form, mockNavigate);
    });

    test("comprobarCredenciales maneja errores correctamente", async () => {
      const errorMock = new Error("Credenciales inválidas");
      const form = { email: "test@test.com", password: "wrong" };
      ApiService.enviarDatos.mockRejectedValue(errorMock);
      
      await expect(ClientesFun.comprobarCredenciales(form, mockNavigate)).rejects.toThrow("Credenciales inválidas");
      expect(ApiService.enviarDatos).toHaveBeenCalledWith("client/comprobCredenciales", form, mockNavigate);
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

      ApiService.enviarDatos
        .mockResolvedValueOnce({ success: true, message: "Usuario creado" })
        .mockResolvedValueOnce({ success: true, token: "abc123" })
        .mockResolvedValueOnce({ success: true, message: "Token válido" });

      const createResult = await ClientesFun.crearCuenta(userData, mockNavigate);
      const tokenResult = await ClientesFun.generarTokenValidacion(tokenData, mockNavigate);
      const validationResult = await ClientesFun.validarTokenEmail(validationData, mockNavigate);

      expect(createResult.success).toBe(true);
      expect(tokenResult.success).toBe(true);
      expect(validationResult.success).toBe(true);
      expect(ApiService.enviarDatos).toHaveBeenCalledTimes(3);
    });

    test("flujo de obtención de ubicaciones", async () => {
      ApiService.traerDatos.mockResolvedValueOnce({ data: [{ id: 1, nombre: "Ecuador" }] });
      ApiService.buscarDatos
        .mockResolvedValueOnce({ data: [{ id: 1, nombre: "Tungurahua" }] })
        .mockResolvedValueOnce({ data: [{ id: 1, nombre: "Ambato" }] });

      const paises = await ClientesFun.traerPaises(mockNavigate);
      const provincias = await ClientesFun.traerProvincias(1, mockNavigate);
      const ciudades = await ClientesFun.traerCiudades(1, mockNavigate);

      expect(paises.data).toHaveLength(1);
      expect(provincias.data).toHaveLength(1);
      expect(ciudades.data).toHaveLength(1);
      expect(ApiService.traerDatos).toHaveBeenCalledTimes(1);
      expect(ApiService.buscarDatos).toHaveBeenCalledTimes(2);
    });
  });
});