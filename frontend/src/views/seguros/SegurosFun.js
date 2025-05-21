import ApiService from "../../services/ApiService";

class SegurosFun {



   static async traerSeguros(navigate){
      const response =  await ApiService.traerDatos("seguro/listar",navigate);
      return response;
   }

   static async buscarCliente(id,navigate){
      const response =  await ApiService.buscarDatos("client/buscar",id,navigate);
      return response.data;
   }

   static async guardarSeguro(formulario,navigate){
      const response =  await ApiService.enviarDatos("seguro/saveSeguro",formulario,navigate);
      return response;
   }

   static async guardarAgencia(formulario,navigate){
      const response =  await ApiService.enviarDatos("seguro/agencia/save",formulario,navigate);
      return response;
   }
   static async guardarExclusivoEmpresa(formulario,navigate){
      const response =  await ApiService.enviarDatos("seguro/exclisivempresa/save",formulario,navigate);
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

}
    export default SegurosFun;