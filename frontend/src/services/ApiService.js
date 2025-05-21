import axios from "axios";
import swal from "sweetalert";

const apiUrl= "http://localhost:4000/";

class ApiService {

  static async traerDatos(getApi, navigate) {
    const tokenInfo = JSON.parse(localStorage.getItem("login"));
    const token = tokenInfo ? tokenInfo.token : "";
  
    const response = await axios.get(apiUrl + getApi, {
      headers: {
        "Content-Type": "applicat   ion/json",
        Authorization: `Bearer ${token}`,
      },
    });
  
    const data = response.data;
  
    if (data.message === "Token no proporcionado" || data.message === "Token inválido o expirado") {
      swal({
        title: "Acceso restringuido",
        text: "Ha excedido el tiempo límite de la sesión",
        timer: 3000,
        icon: "error",
      });
      navigate("/");
      return; 
    }
  
    return data; 
  }

  static async enviarDatos(postApi, form,navigate) {

    console.log(apiUrl + `${postApi}`);
      const response = await axios.post(
        apiUrl + `${postApi}`, 
        form,
        {
          headers: {
            "Content-Type": "application/json", // Especificar el tipo de contenido
          },
        }
      );
      return response.data; 
  }

  static async buscarDatos(getApi, id,navigate) {
    const tokenInfo = JSON.parse(localStorage.getItem("login"));
    const token = tokenInfo ? tokenInfo.token : "";
    const response = await axios.get(`${apiUrl}${getApi}?id=${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
  
    return Array.isArray(response.data) ? response.data : [];
  }
  

  static async actualizarDatos(putApi, form,navigate) {
      const response = await axios.put(
        apiUrl + `${putApi}`, 
        form,
        {
          headers: {
            "Content-Type": "application/json", 
          },
        }
      );
      return response.data; 
  }

  static async borrarDatos(deleteApi, form) {
  const response = await axios.delete(apiUrl + `${deleteApi}`, {
    data: form,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return response;
}


  static async login(form) {
    const response = await axios.post(
      apiUrl + `user/ingreso`, 
      form,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; 
}


}

export default ApiService;