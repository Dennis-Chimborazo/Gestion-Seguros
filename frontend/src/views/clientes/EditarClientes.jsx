import React, {useEffect,useState} from "react";
import styles from '../estilos/cliente.module.css'; // Importa los estilos
import ClientesFun from "./ClientesFun";
import Select from "react-select";
import { useNavigate, useLocation } from "react-router-dom";
import {Toaster,toast} from "sonner";
import swal from "sweetalert2";

export function EditarClientes({ mostrarSeccion }){

    const [pais,setPais]=useState([]);
    const [provincia,setProvincia]=useState([]);
    const [ciudad,setCiudad]=useState([]);
    const [selectedPais, setSelectedPais] = useState(null);
    const [selectedProvincia, setSelectedProvincia] = useState(null);
    const [selectedCiudad, setSelectedCiudad] = useState(null);
    const navigate = useNavigate();
    const [cedr_cli,setCedr_cli]=useState('');
    const [nom_cli,setNom_cli]=useState('');
    const [ape_cli,setApe_cli]=useState('');
    const [nacion_cli,setNacion_cli]=useState('');
    const [fecha_naci_cli,setFecha_naci_cli]=useState('');
    const [lugar_naci_cli,setLugar_naci_cli]=useState('');
    const [tel_pers,setTel_pers]=useState('');
    const [cel_pers,setCel_pers]=useState('');
    const [email_pers,setEmail_pers]=useState('');
    const [edad_pers,setEdad_pers]=useState('');
    const [estatura_cli,setEstatura_cli]=useState('');
    const [peso_cli,setPeso_cli]=useState('');
    const [parroq_cli,setParroq_cli]=useState('');
    const [calle_princ_pers,setCalle_princ_pers]=useState('');
    const [calle_secun_pers,setCalle_secun_pers]=useState('');


    const [formulario,setFormulario]=useState({id_pers:'',cedr_cli:'',tipo_cedr_cli:'',nacion_cli:'',
        nom_cli:'',ape_cli:'',fecha_naci_cli:'',lugar_naci_cli:'',tel_pers:'',
        cel_pers:'',email_pers:'',edad_pers:'',sexo_cli:'',estado_civil_pers:'',
        estatura_cli:'',peso_cli:'',parroq_cli:'',calle_princ_pers:'',
        calle_secun_pers:'', id_ciud:''});

    const [formularioEdit,setFormularioEdit] = useState({});


    useEffect(()=>{
        const cargarPais= async()=>{
            const editData = JSON.parse(localStorage.getItem("edit"));
            const tipoPeso =editData.cliente.peso_cli.split(' ');
            setFormulario({...formulario,
                id_pers:editData.cliente.id_pers,
                cedr_cli:editData.cliente.cedr_cli,
                tipo_cedr_cli:editData.cliente.tipo_cedr_cli,
                nom_cli:editData.cliente.nom_cli,
                ape_cli:editData.cliente.ape_cli,
                nacion_cli:editData.cliente.nacion_cli,
                fecha_naci_cli:editData.cliente.fecha_naci_cli,
                lugar_naci_cli:editData.cliente.lugar_naci_cli,
                tel_pers:editData.cliente.tel_pers,
                cel_pers:editData.cliente.cel_pers,
                email_pers:editData.cliente.email_pers,
                edad_pers:editData.cliente.edad_pers,
                estatura_cli:editData.cliente.estatura_cli,
                peso_cli:editData.cliente.peso_cli,
                parroq_cli:editData.cliente.parroq_cli,
                calle_princ_pers:editData.cliente.calle_princ_pers,
                calle_secun_pers:editData.cliente.calle_secun_pers,
                sexo_cli:editData.cliente.sexo_cli,
                peso_cli: editData.cliente.peso_cli,
                estado_civil_pers:editData.cliente.estado_civil_pers,
                id_ciud:editData.cliente.id_ciud});

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

            const direccion= await ClientesFun.buscarDireccionCliente(editData.cliente.id_ciud,navigate)

            setSelectedPais({value:direccion[0].id_pais,label:direccion[0].nom_pais});
            setSelectedProvincia({value:direccion[0].id_provin,label:direccion[0].nom_provin});
            setSelectedCiudad({value:direccion[0].id_ciud,label:direccion[0].nom_ciud});
                
            const apiProvincia= await ClientesFun.traerProvincias(direccion[0].id_pais,navigate);
            const apiCiudad= await ClientesFun.traerCiudades(direccion[0].id_provin,navigate);
            const apiPais= await ClientesFun.traerPaises(navigate);
            setPais(apiPais.rows)
            setProvincia(apiProvincia);
            setCiudad(apiCiudad);

        setFormularioEdit({...formularioEdit,
            id_pers:editData.cliente.id_pers,
            cedr_cli:editData.cliente.cedr_cli,
            tipo_cedr_cli:editData.cliente.tipo_cedr_cli,
            nom_cli:editData.cliente.nom_cli,
            ape_cli:editData.cliente.ape_cli,
            nacion_cli:editData.cliente.nacion_cli,
            fecha_naci_cli:editData.cliente.fecha_naci_cli,
            lugar_naci_cli:editData.cliente.lugar_naci_cli,
            tel_pers:editData.cliente.tel_pers,
            cel_pers:editData.cliente.cel_pers,
            email_pers:editData.cliente.email_pers,
            edad_pers:editData.cliente.edad_pers,
            estatura_cli:editData.cliente.estatura_cli,
            peso_cli:editData.cliente.peso_cli,
            parroq_cli:editData.cliente.parroq_cli,
            calle_princ_pers:editData.cliente.calle_princ_pers,
            calle_secun_pers:editData.cliente.calle_secun_pers,
            sexo_cli:editData.cliente.sexo_cli,
            peso_cli: editData.cliente.peso_cli,
            estado_civil_pers:editData.cliente.estado_civil_pers,
            id_ciud:editData.cliente.id_ciud});

        }
        const activarChecks=(id)=>{
        document.getElementById(id).checked = true;
        }
        cargarPais();
     },[]);

    const cargarProvincia = async (val)=>{
        setSelectedProvincia(null); 
        setSelectedCiudad(null);    
        setProvincia([]);           
        setCiudad([]);              
        const apiProvincia= await ClientesFun.traerProvincias(val.value,navigate);
        setProvincia(apiProvincia);
    }

    const cargarCiudad = async (val)=>{
        setSelectedCiudad(null);
        setCiudad([]);
        const apiCiudad= await ClientesFun.traerCiudades(val.value,navigate);
        setCiudad(apiCiudad);
    }
    const agregarClaveFormulario  =(e)=>{
        setFormulario({...formulario,[e.target.name]:e.target.value})

    }

    const chechkSexo = (event) => {
        const { id } = event.target;
        document.getElementById("masculino").checked = false;
        document.getElementById("femenino").checked = false;
        document.getElementById(id).checked = true;

        setFormulario({...formulario,sexo_cli:document.getElementById(id).name})
    };

    const chechkTipoIdentificacion = (event) => {
        const { id } = event.target;
        document.getElementById("cedula").checked = false;
        document.getElementById("pasaporte").checked = false;
        document.getElementById(id).checked = true;
        console.log (document.getElementById(id).id)
        setFormulario({...formulario,tipo_cedr_cli:document.getElementById(id).id})
    };

    const chechkEstadoCivil= (event) => {
        const { id } = event.target;
        document.getElementById("soltero").checked = false;
        document.getElementById("divorciado").checked = false;
        document.getElementById("viudo").checked = false;
        document.getElementById("casado").checked = false;
        document.getElementById("unionLibre").checked = false;
        document.getElementById(id).checked = true;
        setFormulario({...formulario,estado_civil_pers:document.getElementById(id).id})


    };

    const chechkTipoPeso= (event) => {
        const peso= document.getElementById("peso_cli").value;
        if (peso=='') {
            toast.error("Ingrese el peso ");
            document.getElementById("lb").checked = false;
            document.getElementById("kg").checked = false;
        }else{
        const { id } = event.target;
        document.getElementById("lb").checked = false;
        document.getElementById("kg").checked = false;
        document.getElementById(id).checked = true;
        const medida=" "+document.getElementById(id).id;
        setFormulario({...formulario,peso_cli:(peso+medida)})
    }

    };
    
    const textPeso =(e)=>{
        let peso =e.target.value;
        if (peso=='') {
            document.getElementById("lb").checked = false;
            document.getElementById("kg").checked = false;
            setFormulario({...formulario,peso_cli:''})
        }
    }

    const cambiarEstadoCliente= async ()=>{
        swal.fire({
            title:"⚠️ <label>Advertencia</label>",
            text:"Desea desactivar al cliente ",
            showDenyButton:true,
            denyButtonText:"No",
            confirmButtonText:"Si"
        }).then(async(respuesta)=>{
            if (respuesta.isConfirmed) {
                const act=await ClientesFun.actualizarEstadoCliente(formulario,nacion_cli)
                swal.fire({
                    title:"<label>Exito</label>",
                    text:"Cliente desactivado",
                    timer:3500,
                })
                mostrarSeccion("clientes")
            }
        });
    }

    const guardarCliente = async()=>{
        const verf=verificacionCambios();
          if (!verf) {
            toast.error("No se ha realizado  ningun cambio");
          } else {
            swal.fire({
                title:"<label>Confirmacion</label>",
                text:"Desea aplicar los cambios",
                showDenyButton:true,
                denyButtonText:"No",
                confirmButtonText:"Si"
            }).then(async(respuesta)=>{
                if (respuesta.isConfirmed) {
                    const res= await ClientesFun.actualizarCliente(formulario,navigate);
                     swal.fire({
                                title:"<label>Exito</label>",
                                text:"Informacion del cliente acrualizada",
                                timer:3500,
                            })
                    mostrarSeccion("clientes")
                }
            });
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
        if (verificacionCambios) {
            swal.fire({
                title:"⚠️ <label>Advertencia</label>",
                text:"Desea descartar los cambios realizados",
                showDenyButton:true,
                denyButtonText:"No",
                confirmButtonText:"Si"
            }).then(respuesta=>{
                if (respuesta.isConfirmed) {
                    mostrarSeccion("clientes")
                }
            });
        }else{
            mostrarSeccion("clientes")
        }
    };

    

    return(
        <div className={styles.container}> {/* Aplica el contenedor principal */}
        <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
        <div>
            <h3>Editar Cliente</h3> <button onClick={cambiarEstadoCliente}>Desactivación</button> </div>
            <div className={styles.formRow}> {/* Filas para agrupar elementos */}
                <div className={styles.formGroup}>
                    <label htmlFor="">Apellidos </label>
                    <input type="text" name="ape_cli" id="ape_cli" placeholder="Ingrese los apellidos"
                     onChange={(e)=>{agregarClaveFormulario(e); setApe_cli(e.target.value)}} value={ape_cli} />
                </div>
                
                <div className={styles.formGroup}>
                    <label htmlFor="">Nombre (s) </label>
                    <input type="text" name="nom_cli" id="nom_cli" placeholder="Ingrese los nombres" 
                    onChange={(e)=>{agregarClaveFormulario(e); setNom_cli(e.target.value)}} value={nom_cli} />
                </div>
            </div>
            
            <div className={styles.formGroup}>
            <div className={styles.formGroup}>
                    <label htmlFor="">nacionalidad </label>
                    <input type="text" name="nacion_cli" id="nacion_cli" placeholder="Ingrese la nacionalidad" 
                    onChange={(e)=>{agregarClaveFormulario(e); setNacion_cli(e.target.value)}} value={nacion_cli}/>
                </div>
                <label htmlFor="">tipo de identificacion </label>
                <div className={styles.identificationType}>
                    <input type="checkbox" id="cedula" name="cedula" onChange={chechkTipoIdentificacion}/> <label htmlFor="cedula">Cédula</label>
                    <input type="checkbox" id="pasaporte" name="pasaporte" onChange={chechkTipoIdentificacion}/> <label htmlFor="pasaporte">Pasaporte</label>
                </div>
            </div>
            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="">Número de Identificación </label>
                    <input type="text" name="cedr_cli" id="cedr_cli" placeholder="Ingrese ID"
                     onChange={(e)=>{agregarClaveFormulario(e); setCedr_cli(e.target.value)}} value={cedr_cli}/>
                </div>
            </div>
            <div className={styles.formRow}>
                
                <div className={styles.formGroup}>
                    <label htmlFor="">Fecha de Nacimiento </label>
                    <div className={styles.dateGroup}>
                        <input type="date"  name="fecha_naci_cli" id="fecha_naci_cli"  
                        onChange={(e)=>{agregarClaveFormulario(e); setFecha_naci_cli(e.target.value)}} value={fecha_naci_cli} /> 
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="">Lugar de Nacimiento </label>
                    <input type="text" name="lugar_naci_cli" id="lugar_naci_cli" placeholder="Ingrese lugar de Nacimiento" 
                    onChange={(e)=>{agregarClaveFormulario(e); setLugar_naci_cli(e.target.value)}} value={lugar_naci_cli}/>
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="">Telefono fijo </label>
                    <input type="text"  name="tel_pers" id="tel_pers" placeholder="Ingrese telefono convencional/fijo" 
                    onChange={(e)=>{agregarClaveFormulario(e); setTel_pers(e.target.value)}} value={tel_pers}/>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="">Celular </label>
                    <div className={styles.dateGroup}>
                        <input type="text" name="cel_pers" id="cel_pers" placeholder="Ingrese numero de Celular"
                         onChange={(e)=>{agregarClaveFormulario(e); setCel_pers(e.target.value)}} value={cel_pers}/> 
                    </div>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="">correo electronico </label>
                    <div className={styles.dateGroup}>
                        <input type="text"  name="email_pers" id="email_pers" placeholder="Ingrese correo electronico" 
                        onChange={(e)=>{agregarClaveFormulario(e); setEmail_pers(e.target.value)}} value={email_pers}/> 
                    </div>
                </div>
            </div>

            <div className={styles.formRow}>
                <div className={styles.formGroup}>
                    <label htmlFor="">Edad</label>
                    <input type="text" name="edad_pers" id="edad_pers" placeholder="Ingrese la edad" 
                    onChange={(e)=>{agregarClaveFormulario(e); setEdad_pers(e.target.value)}} value={edad_pers}/>
                </div>
                <div className={styles.sexGroup}>
                    <label htmlFor="">Sexo:</label>
                    <input type="checkbox" id="masculino" name="masculino" onChange={chechkSexo}/> <label htmlFor="masculino">M</label>
                    <input type="checkbox" id="femenino" name="femenino" onChange={chechkSexo} /> <label htmlFor="femenino">F</label>
                </div>
                <div className={styles.civilStatusGroup}>
                    <label htmlFor="">Estado Civil:</label>
                    <input type="checkbox" id="soltero" onChange={chechkEstadoCivil}/> <label htmlFor="soltero">Soltero</label>
                    <input type="checkbox" id="divorciado" onChange={chechkEstadoCivil}/> <label htmlFor="divorciado">Divorciado</label>
                    <input type="checkbox" id="viudo" onChange={chechkEstadoCivil}/> <label htmlFor="viudo">Viudo</label>
                    <input type="checkbox" id="casado" onChange={chechkEstadoCivil}/> <label htmlFor="casado">Casado</label>
                    <input type="checkbox" id="unionLibre" onChange={chechkEstadoCivil}/> <label htmlFor="unionLibre">U/Libre</label>
                </div>
            </div>
            <div className={styles.formRow}>
                <div className={styles.heightGroup}>
                    <label htmlFor="">Estatura: </label>
                    <input type="text" name="estatura_cli" id="estatura_cli" placeholder="Ingrese la altura" 
                    onChange={(e)=>{agregarClaveFormulario(e); setEstatura_cli(e.target.value)}} value={estatura_cli} /> <label htmlFor="">cm</label>
                </div>
                <div className={styles.weightGroup}>
                    <label htmlFor="">Peso: </label>
                    <input type="text" name="peso_cli" id="peso_cli" placeholder="Ingrese el peso"  
                    onChange={ (e)=>{textPeso(e); setPeso_cli(e.target.value)}} value={peso_cli}/> 
                    <input type="checkbox" id="lb" onChange={chechkTipoPeso}/> <label htmlFor="libras">Lb</label>
                    <input type="checkbox" id="kg" onChange={chechkTipoPeso} /> <label htmlFor="kilogramos">kg </label>
                </div>
            </div>
            <div className={styles.formRow}> {/* Filas para agrupar elementos */}
            <div>
            <label htmlFor="">Pais</label>
                <Select
                options={Array.isArray(pais) ? pais.map((r) => ({
                    value: r.id_pais,
                    label: r.nom_pais,
                })) : []} // Si `pais` no es un array, pasaré un array vacío
                placeholder="Seleccione el pais"
                onChange={(e) => {
                    setSelectedPais(e);
                    cargarProvincia(e);
                    setFormulario({...formulario,id_ciud:''});
                }}
                value={selectedPais}
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
                    setFormulario({...formulario,id_ciud:''});
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
                    setFormulario({...formulario,id_ciud:e.value});
                }}
                value={selectedCiudad}
                />
            </div>
                <div className={styles.formGroup}>
                    <label htmlFor="">Parroquia </label>
                    <input type="text"  name="parroq_cli" id="parroq_cli" placeholder="Ingrese la parroquia" 
                    onChange={(e)=>{agregarClaveFormulario(e); setParroq_cli(e.target.value)}} value={parroq_cli}/>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="">Calle Principal </label>
                    <input type="text"  name="calle_princ_pers" id="calle_princ_pers" placeholder="Ingrese la calle Principal" 
                    onChange={(e)=>{agregarClaveFormulario(e); setCalle_princ_pers(e.target.value)}} value={calle_princ_pers}/>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="">Calle Secundaria </label>
                    <input type="text" name="calle_secun_pers" id="calle_secun_pers" placeholder="Ingrese la calle Secundaria" 
                    onChange={(e)=>{agregarClaveFormulario(e); setCalle_secun_pers(e.target.value)}} value={calle_secun_pers} />
                </div>
            </div>
            <div>
            <button onClick={guardarCliente}>Editar </button>
            <button  onClick={cancelar}> cancelar</button>
            </div>
            

        </div>
    );
}

export default EditarClientes;