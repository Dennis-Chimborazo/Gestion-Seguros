import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PagosFun from "./PagosFun";

export function InfoPagoRechazado({ cerrarModalRechazado }) {
  const navigate = useNavigate();
  const [infoRevision, setInfoRevision] = useState(null);

  useEffect(() => {
    const valores = async () => {
      try {
        const data = JSON.parse(localStorage.getItem("revisionPago"));
        if (data && data.revision) {
          const res = await PagosFun.infoPagoRechazado(data.revision.id_pago, navigate);
          setInfoRevision(res[0]);
          localStorage.removeItem("revisionPago");
        }
      } catch (error) {
        console.log(error);  // Puedes también mostrar algún estado de error si quieres
      }
    };
    valores();
  }, []);

  const cancelar = (e) => {
    e.preventDefault();
    cerrarModalRechazado();
  };

  return (
    <div>
      <h1>❌ Solicitud de reembolso rechazada</h1>

      {infoRevision ? (
        <div>
          <p><strong>📝 Motivo del rechazo:</strong></p>
          <p>{infoRevision.descripcion_revision_pago}</p>

          <p><strong>📅 Fecha de revisión:</strong> {infoRevision.fecha_revision_pago}</p>
        </div>
      ) : (
        <p>Cargando datos...</p>
      )}

      <div>
        <button onClick={cancelar}>Cerrar</button>
      </div>
    </div>
  );
}

export default InfoPagoRechazado;
