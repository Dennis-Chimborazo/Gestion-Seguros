import ApiService from "../../services/ApiService";

class ClientesFun {

    static async traerPaises(navigate){
       const response =  await ApiService.traerDatos("direccion/pais",navigate);
       return response;
    }
    static async traerProvincias(id,navigate){
       const response =  await ApiService.buscarDatos("direccion/provincia",id,navigate);
       return response;
    }
    static async traerCiudades(id,navigate){
       const response =  await ApiService.buscarDatos("direccion/ciudad",id,navigate);
       return response;
    }
    static async guardarCliente(formulario,navigate){
      const response =  await ApiService.enviarDatos("client/save",formulario,navigate);
      return response;
   }
   static async obtenerCliente(navigate){
      const response =  await ApiService.traerDatos("client/listar",navigate);
      return response;
   }
   static async buscarDireccionCliente(id,navigate){
      const response =  await ApiService.buscarDatos("direccion/client",id,navigate);
      return response;
   }

   static async actualizarCliente(formulario,navigate){
      const response =  await ApiService.actualizarDatos("client/update",formulario,navigate);
      return response;
   }

   static async actualizarEstadoCliente(formulario,navigate){
      const response =  await ApiService.actualizarDatos("client/desactivar",formulario,navigate);
      return response;
   }
    static async comprobarCredenciales(formulario,navigate){
      const response =  await ApiService.enviarDatos("client/comprobCredenciales",formulario,navigate);
      return response;
   }
    static async crearCuenta(formulario,navigate){
      const response =  await ApiService.enviarDatos("user/crearusuariocliente",formulario,navigate);
      return response;
   }
   static async generarTokenValidacion(formulario,navigate){
      const response =  await ApiService.enviarDatos("client/generar_token_email",formulario,navigate);
      return response;
   }
    static async enviarCorreoEmail(formulario,navigate){
      const response =  await ApiService.enviarDatos("email/enviar-correo",formulario,navigate);
      return response;
   }

   static async validarTokenEmail(formulario,navigate){
      const response =  await ApiService.enviarDatos("client/validar-token-email",formulario,navigate);
      return response;
   }

    static async buscarclienteIDValEmail(id,navigate){
      const response =  await ApiService.buscarDatos("client/buscarclienteID",id,navigate);
      return response;
   }
   static async activarCuentaUsuario(id,navigate){
      const response =  await ApiService.actualizarDatos("client/activar-cuenta",id,navigate);
      return response;
   }
   static async obtenerClientePeniente(navigate){
      const response =  await ApiService.traerDatos("client/listarPendientes",navigate);
      return response;
   }
      static async actualizarTokenValidacion(id,navigate){
      const response =  await ApiService.actualizarDatos("client/actualizar_token_email",id,navigate);
      return response;
   }
   static async actualizarEmailCliente(id,navigate){
      const response =  await ApiService.actualizarDatos("client/update-correo",id,navigate);
      return response;
   }
}
    export default ClientesFun;