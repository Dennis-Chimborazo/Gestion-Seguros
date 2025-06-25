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
        estatura_cli: '', peso_cli: '', parroq_cli: '', calle_princ_pers: '',        calle_secun_pers: '', id_ciud: ''
    })
    
    useEffect(() => {
        const cargarPais = async () => {
            const apiPais = await ClientesFun.traerPaises(navigate);
            setPais(apiPais.rows)
        }
        cargarPais();
    }, [navigate]);

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
        setFormulario({ ...formulario, [e.target.name]: e.target.value })
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
        console.log(document.getElementById(id).id)
        setFormulario({ ...formulario, tipo_cedr_cli: document.getElementById(id).id })
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
    };    const chechkTipoPeso = (event) => {
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
        let peso = e.target.value;
        if (peso === '') {
            document.getElementById("lb").checked = false;
            document.getElementById("kg").checked = false;
            setFormulario({ ...formulario, peso_cli: '' })
        }
    }

    const guardarCliente = async () => {
        if (Object.values(formulario).every(valor => valor !== '')) {
            let resVerif = null;
            try {
                resVerif = await UsuariosFun.verificarDatosUsuario({ users: formulario.email_pers, cedula: formulario.cedr_cli }, navigate);
                if (!resVerif.existe) {
                    const pass = await Utilidades.crearPassAleatoria()
                    const res = await ClientesFun.guardarCliente(formulario, navigate);
                    const resCuent = await ClientesFun.crearCuenta({ idpersona: res.id_pers, user: formulario.email_pers, pass: pass }, navigate)
                    if (resCuent) {
                        const urlRandom = await Utilidades.crearRutaAleatoria()
                        await ClientesFun.generarTokenValidacion(({ id_pers: res.id_pers, url: urlRandom, pass: pass }), navigate);
                        await ClientesFun.enviarCorreoEmail(({ to: formulario.email_pers, token: urlRandom, pass: pass }), navigate)
                        swal.fire({
                            title: "<label>Exito</label>",
                            text: "E; usuario ha sido creado con éxito",
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
                if (respuesta.isConfirmed) { mostrarSeccion("clientes")}
            });
        } else {mostrarSeccion("clientes")}
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
                                className="form-input" 
                                type="text" 
                                name="nom_cli" 
                                id="nom_cli" 
                                placeholder="Ingrese los nombres" 
                                onChange={agregarClaveFormulario} 
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="ape_cli">Apellidos</label>
                            <input 
                                className="form-input" 
                                type="text" 
                                name="ape_cli" 
                                id="ape_cli" 
                                placeholder="Ingrese los apellidos" 
                                onChange={agregarClaveFormulario} 
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="nacion_cli">Nacionalidad</label>
                            <input 
                                className="form-input" 
                                type="text" 
                                name="nacion_cli" 
                                id="nacion_cli" 
                                placeholder="Ingrese la nacionalidad" 
                                onChange={agregarClaveFormulario} 
                            />
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
                                className="form-input" 
                                type="text" 
                                name="cedr_cli" 
                                id="cedr_cli" 
                                placeholder="Ingrese número de identificación" 
                                onChange={agregarClaveFormulario} 
                            />
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
                                onChange={agregarClaveFormulario} 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label" htmlFor="lugar_naci_cli">Lugar de Nacimiento</label>
                            <input 
                                className="form-input" 
                                type="text" 
                                name="lugar_naci_cli" 
                                id="lugar_naci_cli" 
                                placeholder="Ingrese lugar de nacimiento" 
                                onChange={agregarClaveFormulario} 
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="edad_pers">Edad</label>
                            <input 
                                className="form-input" 
                                type="text" 
                                name="edad_pers" 
                                id="edad_pers" 
                                placeholder="Ingrese la edad" 
                                onChange={agregarClaveFormulario} 
                            />
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
                                className="form-input" 
                                type="text" 
                                name="estatura_cli" 
                                id="estatura_cli" 
                                placeholder="Ingrese la altura en cm" 
                                onChange={agregarClaveFormulario} 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label" htmlFor="peso_cli">Peso</label>
                            <div className="form-row">
                                <input 
                                    className="form-input" 
                                    type="text" 
                                    name="peso_cli" 
                                    id="peso_cli" 
                                    placeholder="Ingrese el peso" 
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
                        </div>
                    </div>
                </div>
                
                <div className="form-section contact-info-section">
                    <h3 className="form-section-title">Información de Contacto</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="tel_pers">Teléfono fijo</label>
                            <input 
                                className="form-input" 
                                type="text" 
                                name="tel_pers" 
                                id="tel_pers" 
                                placeholder="Ingrese teléfono convencional/fijo" 
                                onChange={agregarClaveFormulario} 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label" htmlFor="cel_pers">Teléfono celular</label>
                            <input 
                                className="form-input" 
                                type="text" 
                                name="cel_pers" 
                                id="cel_pers" 
                                placeholder="Ingrese número de celular" 
                                onChange={agregarClaveFormulario} 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label" htmlFor="email_pers">Correo electrónico</label>
                            <input 
                                className="form-input" 
                                type="email" 
                                name="email_pers" 
                                id="email_pers" 
                                placeholder="Ingrese correo electrónico" 
                                onChange={agregarClaveFormulario} 
                            />
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
                                className="form-input" 
                                type="text" 
                                name="parroq_cli" 
                                id="parroq_cli" 
                                placeholder="Ingrese la parroquia" 
                                onChange={agregarClaveFormulario} 
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="form-label" htmlFor="calle_princ_pers">Calle Principal</label>
                            <input 
                                className="form-input" 
                                type="text" 
                                name="calle_princ_pers" 
                                id="calle_princ_pers" 
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