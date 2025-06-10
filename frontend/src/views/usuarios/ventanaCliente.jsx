import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../estilos/VentanaCliente.module.css";
import ClientesFun from "../clientes/ClientesFun";

export function VentanaCliente() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const [cliente, setcliente] = useState();
  const [estado, setEstado] = useState(0);
  const [nombres, setNombres] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [cedulaPdf, setCedulaPdf] = useState(null);

  useEffect(() => {
    console.log("Ventana principal: " + user?.rol);
    const cargarDatos = async () => {
      const login = JSON.parse(localStorage.getItem("login"));
      const res = await ClientesFun.buscarcliente(login.user, navigate);
      setcliente(res);
      setEstado(res[0].id_estado);
      const nom =res[0].nom_cli+' '+res[0].ape_cli;
      setNombres(nom);
      console.log(nom)

    };
    cargarDatos();
  }, []);

 const handleFotoChange = (e) => {
  const file = e.target.files[0];
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  if (file && allowedTypes.includes(file.type)) {
    setFotoPerfil(file);
  } else {
    alert('Por favor, sube una imagen válida (PNG, JPG, JPEG, WEBP).');
    e.target.value = '';
  }
};


  const handleCedulaChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setCedulaPdf(file);
    } else {
      alert('Por favor, sube un archivo PDF válido.');
      e.target.value = '';
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem("login");
    navigate("/", { state: { user: "" } });
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2>Bienvenido {user?.rol}</h2>
        <label htmlFor="">{nombres||''}</label>

        {/* <img src={logo} alt="Logo" /> */}
        {estado === 4 ? (<>
          <ul>
            <li><a href="#" onClick={cerrarSesion}>Cerrar sesión</a></li>
          </ul>
        </>) : (<>

          <ul>
            <li><a href="#">Contratación de seguro</a></li>
            <li><a href="#">Historial de pagos</a></li>
            <li><a href="#">Reembolsos</a></li>
            <li><a href="#">Facturas</a></li>
            <li><a href="#" onClick={cerrarSesion}>Cerrar sesión</a></li>
          </ul>

        </>)}

      </div>
      <div className={styles.main2}>
        <p>👋 ¡Bienvenido! Por favor, sube los siguientes documentos para completar tu registro:</p>
        <ul>
          <li>📷 Foto de perfil en formato <strong>PNG</strong></li>
          <li>🆔 Cédula escaneada en formato <strong>PDF</strong></li>
        </ul>

        {/* Subir foto */}
        <div className={styles.uploadSection}>
          <label>Subir Foto de Perfil (.png):</label>
          <input type="file" accept="image/png, image/jpeg, image/jpg, image/webp" onChange={handleFotoChange} />

          {fotoPerfil && (
            <div className={styles.preview}>
              <p>Vista previa de la imagen:</p>
              <img
                src={URL.createObjectURL(fotoPerfil)}
                alt="Foto de perfil"
                style={{ width: '150px', borderRadius: '8px', marginTop: '10px' }}
              />
            </div>
          )}
        </div>

        {/* Subir cédula */}
        <div className={styles.uploadSection}>
          <label>Subir Cédula Escaneada (.pdf):</label>
          <input type="file" accept="application/pdf" onChange={handleCedulaChange} />
          {cedulaPdf && (
            <div className={styles.preview}>
              <p>PDF cargado: <strong>{cedulaPdf.name}</strong></p>
              <embed
                src={URL.createObjectURL(cedulaPdf)}
                type="application/pdf"
                width="100%"
                height="300px"
                style={{ border: '1px solid #ccc', marginTop: '10px' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VentanaCliente;
