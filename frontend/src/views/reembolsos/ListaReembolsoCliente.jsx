import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { FcClearFilters, FcFinePrint } from "react-icons/fc";
import { FaSearch } from "react-icons/fa";
import CargarTablas from "../cargando/CargarTablas";
import "../estilos/Cliente.css";
import stylesmod from "../estilos/modalDependientes.module.css";
import ReembolsoFun from "./ReembolsoFun.js";

export function ListaReembolsoCliente({ id, mostrarSeccion }) {
    const navigate = useNavigate();
    const [Reembolsos, setReembolso] = useState();
    const [filtroReem, setFiltroReem] = useState();
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const cerrarModal = () => setIsModalOpen(false);
    const abrirModal = () => setIsModalOpen(true);

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

    }, []);

    const columasReembolso = [
        { name: "Numero de solcitud", selector: row => row.id_reemb },
        { name: "Seguro", selector: row => row.nom_tip_seg },
        { name: "Fecha de solicitud", selector: row => row.fecha_reemb },
        { name: "motivo", selector: row => row.motivo_reemb },
        { name: "Estado", selector: row => row.nom_estado },
    ];

    const filtrarClientes = (e) => {
        if (!Reembolsos) return; 
        if (e.target.value !== '') {
            const filtro = Reembolsos.filter((a) =>
                a.cedr_cli && a.cedr_cli.startsWith(e.target.value)
            );
            setFiltroReem(filtro);
        }
    };

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

            {/* {isModalOpen && (
        <div className={stylesmod.overlay}>
          <div className={stylesmod.modal}>
            <button className={stylesmod.closeBtn} onClick={cerrarModal}>X</button>
            <ClientesInformacion cerrarModal={cerrarModal}/>
          </div>
        </div>
      )} */}
        </div>
    );
}

export default ListaReembolsoCliente;