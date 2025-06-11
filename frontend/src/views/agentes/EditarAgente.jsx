import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert2";
import Utilidades from "../../services/Utilidades";
import AgenteFun from "./AgenteFun";
import UsuariosFun from "../usuarios/UsuariosFun";
import { toast, Toaster } from "sonner";

export function EditarAgente({ mostrarSeccion }) {
    const navigate = useNavigate();
    const [formulario, setFormulario] = useState();
    const [formularioEdit, setFormularioEdit] = useState();

    useEffect(() => {
        const cargarDatos = () => {
            const editarData = JSON.parse(localStorage.getItem("editAgente"));
            if (editarData && editarData.agente) {
                setFormularioEdit(editarData.agente);
                setFormulario(editarData.agente);
                localStorage.removeItem("editAgente");
            }
        };

        cargarDatos();
    }, []);



    const asignarValores = (e) => {
        setFormularioEdit({ ...formularioEdit, [e.target.name]: e.target.value })
    }

    const editarDatosAgente = async (e) => {
        e.preventDefault()
        if (Object.values(formularioEdit).every(valor => valor !== '')) {
            if (verificacionCambios()) {
                swal.fire({
                    title: "<label>Confirmacion</label>",
                    text: "Esta seguro que desea aplicar los cambios",
                    showDenyButton: true,
                    denyButtonText: "No",
                    confirmButtonText: "Si"
                }).then(async (respuesta) => {
                    if (respuesta.isConfirmed) {
                        if (formulario.ced_agente !== formularioEdit.ced_agente || formulario.email_agente !== formularioEdit.email_agente) {
                            
                            let res = await UsuariosFun.verificarUsuario({ users: formularioEdit.email_agente, cedula: formularioEdit.ced_agente }, navigate);
                            if (res.existe) {
                                toast.error(res.message);
                            } else {
                                try {
                                    await AgenteFun.actualizarAgente(formularioEdit, navigate);
                                    swal.fire({
                                        title: "<label>Exito</label>",
                                        text: "Informacion del agente actualizada",
                                        timer: 3500,
                                    })
                                    mostrarSeccion("agente")
                                } catch (error) {
                                    swal.fire({
                                        title: "<label>Advertencia</label>",
                                        text: "Verifique los datos ingresados",
                                        timer: 3500,
                                    })
                                }
                            }
                        } else {
                            try {
                                await AgenteFun.actualizarAgente(formularioEdit, navigate);
                                swal.fire({
                                    title: "<label>Exito</label>",
                                    text: "Informacion del agente actualizada",
                                    timer: 3500,
                                })
                                mostrarSeccion("agente")
                            } catch (error) {
                                swal.fire({
                                    title: "<label>Advertencia</label>",
                                    text: "Verifique los datos ingresados",
                                    timer: 3500,
                                })
                            }
                        }
                    }
                });
            } else {
                toast.error("No se aplicado ningun cambio ");
            }
        } else {
            toast.error("Faltan campos por llenar ");
        }


    }

    const verificacionCambios = () => {
        const keysActual = Object.keys(formulario);
        let huboCambios = false;

        for (let key of keysActual) {
            const actual = String(formulario[key] ?? '');
            const original = String(formularioEdit[key] ?? '');
            if (actual !== original) {
                huboCambios = true;
            }
        }

        return huboCambios;
    };

    const cancelar = () => {
        if (verificacionCambios()) {
            swal.fire({
                title: "⚠️ <label>Advertencia</label>",
                text: "Desea descartar los cambios realizados",
                showDenyButton: true,
                denyButtonText: "No",
                confirmButtonText: "Si"
            }).then(async (respuesta) => {
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
                <input type="text" name="ced_agente" id="ced_agente" onChange={asignarValores} value={formularioEdit?.ced_agente || ''} />
                <label htmlFor=""> Nombres</label>
                <input type="text" name="nom_agente" id="nom_agente" onChange={asignarValores} value={formularioEdit?.nom_agente || ''} />
                <label htmlFor=""> Apellidos</label>
                <input type="text" name="ape_agente" id="ape_agente" onChange={asignarValores} value={formularioEdit?.ape_agente || ''} />
                <label htmlFor=""> Telefono</label>
                <input type="tel" name="tel_agente" id="tel_agente" onChange={asignarValores} maxLength={10} value={formularioEdit?.tel_agente || ''} />
                <label htmlFor=""> Correo</label>
                <input type="text" name="email_agente" id="email_agente" onChange={asignarValores} value={formularioEdit?.email_agente || ''} />
                <label htmlFor=""> Direccion</label>
                <input type="text" name="dire_agente" id="dire_agente" onChange={asignarValores} value={formularioEdit?.dire_agente || ''} />
            </div>
            <div>
                <button onClick={cancelar}>Cancelar</button>
                <button onClick={editarDatosAgente}>Editar</button>
            </div>
        </div>

    );
}
export default EditarAgente;