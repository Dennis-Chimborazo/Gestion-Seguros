import React, {useEffect,useState} from "react";
import { useNavigate,useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import SegurosFun from "./SegurosFun";
import { FcClearFilters,FcSupport,FcFinePrint } from "react-icons/fc";
import ModalDependientes from "./ModalDependientes";
import styles from "../estilos/modalDependientes.module.css";

export function CrearSeguro({ mostrarSeccion }){
    const navigate= useNavigate();
    const location = useLocation();
    const user = location.state?.user; // accedemos al usuario
    const[cuentaBancaria,setCuentaBancaria]=useState({tipo_cuent_Ban:'',nom_cuent_Ban:'',mun_cuent_Ban:'',id_pers:''});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const abrirModal = () => setIsModalOpen(true);
    const cerrarModal = () => setIsModalOpen(false);
    useEffect(()=>{
        const listDepen = JSON.parse(localStorage.getItem("dependiente"));
        if (listDepen!=null) {
            
        }

    },[]);


const datosDepen=[{cedr_cli:"1",nom_cli:"Hola",ape_cli:"Holafsd",tel_pers:"534",email_pers:"Hola@hmail",cel_pers:"3545"}]
  const columnasDepencientes=[
    {name:"Cedula/Pasaporte",selector:row=>row.cedr_cli},
    {name:"Nombre",selector:row=>row.nom_cli},
    {name:"Apellido",selector:row=>row.ape_cli},
    {name:"Telefono",selector:row=>row.tel_pers},   
    {name:"Celular",selector:row=>row.cel_pers},
    {name:"Correo",selector:row=>row.email_pers},
];

    return(
        <div>
            <form action="" method="">
               <h2> crear Seguros </h2>
                    <div>
                        <h2>titular </h2>
                        <label htmlFor=""> cedula </label>
                        <input type="text" name="" id="" />
                        <label htmlFor=""> Nombre </label>
                        <input type="text" name="" id="" />
                        <label htmlFor=""> Apellido </label>
                        <input type="text" name="" id="" />
                    </div>

                    <div>
                        <h2>dependientes</h2>
                        <button type="button" onClick={abrirModal}>Agregar</button>
                            <DataTable 
                            pagination
                            paginationPerPage={6}
                            columns={columnasDepencientes} 
                            data={datosDepen}
                            noDataComponent="No ha selecionado ningun dependiente"
                            persistTableHead >
                            </DataTable>
                   </div>

                   <div>
                        <h2>Condiciones medicas</h2>
                        <div>
                            <label htmlFor="">Nombre de la persona</label>
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                        </div>
                        <br />

                        <div>
                            <label htmlFor="">Diagnóstico</label>
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                        </div>
                        <br />
                        <div>
                            <label htmlFor="">Fecha desde</label>
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                        </div>
                        <br />

                        <div>
                            <label htmlFor="">Fecha hasta</label>
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                            <input type="text" />
                        </div>

                   </div>

                   <div>
                        <h2>Datos Facturacion</h2>
                        {/* Datos personales */}
      <div>
        <label>Nombres</label>
        <input type="text" />

        <label>Apellidos</label>
        <input type="text" />

        <label>Lugar de nacimiento</label>
        <input type="text" />

        <label>Fecha de nacimiento</label>
        <input type="date" />

        <label>Edad</label>
        <input type="text" />

        <label>Parentesco</label>
        <input type="text" />
      </div>

      {/* Identificación */}
      <div>
        <label>Tipo de identificación:</label><br />
        <input type="checkbox" id="cedula" />
        <label htmlFor="cedula">Cédula</label>
        <input type="checkbox" id="pasaporte" />
        <label htmlFor="pasaporte">Pasaporte</label>

        <label>Número de identificación</label>
        <input type="text" />
      </div>

      {/* Sexo */}
      <div>
        <label>Sexo:</label><br />
        <input type="checkbox" id="sexoM" />
        <label htmlFor="sexoM">M</label>
        <input type="checkbox" id="sexoF" />
        <label htmlFor="sexoF">F</label>
      </div>

      {/* Estatura y peso */}
      <div>
        <label>Estatura</label>
        <input type="text" />
        <label>cm</label>
      </div>

      <div>
        <label>Peso</label>
        <input type="text" />
        <input type="checkbox" id="pesoLb" />
        <label htmlFor="pesoLb">lb</label>
        <input type="checkbox" id="pesoKg" />
        <label htmlFor="pesoKg">kg</label>
      </div>

      {/* Botones */}
      <div>
        <button type="button" onClick={cerrarModal}>Cerrar</button>
        <button type="button">Guardar</button>
      </div>


                   </div>
                   <div>
                    <h2>Solicitud para reembolso a traves de transferecia bancaria</h2>
                    <label htmlFor="">tipo de cuenta</label>

                    <div>
                        <input type="checkbox" name="" id="" />
                        <label htmlFor="">Ahorros</label>
                        <input type="checkbox" name="" id="" />
                        <label htmlFor="">Corriente</label>
                    </div>

                    <label htmlFor="">Banco</label>
                    <input type="text" />
                    <label htmlFor="">Cuenta No.</label>
                    <input type="text" />


                   </div>



                   <div>
                    <h2>Firma</h2>
                    <label htmlFor="">Ciudad</label>
                    <input type="text" />
                    <label htmlFor="">Dia</label>
                    <input type="text" />
                    <label htmlFor="">Mes</label>
                    <input type="text" />
                    <label htmlFor="">Anio</label>
                    <input type="text" />
                    <label htmlFor="">Firma</label>
                    <input type="text" />
                   </div>



                   <div>
                    <h2>Datos de agencia</h2>
                    <label htmlFor="">Nombre del Agente</label>
                    <input type="text" />
                    <label htmlFor="">Correo del Ejecutivo/Agente</label>
                    <input type="text" />
                    <label htmlFor="">Nombres de la Agencia/Agente de Seguros</label>
                    <input type="text" />

                    <label htmlFor="">Firma del Ejecutivo/Agente</label>
                    <input type="text" />

                   </div>



                   <div>
                    <h2>Para uso exclusivo de la empresa</h2>
                    <label htmlFor="">Ciudad</label>
                    <input type="text" />
                    <label htmlFor="">Dia</label>
                    <input type="text" />
                    <label htmlFor="">Mes</label>
                    <input type="text" />
                    <label htmlFor="">Anio</label>
                    <input type="text" />
                    <label htmlFor="">Firma del Ejecutivo/Agente</label>
                    <input type="text" />
                    <label htmlFor="">Nombre</label>
                    <input type="text" /> 
                    <label htmlFor="">Cargo</label>
                    <input type="text" />
                   </div>

                   {isModalOpen && (
                    <div className={styles.overlay}>
                        <div className={styles.modal}>
                        <button className={styles.closeBtn} onClick={cerrarModal}>X</button>
                        <ModalDependientes cerrarModal={cerrarModal} />
                        </div>
                    </div>
                    )}


                 
            </form>
            </div>
    );
}
export default CrearSeguro;