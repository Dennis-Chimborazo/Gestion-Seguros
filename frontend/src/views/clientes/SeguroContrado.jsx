import React, { useEffect, useState } from 'react';
import ClientesFun from './ClientesFun';
import { useNavigate } from "react-router-dom";
import InfoCardsSeguros from '../cargando/InfoCardsSeguros';

const SeguroContrado = ({mostrarSeccion, id}) => {
    const navigate = useNavigate();
    const [seguros, setSeguros] = useState([]);

    useEffect(() => {
        const traerDatos = async () => {
            const res = await ClientesFun.buscarSegurosContatados(id, navigate);
            setSeguros(res);
        };
        traerDatos();
    }, []);

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {seguros.map((seguro, index) => (
                <InfoCardsSeguros
                    key={index} 
                    seguro={seguro} 
                    color="#4CAF50" 
                    onClick={() => console.log("Seleccionaste:", seguro)}
                />
            ))}
        </div>
    );
};

export default SeguroContrado;
