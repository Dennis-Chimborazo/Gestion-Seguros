import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import stylesmod from "../estilos/modalDependientes.module.css";
import swal from "sweetalert2";
import RechazoPago from "./RechazoPago";
import PagosFun from "./PagosFun";
import Archivos from "../../services/Archivos";
import "../estilos/RevisionPagoAdmin.css";

export function RevisionPagoAdmin({ mostrarSeccion }) {
  const [pago, setPago] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const cerrarModal = () => setIsModalOpen(false);
  const abrirModal = () => setIsModalOpen(true);

  useEffect(() => {
    const cargarDatos = async () => {
      const revData = JSON.parse(localStorage.getItem("revisionPagos"));
      if (revData && revData.revision) {
                console.log(revData.revision)

        setPago(revData.revision);
        const pdf = await Archivos.traerArchivo(revData.revision.id_archivos_cliente, navigate);
        setPdfUrl(pdf);
        localStorage.removeItem("revisionPagos");
      }
    }
    cargarDatos();
  }, []);

  const manejarAccion = async (accion) => {
    if (accion === 'aceptado') {
      swal.fire({
        title: "<label>Confirmacion</label>",
        text: "Esta seguro haber validado la informacion el pago",
        showDenyButton: true,
        denyButtonText: "No",
        confirmButtonText: "Si"
      }).then(async (respuesta) => {
        if (respuesta.isConfirmed) {
          try {
            const descripcion = `Se han revisado los datos proporcionados por el cliente 
                        para validar el pago, verificando que cumplan con los requisitos establecidos`;
            const res = await PagosFun.aceptarRevisionPago({ descripcion_revision_pago: descripcion, id_pago: pago.id_pago }, navigate);
            if (res?.success) {
              swal.fire({
                title: "<label> Exito</label>",
                text: "Se ha vvalidado el pago con éxito",
                timer: 3500,
              })
              mostrarSeccion("reviPagosAdmin");
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
        revision: pago
      }));
      abrirModal()
    }
  };

  if (!pago) return (
    <div className="revision-pago-container">
      <div className="loading-container">
        <div className="loading-text">Cargando datos del pago...</div>
      </div>
    </div>
  );

  return (
    <div className="revision-pago-container">
      <div className="revision-pago-form">
        <h2 className="revision-pago-title">Revisión de Pago</h2>
        
        <div className="pago-info-section">
          <div className="pago-info-grid">
            <div className="pago-info-item">
              <span className="pago-info-label">Nombre del Cliente:</span>
              <span className="pago-info-value">{pago.nombre}</span>
            </div>
            <div className="pago-info-item">
              <span className="pago-info-label">Cédula:</span>
              <span className="pago-info-value">{pago.cedr_cli}</span>
            </div>
            <div className="pago-info-item">
              <span className="pago-info-label">Fecha de Pago:</span>
              <span className="pago-info-value fecha-pago">{pago.fecha_pago}</span>
            </div>
            <div className="pago-info-item">
              <span className="pago-info-label">Monto Pagado:</span>
              <span className="pago-info-value monto-destacado">${pago.nonto_pago}</span>
            </div>
            <div className="pago-info-item">
              <span className="pago-info-label">Tipo de Seguro:</span>
              <span className="pago-info-value">{pago.nom_tip_seg}</span>
            </div>
            <div className="pago-info-item">
              <span className="pago-info-label">Estado:</span>
              <span className={`pago-info-value estado-${pago.nom_estado?.toLowerCase()}`}>
                {pago.nom_estado}
              </span>
            </div>
            <div className="pago-info-item" style={{ gridColumn: '1 / -1' }}>
              <span className="pago-info-label">Comprobante de Pago:</span>
              <span className="pago-info-value comprobante-info">{pago.comprobante_pago}</span>
            </div>
          </div>
        </div>

        {pdfUrl && (
          <div className="pdf-section">
            <p className="pdf-title">📄 Comprobante de Pago (PDF)</p>
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
              <RechazoPago cerrarModal={cerrarModal} />
            </div>
          </div>
        )}
      </div>
    </div>
  );

}

export default RevisionPagoAdmin;
