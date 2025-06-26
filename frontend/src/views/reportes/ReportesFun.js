import ApiService from "../../services/ApiService";

class ReportesFun {

   static async traerInformacion(navigate) {
      const response = await ApiService.getAll("reportes/informacion", navigate);
      return response;
   }
   static async InformacionCliente(id,navigate){
      const response =  await ApiService.get("reportes/informacion-cliente",id,navigate);
      return response;
   }

    static async InformacionAgente(id,navigate){
      const response =  await ApiService.get("reportes/informacion-agente",id,navigate);
      return response;
   }
}
export default ReportesFun;