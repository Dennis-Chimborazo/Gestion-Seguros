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
    const [errores, setErrores] = useState({});

    // Función para validar solo números
    const validarSoloNumeros = (valor) => {
        return /^\d*$/.test(valor);
    };

    // Función para validar cédula (exactamente 10 dígitos)
    const validarCedula = (valor) => {
        return /^\d{10}$/.test(valor);
    };

    // Función para validar solo letras (incluyendo espacios, tildes y ñ)
    const validarSoloLetras = (valor) => {
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(valor);
    };

    // Función para validar formato de email
    const validarEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

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
        const { name, value } = e.target;
        let valorValido = value;
        let nuevosErrores = { ...errores };

        // Validaciones específicas por campo
        if (name === 'ced_agente') {
            // Solo permitir números
            if (!validarSoloNumeros(value)) {
                return; // No actualiza el campo si no es número
            }
            if (value.length > 10) {
                return; // No permite más de 10 dígitos
            }
            if (value.length > 0 && value.length < 10) {
                nuevosErrores.ced_agente = 'La cédula debe tener exactamente 10 dígitos';
            } else if (value.length === 10) {
                delete nuevosErrores.ced_agente;
            } else {
                delete nuevosErrores.ced_agente;
            }
        }

        if (name === 'nom_agente') {
            // Solo permitir letras
            if (!validarSoloLetras(value)) {
                return; // No actualiza el campo si no es letra
            } else {
                delete nuevosErrores.nom_agente;
            }
        }

        if (name === 'ape_agente') {
            // Solo permitir letras
            if (!validarSoloLetras(value)) {
                return; // No actualiza el campo si no es letra
            } else {
                delete nuevosErrores.ape_agente;
            }
        }

        if (name === 'tel_agente') {
            // Solo permitir números
            if (!validarSoloNumeros(value)) {
                return; // No actualiza el campo si no es número
            }
            if (value.length > 10) {
                return; // No permite más de 10 dígitos
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
        setFormularioEdit({ ...formularioEdit, [name]: valorValido });
    };

    const editarDatosAgente = async (e) => {
        e.preventDefault();
        if (!formularioEdit || !Object.values(formularioEdit).every(valor => valor !== '')) {
            toast.error("Faltan campos por llenar");
            return;
        }
        if (!validarCedula(formularioEdit.ced_agente)) {
            toast.error('La cédula debe tener exactamente 10 dígitos');
            return;
        }
        if (Object.keys(errores).length > 0) {
            toast.error('Por favor corrija los errores en el formulario');
            return;
        }
        if (!validarEmail(formularioEdit.email_agente)) {
            toast.error('Por favor ingrese un correo electrónico válido');
            return;
        }
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
    };

    const verificacionCambios = () => {
        if (!formulario || !formularioEdit) return false;
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
                            <input className={`form-input ${errores.ced_agente ? 'input-error' : ''}`} type="text" name="ced_agente" id="ced_agente" onChange={asignarValores} value={formularioEdit?.ced_agente || ''} maxLength={10} />
                            {errores.ced_agente && <span className="error-message">{errores.ced_agente}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="nom_agente">Nombres</label>
                            <input className={`form-input ${errores.nom_agente ? 'input-error' : ''}`} type="text" name="nom_agente" id="nom_agente" onChange={asignarValores} value={formularioEdit?.nom_agente || ''} />
                            {errores.nom_agente && <span className="error-message">{errores.nom_agente}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="ape_agente">Apellidos</label>
                            <input className={`form-input ${errores.ape_agente ? 'input-error' : ''}`} type="text" name="ape_agente" id="ape_agente" onChange={asignarValores} value={formularioEdit?.ape_agente || ''} />
                            {errores.ape_agente && <span className="error-message">{errores.ape_agente}</span>}
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h4 className="form-section-title">Información de Contacto</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="tel_agente">Teléfono</label>
                            <input className={`form-input ${errores.tel_agente ? 'input-error' : ''}`} type="tel" name="tel_agente" id="tel_agente" onChange={asignarValores} value={formularioEdit?.tel_agente || ''} maxLength={10} />
                            {errores.tel_agente && <span className="error-message">{errores.tel_agente}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email_agente">Correo Electrónico</label>
                            <input className={`form-input ${errores.email_agente ? 'input-error' : ''}`} type="email" name="email_agente" id="email_agente" onChange={asignarValores} value={formularioEdit?.email_agente || ''} />
                            {errores.email_agente && <span className="error-message">{errores.email_agente}</span>}
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