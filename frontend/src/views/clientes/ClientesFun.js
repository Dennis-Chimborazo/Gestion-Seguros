import ApiService from "../../services/ApiService";

class ClientesFun {

    static async traerPaises(navigate){
       const response =  await ApiService.getAll("direccion/pais",navigate);
       return response;
    }
    static async traerProvincias(id,navigate){
       const response =  await ApiService.get("direccion/provincia",id,navigate);
       return response;
    }
    static async traerCiudades(id,navigate){
       const response =  await ApiService.get("direccion/ciudad",id,navigate);
       return response;
    }
    static async guardarCliente(formulario,navigate){
      const response =  await ApiService.post("client/save",formulario,navigate);
      return response;
   }
   static async obtenerCliente(navigate){
      const response =  await ApiService.getAll("client/listar",navigate);
      return response;
   }
   static async buscarDireccionCliente(id,navigate){
      const response =  await ApiService.get("direccion/client",id,navigate);
      return response;
   }

   static async actualizarCliente(formulario,navigate){
      const response =  await ApiService.put("client/update",formulario,navigate);
      return response;
   }

   static async actualizarEstadoCliente(formulario,navigate){
      const response =  await ApiService.put("client/desactivar",formulario,navigate);
      return response;
   }
    static async actualizarEstadoActivo(formulario,navigate){
      const response =  await ApiService.put("client/activar",formulario,navigate);
      return response;
   }
    static async comprobarCredenciales(formulario,navigate){
      const response =  await ApiService.post("client/comprobCredenciales",formulario,navigate);
      return response;
   }
    static async crearCuenta(formulario,navigate){
      const response =  await ApiService.post("user/crearusuariocliente",formulario,navigate);
      return response;
   }
   static async generarTokenValidacion(formulario,navigate){
      const response =  await ApiService.post("client/generar_token_email",formulario,navigate);
      return response;
   }
    static async enviarCorreoEmail(formulario,navigate){
      const response =  await ApiService.post("email/enviar-correo",formulario,navigate);
      return response;
   }

   static async validarTokenEmail(formulario,navigate){
      const response =  await ApiService.post("client/validar-token-email",formulario,navigate);
      return response;
   }

    static async buscarcliente(id,navigate){
      const response =  await ApiService.get("client/buscarclienteID",id,navigate);
      return response;
   }
   static async activarCuentaUsuario(id,navigate){
      const response =  await ApiService.put("client/activar-cuenta",id,navigate);
      return response;
   }
   static async obtenerClientePeniente(navigate){
      const response =  await ApiService.getAll("client/listarPendientes",navigate);
      return response;
   }
      static async actualizarTokenValidacion(id,navigate){
      const response =  await ApiService.put("client/actualizar_token_email",id,navigate);
      return response;
   }
   static async actualizarEmailCliente(id,navigate){
      const response =  await ApiService.put("client/update-correo",id,navigate);
      return response;
   }

   static async guardarArhivoImagen(formulario,id,navigate){
      const response =  await ApiService.postArchive(`archivo/foto-perfil/${id}`,formulario,navigate);
      return response;
   }
   static async guardarArhivoCedula(formulario,id,navigate){
      const response =  await ApiService.postArchive(`archivo/cedula-pdf/${id}`,formulario,navigate);
      return response;
   }
    static async buscarArchivos(tipo, id, navigate) {
  const response = await ApiService.getArchivo('archivo/buscar', id, tipo, navigate);
  return response;
}

}
    export default ClientesFun;