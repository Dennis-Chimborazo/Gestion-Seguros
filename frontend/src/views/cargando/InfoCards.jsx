// InfoCard.js
import React from 'react';
import '../estilos/InfoCards.css'; // Importa tus estilos CSS para este componente

const InfoCard = ({ text, color, onClick }) => {
  return (
    <div className="info-card" style={{ backgroundColor: color }} onClick={onClick}>
      <div className="info-card-content">
        <div className="info-card-text">{text}</div>
      </div>
    </div>
  );
};

export default InfoCard;