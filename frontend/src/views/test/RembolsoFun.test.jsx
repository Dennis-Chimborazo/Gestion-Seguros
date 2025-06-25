import ReembolsoFun from '../reembolsos/ReembolsoFun';
import ApiService from '../../services/ApiService';

jest.mock('../../services/ApiService');

describe('ReembolsoFun', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Éxitos

  it('debe llamar a enviarReembolso correctamente', async () => {
    const mockForm = { motivo: 'Consulta médica', monto: 150 };
    const mockResponse = { success: true };
    ApiService.post.mockResolvedValue(mockResponse);

    const result = await ReembolsoFun.enviarReembolso(mockForm, mockNavigate);

    expect(ApiService.post).toHaveBeenCalledWith('reembolso/save-reembolso', mockForm, mockNavigate);
    expect(result).toBe(mockResponse);
  });

  it('debe llamar a guardarArhivoReembolso correctamente', async () => {
    const mockForm = new FormData();
    const id = 123;
    const mockResponse = { success: true };
    ApiService.postArchive.mockResolvedValue(mockResponse);

    const result = await ReembolsoFun.guardarArhivoReembolso(mockForm, id, mockNavigate);

    expect(ApiService.postArchive).toHaveBeenCalledWith(`archivo/reembolso-pdf/${id}`, mockForm, mockNavigate);
    expect(result).toBe(mockResponse);
  });

  it('debe llamar a traerSegurosContratados correctamente', async () => {
    const id = 123;
    const mockResponse = [{ id_seguro: 1 }];
    ApiService.get.mockResolvedValue(mockResponse);

    const result = await ReembolsoFun.traerSegurosContratados(id, mockNavigate);

    expect(ApiService.get).toHaveBeenCalledWith('seguro/reembolso-seguros-clientes', id, mockNavigate);
    expect(result).toBe(mockResponse);
  });

  it('debe llamar a buscarReembolsoCliente correctamente', async () => {
    const id = 123;
    const mockResponse = [{ id_reembolso: 1 }];
    ApiService.get.mockResolvedValue(mockResponse);

    const result = await ReembolsoFun.buscarReembolsoCliente(id, mockNavigate);

    expect(ApiService.get).toHaveBeenCalledWith('reembolso/buscar-reembolso-cliente', id, mockNavigate);
    expect(result).toBe(mockResponse);
  });

  // Errores

  it('lanza error si enviarReembolso falla', async () => {
    const mockForm = { motivo: 'Error', monto: 0 };
    ApiService.post.mockRejectedValue(new Error('Error al guardar reembolso'));

    await expect(ReembolsoFun.enviarReembolso(mockForm, mockNavigate))
      .rejects.toThrow('Error al guardar reembolso');
  });

  it('lanza error si guardarArhivoReembolso falla', async () => {
    const mockForm = new FormData();
    const id = 999;
    ApiService.postArchive.mockRejectedValue(new Error('Archivo inválido'));

    await expect(ReembolsoFun.guardarArhivoReembolso(mockForm, id, mockNavigate))
      .rejects.toThrow('Archivo inválido');
  });

  it('lanza error si traerSegurosContratados falla', async () => {
    const id = 404;
    ApiService.get.mockRejectedValue(new Error('Seguros no encontrados'));

    await expect(ReembolsoFun.traerSegurosContratados(id, mockNavigate))
      .rejects.toThrow('Seguros no encontrados');
  });

  it('lanza error si buscarReembolsoCliente falla', async () => {
    const id = 401;
    ApiService.get.mockRejectedValue(new Error('Cliente sin reembolsos'));

    await expect(ReembolsoFun.buscarReembolsoCliente(id, mockNavigate))
      .rejects.toThrow('Cliente sin reembolsos');
  });
});
