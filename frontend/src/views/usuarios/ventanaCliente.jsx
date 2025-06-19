import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "../estilos/VentanaCliente.module.css";
import styles2 from "../estilos/VentanaAdmin.module.css";
import ClientesFun from "../clientes/ClientesFun";
import ClientesArchivos from "../clientes/ClientesArchivos";
import CargarArchivos from "../cargando/cargarArchivos";
import ReembolsoCliente from "../reembolsos/ReembolsoCliente";
import SeguroContrado from "../clientes/SeguroContrado";

export function VentanaCliente() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;
  const [cliente, setcliente] = useState();
  const [estado, setEstado] = useState(0);
  const [nombres, setNombres] = useState('');
  const [seccionActiva, setSeccionActiva] = useState("inicio");
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [loadingFoto, setLoadingFoto] = useState(false); // NUEVO

  useEffect(() => {
    const cargarDatos = async () => {
      const login = JSON.parse(localStorage.getItem("login"));
      const res = await ClientesFun.buscarcliente(login.user, navigate);
      setcliente(res);
      setEstado(res[0].id_estado);
      setNombres(res[0].nom_cli + ' ' + res[0].ape_cli);

      if (res[0].id_estado === 1) {
        setLoadingFoto(true); // empieza carga
        try {
          const rutaImagen = await ClientesFun.buscarArchivos('imagen', res[0].id_pers, navigate);
          setFotoPerfil(rutaImagen);
        } catch (error) {
          console.error('Error al cargar la imagen de perfil:', error);
        } finally {
          setLoadingFoto(false); // termina carga
        }
      }
    };
    cargarDatos();
  }, []);

  const mostrarSeccion = (nombre) => {
    setSeccionActiva(nombre);
  };

  const cerrarSesion = () => {
    localStorage.removeItem("login");
    navigate("/", { state: { user: "" } });
  };

  return (
    <div className={styles.container}>
      <div className={styles.sidebar}>
        <h2>Bienvenido {user?.rol}</h2>

        {estado !== 4 ? (<>
          {loadingFoto ? (
            <CargarArchivos />
          ) : (
            fotoPerfil && <img src={fotoPerfil} alt="Imagen perfil" />
          )} </>
        ) : (<></>)}
        <label>{nombres || ''}</label>
        <ul>
          {estado === 4 ? (
            <li><a onClick={cerrarSesion}>Cerrar sesión</a></li>
          ) : (<>
            <li><a onClick={() => mostrarSeccion("SegurosContratados")}>Seguros contratados</a></li>
            <li><a onClick={() => mostrarSeccion("Reembolso")}>Reembolsos</a></li>

            <li><a onClick={() => mostrarSeccion("Historial")}>Historial de pagos</a></li>
            <li><a onClick={cerrarSesion}>Cerrar sesión</a></li>
          </>)}
        </ul>
      </div>

      <div className={styles.mainContent}>
        {estado === 4 ? (
          seccionActiva === "inicio" && <ClientesArchivos mostrarSeccion={mostrarSeccion} />
        ) : (
          <>
            <section >
              {seccionActiva === "SegurosContratados" && <SeguroContrado mostrarSeccion={mostrarSeccion} id={cliente[0].id_pers} />}
              {seccionActiva === "Reembolso" && <ReembolsoCliente mostrarSeccion={mostrarSeccion} />}

              {seccionActiva === "inicio" && <>
                <div className={styles2.bienvenida}>
                  <h1>Bienvenido a <span className={styles.nombreEmpresa}>Seguros.SA</span></h1>
                  <p>Gracias por confiar en nosotros. Desde tu panel podrás gestionar tus reembolsos, revisar tu historial de pagos y actualizar tu información.</p>
                </div></>}
            </section>


          </>
        )}
      </div>
    </div>
  );
}

export default VentanaCliente;
