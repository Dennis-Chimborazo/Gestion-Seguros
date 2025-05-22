import React, {useEffect,useState} from "react";
import { useNavigate,useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import ClientesFun from "./ClientesFun";
import { FcClearFilters } from "react-icons/fc";
import { TfiEmail } from "react-icons/tfi";
import CargarTablas from "../cargando/CargarTablas";
import ModalReenvioValidacion from "./ModalReenvioValidacion";
import stylesmod from "../estilos/modalDependientes.module.css";

export function ValidacionCliente({ mostrarSeccion }){
    const navigate= useNavigate();
    const [clientes, setClientes]= useState ();
    const [filtroCli, setFiltroCli]= useState ();
    const [loading, setLoading] = useState(true); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const cerrarModal = () => setIsModalOpen(false);
    const abrirModal = () => setIsModalOpen(true);
    const [formulario,setFormulario]=useState({})
    useEffect(()=>{
        const traterClientes=async () => {
            try {
                const dataClientes = await ClientesFun.obtenerClientePeniente(navigate);
                setFiltroCli(dataClientes.rows);
                setClientes(dataClientes.rows);
            } catch (error) {
                console.log("Ha ocurrido un error");
            } finally{
                setLoading(false)
            }
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
            name: "Reenviar Correo", cell: (row) =>
            (<div>
              <TfiEmail size={25} onClick={() => reenviarCorreo(row)} data-testid={`reenviar-${row.cedr_cli}`} />
            </div>
            ), ignoreRowClick: true
          },
    ];

    const filtrarClientes = (e) => {
        if (e.target.value !== '') {
            const filtro = clientes.filter((a) => 
                a.cedr_cli && a.cedr_cli.startsWith(e.target.value)
            );
            setFiltroCli(filtro);
        }
    };
    const borrarFiltro=()=>{
        setFiltroCli(clientes);
    }
    const reenviarCorreo= (row)=>{
        localStorage.setItem("editCorreo", JSON.stringify({
            edit: true,
            cliente: row
          }));
          abrirModal()
    }
   

    return(
        <div>
            <form action="" method="get">
                <div>
                     <h2>Vadicacion de cuenta Pendiente </h2>
                    <div>
                        <label htmlFor=""> Buscar</label>
                        <input type="text" id="buscar" name="buscar" placeholder="Ingrese numero de cedula" onChange={filtrarClientes} />
                        <FcClearFilters size={25}  onClick={borrarFiltro}/>
                        </div>
                         </div>
                         {loading?(<CargarTablas />):
                            <DataTable 
                            pagination
                            paginationPerPage={20}
                            columns={columasClientes} 
                            data={filtroCli}
                            noDataComponent="No ha selecionado ninguna actividad"
                            persistTableHead >
                            </DataTable>}
            </form>

            {isModalOpen && (
                            <div className={stylesmod.overlay}>
                                <div className={stylesmod.modal}>
                                <button className={stylesmod.closeBtn} onClick={cerrarModal}>X</button>
                                <ModalReenvioValidacion cerrarModal={cerrarModal} datosCliente={formulario} mostrarSeccion={mostrarSeccion} />
                                </div>
                            </div>
                            )}
            </div>
    );
}
export default ValidacionCliente;