const express = require('express');
const { puerto } = require('./config.js');
const cors = require('cors');
const authMiddleware = require("../middlewares/authMiddleware.js")
const usuariosRoute = require("./routes/usuarios.routes.js");
const clientesRoute = require("./routes/clientes.routes.js");
const direccionesRoute = require("./routes/direcciones.routes.js");
const seguroRoute = require("./routes/seguros.routes.js");
const tipoSeguroeguroRoute = require("./routes/tiposeguro.route.js");
const empleadosRoute = require("./routes/empleados.routes.js");
const emailRoute = require("./routes/email.routes.js");
const agenteRoute = require("./routes/agente.routes.js");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/user", usuariosRoute);

//app.use(authMiddleware);
app.use("/client", clientesRoute);
app.use("/direccion", direccionesRoute);
app.use("/seguro", seguroRoute);
app.use("/tiposeguro", tipoSeguroeguroRoute);
app.use("/empleado", empleadosRoute);
app.use("/email", emailRoute);
app.use("/agente", agenteRoute);


app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
