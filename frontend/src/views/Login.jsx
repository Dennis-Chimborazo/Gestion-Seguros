import React, { useState } from "react";
import ApiService from "../services/ApiService.js";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import "./estilos/Login.css";
import AgenteFun from "./agentes/AgenteFun.js";
import ClientesFun from "./clientes/ClientesFun.js";

export function Login() {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({ user: "", pass: "" });

  const ingresar = async () => {
    if (formulario.pass === "" || formulario.user === "") {
      toast.error("Complete todos los campos");
    } else {
      const res = await ApiService.login(formulario);
      if (res.success) {
        localStorage.setItem("login", JSON.stringify({
          login: true,
          token: res.token,
          user: res.user.id_persona
        }));
        navigate("/" + res.user.nom_rol, { state: { user: res.user } });
      } else {
        if (res.user.estado === 3) {
          if (res.user.nom_rol === 'agente') {
            try {
              const resAgente = await AgenteFun.BuscarRutaValidacion({ id: res.user.id_persona }, navigate);
              if (resAgente.success) {
                navigate(`/validacionAgente/${resAgente.url}`);
              }
            } catch (error) {
              if (error.response) {
                const status = error.response.status;

                if (status === 401) {
                  toast.error("Tu contraseña ha expirado o es inválida. Solicita una nueva..");
                } else if (status === 404) {
                  toast.error("No se encontró una URL asociada. Verifica el ID.");
                } else {
                  toast.error("Error al validar el enlace. Intenta más tarde.");
                }
              } else {
                toast.error("Error de red o del cliente. Verifica tu conexión.");
              }
            }
          } else {
             try {
              const resCliente = await ClientesFun.BuscarRutaValidacion({ id: res.user.id_persona }, navigate);
              if (resCliente.success) {
                navigate(`/validacionEmail/${resCliente.url}`);
              }
            } catch (error) {
              if (error.response) {
                const status = error.response.status;
                if (status === 401) {
                  toast.error("Tu contraseña ha expirado o es inválida. Solicita una nueva..");
                } else if (status === 404) {
                  toast.error("No se encontró una URL asociada. Verifica el ID.");
                } else {
                  toast.error("Error al validar el enlace. Intenta más tarde.");
                }
              } else {
                toast.error("Error de red o del cliente. Verifica tu conexión.");
              }
            }
          }
        } else {
          toast.error(res.user || "Error desconocido");
        }
      }
    }
  };

  const darValores = (e) => {
    setFormulario({
      ...formulario, [e.target.name]: e.target.value,
    });
  }
  
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Login</h1>
        <form onSubmit={(e) => e.preventDefault()} className="login-form">
          <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
          <input
            className="login-input"
            type="text"
            placeholder="Usuario"
            id="user"
            name="user"
            required
            onChange={darValores}
          />
          <input
            className="login-input"
            type="password"
            placeholder="Contraseña"
            id="pass"
            name="pass"
            required
            onChange={darValores}
          />
          <button className="login-button" onClick={ingresar}>Ingresar</button>
        </form>
      </div>
    </div>
  );
}


export default Login;
