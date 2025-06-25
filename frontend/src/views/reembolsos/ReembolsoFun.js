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

  static async traerSegurosContratados(id, navigate) {
    const response = await ApiService.get("seguro/reembolso-seguros-clientes", id, navigate);
    return response;
  }
 static async guardarArhivoReembolso(formulario, id, navigate) {
      const response = await ApiService.postArchive(`archivo/reembolso-pdf/${id}`, formulario, navigate);
      return response;
   }
}

export default ReembolsoFun;
