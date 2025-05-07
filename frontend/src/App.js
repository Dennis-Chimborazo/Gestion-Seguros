import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./views/Login.jsx";
import VentanaAdmin from "./views/usuarios/VentanaAdmin.jsx";
import VentanaAgente from "./views/usuarios/VentanaAgente.jsx";
import VentanaCliente from "./views/usuarios/ventanaCliente.jsx";
import Buscador from "./views/Prueba/Prueba";


function App() {
  return (
    <React.Fragment>
      <BrowserRouter>
    <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/admin" element={<VentanaAdmin />} />
    <Route path="/agente" element={<VentanaAgente />} />
    <Route path="/cliente" element={<VentanaCliente />} />
    <Route path="/bus" element={<Buscador />} />


  </Routes>
  </BrowserRouter>
  </React.Fragment>
  );
}

export default App;
