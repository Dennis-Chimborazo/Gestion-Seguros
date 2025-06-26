import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import ModalDependientes from "./ModalDependientes";
import styles from "../estilos/modalDependientes.module.css";
import "../estilos/GestionContratacion.css";
import { Toaster, toast } from "sonner";
import swal from "sweetalert2";
import Select from "react-select";
import GestionContratacionFun from "./GestionContratacionFun";
import SegurosAdminFun from "../segurosAdmin/SegurosAdminFun";
import ClientesFun from "../clientes/ClientesFun";

export function CrearContratacion({ mostrarSeccion }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.user; // accedemos al usuario
    const [listDependientes, setListDependientes] = useState([]);
    const [listcliente, setListCliente] = useState([]);
    const [clienteSeguro, setClienteSeguro] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [listTipoSeguro, setListTipoSeguro] = useState([]);
    const [elecionTipoSeguro, setElecionTipoSeguro] = useState([]);
    const [tiempoPago, setTiempoPago] = useState('');
    const [valorAPagar, setValorAPagar] = useState('');
    const [errores, setErrores] = useState({});

    const abrirModal = () => {
        if ((listDependientes.length + 1) <= 5) {
            setIsModalOpen(true)
        } else {
            toast.error("ha alcansado limite maximo de Depedientes");
        }
    }

    const cerrarModal = () => setIsModalOpen(false);

    const [nuevoSeguro, setNuevoSeguro] = useState({
        ciud_seguro: '', dia_seguro: '', mes_seguro: '',
        anio_seguro: '', monto_seguro: '', tiempo_seguro: '', id_pers: '', id_tip_seg: '', email_pers: ''
    })

    const [personaFac, setPersonaFac] = useState({
        cedr_pers_fac: '', razon_pers_fac: '', tipo_pers_fac: '',
        nacion_pers_fac: '', nom_pers_fac: '', ape_pers_fac: '', tel_pers_fac: '', cel_pers_fac: '',
        email_pers_fac: '', direc_pers_fac: '', parent_pers_fac: ''
    })

    const [cuentaBancaria, setCuentaBancaria] = useState({ tipo_cuent_Ban: '', nom_cuent_Ban: '', mun_cuent_Ban: '' });

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

    const validarRUC = (valor) => {
        // RUC debe tener 13 dígitos y terminar en 001
        return /^\d{10}001$/.test(valor);
    };

    const validarIdentificacionFacturacion = (valor, tipo) => {
        if (tipo === 'cedula') {
            return validarSoloNumeros(valor) && valor.length <= 10;
        } else if (tipo === 'ruc') {
            return validarSoloNumeros(valor) && valor.length <= 13;
        } else if (tipo === 'otro') {
            return validarSoloNumeros(valor);
        }
        return true;
    };

    useEffect(() => {
        const clientes = async () => {
            const res = await ClientesFun.obtenerCliente(navigate);
            setListCliente(res.rows);
            const resTipSeg = await SegurosAdminFun.traerTiposSeguros();
            setListTipoSeguro(resTipSeg.rows);
        }
        clientes();
    }, []);

    const columnasDepencientes = [
        { name: "Cedula/Pasaporte", selector: row => row.cedr_depen },
        { name: "Nombre", selector: row => row.nom_depen },
        { name: "Apellido", selector: row => row.ape_depen },
        { name: "Telefono", selector: row => row.ape_depen },
        { name: "Sexo", selector: row => row.sexo_depen },
        { name: "Parentesco", selector: row => row.parent_depen },
        { name: "Condicion Medica", selector: row => row.boolDis },
        { name: "Discapacidad", selector: row => row.boolCond },
    ];

    const formaPago = [{ value: 12, label: 'Mensual' }, { value: 4, label: 'Trimestral' }, { value: 2, label: 'Semestral' }, { value: 1, label: 'Anual' }];

    // Validación para campo titular (cédula)
    const validarCedulaTitular = (e) => {
        const { value } = e.target;
        let nuevosErrores = { ...errores };

        if (!validarSoloNumeros(value)) {
            nuevosErrores.titular = 'La cédula solo debe contener números';
            setErrores(nuevosErrores);
            return;
        } else if (value.length > 10) {
            return; // No permitir más de 10 caracteres
        } else if (value.length > 0 && value.length < 10) {
            nuevosErrores.titular = 'La cédula debe tener exactamente 10 dígitos';
        } else {
            delete nuevosErrores.titular;
        }

        setErrores(nuevosErrores);
    };

    // Validación para tipo de seguro (solo letras)
    const validarTipoSeguro = (e) => {
        const { value } = e.target;
        let nuevosErrores = { ...errores };

        if (!validarSoloLetras(value)) {
            nuevosErrores.nom_tip_seg = 'El nombre del seguro solo debe contener letras';
            setErrores(nuevosErrores);
            return;
        } else {
            delete nuevosErrores.nom_tip_seg;
        }

        setErrores(nuevosErrores);
    };

    const buscarCliente = async (e) => {
        e.preventDefault();
        const cedula = document.getElementById("titular").value;
        
        // Validación final antes de buscar
        if (!validarCedula(cedula)) {
            toast.error('La cédula debe tener exactamente 10 dígitos');
            return;
        }

        const filtro = listcliente.filter((a) => a.cedr_cli === cedula);
        if (filtro.length === 0) {
            toast.error("No se encontró a ningún cliente")
            setClienteSeguro([])
            setNuevoSeguro({ ...nuevoSeguro, id_pers: '' })
        } else {
            setClienteSeguro(filtro)
            setNuevoSeguro({ ...nuevoSeguro, id_pers: filtro[0].id_pers, email_pers: filtro[0].email_pers })
        }
    }

    const asignarValoresNuevoSeguro = (e) => {
        const { name, value } = e.target;
        let valorValido = value;
        let nuevosErrores = { ...errores };

        // Validaciones específicas por campo
        if (name === 'ciud_seguro') {
            if (!validarSoloLetras(value)) {
                nuevosErrores.ciud_seguro = 'La ciudad solo debe contener letras';
                setErrores(nuevosErrores);
                return;
            } else {
                delete nuevosErrores.ciud_seguro;
            }
        }

        if (name === 'mes_seguro') {
            if (!validarSoloLetras(value)) {
                nuevosErrores.mes_seguro = 'El mes solo debe contener letras';
                setErrores(nuevosErrores);
                return;
            } else {
                delete nuevosErrores.mes_seguro;
            }
        }

        if (name === 'dia_seguro' || name === 'anio_seguro') {
            if (!validarSoloNumeros(value)) {
                nuevosErrores[name] = 'Este campo solo debe contener números';
                setErrores(nuevosErrores);
                return;
            } else {
                delete nuevosErrores[name];
            }
        }

        setErrores(nuevosErrores);
        setNuevoSeguro({ ...nuevoSeguro, [name]: valorValido });
    }

    const asignarValoresPersonaFact = (e) => {
        const { name, value } = e.target;
        let valorValido = value;
        let nuevosErrores = { ...errores };

        // Validaciones específicas por campo
        if (name === 'nacion_pers_fac' || name === 'razon_pers_fac' || 
            name === 'nom_pers_fac' || name === 'ape_pers_fac') {
            if (!validarSoloLetras(value)) {
                nuevosErrores[name] = 'Este campo solo debe contener letras';
                setErrores(nuevosErrores);
                return;
            } else {
                delete nuevosErrores[name];
            }
        }

        if (name === 'tel_pers_fac' || name === 'cel_pers_fac') {
            if (!validarSoloNumeros(value)) {
                nuevosErrores[name] = 'Este campo solo debe contener números';
                setErrores(nuevosErrores);
                return;
            } else {
                delete nuevosErrores[name];
            }
        }

        if (name === 'email_pers_fac') {
            if (value && !validarEmail(value)) {
                nuevosErrores.email_pers_fac = 'Ingrese un formato de correo válido';
            } else {
                delete nuevosErrores.email_pers_fac;
            }
        }

        if (name === 'cedr_pers_fac') {
            if (!validarIdentificacionFacturacion(value, personaFac.tipo_pers_fac)) {
                if (personaFac.tipo_pers_fac === 'cedula') {
                    nuevosErrores.cedr_pers_fac = 'La cédula solo debe contener números (máximo 10)';
                } else if (personaFac.tipo_pers_fac === 'ruc') {
                    nuevosErrores.cedr_pers_fac = 'El RUC solo debe contener números (máximo 13)';
                } else if (personaFac.tipo_pers_fac === 'otro') {
                    nuevosErrores.cedr_pers_fac = 'Solo debe contener números';
                }
                setErrores(nuevosErrores);
                return;
            } else {
                // Validaciones específicas según el tipo
                if (personaFac.tipo_pers_fac === 'cedula') {
                    if (value.length > 0 && value.length < 10) {
                        nuevosErrores.cedr_pers_fac = 'La cédula debe tener exactamente 10 dígitos';
                    } else if (value.length === 10) {
                        delete nuevosErrores.cedr_pers_fac;
                    } else {
                        delete nuevosErrores.cedr_pers_fac;
                    }
                } else if (personaFac.tipo_pers_fac === 'ruc') {
                    if (value.length === 13 && !validarRUC(value)) {
                        nuevosErrores.cedr_pers_fac = 'El RUC debe terminar en 001 (ej: 1234567890001)';
                    } else if (value.length > 0 && value.length < 13) {
                        nuevosErrores.cedr_pers_fac = 'El RUC debe tener exactamente 13 dígitos y terminar en 001';
                    } else {
                        delete nuevosErrores.cedr_pers_fac;
                    }
                } else {
                    delete nuevosErrores.cedr_pers_fac;
                }
            }
        }

        setErrores(nuevosErrores);
        setPersonaFac({ ...personaFac, [name]: valorValido });
    }

    const asignarValoresCuentaBanco = (e) => {
        const { name, value } = e.target;
        let valorValido = value;
        let nuevosErrores = { ...errores };

        if (name === 'mun_cuent_Ban') {
            if (!validarSoloNumeros(value)) {
                nuevosErrores.mun_cuent_Ban = 'El número de cuenta solo debe contener números';
                setErrores(nuevosErrores);
                return;
            } else {
                delete nuevosErrores.mun_cuent_Ban;
            }
        }

        if (name === 'nom_cuent_Ban') {
            if (!validarSoloLetras(value)) {
                nuevosErrores.nom_cuent_Ban = 'El nombre del banco solo debe contener letras';
                setErrores(nuevosErrores);
                return;
            } else {
                delete nuevosErrores.nom_cuent_Ban;
            }
        }

        setErrores(nuevosErrores);
        setCuentaBancaria({ ...cuentaBancaria, [name]: valorValido });
    }

    const checkTipoIdentificaicon = (event) => {
        const { id } = event.target;
        document.getElementById("cedula").checked = false;
        document.getElementById("ruc").checked = false;
        document.getElementById("otro").checked = false;

        document.getElementById(id).checked = true;
        
        // Limpiar el campo de identificación y errores cuando cambie el tipo
        setPersonaFac({ 
            ...personaFac, 
            tipo_pers_fac: id,
            cedr_pers_fac: ''
        });
        
        // Limpiar errores relacionados con la identificación
        const nuevosErrores = { ...errores };
        delete nuevosErrores.cedr_pers_fac;
        setErrores(nuevosErrores);
    };

    const checktipoBanco = (event) => {
        const { id } = event.target;
        document.getElementById("ahorros").checked = false;
        document.getElementById("corriente").checked = false;

        document.getElementById(id).checked = true;
        setCuentaBancaria({ ...cuentaBancaria, tipo_cuent_Ban: id })
    };

    const checkParentescoTitular = (event) => {
        const { id } = event.target;
        document.getElementById("padre").checked = false;
        document.getElementById("madre").checked = false;
        document.getElementById("hijo").checked = false;
        document.getElementById("conyuge").checked = false;
        document.getElementById("empleador").checked = false;
        document.getElementById("otroParen").checked = false;
        document.getElementById(id).checked = true;
        if (id === 'otroParen') {
            setPersonaFac({ ...personaFac, parent_pers_fac: '' })
        } else {
            setPersonaFac({ ...personaFac, parent_pers_fac: id })
        }
    };

    const textParentesco = (e) => {
        const { value } = e.target;
        let nuevosErrores = { ...errores };

        if (!validarSoloLetras(value)) {
            nuevosErrores.otroparentesco = 'El parentesco solo debe contener letras';
            setErrores(nuevosErrores);
            return;
        } else {
            delete nuevosErrores.otroparentesco;
        }

        document.getElementById("padre").checked = false;
        document.getElementById("madre").checked = false;
        document.getElementById("hijo").checked = false;
        document.getElementById("conyuge").checked = false;
        document.getElementById("empleador").checked = false;
        document.getElementById("otroParen").checked = true;
        
        setErrores(nuevosErrores);
        setPersonaFac({ ...personaFac, parent_pers_fac: value })
    }

    const buscarTipoSeguro = (e) => {
        e.preventDefault()
        const valor = document.getElementById("nom_tip_seg").value;
        
        if (valor !== '') {
            const filtro = listTipoSeguro.filter((a) =>
                a.nom_tip_seg && a.nom_tip_seg.startsWith(valor)
            );
            if (filtro.length === 1) {
                setElecionTipoSeguro(filtro);
                setNuevoSeguro({ ...nuevoSeguro, id_tip_seg: filtro[0].id_tip_seg, monto_seguro: '' })
            } else {
                setValorAPagar('')
                setElecionTipoSeguro([]);
                setTiempoPago('')
                toast.error("Tipo de Seguro no encontrado");
                setNuevoSeguro({ ...nuevoSeguro, id_tip_seg: '', monto_seguro: '' })
            }
        } else {
            toast.error("Ingrese el nombre del seguro");
        }
    }

    const calcularValorAPagar = (e) => {
        if (elecionTipoSeguro.length === 0) {
            toast.error("Primero debe de elegir un tipo de seguro");
        } else {
            setTiempoPago(e);
            const valor = parseInt(elecionTipoSeguro[0].pago_tip_seg);
            const cuota = (valor / e.value).toFixed(2);
            setValorAPagar(cuota)
            setNuevoSeguro({ ...nuevoSeguro, monto_seguro: cuota, tiempo_seguro: e.label })
        }
    }

    const guardarSeguro = async (e) => {
        e.preventDefault();
        
        // Verificar que no haya errores de validación
        if (Object.keys(errores).length > 0) {
            toast.error('Por favor corrija los errores en el formulario');
            return;
        }

        // Validaciones finales específicas
        if (personaFac.tipo_pers_fac === 'cedula' && !validarCedula(personaFac.cedr_pers_fac)) {
            toast.error('La cédula debe tener exactamente 10 dígitos');
            return;
        }

        if (personaFac.tipo_pers_fac === 'ruc' && personaFac.cedr_pers_fac.length === 13 && !validarRUC(personaFac.cedr_pers_fac)) {
            toast.error('El RUC debe tener 13 dígitos y terminar en 001');
            return;
        }

        if (verficarDatosCorrectos()) {
            try {
                const [personFac, cuentaBan] = await Promise.all([
                    GestionContratacionFun.guardarPersonaFact(personaFac, navigate),
                    GestionContratacionFun.guardarCuentaBanco(cuentaBancaria, navigate)
                ]);
                const login = JSON.parse(localStorage.getItem("login"));
                const data = {
                    ciud_seguro: nuevoSeguro.ciud_seguro,
                    dia_seguro: nuevoSeguro.dia_seguro,
                    mes_seguro: nuevoSeguro.mes_seguro,
                    anio_seguro: nuevoSeguro.anio_seguro,
                    id_pers: nuevoSeguro.id_pers,
                    id_cuent_Ban: cuentaBan.id_cuent_Ban,
                    id_pers_fac: personFac.id_pers_fac,
                    id_persona: login.user,
                    tipo_persona: login.rol,
                    monto_seguro: nuevoSeguro.monto_seguro,
                    tiempo_seguro: nuevoSeguro.tiempo_seguro,
                    id_tip_seg: nuevoSeguro.id_tip_seg
                };
                const idSeduro = await GestionContratacionFun.guardarSeguro(data, navigate);
                const dependientesConSeguro = listDependientes.map(dep => ({
                    ...dep,
                    id_seguro: idSeduro.id_seguro
                }));
                await GestionContratacionFun.guardarDependientes(dependientesConSeguro, navigate);
                const url = crearCadenaRandom();
                await Promise.all([
                    GestionContratacionFun.enviarValidacionEmailGestCont({ to: nuevoSeguro.email_pers, token: url }, navigate),
                    GestionContratacionFun.generarTokenContratacion({ id_seguro: idSeduro.id_seguro, url: url, id_pers: nuevoSeguro.id_pers }, navigate)
                ]);
                swal.fire({
                    title: "<label>Éxito</label>",
                    text: "Nueva contratación del seguro. Pendiente a validación de cliente",
                    timer: 3500,
                });
                mostrarSeccion("GestionContratacion");
            } catch (error) {
                console.error(error);
                swal.fire({
                    title: "<label>Advertencia</label>",
                    text: "Verifique los datos ingresados ",
                    timer: 3500,
                });
            }
        }
    };
  
    const verficarDatosCorrectos = () => {
        if (Object.values(nuevoSeguro).every(valor => valor !== '')) {
            if (Object.values(cuentaBancaria).every(valor => valor !== '')) {
                if (Object.values(personaFac).every(valor => valor !== '')) {
                    if (listDependientes.length >= 1) {
                            return true;
                    } else {
                        toast.error("Debe de asignar mínimo un dependiente");
                        return false;
                    }
                } else {
                    toast.error("Datos de Tarjeta de Crédito están incompletos ");
                    return false;
                }
            } else {
                toast.error("Faltan campos en Datos de tarjeta de crédito ");
                return false;
            }
        } else {
            toast.error("Datos se encuentran incompletos");
            return false;
        }
    }

    const crearCadenaRandom = () => {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let cadenaAleatoria = '';
        for (let i = 0; i < 20; i++) {
            const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
            cadenaAleatoria += caracteres.charAt(indiceAleatorio);
        }
        return cadenaAleatoria;
    };

    return (
        <div className="gestion-container">
            <form className="gestion-form" action="" method="">
                <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
                <h1 className="gestion-title">Gestión Contratación - Crear</h1>
                
                <div className="form-section">
                    <h2 className="section-title">Titular</h2>
                    <div className="search-controls">
                        <div className="search-group">
                            <label className="search-label" htmlFor="titular">Titular</label>
                            <div className="search-input-container">
                                <input
                                    className={`search-input ${errores.titular ? 'input-error' : ''}`}
                                    type="text"
                                    name="titular"
                                    id="titular"
                                    maxLength={10}
                                    placeholder="Ingrese cédula del cliente (10 dígitos)"
                                    onChange={validarCedulaTitular}
                                />
                            </div>
                            {errores.titular && <span className="error-message">{errores.titular}</span>}
                        </div>
                        <button className="btn-search" data-testid="btn-buscar-titular" onClick={buscarCliente}>Buscar</button>
                    </div>

                    <table className="custom-table">
                        <thead>
                            <tr>
                                <th>Cédula</th>
                                <th>Apellido</th>
                                <th>Nombre</th>
                                <th>Edad</th>
                                <th>Estado civil</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{clienteSeguro[0]?.cedr_cli || ''}</td>
                                <td>{clienteSeguro[0]?.ape_cli || ''}</td>
                                <td>{clienteSeguro[0]?.nom_cli || ''}</td>
                                <td>{clienteSeguro[0]?.edad_pers || ''}</td>
                                <td>{clienteSeguro[0]?.estado_civil_pers || ''}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <div className="form-section">
                    <h2 className="section-title">Elija tipo de Seguro</h2>
                    <div className="search-controls">
                        <div className="search-group">
                            <label className="search-label" htmlFor="nom_tip_seg">Nombre del Seguro</label>
                            <div className="search-input-container">
                                <input 
                                    className={`search-input ${errores.nom_tip_seg ? 'input-error' : ''}`}
                                    type="text" 
                                    name="nom_tip_seg" 
                                    id="nom_tip_seg" 
                                    placeholder="Ingrese el nombre del seguro (solo letras)" 
                                    onChange={validarTipoSeguro}
                                />
                            </div>
                            {errores.nom_tip_seg && <span className="error-message">{errores.nom_tip_seg}</span>}
                        </div>
                        <button className="btn-search" data-testid="btn-buscar-seguro" onClick={buscarTipoSeguro}> Buscar</button>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Forma de pago</label>
                            <Select
                                options={formaPago}
                                placeholder="Seleccione la forma de pago"
                                onChange={calcularValorAPagar}
                                value={tiempoPago}
                            />
                        </div>
                    </div>
                    <div>
                        <table className="custom-table">
                            <thead>
                                <tr>
                                    <th>Seguro</th>
                                    <th>Descripción</th>
                                    <th>Valor Anual</th>
                                    <th>Valor a pagar</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>{elecionTipoSeguro[0]?.nom_tip_seg || ''}</td>
                                    <td>{elecionTipoSeguro[0]?.descrip_tip_seg || ''}</td>
                                    <td>{elecionTipoSeguro[0]?.pago_tip_seg || ''}</td>
                                    <td>{valorAPagar || ''}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div className="form-section">
                    <h2 className="section-title">Dependientes</h2>
                    <div style={{ marginBottom: '1rem' }}>
                        <button type="button" className="btn-primary" onClick={abrirModal}>Agregar Dependiente</button>
                    </div>
                    <DataTable
                        pagination
                        paginationPerPage={6}
                        columns={columnasDepencientes}
                        data={listDependientes}
                        noDataComponent="No ha seleccionado ningún dependiente"
                        persistTableHead >
                    </DataTable>
                </div>
                
                <div className="form-section">
                    <h2 className="section-title">Datos Facturación</h2>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Tipo de identificación:</label>
                            <div className="checkbox-group">
                                <div className="checkbox-item">
                                    <input type="checkbox" id="cedula" onChange={checkTipoIdentificaicon} />
                                    <label htmlFor="cedula">Cédula</label>
                                </div>
                                <div className="checkbox-item">
                                    <input type="checkbox" id="ruc" onChange={checkTipoIdentificaicon} />
                                    <label htmlFor="ruc">RUC</label>
                                </div>
                                <div className="checkbox-item">
                                    <input type="checkbox" id="otro" onChange={checkTipoIdentificaicon} />
                                    <label htmlFor="otro">Otro</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Número de identificación</label>
                            <input 
                                className={`form-input ${errores.cedr_pers_fac ? 'input-error' : ''}`}
                                type="text" 
                                name="cedr_pers_fac" 
                                id="cedr_pers_fac" 
                                value={personaFac.cedr_pers_fac}
                                maxLength={personaFac.tipo_pers_fac === 'cedula' ? 10 : personaFac.tipo_pers_fac === 'ruc' ? 13 : undefined}
                                placeholder={
                                    personaFac.tipo_pers_fac === 'cedula' 
                                        ? "Ingrese 10 dígitos" 
                                        : personaFac.tipo_pers_fac === 'ruc'
                                        ? "Ej: 1234567890001 (13 dígitos, termina en 001)"
                                        : personaFac.tipo_pers_fac === 'otro'
                                        ? "Solo números"
                                        : "Seleccione tipo de identificación"
                                }
                                onChange={asignarValoresPersonaFact} 
                                disabled={!personaFac.tipo_pers_fac}
                            />
                            {errores.cedr_pers_fac && <span className="error-message">{errores.cedr_pers_fac}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nacionalidad</label>
                            <input 
                                className={`form-input ${errores.nacion_pers_fac ? 'input-error' : ''}`}
                                type="text" 
                                name="nacion_pers_fac" 
                                id="nacion_pers_fac" 
                                value={personaFac.nacion_pers_fac}
                                placeholder="Solo letras"
                                onChange={asignarValoresPersonaFact} 
                            />
                            {errores.nacion_pers_fac && <span className="error-message">{errores.nacion_pers_fac}</span>}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Razón social</label>
                            <input 
                                className={`form-input ${errores.razon_pers_fac ? 'input-error' : ''}`}
                                type="text" 
                                name="razon_pers_fac" 
                                id="razon_pers_fac" 
                                value={personaFac.razon_pers_fac}
                                placeholder="Solo letras"
                                onChange={asignarValoresPersonaFact} 
                            />
                            {errores.razon_pers_fac && <span className="error-message">{errores.razon_pers_fac}</span>}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Nombres</label>
                            <input 
                                className={`form-input ${errores.nom_pers_fac ? 'input-error' : ''}`}
                                type="text" 
                                name="nom_pers_fac" 
                                id="nom_pers_fac" 
                                value={personaFac.nom_pers_fac}
                                placeholder="Solo letras"
                                onChange={asignarValoresPersonaFact} 
                            />
                            {errores.nom_pers_fac && <span className="error-message">{errores.nom_pers_fac}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Apellidos</label>
                            <input 
                                className={`form-input ${errores.ape_pers_fac ? 'input-error' : ''}`}
                                type="text" 
                                name="ape_pers_fac" 
                                id="ape_pers_fac" 
                                value={personaFac.ape_pers_fac}
                                placeholder="Solo letras"
                                onChange={asignarValoresPersonaFact} 
                            />
                            {errores.ape_pers_fac && <span className="error-message">{errores.ape_pers_fac}</span>}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Correo electrónico</label>
                            <input 
                                className={`form-input ${errores.email_pers_fac ? 'input-error' : ''}`}
                                type="email" 
                                name="email_pers_fac" 
                                id="email_pers_fac" 
                                value={personaFac.email_pers_fac}
                                placeholder="ejemplo@correo.com"
                                onChange={asignarValoresPersonaFact} 
                            />
                            {errores.email_pers_fac && <span className="error-message">{errores.email_pers_fac}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Dirección domicilio</label>
                            <input 
                                className="form-input" 
                                type="text" 
                                name="direc_pers_fac" 
                                id="direc_pers_fac" 
                                value={personaFac.direc_pers_fac}
                                onChange={asignarValoresPersonaFact} 
                            />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Teléfono del domicilio</label>
                            <input 
                                className={`form-input ${errores.tel_pers_fac ? 'input-error' : ''}`}
                                type="text" 
                                name="tel_pers_fac" 
                                id="tel_pers_fac" 
                                value={personaFac.tel_pers_fac}
                                placeholder="Solo números"
                                onChange={asignarValoresPersonaFact} 
                            />
                            {errores.tel_pers_fac && <span className="error-message">{errores.tel_pers_fac}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Celular</label>
                            <input 
                                className={`form-input ${errores.cel_pers_fac ? 'input-error' : ''}`}
                                type="text" 
                                name="cel_pers_fac" 
                                id="cel_pers_fac" 
                                value={personaFac.cel_pers_fac}
                                placeholder="Solo números"
                                onChange={asignarValoresPersonaFact} 
                            />
                            {errores.cel_pers_fac && <span className="error-message">{errores.cel_pers_fac}</span>}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Parentesco</label>
                            <div className="checkbox-group">
                                <div className="checkbox-item">
                                    <input type="checkbox" name="padre" id="padre" onChange={checkParentescoTitular} />
                                    <label htmlFor="padre">Padre</label>
                                </div>
                                <div className="checkbox-item">
                                    <input type="checkbox" name="madre" id="madre" onChange={checkParentescoTitular} />
                                    <label htmlFor="madre">Madre</label>
                                </div>
                                <div className="checkbox-item">
                                    <input type="checkbox" name="hijo" id="hijo" onChange={checkParentescoTitular} />
                                    <label htmlFor="hijo">Hijo</label>
                                </div>
                                <div className="checkbox-item">
                                    <input type="checkbox" name="conyuge" id="conyuge" onChange={checkParentescoTitular} />
                                    <label htmlFor="conyuge">Cónyuge</label>
                                </div>
                                <div className="checkbox-item">
                                    <input type="checkbox" name="empleador" id="empleador" onChange={checkParentescoTitular} />
                                    <label htmlFor="empleador">Empleador</label>
                                </div>
                                <div className="checkbox-item">
                                    <input type="checkbox" name="otroParen" id="otroParen" onChange={checkParentescoTitular} />
                                    <label htmlFor="otroParen">Otro</label>
                                </div>
                            </div>
                            <input 
                                className={`form-input ${errores.otroparentesco ? 'input-error' : ''}`}
                                type="text" 
                                name="otroparentesco" 
                                id="otroparentesco" 
                                onChange={textParentesco} 
                                placeholder="Especifique otro parentesco (solo letras)" 
                            />
                            {errores.otroparentesco && <span className="error-message">{errores.otroparentesco}</span>}
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <h4 className="section-title">Datos de Tarjeta de Crédito</h4>
                            <div className="info-text">
                                Esta tarjeta será utilizada para debitar el pago del valor del seguro. Por favor, asegúrese de ingresar la información correctamente.
                            </div>
                            <label className="form-label">Tipo de cuenta</label>
                            <div className="checkbox-group">
                                <div className="checkbox-item">
                                    <input type="checkbox" name="ahorros" id="ahorros" onChange={checktipoBanco} />
                                    <label htmlFor="ahorros">Ahorros</label>
                                </div>
                                <div className="checkbox-item">
                                    <input type="checkbox" name="corriente" id="corriente" onChange={checktipoBanco} />
                                    <label htmlFor="corriente">Corriente</label>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Banco</label>
                                    <input 
                                        className={`form-input ${errores.nom_cuent_Ban ? 'input-error' : ''}`}
                                        type="text" 
                                        name="nom_cuent_Ban" 
                                        id="nom_cuent_Ban" 
                                        value={cuentaBancaria.nom_cuent_Ban}
                                        placeholder="Solo letras"
                                        onChange={asignarValoresCuentaBanco} 
                                    />
                                    {errores.nom_cuent_Ban && <span className="error-message">{errores.nom_cuent_Ban}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Cuenta No.</label>
                                    <input 
                                        className={`form-input ${errores.mun_cuent_Ban ? 'input-error' : ''}`}
                                        type="text" 
                                        name="mun_cuent_Ban" 
                                        id="mun_cuent_Ban" 
                                        value={cuentaBancaria.mun_cuent_Ban}
                                        placeholder="Solo números"
                                        onChange={asignarValoresCuentaBanco} 
                                    />
                                    {errores.mun_cuent_Ban && <span className="error-message">{errores.mun_cuent_Ban}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="form-section">
                    <h2 className="section-title">Datos Complementarios</h2>
                    <div className="info-text">
                        Como constancia de haber leído y entendido, acepto el contenido de la presente solicitud y declaro que la información que he
                        suministrado es exacta en todas sus partes, por lo que me obligo a presentar toda la documentación que demuestre mis
                        declaraciones y firmo el presente documento en señal de comprensión, aceptación y conformidad de su contenido. La información
                        proporcionada en este documento será de estricta confidencialidad
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Ciudad</label>
                            <input 
                                className={`form-input ${errores.ciud_seguro ? 'input-error' : ''}`}
                                type="text" 
                                name="ciud_seguro" 
                                id="ciud_seguro" 
                                value={nuevoSeguro.ciud_seguro}
                                placeholder="Solo letras"
                                onChange={asignarValoresNuevoSeguro} 
                            />
                            {errores.ciud_seguro && <span className="error-message">{errores.ciud_seguro}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Día</label>
                            <input 
                                className={`form-input ${errores.dia_seguro ? 'input-error' : ''}`}
                                type="text" 
                                name="dia_seguro" 
                                id="dia_seguro" 
                                value={nuevoSeguro.dia_seguro}
                                placeholder="Solo números"
                                onChange={asignarValoresNuevoSeguro} 
                            />
                            {errores.dia_seguro && <span className="error-message">{errores.dia_seguro}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mes</label>
                            <input 
                                className={`form-input ${errores.mes_seguro ? 'input-error' : ''}`}
                                type="text" 
                                name="mes_seguro" 
                                id="mes_seguro" 
                                value={nuevoSeguro.mes_seguro}
                                placeholder="Solo letras"
                                onChange={asignarValoresNuevoSeguro} 
                            />
                            {errores.mes_seguro && <span className="error-message">{errores.mes_seguro}</span>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Año</label>
                            <input 
                                className={`form-input ${errores.anio_seguro ? 'input-error' : ''}`}
                                type="text" 
                                name="anio_seguro" 
                                id="anio_seguro" 
                                value={nuevoSeguro.anio_seguro}
                                placeholder="Solo números"
                                onChange={asignarValoresNuevoSeguro} 
                            />
                            {errores.anio_seguro && <span className="error-message">{errores.anio_seguro}</span>}
                        </div>
                    </div>
                </div>
                
                <div className="action-buttons">
                    <button className="btn-cancelar" onClick={() => mostrarSeccion("GestionContratacion")}>Cancelar</button>
                    <button className="btn-guardar" onClick={guardarSeguro}>Guardar</button>
                </div>
                {isModalOpen && (
                    <div className={styles.overlay}>
                        <div className={styles.modal} style={{ maxHeight: '90vh', overflowY: 'auto', width: '40%' }}>
                            <button className={styles.closeBtn} onClick={cerrarModal}>X</button>
                            <ModalDependientes cerrarModal={cerrarModal} setListDependientes={setListDependientes} listDependientes={listDependientes} />
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}

export default CrearContratacion;