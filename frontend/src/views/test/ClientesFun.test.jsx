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

  // Agrega más test similares para otros métodos si lo deseas
});
