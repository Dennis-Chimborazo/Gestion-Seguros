import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function InfoPagoRechazado({ cerrarModalRechazado }) {
  const navigate = useNavigate();
  const [infoRevision, setInfoRevision] = useState(null);

  useEffect(() => {
    const valores = async () => {
    //   const data = JSON.parse(localStorage.getItem("revisionReembolso"));
    //   if (data && data.revision) {
    //     const res = await ReembolsoFun.infoRechazadoReembolso(
    //       data.revision.id_reemb,
    //       navigate
    //     );
    //     console.log(res);
    //     setInfoRevision(res[0]); // Guardamos la única revisión en el estado
    //     localStorage.removeItem("revisionReembolso");
    //   }
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
          <p>{infoRevision.descripcion_revision}</p>

          <p><strong>📅 Fecha de revisión:</strong> {infoRevision.fecha_revision}</p>
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
