import React ,{useState} from "react";
import {Toaster,toast} from "sonner";


export function ModalDependientes({ cerrarModal,setListDependientes }) {

       const [formulario,setFormulario]=useState({cedr_depen:'',tipo_cedr_depen:'',nacion_depen:'',
            nom_depen:'',ape_depen:'',fecha_naci_depen:'',lugar_naci_depen:'',edad_depen:'',
            sexo_depen:'',peso_depen:'',parent_depen:'',estatura_depen:'',discapci:'',diagnos:'',
            fecha_ini:'',fecha_fin:'',boolDis:'',boolCond:''});
        const [tipoIdentificacion, setTipoIdentificacion] = useState('');

        const agregarClaveFormulario  =(e)=>{
            setFormulario({...formulario,[e.target.name]:e.target.value})
        }

        const chechkSexo = (event) => {
            const { id } = event.target;
            document.getElementById("masculino").checked = false;
            document.getElementById("femenino").checked = false;
            document.getElementById(id).checked = true;
            setFormulario({...formulario,sexo_depen:id})
        };

        const chechkTipoIdentificacion = (event) => {
            const { id } = event.target;
            setTipoIdentificacion(prev => prev === id ? '' : id);
            setFormulario({...formulario,tipo_cedr_depen:id})

        };

        const chechkTipoPeso= (event) => {
            const peso= document.getElementById("peso_depen").value;
            if (peso=='') {
                toast.error("Ingrese el peso ");
                document.getElementById("lb").checked = false;
                document.getElementById("kg").checked = false;
            }else{
            const { id } = event.target;
            document.getElementById("lb").checked = false;
            document.getElementById("kg").checked = false;
            document.getElementById(id).checked = true;
            const medida=" "+document.getElementById(id).id;
            setFormulario({...formulario,peso_depen:(peso+medida)})
        }
    
        };

       const valorCondicion=(e)=>{
        const valor = e.target.value.trim();
        const boolDis = valor === "" ? "no" : "si";
      
        setFormulario({
          ...formulario,
          diagnos: valor,
          boolCond: boolDis
        });
       }

       const valorDiscapacidad=(e)=>{
        const valor = e.target.value.trim();
        const boolDis = valor === "" ? "no" : "si";
      
        setFormulario({
          ...formulario,
          discapci: valor,
          boolDis: boolDis
        });
        
       }
       
       const guardarDependiente = () => {
        const discapci = formulario.discapci?.trim() || '';
        const diagnos = formulario.diagnos?.trim() || '';
      
        const boolDis = discapci !== '' ? 'si' : 'no';
        const boolCond = diagnos !== '' ? 'si' : 'no';
      
        const nuevoFormulario = {
          ...formulario,
          boolDis,
          boolCond
        };
      
        setListDependientes(prev => [...prev, nuevoFormulario]);
        cerrarModal();
      };
      
  return (
    <form>
      <h3>Dependiente 2</h3>
      {/* Identificación */}
    <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
      <div>
        <label>Tipo de identificación:</label><br />
        
        <input type="checkbox" id="cedula" checked={tipoIdentificacion === "cedula"}onChange={chechkTipoIdentificacion} />
        <label htmlFor="cedula">Cédula</label>

        <input type="checkbox" id="pasaporte" checked={tipoIdentificacion === "pasaporte"}onChange={chechkTipoIdentificacion}/>
        <label htmlFor="pasaporte">Pasaporte</label>


        <label>Número de identificación</label>
        <input type="text" name="cedr_depen" id="cedr_depen" onChange={agregarClaveFormulario} />
        <label>Nacionadidad</label>
        <input type="text" name="nacion_depen" id="nacion_depen" onChange={agregarClaveFormulario}/>
      </div>

      {/* Datos personales */}
      <div>
        <label>Nombres</label>
        <input type="text" name="nom_depen" id="nom_depen" onChange={agregarClaveFormulario}/>

        <label>Apellidos</label>
        <input type="text"   name="ape_depen" id="ape_depen" onChange={agregarClaveFormulario}/>

        <label>Fecha de nacimiento</label>
        <input type="date"  name="fecha_naci_depen" id="fecha_naci_depen" onChange={agregarClaveFormulario}/>

        <label>Lugar de nacimiento</label>
        <input type="text"   name="lugar_naci_depen" id="lugar_naci_depen" onChange={agregarClaveFormulario}/>

        <label>Edad</label>
        <input type="text" name="edad_depen" id="edad_depen" onChange={agregarClaveFormulario} />

        <label>Parentesco</label>
        <input type="text" name="parent_depen" id="parent_depen" onChange={agregarClaveFormulario}/>
      </div>

      

      {/* Sexo */}
      <div>
        <label>Sexo:</label><br />
        <input type="checkbox" id="masculino"  name="" onChange={chechkSexo} />
        <label htmlFor="sexoM">M</label>
        <input type="checkbox" id="femenino"  name="" onChange={chechkSexo}/>
        <label htmlFor="sexoF">F</label>
      </div>

      {/* Estatura y peso */}
      <div>
        <label>Estatura</label>
        <input type="text"  name="estatura_depen" id="estatura_depen" onChange={agregarClaveFormulario} />
        <label>cm</label>
      </div>

      <div>
        <label>Peso</label>
        <input type="text" name="peso_depen" id="peso_depen" onChange={agregarClaveFormulario}/>
        <input type="checkbox" id="lb"  name="lb" onChange={chechkTipoPeso} />
        <label htmlFor="pesoLb">lb</label>
        <input type="checkbox" id="kg" name="kg"  onChange={chechkTipoPeso} />
        <label htmlFor="pesoKg">kg</label>
      </div>
      <div>
            <h2>Discapacidad</h2>
            <label htmlFor="">Favor detallar los diagnósticos que causaron la discapacidad</label>
            <input type="text" name="discapci" id="discapci" onChange={valorDiscapacidad}/>
          </div>
          <div>
            <h2>Condiciones medicas</h2>
            <label htmlFor="">Diagnóstico</label>
            <input type="text" name="diagnos" id="diagnos" onChange={valorCondicion}/>
            <label htmlFor=""> fecha desde </label>
            <input type="text" name="fecha_ini" id="fecha_ini" onChange={agregarClaveFormulario}/>
            <label htmlFor="">Fecha hasta</label>
            <input type="text" name="fecha_fin" id="fecha_fin" onChange={agregarClaveFormulario}/>
          </div>
        
      <div>
        <button type="button" className="btn-cancelar" onClick={cerrarModal}>Cancelar</button>
        <button type="button" className="btn-guardar" onClick={guardarDependiente}>Guardar</button>
      </div>
    </form>
  );
}

export default ModalDependientes;
