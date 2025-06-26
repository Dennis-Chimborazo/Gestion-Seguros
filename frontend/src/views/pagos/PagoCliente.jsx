import { useEffect, useState } from "react";
import Select from "react-select";
import ReembolsoFun from "../reembolsos/ReembolsoFun";
import { useNavigate } from "react-router-dom";
import GestionContratacionFun from "../gestionContratacion/GestionContratacionFun";
import PagosFun from "./PagosFun";
import swal from "sweetalert2";
import Archivos from "../../services/Archivos";


export function PagoCliente({ id,mostrarSeccion }) {
    const navigate = useNavigate();
    const [seguros, setSeguros] = useState([]);
    const [InfoSeguros, setInfoSeguros] = useState();
    const [formulario, setFormulario] = useState({ nonto_pago: '', comprobante_pago: '', id_pers: '', id_seguro: '' });
    const [compPagoPdf, setCompPagoPdf] = useState(null);
    const [compPagoError, setCompPagoError] = useState('');

    useEffect(() => {
        const traerDatos = async () => {
            const resSeguros = await ReembolsoFun.traerSegurosContratados(id, navigate);
            setSeguros(resSeguros);
            setFormulario({ ...formulario, id_pers: id });
        };
        traerDatos();
    }, []);

    const seguroSeleccionado = async (val) => {
        const res = await GestionContratacionFun.buscarSeguroPorId(val.value, navigate);
        setFormulario({ ...formulario, id_seguro: val.value });
        setInfoSeguros(res[0]);
    };

    const cargarPDFReembolso = (e) => {
        const originalFile = e.target.files[0];
        if (originalFile) {
            if (originalFile.type === 'application/pdf') {
                const renamedFile = renombrarArchivo(originalFile, id);
                setCompPagoPdf(renamedFile);
                setCompPagoError('');
            } else {
                setCompPagoPdf(null);
                setCompPagoError('Por favor, sube un archivo PDF válido.');
                e.target.value = ''; // Permite volver a seleccionar el mismo archivo
            }
        } else {
            setCompPagoPdf(null);
            setCompPagoError('');
        }
    };

    const renombrarArchivo = (archivo, idReemb) => {
        const nuevoNombre = `${idReemb}_ComprobantePago.pdf`;
        return new File([archivo], nuevoNombre, {
            type: archivo.type,
            lastModified: archivo.lastModified,
        });
    };

    const enviarPago = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('tipo', 'PDF');
        formData.append('id_pers', id);
        formData.append('archivo', renombrarArchivo(compPagoPdf, id));
        try {
            const res = await Archivos.guardarArhivo(formData); // sin `idCliente`, ya está en formData
            await PagosFun.enviarPago({
                nonto_pago: formulario.nonto_pago, comprobante_pago: formulario.comprobante_pago,
                id_pers: id, id_seguro: formulario.id_seguro, id_archivos_cliente: res.id
            }, navigate);
            swal.fire({
                title: "<label>Éxito</label>",
                text: "Pago enviado con éxito",
                timer: 3500,
            });
            mostrarSeccion("RevisionPago");
        } catch (err) {
            console.error(err);
        }
    };
    return (
        <div>
            <div>
                <label htmlFor="">Seleccione su seguro</label>
                <Select
                    options={Array.isArray(seguros) ? seguros.map((s) => ({
                        value: s.id_seguro,
                        label: s.nom_tip_seg,
                    })) : []}
                    placeholder="Seleccione su seguro"
                    onChange={seguroSeleccionado}
                />
            </div>

            <div>
                <label htmlFor="">Valor : {InfoSeguros?.monto_seguro}</label>
                <label htmlFor="">Tipo de Pago: {InfoSeguros?.tiempo_seguro}</label>
            </div>
            <div>
                <label htmlFor="">Monto depositado:</label>
                <input type="number" name="montoDepositado" id="montoDepositado" onChange={(e) => setFormulario({ ...formulario, nonto_pago: e.target.value })} />
                <label htmlFor="">Numero comprobante</label>
                <input type="number" name="numeroComprobante" id="numeroComprobante" onChange={(e) => setFormulario({ ...formulario, comprobante_pago: e.target.value })} />
            </div>
            <div>
                <label htmlFor="reenbolsoPdfInput">Comprobante de Pago</label>
                <input
                    id="reenbolsoPdfInput"
                    type="file"
                    accept="application/pdf"
                    onChange={cargarPDFReembolso}
                />
            </div>

            <br />
            {compPagoError && <p style={{ color: 'red' }}>{compPagoError}</p>}

            <div style={{ position: 'relative' }}>
                <embed
                    src={compPagoPdf ? URL.createObjectURL(compPagoPdf) : ''}
                    type="application/pdf"
                    width="100%"
                    height="300px"
                />
                {!compPagoPdf && (
                    <div style={{
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '300px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f9f9f9',
                        color: '#777',
                        border: '1px dashed #ccc'
                    }}>
                        <p>Previsualización vacía. Por favor, sube un archivo PDF.</p>
                    </div>
                )}
            </div>
            <div>
                <button>Cancelar</button>
                <button onClick={enviarPago}>Enviar</button>

            </div>
        </div>
    );
}

export default PagoCliente;
