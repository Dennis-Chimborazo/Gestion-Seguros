import React, {useEffect,useState} from "react";
import DataTable from "react-data-table-component";
import { useNavigate,useLocation } from "react-router-dom";
import {Toaster,toast} from "sonner";
import swal from "sweetalert2";

import ModalDependientes from "./ModalDependientes";
import SegurosFun from "./SegurosFun";
import ClientesFun from "../clientes/ClientesFun";
import styles from "../estilos/modalDependientes.module.css";




export function CrearSeguro({ mostrarSeccion }){
    const navigate= useNavigate();
    const location = useLocation();
    const user = location.state?.user; // accedemos al usuario
    const[listDependientes,setListDependientes]=useState([]);
    const [listcliente,setListCliente]= useState([]);
    const [clienteSeguro,setClienteSeguro]= useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const abrirModal = () => setIsModalOpen(true);
    const cerrarModal = () => setIsModalOpen(false);
        
    const [datosAgencia,setDatosAgencia]=useState({nom_trabj_dat_agencia:'',nom_agencia_dat_agencia:'',email_dat_agencia:'',
          firma_dat_agencia:''})

    const [nuevoSeguro,setNuevoSeguro]=useState({ciud_seguro:'',dia_seguro:'',mes_seguro:'',
          anio_seguro:'',firma_seguro:'',id_pers:''})
              
    const [exclusivoEmpresa,setExclusivoEmpresa]=useState({ciud_excl_empresa:'',dia_excl_empresa:'',mes_excl_empresa:'',
          anio_excl_empresa:'',firma_excl_empresa:'',nombre_excl_empresa:'',cargo_excl_empresa:''})
      
    const [personaFac,setPersonaFac]=useState({cedr_pers_fac:'',razon_pers_fac:'',tipo_pers_fac:'',
          nacion_pers_fac:'',nom_pers_fac:'',ape_pers_fac:'',tel_pers_fac:'',cel_pers_fac:'',
          email_pers_fac:'',direc_pers_fac:'',parent_pers_fac:''})
       
    const[cuentaBancaria,setCuentaBancaria]=useState({tipo_cuent_Ban:'',nom_cuent_Ban:'',mun_cuent_Ban:''});
    const [listoEnvio, setListoEnvio] = useState(false);


    useEffect(()=>{
      const clientes=async ()=>{
        const res= await ClientesFun.obtenerCliente(navigate);
        console.log(res.rows)
        setListCliente(res.rows);
      }
      clientes();

    },[]);

    useEffect(()=>{
      const crearNuevoSeguro=async()=>{
        console.log("-----------------------------");
        console.log(nuevoSeguro)
      console.log("-----------------------------");
      const api= await SegurosFun.guardarSeguro(nuevoSeguro,navigate)
      if (api) {
        
      }
      console.log(api);
      }

      if (listoEnvio) {
        crearNuevoSeguro();
        swal.fire({
                    title:"<label>Exito</label>",
                    text:"Se creo un nuevo Seguro",
                    timer:3500, })
        setListoEnvio(false)
        mostrarSeccion("seguros")

      }

    },[listoEnvio]);

  const columnasDepencientes=[
    {name:"Cedula/Pasaporte",selector:row=>row.cedr_depen},
    {name:"Nombre",selector:row=>row.nom_depen},
    {name:"Apellido",selector:row=>row.ape_depen},
    {name:"Telefono",selector:row=>row.ape_depen}, 
    {name:"Sexo",selector:row=>row.sexo_depen},
    {name:"Parentesco",selector:row=>row.parent_depen},
    {name:"Condicion Medica",selector:row=>row.boolDis},
    {name:"Discapacidad",selector:row=>row.boolCond},
];

const buscarCliente= async(e)=>{
  e.preventDefault();
  const filtro = listcliente.filter((a)=>a.cedr_cli===document.getElementById("titular").value );
  if (filtro.length===0) {
    toast.error("Nose encontro a ningun cliente")
  }else{
    setClienteSeguro(filtro)
    setNuevoSeguro({...nuevoSeguro,id_pers: filtro[0].id_pers})
  }
}
  const asignarValoresDatosAgencia=(e)=>{
 setDatosAgencia({...datosAgencia,[e.target.name]:e.target.value});
  }
  const asignarValoresNuevoSeguro=(e)=>{
    setNuevoSeguro({...nuevoSeguro,[e.target.name]:e.target.value});
  }
 const asignarValoresExclusivoEmpresa=(e)=>{
   setExclusivoEmpresa({...exclusivoEmpresa,[e.target.name]:e.target.value});
  }
  const asignarValoresPersonaFact=(e)=>{
    setPersonaFac({...personaFac,[e.target.name]:e.target.value});
  }
  const asignarValoresCuentaBanco=(e)=>{
    setCuentaBancaria({...cuentaBancaria,[e.target.name]:e.target.value});
  }

  const checkTipoIdentificaicon = (event) => {
    const { id } = event.target;
    document.getElementById("cedula").checked = false;
    document.getElementById("ruc").checked = false;
    document.getElementById("otro").checked = false;

    document.getElementById(id).checked = true;
    setPersonaFac({...personaFac,tipo_pers_fac:id})
};

const checktipoBanco = (event) => {
  const { id } = event.target;
  document.getElementById("ahorros").checked = false;
  document.getElementById("corriente").checked = false;

  document.getElementById(id).checked = true;
  setCuentaBancaria({...cuentaBancaria,tipo_cuent_Ban:id})
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
  if (id==='otroParen') {
  setPersonaFac({...personaFac,parent_pers_fac:''})
  }else{
  setPersonaFac({...personaFac,parent_pers_fac:id})
  }
};

const textParentesco=(e)=>{
  document.getElementById("padre").checked = false;
  document.getElementById("madre").checked = false;
  document.getElementById("hijo").checked = false;
  document.getElementById("conyuge").checked = false;
  document.getElementById("empleador").checked = false;
  document.getElementById("otroParen").checked = true;
  setPersonaFac({...personaFac,parent_pers_fac:e.target.value})

}

const guardarSeguro= async(e)=>{

  e.preventDefault();

  console.log(listDependientes);
  
  /*
  const agencia= await SegurosFun.guardarAgencia(datosAgencia,navigate)
  const exclusi= await SegurosFun.guardarExclusivoEmpresa(exclusivoEmpresa,navigate)
  const personFac= await SegurosFun.guardarPersonaFact(personaFac,navigate)
  const cuentaBan= await SegurosFun.guardarCuentaBanco(cuentaBancaria,navigate)
    setNuevoSeguro({
      ...nuevoSeguro,
      id_cuent_Ban: cuentaBan.id_cuent_Ban,
      id_pers_fac: personFac.id_pers_fac,
      id_excl_empresa: exclusi.id_excl_empresa,
      id_dat_agencia: agencia.id_dat_agencia
    });
    setListoEnvio(true);
    */
}

    return(
        <div>
            <form action="" method="">
                      <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
               <h2> crear Seguros </h2>
                    <div>
                        <h2>titular </h2> 
                        <label htmlFor=""> Tilular </label>
                        <input type="text" name="titular" id="titular" placeholder="Ingrese cedula del cliente" />
                        <button onClick={buscarCliente}>Buscar</button>
                        <label htmlFor=""> cedula </label>
                        <input type="text" name="" id="" value={clienteSeguro[0]?.cedr_cli || ''}/>
                        <label htmlFor=""> Nombre </label>
                        <input type="text" name="" id=""  value={clienteSeguro[0]?.cedr_cli || ''}/>
                        <label htmlFor=""> Apellido </label>
                        <input type="text" name="" id=""  value={clienteSeguro[0]?.cedr_cli || ''}/>
                    </div>
                    <div>
                        <h2>dependientes</h2>
                        <button type="button" onClick={abrirModal}>Agregar</button>
                            <DataTable 
                            pagination
                            paginationPerPage={6}
                            columns={columnasDepencientes} 
                            data={listDependientes}
                            noDataComponent="No ha selecionado ningun dependiente"
                            persistTableHead >
                            </DataTable>
                   </div>
                   <div>
                        <h2>Datos Facturacion</h2>
                        <div>
                        <label>Tipo de identificación:</label><br />
                        <input type="checkbox" id="cedula" onChange={checkTipoIdentificaicon} />
                        <label htmlFor="cedula">Cédula</label>
                        <input type="checkbox" id="ruc" onChange={checkTipoIdentificaicon}/>
                        <label htmlFor="pasaporte">Ruc</label>
                        <input type="checkbox" id="otro" onChange={checkTipoIdentificaicon}/>
                        <label htmlFor="pasaporte">Otro</label>

                        <label>Número de identificación</label>
                        <input type="text" name="cedr_pers_fac" id="cedr_pers_fac" onChange={asignarValoresPersonaFact}/>
                        <label>Nacionalidad</label>
                        <input type="text"  name="nacion_pers_fac" id="nacion_pers_fac" onChange={asignarValoresPersonaFact}/>

                      </div>
                      <label>Racon social</label>
                        <input type="text"  name="razon_pers_fac" id="razon_pers_fac" onChange={asignarValoresPersonaFact}/>
                      <div>
                        <label>Nombres</label>
                        <input type="text"  name="nom_pers_fac" id="nom_pers_fac" onChange={asignarValoresPersonaFact}/>

                        <label>Apellidos</label>
                        <input type="text"  name="ape_pers_fac" id="ape_pers_fac" onChange={asignarValoresPersonaFact}/>

                        <label>Correo electronico</label>
                        <input type="text"  name="email_pers_fac" id="email_pers_fac" onChange={asignarValoresPersonaFact}/>

                        <label>Direccion domicilio</label>
                        <input type="text"  name="direc_pers_fac" id="direc_pers_fac" onChange={asignarValoresPersonaFact}/>

                        <label>Telefono del domicilio</label>
                        <input type="text"  name="tel_pers_fac" id="tel_pers_fac" onChange={asignarValoresPersonaFact}/>

                        <label>Celular</label>
                        <input type="text"  name="cel_pers_fac" id="cel_pers_fac" onChange={asignarValoresPersonaFact}/>
                        <div>
                          <h4>Parentesco</h4>
                        <label htmlFor="">Padre</label>
                        <input type="checkbox" name="padre" id="padre" onChange={checkParentescoTitular} />
                        <label htmlFor="">Madre</label>
                        <input type="checkbox" name="madre" id="madre" onChange={checkParentescoTitular}/>
                        <label htmlFor="">Hijo</label>
                        <input type="checkbox" name="hijo" id="hijo" onChange={checkParentescoTitular} />
                        <label htmlFor="">Cónyuge</label>
                        <input type="checkbox" name="conyuge" id="conyuge" onChange={checkParentescoTitular}/>
                        <label htmlFor="">Empleador</label>
                        <input type="checkbox" name="empleador" id="empleador" onChange={checkParentescoTitular}/>
                        <label htmlFor="">Otro</label>
                        <input type="checkbox" name="otroParen" id="otroParen" onChange={checkParentescoTitular} />
                        <input type="text" name="otroparentesco" id="otroparentesco" onChange={textParentesco} />
                        </div>
                      </div>
                   </div>
                   <div>
                    <h2>Solicitud para reembolso a traves de transferecia bancaria</h2>
                    <label htmlFor="">tipo de cuenta</label>
                    <div>
                        <input type="checkbox" name="ahorros" id="ahorros" onChange={checktipoBanco} />
                        <label htmlFor="">Ahorros</label>
                        <input type="checkbox" name="corriente" id="corriente"  onChange={checktipoBanco}/>
                        <label htmlFor="">Corriente</label>
                    </div>
                    <label htmlFor="">Banco</label>
                    <input type="text" name="nom_cuent_Ban" id="nom_cuent_Ban" onChange={asignarValoresCuentaBanco}/>
                    <label htmlFor="">Cuenta No.</label>
                    <input type="text" name="mun_cuent_Ban" id="mun_cuent_Ban" onChange={asignarValoresCuentaBanco} />
                   </div>
                   <div>
                    <h2>Firma</h2>
                    <label htmlFor="">Ciudad</label>
                    <input type="text" name="ciud_seguro" id="ciud_seguro" onChange={asignarValoresNuevoSeguro}/>
                    <label htmlFor="" >Dia</label>
                    <input type="text" name="dia_seguro" id="dia_seguro" onChange={asignarValoresNuevoSeguro} />
                    <label htmlFor="">Mes</label>
                    <input type="text" name="mes_seguro" id="mes_seguro" onChange={asignarValoresNuevoSeguro} />
                    <label htmlFor="">Anio</label>
                    <input type="text" name="anio_seguro" id="anio_seguro"onChange={asignarValoresNuevoSeguro} />
                    <label htmlFor="">Firma</label>
                    <input type="text"  name="firma_seguro" id="firma_seguro" onChange={asignarValoresNuevoSeguro}/>
                   </div>
                   <div>
                    <h2>Datos de agencia</h2>
                    <label htmlFor="">Nombre del Agente</label>
                    <input type="text" name="nom_trabj_dat_agencia" id="nom_trabj_dat_agencia" onChange={asignarValoresDatosAgencia}/>
                    <label htmlFor="">Correo del Ejecutivo/Agente</label>
                    <input type="text" name="email_dat_agencia" id="email_dat_agencia" onChange={asignarValoresDatosAgencia} />
                    <label htmlFor="">Nombres de la Agencia/Agente de Seguros</label>
                    <input type="text" name="nom_agencia_dat_agencia" id="nom_agencia_dat_agencia" onChange={asignarValoresDatosAgencia}  />

                    <label htmlFor="">Firma del Ejecutivo/Agente</label>
                    <input type="text" name="firma_dat_agencia" id="firma_dat_agencia" onChange={asignarValoresDatosAgencia} />

                   </div>
                   <div>
                    <h2>Para uso exclusivo de la empresa</h2>
                    <label htmlFor="">Ciudad</label>
                    <input type="text" name="ciud_excl_empresa" id="ciud_excl_empresa" onChange={asignarValoresExclusivoEmpresa}/>
                    <label htmlFor="">Dia</label>
                    <input type="text"  name="dia_excl_empresa" id="dia_excl_empresa" onChange={asignarValoresExclusivoEmpresa}/>
                    <label htmlFor="">Mes</label>
                    <input type="text"  name="mes_excl_empresa" id="mes_excl_empresa" onChange={asignarValoresExclusivoEmpresa}/>
                    <label htmlFor="">Anio</label>
                    <input type="text"  name="anio_excl_empresa" id="anio_excl_empresa" onChange={asignarValoresExclusivoEmpresa}/>
                    <label htmlFor="">Firma del Ejecutivo/Agente</label>
                    <input type="text"  name="firma_excl_empresa" id="firma_excl_empresa" onChange={asignarValoresExclusivoEmpresa}/>
                    <label htmlFor="">Nombre</label>
                    <input type="text" name="nombre_excl_empresa" id=" nombre_excl_empresa" onChange={asignarValoresExclusivoEmpresa}/> 
                    <label htmlFor="">Cargo</label>
                    <input type="text" name="cargo_excl_empresa" id="cargo_excl_empresa" onChange={asignarValoresExclusivoEmpresa}/>
                   </div>
                  <div>
                    <button>Cancelar</button>
                    <button onClick={guardarSeguro}>Guardar</button>

                  </div>
                   {isModalOpen && (
                    <div className={styles.overlay}>
                        <div className={styles.modal}>
                        <button className={styles.closeBtn} onClick={cerrarModal}>X</button>
                        <ModalDependientes cerrarModal={cerrarModal} setListDependientes={setListDependientes} />
                        </div>
                    </div>
                    )}
            </form>
            </div>
    );
}
export default CrearSeguro;