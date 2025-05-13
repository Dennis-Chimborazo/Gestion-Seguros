import ApiService from "../../services/ApiService";

class SegurosAdminFun {

   static async traerTiposSeguros(navigate){
      const response =  await ApiService.traerDatos("tiposeguro/listar",navigate);
      return response;
   }
   
   static async categoria(navigate){
      const response =  await ApiService.traerDatos("tiposeguro/categoria",navigate);
      return response;
   }

   static async beneficios(id,navigate){
      const response =  await ApiService.buscarDatos("tiposeguro/beneficios",id,navigate);
      return response;
   }

   static async guardarTipoSeguro(formulario,navigate){
      const response =  await ApiService.enviarDatos("tiposeguro/save",formulario,navigate);
      return response;
   }

   static async guardarBeneficioSeguro(formulario,navigate){
      const response =  await ApiService.enviarDatos("tiposeguro/savebeneficios",formulario,navigate);
      return response;
   }
    static async SeguroBeneficios(id,navigate){
      const response =  await ApiService.buscarDatos("tiposeguro/seguroBeneficio",id,navigate);
      return response;
   }
    static async actualizarTipoSeguro(formulario,navigate){
      const response =  await ApiService.actualizarDatos("tiposeguro/updateSeguro",formulario,navigate);
      return response;
   }
   static async borrarBeneficios(id,navigate){
      const response =  await ApiService.borrarDatos("tiposeguro/deleteBeneficios",id,navigate);
      return response;
   }
    static async actualizarEstado(formulario,navigate){
      const response =  await ApiService.actualizarDatos("tiposeguro/desactivar",formulario,navigate);
      return response;
   }
  
}
    export default SegurosAdminFun;