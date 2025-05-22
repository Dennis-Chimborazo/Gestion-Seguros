import React, {useEffect,useState} from "react";
import { useNavigate,useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import ClientesFun from "./ClientesFun";
import { FcClearFilters,FcSupport,FcFinePrint } from "react-icons/fc";
import CargarTablas from "../cargando/CargarTablas";
import InfoCard from "../cargando/InfoCards";


export function Clientes({ mostrarSeccion }){
    const navigate= useNavigate();
    const location = useLocation();
    const user = location.state?.user; // accedemos al usuario
    const [clientes, setClientes]= useState ();
    const [filtroCli, setFiltroCli]= useState ();
    const [loading, setLoading] = useState(true); 

    useEffect(()=>{
        const traterClientes=async () => {
            try {
                const dataClientes = await ClientesFun.obtenerCliente(navigate);
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
            name: "Opciones", cell: (row,index) =>
            (<div>
              <FcFinePrint size={25} 
               data-testid={`icono-cliente-${index}`}
               onClick={()=>EditarCliente(row)}/>
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

    const EditarCliente= (row)=>{
        localStorage.setItem("edit", JSON.stringify({
            edit: true,
            cliente: row
          }));
          
        mostrarSeccion("EditarCliente");

    }

    return(
        <div>
            <form action="" method="get">
                <div>
                     <h2>Clientes </h2>
                    <div>
                        <label htmlFor=""> Buscar</label>
                        <input type="text" id="buscar" name="buscar" placeholder="Ingrese numero de cedula" onChange={filtrarClientes} />
                        <FcClearFilters size={25}  onClick={borrarFiltro}/>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '20px 0' }}>
                            <InfoCard
                            text="Nuevo Cliente"
                            color="#00AEEF" // Color azul de la imagen
                            onClick={() => mostrarSeccion('crearClientes')}
                            />
                            <InfoCard
                            text="Validaciones pendientes"
                            color="#4CAF50" // Color verde de la imagen
                            onClick={() => mostrarSeccion('clientePendiente')}
                            />
                        </div>
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
            </div>
    );
}
export default Clientes;