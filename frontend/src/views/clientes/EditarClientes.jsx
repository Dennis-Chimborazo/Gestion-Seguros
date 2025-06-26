import React, { useEffect, useState } from "react";
import '../estilos/EditarClientes.css'; // Importa los estilos personalizados
import ClientesFun from "./ClientesFun";
import Select from "react-select";
import { useNavigate, useLocation } from "react-router-dom";
import { Toaster, toast } from "sonner";
import swal from "sweetalert2";

export function EditarClientes({ mostrarSeccion }) {

    const [pais, setPais] = useState([]);
    const [provincia, setProvincia] = useState([]);
    const [ciudad, setCiudad] = useState([]);
    const [selectedPais, setSelectedPais] = useState(null);
    const [selectedProvincia, setSelectedProvincia] = useState(null);
    const [selectedCiudad, setSelectedCiudad] = useState(null);
    const navigate = useNavigate();
    const [cedr_cli, setCedr_cli] = useState('');
    const [nom_cli, setNom_cli] = useState('');
    const [ape_cli, setApe_cli] = useState('');
    const [nacion_cli, setNacion_cli] = useState('');
    const [fecha_naci_cli, setFecha_naci_cli] = useState('');
    const [lugar_naci_cli, setLugar_naci_cli] = useState('');
    const [tel_pers, setTel_pers] = useState('');
    const [cel_pers, setCel_pers] = useState('');
    const [email_pers, setEmail_pers] = useState('');
    const [edad_pers, setEdad_pers] = useState('');
    const [estatura_cli, setEstatura_cli] = useState('');
    const [peso_cli, setPeso_cli] = useState('');
    const [parroq_cli, setParroq_cli] = useState('');
    const [calle_princ_pers, setCalle_princ_pers] = useState('');
    const [calle_secun_pers, setCalle_secun_pers] = useState('');
    const [errores, setErrores] = useState({});

    const [formulario, setFormulario] = useState({
        id_pers: '', cedr_cli: '', tipo_cedr_cli: '', nacion_cli: '',
        nom_cli: '', ape_cli: '', fecha_naci_cli: '', lugar_naci_cli: '', tel_pers: '',
        cel_pers: '', email_pers: '', edad_pers: '', sexo_cli: '', estado_civil_pers: '',
        estatura_cli: '', peso_cli: '', parroq_cli: '', calle_princ_pers: '',
        calle_secun_pers: '', id_ciud: ''
    });

    const [formularioEdit, setFormularioEdit] = useState({});

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

    useEffect(() => {
        const cargarPais = async () => {
            const editData = JSON.parse(localStorage.getItem("edit"));
            const tipoPeso = editData.cliente.peso_cli.split(' ');
            setFormulario({
                ...formulario,
                id_pers: editData.cliente.id_pers,
                cedr_cli: editData.cliente.cedr_cli,
                tipo_cedr_cli: editData.cliente.tipo_cedr_cli,
                nom_cli: editData.cliente.nom_cli,
                ape_cli: editData.cliente.ape_cli,
                nacion_cli: editData.cliente.nacion_cli,
                fecha_naci_cli: editData.cliente.fecha_naci_cli,
                lugar_naci_cli: editData.cliente.lugar_naci_cli,
                tel_pers: editData.cliente.tel_pers,
                cel_pers: editData.cliente.cel_pers,
                email_pers: editData.cliente.email_pers,
                edad_pers: editData.cliente.edad_pers,
                estatura_cli: editData.cliente.estatura_cli,
                peso_cli: editData.cliente.peso_cli,
                parroq_cli: editData.cliente.parroq_cli,
                calle_princ_pers: editData.cliente.calle_princ_pers,
                calle_secun_pers: editData.cliente.calle_secun_pers,
                sexo_cli: editData.cliente.sexo_cli,
                estado_civil_pers: editData.cliente.estado_civil_pers,
                id_ciud: editData.cliente.id_ciud
            });

            setCedr_cli(editData.cliente.cedr_cli);
            setNom_cli(editData.cliente.nom_cli);
            setApe_cli(editData.cliente.ape_cli);
            setNacion_cli(editData.cliente.nacion_cli);
            setFecha_naci_cli(editData.cliente.fecha_naci_cli);
            setLugar_naci_cli(editData.cliente.lugar_naci_cli);
            setTel_pers(editData.cliente.tel_pers);
            setCel_pers(editData.cliente.cel_pers);
            setEmail_pers(editData.cliente.email_pers);
            setEdad_pers(editData.cliente.edad_pers);
            setEstatura_cli(editData.cliente.estatura_cli);
            setPeso_cli(tipoPeso[0]);
            setParroq_cli(editData.cliente.parroq_cli);
            setCalle_princ_pers(editData.cliente.calle_princ_pers);
            setCalle_secun_pers(editData.cliente.calle_secun_pers);

            activarChecks(editData.cliente.tipo_cedr_cli);
            activarChecks(editData.cliente.sexo_cli);
            activarChecks(editData.cliente.estado_civil_pers);
            activarChecks(tipoPeso[1]);

            const direccion = await ClientesFun.buscarDireccionCliente(editData.cliente.id_ciud, navigate)

            setSelectedPais({ value: direccion[0].id_pais, label: direccion[0].nom_pais });
            setSelectedProvincia({ value: direccion[0].id_provin, label: direccion[0].nom_provin });
            setSelectedCiudad({ value: direccion[0].id_ciud, label: direccion[0].nom_ciud });

            const apiProvincia = await ClientesFun.traerProvincias(direccion[0].id_pais, navigate);
            const apiCiudad = await ClientesFun.traerCiudades(direccion[0].id_provin, navigate);
            const apiPais = await ClientesFun.traerPaises(navigate);
            setPais(apiPais.rows)
            setProvincia(apiProvincia);
            setCiudad(apiCiudad);

            setFormularioEdit({
                ...formularioEdit,
                id_pers: editData.cliente.id_pers,
                cedr_cli: editData.cliente.cedr_cli,
                tipo_cedr_cli: editData.cliente.tipo_cedr_cli,
                nom_cli: editData.cliente.nom_cli,
                ape_cli: editData.cliente.ape_cli,
                nacion_cli: editData.cliente.nacion_cli,
                fecha_naci_cli: editData.cliente.fecha_naci_cli,
                lugar_naci_cli: editData.cliente.lugar_naci_cli,
                tel_pers: editData.cliente.tel_pers,
                cel_pers: editData.cliente.cel_pers,
                email_pers: editData.cliente.email_pers,
                edad_pers: editData.cliente.edad_pers,
                estatura_cli: editData.cliente.estatura_cli,
                peso_cli: tipoPeso[0] + ' ' + tipoPeso[1],
                parroq_cli: editData.cliente.parroq_cli,
                calle_princ_pers: editData.cliente.calle_princ_pers,
                calle_secun_pers: editData.cliente.calle_secun_pers,
                sexo_cli: editData.cliente.sexo_cli,
                peso_cli: editData.cliente.peso_cli,
                estado_civil_pers: editData.cliente.estado_civil_pers,
                id_ciud: editData.cliente.id_ciud,
            });
        }
        cargarPais();
    }, []);

    const activarChecks = (value) => {
        const cedula = document.getElementById("cedula");
        const pasaporte = document.getElementById("pasaporte");
        const femenino = document.getElementById("femenino");
        const masculino = document.getElementById("masculino");
        const soltero = document.getElementById("soltero/a");
        const casado = document.getElementById("casado/a");
        const divorciado = document.getElementById("divorciado/a");
        const viudo = document.getElementById("viudo/a");
        const kg = document.getElementById("kg");
        const lb = document.getElementById("lb");

        switch (value) {
            case "cedula":
                if (cedula) {
                    cedula.checked = true;
                }
                setFormulario({ ...formulario, tipo_cedr_cli: value })
                break;
            case "pasaporte":
                if (pasaporte) {
                    pasaporte.checked = true;
                }
                setFormulario({ ...formulario, tipo_cedr_cli: value })
                break;
            case "femenino":
                if (femenino) {
                    femenino.checked = true;
                }
                setFormulario({ ...formulario, sexo_cli: value })
                break;
            case "masculino":
                if (masculino) {
                    masculino.checked = true;
                }
                setFormulario({ ...formulario, sexo_cli: value })
                break;
            case "kg":
                if (kg) {
                    kg.checked = true;
                }
                break;
            case "lb":
                if (lb) {
                    lb.checked = true;
                }
                break;
            case "soltero/a":
                if (soltero) {
                    soltero.checked = true;
                }
                setFormulario({ ...formulario, estado_civil_pers: value })
                break;
            case "casado/a":
                if (casado) {
                    casado.checked = true;
                }
                setFormulario({ ...formulario, estado_civil_pers: value })
                break;
            case "divorciado/a":
                if (divorciado) {
                    divorciado.checked = true;
                }
                setFormulario({ ...formulario, estado_civil_pers: value })
                break;
            case "viudo/a":
                if (viudo) {
                    viudo.checked = true;
                }
                setFormulario({ ...formulario, estado_civil_pers: value })
                break;
        }
    };

    const agregarClaveFormulario = (e) => {
        const { name, value } = e.target;
        let valorValido = value;
        let nuevosErrores = { ...errores };

        // Validaciones específicas por campo
        if (name === 'nom_cli') {
            if (!validarSoloLetras(value)) {
                nuevosErrores.nom_cli = 'Los nombres solo deben contener letras';
                setErrores(nuevosErrores);
                return;
            } else {
                delete nuevosErrores.nom_cli;
            }
        }

        if (name === 'ape_cli') {
            if (!validarSoloLetras(value)) {
                nuevosErrores.ape_cli = 'Los apellidos solo deben contener letras';
                setErrores(nuevosErrores);
                return;
            } else {
                delete nuevosErrores.ape_cli;
            }
        }

        if (name === 'nacion_cli') {
            if (!validarSoloLetras(value)) {
                nuevosErrores.nacion_cli = 'La nacionalidad solo debe contener letras';
                setErrores(nuevosErrores);
                return;
            } else {
                delete nuevosErrores.nacion_cli;
            }
        }

        if (name === 'lugar_naci_cli') {
            if (!validarSoloLetras(value)) {
                nuevosErrores.lugar_naci_cli = 'El lugar de nacimiento solo debe contener letras';
                setErrores(nuevosErrores);
                return;
            } else {
                delete nuevosErrores.lugar_naci_cli;
            }
        }

        if (name === 'parroq_cli') {
            if (!validarSoloLetras(value)) {
                nuevosErrores.parroq_cli = 'La parroquia solo debe contener letras';
                setErrores(nuevosErrores);
                return;
            } else {
                delete nuevosErrores.parroq_cli;
            }
        }

        if (name === 'edad_pers') {
            if (!validarSoloNumeros(value)) {
                nuevosErrores.edad_pers = 'La edad solo debe contener números';
                setErrores(nuevosErrores);
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
                setErrores(nuevosErrores);
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
                setErrores(nuevosErrores);
                return;
            } else {
                delete nuevosErrores.tel_pers;
            }
        }

        if (name === 'cel_pers') {
            if (!validarSoloNumeros(value)) {
                nuevosErrores.cel_pers = 'El celular solo debe contener números';
                setErrores(nuevosErrores);
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
                setErrores(nuevosErrores);
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

        if (name === 'peso_cli') {
            if (!validarSoloNumeros(value)) {
                nuevosErrores.peso_cli = 'El peso solo debe contener números';
                setErrores(nuevosErrores);
                return;
            } else {
                delete nuevosErrores.peso_cli;
            }
        }

        setErrores(nuevosErrores);
        setFormulario({
            ...formulario,
            [name]: valorValido
        });
    };

    const chechkTipoIdentificacion = (e) => {
        if (e.target.checked) {
            const name = e.target.name;
            
            // Limpiar el campo de identificación y errores cuando cambie el tipo
            setCedr_cli('');
            setFormulario({
                ...formulario,
                tipo_cedr_cli: name,
                cedr_cli: ''
            });

            // Limpiar errores relacionados con la identificación
            const nuevosErrores = { ...errores };
            delete nuevosErrores.cedr_cli;
            setErrores(nuevosErrores);

            if (name === "cedula") {
                document.getElementById("cedula").setAttribute("checked", "");
                document.getElementById("pasaporte").removeAttribute("checked");
                document.getElementById("pasaporte").checked = false;
            } else if (name === "pasaporte") {
                document.getElementById("pasaporte").setAttribute("checked", "");
                document.getElementById("cedula").removeAttribute("checked");
                document.getElementById("cedula").checked = false;
            }
        }
    };

    const chechkSexo = (e) => {
        if (e.target.checked) {
            const name = e.target.name;
            setFormulario({
                ...formulario,
                sexo_cli: name
            })
            if (name === "masculino") {
                document.getElementById("masculino").setAttribute("checked", "");
                document.getElementById("femenino").removeAttribute("checked");
                document.getElementById("femenino").checked = false;
            } else if (name === "femenino") {
                document.getElementById("femenino").setAttribute("checked", "");
                document.getElementById("masculino").removeAttribute("checked");
                document.getElementById("masculino").checked = false;
            }
        }
    };

    const chechkEstadoCivil = (e) => {
        if (e.target.checked) {
            const name = e.target.name;
            setFormulario({
                ...formulario,
                estado_civil_pers: name
            })
            if (name === "soltero/a") {
                document.getElementById("soltero/a").setAttribute("checked", "");
                document.getElementById("casado/a").removeAttribute("checked");
                document.getElementById("divorciado/a").removeAttribute("checked");
                document.getElementById("viudo/a").removeAttribute("checked");

                document.getElementById("casado/a").checked = false;
                document.getElementById("divorciado/a").checked = false;
                document.getElementById("viudo/a").checked = false;
            } else if (name === "casado/a") {
                document.getElementById("casado/a").setAttribute("checked", "");
                document.getElementById("soltero/a").removeAttribute("checked");
                document.getElementById("divorciado/a").removeAttribute("checked");
                document.getElementById("viudo/a").removeAttribute("checked");

                document.getElementById("soltero/a").checked = false;
                document.getElementById("divorciado/a").checked = false;
                document.getElementById("viudo/a").checked = false;
            } else if (name === "divorciado/a") {
                document.getElementById("divorciado/a").setAttribute("checked", "");
                document.getElementById("soltero/a").removeAttribute("checked");
                document.getElementById("casado/a").removeAttribute("checked");
                document.getElementById("viudo/a").removeAttribute("checked");

                document.getElementById("casado/a").checked = false;
                document.getElementById("soltero/a").checked = false;
                document.getElementById("viudo/a").checked = false;
            } else if (name === "viudo/a") {
                document.getElementById("viudo/a").setAttribute("checked", "");
                document.getElementById("soltero/a").removeAttribute("checked");
                document.getElementById("casado/a").removeAttribute("checked");
                document.getElementById("divorciado/a").removeAttribute("checked");

                document.getElementById("casado/a").checked = false;
                document.getElementById("divorciado/a").checked = false;
                document.getElementById("soltero/a").checked = false;
            }
        }
    };

    const chechkPeso = (e) => {
        if (e.target.checked) {
            const name = e.target.name;
            if (name === "kg") {
                document.getElementById("kg").setAttribute("checked", "");
                document.getElementById("lb").removeAttribute("checked");
                document.getElementById("lb").checked = false;
            } else if (name === "lb") {
                document.getElementById("lb").setAttribute("checked", "");
                document.getElementById("kg").removeAttribute("checked");
                document.getElementById("kg").checked = false;
            }
        }
    };

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

        if (formulario.id_ciud === '') {
            formulario.id_ciud = selectedCiudad.value;
        }
        if (formulario.tipo_cedr_cli === '') {
            swal.fire('Error', 'Seleccione un tipo de documento', 'error');
            return;
        }
        if (formulario.sexo_cli === '') {
            swal.fire('Error', 'Seleccione un tipo de sexo', 'error');
            return;
        }
        if (formulario.estado_civil_pers === '') {
            swal.fire('Error', 'Seleccione un estado civil', 'error');
            return;
        }

        let tipoPeso = '';
        if (document.getElementById("kg").checked) {
            tipoPeso = 'kg';
        } else {
            tipoPeso = 'lb';
        }
        formulario.peso_cli = peso_cli + " " + tipoPeso;

        const response = await ClientesFun.editarCliente(formulario, navigate);

        if (response.message === "success") {
            toast.success('Cliente editado con éxito');
            setTimeout(function () {
                mostrarSeccion('clientes');
            }, 3000)

        } else {
            swal.fire('Error', 'Error al editar cliente', 'error');
        }
    }

    const cancelar = () => {
        mostrarSeccion("clientes")
    };

    const cambiarEstadoCliente = async () => {
        const response = await ClientesFun.cambiarEstadoCliente(formulario.id_pers, navigate);
        if (response.message === "success") {
            toast.success('Estado de cliente cambiado con éxito');
            setTimeout(function () {
                mostrarSeccion('clientes');
            }, 3000)

        } else {
            swal.fire('Error', 'Error al editar cliente', 'error');
            mostrarSeccion("clientes")
        }
    };

    return (
        <div className="editar-clientes-container">
            <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
            <div className="editar-clientes-form">
                <div className="editar-clientes-header">
                    <h3 className="editar-clientes-title">Editar Cliente</h3>
                    <button className="btn-desactivar" onClick={cambiarEstadoCliente}>Desactivar Cliente</button>
                </div>
                
                {/* Sección de Información Personal */}
                <div className="form-section personal-info-section">
                    <h4 className="form-section-title">Información Personal</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="ape_cli">Apellidos</label>
                            <input 
                                className={`form-input ${errores.ape_cli ? 'input-error' : ''}`}
                                type="text" 
                                name="ape_cli" 
                                id="ape_cli" 
                                placeholder="Ingrese los apellidos (solo letras)"
                                onChange={(e) => { 
                                    agregarClaveFormulario(e); 
                                    setApe_cli(e.target.value) 
                                }} 
                                value={ape_cli} 
                            />
                            {errores.ape_cli && <span className="error-message">{errores.ape_cli}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="nom_cli">Nombre(s)</label>
                            <input 
                                className={`form-input ${errores.nom_cli ? 'input-error' : ''}`}
                                type="text" 
                                name="nom_cli" 
                                id="nom_cli" 
                                placeholder="Ingrese los nombres (solo letras)"
                                onChange={(e) => { 
                                    agregarClaveFormulario(e); 
                                    setNom_cli(e.target.value) 
                                }} 
                                value={nom_cli} 
                            />
                            {errores.nom_cli && <span className="error-message">{errores.nom_cli}</span>}
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label" htmlFor="nacion_cli">Nacionalidad</label>
                        <input 
                            className={`form-input ${errores.nacion_cli ? 'input-error' : ''}`}
                            type="text" 
                            name="nacion_cli" 
                            id="nacion_cli" 
                            placeholder="Ingrese la nacionalidad (solo letras)"
                            onChange={(e) => { 
                                agregarClaveFormulario(e); 
                                setNacion_cli(e.target.value) 
                            }} 
                            value={nacion_cli} 
                        />
                        {errores.nacion_cli && <span className="error-message">{errores.nacion_cli}</span>}
                    </div>
                    <div className="id-type-group">
                        <div className="form-group">
                            <label className="form-label" htmlFor="idType">Tipo de identificación</label>
                            <div className="checkbox-group">
                                <div className="checkbox-item">
                                    <input className="checkbox-input" type="checkbox" id="cedula" name="cedula" onChange={chechkTipoIdentificacion} />
                                    <label className="checkbox-label" htmlFor="cedula">Cédula</label>
                                </div>
                                <div className="checkbox-item">
                                    <input className="checkbox-input" type="checkbox" id="pasaporte" name="pasaporte" onChange={chechkTipoIdentificacion} />
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
                                maxLength={formulario.tipo_cedr_cli === 'cedula' ? 10 : 8}
                                placeholder={
                                    formulario.tipo_cedr_cli === 'cedula' 
                                        ? "Ingrese 10 dígitos" 
                                        : formulario.tipo_cedr_cli === 'pasaporte'
                                        ? "Ej: ABC12345 (3 letras + 5 números)"
                                        : "Seleccione tipo de identificación"
                                }
                                onChange={(e) => { 
                                    agregarClaveFormulario(e); 
                                    setCedr_cli(e.target.value);
                                }} 
                                value={cedr_cli} 
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
                                onChange={(e) => { 
                                    agregarClaveFormulario(e); 
                                    setFecha_naci_cli(e.target.value) 
                                }} 
                                value={fecha_naci_cli} 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="lugar_naci_cli">Lugar de Nacimiento</label>
                            <input 
                                className={`form-input ${errores.lugar_naci_cli ? 'input-error' : ''}`}
                                type="text" 
                                name="lugar_naci_cli" 
                                id="lugar_naci_cli" 
                                placeholder="Ingrese lugar de nacimiento (solo letras)"
                                onChange={(e) => { 
                                    agregarClaveFormulario(e); 
                                    setLugar_naci_cli(e.target.value) 
                                }} 
                                value={lugar_naci_cli} 
                            />
                            {errores.lugar_naci_cli && <span className="error-message">{errores.lugar_naci_cli}</span>}
                        </div>
                    </div>
                </div>
                
                {/* Sección de Información de Contacto */}
                <div className="form-section contact-info-section">
                    <h4 className="form-section-title">Información de Contacto</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="tel_pers">Teléfono fijo</label>
                            <input 
                                className={`form-input ${errores.tel_pers ? 'input-error' : ''}`}
                                type="text" 
                                name="tel_pers" 
                                id="tel_pers" 
                                placeholder="Ingrese teléfono fijo (solo números)"
                                onChange={(e) => { 
                                    agregarClaveFormulario(e); 
                                    setTel_pers(e.target.value) 
                                }} 
                                value={tel_pers} 
                            />
                            {errores.tel_pers && <span className="error-message">{errores.tel_pers}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="cel_pers">Celular</label>
                            <input 
                                className={`form-input ${errores.cel_pers ? 'input-error' : ''}`}
                                type="text" 
                                name="cel_pers" 
                                id="cel_pers" 
                                placeholder="Ingrese número de celular (solo números)"
                                onChange={(e) => { 
                                    agregarClaveFormulario(e); 
                                    setCel_pers(e.target.value) 
                                }} 
                                value={cel_pers} 
                            />
                            {errores.cel_pers && <span className="error-message">{errores.cel_pers}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email_pers">Correo Electrónico</label>
                            <input 
                                className={`form-input ${errores.email_pers ? 'input-error' : ''}`}
                                type="email" 
                                name="email_pers" 
                                id="email_pers" 
                                placeholder="Ingrese correo electrónico"
                                onChange={(e) => { 
                                    agregarClaveFormulario(e); 
                                    setEmail_pers(e.target.value) 
                                }} 
                                value={email_pers} 
                            />
                            {errores.email_pers && <span className="error-message">{errores.email_pers}</span>}
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
                                placeholder="Ingrese la edad (solo números)"
                                onChange={(e) => { 
                                    agregarClaveFormulario(e); 
                                    setEdad_pers(e.target.value) 
                                }} 
                                value={edad_pers} 
                            />
                            {errores.edad_pers && <span className="error-message">{errores.edad_pers}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="sexo">Sexo</label>
                            <div className="checkbox-group">
                                <div className="checkbox-item">
                                    <input className="checkbox-input" type="checkbox" id="masculino" name="masculino" onChange={chechkSexo} />
                                    <label className="checkbox-label" htmlFor="masculino">Masculino</label>
                                </div>
                                <div className="checkbox-item">
                                    <input className="checkbox-input" type="checkbox" id="femenino" name="femenino" onChange={chechkSexo} />
                                    <label className="checkbox-label" htmlFor="femenino">Femenino</label>
                                </div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="estadoCivil">Estado Civil</label>
                            <div className="checkbox-group">
                                <div className="checkbox-item">
                                    <input className="checkbox-input" type="checkbox" id="soltero/a" name="soltero/a" onChange={chechkEstadoCivil} />
                                    <label className="checkbox-label" htmlFor="soltero/a">Soltero/a</label>
                                </div>
                                <div className="checkbox-item">
                                    <input className="checkbox-input" type="checkbox" id="casado/a" name="casado/a" onChange={chechkEstadoCivil} />
                                    <label className="checkbox-label" htmlFor="casado/a">Casado/a</label>
                                </div>
                                <div className="checkbox-item">
                                    <input className="checkbox-input" type="checkbox" id="divorciado/a" name="divorciado/a" onChange={chechkEstadoCivil} />
                                    <label className="checkbox-label" htmlFor="divorciado/a">Divorciado/a</label>
                                </div>
                                <div className="checkbox-item">
                                    <input className="checkbox-input" type="checkbox" id="viudo/a" name="viudo/a" onChange={chechkEstadoCivil} />
                                    <label className="checkbox-label" htmlFor="viudo/a">Viudo/a</label>
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
                                placeholder="Ingrese la estatura en cm (solo números)"
                                onChange={(e) => { 
                                    agregarClaveFormulario(e); 
                                    setEstatura_cli(e.target.value) 
                                }} 
                                value={estatura_cli} 
                            />
                            {errores.estatura_cli && <span className="error-message">{errores.estatura_cli}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="peso_cli">Peso</label>
                            <input 
                                className={`form-input ${errores.peso_cli ? 'input-error' : ''}`}
                                type="text" 
                                name="peso_cli" 
                                id="peso_cli" 
                                placeholder="Ingrese el peso (solo números)"
                                onChange={(e) => { 
                                    agregarClaveFormulario(e); 
                                    setPeso_cli(e.target.value) 
                                }} 
                                value={peso_cli} 
                            />
                            {errores.peso_cli && <span className="error-message">{errores.peso_cli}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="tipoPeso">Tipo de Peso</label>
                            <div className="checkbox-group">
                                <div className="checkbox-item">
                                    <input className="checkbox-input" type="checkbox" id="kg" name="kg" onChange={chechkPeso} />
                                    <label className="checkbox-label" htmlFor="kg">Kg</label>
                                </div>
                                <div className="checkbox-item">
                                    <input className="checkbox-input" type="checkbox" id="lb" name="lb" onChange={chechkPeso} />
                                    <label className="checkbox-label" htmlFor="lb">Lb</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Sección de Localización */}
                <div className="form-section location-info-section">
                    <h4 className="form-section-title">Información de Ubicación</h4>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label" htmlFor="pais">País</label>
                            <Select
                                className="react-select"
                                classNamePrefix="react-select"
                                options={Array.isArray(pais) ? pais.map((r) => ({
                                    value: r.id_pais,
                                    label: r.nom_pais,
                                })) : []}
                                placeholder="Seleccione el país"
                                onChange={async (e) => {
                                    setSelectedPais(e);
                                    setSelectedProvincia(null);
                                    setSelectedCiudad(null);
                                    const provincias = await ClientesFun.traerProvincias(e.value, navigate);
                                    setProvincia(provincias);
                                }}
                                value={selectedPais}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="provincia">Provincia</label>
                            <Select
                                className="react-select"
                                classNamePrefix="react-select"
                                options={Array.isArray(provincia) ? provincia.map((r) => ({
                                    value: r.id_provin,
                                    label: r.nom_provin,
                                })) : []}
                                placeholder="Seleccione la provincia"
                                onChange={async (e) => {
                                    setSelectedProvincia(e);
                                    setSelectedCiudad(null);
                                    const ciudades = await ClientesFun.traerCiudades(e.value, navigate);
                                    setCiudad(ciudades);
                                }}
                                value={selectedProvincia}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label" htmlFor="ciudad">Ciudad</label>
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
                                placeholder="Ingrese la parroquia (solo letras)"
                                onChange={(e) => { 
                                    agregarClaveFormulario(e); 
                                    setParroq_cli(e.target.value) 
                                }} 
                                value={parroq_cli} 
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
                                placeholder="Ingrese la calle Principal"
                                onChange={(e) => { 
                                    agregarClaveFormulario(e); 
                                    setCalle_princ_pers(e.target.value) 
                                }} 
                                value={calle_princ_pers} 
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="calle_secun_pers">Calle Secundaria</label>
                            <input 
                                className="form-input" 
                                type="text" 
                                name="calle_secun_pers" 
                                id="calle_secun_pers" 
                                placeholder="Ingrese la calle Secundaria"
                                onChange={(e) => { 
                                    agregarClaveFormulario(e); 
                                    setCalle_secun_pers(e.target.value) 
                                }} 
                                value={calle_secun_pers} 
                            />
                        </div>
                    </div>
                </div>
                
                {/* Botones de acción */}
                <div className="actions-container">
                    <button className="btn-cancelar" onClick={cancelar}>Cancelar</button>
                    <button className="btn-guardar" onClick={guardarCliente}>Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
}

export default EditarClientes;