import React, { useEffect, useState } from 'react';
import Select from "react-select";
import ReembolsoFun from './ReembolsoFun';
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import swal from "sweetalert2";
import Archivos from '../../services/Archivos';
import styles from '../estilos/ReembolsoCliente.module.css';

const ReembolsoCliente = ({ id, mostrarSeccion }) => {
  const [reembolsoPdf, setReembolsoPdf] = useState(null);
  const [reenbolsoError, setReembolsoError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [seguros, setSeguros] = useState([]);
  const [formulario, setFormulario] = useState({ motivo_reemb: '', id_pers: '', id_seguro: '' });

  useEffect(() => {
    const traerDatos = async () => {
      const resSeguros = await ReembolsoFun.traerSegurosContratados(id, navigate);
      setSeguros(resSeguros);
      setFormulario(prev => ({ ...prev, id_pers: id }));
    };
    traerDatos();
  }, [id, navigate]);

  const enviarReembolso = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formulario.motivo_reemb.trim()) {
      toast.error("Por favor, ingrese el motivo del reembolso.");
      return;
    }
    
    if (!formulario.id_seguro) {
      toast.error("Por favor, seleccione un seguro.");
      return;
    }
    
    if (!reembolsoPdf) {
      toast.error("Por favor, suba su factura en formato PDF.");
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('tipo', 'PDF');
      formData.append('id_pers', formulario.id_pers);
      formData.append('archivo', renombrarArchivo(reembolsoPdf, id));
      
      const resArchivo = await Archivos.guardarArhivo(formData);
      await ReembolsoFun.enviarReembolso({ 
        id_archivos_cliente: resArchivo.id, 
        motivo_reemb: formulario.motivo_reemb, 
        id_pers: formulario.id_pers, 
        id_seguro: formulario.id_seguro 
      }, navigate);
      
      swal.fire({
        title: "<label>¡Éxito!</label>",
        text: "Solicitud de reembolso enviada con éxito",
        icon: "success",
        timer: 3500,
      });
      
      // Limpiar formulario
      setFormulario({ motivo_reemb: '', id_pers: id, id_seguro: '' });
      setReembolsoPdf(null);
      mostrarSeccion("Reembolsos");
      
    } catch (error) {
      toast.error("Error al enviar la solicitud. Intente nuevamente.");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const cargarPDFReembolso = (e) => {
    const originalFile = e.target.files[0];
    if (originalFile) {
      if (originalFile.type === 'application/pdf') {
        const renamedFile = renombrarArchivo(originalFile, id); // Usa la función 2
        setReembolsoPdf(renamedFile);
        setReembolsoError('');
      } else {
        setReembolsoPdf(null);
        setReembolsoError('Por favor, sube un archivo PDF válido.');
        e.target.value = ''; // Permitir volver a seleccionar el mismo archivo
      }
    } else {
      setReembolsoPdf(null);
      setReembolsoError('');
    }
  };

  const renombrarArchivo = (archivo, idPer) => {
    const nuevoNombre = `${idPer}_reembolso.pdf`;
    return new File([archivo], nuevoNombre, {
      type: archivo.type,
      lastModified: archivo.lastModified,
    });
  };
  const seguroSeleccionado = (val) => {
    setFormulario({ ...formulario, id_seguro: val.value })
  }

  return (
    <div className={styles.reembolsoClienteContainer}>
      <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
      <h2 className={styles.titulo}>Solicitud de Reembolso</h2>
      <form className={styles.reembolsoClienteForm}>
        <div className={styles.formGroup}>
          <label htmlFor="motivo_reemb">Motivo de reembolso</label>
          <input 
            type="text" 
            id="motivo_reemb" 
            name="motivo_reemb" 
            placeholder="Describe el motivo de tu reembolso" 
            value={formulario.motivo_reemb}
            onChange={(e) => setFormulario({ ...formulario, motivo_reemb: e.target.value })} 
          />
        </div>
        
        <div className={styles.selectContainer}>
          <label>Selecciona tu seguro</label>
          <Select
            options={Array.isArray(seguros) ? seguros.map((s) => ({
              value: s.id_seguro,
              label: s.nom_tip_seg,
            })) : []}
            placeholder="Seleccione su seguro"
            onChange={seguroSeleccionado} 
          />
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
            📄 Seleccionar Factura PDF
          </label>
          <div className={styles.fileInfo}>
            <span className={reembolsoPdf ? styles.fileSelected : ''}>
              {reembolsoPdf ? `✅ ${reembolsoPdf.name}` : '📋 Sin archivo seleccionado'}
            </span>
          </div>
          
          {reenbolsoError && <div className={styles.errorMessage}>{reenbolsoError}</div>}
          
          {reembolsoPdf && (
            <div className={styles.pdfPreview}>
              <embed
                src={URL.createObjectURL(reembolsoPdf)}
                type="application/pdf"
                width="100%"
                height="300px"
              />
            </div>
          )}
        </div>

        <button 
          type="button" 
          className={`${styles.botonEnviar} ${loading ? styles.loading : ''}`}
          onClick={enviarReembolso}
          disabled={loading}
        >
          {loading ? 'Enviando...' : '🚀 Enviar Solicitud'}
        </button>
      </form>
    </div>
  );
};

export default ReembolsoCliente;    