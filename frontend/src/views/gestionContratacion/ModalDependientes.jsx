import React, { useState } from "react";
import { Toaster, toast } from "sonner";


export function ModalDependientes({ cerrarModal, setListDependientes, listDependientes }) {
  const [formulario, setFormulario] = useState({
    cedr_depen: '', tipo_cedr_depen: '', nom_depen: ''
    , ape_depen: '', fecha_naci_depen: '', sexo_depen: '', parent_depen: ''
  });
  const [tipoIdentificacion, setTipoIdentificacion] = useState('');

  const agregarClaveFormulario = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value })
  }

  const chechkSexo = (event) => {
    const { id } = event.target;
    document.getElementById("masculino").checked = false;
    document.getElementById("femenino").checked = false;
    document.getElementById(id).checked = true;
    setFormulario({ ...formulario, sexo_depen: id })
  };

  const chechkTipoIdentificacion = (event) => {
    const { id } = event.target;
    setTipoIdentificacion(prev => prev === id ? '' : id);
    setFormulario({ ...formulario, tipo_cedr_depen: id })

  };

  const guardarDependiente = () => {
    const verf = verificarDatos();
    if (verf) {
      let discap_depen = document.getElementById("discapci").value.trim() || '';
      let cond_depen = document.getElementById("condici").value.trim() || '';
      const boolDis = discap_depen !== '' ? 'si' : 'no';
      const boolCond = cond_depen !== '' ? 'si' : 'no';
      let fecha_ini_cond = '';
      let fecha_fin_cond = '';
      if (boolDis === 'no') {
        discap_depen = 's/n'
      }
      if (boolCond === 'no') {
        cond_depen = 's/n';
        fecha_ini_cond = 's/n';
        fecha_fin_cond = 's/n';
      } else {
        fecha_ini_cond = document.getElementById("fecha_ini").value;
        fecha_fin_cond = document.getElementById("fecha_fin").value;
      }
      const nuevoFormulario = {
        ...formulario, discap_depen, cond_depen, boolDis, boolCond, fecha_ini_cond, fecha_fin_cond
      };
      setListDependientes(prev => [...prev, nuevoFormulario]);
      toast.success("Dependiente agregado correctamente");
      cerrarModal();
    }
  };

  const verificarDatos = () => {
    if (Object.values(formulario).every(valor => valor !== '')) {
      const credencial = formulario.cedr_depen.trim().toLowerCase();
      if (!verificarDatosCredenciales(credencial)) {
        const verif = verificarCondiciones()
        if (verif) {
          return true;
        } else {
          toast.error("hay datos incompletos en condiciones medicas ⚠️");
          return false;
        }
      } else {
        toast.error("Ya se encuentra un dependiente con el mismo numero de cedula/pasaporte ⚠️");
        return false;
      }
    } else {
      toast.error("Faltan campos por llenar ⚠️");
      return false;
    }
  }

  const verificarDatosCredenciales = (cedula) => {
    return Array.isArray(listDependientes) &&
      listDependientes.some((a) =>
        a.cedr_depen?.trim().toLowerCase() === cedula?.trim().toLowerCase()
      );
  };

  const verificarCondiciones = () => {
    const cond = document.getElementById("condici")?.value.trim() || '';
    const fechaIni = document.getElementById("fecha_ini")?.value.trim() || '';
    const fechaFin = document.getElementById("fecha_fin")?.value.trim() || '';
    const campos = [cond, fechaIni, fechaFin];
    const vacíos = campos.filter(campo => campo === '').length;
    return vacíos === 3 || vacíos === 0;
  };

  return (
    <form>
      <h3>Dependiente </h3>
      <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
      <div>
        <label>Tipo de identificación:</label><br />
        <input type="checkbox" id="cedula" checked={tipoIdentificacion === "cedula"} onChange={chechkTipoIdentificacion} />
        <label htmlFor="cedula">Cédula</label>
        <input type="checkbox" id="pasaporte" checked={tipoIdentificacion === "pasaporte"} onChange={chechkTipoIdentificacion} />
        <label htmlFor="pasaporte">Pasaporte</label>
        <label>Número de identificación</label>
        <input type="text" name="cedr_depen" id="cedr_depen" onChange={agregarClaveFormulario} />
      </div>
      <div>
        <label>Nombres</label>
        <input type="text" name="nom_depen" id="nom_depen" onChange={agregarClaveFormulario} />
        <label>Apellidos</label>
        <input type="text" name="ape_depen" id="ape_depen" onChange={agregarClaveFormulario} />
        <label>Fecha de nacimiento</label>
        <input type="date" name="fecha_naci_depen" id="fecha_naci_depen" onChange={agregarClaveFormulario} />
        <label>Parentesco</label>
        <input type="text" name="parent_depen" id="parent_depen" onChange={agregarClaveFormulario} />
      </div>
      <div>
        <div>
          <label>Sexo:</label><br />
          <input type="radio" id="masculino" name="sexo_depen" value="masculino"
            onChange={agregarClaveFormulario} />
          <label htmlFor="masculino">M</label>
          <input type="radio" id="femenino" name="sexo_depen" value="femenino"
            onChange={agregarClaveFormulario} />
          <label htmlFor="femenino">F</label>
        </div>
            <h2>Discapacidad</h2>
            <label htmlFor="">Favor detallar los diagnósticos que causaron la discapacidad</label>
            <input type="text" name="discapci" id="discapci"/> */
          </div>
          { <div>
            <h2>Condiciones medicas</h2>
            <label htmlFor="">Diagnóstico</label>
            <input type="text" name="condici" id="condici" />
            <label htmlFor=""> fecha desde </label>
            <input type="date" name="fecha_ini" id="fecha_ini" />
            <label htmlFor="">Fecha hasta</label>
            <input type="date" name="fecha_fin" id="fecha_fin" />
          </div> }
      <div>
        <button type="button" className="btn-cancelar" onClick={cerrarModal}>Cancelar</button>
        <button type="button" className="btn-guardar" onClick={guardarDependiente}>Guardar</button>
      </div>
    </form>
  );
}

export default ModalDependientes;
