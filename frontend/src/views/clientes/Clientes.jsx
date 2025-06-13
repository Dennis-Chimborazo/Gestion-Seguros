import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import DataTable from "react-data-table-component";
import ClientesFun from "./ClientesFun.js";
import { FcClearFilters, FcSupport, FcFinePrint } from "react-icons/fc";
import { FaSearch } from "react-icons/fa";
import CargarTablas from "../cargando/CargarTablas";
import InfoCard from "../cargando/InfoCards";
import "../estilos/Cliente.css";
import { FaUserEdit } from "react-icons/fa";
import ClientesInformacion from "./ClientesInformacion.jsx";
import stylesmod from "../estilos/modalDependientes.module.css";

export function Clientes({ mostrarSeccion }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user; // accedemos al usuario
  const [clientes, setClientes] = useState();
  const [filtroCli, setFiltroCli] = useState();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cerrarModal = () => setIsModalOpen(false);
  const abrirModal = () => setIsModalOpen(true);

  useEffect(() => {
    const traterClientes = async () => {
      try {
        const dataClientes = await ClientesFun.obtenerCliente(navigate);
        setFiltroCli(dataClientes.rows);
        setClientes(dataClientes.rows);
      } catch (error) {
        console.log("Ha ocurrido un error");
      } finally {
        setLoading(false)
      }
    }
    traterClientes();

  }, []);

  const columasClientes = [
    { name: "Cedula/Pasaporte", selector: row => row.cedr_cli },
    { name: "Nombre", selector: row => row.nom_cli },
    { name: "Apellido", selector: row => row.ape_cli },
    { name: "Telefono", selector: row => row.tel_pers },
    { name: "Celular", selector: row => row.cel_pers },
    { name: "Correo", selector: row => row.email_pers },
    {
      name: "Opciones", cell: (row, index) =>
      (<div>
        <FcFinePrint size={25}
          className="option-icon"
          data-testid={`icono-cliente-${index}`}
          onClick={() => mostrarInformacionCliente(row)} />
        <FaUserEdit size={25}
          className="option-icon"
          data-testid={`icono-cliente-${index}`}
          onClick={() => EditarCliente(row)} />
      </div>
      ), ignoreRowClick: true
    },
  ];

  const filtrarClientes = (e) => {
    if (e.target.value !== '') {
      const filtro = clientes.filter((a) =>
        a.cedr_cli && a.cedr_cli.startsWith(e.target.value)
      );
      setFiltroCli(filtro);
    }
  };

  const borrarFiltro = () => {
    setFiltroCli(clientes);
  }

    const EditarCliente = (row) => {
        localStorage.setItem("edit", JSON.stringify({
            edit: true,
            cliente: row
          }));
          
        mostrarSeccion("EditarCliente");

    }

  const mostrarInformacionCliente = (row) => {
    localStorage.setItem("clientesInformacion", JSON.stringify({
      edit: true,
      cliente: row
    }));
    abrirModal();
  }

  return(
    <div className="cliente-container">
      <div className="cliente-form">
        <h1 className="cliente-title">Gestión de Clientes</h1>
        
        <div className="search-controls">
          <div className="search-group">
            <label className="search-label">Buscar Cliente</label>
            <div className="search-input-container">
              <input 
                type="text" 
                className="search-input"
                placeholder="Ingrese número de cédula" 
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
                onClick={() => mostrarSeccion('crearClientes')}
              >
                Nuevo Cliente
              </button>
              <button 
                type="button"
                className="create-btn"
                onClick={() => mostrarSeccion('clientePendiente')}
              >
                Validaciones Pendientes
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
            columns={columasClientes}
            data={filtroCli}
            noDataComponent="No hay clientes para mostrar"
            persistTableHead
          />
        )}
      </div>
      
      {isModalOpen && (
        <div className={stylesmod.overlay}>
          <div className={stylesmod.modal}>
            <button className={stylesmod.closeBtn} onClick={cerrarModal}>X</button>
            <ClientesInformacion cerrarModal={cerrarModal}/>
          </div>
        </div>
      )}
    </div>
  );
}

export default Clientes;