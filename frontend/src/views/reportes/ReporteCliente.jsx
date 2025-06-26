import React, { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import ClientesFun from "../clientes/ClientesFun";
import ReportesFun from "./ReportesFun";
import PDFReporte from "./PDFReporte";

export function ReporteCliente({ cerrarModal }) {
    const navigate = useNavigate();
    const [cedula, setCedula] = useState('');

    const rechazarReembolso = async (e) => {
        const dataCliente = await ClientesFun.buscarClienteCedula(cedula, navigate);
        if (dataCliente.length > 0) {
            const data = await ReportesFun.InformacionCliente(dataCliente[0].id_pers, navigate);
            const pdf = new PDFReporte("cliente", 1); // tipo cliente
            await pdf.init();
            await pdf.generarReporteClienteConDatos(data);
            cerrarModal()

        } else {
            toast.error("Ciente no encontrado");
        }
    }
    const cancelar = (e) => {
        e.preventDefault()
        cerrarModal()
    }

    return (
        <div>
            <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
            <h3>Reportes Clientes</h3>
            <label htmlFor="">Ingrese la cedula: </label>
            <input type="text" id="ciente" name="ciente" placeholder="Ejem: 100000" onChange={(e) => setCedula(e.target.value)} />
            <div>
                <button onClick={cancelar}>cancelar</button>
                <button onClick={rechazarReembolso}>Aceptar</button>
            </div>
        </div>
    );
}

export default ReporteCliente;
