import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import ClientesFun from "./ClientesFun";
import { FcClearFilters } from "react-icons/fc";
import { TfiEmail } from "react-icons/tfi";
import { FaSearch } from "react-icons/fa";
import CargarTablas from "../cargando/CargarTablas";
import ModalReenvioValidacion from "./ModalReenvioValidacion";
import stylesmod from "../estilos/modalDependientes.module.css";
import { SlRefresh } from "react-icons/sl";
import "../estilos/ValidacionCliente.css";

export function ValidacionCliente({ mostrarSeccion }) {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState();
    const [filtroCli, setFiltroCli] = useState();
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const cerrarModal = () => setIsModalOpen(false);
    const abrirModal = () => setIsModalOpen(true);    const [formulario] = useState({})
    useEffect(() => {
        const traterClientes = async () => {
            try {
                const dataClientes = await ClientesFun.obtenerClientePeniente(navigate);
                setFiltroCli(dataClientes.rows);
                setClientes(dataClientes.rows);
            } catch (error) {
                console.log("Ha ocurrido un error");
            } finally {
                setLoading(false)
            }
        }
        traterClientes();
    }, [navigate]);

    const columasClientes = [
        { name: "Cedula/Pasaporte", selector: row => row.cedr_cli },
        { name: "Nombre", selector: row => row.nom_cli },
        { name: "Apellido", selector: row => row.ape_cli },
        {
            name: "Pendiente", selector: row => {
                if (row.id_estado === 4) {
                    return 'Cargar Archivos';
                } else if (row.id_estado === 3) {
                    return 'Cambiar contraseña';
                }
                return row.id_estado;
            }
        },
        { name: "Correo", selector: row => row.email_pers },        {
            name: "Reenviar Correo",
            cell: (row, index) => (
                <div>
                    <TfiEmail
                        data-testid={`icono-correo-${index}`}
                        className="email-icon"
                        size={25}
                        onClick={() => reenviarCorreo(row)}
                    />
                </div>
            ),
            ignoreRowClick: true
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
    const borrarFiltro = () => {
        setFiltroCli(clientes);
    }
    const reenviarCorreo = (row) => {
        localStorage.setItem("editCorreo", JSON.stringify({
            edit: true,
            cliente: row
        }));
        abrirModal()
    }
    const refrescar = async () => {
        try {
            const dataClientes = await ClientesFun.obtenerClientePeniente(navigate);
            setFiltroCli(dataClientes.rows);
            setClientes(dataClientes.rows);
        } catch (error) {
            console.log("Ha ocurrido un error");        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="validacion-cliente-container">
            <form action="" method="get" className="validacion-cliente-form">
                <h2 className="validacion-cliente-title">Validación de Cuenta Pendiente</h2>
                <div className="search-controls">
                    <div className="search-group">
                        <label className="search-label" htmlFor="buscar">Buscar por Cédula</label>
                        <div className="search-input-container">
                            <input 
                                className="search-input"
                                type="text" 
                                id="buscar" 
                                name="buscar" 
                                placeholder="Ingrese número de cédula" 
                                onChange={filtrarClientes} 
                            />
                            <FaSearch className="search-icon" />
                        </div>
                    </div>
                    <div className="control-buttons">
                        <button 
                            type="button" 
                            className="clear-filter-btn"
                            title="Limpiar filtros"
                            onClick={borrarFiltro}>
                            <FcClearFilters size={25} />
                        </button>
                        <button 
                            type="button" 
                            className="refresh-btn"
                            title="Actualizar datos"
                            onClick={refrescar}>
                            <SlRefresh size={20} />
                        </button>
                    </div>
                </div>
                {loading ? (<CargarTablas />) :
                    <DataTable
                        pagination
                        paginationPerPage={20}
                        columns={columasClientes}
                        data={filtroCli}
                        noDataComponent="No hay clientes pendientes de validación"
                        persistTableHead
                    />}
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