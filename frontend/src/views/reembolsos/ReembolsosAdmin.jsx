import React, { useEffect, useState } from "react";
import ReembolsoFun from "./ReembolsoFun";
import { useNavigate } from "react-router-dom";
import stylesmod from "../estilos/modalDependientes.module.css";
import RechazoReembolso from "./RechazoReembolso";
import swal from "sweetalert2";


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
                const rutaImagen = await ReembolsoFun.buscarArhivoReembolsoPDF(`${revData.revision.id_reemb}_${revData.revision.id_pers}_reembolso`, revData.revision.id_pers, navigate);
                setPdfUrl(rutaImagen);
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
                        el mmismo.`;
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

    if (!reembolso) return <div>Cargando datos del reembolso...</div>;

    return (
        <div style={{ padding: "2rem" }}>
            <h2>Revisión de Reembolso</h2>
            <p><strong>Cliente:</strong> {reembolso.nombre}</p>
            <p><strong>Cédula:</strong> {reembolso.cedr_cli}</p>
            <p><strong>Motivo:</strong> {reembolso.motivo_reemb}</p>
            <p><strong>Fecha:</strong> {reembolso.fecha_reemb}</p>
            <p><strong>Tipo de Seguro:</strong> {reembolso.nom_tip_seg}</p>
            <p><strong>Estado Actual:</strong> {reembolso.nom_estado}</p>

            {pdfUrl && (
                <div>
                    <p><strong>Factura Adjunta:</strong></p>
                    <embed
                        src={pdfUrl}
                        type="application/pdf"
                        width="100%"
                        height="400px"
                    />
                </div>
            )}

            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
                <button onClick={() => manejarAccion("aceptado")}>Aceptado</button>
                <button onClick={() => manejarAccion("rechazado")}>Rechazado</button>
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
    );
}

export default ReembolsosAdmin;
