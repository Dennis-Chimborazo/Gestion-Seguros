import React ,{useState,useEffect} from "react";
import {Toaster,toast} from "sonner";
import ClientesFun from "./ClientesFun";
import swal from "sweetalert2";
import { Await, useNavigate } from "react-router-dom";

export function ModalCuentasClientes({ cerrarModal,datosCliente,mostrarSeccion}) {
  const navigate = useNavigate();
  const [formulario,setFormulario]= useState({user:'',pass:'',confirmPassword:''})

 useEffect(()=>{
  const valores =()=>{
    console.log(datosCliente)
    setFormulario({...formulario,user:datosCliente.email_pers})
  }
  valores();
 },[]) 

 const asignarValores=(e)=>{
    setFormulario({...formulario,[e.target.name]:e.target.value})
 }
 const crearCuenta=async(e)=>{
    e.preventDefault()
    
    if (verificarDatos()) {
     const res= await ClientesFun.guardarCliente(datosCliente,navigate);
      const resCuent= await ClientesFun.crearCuenta(formulario,navigate)
              if (resCuent) {
    const urlRandom=crearCadenaRandom()
    const f= ({id_pers:resCuent.id_pers,url:urlRandom});
    const token = await ClientesFun.peticionValidacionEmail(f,navigate);
    const email=({to:'ddcdalex@gmail.com',token:urlRandom});
    const resEmail= await ClientesFun.enviarValidacionEmail(email,navigate)
              swal.fire({
                          title:"<label>Exito</label>",
                          text:"Nuevo usuario creado",
                          timer:3500,
                      })
              mostrarSeccion("clientes")
          }
    } 
  }

  const crearCadenaRandom = () => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let cadenaAleatoria = '';
  for (let i = 0; i < 20; i++) {
    const indiceAleatorio = Math.floor(Math.random() * caracteres.length);
    cadenaAleatoria += caracteres.charAt(indiceAleatorio);
  }
  return cadenaAleatoria;
};

 const cancelarCuenta=(e)=>{
  e.preventDefault()
  cerrarModal()
 }
 const verificarDatos=()=>{
  console.log(formulario)
        if (Object.values(formulario).every(valor => valor !== '')) {
          if (formulario.pass===formulario.confirmPassword) {
            return true;
          }else{
            toast.error("Las contraseña no coinciden ⚠️");
            return false;
          }
        }else{
            toast.error("Faltan campos por llenar modal⚠️");
            return false;
        }
 }


return (
  <form>
    <h3>Cuenta de usuario</h3>
    <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />

    <p style={{ marginBottom: "1rem", fontStyle: "italic", color: "#2c3e50" }}>
      ✅ Ha completado correctamente los datos requeridos. Ahora, por favor cree una cuenta de usuario para acceder y hacer uso del sistema.
    </p>

    <label htmlFor="usuario">Usuario</label>
    <input type="text" id="user" name="user" value={formulario.user||''}/>

    <label htmlFor="password">Ingrese una contraseña</label>
    <input type="text" id="pass"  name="pass" onChange={asignarValores}/>

    <label htmlFor="confirmPassword">Vuelva a escribir la contraseña</label>
    <input type="text" id="confirmPassword" name="confirmPassword" onChange={asignarValores}/>
    <div>
    <button onClick={cancelarCuenta}>cancelar</button>
    <button onClick={crearCuenta}>Crear</button>

    </div>
  </form>
);

}

export default ModalCuentasClientes;
