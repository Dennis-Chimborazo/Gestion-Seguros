import React, { useEffect, useState } from 'react';
import ClientesFun from './ClientesFun';
import { useNavigate } from "react-router-dom";
import InfoCardsSeguros from '../cargando/InfoCardsSeguros';
import swal from 'sweetalert2';
import GestionContratacionFun from '../gestionContratacion/GestionContratacionFun';

const SeguroContrado = ({ mostrarSeccion, id }) => {
    const navigate = useNavigate();
    const [seguros, setSeguros] = useState([]);

    const validarSeguro = async (seguro) => {
        swal.fire({
            title: "<label>Confirmación</label>",
            text: "¿Está seguro que desea aplicar los cambios?",
            showDenyButton: true,
            denyButtonText: "No",
            confirmButtonText: "Sí"
        }).then(async (respuesta) => {
            if (respuesta.isConfirmed) {
                console.log(seguro);
                console.log( seguro.id_estado);
               const c= await GestionContratacionFun.activarContratacion({ id: seguro.id_seguro }, navigate);
               console.log(c);
                swal.fire({
                    title: "<label>Éxito</label>",
                    text: "El seguro ha sido validado con éxito",
                    timer: 3500,
                });
            }
        });
    };

    useEffect(() => {
        const traerDatos = async () => {
            const res = await ClientesFun.buscarSegurosContatados(id, navigate);
            setSeguros(res);
            // 🔴 No validar automáticamente aquí
        };
        traerDatos();
    }, [id, navigate]);

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {seguros.map((seguro, index) => (
                <InfoCardsSeguros
                    key={index}
                    seguro={seguro}
                    color="#4CAF50"
                    onClick={() => {
                        if (seguro.id_estado === 3) {
                            validarSeguro(seguro);
                        } else {
                            swal.fire({
                                title: "⚠️ Advertencia",
                                text: "Este seguro ya fue procesado.",
                                timer: 3000,
                            });
                        }
                    }}
                />
            ))}
        </div>
    );
};

export default SeguroContrado;
