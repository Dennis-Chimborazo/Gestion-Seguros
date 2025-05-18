import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "../estilos/validarEmail.module.css";
import ClientesFun from "../clientes/ClientesFun";
import CargarInf from "../cargando/CargarInf";
import swal from "sweetalert2";


export function ValidarEmail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cliente, setCliente] = useState({ id_pers:'',idvalid:'', nombre: "", apellido: "" });
  const [error, setError] = useState(""); // para errores de token
  const [success, setSuccess] = useState(false); // si todo sale bien
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      try {
        const res = await ClientesFun.validarTokenEmail({ url: id }, navigate);
        if (res?.success && res.data?.id_pers) {
          const resCli = await ClientesFun.buscarclienteIDValEmail(res.data.id_pers, navigate);
          setCliente({
            id_pers:resCli[0].id_pers,
            nombre: resCli[0].nom_cli,
            apellido: resCli[0].ape_cli,
            idvalid:res.idvalid,
          });
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

  const validarCuenta=async(e)=>{
    e.preventDefault()
    try {
      const api = await ClientesFun.activarCuentaUsuario(({id:cliente.id_pers, idvalid:cliente.idvalid}),navigate)
      console.log(api)
      if (api) {
        swal.fire({
              title:"<label>Muchas Felicidades</label>",
              text:"se ha completado con exito la validacion de tu cuenta en Seguros.SA \nYa puedes comenzar desde ahora mismo",
              timer:4500,
          })
        navigate('/');
      }
      
    } catch (error) {
      swal.fire({
              title:"<label>Advertencia</label>",
              text:"A ocurrido un fallo en tu validacion",
              timer:3500,
          })
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {success ? (
          <>
            <h2 className={styles.title}>🎉 ¡Gracias por registrarte en Seguros.SA!</h2>
            <p className={styles.message}>
              Bienvenido/a {cliente.nombre} {cliente.apellido}, tu cuenta ha sido creada con éxito.
              Ya estás a un paso de comenzar a disfrutar de todos los beneficios que ofrecemos.
            </p>
            
            <p className={styles.message}>
              Esta validación garantiza la integridad de tu información y nos ayuda a brindarte una experiencia personalizada, segura y confiable.
            </p>
            <p className={styles.message}>
              Al hacer clic en el siguiente botón, estarás tu cuenta </p>

            <button className={styles.button} onClick={validarCuenta}>
              Validar mi cuenta
            </button>
          </>
        ) : (
          <>
            <h2 className={styles.title}>⚠️ Enlace inválido o expirado</h2>
            <p className={styles.message}>{error}</p>
            <p className={styles.message}>
              Si crees que esto es un error o necesitas un nuevo enlace, contacta Seguros.SA soporte.
            </p>
            <button className={styles.button} onClick={() => navigate("/")}> OK</button>
          </>
        )}
      </div>
    </div>
  );
}

export default ValidarEmail;
