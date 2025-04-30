import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../services/ApiService";
import styles from "./VentanaAdmin.module.css"; // importar estilos

export function VentanaPrincipal() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  useEffect(() => {
    console.log("Ventana principal: " + user?.rol);
  }, []);

  const cerrarSesion = () => {
    localStorage.setItem("login", "");
    navigate("/", { state: { user: "" } });
  };

  const valores = async (e) => {
    e.preventDefault();
    const val = await ApiService.traerDatos("client/clientes", navigate);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Bienvenido, {user?.rol}</h2>
      <ul className={styles.menu}>
        {user?.rol === "admin" && (
          <>
            <li><a href="#" onClick={valores}>Cuentas</a></li>
            <li><a href="#">Seguros</a></li>
            <li><a href="#">Clientes</a></li>
            <li><a href="#">Gestión de contratación</a></li>
            <li><a href="#">Reembolso</a></li>
            <li><a href="#">Reportes</a></li>
          </>
        )}

        {user?.rol === "trabajador" && (
          <>
            <li><a href="#">Clientes</a></li>
            <li><a href="#">Gestión de contratación</a></li>
            <li><a href="#">Reembolso</a></li>
            <li><a href="#">Reportes</a></li>
          </>
        )}

        {user?.rol === "cliente" && (
          <>
            <li><a href="#">Contratación de seguro</a></li>
            <li><a href="#">Historial de pagos</a></li>
            <li><a href="#">Reembolsos</a></li>
            <li><a href="#">Facturas</a></li>
          </>
        )}

        <li><a className={styles.logout} href="#" onClick={cerrarSesion}>Cerrar sesión</a></li>
      </ul>
    </div>
  );
}
