import React, {  useEffect,  useState  } from "react";
import { useNavigate,  useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import SegurosAdminFun from "./SegurosAdminFun";
import { FcClearFilters, FcEditImage, FcFinePrint } from "react-icons/fc";
import CargarTablas from "../cargando/CargarTablas";
import { FaSearch } from "react-icons/fa";
import "../estilos/SegurosAdmin.css";
import SeguroAdminInformacion from "./SeguroAdminInformacion";
import stylesmod from "../estilos/modalDependientes.module.css";

export function SegurosAdmin({ mostrarSeccion }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = location.state?.user; // accedemos al usuario
    const [filtroSeguros, setFiltroSeguros] = useState();
    const [listaSeguros, setListaSeguros] = useState();
    const [loading, setLoading] = useState(true);
      const [isModalOpen, setIsModalOpen] = useState(false);
      const cerrarModal = () => setIsModalOpen(false);
      const abrirModal = () => setIsModalOpen(true);
    useEffect(() => {
        const traterTipoSeguros = async () => {
            try {
                const dataSeguro = await SegurosAdminFun.traerTiposSeguros(navigate);
                setListaSeguros(dataSeguro.rows);
                setFiltroSeguros(dataSeguro.rows);
            } catch (error) {
                console.log('HA OCURRIDO UN ERROR')
            } finally {
                setLoading(false)
            }
        }
        traterTipoSeguros();
    }, []);

    const columlistSeguro = [
        { name: "Nombre ", selector: row => row.nom_tip_seg },
        { name: "Descripcion", selector: row => row.descrip_tip_seg },
        { name: "Pago mesual", selector: row => row.pago_tip_seg },
        {
            name: "Opciones", cell: (row, index) =>
            (<div>
                <FcFinePrint size={25}
                    className="option-icon"
                    data-testid={`icono-seguro-${index}`}
                    onClick={() => mostrarInformacion(row)} />

                <FcEditImage size={25}
                    className="option-icon"
                    data-testid={`icono-seguro-${index}`}
                    onClick={() => editarSeguro(row)} />
            </div>
            ), ignoreRowClick: true
        },
    ];
    const editarSeguro = (row) => {
        localStorage.setItem("editSeguro", JSON.stringify({
            edit: true,
            seguro: row
        }));

        mostrarSeccion("EditarSeguroAdmin");
    }
    const filtrarClientes = (e) => {
        if (e.target.value !== '') {
            const filtro = listaSeguros.filter((a) =>
                a.nom_tip_seg && a.nom_tip_seg.startsWith(e.target.value)
            );
            setFiltroSeguros(filtro);
        }
    };
    const borrarFiltro = () => {
        setFiltroSeguros(listaSeguros);
    }
  const mostrarInformacion = (row) => {
          localStorage.setItem("SeguroAdminInformacion", JSON.stringify({
            edit: true,
            seguroInfo: row
        }));
        abrirModal();
    }
    
    return (
        <div className="seguros-admin-container">
            <div className="seguros-admin-form">
                <h1 className="seguros-admin-title">Gestión de Tipos de Seguros</h1>
                
                <div className="search-controls">
                    <div className="search-group">
                        <label className="search-label">Buscar Seguro</label>
                        <div className="search-input-container">
                            <input 
                                type="text" 
                                className="search-input"
                                placeholder="Ingrese nombre del seguro" 
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
                        
                        <div className="create-group">
                            <button 
                                type="button"
                                className="create-btn"
                                onClick={() => mostrarSeccion("CrearSeguroAdmin")}
                            >
                                Nuevo Tipo de Seguro
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
                        columns={columlistSeguro}
                        data={filtroSeguros}
                        noDataComponent="No hay seguros para mostrar"
                        persistTableHead
                    />
                )}
            </div>
            
            {isModalOpen && (
                <div className={stylesmod.overlay}>
                    <div className={stylesmod.modal}>
                        <button className={stylesmod.closeBtn} onClick={cerrarModal}>X</button>
                        <SeguroAdminInformacion cerrarModal={cerrarModal}/>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SegurosAdmin;
