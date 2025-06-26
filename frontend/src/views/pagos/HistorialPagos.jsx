import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FcClearFilters } from "react-icons/fc";
import { FaSearch } from "react-icons/fa";
import CargarTablas from "../cargando/CargarTablas";
import styles from "../estilos/HistorialPagos.module.css";
import PagosFun from "./PagosFun.js";

export function HistorialPagos({ id, mostrarSeccion }) {
    const navigate = useNavigate();
    const [reviPagos, setReviPagos] = useState();
    const [filtroReviPagos, setFiltroReviPagos] = useState();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const traterClientes = async () => {
            try {
                const dataReviPagos = await PagosFun.pagoAprobadosCliente(id, navigate);
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
            cell: row => (
                <span 
                    className={styles.comprobanteCell}
                    title={`Comprobante: ${row.comprobante_pago}`}
                >
                    {row.comprobante_pago}
                </span>
            ),
            sortable: true,
            width: "180px"
        },
        { 
            name: "Seguro", 
            selector: row => row.nom_tip_seg,
            cell: row => <span className={styles.seguroCell}>{row.nom_tip_seg}</span>,
            sortable: true
        },
        { 
            name: "Fecha de pago", 
            selector: row => row.fecha_pago,
            cell: row => <span className={styles.fechaCell}>{row.fecha_pago}</span>,
            sortable: true,
            width: "160px"
        },
        { 
            name: "Monto", 
            selector: row => row.nonto_pago,
            cell: row => (
                <span className={styles.montoCell}>
                    {parseFloat(row.nonto_pago).toLocaleString('es-ES', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}
                </span>
            ),
            sortable: true,
            width: "120px"
        },
        {
            name: "Estado",
            cell: () => (
                <span className={styles.estadoAprobado}>
                    Aprobado
                </span>
            ),
            width: "120px"
        }
    ];

    const filtrarClientes = (e) => {
        const valor = e.target.value.toLowerCase();
        if (valor !== '') {
            const filtro = reviPagos.filter((pago) =>
                (pago.comprobante_pago && pago.comprobante_pago.toLowerCase().includes(valor)) ||
                (pago.nom_tip_seg && pago.nom_tip_seg.toLowerCase().includes(valor)) ||
                (pago.fecha_pago && pago.fecha_pago.includes(valor))
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
        <div className={styles.historialPagosContainer}>
            <h1 className={styles.titulo}>
                📊 Historial de Pagos Aprobados
            </h1>

            <div className={styles.infoBox}>
                <div className={styles.infoIcon}>✅</div>
                <div className={styles.infoText}>
                    Este historial muestra todos sus pagos que han sido aprobados y procesados exitosamente.
                </div>
            </div>

            <div className={styles.searchSection}>
                <div className={styles.searchControls}>
                    <div className={styles.searchGroup}>
                        <label className={styles.searchLabel}>🔍 Buscar</label>
                        <div className={styles.searchInputContainer}>
                            <input
                                type="text"
                                className={styles.searchInput}
                                placeholder="Buscar por comprobante, seguro o fecha..."
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
                                <div className={styles.noDataIcon}>🔍</div>
                                <div>No hay pagos aprobados para mostrar</div>
                                <small>Los pagos aparecerán aquí una vez que sean aprobados por el administrador</small>
                            </div>
                        }
                        persistTableHead
                        highlightOnHover
                        pointerOnHover
                        responsive
                        customStyles={{
                            headRow: {
                                style: {
                                    backgroundColor: '#27ae60',
                                    color: 'white',
                                    fontWeight: '600',
                                },
                            },
                            rows: {
                                style: {
                                    '&:hover': {
                                        backgroundColor: '#f0fff4',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 2px 8px rgba(39, 174, 96, 0.1)',
                                        borderLeft: '4px solid #27ae60',
                                    },
                                },
                            },
                        }}
                    />
                )}
            </div>
        </div>
    );
}

export default HistorialPagos;