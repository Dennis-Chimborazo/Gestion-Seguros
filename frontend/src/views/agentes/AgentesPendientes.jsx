import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FcClearFilters } from "react-icons/fc";
import { TfiEmail } from "react-icons/tfi";
import { FaSearch } from "react-icons/fa";
import CargarTablas from "../cargando/CargarTablas";
import stylesmod from "../estilos/modalDependientes.module.css";
import AgenteFun from "./AgenteFun";
import ModalCorreoAgente from "./ModalCorreoAgente";
import { SlRefresh } from "react-icons/sl";
import "../estilos/AgentesPendientes.css";

export function AgentesPendientes({ mostrarSeccion }) {
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
                const dataClientes = await AgenteFun.obtenerAgentesPendientes(navigate);
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
        { name: "Cedula/Pasaporte", selector: row => row.ced_agente },
        { name: "Nombre", selector: row => row.nom_agente },
        { name: "Apellido", selector: row => row.ape_agente },
        { name: "Telefono", selector: row => row.email_agente },
        { name: "Celular", selector: row => row.dire_agente },
        { name: "Correo", selector: row => row.tel_agente },        {
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
            agente: row
        }));
        abrirModal()
    }
    const refrescar = async () => {
        try {
            const dataClientes = await AgenteFun.obtenerAgentesPendientes(navigate);
            setFiltroCli(dataClientes.rows);
            setClientes(dataClientes.rows);
        } catch (error) {
            console.log("Ha ocurrido un error");        } finally {
            setLoading(false)
        }
    }
    
    return (
        <div className="agentes-pendientes-container">
            <form action="" method="get" className="agentes-pendientes-form">
                <div>
                    <h2 className="agentes-pendientes-title">Validación de cuenta Pendiente</h2>
                    <div className="search-controls">
                        <div className="search-group">
                            <label className="search-label" htmlFor="buscar">Buscar por Cédula</label>
                            <div className="search-input-container">
                                <input 
                                    type="text" 
                                    id="buscar" 
                                    name="buscar" 
                                    className="search-input"
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
                                onClick={borrarFiltro}
                                title="Limpiar filtro"
                            >
                                <FcClearFilters size={25} />
                            </button>
                            <button 
                                type="button" 
                                className="refresh-btn" 
                                onClick={refrescar}
                                title="Actualizar datos"
                            >
                                <SlRefresh size={20} />
                            </button>
                        </div>
                    </div>
                </div>
                {loading ? (<CargarTablas />) :
                    <DataTable
                        pagination
                        paginationPerPage={20}
                        columns={columasClientes}
                        data={filtroCli}
                        noDataComponent="No hay agentes pendientes de validación"
                        persistTableHead
                    />}
            </form>
            {isModalOpen && (
                <div className={stylesmod.overlay}>
                    <div className={stylesmod.modal}>
                        <button className={stylesmod.closeBtn} onClick={cerrarModal}>X</button>
                        <ModalCorreoAgente cerrarModal={cerrarModal} datosCliente={formulario} mostrarSeccion={mostrarSeccion} />
                    </div>
                </div>
            )}
        </div>
    );
}
export default AgentesPendientes;