const express = require('express');
const { puerto } = require('./config.js');
const cors = require('cors');
const authMiddleware = require("../middlewares/authMiddleware.js");
const usuariosRoute = require("./routes/usuarios.routes.js");
const clientesRoute = require("./routes/clientes.routes.js");
const direccionesRoute = require("./routes/direcciones.routes.js");
const seguroRoute = require("./routes/seguros.routes.js");
const tipoSeguroeguroRoute = require("./routes/tiposeguro.route.js");
const empleadosRoute = require("./routes/empleados.routes.js");
const emailRoute = require("./routes/email.routes.js");


const app = express();
app.use(cors());
app.use(express.json());
app.use("/user", usuariosRoute);

//app.use(authMiddleware); // (Comentado temporalmente para pruebas)
app.use("/client", clientesRoute);
app.use("/direccion", direccionesRoute);
app.use("/seguro", seguroRoute);
app.use("/tiposeguro", tipoSeguroeguroRoute);
app.use("/empleado", empleadosRoute);
app.use("/email", emailRoute);

// Exporta la app para SuperTest
module.exports = app;

// Solo inicia el servidor si no está en modo prueba
if (require.main === module) {
  app.listen(puerto, () => {
    console.log(`Servidor escuchando en http://localhost:${puerto}`);
  });
}