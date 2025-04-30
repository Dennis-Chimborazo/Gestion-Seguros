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
    const [listaSeguros, setListaSeguros]= useState ();


    useEffect(()=>{
        const traterSeguros=async () => {
            const dataSeguro = await SegurosFun.traerSeguros(navigate);
            setListaSeguros(dataSeguro.rows);
           // setClientes(dataClientes.rows);

        }
        traterSeguros();
       
    },[]);


    const columlistSeguro=[
        {name:"N. Seguro",selector:row=>row.id_seguro},
        {name:"Ciudad",selector:row=>row.ciud_seguro},
        {name:"Mes",selector:row=>row.mes_seguro},
        {name:"Anio",selector:row=>row.anio_seguro},   
       
    ];
/*

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

                         <DataTable 
                            pagination
                            paginationPerPage={20}
                            columns={columlistSeguro} 
                            data={listaSeguros}
                            noDataComponent="No ha selecionado ningun Seguro"
                            persistTableHead >
                            </DataTable>
            </form>
            </div>
    );
}
export default Seguros;