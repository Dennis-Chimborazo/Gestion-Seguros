import React, {useEffect,useState} from "react";
import { useNavigate,useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import GestionContratacionFun from "./GestionContratacionFun";
import { FcClearFilters,FcSupport,FcFinePrint } from "react-icons/fc";
import CargarTablas from "../cargando/CargarTablas";
import "../estilos/GestionContratacion.css";

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
    ];    return(
        <div className="gestion-container">
            <form className="gestion-form" action="" method="">
               <h1 className="gestion-title">Gestión Contratación</h1>
                    <div className="search-controls">
                        <div className="search-group">
                            <label className="search-label" htmlFor="buscar">Buscar</label>
                            <div className="search-input-container">
                                <input className="search-input" type="text" id="buscar" name="buscar" placeholder="Ingrese código del seguro" />
                            </div>
                        </div>
                        <button className="btn-search" type="button">
                            <FcClearFilters size={20} />
                            Limpiar
                        </button>
                        <button className="btn-primary" onClick={() => mostrarSeccion("CrearContratacion")}>
                            Nuevo seguro
                        </button>
                    </div>
                         {loading? (<CargarTablas />):
                         <DataTable 
                            pagination
                            paginationPerPage={20}
                            columns={columlistSeguro} 
                            data={listaSeguros}
                            noDataComponent="No ha seleccionado ningún Seguro"
                            persistTableHead >
                            </DataTable> }
            </form>
            </div>
    );
}
export default GestionContratacion;