import React, {useEffect} from "react";
import { useNavigate,useLocation } from "react-router-dom";
import ApiService from "../../services/ApiService";


export function VentanaAgente(){
    const navigate= useNavigate();
    const location = useLocation();
    const user = location.state?.user; // accedemos al usuario
useEffect(()=>{
    console.log("Ventana principal: "+user.rol)
    
   },[]);  

   const cerrarSesion = () => {
    localStorage.setItem("login","");
    navigate("/", { state: { user: "" } }); 
  };

 const valores =async(e)=>{
    e.preventDefault();
    const val= await ApiService.traerDatos("client/clientes",navigate);
    //console.log(val);
 }
    return(
        <div>
            <form action="" method="get">
                <h2>Bienvenido {user?.rol}</h2>
                <ul>
                <li><a href="#">Clientes</a></li>
                    <li><a href="#">Gestión de contratación</a></li>
                    <li><a href="#">Reembolso</a></li>
                    <li><a href="#">Reportes</a></li>
                     <li><a href="#" onClick={cerrarSesion}>Cerrar sesión</a></li>
                </ul>
            </form>
            </div>
    );
}
export default VentanaAgente;