import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FcClearFilters, FcFinePrint } from "react-icons/fc";
import { FaSearch } from "react-icons/fa";
import CargarTablas from "../cargando/CargarTablas";
import "../estilos/Cliente.css";
import PagosFun from "./PagosFun.js";

export function HistorialPagos({ id, mostrarSeccion }) {
    const navigate = useNavigate();
    const [reviPagos, setReviPagos] = useState([]);
    const [filtroReviPagos, setFiltroReviPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const traterClientes = async () => {
            try {
                const dataReviPagos = await PagosFun.pagoAprobadosCliente(id, navigate);
                setFiltroReviPagos(dataReviPagos || []);
                setReviPagos(dataReviPagos || []);
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
    ];

    const filtrarClientes = (e) => {
        if (e.target.value !== '') {
            const filtro = reviPagos.filter((a) =>
                a.cedr_cli &&
                a.cedr_cli.toLowerCase().startsWith(e.target.value.toLowerCase())
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
        </div>
    );
}

export default HistorialPagos;