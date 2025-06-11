const { Router } = require("express");
const { DataBase } = require("../database.js");
const jwt = require('jsonwebtoken');

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
    if (usuarioData.nom_rol === 'cliente') {
      const estado = await database.query(
        `SELECT id_estado FROM cliente WHERE id_pers = $1`,
        [usuarioData.id_persona]
      );
      const idEstado = estado.rows[0]?.id_estado;


      if (idEstado === 2) {
        return res.json({ success: false, user: "El cliente está desactivado." });
      } else if (idEstado === 3) {
        return res.json({ success: false, user: "El cliente tiene una activación pendiente.", estado: 4, id: 1 });
      }
    }
    if (usuarioData.nom_rol === 'agente') {
      const estado = await database.query(
        `SELECT id_estado FROM agente WHERE id_agente = $1`,
        [usuarioData.id_persona]
      );
      const idEstado = estado.rows[0]?.id_estado;
      if (idEstado === 2) {
        return res.json({ success: false, user: "El agente está desactivado." });
      } else if (idEstado === 3) {
        return res.json({ success: false, user: "El agente tiene una activación pendiente.", estado: 3, id: usuarioData.id_persona });
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
    const id_rol = '3';
    const { user, pass, idpersona } = req.body;

    if (!user || !pass || !id_rol) {
      return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
    }

    const query = `
      INSERT INTO usuarios (users, pass,id_persona, id_rol)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [user, pass, idpersona, id_rol];

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

router.post("/crear-usuario-agente", async (req, res) => {
  try {
    const id_rol = '2';
    const { user, pass, idpersona } = req.body;

    if (!user || !pass || !id_rol) {
      return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });
    }

    const query = `
      INSERT INTO usuarios (users, pass,id_persona, id_rol)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [user, pass, idpersona, id_rol];

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

router.post("/verificar-datos", async (req, res) => {
  const { users, cedula } = req.body;

  if (!users) {
    return res.status(400).json({ message: "Debe proporcionar el nombre de usuario (users)" });
  }

  try {
    const result = await database.query(
      `SELECT 1 FROM usuarios WHERE users = $1 LIMIT 1`,
      [users]
    );

    if (result.rows.length > 0) {
      return res.json({ existe: true, message: "El correo electronico ya está en uso." });
    }

    const resultAgente = await database.query(
      `SELECT 1 FROM agente WHERE ced_agente = $1 LIMIT 1`,
      [cedula]
    );

    if (resultAgente.rows.length > 0) {
      return res.json({ existe: true, message: "El número de cédula ya existe en agentes." });
    }

    const resultCliente = await database.query(
      `SELECT 1 FROM cliente WHERE cedr_cli = $1 LIMIT 1`,
      [cedula]
    );

    if (resultCliente.rows.length > 0) {
      return res.json({ existe: true, message: "El número de cédula ya existe en clientes." });
    }
    return res.json({ existe: false, message: "El nombre de usuario y la cédula están disponibles." });

  } catch (error) {
    res.status(500).json({ message: "Error al verificar si el usuario existe", error });
  }
});

router.post("/usuario-existe", async (req, res) => {
  const { users } = req.body;

  if (!users) {
    return res.status(400).json({ message: "Debe proporcionar el nombre de usuario (users)" });
  }

  try {
    const result = await database.query(
      `SELECT 1 FROM usuarios WHERE users = $1 LIMIT 1`,
      [users]
    );

    if (result.rows.length > 0) {
      return res.json({ existe: true, message: "El correo electronico ya está en uso." });
    }
  } catch (error) {
    res.status(500).json({ message: "Error al verificar si el usuario existe", error });
  }
});

router.put("/users-password", async (req, res) => {
  const { id_pers, pass } = req.body;

  if (!id_pers || !pass) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }

  try {
    const result = await database.query(
      "UPDATE usuarios SET pass = $1 WHERE id_persona = $2 RETURNING *",
      [pass, id_pers]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Contraseña actualizada correctamente", usuario: result.rows[0] });
  } catch (error) {
    console.error("Error al actualizar la contraseña:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.put("/update-usuario-password", async (req, res) => {
  const { id_pers, pass, user } = req.body;
  if (!id_pers || !pass) {
    return res.status(400).json({ error: "Faltan datos requeridos" });
  }
  try {
    const result = await database.query(
      "UPDATE usuarios SET users=$1, pass = $2 WHERE id_persona = $3 RETURNING *",
      [user, pass, id_pers]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({ message: "Contraseña actualizada correctamente", usuario: result.rows[0] });
  } catch (error) {
    console.error("Error al actualizar la contraseña:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


module.exports = router;
