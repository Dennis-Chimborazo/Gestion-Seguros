import ApiService  from "./ApiService";
class Archivos {

   static async guardarArhivo(formulario, navigate) {
    const response = await ApiService.postArchive(`archivoAdicional/subir-archivo`, formulario, navigate);
    return response;
  }

  static async traerArchivo(id, navigate) {
    const response = await ApiService.getArchivo("archivoAdicional/buscar-archivo",id, navigate);
    return response;
  }
   static async traerImagen(id, navigate) {
    const response = await ApiService.getArchivo("archivoAdicional/buscar-imagen",id, navigate);
    return response;
  }
}

export default Archivos;
