const { Router } = require("express");
const { DataBase } = require("../database.js");
const jwt = require("jsonwebtoken");

const router = Router();
const db = new DataBase();
const database = db.getConexion();
const ESTADO_ACTIVO = '1';

router.get("/listar", async (req, res) => {
  try {
    const query = `SELECT * FROM agente WHERE id_estado = $1`;
    const data = await database.query(query, [ESTADO_ACTIVO]);
    res.json(data);
  } catch (error) {
    console.error("Error en consulta:", error);
    res.status(500).json({ success: false, message: "Error al obtener datos", error: error.message });
  }
});

router.get("/listarPendientes", async (req, res) => {
  const idEstado = 3
  try {
    const query = `SELECT * FROM agente WHERE id_estado = $1`;
    const data = await database.query(query, [idEstado]);
    res.json(data);
  } catch (error) {
    console.error("Error en consulta:", error);
    res.status(500).json({ success: false, message: "Error al obtener datos", error: error.message });
  }
});

router.post("/save-agente", async (req, res) => {
  const agente = req.body;

  try {
    const existe = await database.query(
      `SELECT 1 FROM agente WHERE ced_agente = $1 LIMIT 1`,
      [agente.ced_agente]
    );

    if (existe.rows.length > 0) {
      return res.status(400).json({ message: "El agente con esa cédula ya existe." });
    }
    const estado = '3';

    const result = await database.query(`
      INSERT INTO agente (
        ced_agente, nom_agente, ape_agente, 
        email_agente, dire_agente, tel_agente,id_estado
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      ) RETURNING id_agente;
    `, [
      agente.ced_agente,
      agente.nom_agente,
      agente.ape_agente,
      agente.email_agente,
      agente.dire_agente,
      agente.tel_agente,
      estado
    ]);

    const idInsertado = result.rows[0].id_agente;

    res.json({
      message: "Agente guardado exitosamente",
      id_agente: idInsertado
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al guardar agente", error });
  }
});

router.post("/generar-token", async (req, res) => {

  try {
    const { id_pers, pass, url } = req.body; // Espera un JSON: { id_pers: 1, url: "algo.com" }
    const payload = { id_pers, pass };
    const token = jwt.sign(payload, "emailAgente", { expiresIn: "5h" });

    await database.query(
      "INSERT INTO token_agente (url_emal, token_val,id_agente) VALUES ($1, $2, $3)",
      [url, token, id_pers]
    );
    res.json({ success: true, token, message: "Token creado y guardado exitosamente." });
  } catch (error) {
    console.error("Error en /generar_token_email:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

router.post("/validar-token-email", async (req, res) => {
  const { url } = req.body; // Espera: { url: "URLgenerada" }
  try {
    const result = await database.query(
      "SELECT token_val,id_val FROM token_agente WHERE url_emal = $1",
      [url]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "URL no encontrada." });
    }
    const token = result.rows[0].token_val;
    let payload;
    try {
      payload = jwt.verify(token, "emailAgente"); // clave secreta que usaste al generar
    } catch (err) {
      return res.status(401).json({ success: false, message: "Token inválido o expirado." });
    }
    res.status(200).json({
      success: true,
      message: "Token válido.",
      data: payload,// contiene id_pers
      idvalid: result.rows[0].id_val
    });

  } catch (error) {
    console.error("Error al validar token:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor." });
  }
});

router.get("/buscar-agente", async (req, res) => {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;

  try {
    const query = `SELECT * FROM agente WHERE id_agente = $1`;
    const data = await database.query(query, [id]);
    res.json(data.rows);
  } catch (error) {
    console.error("Error en consulta:", error);
    res.status(500).json({ success: false, message: "Error al obtener datos", error: error.message });
  }
});

router.put("/activar-cuenta", async (req, res) => {
  const { id, idvalid } = req.body;
  console.log(id, idvalid)
  const estadoActivo = '1';
  if (!id || !idvalid) {
    return res.status(400).json({ error: "Faltan datos requeridos (id o idvalid)." });
  }
  try {
    const updateResult = await database.query(`
      UPDATE agente 
      SET id_estado = $1
      WHERE id_agente = $2
    `, [estadoActivo, id]);

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: "Agente no encontrado." });
    }

    await database.query(
      "DELETE FROM token_agente WHERE id_val = $1",
      [idvalid]
    );

    res.status(200).json({ message: "Cuenta activada con éxito." });

  } catch (error) {
    console.error("Error al activar cuenta:", error);
    res.status(500).json({ error: "Error interno al actualizar Agente." });
  }
});

router.put("/update-agente", async (req, res) => {
  const agente = req.body;
  try {
    const data = await database.query(`
      UPDATE agente SET
        nom_agente = $1,
        ape_agente = $2,
        email_agente = $3,
        dire_agente = $4,
        tel_agente = $5,
        ced_agente = $6
      WHERE id_agente = $7
    `, [
      agente.nom_agente,
      agente.ape_agente,
      agente.email_agente,
      agente.dire_agente,
      agente.tel_agente,
      agente.ced_agente,
      agente.id_agente
    ]);

    res.status(200).json({ message: "Agente actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar agente:", error);
    res.status(500).json({ error: "Error al actualizar agente" });
  }
});

router.put("/update-correo", async (req, res) => {
  const formulario = req.body;
  try {
    const data = await database.query(`
      UPDATE agente SET
        email_agente = $1
      WHERE id_agente = $2
    `, [
      formulario.newEmail,
      formulario.id_agente
    ]);

    res.status(200).json({ message: "Cliente actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});

router.put("/actualizar-token-email", async (req, res) => {
  try {
    const { id_agente, url, pass } = req.body;
    const payload = { id_pers: id_agente, pass };
    const token = jwt.sign(payload, "emailAgente", { expiresIn: "5h" });
    const result = await database.query(
      `UPDATE token_agente
       SET url_emal = $1, token_val = $2
       WHERE id_agente = $3`,
      [url, token, id_agente]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "No se encontró el registro para actualizar." });
    }
    res.json({ success: true, token, message: "Token actualizado exitosamente." });
  } catch (error) {
    console.error("Error en /actualizar_token_email:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

router.post("/buscar-ruta-token", async (req, res) => {
  const { id } = req.body;
  try {
    const result = await database.query(
      "SELECT token_val, url_emal FROM token_agente WHERE id_agente = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "No se encontró una URL asociada al agente." });
    }

    const token = result.rows[0].token_val;

    try {
      jwt.verify(token, "emailAgente");
    } catch (err) {
      return res.status(401).json({ success: false, message: "Tu contraseña ha expirado o es inválida. Solicita una nueva." });
    }

    res.status(200).json({
      success: true,
      message: "Token válido.",
      url: result.rows[0].url_emal
    });

  } catch (error) {
    console.error("Error en el servidor:", error);
    res.status(500).json({ success: false, message: "Error del servidor. Intenta más tarde." });
  }
});

module.exports = router; 
