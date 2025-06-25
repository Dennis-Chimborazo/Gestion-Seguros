import axios from "axios";
import swal from "sweetalert";

const apiUrl = "192.168.0.1:3000";

class ApiService {

  static async getAll(getApi, navigate) {
    const tokenInfo = JSON.parse(localStorage.getItem("login"));
    const token = tokenInfo ? tokenInfo.token : "";

    const response = await axios.get(apiUrl + getApi, {
      headers: {
        "Content-Type": "application/json",
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

  static async post(postApi, form, navigate) {

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

  static async get(getApi, id, navigate) {
    const tokenInfo = JSON.parse(localStorage.getItem("login"));
    const token = tokenInfo ? tokenInfo.token : "";
    console.log(`${apiUrl}${getApi}?id=${id}`)
    const response = await axios.get(`${apiUrl}${getApi}?id=${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return Array.isArray(response.data) ? response.data : [];
  }

  static async getNull(getApi, id, navigate) {
    const response = await axios.get(`${apiUrl}${getApi}?id=${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return Array.isArray(response.data) ? response.data : [];
  }

  static async put(putApi, form, navigate) {
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

  static async delete(deleteApi, form) {
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

  static async postArchive(postApi, form, navigate) {
    const response = await axios.post(
      apiUrl + `${postApi}`,
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

    return response.data;
  }
  
  static async getArchivo(getApi, id, tipo, navigate) {
    const tokenInfo = JSON.parse(localStorage.getItem("login"));
    const token = tokenInfo ? tokenInfo.token : "";

    const url = `${apiUrl}${getApi}/${id}?tipo=${tipo}`;

    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.url;
  }

  static async getArchivoSearch(getApi, nombreBase, navigate) {
    const tokenInfo = JSON.parse(localStorage.getItem("login"));
    const token = tokenInfo ? tokenInfo.token : "";
    const url = `${apiUrl}${getApi}?nombre=${encodeURIComponent(nombreBase)}`;
    try {
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.url; // Devuelve la URL del PDF

    } catch (error) {
      console.error("🔴 Error al obtener archivo PDF:", error);
      if (navigate) navigate("/error");
      throw error;
    }
  }


}

export default ApiService;
