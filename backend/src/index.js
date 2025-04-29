const express = require('express');
const { puerto } = require('./config.js');
const cors = require('cors');
const authMiddleware = require("../middlewares/authMiddleware.js")
const usuariosRoute = require("./routes/usuarios.routes.js");
const clientesRoute = require("./routes/clientes.routes.js");
const direccionesRoute = require("./routes/direcciones.routes.js");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/user", usuariosRoute);

//app.use(authMiddleware);
app.use("/client", clientesRoute);
app.use("/direccion", direccionesRoute);



app.listen(puerto, () => {
  console.log(`Servidor escuchando en http://localhost:${puerto}`);
});
