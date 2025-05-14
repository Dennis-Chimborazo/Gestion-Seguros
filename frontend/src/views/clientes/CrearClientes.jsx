import React, { useEffect, useState } from "react";
import styles from '../estilos/cliente.module.css'; // Importa los estilos
import ClientesFun from "./ClientesFun";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import swal from "sweetalert2";

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
    })

    useEffect(() => {
        const cargarPais = async () => {
            const apiPais = await ClientesFun.traerPaises(navigate);
            setPais(apiPais.rows)
        }
        cargarPais();

    }, []);

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


    };

    const chechkTipoPeso = (event) => {
        const peso = document.getElementById("peso_cli").value;
        if (peso == '') {
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
        if (peso == '') {
            document.getElementById("lb").checked = false;
            document.getElementById("kg").checked = false;
            setFormulario({ ...formulario, peso_cli: '' })
        }
    }

    const guardarCliente = async () => {
        if (Object.values(formulario).every(valor => valor !== '')) {
            const res = await ClientesFun.guardarCliente(formulario, navigate);
            if (res) {
                swal.fire({
                    title: "<label>Éxito</label>",
                    text: "Nuevo usuario creado",
                    timer: 3500,
                })
                mostrarSeccion("clientes")
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
                if (respuesta.isConfirmed) {
                    mostrarSeccion("clientes")
                }
            });

        } else {
            mostrarSeccion("clientes")
        }
    };


    return (
        <div className={styles.container}> {/* Aplica el contenedor principal */}
            <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
            <h3>Nuevo cliente</h3>
            <div className={styles.formRow}> {/* Filas para agrupar elementos */}
                <div className={styles.formGroup}>
                    <label htmlFor="">Apellidos </label>
                    <input type="text" name="ape_cli" id="ape_cli" placeholder="Ingrese los apellidos" onChange={agregarClaveFormulario} />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="">Nombre (s) </label>
                    <input type="text" name="nom_cli" id="nom_cli" placeholder="Ingrese los nombres" onChange={agregarClaveFormulario} />
                </div>
            </div>

            <div className={styles.formGroup}>
                <div className={styles.formGroup}>
                    <label htmlFor="">Nacionalidad </label>
                    <input type="text" name="nacion_cli" id="nacion_cli" placeholder="Ingrese la nacionalidad" onChange={agregarClaveFormulario} />
                </div>

            </div>
            <div className={styles.identificationGroup}>
                <div className={styles.formGroupType}>
                    <label htmlFor="idType">Tipo de identificación</label>
                    <div className={styles.identificationType}>
                        <input type="checkbox" id="cedula" name="cedula" onChange={chechkTipoIdentificacion}  />
                        <label htmlFor="cedula">Cédula</label>
                        <input type="checkbox" id="pasaporte" name="pasaporte" onChange={chechkTipoIdentificacion}  />
                        <label htmlFor="pasaporte">Pasaporte</label>
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="cedr_cli">Número de Identificación</label>
                    <input type="text" name="cedr_cli" id="cedr_cli" placeholder="Ingrese ID" onChange={agregarClaveFormulario} />
                </div>
            </div>

            <div className={styles.formRow}>

                <div className={styles.formGroup}>
                    <label htmlFor="">Fecha de Nacimiento </label>
                    <div className={styles.dateGroup}>
                        <input type="date" name="fecha_naci_cli" id="fecha_naci_cli" onChange={agregarClaveFormulario} />
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="">Lugar de Nacimiento </label>
                    <input type="text" name="lugar_naci_cli" id="lugar_naci_cli" placeholder="Ingrese lugar de Nacimiento" onChange={agregarClaveFormulario} />
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="">Teléfono fijo </label>
                    <input type="text" name="tel_pers" id="tel_pers" placeholder="Ingrese telefono convencional/fijo" onChange={agregarClaveFormulario} />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="">Celular </label>
                    <div className={styles.dateGroup}>
                        <input type="text" name="cel_pers" id="cel_pers" placeholder="Ingrese numero de Celular" onChange={agregarClaveFormulario} />
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="">Correo electrónico </label>
                    <div className={styles.dateGroup}>
                        <input type="text" name="email_pers" id="email_pers" placeholder="Ingrese correo electronico" onChange={agregarClaveFormulario} />
                    </div>
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="">Edad</label>
                    <div className={styles.inputEdad}>
                    <input type="text" name="edad_pers" id="edad_pers" placeholder="Ingrese la edad" onChange={agregarClaveFormulario} />
                    </div>  
                </div>
                <div className={styles.miscGroup}>
                    <div className={styles.sexGroup}>
                        <label htmlFor="">Sexo:</label>
                        <input type="checkbox" id="masculino" name="masculino" onChange={chechkSexo} /> <label htmlFor="masculino">M</label>
                        <input type="checkbox" id="femenino" name="femenino" onChange={chechkSexo} /> <label htmlFor="femenino">F</label>
                    </div>
                    <div className={styles.civilStatusGroup}>
                        <label htmlFor="">Estado Civil:</label>
                        <input type="checkbox" id="soltero" onChange={chechkEstadoCivil} /> <label htmlFor="soltero">Soltero</label>
                        <input type="checkbox" id="divorciado" onChange={chechkEstadoCivil} /> <label htmlFor="divorciado">Divorciado</label>
                        <input type="checkbox" id="viudo" onChange={chechkEstadoCivil} /> <label htmlFor="viudo">Viudo</label>
                        <input type="checkbox" id="casado" onChange={chechkEstadoCivil} /> <label htmlFor="casado">Casado</label>
                        <input type="checkbox" id="unionLibre" onChange={chechkEstadoCivil} /> <label htmlFor="unionLibre">U/Libre</label>
                    </div>
                </div>
                <div className={styles.formRow}>
                    <div className={styles.heightGroup}>
                        <label htmlFor="">Estatura: </label>
                        <input type="text" name="estatura_cli" id="estatura_cli" placeholder="Ingrese la altura" onChange={agregarClaveFormulario} /> <label htmlFor="">cm</label>
                    </div>
                    <div className={styles.weightGroup}>
                        <label htmlFor="">Peso: </label>
                        <input type="text" name="peso_cli" id="peso_cli" placeholder="Ingrese el peso" onChange={textPeso} />
                        <input type="checkbox" id="lb" onChange={chechkTipoPeso} /> <label htmlFor="libras">Lb</label>
                        <input type="checkbox" id="kg" onChange={chechkTipoPeso} /> <label htmlFor="kilogramos">kg </label>
                    </div>
                </div>
            </div>
            <div className={styles.formRow}> {/* Filas para agrupar elementos */}
                <div className={styles["locationGroup"]}>
                    <label htmlFor="">País</label>
                    <Select
                        options={Array.isArray(pais) ? pais.map((r) => ({
                            value: r.id_pais,
                            label: r.nom_pais,
                        })) : []} // Si `pais` no es un array, pasaré un array vacío
                        placeholder="Seleccione el pais"
                        onChange={(e) => {
                            cargarProvincia(e);
                            setFormulario({ ...formulario, id_ciud: '' });
                        }}
                    />
                    <label htmlFor="">Provincia</label>
                    <Select
                        options={Array.isArray(provincia) ? provincia.map((r) => ({
                            value: r.id_provin,
                            label: r.nom_provin,
                        })) : []} // Si `pais` no es un array, pasaré un array vacío
                        placeholder="Seleccione la provincia"
                        onChange={(e) => {
                            setSelectedProvincia(e);
                            cargarCiudad(e);
                            setFormulario({ ...formulario, id_ciud: '' });
                        }}
                        value={selectedProvincia}
                    />
                    <label htmlFor="">Ciudad</label>
                    <Select
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
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="">Parroquia </label>
                        <input type="text" name="parroq_cli" id="parroq_cli" placeholder="Ingrese la parroquia" onChange={agregarClaveFormulario} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="">Calle Principal </label>
                        <input type="text" name="calle_princ_pers" id="calle_princ_pers" placeholder="Ingrese la calle Principal" onChange={agregarClaveFormulario} />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="">Calle Secundaria </label>
                        <input type="text" name="calle_secun_pers" id="calle_secun_pers" placeholder="Ingrese la calle Secundaria" onChange={agregarClaveFormulario} />
                    </div>
                </div>
            </div>
            <div>
                <div className={styles.buttonGroup}>
                    <button className={styles.btnGuardar} onClick={guardarCliente}>Guardar</button>
                    <button className={styles.btnCancelar} onClick={cancelar}>Cancelar</button>
                </div>

            </div>

        </div>
    );
}

export default CrearClientes;