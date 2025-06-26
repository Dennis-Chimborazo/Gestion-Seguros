import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FcClearFilters, FcFinePrint } from "react-icons/fc";
import { FaSearch } from "react-icons/fa";
import CargarTablas from "../cargando/CargarTablas";
import styles from "../estilos/ListaPagoCliente.module.css";
import PagosFun from "./PagosFun.js";
import InfoPagoRechazado from "./InfoPagoRechazado.jsx";

export function ListaPagoCliente({ id, mostrarSeccion }) {
    const navigate = useNavigate();
    const [reviPagos, setReviPagos] = useState();
    const [filtroReviPagos, setFiltroReviPagos] = useState();
    const [loading, setLoading] = useState(true);
    const [isModalOpenRechazado, setIsModalOpenRechazado] = useState(false);
    const cerrarModalRechazado = () => setIsModalOpenRechazado(false);
    const abrirModalRechazado = () => setIsModalOpenRechazado(true);

    useEffect(() => {
        const traterClientes = async () => {
            try {
                const dataReviPagos = await PagosFun.pagoRevisionCliente(id, navigate);
                console.log(dataReviPagos);
                setFiltroReviPagos(dataReviPagos);
                setReviPagos(dataReviPagos);
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
            name: "Comprobante", 
            selector: row => row.comprobante_pago,
            cell: row => <span className={styles.comprobanteCell}>{row.comprobante_pago}</span>
        },
        { 
            name: "Seguro", 
            selector: row => row.nom_tip_seg,
            sortable: true
        },
        { 
            name: "Fecha de pago", 
            selector: row => row.fecha_pago,
            cell: row => <span className={styles.fechaCell}>{row.fecha_pago}</span>,
            sortable: true
        },
        { 
            name: "Monto", 
            selector: row => row.nonto_pago,
            cell: row => <span className={styles.montoCell}>{parseFloat(row.nonto_pago).toLocaleString()}</span>,
            sortable: true
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
                    {row.nom_estado}
                </span>
            ),
            sortable: true
        },
        {
            name: "Resolución",
            cell: (row, index) => (
                <div className={styles.resolucionCell}>
                    {row.nom_estado !== "pendiente" ? (
                        row.nom_estado === "aprobado" ? (
                            <span className={styles.sinResolucion}>✅ Aprobado</span>
                        ) : (
                            <FcFinePrint 
                                size={40} 
                                className={styles.optionIcon} 
                                data-testid={`icono-estado-${index}`} 
                                onClick={() => mostrarModalRechazado(row)}
                                title="Ver detalles del rechazo"
                            />
                        )
                    ) : (
                        <span className={styles.sinResolucion}>⏳ Sin resolución</span>
                    )}
                </div>
            ),
            ignoreRowClick: true
        }
    ];

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
            const filtro = reviPagos.filter((pago) =>
                (pago.comprobante_pago && pago.comprobante_pago.toLowerCase().includes(valor)) ||
                (pago.nom_tip_seg && pago.nom_tip_seg.toLowerCase().includes(valor)) ||
                (pago.nom_estado && pago.nom_estado.toLowerCase().includes(valor))
            );
            setFiltroReviPagos(filtro);
        } else {
            setFiltroReviPagos(reviPagos);
        }
    };

    const borrarFiltro = () => {
        setFiltroReviPagos(reviPagos);
    }

    return (
        <div className={styles.listaPagoContainer}>
            <h1 className={styles.titulo}>
                💳 Revisión de Pagos
            </h1>

            <div className={styles.searchSection}>
                <div className={styles.searchControls}>
                    <div className={styles.searchGroup}>
                        <label className={styles.searchLabel}>🔍 Buscar</label>
                        <div className={styles.searchInputContainer}>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Buscar por comprobante, seguro o estado..."
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
                        data={filtroReviPagos}
                        noDataComponent={
                            <div className={styles.noDataMessage}>
                                📋 No hay solicitudes de pagos para mostrar
                            </div>
                        }
                        persistTableHead
                        highlightOnHover
                        pointerOnHover
                        responsive
                        customStyles={{
                            headRow: {
                                style: {
                                    backgroundColor: '#9b59b6',
                                    color: 'white',
                                    fontWeight: '600',
                                },
                            },
                            rows: {
                                style: {
                                    '&:hover': {
                                        backgroundColor: '#f8f9fa',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 2px 8px rgba(155, 89, 182, 0.1)',
                                    },
                                },
                            },
                        }}
                    />
                )}
            </div>

            {isModalOpenRechazado && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <button className={styles.closeBtn} onClick={cerrarModalRechazado}>
                            ✕
                        </button>
                        <InfoPagoRechazado cerrarModalRechazado={cerrarModalRechazado} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default ListaPagoCliente;