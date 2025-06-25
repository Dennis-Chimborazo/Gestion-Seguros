import React, { useEffect, useState } from 'react';
import Select from "react-select";
import ReembolsoFun from './ReembolsoFun';
import { useNavigate } from "react-router-dom";

const ReembolsoCliente = ({ id }) => {
  const [reembolsoPdf, setReembolsoPdf] = useState(null);
  const [reenbolsoError, setReembolsoError] = useState('');
  const navigate = useNavigate();
  const [seguros, setSeguros] = useState([]);



  useEffect(() => {
    const traerDatos = async () => {
      const resSeguros = await ReembolsoFun.traerSegurosContratados(id, navigate);
      setSeguros(resSeguros);
    };
    traerDatos();
  }, []);

  const data = [{ value: 1, label: 'hola  ' }]

  const cargarFactura = (e) => {
    const originalFile = e.target.files[0];
    if (originalFile) {
      if (originalFile.type === 'application/pdf') {
        const newFileName = `${id}_cedula.pdf`;
        console.log(newFileName);
        const renamedFile = new File([originalFile], newFileName, {
          type: originalFile.type,
          lastModified: originalFile.lastModified,
        });
        setReembolsoPdf(renamedFile); // Guarda el archivo renombrado en el estado
        setReembolsoError('');
      } else {
        setReembolsoPdf(null);
        setReembolsoError('Por favor, sube un archivo PDF válido.');
        e.target.value = ''; // Limpiar input para poder seleccionar el mismo archivo si fue error
      }
    } else {
      setReembolsoPdf(null);
      setReembolsoError('');
    }
  };

  return (
    <div>
      <div>
        <label htmlFor="">Motivo de reembolso</label>
        <input type="text" id="motivo" name="motivo" placeholder="Motivo de reembolso" />
        <Select
          options={Array.isArray(seguros) ? seguros.map((s) => ({
            value: s.id_seguro,
            label: s.nom_tip_seg,
          })) : []}
          placeholder="Seleccione su seguro" />
        <div>
          <div >
            <input
              id="reenbolsoPdfInput"
              type="file"
              accept="application/pdf"
              onChange={cargarFactura}
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

        <button>Enviar</button>
      </div>

    </div>
  );
};

export default ReembolsoCliente;    