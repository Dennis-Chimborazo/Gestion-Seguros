import React, { useEffect, useState } from 'react';
import CargarTablas from '../cargando/CargarTablas';
import SegurosAdminFun from './SegurosAdminFun';
import { useNavigate } from 'react-router-dom';
import styles from '../estilos/SeguroAdminInformacion.module.css';

export function SeguroAdminInformacion() {
  const [seguros, setSeguros] = useState(null);
  const [categoria, setCategoria] = useState('');
  const [beneficios, setBeneficios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarDatos = async () => {
      const data = JSON.parse(localStorage.getItem('SeguroAdminInformacion'));

      if (data && data.seguroInfo) {
        setSeguros(data.seguroInfo);

        const beneficiosData = await SegurosAdminFun.buscarInformacionBenCateg(
          data.seguroInfo.id_tip_seg,
          navigate
        );

        if (beneficiosData.length > 0) {
          setCategoria(beneficiosData[0].nom_categoria);
          setBeneficios(beneficiosData.map(item => item.nom_beneficios));
        }

        localStorage.removeItem('SeguroAdminInformacion');
      } else {
        console.log('No se encontró ningún registro');
      }
    };

    cargarDatos();
  }, []);

  return (
    <div className={styles.container}>
      {seguros ? (
        <>
          <h2 className={styles.titulo}>Información del Seguro</h2>
          <div className={styles.seguroInfo}>
            <p><strong>Nombre:</strong> {seguros.nom_tip_seg}</p>
            <p><strong>Descripción:</strong> {seguros.descrip_tip_seg}</p>
            <p><strong>Pago:</strong> {seguros.pago_tip_seg}</p>
            <p><strong>Suma asegurada:</strong> {seguros.suma_tip_seg}</p>
          </div>

          <h3 className={styles.subtitulo}>Categoría: {categoria}</h3>
          <ul className={styles.beneficios}>
            {beneficios.map((beneficio, index) => (
              <li key={index}>{beneficio}</li>
            ))}
          </ul>
        </>
      ) : (
        <CargarTablas />
      )}
    </div>
  );
}

export default SeguroAdminInformacion;
