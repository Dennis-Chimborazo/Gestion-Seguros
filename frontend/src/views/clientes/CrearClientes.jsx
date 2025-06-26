import React, { useEffect, useState } from "react";
import ClientesFun from "./ClientesFun";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import swal from "sweetalert2";
import Utilidades from "../../services/Utilidades";
import UsuariosFun from "../usuarios/UsuariosFun";
import '../estilos/CrearClientes.css';

export function CrearClientes({ mostrarSeccion }) {
    const [pais, setPais] = useState([]);
    const [provincia, setProvincia] = useState([]);
    const [ciudad, setCiudad] = useState([]);
    const [selectedProvincia, setSelectedProvincia] = useState(null);
    const [selectedCiudad, setSelectedCiudad] = useState(null);
    const navigate = useNavigate();
    const [formulario, setFormulario] = useState({
        cedr_cli: '', tipo_cedr_cli: '', nacion_cli: '',
        nom_cli: '', ape_cli: '', fecha_naci_cli: '', lugar_naci_cli: '', tel_pers: '',
        cel_pers: '', email_pers: '', edad_pers: '', sexo_cli: '', estado_civil_pers: '',
        estatura_cli: '', peso_cli: '', parroq_cli: '', calle_princ_pers: '',
        calle_secun_pers: '', id_ciud: ''
    });
    const [errores, setErrores] = useState({});
    
    useEffect(() => {
        const cargarPais = async () => {
            const apiPais = await ClientesFun.traerPaises(navigate);
            setPais(apiPais.rows)
        }
        cargarPais();
    }, [navigate]);

    // Funciones de validación
    const validarSoloLetras = (valor) => {
        return /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/.test(valor);
    };

    const validarSoloNumeros = (valor) => {
        return /^\d*$/.test(valor);
    };

    const validarEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validarCedula = (valor) => {
        return /^\d{10}$/.test(valor);
    };

    const validarPasaporte = (valor) => {
        // 3 letras seguidas de 5 números (exactamente 8 caracteres)
        return /^[A-Z]{3}\d{5}$/.test(valor.toUpperCase());
    };

    const validarIdentificacion = (valor, tipo) => {
        if (tipo === 'cedula') {
            return validarSoloNumeros(valor) && valor.length <= 10;
        } else if (tipo === 'pasaporte') {
            // Permitir letras y números, máximo 8 caracteres
            return /^[A-Za-z0-9]*$/.test(valor) && valor.length <= 8;
        }
        return true;
    };

    const cargarProvincia = async (val) => {
        setSelectedProvincia(null);
        setSelectedCiudad(null);
        setProvincia([]);
        setCiudad([]);
        const apiProvincia = await ClientesFun.traerProvincias(val.value, navigate);
        setProvincia(apiProvincia);
    }

    const cargarCiudad = async (val) => {
        setSelectedCiudad(null);
        setCiudad([]);
        const apiCiudad = await ClientesFun.traerCiudades(val.value, navigate);
        setCiudad(apiCiudad);
    }

    const agregarClaveFormulario = (e) => {
        const { name, value } = e.target;
        let valorValido = value;
        let nuevosErrores = { ...errores };

        // Validaciones específicas por campo
        if (name === 'nom_cli') {
            if (!validarSoloLetras(value)) {
                nuevosErrores.nom_cli = 'Los nombres solo deben contener letras';
                return;
            } else {
                delete nuevosErrores.nom_cli;
            }
        }

        if (name === 'ape_cli') {
            if (!validarSoloLetras(value)) {
                nuevosErrores.ape_cli = 'Los apellidos solo deben contener letras';
                return;
            } else {
                delete nuevosErrores.ape_cli;
            }
        }

        if (name === 'nacion_cli') {
            if (!validarSoloLetras(value)) {
                nuevosErrores.nacion_cli = 'La nacionalidad solo debe contener letras';
                return;
            } else {
                delete nuevosErrores.nacion_cli;
            }
        }

        if (name === 'lugar_naci_cli') {
            if (!validarSoloLetras(value)) {
                nuevosErrores.lugar_naci_cli = 'El lugar de nacimiento solo debe contener letras';
                return;
            } else {
                delete nuevosErrores.lugar_naci_cli;
            }
        }

        if (name === 'parroq_cli') {
            if (!validarSoloLetras(value)) {
                nuevosErrores.parroq_cli = 'La parroquia solo debe contener letras';
                return;
            } else {
                delete nuevosErrores.parroq_cli;
            }
        }

        if (name === 'edad_pers') {
            if (!validarSoloNumeros(value)) {
                nuevosErrores.edad_pers = 'La edad solo debe contener números';
                return;
            } else if (value && (parseInt(value) < 0 || parseInt(value) > 120)) {
                nuevosErrores.edad_pers = 'Ingrese una edad válida (0-120)';
            } else {
                delete nuevosErrores.edad_pers;
            }
        }

        if (name === 'estatura_cli') {
            if (!validarSoloNumeros(value)) {
                nuevosErrores.estatura_cli = 'La estatura solo debe contener números';
                return;
            } else if (value && (parseInt(value) < 50 || parseInt(value) > 250)) {
                nuevosErrores.estatura_cli = 'Ingrese una estatura válida (50-250 cm)';
            } else {
                delete nuevosErrores.estatura_cli;
            }
        }

        if (name === 'tel_pers') {
            if (!validarSoloNumeros(value)) {
                nuevosErrores.tel_pers = 'El teléfono fijo solo debe contener números';
                return;
            } else {
                delete nuevosErrores.tel_pers;
            }
        }

        if (name === 'cel_pers') {
            if (!validarSoloNumeros(value)) {
                nuevosErrores.cel_pers = 'El celular solo debe contener números';
                return;
            } else {
                delete nuevosErrores.cel_pers;
            }
        }

        if (name === 'email_pers') {
            if (value && !validarEmail(value)) {
                nuevosErrores.email_pers = 'Ingrese un formato de correo válido';
            } else {
                delete nuevosErrores.email_pers;
            }
        }

        if (name === 'cedr_cli') {
            if (!validarIdentificacion(value, formulario.tipo_cedr_cli)) {
                if (formulario.tipo_cedr_cli === 'cedula') {
                    nuevosErrores.cedr_cli = 'La cédula solo debe contener números (máximo 10)';
                } else if (formulario.tipo_cedr_cli === 'pasaporte') {
                    nuevosErrores.cedr_cli = 'El pasaporte debe tener máximo 8 caracteres (letras y números)';
                }
                return;
            } else {
                // Validaciones específicas según el tipo
                if (formulario.tipo_cedr_cli === 'cedula') {
                    if (value.length > 0 && value.length < 10) {
                        nuevosErrores.cedr_cli = 'La cédula debe tener exactamente 10 dígitos';
                    } else if (value.length === 10) {
                        delete nuevosErrores.cedr_cli;
                    } else {
                        delete nuevosErrores.cedr_cli;
                    }
                } else if (formulario.tipo_cedr_cli === 'pasaporte') {
                    if (value.length === 8 && !validarPasaporte(value)) {
                        nuevosErrores.cedr_cli = 'Formato de pasaporte: 3 letras seguidas de 5 números (ej: ABC12345)';
                    } else {
                        delete nuevosErrores.cedr_cli;
                    }
                }
            }
        }

        setErrores(nuevosErrores);
        setFormulario({ ...formulario, [name]: valorValido });
    }

    const chechkSexo = (event) => {
        const { id } = event.target;
        document.getElementById("masculino").checked = false;
        document.getElementById("femenino").checked = false;
        document.getElementById(id).checked = true;

        setFormulario({ ...formulario, sexo_cli: document.getElementById(id).name })
    };

    const chechkTipoIdentificacion = (event) => {
        const { id } = event.target;
        document.getElementById("cedula").checked = false;
        document.getElementById("pasaporte").checked = false;
        document.getElementById(id).checked = true;
        
        // Limpiar el campo de identificación y errores cuando cambie el tipo
        setFormulario({ 
            ...formulario, 
            tipo_cedr_cli: document.getElementById(id).id,
            cedr_cli: ''
        });
        
        // Limpiar errores relacionados con la identificación
        const nuevosErrores = { ...errores };
        delete nuevosErrores.cedr_cli;
        setErrores(nuevosErrores);
    };

    const chechkEstadoCivil = (event) => {
        const { id } = event.target;
        document.getElementById("soltero").checked = false;
        document.getElementById("divorciado").checked = false;
        document.getElementById("viudo").checked = false;
        document.getElementById("casado").checked = false;
        document.getElementById("unionLibre").checked = false;
        document.getElementById(id).checked = true;
        setFormulario({ ...formulario, estado_civil_pers: document.getElementById(id).id })
    };

    const chechkTipoPeso = (event) => {
        const peso = document.getElementById("peso_cli").value;
        if (peso === '') {
            toast.error("Ingrese el peso ");
            document.getElementById("lb").checked = false;
            document.getElementById("kg").checked = false;
        } else {
            const { id } = event.target;
            document.getElementById("lb").checked = false;
            document.getElementById("kg").checked = false;
            document.getElementById(id).checked = true;
            const medida = " " + document.getElementById(id).id;
            setFormulario({ ...formulario, peso_cli: (peso + medida) })
        }
    };

    const textPeso = (e) => {
        const { value } = e.target;
        let nuevosErrores = { ...errores };

        // Validar que solo sean números
        if (!validarSoloNumeros(value)) {
            nuevosErrores.peso_cli = 'El peso solo debe contener números';
            setErrores(nuevosErrores);
            return;
        } else {
            delete nuevosErrores.peso_cli;
            setErrores(nuevosErrores);
        }

        if (value === '') {
            document.getElementById("lb").checked = false;
            document.getElementById("kg").checked = false;
            setFormulario({ ...formulario, peso_cli: '' })
        }
    }

    const guardarCliente = async () => {
        // Verificar que no haya errores de validación
        if (Object.keys(errores).length > 0) {
            toast.error('Por favor corrija los errores en el formulario');
            return;
        }

        // Validaciones finales antes de enviar
        if (formulario.tipo_cedr_cli === 'cedula' && !validarCedula(formulario.cedr_cli)) {
            toast.error('La cédula debe tener exactamente 10 dígitos');
            return;
        }

        if (formulario.tipo_cedr_cli === 'pasaporte' && formulario.cedr_cli.length === 8 && !validarPasaporte(formulario.cedr_cli)) {
            toast.error('Formato de pasaporte inválido. Use: 3 letras seguidas de 5 números');
            return;
        }

        if (formulario.email_pers && !validarEmail(formulario.email_pers)) {
            toast.error('Por favor ingrese un correo electrónico válido');
            return;
        }

        if (Object.values(formulario).every(valor => valor !== '')) {
            let resVerif = null;
            try {
                resVerif = await UsuariosFun.verificarDatosUsuario({ 
                    users: formulario.email_pers, 
                    cedula: formulario.cedr_cli 
                }, navigate);
                
                if (!resVerif.existe) {
                    const pass = await Utilidades.crearPassAleatoria()
                    const res = await ClientesFun.guardarCliente(formulario, navigate);
                    const resCuent = await ClientesFun.crearCuenta({ 
                        idpersona: res.id_pers, 
                        user: formulario.email_pers, 
                        pass: pass 
                    }, navigate)
                    
                    if (resCuent) {
                        const urlRandom = await Utilidades.crearRutaAleatoria()
                        await ClientesFun.generarTokenValidacion(({ 
                            id_pers: res.id_pers, 
                            url: urlRandom, 
                            pass: pass 
                        }), navigate);
                        await ClientesFun.enviarCorreoEmail(({ 
                            to: formulario.email_pers, 
                            token: urlRandom, 
                            pass: pass 
                        }), navigate)
                        
                        swal.fire({
                            title: "<label>Éxito</label>",
                            text: "El usuario ha sido creado con éxito",
                            timer: 3500,
                        })
                        mostrarSeccion("clientes")
                    }
                } else {
                    toast.error(resVerif.message);
                }
            } catch (error) {
                toast.error(resVerif.message);
            }
        } else {
            toast.error("Faltan campos por llenar ⚠️");
        }
    }

    const limpiarFormulario = () => {
        setFormulario({
            cedr_cli: '', tipo_cedr_cli: '', nacion_cli: '',
            nom_cli: '', ape_cli: '', fecha_naci_cli: '', lugar_naci_cli: '', tel_pers: '',
            cel_pers: '', email_pers: '', edad_pers: '', sexo_cli: '', estado_civil_pers: '',
            estatura_cli: '', peso_cli: '', parroq_cli: '', calle_princ_pers: '',
            calle_secun_pers: '', id_ciud: ''
        });
        setErrores({});
        
        // Limpiar checkboxes
        const checkboxes = ['masculino', 'femenino', 'cedula', 'pasaporte', 'soltero', 'casado', 'divorciado', 'viudo', 'unionLibre', 'lb', 'kg'];
        checkboxes.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.checked = false;
        });
        
        setSelectedProvincia(null);
        setSelectedCiudad(null);
        setProvincia([]);
        setCiudad([]);
    };

    const cancelar = () => {
        const algunCampoLleno = Object.values(formulario).some(valor => valor.trim() !== '');
        if (algunCampoLleno) {
            swal.fire({
                title: "⚠️ <label>Advertencia</label>",
                text: "Desea descartar los datos ingresados",
                showDenyButton: true,
                denyButtonText: "No",
                confirmButtonText: "Sí"
            }).then(respuesta => {
                if (respuesta.isConfirmed) { 
                    limpiarFormulario();
                    mostrarSeccion("clientes");
                }
            });
        } else {
            mostrarSeccion("clientes");
        }
    };

    return (
        <div className="crear-clientes-container">
            <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
            
            <div className="crear-clientes-form">
                <h2 className="crear-clientes-title">Registro de Nuevo Cliente</h2>
                
                <div className="form-section personal-info-section">
                    <h3 className="form-section-title">Información Personal</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="nom_cli">Nombres</label>
                            <input 
                                className={`form-input ${errores.nom_cli ? 'input-error' : ''}`}
                                type="text" 
                                name="nom_cli" 
                                id="nom_cli" 
                                value={formulario.nom_cli}
                                placeholder="Ingrese los nombres (solo letras)" 
                                onChange={agregarClaveFormulario} 
                            />
                            {errores.nom_cli && <span className="error-message">{errores.nom_cli}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="ape_cli">Apellidos</label>
                            <input 
                                className={`form-input ${errores.ape_cli ? 'input-error' : ''}`}
                                type="text" 
                                name="ape_cli" 
                                id="ape_cli" 
                                value={formulario.ape_cli}
                                placeholder="Ingrese los apellidos (solo letras)" 
                                onChange={agregarClaveFormulario} 
                            />
                            {errores.ape_cli && <span className="error-message">{errores.ape_cli}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="nacion_cli">Nacionalidad</label>
                            <input 
                                className={`form-input ${errores.nacion_cli ? 'input-error' : ''}`}
                                type="text" 
                                name="nacion_cli" 
                                id="nacion_cli" 
                                value={formulario.nacion_cli}
                                placeholder="Ingrese la nacionalidad (solo letras)" 
                                onChange={agregarClaveFormulario} 
                            />
                            {errores.nacion_cli && <span className="error-message">{errores.nacion_cli}</span>}
                        </div>
                    </div>
                    
                    <div className="id-type-group">
                        <div className="form-group">
                            <label className="form-label" htmlFor="idType">Tipo de identificación</label>
                            <div className="checkbox-group">
                                <div className="checkbox-item">
                                    <input 
                                        className="checkbox-input"
                                        type="checkbox" 
                                        id="cedula" 
                                        name="cedula" 
                                        onChange={chechkTipoIdentificacion}
                                    />
                                    <label className="checkbox-label" htmlFor="cedula">Cédula</label>
                                </div>
                                <div className="checkbox-item">
                                    <input 
                                        className="checkbox-input"
                                        type="checkbox" 
                                        id="pasaporte" 
                                        name="pasaporte" 
                                        onChange={chechkTipoIdentificacion} 
                                    />
                                    <label className="checkbox-label" htmlFor="pasaporte">Pasaporte</label>
                                </div>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="cedr_cli">Número de Identificación</label>
                            <input 
                                className={`form-input ${errores.cedr_cli ? 'input-error' : ''}`}
                                type="text" 
                                name="cedr_cli" 
                                id="cedr_cli" 
                                value={formulario.cedr_cli}
                                maxLength={formulario.tipo_cedr_cli === 'cedula' ? 10 : 8}
                                placeholder={
                                    formulario.tipo_cedr_cli === 'cedula' 
                                        ? "Ingrese 10 dígitos" 
                                        : formulario.tipo_cedr_cli === 'pasaporte'
                                        ? "Ej: ABC12345 (3 letras + 5 números)"
                                        : "Seleccione tipo de identificación"
                                }
                                onChange={agregarClaveFormulario} 
                                disabled={!formulario.tipo_cedr_cli}
                            />
                            {errores.cedr_cli && <span className="error-message">{errores.cedr_cli}</span>}
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="fecha_naci_cli">Fecha de Nacimiento</label>
                            <input 
                                className="form-input" 
                                type="date" 
                                name="fecha_naci_cli" 
                                id="fecha_naci_cli" 
                                value={formulario.fecha_naci_cli}
                                onChange={agregarClaveFormulario} 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label" htmlFor="lugar_naci_cli">Lugar de Nacimiento</label>
                            <input 
                                className={`form-input ${errores.lugar_naci_cli ? 'input-error' : ''}`}
                                type="text" 
                                name="lugar_naci_cli" 
                                id="lugar_naci_cli" 
                                value={formulario.lugar_naci_cli}
                                placeholder="Ingrese lugar de nacimiento (solo letras)" 
                                onChange={agregarClaveFormulario} 
                            />
                            {errores.lugar_naci_cli && <span className="error-message">{errores.lugar_naci_cli}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="edad_pers">Edad</label>
                            <input 
                                className={`form-input ${errores.edad_pers ? 'input-error' : ''}`}
                                type="text" 
                                name="edad_pers" 
                                id="edad_pers" 
                                value={formulario.edad_pers}
                                placeholder="Ingrese la edad (solo números)" 
                                onChange={agregarClaveFormulario} 
                            />
                            {errores.edad_pers && <span className="error-message">{errores.edad_pers}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Sexo</label>
                            <div className="checkbox-group">
                                <div className="checkbox-item">
                                    <input 
                                        className="checkbox-input"
                                        type="checkbox" 
                                        id="masculino" 
                                        name="masculino" 
                                        onChange={chechkSexo} 
                                    />
                                    <label className="checkbox-label" htmlFor="masculino">Masculino</label>
                                </div>
                                <div className="checkbox-item">
                                    <input 
                                        className="checkbox-input"
                                        type="checkbox" 
                                        id="femenino" 
                                        name="femenino" 
                                        onChange={chechkSexo} 
                                    />
                                    <label className="checkbox-label" htmlFor="femenino">Femenino</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Estado Civil</label>
                            <div className="checkbox-group">
                                <div className="checkbox-item">
                                    <input className="checkbox-input" type="checkbox" id="soltero" onChange={chechkEstadoCivil} />
                                    <label className="checkbox-label" htmlFor="soltero">Soltero</label>
                                </div>
                                <div className="checkbox-item">
                                    <input className="checkbox-input" type="checkbox" id="casado" onChange={chechkEstadoCivil} />
                                    <label className="checkbox-label" htmlFor="casado">Casado</label>
                                </div>
                                <div className="checkbox-item">
                                    <input className="checkbox-input" type="checkbox" id="divorciado" onChange={chechkEstadoCivil} />
                                    <label className="checkbox-label" htmlFor="divorciado">Divorciado</label>
                                </div>
                                <div className="checkbox-item">
                                    <input className="checkbox-input" type="checkbox" id="viudo" onChange={chechkEstadoCivil} />
                                    <label className="checkbox-label" htmlFor="viudo">Viudo</label>
                                </div>
                                <div className="checkbox-item">
                                    <input className="checkbox-input" type="checkbox" id="unionLibre" onChange={chechkEstadoCivil} />
                                    <label className="checkbox-label" htmlFor="unionLibre">Unión Libre</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="estatura_cli">Estatura (cm)</label>
                            <input 
                                className={`form-input ${errores.estatura_cli ? 'input-error' : ''}`}
                                type="text" 
                                name="estatura_cli" 
                                id="estatura_cli" 
                                value={formulario.estatura_cli}
                                placeholder="Ingrese la altura en cm (solo números)" 
                                onChange={agregarClaveFormulario} 
                            />
                            {errores.estatura_cli && <span className="error-message">{errores.estatura_cli}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label" htmlFor="peso_cli">Peso</label>
                            <div className="form-row">
                                <input 
                                    className={`form-input ${errores.peso_cli ? 'input-error' : ''}`}
                                    type="text" 
                                    name="peso_cli" 
                                    id="peso_cli" 
                                    placeholder="Ingrese el peso (solo números)" 
                                    onChange={textPeso} 
                                    style={{flex: 2}}
                                />
                                <div className="checkbox-group" style={{flex: 1, marginLeft: '10px'}}>
                                    <div className="checkbox-item">
                                        <input className="checkbox-input" type="checkbox" id="lb" onChange={chechkTipoPeso} />
                                        <label className="checkbox-label" htmlFor="lb">Lb</label>
                                    </div>
                                    <div className="checkbox-item">
                                        <input className="checkbox-input" type="checkbox" id="kg" onChange={chechkTipoPeso} />
                                        <label className="checkbox-label" htmlFor="kg">kg</label>
                                    </div>
                                </div>
                            </div>
                            {errores.peso_cli && <span className="error-message">{errores.peso_cli}</span>}
                        </div>
                    </div>
                </div>
                
                <div className="form-section contact-info-section">
                    <h3 className="form-section-title">Información de Contacto</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="tel_pers">Teléfono fijo</label>
                            <input 
                                className={`form-input ${errores.tel_pers ? 'input-error' : ''}`}
                                type="text" 
                                name="tel_pers" 
                                id="tel_pers" 
                                value={formulario.tel_pers}
                                placeholder="Ingrese teléfono fijo (solo números)" 
                                onChange={agregarClaveFormulario} 
                            />
                            {errores.tel_pers && <span className="error-message">{errores.tel_pers}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label" htmlFor="cel_pers">Teléfono celular</label>
                            <input 
                                className={`form-input ${errores.cel_pers ? 'input-error' : ''}`}
                                type="text" 
                                name="cel_pers" 
                                id="cel_pers" 
                                value={formulario.cel_pers}
                                placeholder="Ingrese número de celular (solo números)" 
                                onChange={agregarClaveFormulario} 
                            />
                            {errores.cel_pers && <span className="error-message">{errores.cel_pers}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label" htmlFor="email_pers">Correo electrónico</label>
                            <input 
                                className={`form-input ${errores.email_pers ? 'input-error' : ''}`}
                                type="email" 
                                name="email_pers" 
                                id="email_pers" 
                                value={formulario.email_pers}
                                placeholder="Ingrese correo electrónico" 
                                onChange={agregarClaveFormulario} 
                            />
                            {errores.email_pers && <span className="error-message">{errores.email_pers}</span>}
                        </div>
                    </div>
                </div>
                
                <div className="form-section location-info-section">
                    <h3 className="form-section-title">Dirección</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">País</label>
                            <Select
                                className="react-select"
                                classNamePrefix="react-select"
                                options={Array.isArray(pais) ? pais.map((r) => ({
                                    value: r.id_pais,
                                    label: r.nom_pais,
                                })) : []}
                                placeholder="Seleccione el país"
                                onChange={(e) => {
                                    cargarProvincia(e);
                                    setFormulario({ ...formulario, id_ciud: '' });
                                }}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Provincia</label>
                            <Select
                                className="react-select"
                                classNamePrefix="react-select"
                                options={Array.isArray(provincia) ? provincia.map((r) => ({
                                    value: r.id_provin,
                                    label: r.nom_provin,
                                })) : []}
                                placeholder="Seleccione la provincia"
                                onChange={(e) => {
                                    setSelectedProvincia(e);
                                    cargarCiudad(e);
                                    setFormulario({ ...formulario, id_ciud: '' });
                                }}
                                value={selectedProvincia}
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label">Ciudad</label>
                            <Select
                                className="react-select"
                                classNamePrefix="react-select"
                                options={Array.isArray(ciudad) ? ciudad.map((r) => ({
                                    value: r.id_ciud,
                                    label: r.nom_ciud,
                                })) : []}
                                placeholder="Seleccione la ciudad"
                                onChange={(e) => {
                                    setSelectedCiudad(e);
                                    setFormulario({ ...formulario, id_ciud: e.value });
                                }}
                                value={selectedCiudad}
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="parroq_cli">Parroquia</label>
                            <input 
                                className={`form-input ${errores.parroq_cli ? 'input-error' : ''}`}
                                type="text" 
                                name="parroq_cli" 
                                id="parroq_cli" 
                                value={formulario.parroq_cli}
                                placeholder="Ingrese la parroquia (solo letras)" 
                                onChange={agregarClaveFormulario} 
                            />
                            {errores.parroq_cli && <span className="error-message">{errores.parroq_cli}</span>}
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label" htmlFor="calle_princ_pers">Calle Principal</label>
                            <input 
                                className="form-input" 
                                type="text" 
                                name="calle_princ_pers" 
                                id="calle_princ_pers" 
                                value={formulario.calle_princ_pers}
                                placeholder="Ingrese la calle principal" 
                                onChange={agregarClaveFormulario} 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label" htmlFor="calle_secun_pers">Calle Secundaria</label>
                            <input 
                                className="form-input" 
                                type="text" 
                                name="calle_secun_pers" 
                                id="calle_secun_pers" 
                                value={formulario.calle_secun_pers}
                                placeholder="Ingrese la calle secundaria" 
                                onChange={agregarClaveFormulario} 
                            />
                        </div>
                    </div>
                </div>
                
                <div className="actions-container">
                    <button className="btn-cancelar" onClick={cancelar}>Cancelar</button>
                    <button className="btn-guardar" onClick={guardarCliente}>Guardar Cliente</button>
                </div>
            </div>
        </div>
    );
}

export default CrearClientes;