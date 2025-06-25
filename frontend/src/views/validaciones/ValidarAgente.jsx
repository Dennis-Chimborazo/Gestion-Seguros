import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../estilos/ValidarEmail.css";
import CargarInf from "../cargando/CargarInf";
import swal from "sweetalert2";
import UsuariosFun from "../usuarios/UsuariosFun";
import { Toaster, toast } from "sonner";
import AgenteFun from "../agentes/AgenteFun";

export function ValidarAgente() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [agente, setAgente] = useState({ id_pers: '', idvalid: '', nombre: "", apellido: "", passtemp: "" });
    const [error, setError] = useState(""); // para errores de token
    const [success, setSuccess] = useState(false); // si todo sale bien
    const [loading, setLoading] = useState(true);
    const [formulario, setFormulario] = useState({ id_pers: '', user: '', passtemp: "", pass: '', confirmPassword: '' })

    useEffect(() => {
        const verificar = async () => {
            try {
                const res = await AgenteFun.validarTokenEmail({ url: id }, navigate);
                if (res?.success && res.data?.id_pers) {
                    const resCli = await AgenteFun.buscarAgente(res.data.id_pers, navigate);
                    setAgente({
                        id_pers: res.data.id_pers,
                        nombre: resCli[0].nom_agente,
                        apellido: resCli[0].ape_agente,
                        idvalid: res.idvalid,
                        passtemp: res.data.pass
                    });
                    setFormulario(prevForm => ({ ...prevForm, id_pers: res.data.id_pers, user: resCli[0].email_agente }))
                    setSuccess(true);
                } else {
                    setError("Token inválido o expirado.");
                }
            } catch (error) {
                setError("El enlace ya expiró o no es válido.");
            } finally {
                setLoading(false);
            }
        };

        verificar();
    }, [id, navigate]);

    if (loading) {
        return <CargarInf />;
    }
    const verificarDatos = () => {
        if (formulario.passTemp === '') {
            toast.error("Falta ingresar la contraseña temporal");
        } else {
            if (formulario.passtemp === agente.passtemp) {
                if (Object.values(formulario).every(valor => valor !== '')) {
                    if (formulario.pass === formulario.confirmPassword) {
                        return true;
                    } else {
                        toast.error("Las contraseña no coinciden");
                        return false;
                    }
                } else {
                    toast.error("Faltan campos por llenar los campos");
                    return false;
                }
            } else {
                toast.error("Clave Temporal no coincide");
                return false;
            }
        }

    }
    const asignarValores = (e) => {
        setFormulario({ ...formulario, [e.target.name]: e.target.value })
    }
    const validarCuenta = async (e) => {
        e.preventDefault()
        if (verificarDatos()) {
            try {
                const api = await AgenteFun.activarCuentaAgente(({ id: agente.id_pers, idvalid: agente.idvalid }), navigate)
                if (api) {
                    await UsuariosFun.actualizarPass(formulario, navigate);
                    swal.fire({
                        title: "<label>Muchas Felicidades</label>",
                        text: "se ha completado con exito la validacion de tu cuenta en Seguros.SA \nYa puedes comenzar desde ahora mismo",
                        timer: 4500,
                    })
                    navigate('/');
                }

            } catch (error) {
                swal.fire({
                    title: "<label>Advertencia</label>",
                    text: "A ocurrido un fallo en tu validacion",
                    timer: 3500,
                })
            }
        }
    }

    const cancelarCuenta = (e) => {
        e.preventDefault()
        swal.fire({
            title: "⚠️ <label>Advertencia</label>",
            text: "Desea salir de la validanción de cuenta",
            showDenyButton: true,
            denyButtonText: "No",
            confirmButtonText: "Si"
        }).then(respuesta => {
            if (respuesta.isConfirmed) {navigate('/');}
        });
    }
    
    return (
        <div className="validar-email-container">
            <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
            <div className="validar-email-card">
                {success ? (
                    <>
                        <h2 className="validar-email-title">🎉 ¡Bienvenido a Seguros.SA!</h2>
                        <p className="validar-email-message">
                            {agente.nombre} {agente.apellido}, tu cuenta ha sido creada con éxito.
                        </p>
                        <p className="validar-email-message">
                            Para completar tu registro y validar tu identidad, ingresa una nueva contraseña.
                        </p>
                        <p className="validar-email-message">
                            Tu usuario por defecto es: {formulario.user || ''}
                        </p>

                        <div className="validar-email-form">
                            <label htmlFor="passtemp">Contraseña temporal</label>
                            <input type="password" id="passtemp" name="passtemp" onChange={asignarValores} />

                            <label htmlFor="pass">Nueva Contraseña</label>
                            <input type="password" id="pass" name="pass" onChange={asignarValores} />

                            <label htmlFor="confirmPassword">Confirme contraseña</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" onChange={asignarValores} />
                        </div>

                        <div className="validar-email-button-container">
                            <button className="validar-email-button cancel" onClick={cancelarCuenta}>Cancelar</button>
                            <button className="validar-email-button" onClick={validarCuenta}>Validar cuenta</button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="validar-email-title">⚠ Enlace inválido o expirado</h2>
                        <p className="validar-email-message">{error}</p>
                        <p className="validar-email-message">
                            Si crees que esto es un error o necesitas un nuevo enlace, contacta a soporte de Seguros.SA.
                        </p>
                        <button className="validar-email-button" onClick={() => navigate("/")}>OK</button>
                    </>
                )}
            </div>
        </div>
    );
}

export default ValidarAgente;
