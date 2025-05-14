import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./views/Login";
import Buscador from "./views/Prueba/Prueba";
import VentanaAdmin from "./views/usuarios/VentanaAdmin";
import VentanaAgente from "./views/usuarios/VentanaAgente";
import VentanaCliente from "./views/usuarios/ventanaCliente";


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
