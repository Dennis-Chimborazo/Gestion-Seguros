import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../../services/ApiService";
import styles from "../estilos/VentanaAdmin.module.css";
import CrearClientes from "../clientes/CrearClientes";
import Clientes from "../clientes/Clientes";
import EditarClientes from "../clientes/EditarClientes";
import Seguros from "../seguros/Seguros";
import CrearSeguro from "../seguros/CrearSeguro";

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
      <h2>Bienvenido {user?.nom_rol}</h2>
      <ul className={styles.menu}>
      <li><a onClick={() => mostrarSeccion("clientes")}>Clientes</a></li>
        <li><a onClick={() => mostrarSeccion("seguros")}>Seguros</a></li>
        <li><a onClick={() => mostrarSeccion("gestion")}>Gestión de contratación</a></li>
        <li><a onClick={() => mostrarSeccion("reembolso")}>Reembolso</a></li>
        <li><a onClick={() => mostrarSeccion("reportes")}>Reportes</a></li>
        <li><a onClick={cerrarSesion}>Cerrar sesión</a></li>
      </ul>

      <section className={styles.section}>
      {seccionActiva === "clientes" && <Clientes mostrarSeccion={mostrarSeccion}/>}
        {seccionActiva === "crearClientes" && <CrearClientes mostrarSeccion={mostrarSeccion}/>}
        {seccionActiva === "EditarCliente" && <EditarClientes mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "seguros" && <Seguros mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "Crearseguro" && <CrearSeguro mostrarSeccion={mostrarSeccion} />}
        {seccionActiva === "reportes" && <p>Sección de reportes</p>}
        {seccionActiva === "inicio" && <p>Selecciona una opción del menú.</p>}
      </section>
    </div>
  );
}

export default VentanaAdmin;
