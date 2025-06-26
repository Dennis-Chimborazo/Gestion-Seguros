import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FcClearFilters, FcFinePrint } from "react-icons/fc";
import { FaSearch } from "react-icons/fa";
import CargarTablas from "../cargando/CargarTablas";
import styles from "../estilos/ListaReembolsoCliente.module.css";
import ReembolsoFun from "./ReembolsoFun.js";
import InfoAceptadoReembolso from "./InfoAceptadoReembolso.jsx";
import InfoRechazoReembolso from "./InfoRechazoReembolso.jsx";

export function ListaReembolsoCliente({ id, mostrarSeccion }) {
    const navigate = useNavigate();
    const [Reembolsos, setReembolso] = useState();
    const [filtroReem, setFiltroReem] = useState();
    const [loading, setLoading] = useState(true);
    const [isModalOpenAceptado, setIsModalOpenAceptado] = useState(false);    
    const [isModalOpenRechazado, setIsModalOpenRechazado] = useState(false);
    const cerrarModalAceptado = () => setIsModalOpenAceptado(false);
    const abrirModalAceptado = () => setIsModalOpenAceptado(true);
    const cerrarModalRechazado = () => setIsModalOpenRechazado(false);
    const abrirModalRechazado = () => setIsModalOpenRechazado(true);

    useEffect(() => {
        const traterClientes = async () => {
            try {
                const dataReembolsos = await ReembolsoFun.buscarReembolsoCliente(id, navigate);
                setFiltroReem(dataReembolsos);
                setReembolso(dataReembolsos);
            } catch (error) {
                console.log("Ha ocurrido un error");
            } finally {
                setLoading(false)
            }
        }
        traterClientes();

    }, [id, navigate]);

    const columasReembolso = [
        { 
            name: "N° Solicitud", 
            selector: row => row.id_reemb,
            cell: row => (
                <span className={styles.numeroSolicitudCell}>
                    #{row.id_reemb}
                </span>
            ),
            sortable: true,
            width: "130px"
        },
        { 
            name: "Seguro", 
            selector: row => row.nom_tip_seg,
            sortable: true
        },
        { 
            name: "Fecha de solicitud", 
            selector: row => row.fecha_reemb,
            cell: row => <span className={styles.fechaCell}>{row.fecha_reemb}</span>,
            sortable: true
        },
        { 
            name: "Motivo", 
            selector: row => row.motivo_reemb,
            cell: row => (
                <span 
                    className={styles.motivoCell}
                    title={row.motivo_reemb}
                >
                    {row.motivo_reemb}
                </span>
            ),
            width: "200px"
        },
        { 
            name: "Estado", 
            selector: row => row.nom_estado,
            cell: row => (
                <span className={`${styles.estadoCell} ${
                    row.nom_estado === 'pendiente' ? styles.estadoPendiente :
                    row.nom_estado === 'aprobado' ? styles.estadoAprobado :
                    styles.estadoRechazado
                }`}>
                    {row.nom_estado === 'pendiente' ? '⏳ Pendiente' :
                     row.nom_estado === 'aprobado' ? '✅ Aprobado' :
                     '❌ Rechazado'}
                </span>
            ),
            sortable: true,
            width: "150px"
        },
        {
            name: "Resolución",
            cell: (row, index) => (
                <div className={styles.resolucionCell}>
                    {row.nom_estado !== "pendiente" ? (
                        row.nom_estado === "aprobado" ? (
                            <FcFinePrint 
                                size={40} 
                                className={styles.optionIcon} 
                                data-testid={`icono-estado-${index}`} 
                                onClick={() => mostrarModalAceptado(row)}
                                title="Ver detalles de aprobación"
                            />
                        ) : (
                            <FcFinePrint 
                                size={40} 
                                className={styles.optionIcon} 
                                data-testid={`icono-estado-${index}`} 
                                onClick={() => mostrarModalRechazado(row)}
                                title="Ver detalles de rechazo"
                            />
                        )
                    ) : (
                        <span className={styles.sinResolucion}>
                            ⏳ Sin resolución
                        </span>
                    )}
                </div>
            ),
            ignoreRowClick: true,
            width: "120px"
        }
    ];
    const mostrarModalAceptado = (row) => {
      localStorage.setItem("revisionReembolso", JSON.stringify({
        edit: true,
        revision: row
      }));
      abrirModalAceptado();
    }
      const mostrarModalRechazado = (row) => {
      localStorage.setItem("revisionReembolso", JSON.stringify({
        edit: true,
        revision: row
      }));
      abrirModalRechazado();
    }

    const filtrarClientes = (e) => {
        const valor = e.target.value.toLowerCase();
        if (valor !== '') {
            const filtro = Reembolsos.filter((reembolso) =>
                (reembolso.id_reemb && reembolso.id_reemb.toString().includes(valor)) ||
                (reembolso.nom_tip_seg && reembolso.nom_tip_seg.toLowerCase().includes(valor)) ||
                (reembolso.motivo_reemb && reembolso.motivo_reemb.toLowerCase().includes(valor)) ||
                (reembolso.nom_estado && reembolso.nom_estado.toLowerCase().includes(valor))
            );
            setFiltroReem(filtro);
        } else {
            setFiltroReem(Reembolsos);
        }
    };

    const borrarFiltro = () => {
        setFiltroReem(Reembolsos);
    }

    return (
        <div className={styles.listaReembolsoContainer}>
            <h1 className={styles.titulo}>
                💰 Lista de Solicitudes de Reembolso
            </h1>

            <div className={styles.searchSection}>
                <div className={styles.searchControls}>
                    <div className={styles.searchGroup}>
                        <label className={styles.searchLabel}>🔍 Buscar</label>
                        <div className={styles.searchInputContainer}>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Buscar por número, seguro, motivo o estado..."
                                onChange={filtrarClientes}
                            />
                            <FaSearch className={styles.searchIcon} />
                        </div>
                    </div>

                    <div className={styles.controlButtons}>
                        <button
                            type="button"
                            className={styles.clearFilterBtn}
                            onClick={borrarFiltro}
                            title="Limpiar filtros"
                        >
                            <FcClearFilters size={25} />
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.tableContainer}>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <CargarTablas />
                    </div>
                ) : (
                    <DataTable
                        pagination
                        paginationPerPage={20}
                        columns={columasReembolso}
                        data={filtroReem}
                        noDataComponent={
                            <div className={styles.noDataMessage}>
                                📋 No hay solicitudes de reembolsos para mostrar
                            </div>
                        }
                        persistTableHead
                        highlightOnHover
                        pointerOnHover
                        responsive
                        customStyles={{
                            headRow: {
                                style: {
                                    backgroundColor: '#3498db',
                                    color: 'white',
                                    fontWeight: '600',
                                },
                            },
                            rows: {
                                style: {
                                    '&:hover': {
                                        backgroundColor: '#f8f9fa',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 2px 8px rgba(52, 152, 219, 0.1)',
                                    },
                                },
                            },
                        }}
                    />
                )}
            </div>

            {isModalOpenAceptado && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <button className={styles.closeBtn} onClick={cerrarModalAceptado}>
                            ✕
                        </button>
                        <InfoAceptadoReembolso cerrarModalAceptado={cerrarModalAceptado}/>
                    </div>
                </div>
            )}

            {isModalOpenRechazado && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <button className={styles.closeBtn} onClick={cerrarModalRechazado}>
                            ✕
                        </button>
                        <InfoRechazoReembolso cerrarModalRechazado={cerrarModalRechazado}/>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListaReembolsoCliente;