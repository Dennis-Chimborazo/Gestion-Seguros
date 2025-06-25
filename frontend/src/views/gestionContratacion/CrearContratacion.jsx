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
        // { name: "Condicion Medica", selector: row => row.boolDis },
        // { name: "Discapacidad", selector: row => row.boolCond },
    ];

    const formaPago = [{ value: 12, label: 'Mensual' }, { value: 4, label: 'Trimestral' }, { value: 2, label: 'Semestral' }, { value: 1, label: 'Anual' }];
    const buscarCliente = async (e) => {
        e.preventDefault();
        const filtro = listcliente.filter((a) => a.cedr_cli === document.getElementById("titular").value);
        if (filtro.length === 0) {
            toast.error("Nose encontro a ningun cliente")
            setClienteSeguro([])
            setNuevoSeguro({ ...nuevoSeguro, id_pers: '' })
        } else {
            setClienteSeguro(filtro)
            setNuevoSeguro({ ...nuevoSeguro, id_pers: filtro[0].id_pers, email_pers: filtro[0].email_pers })
        }
    }
    const asignarValoresNuevoSeguro = (e) => {
        setNuevoSeguro({ ...nuevoSeguro, [e.target.name]: e.target.value });
    }
    const asignarValoresPersonaFact = (e) => {
        setPersonaFac({ ...personaFac, [e.target.name]: e.target.value });
    }
    const asignarValoresCuentaBanco = (e) => {
        setCuentaBancaria({ ...cuentaBancaria, [e.target.name]: e.target.value });
    }
    const checkTipoIdentificaicon = (event) => {
        const { id } = event.target;
        document.getElementById("cedula").checked = false;
        document.getElementById("ruc").checked = false;
        document.getElementById("otro").checked = false;

        document.getElementById(id).checked = true;
        setPersonaFac({ ...personaFac, tipo_pers_fac: id })
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
        document.getElementById("padre").checked = false;
        document.getElementById("madre").checked = false;
        document.getElementById("hijo").checked = false;
        document.getElementById("conyuge").checked = false;
        document.getElementById("empleador").checked = false;
        document.getElementById("otroParen").checked = true;
        setPersonaFac({ ...personaFac, parent_pers_fac: e.target.value })

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
                console.error(error); // Útil para debugging
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
                        toast.error("Debe de asignar minimo un dependiente");
                        return false;
                    }
                } else {
                    toast.error("Datos de Tarjeta de Crédito estan incompletos ");
                    return false;
                }
            } else {
                toast.error("faltan campos en Datos de tarjeta de credito ");
                return false;
            }
        } else {
        console.log("llega control else")

            toast.error("Datos de encuentran incompletos");
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
    }; return (
        <div className="gestion-container">
            <form className="gestion-form" action="" method="">
                <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
                <h1 className="gestion-title">Gestión Contratación - Crear</h1>                    <div className="form-section">
                    <h2 className="section-title">Titular</h2>
                    <div className="search-controls">
                        <div className="search-group">
                            <label className="search-label" htmlFor="titular">Titular</label>
                            <div className="search-input-container">
                                <input
                                    className="search-input"
                                    type="text"
                                    name="titular"
                                    id="titular"
                                    placeholder="Ingrese cédula del cliente"
                                />
                            </div>
                        </div>
                        <button className="btn-search" onClick={buscarCliente}>Buscar</button>
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
                </div>                    <div className="form-section">
                    <h2 className="section-title">Elija tipo de Seguro</h2>
                    <div className="search-controls">
                        <div className="search-group">
                            <label className="search-label" htmlFor="nom_tip_seg">Nombre del Seguro</label>
                            <div className="search-input-container">
                                <input className="search-input" type="text" name="nom_tip_seg" id="nom_tip_seg" placeholder="Ingrese el nombre del seguro" />
                            </div>
                        </div>
                        <button className="btn-search" onClick={buscarTipoSeguro}> Buscar</button>
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
                </div>                    <div className="form-section">
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
                </div>                   <div className="form-section">
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
                            <input className="form-input" type="text" name="cedr_pers_fac" id="cedr_pers_fac" onChange={asignarValoresPersonaFact} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Nacionalidad</label>
                            <input className="form-input" type="text" name="nacion_pers_fac" id="nacion_pers_fac" onChange={asignarValoresPersonaFact} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Razón social</label>
                            <input className="form-input" type="text" name="razon_pers_fac" id="razon_pers_fac" onChange={asignarValoresPersonaFact} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Nombres</label>
                            <input className="form-input" type="text" name="nom_pers_fac" id="nom_pers_fac" onChange={asignarValoresPersonaFact} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Apellidos</label>
                            <input className="form-input" type="text" name="ape_pers_fac" id="ape_pers_fac" onChange={asignarValoresPersonaFact} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Correo electrónico</label>
                            <input className="form-input" type="email" name="email_pers_fac" id="email_pers_fac" onChange={asignarValoresPersonaFact} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Dirección domicilio</label>
                            <input className="form-input" type="text" name="direc_pers_fac" id="direc_pers_fac" onChange={asignarValoresPersonaFact} />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Teléfono del domicilio</label>
                            <input className="form-input" type="text" name="tel_pers_fac" id="tel_pers_fac" onChange={asignarValoresPersonaFact} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Celular</label>
                            <input className="form-input" type="text" name="cel_pers_fac" id="cel_pers_fac" onChange={asignarValoresPersonaFact} />
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
                            <input className="form-input" type="text" name="otroparentesco" id="otroparentesco" onChange={textParentesco} placeholder="Especifique otro parentesco" />
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
                                    <input className="form-input" type="text" name="nom_cuent_Ban" id="nom_cuent_Ban" onChange={asignarValoresCuentaBanco} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Cuenta No.</label>
                                    <input className="form-input" type="text" name="mun_cuent_Ban" id="mun_cuent_Ban" onChange={asignarValoresCuentaBanco} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>                   <div className="form-section">
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
                            <input className="form-input" type="text" name="ciud_seguro" id="ciud_seguro" onChange={asignarValoresNuevoSeguro} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Día</label>
                            <input className="form-input" type="text" name="dia_seguro" id="dia_seguro" onChange={asignarValoresNuevoSeguro} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mes</label>
                            <input className="form-input" type="text" name="mes_seguro" id="mes_seguro" onChange={asignarValoresNuevoSeguro} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Año</label>
                            <input className="form-input" type="text" name="anio_seguro" id="anio_seguro" onChange={asignarValoresNuevoSeguro} />
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