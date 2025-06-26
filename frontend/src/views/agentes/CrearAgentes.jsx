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
    const [errores, setErrores] = useState({});

    // Función para validar solo números
    const validarSoloNumeros = (valor) => {
        return /^\d*$/.test(valor);
    };

    // Función para validar formato de email
    const validarEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const asignarValores = (e) => {
        const { name, value } = e.target;
        let valorValido = value;
        let nuevosErrores = { ...errores };

        // Validaciones específicas por campo
        if (name === 'ced_agente') {
            if (!validarSoloNumeros(value)) {
                nuevosErrores.ced_agente = 'La cédula solo debe contener números';
                return; // No actualizar el valor si no es válido
            } else {
                delete nuevosErrores.ced_agente;
            }
        }

        if (name === 'tel_agente') {
            if (!validarSoloNumeros(value)) {
                nuevosErrores.tel_agente = 'El teléfono solo debe contener números';
                return; // No actualizar el valor si no es válido
            } else {
                delete nuevosErrores.tel_agente;
            }
        }

        if (name === 'email_agente') {
            if (value && !validarEmail(value)) {
                nuevosErrores.email_agente = 'Ingrese un formato de correo válido';
            } else {
                delete nuevosErrores.email_agente;
            }
        }

        setErrores(nuevosErrores);
        setFormulario({ ...formulario, [name]: valorValido });
    }
    const crearAgente = async (e) => {
        e.preventDefault()
        try {
            // Verificar que todos los campos estén llenos
            if (!Object.values(formulario).every(valor => valor !== '')) {
                toast.error('Todos los campos son obligatorios');
                return;
            }

            // Verificar que no haya errores de validación
            if (Object.keys(errores).length > 0) {
                toast.error('Por favor corrija los errores en el formulario');
                return;
            }

            // Validación final del email
            if (!validarEmail(formulario.email_agente)) {
                toast.error('Por favor ingrese un correo electrónico válido');
                return;
            }

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
        } catch (error) {
            toast.error('Error al crear el agente');
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
        <div className="crear-agentes-container">
            <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />

            <form className="crear-agentes-form">
                <h2 className="crear-agentes-title">Registrar Nuevo Agente</h2>

                <div className="form-campos">
                    <div className="form-group">
                        <label className="form-label" htmlFor="ced_agente">Cédula</label>
                        <input
                            className={`form-input ${errores.ced_agente ? 'input-error' : ''}`}
                            type="text"
                            name="ced_agente"
                            id="ced_agente"
                            value={formulario.ced_agente}
                            onChange={asignarValores}
                            placeholder="Ingrese la cédula"
                        />
                        {errores.ced_agente && <span className="error-message">{errores.ced_agente}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="nom_agente">Nombres</label>
                        <input
                            className="form-input"
                            type="text"
                            name="nom_agente"
                            id="nom_agente"
                            value={formulario.nom_agente}
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
                            value={formulario.ape_agente}
                            onChange={asignarValores}
                            placeholder="Ingrese los apellidos"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="tel_agente">Teléfono</label>
                        <input
                            className={`form-input ${errores.tel_agente ? 'input-error' : ''}`}
                            type="tel"
                            name="tel_agente"
                            id="tel_agente"
                            value={formulario.tel_agente}
                            onChange={asignarValores}
                            maxLength={10}
                            placeholder="Ingrese el teléfono"
                        />
                        {errores.tel_agente && <span className="error-message">{errores.tel_agente}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="email_agente">Correo</label>
                        <input
                            className={`form-input ${errores.email_agente ? 'input-error' : ''}`}
                            type="email"
                            name="email_agente"
                            id="email_agente"
                            value={formulario.email_agente}
                            onChange={asignarValores}
                            placeholder="Ingrese el correo electrónico"
                        />
                        {errores.email_agente && <span className="error-message">{errores.email_agente}</span>}
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="dire_agente">Dirección</label>
                        <input
                            className="form-input"
                            type="text"
                            name="dire_agente"
                            id="dire_agente"
                            value={formulario.dire_agente}
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