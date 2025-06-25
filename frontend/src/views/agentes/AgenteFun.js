import ApiService from "../../services/ApiService";

class AgenteFun {

   static async guardarAgente(formulario, navigate) {
      const response = await ApiService.post("agente/save-agente", formulario, navigate);
      return response;
   }

   static async obtenerAgentes(navigate) {
      const response = await ApiService.getAll("agente/listar", navigate);
      return response;
   }
   static async obtenerAgentesPendientes(navigate) {
      const response = await ApiService.getAll("agente/listarPendientes", navigate);
      return response;
   }

   static async verificarUsuario(id, navigate) {
      const response = await ApiService.post("user/usuario-existe", id, navigate);
      return response;
   }

   static async generarTokenValidacion(formulario, navigate) {
      const response = await ApiService.post("agente/generar-token", formulario, navigate);
      return response;
   }
   static async enviarCorreoEmail(formulario, navigate) {
      const response = await ApiService.post("email/correo-agente", formulario, navigate);
      return response;
   }

   static async BuscarRutaValidacion(formulario, navigate) {
      const response = await ApiService.post("agente/buscar-ruta-token", formulario, navigate);
      return response;
   }
   static async validarTokenEmail(formulario, navigate) {
      const response = await ApiService.post("agente/validar-token-email", formulario, navigate);
      return response;
   }

   static async buscarAgente(id, navigate) {
      const response = await ApiService.getNull("agente/buscar-agente", id, navigate);
      return response;
   }
   static async activarCuentaAgente(id, navigate) {
      const response = await ApiService.put("agente/activar-cuenta", id, navigate);
      return response;
   }
   static async actualizarAgente(formulario, navigate) {
      const response = await ApiService.put("agente/update-agente", formulario, navigate);
      return response;
   }
   static async actualizarEmailAgente(id, navigate) {
      const response = await ApiService.put("agente/update-correo", id, navigate);
      return response;
   }
   static async actualizarTokenValidacion(formulario, navigate) {
      const response = await ApiService.put("agente/actualizar-token-email", formulario, navigate);
      return response;
   }

}
export default AgenteFun;