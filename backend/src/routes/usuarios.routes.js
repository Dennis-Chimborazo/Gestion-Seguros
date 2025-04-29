const { Router } = require("express");
const { DataBase } = require("../database.js");
const jwt= require('jsonwebtoken');

const router = Router();
const db = new DataBase();
const database = db.getConexion();

router.get("/users", async (req, res) => {
  const data = await database.query("SELECT * FROM usuarios");
  res.json(data);
});

router.post("/ingreso", async (req, res) => {
  try {
    const formulario = req.body;
    const usuario = Array.isArray(formulario.user) ? formulario.user[0] : formulario.user;
    const password = Array.isArray(formulario.pass) ? formulario.pass[0] : formulario.pass;

    const result = await database.query(
      "SELECT u.users,u.pass,nom_rol FROM usuarios u INNER JOIN roles r ON r.id_rol=u.id_rol WHERE users = $1 AND pass = $2",
      [usuario, password]
    );

    if (result.rowCount > 0) {

      const payload={"id:":result.rows[0].users }
      jwt.sign(payload,'gestionPruebas',{expiresIn:"1h"},(err,token)=>{
        res.json({ success: true, user: result.rows[0], token:token });

      })

    } else {
      res.json({ success: false, user: "credenciales no encontradas" });

    }
  } catch (error) {
    console.error("Error en /ingreso:", error);
    res.json({ success: false, message: "Error interno del servidor" });
  }
});



module.exports = router;
