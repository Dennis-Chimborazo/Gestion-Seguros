import { useEffect, useState } from "react";
import Select from "react-select";
import ReembolsoFun from "../reembolsos/ReembolsoFun";
import { useNavigate } from "react-router-dom";
import GestionContratacionFun from "../gestionContratacion/GestionContratacionFun";
import PagosFun from "./PagosFun";
import swal from "sweetalert2";
import Archivos from "../../services/Archivos";
import { Toaster, toast } from "sonner";
import styles from '../estilos/PagoCliente.module.css';


export function PagoCliente({ id, mostrarSeccion }) {
    const navigate = useNavigate();
    const [seguros, setSeguros] = useState([]);
    const [InfoSeguros, setInfoSeguros] = useState();
    const [loading, setLoading] = useState(false);
    const [formulario, setFormulario] = useState({ nonto_pago: '', comprobante_pago: '', id_pers: '', id_seguro: '' });
    const [compPagoPdf, setCompPagoPdf] = useState(null);
    const [compPagoError, setCompPagoError] = useState('');

    useEffect(() => {
        const traerDatos = async () => {
            const resSeguros = await ReembolsoFun.traerSegurosContratados(id, navigate);
            setSeguros(resSeguros);
            setFormulario(prev => ({ ...prev, id_pers: id }));
        };
        traerDatos();
    }, [id, navigate]);

    const seguroSeleccionado = async (val) => {
        const res = await GestionContratacionFun.buscarSeguroPorId(val.value, navigate);
        setFormulario({ ...formulario, id_seguro: val.value });
        setInfoSeguros(res[0]);
    };

    const handleMontoChange = (e) => {
        const value = e.target.value;
        // Permitir solo números y punto decimal
        const regex = /^\d*\.?\d{0,2}$/;
        if (regex.test(value) || value === '') {
            setFormulario({ ...formulario, nonto_pago: value });
        }
    };

    const handleComprobanteChange = (e) => {
        const value = e.target.value;
        // Permitir solo números
        const regex = /^\d*$/;
        if (regex.test(value) || value === '') {
            setFormulario({ ...formulario, comprobante_pago: value });
        }
    };

    const formatearMonto = (e) => {
        const value = e.target.value;
        if (value && !isNaN(value)) {
            const formattedValue = parseFloat(value).toFixed(2);
            setFormulario({ ...formulario, nonto_pago: formattedValue });
        }
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
        
        // Validaciones
        if (!formulario.id_seguro) {
            toast.error("Por favor, seleccione un seguro.");
            return;
        }
        
        if (!formulario.nonto_pago || parseFloat(formulario.nonto_pago) <= 0) {
            toast.error("Por favor, ingrese un monto válido.");
            return;
        }
        
        if (!formulario.comprobante_pago.trim()) {
            toast.error("Por favor, ingrese el número de comprobante.");
            return;
        }
        
        if (!compPagoPdf) {
            toast.error("Por favor, suba el comprobante de pago en formato PDF.");
            return;
        }

        setLoading(true);
        
        try {
            const formData = new FormData();
            formData.append('tipo', 'PDF');
            formData.append('id_pers', id);
            formData.append('archivo', renombrarArchivo(compPagoPdf, id));
            
            const res = await Archivos.guardarArhivo(formData);
            await PagosFun.enviarPago({
                nonto_pago: formulario.nonto_pago, 
                comprobante_pago: formulario.comprobante_pago,
                id_pers: id, 
                id_seguro: formulario.id_seguro, 
                id_archivos_cliente: res.id
            }, navigate);
            
            swal.fire({
                title: "<label>¡Éxito!</label>",
                text: "Pago enviado con éxito",
                icon: "success",
                timer: 3500,
            });
            
            // Limpiar formulario
            setFormulario({ nonto_pago: '', comprobante_pago: '', id_pers: id, id_seguro: '' });
            setCompPagoPdf(null);
            setInfoSeguros(null);
            mostrarSeccion("RevisionPago");
            
        } catch (err) {
            console.error(err);
            toast.error("Error al enviar el pago. Intente nuevamente.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className={styles.pagoClienteContainer}>
            <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
            <h2 className={styles.titulo}>💳 Realizar Pago de Seguro</h2>
            
            <form className={styles.pagoClienteForm}>
                <div className={styles.selectContainer}>
                    <label>Seleccione su seguro</label>
                    <Select
                        options={Array.isArray(seguros) ? seguros.map((s) => ({
                            value: s.id_seguro,
                            label: s.nom_tip_seg,
                        })) : []}
                        placeholder="Seleccione su seguro"
                        onChange={seguroSeleccionado}
                    />
                </div>

                {InfoSeguros && (
                    <div className={styles.infoSeguroSection}>
                        <div className={styles.infoSeguroTitle}>
                            📋 Información del Seguro
                        </div>
                        <div className={styles.infoSeguroGrid}>
                            <div className={styles.infoSeguroItem}>
                                <span className={styles.infoSeguroLabel}>Valor del Seguro</span>
                                <span className={styles.infoSeguroValue}>
                                    ${InfoSeguros?.monto_seguro ? parseFloat(InfoSeguros.monto_seguro).toLocaleString() : '0'}
                                </span>
                            </div>
                            <div className={styles.infoSeguroItem}>
                                <span className={styles.infoSeguroLabel}>Tipo de Pago</span>
                                <span className={styles.infoSeguroValue}>{InfoSeguros?.tiempo_seguro || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className={styles.formGroupRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="montoDepositado">💰 Monto depositado</label>
                        <input 
                            type="text" 
                            name="montoDepositado" 
                            id="montoDepositado" 
                            placeholder="0.00"
                            value={formulario.nonto_pago}
                            onChange={handleMontoChange}
                            onBlur={formatearMonto}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label htmlFor="numeroComprobante">🧾 Número de comprobante</label>
                        <input 
                            type="text" 
                            name="numeroComprobante" 
                            id="numeroComprobante" 
                            placeholder="Solo números"
                            value={formulario.comprobante_pago}
                            onChange={handleComprobanteChange}
                        />
                    </div>
                </div>

                <div className={styles.fileUploadSection}>
                    <input
                        id="reenbolsoPdfInput"
                        type="file"
                        accept="application/pdf"
                        onChange={cargarPDFReembolso}
                        className={styles.fileInput}
                    />
                    <label htmlFor="reenbolsoPdfInput" className={styles.fileLabel}>
                        📎 Seleccionar Comprobante PDF
                    </label>
                    <div className={styles.fileInfo}>
                        <span className={compPagoPdf ? styles.fileSelected : ''}>
                            {compPagoPdf ? `✅ ${compPagoPdf.name}` : '📋 Sin archivo seleccionado'}
                        </span>
                    </div>
                    
                    {compPagoError && <div className={styles.errorMessage}>{compPagoError}</div>}
                    
                    <div className={styles.pdfPreview}>
                        {compPagoPdf ? (
                            <embed
                                src={URL.createObjectURL(compPagoPdf)}
                                type="application/pdf"
                                width="100%"
                                height="300px"
                            />
                        ) : (
                            <div className={styles.pdfPlaceholder}>
                                <div className={styles.icon}>📄</div>
                                <p>Previsualización del PDF</p>
                                <p>Sube un archivo para ver la vista previa</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.buttonContainer}>
                    <button 
                        type="button" 
                        className={styles.botonCancelar}
                        onClick={() => mostrarSeccion("RevisionPago")}
                    >
                        ❌ Cancelar
                    </button>
                    <button 
                        type="button" 
                        className={`${styles.botonEnviar} ${loading ? styles.loading : ''}`}
                        onClick={enviarPago}
                        disabled={loading}
                    >
                        {loading ? 'Enviando...' : '🚀 Enviar Pago'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default PagoCliente;
