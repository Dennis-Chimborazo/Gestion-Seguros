const { Router } = require("express");
const { DataBase } = require("../database.js");
const jwt = require("jsonwebtoken");
const router = Router();
const db = new DataBase();
const database = db.getConexion();

const ESTADO_ACTIVO = '1';
const ESTADO_INACTIVO = '2';

router.get("/listar", async (req, res) => {
  try {
    const query = `SELECT * FROM cliente WHERE id_estado = $1`;
    const data = await database.query(query, [ESTADO_ACTIVO]);
    res.json(data);
  } catch (error) {
    console.error("Error en consulta:", error);
    res.status(500).json({ success: false, message: "Error al obtener datos", error: error.message });
  }
});

router.get("/listarPendientes", async (req, res) => {
  const pendiente = 3;
  const preactivo = 4;
  try {
    const query = `SELECT * FROM cliente WHERE id_estado = $1 OR id_estado = $2`;
    const data = await database.query(query, [pendiente, preactivo]); 
    res.json(data);
  } catch (error) {
    console.error("Error en consulta:", error);
    res.status(500).json({ success: false, message: "Error al obtener datos", error: error.message });
  }
});

router.post("/save", async (req, res) => {
  const formulario = req.body;
  const camposObligatorios = [
    'cedr_cli', 'tipo_cedr_cli', 'nacion_cli', 'nom_cli', 'ape_cli',
    'fecha_naci_cli', 'lugar_naci_cli', 'tel_pers', 'cel_pers', 'email_pers',
    'edad_pers', 'sexo_cli', 'estado_civil_pers', 'estatura_cli', 'peso_cli',
    'parroq_cli', 'calle_princ_pers', 'calle_secun_pers', 'id_ciud'
  ];

  const camposFaltantes = camposObligatorios.filter(campo => !formulario[campo]);
  const est = 3
  if (camposFaltantes.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Faltan campos obligatorios: ${camposFaltantes.join(", ")}`
    });
  }
  try {
    const data = await database.query(`
      INSERT INTO cliente (
        cedr_cli, tipo_cedr_cli, nacion_cli, nom_cli, ape_cli, fecha_naci_cli,
        lugar_naci_cli, tel_pers, cel_pers, email_pers, edad_pers, sexo_cli,
        estado_civil_pers, estatura_cli, peso_cli, parroq_cli,
        calle_princ_pers, calle_secun_pers, id_ciud, id_estado
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18, $19, $20
      )  RETURNING id_pers;
    `, [
      formulario.cedr_cli,
      formulario.tipo_cedr_cli,
      formulario.nacion_cli,
      formulario.nom_cli,
      formulario.ape_cli,
      formulario.fecha_naci_cli,
      formulario.lugar_naci_cli,
      formulario.tel_pers,
      formulario.cel_pers,
      formulario.email_pers,
      formulario.edad_pers,
      formulario.sexo_cli,
      formulario.estado_civil_pers,
      formulario.estatura_cli,
      formulario.peso_cli,
      formulario.parroq_cli,
      formulario.calle_princ_pers,
      formulario.calle_secun_pers,
      formulario.id_ciud,
      est
    ]);

    const idInsertado = data.rows[0].id_pers;
    res.json({ message: "Cliente guardado exitosamente", id_pers: idInsertado });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error al guardar cliente",
      error: error.message
    });
  }
});

router.post("/comprobCredenciales", async (req, res) => {
  const { cedr_cli, email_pers } = req.body;
  try {
    const resultado = await database.query(
      ` SELECT 
        CASE 
          WHEN cedr_cli = $1 THEN 'cedula'
          WHEN email_pers = $2 THEN 'correo'
        END AS tipo
      FROM cliente
      WHERE cedr_cli = $1 OR email_pers = $2
      LIMIT 1; `,
      [cedr_cli, email_pers]
    );

    if (resultado.rowCount > 0) {
      const tipo = resultado.rows[0].tipo;
      const mensaje =
        tipo === 'cedula'
          ? "La cédula ya está registrada"
          : "El correo ya está registrado";
      return res.status(400).json({ message: mensaje });
    }

    res.status(200).json({ message: "Credenciales disponibles" });

  } catch (error) {
    console.error("Error al verificar credenciales:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
});

router.put("/update", async (req, res) => {
  const formulario = req.body;
  try {
    if (!formulario.id_pers) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el ID del cliente para actualizar"
      });
    }

    const data = await database.query(`
      UPDATE cliente SET
        cedr_cli = $1,
        tipo_cedr_cli = $2,
        nacion_cli = $3,
        nom_cli = $4,
        ape_cli = $5,
        fecha_naci_cli = $6,
        lugar_naci_cli = $7,
        tel_pers = $8,
        cel_pers = $9,
        email_pers = $10,
        edad_pers = $11,
        sexo_cli = $12,
        estado_civil_pers = $13,
        estatura_cli = $14,
        peso_cli = $15,
        parroq_cli = $16,
        calle_princ_pers = $17,
        calle_secun_pers = $18,
        id_ciud = $19
      WHERE id_pers = $20
      RETURNING id_pers, cedr_cli, nom_cli, ape_cli
    `, [
      formulario.cedr_cli,
      formulario.tipo_cedr_cli,
      formulario.nacion_cli,
      formulario.nom_cli,
      formulario.ape_cli,
      formulario.fecha_naci_cli,
      formulario.lugar_naci_cli,
      formulario.tel_pers,
      formulario.cel_pers,
      formulario.email_pers,
      formulario.edad_pers,
      formulario.sexo_cli,
      formulario.estado_civil_pers,
      formulario.estatura_cli,
      formulario.peso_cli,
      formulario.parroq_cli,
      formulario.calle_princ_pers,
      formulario.calle_secun_pers,
      formulario.id_ciud,
      formulario.id_pers
    ]);

    if (data.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado"
      });
    }

    res.status(200).json({
      success: true,
      message: "Cliente actualizado correctamente",
      cliente: data.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Error al actualizar cliente",
      message: error.message
    });
  }
});

router.put("/desactivar", async (req, res) => {
  const formulario = req.body;

  try {
    if (!formulario.id_pers) {
      return res.status(400).json({
        success: false,
        message: "Se requiere el ID del cliente para desactivar"
      });
    }

    const data = await database.query(`
      UPDATE cliente SET
        id_estado = $1
      WHERE id_pers = $2
      RETURNING id_pers, cedr_cli, nom_cli, ape_cli
    `, [
      ESTADO_INACTIVO,
      formulario.id_pers
    ]);

    if (data.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Cliente no encontrado"
      });
    }

    res.status(200).json({
      success: true,
      message: "Cliente desactivado correctamente",
      cliente: data.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      error: "Error al desactivar cliente",
      message: error.message
    });
  }
});
router.put("/activar", async (req, res) => {
  const { id_pers } = req.body;
  const desac = '1';
  try {
    const data = await database.query(`
      UPDATE cliente SET
        id_estado = $1
      WHERE id_pers = $2
    `, [
      desac,
      id_pers
    ]);

    res.status(200).json({ message: "Cliente actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});
router.get("/buscar", async (req, res) => {
  const idCli = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  try {
    const query = "SELECT * FROM cliente WHERE cedr_cli = $1";
    const data = await database.query(query, [idCli]);

    if (data.rows.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.json(data.rows[0]);
  } catch (error) {
    console.error("Error en consulta:", error);
    res.status(500).json({ message: "Error al obtener datos", error });
  }
});

router.post("/validar-token-email", async (req, res) => {
  const { url } = req.body;

  try {
    const result = await database.query(
      "SELECT token_val_email,id_val_email FROM validar_email WHERE url_emal = $1",
      [url]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "URL no encontrada." });
    }

    const token = result.rows[0].token_val_email;

    let payload;
    try {
      payload = jwt.verify(token, "emailCliente");
    } catch (err) {
      return res.status(401).json({ success: false, message: "Token inválido o expirado." });
    }

    res.status(200).json({
      success: true,
      message: "Token válido.",
      data: payload,
      idvalid: result.rows[0].id_val_email
    });

  } catch (error) {
    console.error("Error al validar token:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor." });
  }
});

router.get("/buscarclienteID", async (req, res) => {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  try {
    const query = `SELECT * FROM cliente WHERE id_pers = $1`;
    const data = await database.query(query, [id]);
    res.json(data.rows);
  } catch (error) {
    console.error("Error en consulta:", error);
    res.status(500).json({ success: false, message: "Error al obtener datos", error: error.message });
  }
});

router.put("/activar-cuenta", async (req, res) => {
  const { id, idvalid } = req.body;
  const estadoActivo = '4';
  if (!id || !idvalid) {
    return res.status(400).json({ error: "Faltan datos requeridos (id o idvalid)." });
  }
  try {
    const updateResult = await database.query(`
      UPDATE cliente 
      SET id_estado = $1
      WHERE id_pers = $2
    `, [estadoActivo, id]);

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: "Cliente no encontrado." });
    }

    await database.query(
      "DELETE FROM validar_email WHERE id_val_email = $1",
      [idvalid]
    );

    res.status(200).json({ message: "Cuenta del cliente activada con éxito." });

  } catch (error) {
    console.error("Error al activar cuenta:", error);
    res.status(500).json({ error: "Error interno al actualizar cliente." });
  }
});

router.post("/generar_token_email", async (req, res) => {

  try {
    const { id_pers, url,pass } = req.body; // Espera un JSON: { id_pers: 1, url: "algo.com" }
    const payload = { id_pers,pass };
    const token = jwt.sign(payload, "emailCliente", { expiresIn: "1h" });

    await database.query(
      "INSERT INTO validar_email (url_emal, token_val_email,id_pers) VALUES ($1, $2, $3)",
      [url, token, id_pers]
    );

    res.json({ success: true, token, message: "Token creado y guardado exitosamente." });
  } catch (error) {
    console.error("Error en /generar_token_email:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

router.put("/actualizar_token_email", async (req, res) => {
  try {
    const { id_pers, url,pass } = req.body;
    const payload = { id_pers,pass };
    const token = jwt.sign(payload, "emailCliente", { expiresIn: "1h" });
    const result = await database.query(
      `UPDATE validar_email
       SET url_emal = $1, token_val_email = $2
       WHERE id_pers = $3`,
      [url, token, id_pers]
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

router.put("/update-correo", async (req, res) => {
  const formulario = req.body;
  try {
    const data = await database.query(`
      UPDATE cliente SET
        email_pers = $1
      WHERE id_pers = $2
    `, [
      formulario.newEmail,
      formulario.id_pers
    ]);

    res.status(200).json({ message: "Cliente actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});

router.post("/buscar-ruta-token", async (req, res) => {
  const { id } = req.body;
  try {
    const result = await database.query(
      "SELECT token_val_email, url_emal FROM validar_email WHERE id_pers = $1",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "No se encontró una URL asociada al agente." });
    }

    const token = result.rows[0].token_val_email;

    try {
      jwt.verify(token, "emailCliente");
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

