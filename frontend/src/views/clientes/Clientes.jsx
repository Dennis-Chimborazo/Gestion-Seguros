import React, {useEffect,useState} from "react";
import { useNavigate,useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import ClientesFun from "./ClientesFun";
import styles from '../estilos/cliente.module.css';
import { FcClearFilters,FcSupport,FcFinePrint } from "react-icons/fc";


export function Clientes({ mostrarSeccion }){
    const navigate= useNavigate();
    const location = useLocation();
    const user = location.state?.user; // accedemos al usuario
    const [clientes, setClientes]= useState ();
    const [filtroCli, setFiltroCli]= useState ();


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
    const customStyles = {
        header: {
          style: {
            minHeight: '56px',
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#ffffff',
            backgroundColor: '#0077b6',
            
          },
        },
        headRow: {
          style: {
            backgroundColor: '#0077b6',
            borderTop: '1px solid #dddddd',
      
          },
        },
        headCells: {
            style: {
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'capitalize',
              paddingLeft: '8px',
              paddingRight: '8px',
              color: '#ffffff',
            },
          },
        rows: {
          style: {
            backgroundColor: '#ffffff',
            '&:nth-of-type(even)': {
              backgroundColor: '#f9f9f9', // Color alternativo para filas pares
            },
            '&:hover': {
              backgroundColor: '#ffe3e3', // Color al pasar el cursor
            },
          },
        },
        cells: {
          style: {
            paddingLeft: '8px',
            paddingRight: '8px',
          },
        },
        pagination: {
          style: {
            borderTop: '1px solid #dddddd',
            backgroundColor: '#ffffff',
            padding: '8px',
          },
          
        },
      };

    return (
        <div className={styles.container}>
          <h2>Clientes</h2>
          <form className={styles["form-row"]} onSubmit={(e) => e.preventDefault()}>
            <div className={styles["form-group"]}>
              <label htmlFor="buscar">Buscar</label>
              <input
                type="text"
                id="buscar"
                name="buscar"
                placeholder="Ingrese número de cédula"
                onChange={filtrarClientes}
              />
            </div>
    
           
            <FcClearFilters size={25} onClick={borrarFiltro} style={{ cursor: "pointer", marginTop: "30px" }} />
          </form>
          <div className={styles["form-group"]}>
              <button type="button" onClick={() => mostrarSeccion("crearClientes")}>Crear</button>
            </div>
    
          <div className={styles["table-section"]}>
            <DataTable
              pagination
              paginationPerPage={20}
              columns={columasClientes}
              data={filtroCli}
              noDataComponent="No ha seleccionado ninguna actividad"
          customStyles={customStyles}
              persistTableHead

            />
          </div>
        </div>
      );
    }
export default Clientes;