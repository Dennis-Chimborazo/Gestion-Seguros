import React, { useEffect, useState } from 'react';
import ClientesFun from './ClientesFun';
import { useNavigate } from "react-router-dom";

const SeguroContrado = ({mostrarSeccion, id}) => {
    const navigate = useNavigate();
    useEffect(() => {
        const traerDatos = async () => {
            console.log(id)
            const res = await ClientesFun.buscarSegurosContatados(id,navigate);
        };
        traerDatos();
    }, []);
 return (
    <div>
        <div>
          
        </div>

    </div>
  );
};

export default SeguroContrado;    