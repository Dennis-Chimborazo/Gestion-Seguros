import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import PagosFun from "./PagosFun";

export function RechazoPago({ cerrarModal, mostrarSeccion }) {
    const navigate = useNavigate();
    const [motivo, setMotivo] = useState('');
    const [pago, setPago] = useState(null);

    useEffect(() => {
        const valores = () => {
            const editData = JSON.parse(localStorage.getItem("revisionReembolso"));
            if (editData && editData.revision) {
                setPago(editData.revision);
                localStorage.removeItem("revisionReembolso");
            }
        }
        valores();
    }, [])

    const rechazarReembolso = async (e) => {
        e.preventDefault()
        swal.fire({
            title: "<label>Confirmacion</label>",
            text: "Esta seguro de que este pago no es valido",
            showDenyButton: true,
            denyButtonText: "No",
            confirmButtonText: "Si"
        }).then(async (respuesta) => {
            if (respuesta.isConfirmed) {
                try {
                    const res = await PagosFun.rechazarRevisionPago({ descripcion_revision_pago: motivo, id_pago: pago.id_pago }, navigate);
                    if (res?.success) {
                        swal.fire({
                            title: "<label>Éxito</label>",
                            text: "Se ha rechazado el pago ",
                            timer: 3500,
                        });
                        mostrarSeccion("reviPagosAdmin");
                    }
                } catch (error) {
                    swal.fire({
                        title: "<label>Advertencia</label>",
                        text: "Verifique los datos ",
                        timer: 3500,
                    });
                }
            }
        });

    }
    const cancelar = (e) => {
        e.preventDefault()
        cerrarModal()
    }

    return (
        <div>
            <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
            <label htmlFor="">Motivo de rechazo</label>
            <input type="text" id="motivo_reemb" name="motivo_reemb" placeholder="Motivo de rechazo" onChange={(e) => setMotivo(e.target.value)} />
            <div>
                <button onClick={cancelar}>cancelar</button>
                <button onClick={rechazarReembolso}>Aceptar</button>
            </div>
        </div>

    );

}

export default RechazoPago;
