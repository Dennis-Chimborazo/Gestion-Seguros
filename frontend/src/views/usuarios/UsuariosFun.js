import ApiService from "../../services/ApiService";

class UsuariosFun {

   static async actualizarPass(formulario, navigate) {
      const response = await ApiService.put("user/users-password", formulario, navigate);
      return response;
   }
   static async actualizarUserPass(formulario, navigate) {
      const response = await ApiService.put("user/update-usuario-password", formulario, navigate);
      return response;
   }
   static async crearCuentaAgente(formulario, navigate) {
      const response = await ApiService.post("user/crear-usuario-agente", formulario, navigate);
      return response;
   }

   static async verificarDatosUsuario(formulario, navigate) {
      const response = await ApiService.post("user/verificar-datos", formulario, navigate);
      return response;
   }
   static async verificarUsuario(formulario, navigate) {
      const response = await ApiService.post("user/usuario-existe", formulario, navigate);
      return response;
   }

}
export default UsuariosFun;