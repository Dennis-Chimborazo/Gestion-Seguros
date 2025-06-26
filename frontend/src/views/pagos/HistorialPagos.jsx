import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FcClearFilters, FcFinePrint } from "react-icons/fc";
import { FaSearch } from "react-icons/fa";
import CargarTablas from "../cargando/CargarTablas";
import "../estilos/Cliente.css";
import stylesmod from "../estilos/modalDependientes.module.css";
import PagosFun from "./PagosFun.js";
import InfoPagoRechazado from "./InfoPagoRechazado.jsx";

export function HistorialPagos({ id, mostrarSeccion }) {
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
                const dataReviPagos = await PagosFun.pagoAprobadosCliente(id, navigate);
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

    }, []);

    const columasReembolso = [
        { name: "compobante", selector: row => row.comprobante_pago },
        { name: "Seguro", selector: row => row.nom_tip_seg },
        { name: "Fecha de pago", selector: row => row.fecha_pago },
        { name: "Monto", selector: row => row.nonto_pago },
        { name: "Estado", selector: row => row.nom_estado },

    ];

    const mostrarModalRechazado = (row) => {
        localStorage.setItem("revisionReembolso", JSON.stringify({
            edit: true,
            revision: row
        }));
        abrirModalRechazado();
    }

    const filtrarClientes = (e) => {
        if (e.target.value !== '') {
            const filtro = reviPagos.filter((a) =>
                a.cedr_cli && a.cedr_cli.startsWith(e.target.value)
            );
            setFiltroReviPagos(filtro);
        }
    };

    const borrarFiltro = () => {
        setFiltroReviPagos(reviPagos);
    }

    return (
        <div className="cliente-container">
            <div className="cliente-form">
                <h1 className="cliente-title"> Historial de Pagos</h1>

                <div className="search-controls">
                    <div className="search-group">
                        <label className="search-label">Buscar</label>
                        <div className="search-input-container">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Ingrese numero de reembolso"
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
                            title="Limpiar filtros"
                        >
                            <FcClearFilters size={25} />
                        </button>
                    </div>
                </div>
                <div>
                    {loading ? (
                        <CargarTablas />
                    ) : (
                        <DataTable
                            pagination
                            paginationPerPage={20}
                            columns={columasReembolso}
                            data={filtroReviPagos}
                            noDataComponent="No hay Solicitudes de Reembolsos para mostrar"
                            persistTableHead
                        />
                    )}

                </div>
            </div>

            {isModalOpenRechazado && (
                <div className={stylesmod.overlay}>
                    <div className={stylesmod.modal}>
                        <button className={stylesmod.closeBtn} onClick={cerrarModalRechazado}>X</button>
                        <InfoPagoRechazado cerrarModalRechazado={cerrarModalRechazado} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default HistorialPagos;