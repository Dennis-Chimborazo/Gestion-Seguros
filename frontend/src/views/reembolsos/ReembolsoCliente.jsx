import React, { useEffect, useState } from 'react';
import Select from "react-select";
import ReembolsoFun from './ReembolsoFun';
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";

const ReembolsoCliente = ({ id }) => {
  const [reembolsoPdf, setReembolsoPdf] = useState(null);
  const [reenbolsoError, setReembolsoError] = useState('');
  const navigate = useNavigate();
  const [seguros, setSeguros] = useState([]);
  const [formulario, setFormulario] = useState({ motivo_reemb: '', id_pers: '', id_seguro: '' });

  useEffect(() => {
    const traerDatos = async () => {
      const resSeguros = await ReembolsoFun.traerSegurosContratados(id, navigate);
      setSeguros(resSeguros);
      setFormulario({ ...formulario, id_pers: id });
    };
    traerDatos();
  }, []);

  const enviarReembolso = async (e) => {
    e.preventDefault();
    if (!reembolsoPdf) {
      toast.error("Por favor, suba su factura en formato pdf.");
      return;
    } else {
      console.log(formulario )
      const res = await ReembolsoFun.enviarReembolso({motivo_reemb:formulario.motivo_reemb, id_pers:formulario.id_pers, id_seguro:formulario.id_seguro}, navigate);
      const formDatareembo = new FormData();
      formDatareembo.append('reembolsoPDF', renombrarArchivo(reembolsoPdf, res.id_reemb, id));  // archivo
      await ReembolsoFun.guardarArhivoReembolso(formDatareembo, id, navigate)
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

  const renombrarArchivo = (archivo, idReemb, idPer) => {
    const nuevoNombre = `${idReemb}_${idPer}_reembolso.pdf`;
    return new File([archivo], nuevoNombre, {
      type: archivo.type,
      lastModified: archivo.lastModified,
    });
  };
  const seguroSeleccionado = (val) => {
    setFormulario({ ...formulario, id_seguro: val.value })
  }

  return (
    <div>
      <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
      <div>
        <label htmlFor="">Motivo de reembolso</label>
        <input type="text" id="motivo_reemb" name="motivo_reemb" placeholder="Motivo de reembolso"  onChange={(e)=> setFormulario({...formulario, motivo_reemb: e.target.value})} />
        <Select
          options={Array.isArray(seguros) ? seguros.map((s) => ({
            value: s.id_seguro,
            label: s.nom_tip_seg,
          })) : []}
          placeholder="Seleccione su seguro" 
          onChange={seguroSeleccionado}/>
        <div>
          <div >
            <input
              id="reenbolsoPdfInput"
              type="file"
              accept="application/pdf"
              onChange={cargarPDFReembolso}
            />
            <label htmlFor="reenbolsoPdfInput" >
              Seleccionar archivo
            </label>
            <span >
              {reembolsoPdf ? reembolsoPdf.name : 'Sin archivo seleccionado'}
            </span>

          </div>
          {reenbolsoError && <p>{reenbolsoError}</p>}
          {reembolsoPdf && (
            <div>
              <embed
                src={URL.createObjectURL(reembolsoPdf)}
                type="application/pdf"
                width="100%"
                height="300px"
              />
            </div>
          )}
        </div>

        <button onClick={enviarReembolso}>Enviar</button>
      </div>

    </div>
  );
};

export default ReembolsoCliente;    