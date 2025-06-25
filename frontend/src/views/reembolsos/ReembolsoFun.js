import ApiService from "../../services/ApiService";

class ReembolsoFun {

  static async enviarReembolso(formulario, navigate) {
    const response = await ApiService.post("reembolso/save-reembolso", formulario, navigate);
    return response;
  }

  static async guardarArhivoReembolso(formulario, id, navigate) {
    const response = await ApiService.postArchive(`archivo/reembolso-pdf/${id}`, formulario, navigate);
    return response;
  }
  static async buscarArhivoReembolsoPDF(nombreBase, subfolder, navigate) {
    const response = await ApiService.getArchivoSearch(`archivo/buscar-reembolso/${subfolder}`, nombreBase, navigate);
    return response;
  }
  static async traerSegurosContratados(id, navigate) {
    const response = await ApiService.get("seguro/reembolso-seguros-clientes", id, navigate);
    return response;
  }
  static async guardarArhivoReembolso(formulario, id, navigate) {
    const response = await ApiService.postArchive(`archivo/reembolso-pdf/${id}`, formulario, navigate);
    return response;
  }

  static async buscarReembolsoCliente(id, navigate) {
    const response = await ApiService.get("reembolso/buscar-reembolso-cliente", id, navigate);
    return response;
  }

  static async traerReembolsos(navigate) {
    const response = await ApiService.getAll("reembolso/listar", navigate);
    return response;
  }

  static async aceptarRevisionReembolso(formulario, navigate) {
    const response = await ApiService.post("reembolso/save-revision-aprovado", formulario, navigate);
    return response;
  }

  static async rechazarRevisionReembolso(formulario, navigate) {
    const response = await ApiService.post("reembolso/save-revision-rechasada", formulario, navigate);
    return response;
  }
  static async infoAceptadoReembolso(id, navigate) {
    const response = await ApiService.get("reembolso/buscar-reembolso-aceptado", id, navigate);
    return response;
  }
  static async infoRechazadoReembolso(id, navigate) {
    const response = await ApiService.get("reembolso/buscar-reembolso-rechazado", id, navigate);
    return response;
  }
}

export default ReembolsoFun;
