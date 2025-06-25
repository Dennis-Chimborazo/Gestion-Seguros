import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FcClearFilters, FcFinePrint } from "react-icons/fc";
import { FaSearch } from "react-icons/fa";
import CargarTablas from "../cargando/CargarTablas";
import AgenteFun from "./AgenteFun";
import { FaUserEdit } from "react-icons/fa";
import "../estilos/Agentes.css";
import stylesmod from "../estilos/modalDependientes.module.css";
import AgenteInformacion from "./AgenteInformacion";

export function Agentes({ mostrarSeccion }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.user; // accedemos al usuario
    const [clientes, setClientes] = useState();
    const [filtroCli, setFiltroCli] = useState();
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const cerrarModal = () => setIsModalOpen(false);
    const abrirModal = () => setIsModalOpen(true);

    useEffect(() => {
        const traterClientes = async () => {
            try {
                const datAgentes = await AgenteFun.obtenerAgentes(navigate)
                setFiltroCli(datAgentes.rows);
                setClientes(datAgentes.rows);
            } catch (error) {
                console.log("Ha ocurrido un error");
            } finally {
                setLoading(false)
            }
        }
        traterClientes();
    }, []);

    const columasClientes = [
        { name: "Cedula/Pasaporte", selector: row => row.ced_agente },
        { name: "Nombre", selector: row => row.nom_agente },
        { name: "Apellido", selector: row => row.ape_agente },
        { name: "Correo", selector: row => row.email_agente },
        {
            name: "Opciones", cell: (row, index) =>
            (<div>
                <FcFinePrint size={25}
                    className="option-icon"
                    data-testid={`icono-info-${index}`}
                    onClick={() => mostrarInformacion(row)} />
                <FaUserEdit size={25}
                    className="option-icon"
                    data-testid={`icono-editar-${index}`}
                    onClick={() => EditarAgente(row)} />
            </div>
            ), ignoreRowClick: true
        },
    ];
    const mostrarInformacion = (row) => {
        localStorage.setItem("AgenteInformacion", JSON.stringify({
            edit: true,
            agente: row
        }));
        abrirModal();
    }

    const filtrarClientes = (e) => {
        if (e.target.value !== '') {
            const filtro = clientes.filter((a) =>
                a.ced_agente && a.ced_agente.startsWith(e.target.value)
            );
            setFiltroCli(filtro);
        } else {
            setFiltroCli(clientes);
        }
    };

    const borrarFiltro = () => {
        setFiltroCli(clientes);
    }

    const EditarAgente = (row) => {
        localStorage.setItem("editAgente", JSON.stringify({
            edit: true,
            agente: row
        }));
        mostrarSeccion("EditarAgente");
    }

    return (
        <div className="agentes-container">
            <div className="agentes-form">
                <h1 className="agentes-title">Gestión de Agentes</h1>
                
                <div className="search-controls">
                    <div className="search-group">
                        <label className="search-label">Buscar Agente</label>
                        <div className="search-input-container">
                            <input 
                                type="text" 
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
                            data-testid="boton-borrar-filtro"
                            onClick={borrarFiltro}
                            title="Limpiar filtros"
                        >
                            <FcClearFilters size={25} />
                        </button>
                        
                        <div className="create-group">
                            <button 
                                type="button"
                                className="create-btn"
                                onClick={() => mostrarSeccion('crearAgentes')}
                            >
                                Nuevo Agente
                            </button>
                            <button 
                                type="button"
                                className="create-btn"
                                onClick={() => mostrarSeccion('AgentePendiente')}
                            >
                                Validaciones Pendientes
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <CargarTablas />
                ) : (
                    <DataTable
                        pagination
                        paginationPerPage={20}
                        columns={columasClientes}
                        data={filtroCli}
                        noDataComponent="No hay agentes para mostrar"
                        persistTableHead
                    />
                )}
            </div>
            
            {isModalOpen && (
                <div className={stylesmod.overlay}>
                    <div className={stylesmod.modal}>
                        <button className={stylesmod.closeBtn} onClick={cerrarModal}>X</button>
                        <AgenteInformacion cerrarModal={cerrarModal} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Agentes;