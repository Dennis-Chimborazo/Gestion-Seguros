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
      `SELECT u.users, u.pass, u.id_persona, r.nom_rol 
       FROM usuarios u 
       INNER JOIN roles r ON r.id_rol = u.id_rol 
       WHERE users = $1 AND pass = $2`,
      [usuario, password]
    );
    if (result.rowCount === 0) {
      return res.json({ success: false, user: "Credenciales no encontradas" });
    }
    const usuarioData = result.rows[0];
      console.log('--->id_persona');
   console.log( usuarioData.id_persona)
      console.log('-----');

    if (usuarioData.nom_rol === 'cliente') {
      const estado = await database.query(
        `SELECT id_estado FROM cliente WHERE id_pers = $1`,
        [usuarioData.id_persona]
      );
      const idEstado = estado.rows[0]?.id_estado;


      if (idEstado === 2) {
        return res.json({ success: false, user: "El usuario está desactivado." });
      } else if (idEstado === 3) {
        return res.json({ success: false, user: "El usuario tiene una activación pendiente." });
      }
    }
    const payload = { id: usuarioData.users };
    jwt.sign(payload, 'gestionPruebas', { expiresIn: "1h" }, (err, token) => {
      if (err) {
        console.error("Error generando token:", err);
        return res.status(500).json({ success: false, message: "Error generando token" });
      }
      res.json({ success: true, user: usuarioData, token });
    });
  } catch (error) {
    console.error("Error en /ingreso:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

router.post("/crearusuariocliente", async (req, res) => {
  try {
    const id_rol='3';
    const { user, pass,idpersona } = req.body;
  
    if (!user || !pass || !id_rol) {
      return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
    }

    const query = `
      INSERT INTO usuarios (users, pass,id_persona, id_rol)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [user, pass,idpersona, id_rol];

    const result = await database.query(query, values);

    res.status(201).json({
      success: true,
      message: "Usuario creado correctamente",
      usuario: result.rows[0]
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
  
});





module.exports = router;
