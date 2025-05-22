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
      try {
        const res= await ClientesFun.guardarCliente(datosCliente,navigate);
        console.log("----- res.id_pers")
        console.log(res.id_pers)
        console.log("-----------")

        const cuenta={idpersona:res.id_pers,user:formulario.user,pass:formulario.pass}
        const resCuent= await ClientesFun.crearCuenta(cuenta,navigate)
        if (resCuent) {
          const urlRandom=crearCadenaRandom()
          const f= ({id_pers:res.id_pers,url:urlRandom});
          await ClientesFun.generarTokenValidacion(f,navigate);
          const email=({to:datosCliente.email_pers,token:urlRandom});
          await ClientesFun.enviarCorreoEmail(email,navigate)
          swal.fire({
                      title:"<label>Exito</label>",
                      text:"Nuevo usuario creado",
                      timer:3500,
                  })
          mostrarSeccion("clientes")
        }
        
      } catch (error) {
        swal.fire({
          title:"<label>Exito</label>",
          text:"Ya existe un usuario con el mismo numero de identificacion",
          timer:3500,
      })
        cerrarModal()
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
        if (Object.values(formulario).every(valor => valor !== '')) {
          if (formulario.pass === formulario.confirmPassword) {
            return true;
          } else {
            toast.error("Las contraseñas no coinciden ⚠️"); // ← corregido "contraseña" → "contraseñas"
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
    <input type="text"  placeholder="Usuario" id="user" name="user" value={formulario.user||''}/>

    <label htmlFor="password">Ingrese una contraseña</label>
    <input type="text" placeholder="Ingrese una contraseña" id="pass"  name="pass" onChange={asignarValores}/>

    <label htmlFor="confirmPassword">Vuelva a escribir la contraseña</label>
    <input type="text" placeholder="Vuelva a escribir la contraseña" id="confirmPassword" name="confirmPassword" onChange={asignarValores}/>
    <div>
    <button onClick={cancelarCuenta}>cancelar</button>
    <button onClick={crearCuenta}>Crear</button>

    </div>
  </form>
);

}

export default ModalCuentasClientes;
