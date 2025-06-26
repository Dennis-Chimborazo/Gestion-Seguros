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
}

export default PagosFun;
