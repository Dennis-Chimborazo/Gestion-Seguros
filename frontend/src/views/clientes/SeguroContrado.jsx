import React, { useEffect, useState } from 'react';
import ClientesFun from './ClientesFun';
import { useNavigate } from "react-router-dom";
import InfoCardsSeguros from '../cargando/InfoCardsSeguros';
import swal from 'sweetalert2';
import GestionContratacionFun from '../gestionContratacion/GestionContratacionFun';
import styles from '../estilos/SeguroContrado.module.css';

const SeguroContrado = ({ mostrarSeccion, id }) => {
    const navigate = useNavigate();
    const [seguros, setSeguros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroEstado, setFiltroEstado] = useState('todos');

    const validarSeguro = async (seguro) => {
        swal.fire({
            title: "<label>Confirmación</label>",
            text: "¿Está seguro que desea aplicar los cambios?",
            showDenyButton: true,
            denyButtonText: "No",
            confirmButtonText: "Sí"
        }).then(async (respuesta) => {
            if (respuesta.isConfirmed) {
                try {
                    console.log(seguro);
                    console.log(seguro.id_estado);
                    const c = await GestionContratacionFun.activarContratacion({ id: seguro.id_seguro }, navigate);
                    console.log(c);
                    swal.fire({
                        title: "<label>¡Éxito!</label>",
                        text: "El seguro ha sido validado con éxito",
                        icon: "success",
                        timer: 3500,
                    });
                    // Actualizar la lista de seguros
                    const res = await ClientesFun.buscarSegurosContatados(id, navigate);
                    setSeguros(res);
                } catch (error) {
                    console.error("Error al validar seguro:", error);
                    swal.fire({
                        title: "Error",
                        text: "No se pudo validar el seguro. Intente nuevamente.",
                        icon: "error",
                        timer: 3000,
                    });
                }
            }
        });
    };

    // Filtrar seguros según el estado seleccionado
    const segurosFiltrados = seguros.filter(seguro => {
        if (filtroEstado === 'todos') return true;
        if (filtroEstado === 'pendientes') return seguro.id_estado === 3;
        if (filtroEstado === 'procesados') return seguro.id_estado !== 3;
        return true;
    });

    // Calcular estadísticas
    const totalSeguros = seguros.length;
    const segurosPendientes = seguros.filter(s => s.id_estado === 3).length;
    const segurosProcesados = seguros.filter(s => s.id_estado !== 3).length;

    useEffect(() => {
        const traerDatos = async () => {
            try {
                setLoading(true);
                const res = await ClientesFun.buscarSegurosContatados(id, navigate);
                setSeguros(res);
                // 🔴 No validar automáticamente aquí
            } catch (error) {
                console.error("Error al cargar seguros:", error);
                swal.fire({
                    title: "Error",
                    text: "No se pudieron cargar los seguros contratados",
                    icon: "error",
                    timer: 3000,
                });
            } finally {
                setLoading(false);
            }
        };
        traerDatos();
    }, [id, navigate]);

    return (
        <div className={styles.seguroContradoContainer}>
            <h1 className={styles.titulo}>Seguros Contratados</h1>
            
            <div className={styles.infoSection}>
                <div className={styles.infoIcon}>ℹ️</div>
                <div className={styles.infoText}>
                    <h3>Gestión de Seguros Contratados</h3>
                    <p>
                        Aquí puede visualizar y gestionar todos los seguros contratados. 
                        Los seguros pendientes pueden ser validados haciendo clic sobre ellos.
                    </p>
                </div>
            </div>

            {/* Estadísticas */}
            <div className={styles.statsSection}>
                <div className={styles.statCard}>
                    <div className={styles.statNumber}>{totalSeguros}</div>
                    <div className={styles.statLabel}>Total de Seguros</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statNumber}>{segurosPendientes}</div>
                    <div className={styles.statLabel}>Pendientes de Validar</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statNumber}>{segurosProcesados}</div>
                    <div className={styles.statLabel}>Ya Procesados</div>
                </div>
            </div>

            {/* Controles de filtrado */}
            <div className={styles.controlsSection}>
                <div className={styles.filterControls}>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Filtrar por estado:</label>
                        <select 
                            className={styles.filterSelect}
                            value={filtroEstado}
                            onChange={(e) => setFiltroEstado(e.target.value)}
                        >
                            <option value="todos">Todos los seguros</option>
                            <option value="pendientes">Pendientes de validar</option>
                            <option value="procesados">Ya procesados</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Contenido principal */}
            {loading ? (
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <div className={styles.loadingText}>Cargando seguros contratados...</div>
                </div>
            ) : segurosFiltrados.length > 0 ? (
                <div className={styles.segurosGrid}>
                    {segurosFiltrados.map((seguro, index) => (
                        <InfoCardsSeguros
                            key={index}
                            seguro={seguro}
                            color="#4CAF50"
                            onClick={() => {
                                if (seguro.id_estado === 3) {
                                    validarSeguro(seguro);
                                } else {
                                    swal.fire({
                                        title: "⚠️ Advertencia",
                                        text: "Este seguro ya fue procesado.",
                                        icon: "warning",
                                        timer: 3000,
                                    });
                                }
                            }}
                        />
                    ))}
                </div>
            ) : (
                <div className={styles.noSegurosContainer}>
                    <div className={styles.noSegurosIcon}>🛡️</div>
                    <div className={styles.noSegurosTitle}>
                        {filtroEstado === 'todos' 
                            ? 'No hay seguros contratados' 
                            : `No hay seguros ${filtroEstado === 'pendientes' ? 'pendientes de validar' : 'procesados'}`
                        }
                    </div>
                    <div className={styles.noSegurosMessage}>
                        {filtroEstado === 'todos' 
                            ? 'Los seguros contratados aparecerán aquí una vez que se registren.'
                            : 'Ajuste los filtros para ver otros seguros.'
                        }
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeguroContrado;
