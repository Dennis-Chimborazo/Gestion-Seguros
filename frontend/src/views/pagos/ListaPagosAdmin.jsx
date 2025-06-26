import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FcClearFilters, FcFinePrint, FcCancel } from "react-icons/fc";
import { FaSearch } from "react-icons/fa";
import CargarTablas from "../cargando/CargarTablas.jsx";
import "../estilos/Cliente.css";
import PagosFun from "./PagosFun.js";

export function ListaPagosAdmin({ mostrarSeccion }) {
    const navigate = useNavigate();
    const [Reembolsos, setReembolso] = useState();
    const [filtroReem, setFiltroReem] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const traterClientes = async () => {
            try {
                const dataReembolsos = await PagosFun.pagoRevisionPendiente(navigate);
                setFiltroReem(dataReembolsos);
                setReembolso(dataReembolsos);
            } catch (error) {
                console.log("Ha ocurrido un error");
            } finally {
                setLoading(false)
            }
        }
        traterClientes();

    }, []);

    const columasReembolso = [
        { name: "Identificacion", selector: row => row.cedr_cli },
        { name: "Cliente", selector: row => row.nombre },
        { name: "Fecha de Pago", selector: row => row.fecha_pago },
        { name: "Monto", selector: row => row.nonto_pago },
        { name: "Comprobante", selector: row => row.comprobante_pago },
        { name: "Seguro", selector: row => row.nom_tip_seg },
        {
            name: "Revisiones",
            cell: (row, index) => (
                <div>
                    <FcFinePrint
                        size={40}
                        className="option-icon"
                        data-testid={`icono-cliente-${index}`}
                        onClick={() => revisionPagos(row)}
                    />
                </div>
            ),
            ignoreRowClick: true
        }
    ];

    const filtrarClientes = (e) => {
        const valor = e.target.value;
        if (valor !== "") {
            const filtrado = Reembolsos.filter((r) =>
                r.cedr_cli?.startsWith(valor)
            );
            setFiltroReem(filtrado);
        } else {
            setFiltroReem(Reembolsos);
        }
    };

    const revisionPagos = (row) => {
        localStorage.setItem("revisionPagos", JSON.stringify({
            edit: true,
            revision: row
        }));
        mostrarSeccion("procesoPagosAdmin");
    }

    const borrarFiltro = () => {
        setFiltroReem(Reembolsos);
    }

    return (
        <div className="cliente-container">
            <div className="cliente-form">
                <h1 className="cliente-title">Revision de pagos pendientes</h1>

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

                {loading ? (
                    <CargarTablas />
                ) : (
                    <DataTable
                        pagination
                        paginationPerPage={20}
                        columns={columasReembolso}
                        data={filtroReem}
                        noDataComponent="No hay Solicitudes de Reembolsos para mostrar"
                        persistTableHead
                    />
                )}
            </div>


        </div>
    );
}

export default ListaPagosAdmin;