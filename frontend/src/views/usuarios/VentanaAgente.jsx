import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../estilos/VentanaAdmin.module.css";
import CrearClientes from "../clientes/CrearClientes";
import Clientes from "../clientes/Clientes";
import EditarClientes from "../clientes/EditarClientes";
import GestionContratacion from "../gestionContratacion/gestionContratacion";
import CrearContratacion from "../gestionContratacion/CrearContratacion";
import ValidacionCliente from "../clientes/ValidacionCliente";
import ListReembolsosAdmin from "../reembolsos/ListReembolsosAdmin";
import ReembolsosAdmin from "../reembolsos/ReembolsosAdmin";
import ListaPagosAdmin from "../pagos/ListaPagosAdmin";
import RevisionPagoAdmin from "../pagos/RevisionPagoAdmin";
import Dashboard from "../reportes/Dashboard";
import DashboardInicioAgente from "./DashboardInicioAgente";

export function VentanaAgente() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const [seccionActiva, setSeccionActiva] = useState("inicio");

  useEffect(() => {
    console.log("Ventana principal: " + user?.nom_rol);
  }, [user]);

  const cerrarSesion = () => {
    localStorage.setItem("login", "");
    navigate("/", { state: { user: "" } });
  };

  const mostrarSeccion = (nombre) => {
    setSeccionActiva(nombre);
  };

  return (
    <div className={styles.container}>
      <ul className={styles.menu}>
        <li className={styles.welcomeHeader}>
          <h2>Bienvenido {user?.nom_rol}</h2>
        </li>
        <li>
          <button 
            className={styles.menuButton} 
            onClick={() => mostrarSeccion("clientes")}
          >
            Clientes
          </button>
        </li>
        <li>
          <button 
            className={styles.menuButton} 
            onClick={() => mostrarSeccion("GestionContratacion")}
          >
            Gestión de contratación
          </button>
        </li>
        <li>
          <button 
            className={styles.menuButton} 
            onClick={() => mostrarSeccion("listaRembolso")}
          >
            Reembolso
          </button>
        </li>
        <li>
          <button 
            className={styles.menuButton} 
            onClick={() => mostrarSeccion("reviPagosAdmin")}
          >
            Revisiones de Pagos
          </button>
        </li>
        <li>
          <button 
            className={styles.menuButton} 
            onClick={() => mostrarSeccion("reportes")}
          >
            Reportes
          </button>
        </li>
        <li>
          <button 
            className={`${styles.menuButton} ${styles.logoutButton}`} 
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>
        </li>
      </ul>

      <section className={styles.section}>
        {seccionActiva === "inicio" && <DashboardInicioAgente mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "clientes" && <Clientes mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "crearClientes" && <CrearClientes mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "EditarCliente" && <EditarClientes mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "GestionContratacion" && <GestionContratacion mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "CrearContratacion" && <CrearContratacion mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "clientePendiente" && <ValidacionCliente mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "listaRembolso" && <ListReembolsosAdmin mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "RevisionRembolso" && <ReembolsosAdmin mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "reviPagosAdmin" && <ListaPagosAdmin mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "procesoPagosAdmin" && <RevisionPagoAdmin mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "reportes" && <Dashboard mostrarSeccion={mostrarSeccion} />}
      </section>
    </div>
  );
}

export default VentanaAgente;