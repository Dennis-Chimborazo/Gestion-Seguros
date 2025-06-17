import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import GestionContratacionFun from "./GestionContratacionFun";
import { FcClearFilters } from "react-icons/fc";
import { FaSearch } from "react-icons/fa";
import CargarTablas from "../cargando/CargarTablas";
import "../estilos/GestionContratacion.css";

export function GestionContratacion({ mostrarSeccion }) {
  const navigate = useNavigate();
  const [listaSeguros, setListaSeguros] = useState();
  const [filtroSeguros, setFiltroSeguros] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const traterSeguros = async () => {
      try {
        const dataSeguro = await GestionContratacionFun.traerSeguros(navigate);
        setListaSeguros(dataSeguro.rows);
        setFiltroSeguros(dataSeguro.rows);
      } catch (error) {
        console.log("Ha ocurrido un error: " + error);
      } finally {
        setLoading(false);
      }
    };
    traterSeguros();
  }, [navigate]);

  const filtrarSeguros = (e) => {
    const value = e.target.value;
    if (value !== "") {
      const filtro = listaSeguros.filter((a) =>
        a.id_seguro && a.id_seguro.toString().startsWith(value)
      );
      setFiltroSeguros(filtro);
    } else {
      setFiltroSeguros(listaSeguros);
    }
  };
  const borrarFiltro = () => {
    setFiltroSeguros(listaSeguros);
  };
  const columlistSeguro = [
    { name: "N. Seguro", selector: (row) => row.id_seguro },
    { name: "Titular ", selector: (row) => row.cedr_cli },
    { name: "Nombre", selector: (row) => row.nom_cli },
    { name: "Apellido", selector: (row) => row.ape_cli },
    { name: "Seguro", selector: (row) => row.nom_tip_seg },
    { name: "Valor anual", selector: (row) => row.pago_tip_seg },
    { name: "Tipo de pago", selector: (row) => row.tiempo_seguro },
    { name: "Valor a pagar", selector: (row) => row.monto_seguro },
  ];
  return (
    <div className="gestion-container">
      <form className="gestion-form" action="" method="">
        <h1 className="gestion-title">Gestión Contratación</h1>
        <div className="search-controls">
          <div className="search-group">
            <label className="search-label" htmlFor="buscar">
              Buscar Contrato
            </label>
            <div className="search-input-container">
              <input
                className="search-input"
                type="text"
                id="buscar"
                name="buscar"
                placeholder="Ingrese código del seguro"
                onChange={filtrarSeguros}
              />
              <FaSearch className="search-icon" />
            </div>
          </div>
          <button
            type="button"
            className="clear-filter-btn"
            onClick={borrarFiltro}
            title="Limpiar filtros"
          >
            <FcClearFilters size={25} />
          </button>
          <button
            className="btn-primary"
            onClick={() => mostrarSeccion("CrearContratacion")}
          >
            Nuevo seguro
          </button>
        </div>
        {loading ? (
          <CargarTablas />
        ) : (
          <DataTable
            pagination
            paginationPerPage={20}
            columns={columlistSeguro}
            data={filtroSeguros}
            noDataComponent="No ha seleccionado ningún Seguro"
            persistTableHead
          />
        )}
      </form>
    </div>
  );
}
export default GestionContratacion;