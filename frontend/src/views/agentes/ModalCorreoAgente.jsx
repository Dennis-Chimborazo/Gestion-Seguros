import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Utilidades from "../../services/Utilidades";
import UsuariosFun from "../usuarios/UsuariosFun";
import AgenteFun from "./AgenteFun";

export function ModalCorreoAgente({ cerrarModal, mostrarSeccion }) {
    const navigate = useNavigate();
    const [formulario, setFormulario] = useState({ email: '', newEmail: '', id_agente: '' })
    const [actualizarCorreo, setActualizarCorreo] = useState(false);

    useEffect(() => {
        const valores = () => {
            const editData = JSON.parse(localStorage.getItem("editCorreo"));
            if (editData && editData.agente) {
                setFormulario({ ...formulario, email: editData.agente.email_agente, id_agente: editData.agente.id_agente })
                localStorage.removeItem("editCorreo");
            }
        }
        valores();
    }, [])

    const asignarValores = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value })
    }
    const reenviarCorreo = async (e) => {
        e.preventDefault()
        const urlRandom = await Utilidades.crearRutaAleatoria()
        const passRandom = await Utilidades.crearPassAleatoria()
        if (actualizarCorreo) {
            if (formulario.newEmail === '') {
                toast.error("Ingrese el nuevo Correo Electronico");
            } else {
                const res = await UsuariosFun.verificarUsuario({ users: formulario.newEmail }, navigate);
                if (res.existe) {
                    toast.error(res.message);
                } else {
                    await AgenteFun.actualizarEmailAgente(formulario, navigate)
                    await AgenteFun.actualizarTokenValidacion({ id_agente: formulario.id_agente, url: urlRandom, pass: passRandom }, navigate);
                    await AgenteFun.enviarCorreoEmail({ to: formulario.newEmail, token: urlRandom, pass: passRandom }, navigate);
                    await UsuariosFun.actualizarUserPass({ id_pers: formulario.id_agente, pass: passRandom, user: formulario.newEmail }, navigate);
                    swal.fire({
                        title: "<label>Exito</label>",
                        text: "Se ha actualizado el correo y enviado un nuevo enlace de validacion",
                        timer: 3500,
                    })
                    cerrarModal();
                }
            }

        } else {
            await AgenteFun.actualizarTokenValidacion({ id_agente: formulario.id_agente, url: urlRandom, pass: passRandom }, navigate);
            await AgenteFun.enviarCorreoEmail({ to: formulario.email, token: urlRandom, pass: passRandom }, navigate);
            await UsuariosFun.actualizarPass({ id_pers: formulario.id_agente, pass: passRandom }, navigate);
            swal.fire({
                title: "<label>Exito</label>",
                text: "Se ha reembiado un nuevo enlace de validacion",
                timer: 3500,
            })
            cerrarModal()
        }
    }

    const cancelarCuenta = (e) => {
        e.preventDefault()
        cerrarModal()
    }
    const manejarCambioCheckbox = (e) => {
        const valor = e.target.checked;
        setActualizarCorreo(valor);
    };

    return (
        <form>
            <h3>Reenvio de validacion de cuenta</h3>
            <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />

            <p style={{ marginBottom: "1rem", fontStyle: "italic", color: "#2c3e50" }}>
                ✅ Verifique el correo electronico.
            </p>

            <label htmlFor="usuario">Correo</label>
            <input type="text" id="email" name="email" value={formulario.email || ''} />
            <p style={{ marginBottom: "1rem", fontStyle: "italic", color: "#2c3e50" }}>
                {<><input type="checkbox" name="actualizar" id="actualizar" onChange={manejarCambioCheckbox} /></>}Actualizar correo.
            </p>

            {actualizarCorreo && (
                <>
                    <label htmlFor="newEmail">Ingrese el nuevo Correo</label>
                    <input
                        type="email"
                        id="newEmail"
                        name="newEmail"
                        value={formulario.newEmail || ""}
                        onChange={asignarValores}
                    />
                </>
            )} <div>
                <button onClick={cancelarCuenta}>cancelar</button>
                <button onClick={reenviarCorreo}>{actualizarCorreo ? (<>Actualizar y reenviar</>) : (<>Reenviar Correo</>)}</button>

            </div>
        </form>
    );

}

export default ModalCorreoAgente;
