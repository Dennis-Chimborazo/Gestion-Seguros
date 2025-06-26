import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import stylesmod from "../estilos/modalDependientes.module.css";
import swal from "sweetalert2";
import RechazoPago from "./RechazoPago";
import PagosFun from "./PagosFun";
import Archivos from "../../services/Archivos";

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

  if (!pago) return <div>Cargando datos del reembolso...</div>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Revisión de pago</h2>

      <div style={{ marginTop: "1rem" }}>
        <p><strong>Nombre del cliente:</strong> {pago.nombre}</p>
        <p><strong>Cédula:</strong> {pago.cedr_cli}</p>
        <p><strong>Fecha de pago:</strong> {pago.fecha_pago}</p>
        <p><strong>Monto pagado:</strong> ${pago.nonto_pago}</p>
        <p><strong>Comprobante de pago:</strong> {pago.comprobante_pago}</p>
        <p><strong>Tipo de seguro:</strong> {pago.nom_tip_seg}</p>
        <p><strong>Estado:</strong> {pago.nom_estado}</p>
      </div>

      {pdfUrl && (
        <div>
          <p><strong>Comprobante de pago (PDF):</strong></p>
          <embed
            src={pdfUrl}
            data-testid="pdf-embed"
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
            <RechazoPago cerrarModal={cerrarModal} />
          </div>
        </div>
      )}
    </div>
  );

}

export default RevisionPagoAdmin;
