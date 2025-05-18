import React, { useState } from "react";
import ApiService from "../services/ApiService.js";
import { useNavigate } from "react-router-dom";
import {Toaster,toast} from "sonner";
import styles from "./estilos/login.module.css"; 

export function Login() {
  const navigate= useNavigate();
  const [formulario, setFormulario] = useState({user:"",pass:""});

  const ingresar = async () => {
    if (formulario.pass==""||formulario.user=="") {
      toast.error("Complete todos los campos");
    }else{
    const res= await ApiService.login(formulario);
    if (res.success) {
     localStorage.setItem("login",JSON.stringify({
        login: true,
        token: res.token
      }));
      navigate("/"+res.user.nom_rol, { state: { user: res.user } }); 
    }else{
      toast.error("Usuario o contrasena incorrecta");
      }
    }
  };
  
  const darValores =(e)=>{
    setFormulario({
        ...formulario,[e.target.name]:[e.target.value],
    });
  }
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Login</h1>
      <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
        <Toaster position="top-center" visibleToasts={1} duration={3000} richColors />
        <input
          className={styles.input}
          type="text"
          placeholder="Usuario"
          id="user"
          name="user"
          required
          onChange={darValores}
        />
        <input
          className={styles.input}
          type="password"
          placeholder="Contraseña"
          id="pass"
          name="pass"
          required
          onChange={darValores}
        />
        <button className={styles.button} onClick={ingresar}>Ingresar</button>
      </form>
    </div>
  );
}


export default Login;
