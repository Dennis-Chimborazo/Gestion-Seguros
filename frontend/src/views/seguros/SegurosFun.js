import ApiService from "../../services/ApiService";

class SegurosFun {

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
   
}
    export default SegurosFun;