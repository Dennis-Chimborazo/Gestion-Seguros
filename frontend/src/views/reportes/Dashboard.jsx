import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    PieChart, Pie, Cell, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    ResponsiveContainer
} from "recharts";
import stylesmod from "../estilos/modalDependientes.module.css";
import styles from '../estilos/Dashboard.module.css';
import PDFReporte from "./PDFReporte";
import ReportesFun from "./ReportesFun";
import ReporteCliente from "./ReporteCliente";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EF5", "#E26FC4"];

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [pagos, setPagos] = useState([]);
    const [reembolsos, setReembolsos] = useState([]);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const cerrarModal = () => setIsModalOpen(false);
    const abrirModal = () => setIsModalOpen(true);
    useEffect(() => {
        const fetchData = async () => {
            const result = await ReportesFun.traerInformacion(navigate);
            console.log(result)
            const normalizar = (arr) =>
                Array.isArray(arr)
                    ? arr.map((item) => ({ ...item, total: Number(item.total) }))
                    : [];

            setData({
                total_clientes: result.total_clientes,
                total_seguros: result.total_seguros,
                seguros_por_tipo: normalizar(result.seguros_por_tipo),
            });

            setPagos(normalizar(result.pagos_por_estado));
            setReembolsos(normalizar(result.reembolsos_por_estado));
        };

        fetchData();
    }, []);

    const reporteGeneral = async () => {
        const data = {
            total_clientes: 2,
            total_seguros: 2,
            seguros_por_tipo: [
                { nom_tip_seg: 'vida nueva', total: '0' },
                { nom_tip_seg: 'Seguro de Vida Platinum', total: '0' },
                { nom_tip_seg: 'Seguro Vehicular Full', total: '1' },
                { nom_tip_seg: 'Seguro Hogar Completo', total: '1' }
            ]
        };

        const pdf = new PDFReporte("general", 0); // El ID ya no se usará en este caso
        await pdf.init();
        await pdf.generarReporteGeneralConDatos(data);
    };

    const reporteIndividual = async () => {
        abrirModal()
    };

    if (!data) return <p className={styles.loadingMessage}>Cargando dashboard...</p>;

    return (
        <div className={styles.dashboardContainer}> {/* Apply main container style */}

            <h2 className={styles.dashboardTitle}>Reporte general</h2> {/* Apply title style */}
            <button onClick={reporteGeneral}>PDF Reporte General</button>
            <button onClick={reporteIndividual}>PDF Reporte Cliente</button>
            <div className={styles.summaryCardsGrid}> {/* Apply grid style for summary cards */}
                <SummaryCard title="Clientes" value={data.total_clientes} />
                <SummaryCard title="Seguros contrados" value={data.total_seguros} />
                <SummaryCard title="Tipos de Seguro" value={data.seguros_por_tipo.length} />
            </div>

            <div className={styles.chartsGrid}> {/* Apply grid style for charts */}
                <div className={styles.chartContainer}> {/* Apply individual chart container style */}
                    <h3 className={styles.chartTitle}>Total seguros contratados  </h3> {/* Apply chart title style */}
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={data.seguros_por_tipo}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="nom_tip_seg"
                                angle={-45}
                                textAnchor="end"
                                interval={0}
                                height={80}
                            />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="total" fill="#2980b9" />
                        </BarChart>
                    </ResponsiveContainer>

                </div>

                {/* Pagos */}
                <div className={styles.chartContainer}>
                    <h3 className={styles.chartTitle}>Pagos</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pagos}
                                dataKey="total"
                                nameKey="nom_estado"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {pagos.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Reembolsos */}
                <div className={styles.chartContainer}>
                    <h3 className={styles.chartTitle}>Reembolsos</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={reembolsos}
                                dataKey="total"
                                nameKey="nom_estado"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label
                            >
                                {reembolsos.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>


            </div>
            {isModalOpen && (
                <div className={stylesmod.overlay}>
                    <div className={stylesmod.modal}>
                        <button className={stylesmod.closeBtn} onClick={cerrarModal}>X</button>
                        <ReporteCliente cerrarModal={cerrarModal} />
                    </div>
                </div>
            )}
        </div>
    );
};

const SummaryCard = ({ title, value }) => (
    <div className={styles.summaryCard}> {/* Apply summary card style */}
        <h4 className={styles.summaryCardTitle}>{title}</h4> {/* Apply summary card title style */}
        <p className={styles.summaryCardValue}>{value}</p> {/* Apply summary card value style */}
    </div>
);

export default Dashboard;