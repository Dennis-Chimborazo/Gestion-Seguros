import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export function RechazoPago({ cerrarModal, mostrarSeccion }) {
    const navigate = useNavigate();
    const [motivo, setMotivo] = useState('');
    const [reembolso, setReembolso] = useState(null);

    useEffect(() => {
        const valores = () => {
            const editData = JSON.parse(localStorage.getItem("revisionReembolso"));
            if (editData && editData.revision) {
                setReembolso(editData.revision);
                localStorage.removeItem("revisionReembolso");
            }
        }
        valores();
    }, [])

    const rechazarReembolso = async (e) => {
        e.preventDefault()
        swal.fire({
            title: "<label>Confirmacion</label>",
            text: "Esta seguro de rechazar el reembolso dado una revision rigurosa",
            showDenyButton: true,
            denyButtonText: "No",
            confirmButtonText: "Si"
        }).then(async (respuesta) => {
            if (respuesta.isConfirmed) {
                try {
                    // const respuesta = await ReembolsoFun.rechazarRevisionReembolso({ descripcion_revision: motivo, id_reemb: reembolso.id_reemb }, navigate);
                    // if (respuesta?.success) {
                    //     swal.fire({
                    //         title: "<label>Éxito</label>",
                    //         text: "Se ha rechazado el reembolso",
                    //         timer: 3500,
                    //     });
                    //     mostrarSeccion("listaRembolso");
                    // }
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
