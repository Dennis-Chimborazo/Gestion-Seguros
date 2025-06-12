import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert2";
import Utilidades from "../../services/Utilidades";
import AgenteFun from "./AgenteFun";
import UsuariosFun from "../usuarios/UsuariosFun";
import { toast, Toaster } from "sonner";


export function CrearAgentes({ mostrarSeccion }) {
    const navigate = useNavigate();
    const [formulario, setFormulario] = useState({ ced_agente: '', nom_agente: '', ape_agente: '', email_agente: '', dire_agente: '', tel_agente: '' })
    const asignarValores = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value })
    }
    const crearAgente = async (e) => {
        e.preventDefault()
        try {
            if (Object.values(formulario).every(valor => valor !== '')) {
                let resVerif = await UsuariosFun.verificarUsuario({ users: formulario.email_agente, cedula: formulario.ced_agente }, navigate);
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

        }
    }

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
                    mostrarSeccion("agente")
                }
            });
        } else {
            mostrarSeccion("agente")
        }
    }

    return (
        <div>
            <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />

            <div>
                <label htmlFor=""> cedula</label>
                <input type="text" name="ced_agente" id="ced_agente" onChange={asignarValores} />
                <label htmlFor=""> Nombres</label>
                <input type="text" name="nom_agente" id="nom_agente" onChange={asignarValores} />
                <label htmlFor=""> Apellidos</label>
                <input type="text" name="ape_agente" id="ape_agente" onChange={asignarValores} />
                <label htmlFor=""> Telefono</label>
                <input type="tel" name="tel_agente" id="tel_agente" onChange={asignarValores} maxLength={10} />
                <label htmlFor=""> Correo</label>
                <input type="text" name="email_agente" id="email_agente" onChange={asignarValores} />
                <label htmlFor=""> Direccion</label>
                <input type="text" name="dire_agente" id="dire_agente" onChange={asignarValores} />
            </div>
            <div>
                <button onClick={cancelar}>Cancelar</button>
                <button onClick={crearAgente}>Crear</button>
            </div>
        </div>

    );
}
export default CrearAgentes;