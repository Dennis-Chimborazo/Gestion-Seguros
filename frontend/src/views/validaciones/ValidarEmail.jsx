import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../estilos/ValidarEmail.css";
import ClientesFun from "../clientes/ClientesFun";
import CargarInf from "../cargando/CargarInf";
import swal from "sweetalert2";
import UsuariosFun from "../usuarios/UsuariosFun";
import { Toaster, toast } from "sonner";

export function ValidarEmail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cliente, setCliente] = useState({ id_pers: '', idvalid: '', nombre: "", apellido: "", passTemp: '', email_pers: '' });
  const [error, setError] = useState(""); // para errores de token
  const [success, setSuccess] = useState(false); // si todo sale bien
  const [loading, setLoading] = useState(true);
  const [formulario, setFormulario] = useState({ id_pers: '', user: '', pass: '', confirmPassword: '', passTemp: '' })
  useEffect(() => {
    const verificar = async () => {
      try {
        const res = await ClientesFun.validarTokenEmail({ url: id }, navigate);
        console.log(res)
        if (res?.success && res.data?.id_pers) {
          const resCli = await ClientesFun.buscarcliente(res.data.id_pers, navigate);
          setCliente({
            id_pers: resCli[0].id_pers,
            nombre: resCli[0].nom_cli,
            apellido: resCli[0].ape_cli,
            email_pers: resCli[0].email_pers,
            idvalid: res.idvalid,
            passTemp: res.data.pass
          });
          setFormulario(prevForm => ({ 
            ...prevForm, 
            id_pers: resCli[0].id_pers, 
            user: resCli[0].email_pers 
          }));
          setSuccess(true);
        } else {
          setError("Token inválido o expirado.");
        }
      } catch (error) {
        setError("El enlace ya expiró o no es válido.");
      } finally {
        setLoading(false);
      }
    };

    verificar();
  }, [id, navigate]);

  if (loading) {
    return <CargarInf />;
  }

  const verificarDatos = () => {
    if (formulario.passTemp === '') {
      toast.error("Falta ingresar la contraseña temporal");
    } else {
      if (formulario.passTemp !== cliente.passTemp) {
        toast.error("La contraseña temporal no coincide");
      } else {
        if (Object.values(formulario).every(valor => valor !== '')) {
          if (formulario.pass === formulario.confirmPassword) {
            return true;
          } else {
            toast.error("Las contraseña no coinciden ");
            return false;
          }
        } else {
          toast.error("Faltan campos por llenar");
          return false;
        }
      }
    }
  }

  const asignarValores = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value })
  }

  const preValidarCuenta = async (e) => {
    e.preventDefault()
    if (verificarDatos()) {
      try {
        const api = await ClientesFun.preActivarCuentaUsuario(({ id: cliente.id_pers, idvalid: cliente.idvalid }), navigate)
        if (api) {
          await UsuariosFun.actualizarPass(formulario, navigate)
          swal.fire({
            title: "<label>Muchas Felicidades</label>",
            text: "se ha completado con exito la pre-validacion de tu cuenta en Seguros.SA \npuedes finalizar tu registro desde tu cuenta",
            timer: 4500,
          })
          navigate('/');
        }

      } catch (error) {
        swal.fire({
          title: "<label>Advertencia</label>",
          text: "A ocurrido un fallo en tu validacion",
          timer: 3500,
        })
      }
    }
  }

  const cancelarCuenta = (e) => {
    e.preventDefault()
    swal.fire({
      title: "⚠️ <label>Advertencia</label>",
      text: "Desea salir de la validanción de cuenta",
      showDenyButton: true,
      denyButtonText: "No",
      confirmButtonText: "Si"
    }).then(respuesta => {
      if (respuesta.isConfirmed) {navigate('/');}
    });
  }
  return (
    <div className="validar-email-container">
      <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
      <div className="validar-email-card">
        {success ? (
          <>
            <h2 className="validar-email-title">🎉 ¡Gracias por registrarte en Seguros.SA!</h2>
            <p className="validar-email-message">
              Bienvenido/a {cliente.nombre} {cliente.apellido}, tu cuenta ha sido creada con éxito.
              Ya estás a un paso de comenzar a disfrutar de todos los beneficios que ofrecemos.
            </p>
            <p className="validar-email-message">
              Esta validación garantiza la integridad de tu información y nos ayuda a brindarte una experiencia personalizada, segura y confiable.
            </p>
            <p className="validar-email-message">
              Para completar tu registro y validar tu identidad, ingresa una nueva contraseña.
              Su usuario por defecto es: {cliente.email_pers || ''}
            </p>
            <div className="validar-email-form">
              <label htmlFor="passTemp">Ingrese contraseña temporal</label>
              <input type="password" id="passTemp" name="passTemp" onChange={asignarValores} />
              <label htmlFor="pass">Ingrese una contraseña</label>
              <input type="password" id="pass" name="pass" onChange={asignarValores} />
              <label htmlFor="confirmPassword">Vuelva a escribir la contraseña</label>
              <input type="password" id="confirmPassword" name="confirmPassword" onChange={asignarValores} />
            </div>
            <div className="validar-email-button-container">
              <button className="validar-email-button cancel" onClick={cancelarCuenta}>Cancelar</button>
              <button className="validar-email-button" onClick={preValidarCuenta}>Validar Cuenta</button>
            </div>
          </>
        ) : (
          <>
            <h2 className="validar-email-title">⚠ Enlace inválido o expirado</h2>
            <p className="validar-email-message">{error}</p>
            <p className="validar-email-message">
              Si crees que esto es un error o necesitas un nuevo enlace, contacta Seguros.SA soporte.
            </p>
            <button className="validar-email-button" onClick={() => navigate("/")}> OK</button>
          </>
        )}
      </div>
    </div>
  );
}

export default ValidarEmail;
