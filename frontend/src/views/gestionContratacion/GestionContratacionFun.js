import ApiService from "../../services/ApiService";

class GestionContratacionFun {

   static async traerSeguros(navigate){
      const response =  await ApiService.traerDatos("seguro/listar",navigate);
      return response;
   }

   static async buscarCliente(id,navigate){
      const response =  await ApiService.buscarDatos("client/buscar",id,navigate);
      return response.data;
   }
    static async buscarEmpleado(id,navigate){
      const response =  await ApiService.buscarDatos("empleado/buscarempleado",id,navigate);
      return response;
   }

   static async guardarSeguro(formulario,navigate){
      const response =  await ApiService.enviarDatos("seguro/saveSeguro",formulario,navigate);
      return response;
   }

   static async guardarPersonaFact(formulario,navigate){
      const response =  await ApiService.enviarDatos("seguro/personafac/save",formulario,navigate);
      return response;
   }
   static async guardarCuentaBanco(formulario,navigate){
      const response =  await ApiService.enviarDatos("seguro/cuentabanco/save",formulario,navigate);
      return response;
   }
   static async guardarDependientes(formulario,navigate){
      const response =  await ApiService.enviarDatos("seguro/saveDependientes",formulario,navigate);
      return response;
   }
    static async enviarValidacionEmailGestCont(formulario,navigate){
      const response =  await ApiService.enviarDatos("email/correo-Gest-contratacion",formulario,navigate);
      return response;
   }
}
    export default GestionContratacionFun;