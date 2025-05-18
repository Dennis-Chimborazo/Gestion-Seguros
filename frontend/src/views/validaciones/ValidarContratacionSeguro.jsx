import React, { useState } from "react";
import { useParams } from "react-router-dom";

export function ValidarContratacionSeguro() {
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  
  const handleContratar = () => {
    if (aceptaTerminos) {
      // Aquí puedes enviar confirmación al backend si lo deseas
    } else {
      alert("Debe aceptar los términos y condiciones para continuar.");
    }
  };

  

  return (
    <div className="container" style={{ padding: "20px", maxWidth: "700px", margin: "auto" }}>
      <h2>Validar Contratación de Seguro</h2>
      {/* <p><strong>Cédula:</strong> {cedula}</p> */}

      <div style={{ margin: "20px 0" }}>
        <h4>Detalles del Seguro:</h4>
        {/* <ul>
          <li><strong>Compañía:</strong> Seguros S.A.</li>
          <li><strong>Tipo de Seguro:</strong> Vida Individual</li>
          <li><strong>Duración:</strong> 1 año renovable</li>
          <li><strong>Monto asegurado:</strong> $3,500</li>
          <li><strong>Periodicidad de pago:</strong> Trimestral</li>
        </ul> */}
      </div>

      <div style={{ margin: "20px 0" }}>
        <h4>Términos y Condiciones</h4>
        <p>
          Al aceptar estos términos, el asegurado confirma que ha leído y comprendido las condiciones del contrato con Seguros S.A.,
           incluyendo cláusulas de cobertura, exclusiones, renovación automática y derecho de cancelación. 
           Este contrato estará sujeto a las leyes del país en que se emite.
        </p>

        <label>
          <input
            type="checkbox"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
          />{" "}
          Acepto los términos y condiciones del contrato de seguro.
        </label>
      </div>

      <button
        onClick={handleContratar}
        disabled={!aceptaTerminos}
        style={{
          padding: "10px 20px",
          backgroundColor: aceptaTerminos ? "#007bff" : "#ccc",
          color: "white",
          border: "none",
          cursor: aceptaTerminos ? "pointer" : "not-allowed"
        }}
      >
        Aceptar Contratación
      </button>
    </div>
  );
}

export default ValidarContratacionSeguro;
