import { useState, useEffect } from "react";
import { Toaster, toast } from "sonner";
import ClientesFun from "./ClientesFun";
import swal from "sweetalert2";
import {  useNavigate } from "react-router-dom";
import Utilidades from "../../services/Utilidades";
import UsuariosFun from "../usuarios/UsuariosFun";

export function ModalReenvioValidacion({ cerrarModal }) {
  const navigate = useNavigate();
  const [formulario, setFormulario] = useState({ email: '', newEmail: '', id_pers: '' })
  const [actualizarCorreo, setActualizarCorreo] = useState(false);


  useEffect(() => {
    const valores = () => {
      const editData = JSON.parse(localStorage.getItem("editCorreo"));
      console.log(editData);
      setFormulario({ ...formulario, email: editData.cliente.email_pers, id_pers: editData.cliente.id_pers })
    }
    valores();
  }, [])

  const asignarValores = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value })
  }
  const reenviarCorreo = async (e) => {
    e.preventDefault()
    const urlRandom = await Utilidades.crearRutaAleatoria()
    const passRandom = await Utilidades.crearPassAleatoria()
    if (actualizarCorreo) {
      if (formulario.newEmail === '') {
        toast.error("Ingrese el nuevo CorreoElectronico⚠️");
      } else {
        const res = await UsuariosFun.verificarUsuario({ users: formulario.newEmail}, navigate);
        if (res.existe) {
          toast.error(res.message);
        } else {
          await ClientesFun.actualizarEmailCliente(formulario, navigate)
          await ClientesFun.actualizarTokenValidacion({ id_pers: formulario.id_pers, url: urlRandom, pass: passRandom }, navigate);
          await ClientesFun.enviarCorreoEmail({ to: formulario.newEmail, token: urlRandom, pass: passRandom }, navigate);
          await UsuariosFun.actualizarUserPass({ id_pers: formulario.id_pers, pass: passRandom, user: formulario.newEmail }, navigate);
          swal.fire({
            title: "<label>Exito</label>",
            text: "Se ha actualizo el correo y enviado un nuevo enlace de validacion",
            timer: 3500,
          })
          cerrarModal()
        }
      }
    } else {
      await ClientesFun.actualizarTokenValidacion({ id_pers: formulario.id_pers, url: urlRandom, pass: passRandom }, navigate);
      await ClientesFun.enviarCorreoEmail({ to: formulario.email, token: urlRandom, pass: passRandom }, navigate);
      await UsuariosFun.actualizarPass({ id_pers: formulario.id_pers, pass: passRandom, user: formulario.newEmail }, navigate);
      swal.fire({
        title: "<label>Exito</label>",
        text: "Se ha reembiado un nuevo enlace de validacion",
        timer: 3500,
      })
      cerrarModal()
    }
  }

  const cancelarCuenta = (e) => {
    e.preventDefault()
    cerrarModal()
  }

  const manejarCambioCheckbox = (e) => {
    const valor = e.target.checked;
    setActualizarCorreo(valor);
  };

  return (
    <form>
      <h3>Reenvio de validacion de cuenta</h3>
      <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />

      <p style={{ marginBottom: "1rem", fontStyle: "italic", color: "#2c3e50" }}>
        ✅ Verifique el correo electronico.
      </p>

      <label htmlFor="usuario">Correo</label>
      <input type="text" id="email" name="email" value={formulario.email || ''} />
      <p style={{ marginBottom: "1rem", fontStyle: "italic", color: "#2c3e50" }}>
        {<><input type="checkbox" name="actualizar" id="actualizar" onChange={manejarCambioCheckbox} /></>}Actualizar correo.
      </p>

      {actualizarCorreo && (
        <>
          <label htmlFor="newEmail">Ingrese el nuevo Correo</label>
          <input
            type="email"
            id="newEmail"
            name="newEmail"
            value={formulario.newEmail || ""}
            onChange={asignarValores}
          />
        </>
      )} <div>
        <button onClick={cancelarCuenta}>cancelar</button>
        <button onClick={reenviarCorreo}>{actualizarCorreo ? (<>Actualizar y reenviar</>) : (<>Reenviar Correo</>)}</button>

      </div>
    </form>
  );

}

export default ModalReenvioValidacion;
