import ApiService from "../../services/ApiService";

class SegurosAdminFun {

   static async traerTiposSeguros(navigate){
      const response =  await ApiService.getAll("tiposeguro/listar",navigate);
      return response;
   }
   
   static async categoria(navigate){
      const response =  await ApiService.getAll("tiposeguro/categoria",navigate);
      return response;
   }

   static async beneficios(id,navigate){
      const response =  await ApiService.get("tiposeguro/beneficios",id,navigate);
      return response;
   }

   static async guardarTipoSeguro(formulario,navigate){
      const response =  await ApiService.post("tiposeguro/save",formulario,navigate);
      return response;
   }

   static async guardarBeneficioSeguro(formulario,navigate){
      const response =  await ApiService.post("tiposeguro/savebeneficios",formulario,navigate);
      return response;
   }
    static async SeguroBeneficios(id,navigate){
      const response =  await ApiService.get("tiposeguro/seguroBeneficio",id,navigate);
      return response;
   }
    static async actualizarTipoSeguro(formulario,navigate){
      const response =  await ApiService.put("tiposeguro/updateSeguro",formulario,navigate);
      return response;
   }
   static async borrarBeneficios(id,navigate){
      const response =  await ApiService.delete("tiposeguro/deleteBeneficios",id,navigate);
      return response;
   }
    static async actualizarEstado(formulario,navigate){
      const response =  await ApiService.put("tiposeguro/desactivar",formulario,navigate);
      return response;
   }

    static async buscarInformacionBenCateg(id,navigate){
      const response =  await ApiService.get("seguro/informacion-ben-categ",id,navigate);
      return response;
   }
  
}
    export default SegurosAdminFun;