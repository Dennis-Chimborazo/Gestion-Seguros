import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import SegurosAdminFun from "./SegurosAdminFun";
import { FcClearFilters, FcSupport, FcFinePrint } from "react-icons/fc";
import styles from "../estilos/Seguros.module.css"; // Usa tu archivo CSS existente

export function SegurosAdmin({ mostrarSeccion }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.user; // accedemos al usuario
    const [filtroSeguros, setFiltroSeguros] = useState();
    const [listaSeguros, setListaSeguros] = useState();


    useEffect(() => {

        const traterTipoSeguros = async () => {
            const dataSeguro = await SegurosAdminFun.traerTiposSeguros(navigate);
            setListaSeguros(dataSeguro.rows);
            setFiltroSeguros(dataSeguro.rows);
            console.log(dataSeguro);
        }
        traterTipoSeguros();

    }, []);


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

    const borrarFiltro = () => {
        setFiltroSeguros(listaSeguros);
    }
    const customStyles = {
        header: {
            style: {
                minHeight: '56px',
                fontSize: '18px',
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
                fontSize: '16px',
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
            <h2>Tipos de Seguros</h2>

            <div className={styles["form-row"]}>
                <div className={styles["form-group"]}>
                    <label htmlFor="buscar">Buscar</label>
                    <input
                        type="text"
                        id="buscar"
                        name="buscar"
                        placeholder="Ingrese código del seguro"
                        onChange={filtrarClientes}
                    />
                </div>
                <FcClearFilters size={25} className={styles.icon} onClick={borrarFiltro} />
            </div>

            <div className={styles["form-group"]}>
                <button
                    type="button"
                    onClick={() => mostrarSeccion("CrearSeguroAdmin")}
                >
                    Crear
                </button>
            </div>
            <DataTable
                pagination
                paginationPerPage={20}
                columns={columlistSeguro}
                data={filtroSeguros}
                noDataComponent="No ha seleccionado ningún Seguro"
                customStyles={customStyles}
                persistTableHead
            />
        </div>
    );
}

export default SegurosAdmin;