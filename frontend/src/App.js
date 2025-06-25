// src/AppRoutes.jsx

import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./views/Login.jsx";
import VentanaAdmin from "./views/usuarios/VentanaAdmin.jsx";
import VentanaAgente from "./views/usuarios/VentanaAgente.jsx";
import VentanaCliente from "./views/usuarios/ventanaCliente.jsx";
import ValidarContratacionSeguro from "./views/validaciones/ValidarContratacionSeguro";
import ValidarEmail from "./views/validaciones/ValidarEmail";
import ValidarAgente from "./views/validaciones/ValidarAgente";

// Componente solo con las rutas, sin router
export function RoutesOnly() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/admin" element={<VentanaAdmin />} />
      <Route path="/agente" element={<VentanaAgente />} />
      <Route path="/cliente" element={<VentanaCliente />} />
      <Route path="/validacionContratacion/:id" element={<ValidarContratacionSeguro />} />
      <Route path="/validacionEmail/:id" element={<ValidarEmail />} />
      <Route path="/validacionAgente/:id" element={<ValidarAgente />} />
    </Routes>
  );
}

// Componente usado en producción que envuelve en BrowserRouter
function AppRoutes() {
  return (
    <BrowserRouter>
      <RoutesOnly />
    </BrowserRouter>
  );
}

export default AppRoutes;
