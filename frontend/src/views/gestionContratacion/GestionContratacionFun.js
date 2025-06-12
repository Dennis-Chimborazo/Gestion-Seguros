import ApiService from "../../services/ApiService";

class GestionContratacionFun {

   static async traerSeguros(navigate){
      const response =  await ApiService.getAll("seguro/listar",navigate);
      return response;
   }

   static async buscarCliente(id,navigate){
      const response =  await ApiService.get("client/buscar",id,navigate);
      return response.data;
   }
    static async buscarEmpleado(id,navigate){
      const response =  await ApiService.get("empleado/buscarempleado",id,navigate);
      return response;
   }

   static async guardarSeguro(formulario,navigate){
      const response =  await ApiService.post("seguro/saveSeguro",formulario,navigate);
      return response;
   }

   static async guardarPersonaFact(formulario,navigate){
      const response =  await ApiService.post("seguro/personafac/save",formulario,navigate);
      return response;
   }
   static async guardarCuentaBanco(formulario,navigate){
      const response =  await ApiService.post("seguro/cuentabanco/save",formulario,navigate);
      return response;
   }
   static async guardarDependientes(formulario,navigate){
      const response =  await ApiService.post("seguro/saveDependientes",formulario,navigate);
      return response;
   }
    static async enviarValidacionEmailGestCont(formulario,navigate){
      const response =  await ApiService.post("email/correo-Gest-contratacion",formulario,navigate);
      return response;
   }
     static async generarTokenContratacion(formulario,navigate){
      const response =  await ApiService.post("seguro/generar_token_contr",formulario,navigate);
      return response;
   }
    static async validarTokenContratacion(formulario,navigate){
      const response =  await ApiService.post("seguro/validar-token-contr",formulario,navigate);
      return response;
   }
   static async activarContratacion(formulario,navigate){
      const response =  await ApiService.put("seguro/activar-seguro",formulario,navigate);
      return response;
   }
}
    export default GestionContratacionFun;