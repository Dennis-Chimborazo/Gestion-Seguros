import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReembolsoFun from "./ReembolsoFun";

export function InfoAceptadoReembolso({ cerrarModalAceptado }) {
  const navigate = useNavigate();
  const [infoRevision, setInfoRevision] = useState(null);

  useEffect(() => {
    const valores = async () => {
      const data = JSON.parse(localStorage.getItem("revisionReembolso"));
      if (data && data.revision) {
        localStorage.removeItem("revisionReembolso");
        const res = await ReembolsoFun.infoAceptadoReembolso(
          data.revision.id_reemb,
          navigate
        );
        setInfoRevision(res[0]); // Guardamos la respuesta en el estado
      }
    };
    valores();
  }, []);

  const cancelar = (e) => {
    e.preventDefault();
    cerrarModalAceptado();
  };

  return (
    <div>
      <h1>✅ Solicitud de reembolso aceptada</h1>

      {infoRevision ? (
        <div>
          <p><strong>📝 Descripción:</strong></p>
          <p>{infoRevision.descripcion_revision}</p>

          <p><strong>📅 Fecha de revisión:</strong> {infoRevision.fecha_revision}</p>

          <p><strong>🏦 Cuenta bancaria:</strong></p>
          <ul>
            <li><strong>Tipo:</strong> {infoRevision.tipo_cuent_ban}</li>
            <li><strong>Nombre:</strong> {infoRevision.nom_cuent_ban}</li>
            <li><strong>Número:</strong> {infoRevision.mun_cuent_ban}</li>
          </ul>
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

export default InfoAceptadoReembolso;
