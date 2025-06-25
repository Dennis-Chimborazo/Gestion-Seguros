import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import swal from "sweetalert2";
import AgenteFun from "./AgenteFun";
import { toast, Toaster } from "sonner";
import "../estilos/EditarAgente.css";

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
        setFormularioEdit({ ...formularioEdit, [e.target.name]: e.target.value });
    };

    const editarDatosAgente = async (e) => {
        e.preventDefault();
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
                        try {
                            await AgenteFun.actualizarAgente(formularioEdit, navigate);
                            swal.fire({
                                title: "<label>Exito</label>",
                                text: "Informacion del agente actualizada",
                                timer: 3500,
                            });
                            mostrarSeccion("agente");
                        } catch (error) {
                            swal.fire({
                                title: "<label>Advertencia</label>",
                                text: "Verifique los datos ingresados",
                                timer: 3500,
                            });
                        }
                    }
                });
            } else {
                toast.error("No se aplicado ningun cambio");
            }
        } else {
            toast.error("Faltan campos por llenar");
        }
    };

    const verificacionCambios = () => {
        const keysActual = Object.keys(formulario);
        return keysActual.some(key => formulario[key] !== formularioEdit[key]);
    };

    const cancelar = () => {
        mostrarSeccion("agente");
    };

    return (
        <div className="editar-agente-container">
            <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
            <div className="editar-agente-form">
                <div className="editar-agente-header">
                    <h3 className="editar-agente-title">Editar Agente</h3>
                </div>

                <div className="form-section">
                    <h4 className="form-section-title">Información Personal</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="ced_agente">Cédula/Pasaporte</label>
                            <input className="form-input" type="text" name="ced_agente" id="ced_agente" onChange={asignarValores} value={formularioEdit?.ced_agente || ''} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="nom_agente">Nombres</label>
                            <input className="form-input" type="text" name="nom_agente" id="nom_agente" onChange={asignarValores} value={formularioEdit?.nom_agente || ''} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="ape_agente">Apellidos</label>
                            <input className="form-input" type="text" name="ape_agente" id="ape_agente" onChange={asignarValores} value={formularioEdit?.ape_agente || ''} />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h4 className="form-section-title">Información de Contacto</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="tel_agente">Teléfono</label>
                            <input className="form-input" type="tel" name="tel_agente" id="tel_agente" onChange={asignarValores} value={formularioEdit?.tel_agente || ''} />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email_agente">Correo Electrónico</label>
                            <input className="form-input" type="email" name="email_agente" id="email_agente" onChange={asignarValores} value={formularioEdit?.email_agente || ''} />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h4 className="form-section-title">Dirección</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="dire_agente">Dirección</label>
                            <input className="form-input" type="text" name="dire_agente" id="dire_agente" onChange={asignarValores} value={formularioEdit?.dire_agente || ''} />
                        </div>
                    </div>
                </div>

                <div className="actions-container">
                    <button className="btn-cancelar" onClick={cancelar}>Cancelar</button>
                    <button className="btn-guardar" onClick={editarDatosAgente}>Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
}
export default EditarAgente;