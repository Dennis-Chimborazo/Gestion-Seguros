import React from "react";
import styles from "../estilos/DashboardInicio.module.css";

export function DashboardInicioAgente({ mostrarSeccion, user }) {
  const accesosRapidos = [
    {
      titulo: "Gestión de Clientes",
      descripcion: "Administra y consulta información de clientes",
      icono: "👥",
      seccion: "clientes",
      color: "#667eea"
    },
    {
      titulo: "Contrataciones",
      descripcion: "Procesa nuevas contrataciones de seguros",
      icono: "📄",
      seccion: "GestionContratacion",
      color: "#ed8936"
    },
    {
      titulo: "Reembolsos",
      descripcion: "Revisa y procesa solicitudes de reembolso",
      icono: "💰",
      seccion: "listaRembolso",
      color: "#38b2ac"
    }
  ];

  const estadisticas = [
    {
      titulo: "Sistema Activo",
      valor: "100%",
      descripcion: "Estado del sistema",
      icono: "✅",
      color: "#48bb78"
    },
    {
      titulo: "Sesión Activa",
      valor: "Activa",
      descripcion: "Estado de la sesión",
      icono: "🔒",
      color: "#667eea"
    },
    {
      titulo: "Rol de Usuario",
      valor: user?.nom_rol || "Agente",
      descripcion: "Permisos actuales",
      icono: "👤",
      color: "#764ba2"
    }
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.titulo}>Panel de Agente</h1>
        <p className={styles.subtitulo}>
          Bienvenido al sistema de gestión de seguros. Como agente, puedes gestionar clientes, 
          procesar contrataciones y revisar reembolsos.
        </p>
      </div>

      {/* Estadísticas del sistema */}
      <div className={styles.estadisticas}>
        <h2 className={styles.seccionTitulo}>Estado del Sistema</h2>
        <div className={styles.estadisticasGrid}>
          {estadisticas.map((stat, index) => (
            <div key={index} className={styles.tarjetaEstadistica}>
              <div 
                className={styles.iconoEstadistica}
                style={{ backgroundColor: stat.color }}
              >
                {stat.icono}
              </div>
              <div className={styles.contenidoEstadistica}>
                <h3 className={styles.valorEstadistica}>{stat.valor}</h3>
                <p className={styles.tituloEstadistica}>{stat.titulo}</p>
                <span className={styles.descripcionEstadistica}>{stat.descripcion}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className={styles.accesosRapidos}>
        <h2 className={styles.seccionTitulo}>Funciones Principales</h2>
        <div className={styles.accesoGrid}>
          {accesosRapidos.map((acceso, index) => (
            <div 
              key={index} 
              className={styles.tarjetaAcceso}
              onClick={() => mostrarSeccion(acceso.seccion)}
            >
              <div 
                className={styles.iconoAcceso}
                style={{ backgroundColor: acceso.color }}
              >
                {acceso.icono}
              </div>
              <div className={styles.contenidoAcceso}>
                <h3 className={styles.tituloAcceso}>{acceso.titulo}</h3>
                <p className={styles.descripcionAcceso}>{acceso.descripcion}</p>
              </div>
              <div className={styles.flechaAcceso}>→</div>
            </div>
          ))}
        </div>
      </div>

      {/* Información adicional */}
      <div className={styles.informacionAdicional}>
        <div className={styles.tarjetaInfo}>
          <h3 className={styles.tituloInfo}>💼 Funciones de Agente</h3>
          <ul className={styles.listaConsejos}>
            <li>Gestiona la información y documentación de tus clientes</li>
            <li>Procesa nuevas contrataciones de seguros de manera eficiente</li>
            <li>Revisa y tramita solicitudes de reembolso</li>
            <li>Mantén actualizados los datos de contacto de los clientes</li>
          </ul>
        </div>
        
        <div className={styles.tarjetaInfo}>
          <h3 className={styles.tituloInfo}>📋 Mejores Prácticas</h3>
          <p className={styles.textoInfo}>
            Como agente, es importante mantener una comunicación fluida con los clientes 
            y asegurar que toda la documentación esté completa y actualizada para 
            brindar el mejor servicio posible.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardInicioAgente;
