import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApiService from "../services/ApiService";
import styles from "./estilos/VentanaAdmin.module.css";
import { 
  FiCreditCard, 
  FiShield, 
  FiUsers, 
  FiFileText, 
  FiDollarSign, 
  FiBarChart3, 
  FiLogOut, 
  FiMenu, 
  FiX,
  FiHome 
} from "react-icons/fi";

export function VentanaPrincipal() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

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

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarExpanded ? styles.expanded : styles.collapsed}`}>
        {/* Header del sidebar */}
        <div className={styles.sidebarHeader}>
          <h2 className={styles.title}>
            {sidebarExpanded ? "Panel de Control" : ""}
          </h2>          <button className={styles.toggleButton} onClick={toggleSidebar}>
            {sidebarExpanded ? <FiX /> : <FiMenu />}
          </button>
        </div>

        {/* Menú del sidebar */}
        <ul className={styles.menu}>          {user?.rol === "admin" && (
            <>
              <li className={styles.menuItem}>
                <a href="#" className={styles.menuLink} onClick={valores}>
                  <FiCreditCard className={styles.menuIcon} />
                  <span className={styles.menuText}>Cuentas</span>
                </a>
              </li>
              <li className={styles.menuItem}>
                <a href="#" className={styles.menuLink}>
                  <FiShield className={styles.menuIcon} />
                  <span className={styles.menuText}>Seguros</span>
                </a>
              </li>
              <li className={styles.menuItem}>
                <a href="#" className={styles.menuLink}>
                  <FiUsers className={styles.menuIcon} />
                  <span className={styles.menuText}>Clientes</span>
                </a>
              </li>
              <li className={styles.menuItem}>
                <a href="#" className={styles.menuLink}>
                  <FiFileText className={styles.menuIcon} />
                  <span className={styles.menuText}>Gestión de contratación</span>
                </a>
              </li>
              <li className={styles.menuItem}>
                <a href="#" className={styles.menuLink}>
                  <FiDollarSign className={styles.menuIcon} />
                  <span className={styles.menuText}>Reembolso</span>
                </a>
              </li>
              <li className={styles.menuItem}>
                <a href="#" className={styles.menuLink}>
                  <FiBarChart3 className={styles.menuIcon} />
                  <span className={styles.menuText}>Reportes</span>
                </a>
              </li>
            </>
          )}

          {user?.rol === "trabajador" && (
            <>
              <li className={styles.menuItem}>
                <a href="#" className={styles.menuLink}>
                  <FiUsers className={styles.menuIcon} />
                  <span className={styles.menuText}>Clientes</span>
                </a>
              </li>
              <li className={styles.menuItem}>
                <a href="#" className={styles.menuLink}>
                  <FiFileText className={styles.menuIcon} />
                  <span className={styles.menuText}>Gestión de contratación</span>
                </a>
              </li>
              <li className={styles.menuItem}>
                <a href="#" className={styles.menuLink}>
                  <FiDollarSign className={styles.menuIcon} />
                  <span className={styles.menuText}>Reembolso</span>
                </a>
              </li>
              <li className={styles.menuItem}>
                <a href="#" className={styles.menuLink}>
                  <FiBarChart3 className={styles.menuIcon} />
                  <span className={styles.menuText}>Reportes</span>
                </a>
              </li>
            </>
          )}

          {user?.rol === "cliente" && (
            <>
              <li className={styles.menuItem}>
                <a href="#" className={styles.menuLink}>
                  <FiShield className={styles.menuIcon} />
                  <span className={styles.menuText}>Contratación de seguro</span>
                </a>
              </li>
              <li className={styles.menuItem}>
                <a href="#" className={styles.menuLink}>
                  <FiCreditCard className={styles.menuIcon} />
                  <span className={styles.menuText}>Historial de pagos</span>
                </a>
              </li>
              <li className={styles.menuItem}>
                <a href="#" className={styles.menuLink}>
                  <FiDollarSign className={styles.menuIcon} />
                  <span className={styles.menuText}>Reembolsos</span>
                </a>
              </li>
              <li className={styles.menuItem}>
                <a href="#" className={styles.menuLink}>
                  <FiFileText className={styles.menuIcon} />
                  <span className={styles.menuText}>Facturas</span>
                </a>
              </li>
            </>
          )}

          <li className={styles.menuItem}>
            <a className={`${styles.menuLink} ${styles.logout}`} href="#" onClick={cerrarSesion}>
              <FiLogOut className={styles.menuIcon} />
              <span className={styles.menuText}>Cerrar sesión</span>
            </a>
          </li>
        </ul>
      </div>      {/* Contenido principal */}
      <div className={styles.mainContent}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>Bienvenido, {user?.rol}</h1>
          <p className={styles.welcomeSubtitle}>
            Selecciona una opción del menú lateral para comenzar
          </p>
        </div>
      </div>

      {/* Overlay para móviles */}
      {sidebarExpanded && <div className={styles.overlay} onClick={toggleSidebar}></div>}
    </div>
  );
}
