import styles from '../estilos/InfoCardSeguros.module.css';

const InfoCardsSeguros = ({ seguro, onClick }) => {
  
  const getColorByEstado = (estado) => {
    switch (estado) {
      case 1: return '#653ecb'; // Verde - activo
      case 3: return '#2ebbb9'; // Rojo - cancelado
      default: return '#2196F3'; // Azul por defecto
    }
  };

  const color = getColorByEstado(Number(seguro.id_estado));


  return (
    <div
      className={styles.infoCard}
      style={{ backgroundColor: color }}
      onClick={onClick}
    >
      <div className={styles.infoCardContent}>
        <div className={styles.infoCardText}><strong>{seguro.nom_tip_seg}</strong></div>
        <div>Beneficios: {seguro.numbeneficios}</div>
        <div>Fecha de contratación: {seguro.fecha}</div>
        <div>Monto a pagar: ${seguro.monto_seguro}</div>
        <div>Tipo de pago: {seguro.tiempo_seguro}</div>
      </div>
    </div>
  );
};

export default InfoCardsSeguros;
