import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./views/Login";
import VentanaAdmin from "./views/usuarios/VentanaAdmin";
import VentanaAgente from "./views/usuarios/VentanaAgente";
import VentanaCliente from "./views/usuarios/ventanaCliente";
import ValidarContratacionSeguro from "./views/validaciones/ValidarContratacionSeguro";
import ValidarEmail from "./views/validaciones/ValidarEmail";
import ValidarAgente from "./views/validaciones/ValidarAgente";

function App() {
  return (
    <React.Fragment>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<VentanaAdmin />} />
          <Route path="/agente" element={<VentanaAgente />} />
          <Route path="/cliente" element={<VentanaCliente />} />
          <Route path="/validacionContratacion/:id" element={<ValidarContratacionSeguro />} />
          <Route path="/validacionEmail/:id" element={<ValidarEmail />} />
          <Route path="/validacionAgente/:id" element={<ValidarAgente />} />
        </Routes>
      </BrowserRouter>
    </React.Fragment>
  );
}

export default App;
