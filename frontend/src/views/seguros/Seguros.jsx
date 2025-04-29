import React, {useEffect,useState} from "react";
import { useNavigate,useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import SegurosFun from "./SegurosFun";
import { FcClearFilters,FcSupport,FcFinePrint } from "react-icons/fc";


export function Seguros({ mostrarSeccion }){
    const navigate= useNavigate();
    const location = useLocation();
    const user = location.state?.user; // accedemos al usuario
    const [clientes, setClientes]= useState ();
    const [filtroCli, setFiltroCli]= useState ();
/*

    useEffect(()=>{
        const traterClientes=async () => {
            const dataClientes = await ClientesFun.obtenerCliente(navigate);
            setFiltroCli(dataClientes.rows);
            setClientes(dataClientes.rows);

        }

        
        traterClientes();
       
    },[]);

    const columasClientes=[
        {name:"Cedula/Pasaporte",selector:row=>row.cedr_cli},
        {name:"Nombre",selector:row=>row.nom_cli},
        {name:"Apellido",selector:row=>row.ape_cli},
        {name:"Telefono",selector:row=>row.tel_pers},   
        {name:"Celular",selector:row=>row.cel_pers},
        {name:"Correo",selector:row=>row.email_pers},
        {
            name: "Opciones", cell: (row) =>
            (<div>
              <FcFinePrint size={25} onClick={()=>EditarCliente(row)}/>
            </div>
            ), ignoreRowClick: true
          },
    ];

    const filtrarClientes =(e)=>{
        if (e.target.value!=='') {
            const filtro = clientes.filter((a)=>a.cedr_cli.startsWith(e.target.value));
            setFiltroCli(filtro)
        }
    }

    const borrarFiltro=()=>{
        setFiltroCli(clientes);
    }

    const EditarCliente= (row)=>{
        localStorage.setItem("edit", JSON.stringify({
            edit: true,
            cliente: row
          }));
          
        mostrarSeccion("EditarCliente");

    } 
        
     <DataTable 
                            pagination
                            paginationPerPage={20}
                            columns={columasClientes} 
                            data={filtroCli}
                            noDataComponent="No ha selecionado ninguna actividad"
                            persistTableHead >
                            </DataTable>
    */

    return(
        <div>
            <form action="" method="">
               <h2>Seguros </h2>
                    <div>
                        <label htmlFor=""> Buscar</label>
                        <input type="text" id="buscar" name="buscar" placeholder="Ingrese Codigo del seguro"  />
                        <label htmlFor=""> Nuevo seguro </label>
                        <button onClick={() => mostrarSeccion("Crearseguro")}>Crear</button>
                         <FcClearFilters size={25} />
                         </div>
                           
            </form>
            </div>
    );
}
export default Seguros;