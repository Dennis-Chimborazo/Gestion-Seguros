import React, { useEffect, useState } from 'react';
import styles from '../estilos/ClientesInformacion.module.css';
import CargarTablas from '../cargando/CargarTablas';

export function ClientesInformacion() {
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    const cargarDatos = () => {
      const editarData = JSON.parse(localStorage.getItem("clientesInformacion"));
      if (editarData && editarData.cliente) {
        setCliente(editarData.cliente);
        localStorage.removeItem("clientesInformacion");
      }
    };
    cargarDatos();
  }, []);

  if (!cliente) {
    return <><CargarTablas /></>;
  }

  return (
    <div className={styles.clientInfoContainer}>
      <h2 className={styles.clientInfoTitle}>Información del Cliente</h2>
      <div className={styles.clientInfoCard}>
        <div className={styles.clientInfoGrid}>
          <div><strong>Cédula:</strong> {cliente.cedr_cli}</div>
          <div><strong>Tipo de Cédula:</strong> {cliente.tipo_cedr_cli}</div>

          <div><strong>Nacionalidad:</strong> {cliente.nacion_cli}</div>
          <div><strong>Nombres:</strong> {cliente.nom_cli}</div>

          <div><strong>Apellidos:</strong> {cliente.ape_cli}</div>
          <div><strong>Fecha de Nacimiento:</strong> {cliente.fecha_naci_cli}</div>

          <div><strong>Sexo:</strong> {cliente.sexo_cli}</div>
          <div><strong>Edad:</strong> {cliente.edad_pers}</div>
          <div><strong>Estatura:</strong> {cliente.estatura_cli}</div>
          <div><strong>Peso:</strong> {cliente.peso_cli}</div>

          <div><strong>Estado Civil:</strong> {cliente.estado_civil_pers}</div>
          <div><strong>Lugar de Nacimiento:</strong> {cliente.lugar_naci_cli}</div>

          <div><strong>Email:</strong> {cliente.email_pers}</div>
          <div><strong>Teléfono:</strong> {cliente.tel_pers}</div>

          <div><strong>Celular:</strong> {cliente.cel_pers}</div>

          <div><strong>Parroquia:</strong> {cliente.parroq_cli}</div>
          <div><strong>Dirección:</strong> {cliente.calle_princ_pers} y {cliente.calle_secun_pers}</div>


        </div>
      </div>
    </div>
  );
}

export default ClientesInformacion;
