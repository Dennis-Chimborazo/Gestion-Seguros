import React, {useEffect,useState} from "react";
import { useNavigate,useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import GestionContratacionFun from "./GestionContratacionFun";
import { FcClearFilters,FcSupport,FcFinePrint } from "react-icons/fc";
import CargarTablas from "../cargando/CargarTablas";


export function GestionContratacion({ mostrarSeccion }){
    const navigate= useNavigate();
    const location = useLocation();
    const user = location.state?.user; // accedemos al usuario
    const [listaSeguros, setListaSeguros]= useState ();
    const [loading,setLoading]= useState(true)

    useEffect(()=>{
        const traterSeguros=async () => {
            try {
                const dataSeguro = await GestionContratacionFun.traerSeguros(navigate);
            setListaSeguros(dataSeguro.rows);
            } catch (error) {
                console.log('Ha ocurrido un error: '+error)
            }finally{
                setLoading(false)
            }
        }
        traterSeguros();
       
    },[]);

    const columlistSeguro=[
        {name:"N. Seguro",selector:row=>row.id_seguro},
        {name:"Titular ",selector:row=>row.cedr_cli},
        {name:"Nombre",selector:row=>row.nom_cli},   
        {name:"Apellido",selector:row=>row.ape_cli},
        {name:"Seguro",selector:row=>row.nom_tip_seg},
        {name:"Valor anual",selector:row=>row.pago_tip_seg},   
        {name:"Tipo de pago",selector:row=>row.tiempo_seguro},   
        {name:"Valor a pagar",selector:row=>row.monto_seguro},   
    ];

    return(
        <div>
            <form action="" method="">
               <h2>Gestion Contratacion </h2>
                    <div>
                        <label htmlFor=""> Buscar</label>
                        <input type="text" id="buscar" name="buscar" placeholder="Ingrese Codigo del seguro"  />
                         <FcClearFilters size={25} />
                        <label htmlFor=""> Nuevo seguro </label>
                        <button onClick={() => mostrarSeccion("CrearContratacion")}>Crear</button>
                         </div>
                         {loading? (<CargarTablas />):
                         <DataTable 
                            pagination
                            paginationPerPage={20}
                            columns={columlistSeguro} 
                            data={listaSeguros}
                            noDataComponent="No ha selecionado ningun Seguro"
                            persistTableHead >
                            </DataTable> }
            </form>
            </div>
    );
}
export default GestionContratacion;