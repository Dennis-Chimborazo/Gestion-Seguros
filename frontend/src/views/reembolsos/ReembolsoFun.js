import ApiService from "../../services/ApiService";

class ReembolsoFun {

   static async traerSegurosContratados(id,navigate) {
      const response = await ApiService.get("seguro/reembolso-seguros-clientes",id, navigate);
      return response;
   }
   
   static async traerCiudades(id, navigate) {
      const response = await ApiService.get("direccion/ciudad", id, navigate);
      return response;
   }
   static async guardarCliente(formulario, navigate) {
      const response = await ApiService.post("client/save", formulario, navigate);
      return response;
   }
  
   static async actualizarCliente(formulario, navigate) {
      const response = await ApiService.put("client/update", formulario, navigate);
      return response;
   }

   static async guardarArhivoImagen(formulario, id, navigate) {
      const response = await ApiService.postArchive(`archivo/foto-perfil/${id}`, formulario, navigate);
      return response;
   }
   
   static async buscarArchivos(tipo, id, navigate) {
      const response = await ApiService.getArchivo('archivo/buscar', id, tipo, navigate);
      return response;
   }


}
export default ReembolsoFun;