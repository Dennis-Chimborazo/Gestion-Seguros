import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../services/ApiService";
import styles from "../estilos/VentanaAdmin.module.css";
import CrearClientes from "../clientes/CrearClientes";
import Clientes from "../clientes/Clientes";
import EditarClientes from "../clientes/EditarClientes";
import SegurosAdmin from "../segurosAdmin/SegurosAdmin";
import CrearSeguroAdmin from "../segurosAdmin/CrearSeguroAdmin";
import EditarSeguroAdmin from "../segurosAdmin/EditarSeguroAdmin";
import GestionContratacion from "../gestionContratacion/gestionContratacion";
import CrearContratacion from "../gestionContratacion/CrearContratacion";
import ValidacionCliente from "../clientes/ValidacionCliente";


export function VentanaAdmin() {
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

  const valores = async (e) => {
    e.preventDefault();
    const val = await ApiService.traerDatos("client/clientes", navigate);
    console.log(val);
  };

  return (
    <div className={styles.container}>
      <ul className={styles.menu}>
        <li className={styles.welcomeHeader}><h2>Bienvenido {user?.nom_rol}</h2></li>
        <li><button className={styles.menuButton} onClick={() => mostrarSeccion("clientes")}>Clientes</button></li>
        <li><button className={styles.menuButton} onClick={() => mostrarSeccion("segurosAdmin")}>Seguros</button></li>
        <li><button className={styles.menuButton} onClick={() => mostrarSeccion("GestionContratacion")}>Gestión de contratación</button></li>
        <li><button className={styles.menuButton} onClick={() => mostrarSeccion("seguros")}>Reembolso</button></li>
        <li><button className={styles.menuButton} onClick={() => mostrarSeccion("reportes")}>Reportes</button></li>
        <li><button className={`${styles.menuButton} ${styles.logoutButton}`} onClick={cerrarSesion}>Cerrar sesión</button></li>
      </ul>

      <section className={styles.section}>
      {seccionActiva === "clientes" && <Clientes mostrarSeccion={mostrarSeccion}/>}
        {seccionActiva === "crearClientes" && <CrearClientes mostrarSeccion={mostrarSeccion}/>}
        {seccionActiva === "EditarCliente" && <EditarClientes mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "segurosAdmin" && <SegurosAdmin mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "CrearSeguroAdmin" && <CrearSeguroAdmin mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "EditarSeguroAdmin" && <EditarSeguroAdmin mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "GestionContratacion" && <GestionContratacion mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "CrearContratacion" && <CrearContratacion mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "clientePendiente" && <ValidacionCliente mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "reportes" && <p>Sección de reportes</p>}
        {seccionActiva === "inicio" && <p>Selecciona una opción del menú.</p>}
      </section>
    </div>
  );
}

export default VentanaAdmin;
