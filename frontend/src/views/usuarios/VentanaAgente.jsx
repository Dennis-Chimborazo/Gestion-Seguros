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
      <h2>Bienvenido {user?.nom_rol}</h2>
      <ul className={styles.menu}>
        <li><a onClick={() => mostrarSeccion("clientes")}>Clientes</a></li>
        <li><a onClick={() => mostrarSeccion("GestionContratacion")}>Gestión de contratación</a></li>
        <li><a onClick={() => mostrarSeccion("listaRembolso")}>Reembolso</a></li>
        <li><a onClick={() => mostrarSeccion("reviPagosAdmin")}>Revisiones de Pagos</a></li>
        <li><a onClick={() => mostrarSeccion("reportes")}>Reportes</a></li>
        <li><a onClick={cerrarSesion}>Cerrar sesión</a></li>
      </ul>

      <section className={styles.section}>
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
        {seccionActiva === "inicio" && <p>Selecciona una opción del menú.</p>}
      </section>
    </div>
  );
}
export default VentanaAgente;