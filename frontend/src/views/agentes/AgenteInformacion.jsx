import React, { useEffect, useState } from 'react';
import styles from '../estilos/AgenteInformacion.module.css';
import CargarTablas from '../cargando/CargarTablas';

export function AgenteInformacion() {
  const [agente, setAgente] = useState(null);

  useEffect(() => {
    const cargarDatos = () => {
      const editarData = JSON.parse(localStorage.getItem("AgenteInformacion"));
      if (editarData && editarData.agente) {
        setAgente(editarData.agente);
        localStorage.removeItem("AgenteInformacion");
      }
    };
    cargarDatos();
  }, []);

  if (!agente) {
    return <><CargarTablas /></>;
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Información del Agente</h2>
      <div className={styles.card}>
        <div className={styles.grid}>
          <div><strong>Cédula:</strong> {agente.ced_agente}</div>
          <div><strong>Nombres:</strong> {agente.nom_agente}</div>
          <div><strong>Apellidos:</strong> {agente.ape_agente}</div>
          <div><strong>Email:</strong> {agente.email_agente}</div>
          <div><strong>Teléfono:</strong> {agente.tel_agente}</div>
          <div><strong>Dirección:</strong> {agente.dire_agente}</div>
        </div>
      </div>
    </div>
  );
}

export default AgenteInformacion;
