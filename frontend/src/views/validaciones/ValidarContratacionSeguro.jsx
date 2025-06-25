import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../estilos/ValidarEmail.css";
import CargarInf from "../cargando/CargarInf";
import swal from "sweetalert2";
import GestionContratacionFun from "../gestionContratacion/GestionContratacionFun";


export function ValidarContratacionSeguro() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [cliente, setCliente] = useState({ id_pers:'',idseguro:'',idvalid:'', nombre: "",
     apellido: "",cedula: "",monto_seguro: "",tiempo_seguro: "",frecuencia:'' });
  const [error, setError] = useState(""); // para errores de token
  const [success, setSuccess] = useState(false); // si todo sale bien
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const verificar = async () => {
    try {
      const res = await GestionContratacionFun.validarTokenContratacion({ url: id }, navigate);
      console.log(res.idvalid);

      const datosCliente = res.client[0];
      const datosSeguro = res.contr[0];

      setCliente({
        id_pers: datosCliente.id_pers,
        idseguro: res.data.id_seguro,
        idvalid: res.idvalid,
        nombre: datosCliente.nom_cli,
        apellido: datosCliente.ape_cli,
        cedula: datosCliente.cedr_cli,
        tipo_seguro: datosSeguro.id_tip_seg,
        monto_seguro: datosSeguro.monto_seguro,
        frecuencia: datosSeguro.tiempo_seguro,
      });
      setSuccess(true);
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
      const api = await GestionContratacionFun.activarContratacion(({id:cliente.idseguro, idvalid:cliente.idvalid}),navigate)
      if (api) {
        swal.fire({
              title:"<label>Muchas Felicidades</label>",
              text:"se ha completado con exito la validacion de tu cuenta en Seguros.SA \nYa puedes comenzar desde ahora mismo",
              timer:4500,
          })
        navigate('/');
      }
      
    } catch (error) {
      console.log(error)
      swal.fire({
              title:"<label>Advertencia</label>",
              text:"A ocurrido un fallo en tu validacion",
              timer:3500,
          })
    }
  }
 return (
  <div className="validar-email-container">
    <div className="validar-email-card">
      {success ? (
        <>
          <h2 className="validar-email-title">🎉 ¡Validación de Contratación Exitosa!</h2>
          
          <p className="validar-email-message">
            Estimado/a <strong>{cliente.nombre} {cliente.apellido}</strong>,
          </p>
          
          <p className="validar-email-message">
            Nos complace informarte que la contratación de tu seguro ha sido procesada correctamente. A continuación, te compartimos un resumen de tu póliza:
          </p>

          <p className="validar-email-message"><strong>🪪 Cédula:</strong> {cliente.cedula}</p>

          <ul className="validar-email-message">
            <li><strong>💰 Monto asegurado:</strong> ${cliente.monto_seguro}</li>
            <li><strong>📆 Frecuencia de pago:</strong> {cliente.frecuencia}</li>
          </ul>

          <p className="validar-email-message">
            Esta validación confirma la autenticidad de tu información personal y contractual, y nos permite ofrecerte un servicio seguro, confiable y personalizado.
          </p>

          <p className="validar-email-message">
            Para finalizar el proceso, haz clic en el siguiente botón:
          </p>

          <div className="validar-email-button-container">
            <button className="validar-email-button" onClick={validarCuenta}>
              Validar contratación
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="validar-email-title">⚠️ Enlace inválido o expirado</h2>
          <p className="validar-email-message">{error}</p>
          <p className="validar-email-message">
            Si consideras que esto es un error o deseas solicitar un nuevo enlace de validación, por favor comunícate con nuestro equipo de soporte de Seguros.SA.
          </p>
          <button className="validar-email-button" onClick={() => navigate("/")}>Volver al inicio</button>
        </>
      )}
    </div>
  </div>
);

}

export default ValidarContratacionSeguro;
