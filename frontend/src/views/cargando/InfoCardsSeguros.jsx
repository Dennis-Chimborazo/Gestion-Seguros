import styles from '../estilos/InfoCardSeguros.module.css';

const InfoCard = ({ seguro, color, onClick }) => {
  return (
    <div 
      className={styles.infoCard} 
      style={{ backgroundColor: color }} 
      onClick={onClick}
    >
      <div className={styles.infoCardContent}>
        <div className={styles.infoCardText}><strong>{seguro.nom_tip_seg}</strong></div>
        <div>Beneficios: {seguro.numbeneficios}</div>
        <div>Fecha de contratacion: {seguro.fecha}</div>
        <div>Monto a pagar: ${seguro.monto_seguro}</div>
        <div>Tipo de pago: {seguro.tiempo_seguro}</div>
      </div>
    </div>
  );
};

export default InfoCard;
