// __tests__/PagosFun.test.jsx
import PagosFun from "../pagos/PagosFun";
import ApiService from "../../services/ApiService";

jest.mock("../../services/ApiService");

describe("PagosFun", () => {
  const navigateMock = jest.fn();
  const formularioMock = { campo1: "valor1" };
  const idMock = "id123";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("enviarPago llama a ApiService.post con los parámetros correctos", async () => {
    ApiService.post.mockResolvedValue({ success: true });

    const res = await PagosFun.enviarPago(formularioMock, navigateMock);

    expect(ApiService.post).toHaveBeenCalledWith("pago/pago-cliente", formularioMock, navigateMock);
    expect(res).toEqual({ success: true });
  });

  test("pagoRevisionCliente llama a ApiService.get con los parámetros correctos", async () => {
    ApiService.get.mockResolvedValue([{ id: 1 }]);

    const res = await PagosFun.pagoRevisionCliente(idMock, navigateMock);

    expect(ApiService.get).toHaveBeenCalledWith("pago/pagos-revision-cliente", idMock, navigateMock);
    expect(res).toEqual([{ id: 1 }]);
  });

  test("pagoAprobadosCliente llama a ApiService.get con los parámetros correctos", async () => {
    ApiService.get.mockResolvedValue([{ id: 2 }]);

    const res = await PagosFun.pagoAprobadosCliente(idMock, navigateMock);

    expect(ApiService.get).toHaveBeenCalledWith("pago/pagos-aprobados-cliente", idMock, navigateMock);
    expect(res).toEqual([{ id: 2 }]);
  });

  test("pagoRevisionPendiente llama a ApiService.getAll con los parámetros correctos", async () => {
    ApiService.getAll.mockResolvedValue([{ id: 3 }]);

    const res = await PagosFun.pagoRevisionPendiente(navigateMock);

    expect(ApiService.getAll).toHaveBeenCalledWith("pago/pago-revision-pendientes", navigateMock);
    expect(res).toEqual([{ id: 3 }]);
  });

  test("aceptarRevisionPago llama a ApiService.post con los parámetros correctos", async () => {
    ApiService.post.mockResolvedValue({ aprobado: true });

    const res = await PagosFun.aceptarRevisionPago(formularioMock, navigateMock);

    expect(ApiService.post).toHaveBeenCalledWith("pago/save-revision-aprovado", formularioMock, navigateMock);
    expect(res).toEqual({ aprobado: true });
  });

  test("rechazarRevisionPago llama a ApiService.post con los parámetros correctos", async () => {
    ApiService.post.mockResolvedValue({ rechazado: true });

    const res = await PagosFun.rechazarRevisionPago(formularioMock, navigateMock);

    expect(ApiService.post).toHaveBeenCalledWith("pago/save-revision-rechasada", formularioMock, navigateMock);
    expect(res).toEqual({ rechazado: true });
  });

  test("infoPagoRechazado llama a ApiService.get con los parámetros correctos", async () => {
    ApiService.get.mockResolvedValue({ motivo: "Documento inválido" });

    const res = await PagosFun.infoPagoRechazado(idMock, navigateMock);

    expect(ApiService.get).toHaveBeenCalledWith("pago/buscar-pago-rechazado", idMock, navigateMock);
    expect(res).toEqual({ motivo: "Documento inválido" });
  });
});
