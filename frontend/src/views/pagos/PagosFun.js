import ApiService from "../../services/ApiService";

class PagosFun {

static async enviarPago(formulario, navigate) {
    const response = await ApiService.post("pago/pago-cliente", formulario, navigate);
    return response;
  }
   static async pagoRevisionCliente(id, navigate) {
    const response = await ApiService.get("pago/pagos-revision-cliente", id, navigate);
    return response;
  }
  static async pagoAprobadosCliente(id, navigate) {
    const response = await ApiService.get("pago/pagos-aprobados-cliente", id, navigate);
    return response;
  }
  static async pagoRevisionPendiente(navigate) {
    const response = await ApiService.getAll("pago/pago-revision-pendientes", navigate);
    return response;
  }

   static async aceptarRevisionPago(formulario, navigate) {
    const response = await ApiService.post("pago/save-revision-aprovado", formulario, navigate);
    return response;
  }

  static async rechazarRevisionPago(formulario, navigate) {
    const response = await ApiService.post("pago/save-revision-rechasada", formulario, navigate);
    return response;
  }

  static async infoPagoRechazado(id, navigate) {
    const response = await ApiService.get("pago/buscar-pago-rechazado", id, navigate);
    return response;
  }
}

export default PagosFun;
