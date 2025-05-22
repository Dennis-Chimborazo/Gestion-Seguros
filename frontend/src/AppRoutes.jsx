// src/AppRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./views/Login.jsx";
import VentanaAdmin from "./views/usuarios/VentanaAdmin.jsx";
import VentanaAgente from "./views/usuarios/VentanaAgente.jsx";
import VentanaCliente from "./views/usuarios/ventanaCliente.jsx";
import ValidarContratacionSeguro from "./views/validaciones/ValidarContratacionSeguro";
import ValidarEmail from "./views/validaciones/ValidarEmail";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<VentanaAdmin />} />
      <Route path="/agente" element={<VentanaAgente />} />
      <Route path="/cliente" element={<VentanaCliente />} />
      <Route path="/validacionContratacion/:id" element={<ValidarContratacionSeguro />} />
      <Route path="/validacionEmail/:id" element={<ValidarEmail />} />
    </Routes>
  );
}

export default AppRoutes;
