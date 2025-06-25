import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert2";
import Utilidades from "../../services/Utilidades";
import AgenteFun from "./AgenteFun";
import UsuariosFun from "../usuarios/UsuariosFun";
import { toast, Toaster } from "sonner";
import "../estilos/CrearAgentes.css";


export function CrearAgentes({ mostrarSeccion }) {
    const navigate = useNavigate();
    const [formulario, setFormulario] = useState({ ced_agente: '', nom_agente: '', ape_agente: '', email_agente: '', dire_agente: '', tel_agente: '' })
    const asignarValores = (e) => {
        const { name, value } = e.target;

        if (name === "tel_agente") {
            // Filtrar para aceptar solo números
            const soloNumeros = value.replace(/[^0-9]/g, "");
            setFormulario({ ...formulario, [name]: soloNumeros });
        } else {
            setFormulario({ ...formulario, [name]: value });
        }
    };

    const crearAgente = async (e) => {
        e.preventDefault()

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formulario.email_agente)) {
            toast.error("correo inválido");
            return;
        }
        try {
            if (Object.values(formulario).every(valor => valor !== '')) {
                let resVerif = await UsuariosFun.verificarDatosUsuario({ users: formulario.email_agente, cedula: formulario.ced_agente }, navigate);
                let resVerif = await UsuariosFun.verificarDatosUsuario({ users: formulario.email_agente, cedula: formulario.ced_agente }, navigate);
                if (resVerif.existe) {
                    toast.error(resVerif.message);
                } else {
                    const res = await AgenteFun.guardarAgente(formulario, navigate);
                    const pass = await Utilidades.crearPassAleatoria()
                    const resCuent = await UsuariosFun.crearCuentaAgente({ idpersona: res.id_agente, user: formulario.email_agente, pass: pass }, navigate)
                    if (resCuent) {
                        const urlRandom = await Utilidades.crearRutaAleatoria()
                        await AgenteFun.generarTokenValidacion(({ id_pers: res.id_agente, url: urlRandom, pass: pass }), navigate);
                        await AgenteFun.enviarCorreoEmail(({ to: formulario.email_agente, token: urlRandom, pass: pass }), navigate)
                        swal.fire({
                            title: "<label>Exito</label>",
                            text: "Nuevo agente creado",
                            timer: 3500,
                        })
                        mostrarSeccion("agente")
                    }
                }
            }
        } catch (error) {
            console.error("Error inesperado al crear agente:", error);
            toast.error("Error servidor");
        }
    }

    const limpiarFormulario = () => {
  setFormulario({
    ced_agente: '',
    nom_agente: '',
    ape_agente: '',
    email_agente: '',
    dire_agente: '',
    tel_agente: ''
  });
};

    const cancelar = () => {
        const algunCampoLleno = Object.values(formulario).some(valor => valor.trim() !== '');
        if (algunCampoLleno) {
            swal.fire({
                title: "⚠️ <label>Advertencia</label>",
                text: "Desea descartar los datos ingresados",
                showDenyButton: true,
                denyButtonText: "No",
                confirmButtonText: "Si"
            }).then(respuesta => {
                if (respuesta.isConfirmed) {
                    limpiarFormulario();
                    mostrarSeccion("agente")
                }
            });        } else {
            mostrarSeccion("agente")
        }
    }
    
    return (
        <div className="crear-agentes-container">
            <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
            
            <form className="crear-agentes-form">
                <h2 className="crear-agentes-title">Registrar Nuevo Agente</h2>
                
                <div className="form-campos">
                    <div className="form-group">
                        <label className="form-label" htmlFor="ced_agente">Cédula</label>
                        <input 
                            className="form-input" 
                            type="text" 
                            name="ced_agente" 
                            id="ced_agente" 
                            onChange={asignarValores} 
                            placeholder="Ingrese la cédula" 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label" htmlFor="nom_agente">Nombres</label>
                        <input 
                            className="form-input" 
                            type="text" 
                            name="nom_agente" 
                            id="nom_agente" 
                            onChange={asignarValores} 
                            placeholder="Ingrese los nombres" 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label" htmlFor="ape_agente">Apellidos</label>
                        <input 
                            className="form-input" 
                            type="text" 
                            name="ape_agente" 
                            id="ape_agente" 
                            onChange={asignarValores} 
                            placeholder="Ingrese los apellidos" 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label" htmlFor="tel_agente">Teléfono</label>
                        <input 
                            className="form-input" 
                            type="tel" 
                            name="tel_agente" 
                            id="tel_agente" 
                            onChange={asignarValores} 
                            maxLength={10} 
                            placeholder="Ingrese el teléfono" 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label" htmlFor="email_agente">Correo</label>
                        <input 
                            className="form-input" 
                            type="email" 
                            name="email_agente" 
                            id="email_agente" 
                            onChange={asignarValores} 
                            placeholder="Ingrese el correo electrónico" 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label" htmlFor="dire_agente">Dirección</label>
                        <input 
                            className="form-input" 
                            type="text" 
                            name="dire_agente" 
                            id="dire_agente" 
                            onChange={asignarValores} 
                            placeholder="Ingrese la dirección" 
                        />
                    </div>
                </div>
                
                <div className="form-actions">
                    <button type="button" className="btn-cancelar" onClick={cancelar}>Cancelar</button>
                    <button type="button" className="btn-crear" onClick={crearAgente}>Crear Agente</button>
                </div>
            </form>
        </div>
    );
}
export default CrearAgentes;