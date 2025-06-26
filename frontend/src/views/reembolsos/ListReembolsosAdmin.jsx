import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FcClearFilters, FcFinePrint, FcCancel } from "react-icons/fc";
import { FaSearch } from "react-icons/fa";
import CargarTablas from "../cargando/CargarTablas.jsx";
import "../estilos/Cliente.css";
import ReembolsoFun from "./ReembolsoFun.js";
import { FcOk } from "react-icons/fc";

export function ListReembolsosAdmin({ mostrarSeccion }) {
    const navigate = useNavigate();
    const [Reembolsos, setReembolso] = useState();
    const [filtroReem, setFiltroReem] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const traterClientes = async () => {
            try {
                const dataReembolsos = await ReembolsoFun.traerReembolsos(navigate);
                setFiltroReem(dataReembolsos.rows);
                setReembolso(dataReembolsos.rows);
            } catch (error) {
                console.log("Ha ocurrido un error");
            } finally {
                setLoading(false)
            }
        }
        traterClientes();

    }, []);

    const columasReembolso = [
        { name: "Solcitud", selector: row => row.id_reemb },
        { name: "Seguro", selector: row => row.nom_tip_seg },
        { name: "Fecha", selector: row => row.fecha_reemb },
        { name: "cedula/pasaporte", selector: row => row.cedr_cli },
        { name: "Nombres", selector: row => row.nombre },
        { name: "Motivo", selector: row => row.motivo_reemb },
        { name: "Estado", selector: row => row.nom_estado },
        {
            name: "Revisiones",
            cell: (row, index) => (
                <div>
                    {row.nom_estado !== "pendiente" ? (
                        row.nom_estado === "aprobado" ? (
                            <FcOk size={40} className="option-icon" data-testid={`icono-estado-${index}`} />
                        ) : (
                            <FcCancel size={40} className="option-icon" data-testid={`icono-estado-${index}`} />
                        )
                    ) : (
                        <FcFinePrint
                            size={40}
                            className="option-icon"
                            data-testid={`icono-cliente-${index}`}
                            onClick={() => revisionReembolso(row)}
                        />
                    )}
                </div>
            ),
            ignoreRowClick: true
        }
    ];

    const filtrarClientes = (e) => {
        if (e.target.value !== '') {
            const filtro = Reembolsos.filter((a) =>
                a.cedr_cli && a.cedr_cli.startsWith(e.target.value)
            );
            setFiltroReem(filtro);
        }
    };
    const revisionReembolso = (row) => {
        localStorage.setItem("revisionReembolso", JSON.stringify({
            edit: true,
            revision: row
        }));
        mostrarSeccion("RevisionRembolso");
    }

    const borrarFiltro = () => {
        setFiltroReem(Reembolsos);
    }

    return (
        <div className="cliente-container">
            <div className="cliente-form">
                <h1 className="cliente-title"> Lista de Solicitudes</h1>

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

export default ListReembolsosAdmin;