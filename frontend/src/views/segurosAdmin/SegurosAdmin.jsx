import React, {useEffect,useState} from "react";
import { useNavigate,useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import SegurosAdminFun from "./SegurosAdminFun";
import { FcClearFilters,FcSupport,FcFinePrint } from "react-icons/fc";


export function SegurosAdmin({ mostrarSeccion }){
    const navigate= useNavigate();
    const location = useLocation();
    const user = location.state?.user; // accedemos al usuario
    const [filtroSeguros, setFiltroSeguros]= useState ();
    const [listaSeguros, setListaSeguros]= useState ();


    useEffect(()=>{
        
        const traterTipoSeguros=async () => {
            const dataSeguro = await SegurosAdminFun.traerTiposSeguros(navigate);
            setListaSeguros(dataSeguro.rows);
            setFiltroSeguros(dataSeguro.rows);
        }
        traterTipoSeguros();
       
    },[]);


    const columlistSeguro=[
        {name:"Nombre ",selector:row=>row.nom_tip_seg},
        {name:"Descripcion",selector:row=>row.descrip_tip_seg},
        {name:"Pago mesual",selector:row=>row.pago_tip_seg},
         {
                    name: "Opciones", cell: (row) =>
                    (<div>
                      <FcFinePrint size={25} onClick={()=>editarSeguro(row)}/>
                    </div>
                    ), ignoreRowClick: true
                  },
    ];
    const editarSeguro =(row)=>{
          localStorage.setItem("editSeguro", JSON.stringify({
            edit: true,
            seguro: row
          }));
          
        mostrarSeccion("EditarSeguroAdmin");
    }
    const filtrarClientes = (e) => {
        if (e.target.value !== '') {
            const filtro = listaSeguros.filter((a) => 
                a.nom_tip_seg && a.nom_tip_seg.startsWith(e.target.value)
            );
            setFiltroSeguros(filtro);
        }
    };

    const borrarFiltro=()=>{
        setFiltroSeguros(listaSeguros);
    }
    

    return(
        <div>
            <form action="" method="">
               <h2>Tipos de Seguros </h2>
                    <div>
                        <label htmlFor=""> Buscar</label>
                        <input type="text" id="buscar" name="buscar" placeholder="Ingrese Codigo del seguro" onChange={filtrarClientes} />
                        <label htmlFor=""> nuevo tipo de seguro </label>
                        <button onClick={() => mostrarSeccion("CrearSeguroAdmin")}>Crear</button>
                         <FcClearFilters size={25} onClick={borrarFiltro} />
                         </div>

                         <DataTable 
                            pagination
                            paginationPerPage={20}
                            columns={columlistSeguro} 
                            data={filtroSeguros}
                            noDataComponent="No ha selecionado ningun Seguro"
                            persistTableHead >
                            </DataTable>
            </form>
            </div>
    );
}
export default SegurosAdmin;