import React, { useEffect, useState } from "react";
import ReembolsoFun from "./ReembolsoFun";
import { useNavigate } from "react-router-dom";
import stylesmod from "../estilos/modalDependientes.module.css";
import RechazoReembolso from "./RechazoReembolso";
import swal from "sweetalert2";
import Archivos from "../../services/Archivos";
import "../estilos/ReembolsosAdmin.css";


export function ReembolsosAdmin({ mostrarSeccion }) {
    const [reembolso, setReembolso] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const cerrarModal = () => setIsModalOpen(false);
    const abrirModal = () => setIsModalOpen(true);

    useEffect(() => {
        const cargarDatos = async () => {
            const revData = JSON.parse(localStorage.getItem("revisionReembolso"));
            if (revData && revData.revision) {
                setReembolso(revData.revision);
                const pdf = await Archivos.traerArchivo(revData.revision.id_archivos_cliente, navigate);
                setPdfUrl(pdf);
                localStorage.removeItem("revisionReembolso");
            }
        }
        cargarDatos();
    }, []);

    const manejarAccion = async (accion) => {
        if (accion === 'aceptado') {
            swal.fire({
                title: "<label>Confirmacion</label>",
                text: "Esta seguro de aceptar el reembolso dado una revision rigurosa",
                showDenyButton: true,
                denyButtonText: "No",
                confirmButtonText: "Si"
            }).then(async (respuesta) => {
                if (respuesta.isConfirmed) {
                    try {
                        const descripcion_revision = `Se han revisado los datos proporcionados por el cliente 
                        para validar el reembolso, verificando que cumplan con los requisitos establecidos y se da por aprovado 
                        el mismo.`;
                        const res = await ReembolsoFun.aceptarRevisionReembolso({ descripcion_revision: descripcion_revision, id_reemb: reembolso.id_reemb }, navigate);
                        if (res?.success) {
                            swal.fire({
                                title: "<label> Exito</label>",
                                text: "Se ha aceptado el rembolso",
                                timer: 3500,
                            })
                            mostrarSeccion("listaRembolso");
                        }

                    } catch (error) {
                        swal.fire({
                            title: "<label>Advertencia</label>",
                            text: "Verifique los datos ",
                            timer: 3500,
                        });
                    }
                }
            });

        } else if (accion === 'rechazado') {
            localStorage.setItem("revisionReembolso", JSON.stringify({
                edit: true,
                revision: reembolso
            }));
            abrirModal()
        }
    };

    if (!reembolso) return (
        <div className="reembolsos-admin-container">
            <div className="loading-container">
                <div className="loading-text">Cargando datos del reembolso...</div>
            </div>
        </div>
    );

    return (
        <div className="reembolsos-admin-container">
            <div className="reembolsos-admin-form">
                <h2 className="reembolsos-admin-title">Revisión de Reembolso</h2>
                
                <div className="reembolso-info-section">
                    <div className="reembolso-info-grid">
                        <div className="reembolso-info-item">
                            <span className="reembolso-info-label">Cliente:</span>
                            <span className="reembolso-info-value">{reembolso.nombre}</span>
                        </div>
                        <div className="reembolso-info-item">
                            <span className="reembolso-info-label">Cédula:</span>
                            <span className="reembolso-info-value">{reembolso.cedr_cli}</span>
                        </div>
                        <div className="reembolso-info-item">
                            <span className="reembolso-info-label">Fecha:</span>
                            <span className="reembolso-info-value">{reembolso.fecha_reemb}</span>
                        </div>
                        <div className="reembolso-info-item">
                            <span className="reembolso-info-label">Tipo de Seguro:</span>
                            <span className="reembolso-info-value">{reembolso.nom_tip_seg}</span>
                        </div>
                        <div className="reembolso-info-item">
                            <span className="reembolso-info-label">Estado Actual:</span>
                            <span className={`reembolso-info-value estado-${reembolso.nom_estado?.toLowerCase()}`}>
                                {reembolso.nom_estado}
                            </span>
                        </div>
                        <div className="reembolso-info-item" style={{ gridColumn: '1 / -1' }}>
                            <span className="reembolso-info-label">Motivo:</span>
                            <span className="reembolso-info-value">{reembolso.motivo_reemb}</span>
                        </div>
                    </div>
                </div>

                {pdfUrl && (
                    <div className="pdf-section">
                        <p className="pdf-title">📄 Factura Adjunta</p>
                        <embed
                            className="pdf-embed"
                            src={pdfUrl}
                            type="application/pdf"
                            width="100%"
                            height="400px"
                        />
                    </div>
                )}

                <div className="action-buttons-section">
                    <button 
                        className="action-button action-button-accept" 
                        onClick={() => manejarAccion("aceptado")}
                    >
                        ✓ Aceptar
                    </button>
                    <button 
                        className="action-button action-button-reject" 
                        onClick={() => manejarAccion("rechazado")}
                    >
                        ✗ Rechazar
                    </button>
                </div>

                {isModalOpen && (
                    <div className={stylesmod.overlay}>
                        <div className={stylesmod.modal}>
                            <button className={stylesmod.closeBtn} onClick={cerrarModal}>X</button>
                            <RechazoReembolso cerrarModal={cerrarModal} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ReembolsosAdmin;
