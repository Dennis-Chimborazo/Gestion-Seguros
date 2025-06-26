import React from "react";
import styles from "../estilos/DashboardInicio.module.css";

export function DashboardInicio({ mostrarSeccion, user }) {
    const accesosRapidos = [
        {
            titulo: "Gestión de Clientes",
            descripcion: "Administra y consulta información de clientes",
            icono: "👥",
            seccion: "clientes",
            color: "#667eea"
        },
        {
            titulo: "Seguros",
            descripcion: "Consulta y administra productos de seguros",
            icono: "🛡️",
            seccion: "segurosAdmin",
            color: "#764ba2"
        },
        {
            titulo: "Agentes",
            descripcion: "Gestiona agentes y solicitudes pendientes",
            icono: "👤",
            seccion: "agente",
            color: "#48bb78"
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
            valor: user?.nom_rol || "Administrador",
            descripcion: "Permisos actuales",
            icono: "👑",
            color: "#764ba2"
        }
    ];

    return (
        <div className={styles.dashboard}>
            <div className={styles.header}>
                <h1 className={styles.titulo}>Panel de Control</h1>
                <p className={styles.subtitulo}>
                    Bienvenido al sistema de gestión de seguros. Desde aquí puedes acceder a todas las funcionalidades del sistema.
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
                <h2 className={styles.seccionTitulo}>Accesos Rápidos</h2>
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
                    <h3 className={styles.tituloInfo}>💡 Consejos</h3>
                    <ul className={styles.listaConsejos}>
                        <li>Utiliza el menú lateral para navegar entre las diferentes secciones</li>
                        <li>Todas las acciones se registran automáticamente en el sistema</li>
                        <li>Puedes usar los accesos rápidos para ir directamente a las secciones más utilizadas</li>
                    </ul>
                </div>

                <div className={styles.tarjetaInfo}>
                    <h3 className={styles.tituloInfo}>📊 Sistema de Gestión</h3>
                    <p className={styles.textoInfo}>
                        Este sistema te permite gestionar de manera integral todos los aspectos relacionados
                        con seguros, desde la administración de clientes hasta el procesamiento de reembolsos.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default DashboardInicio;
