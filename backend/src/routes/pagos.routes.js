const { Router } = require("express");
const { DataBase } = require("../database.js");
const router = Router();
const db = new DataBase();
const database = db.getConexion();
const dayjs = require("dayjs");

router.post('/pago-cliente', async (req, res) => {
    const id_estado = 3
      const fechaActual = dayjs().format("YYYY-MM-DD");
    
  const {
    nonto_pago, // corregir a monto_pago si es un error
    comprobante_pago,
    id_pers,
    id_seguro,
    id_archivos_cliente,
  } = req.body;

  // Validación básica
  if ( !nonto_pago || !comprobante_pago || !id_pers || !id_seguro || !id_archivos_cliente || !id_estado) {
    return res.status(400).json({ error: "Faltan campos obligatorios." });
  }

  try {
    const query = `
      INSERT INTO pago_cliente 
      (fecha_pago, nonto_pago, comprobante_pago, id_pers, id_seguro, id_archivos_cliente, id_estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [
      fechaActual,
      nonto_pago,
      comprobante_pago,
      id_pers,
      id_seguro,
      id_archivos_cliente,
      id_estado
    ];

    const result = await database.query(query, values);
    res.status(201).json({
      mensaje: "Pago registrado exitosamente.",
      pago: result.rows[0]
    });
  } catch (error) {
    console.error("Error al insertar el pago:", error);
    res.status(500).json({ error: "Error interno al registrar el pago." });
  }
});

router.get("/pago-cliente/estado/1", async (req, res) => {
  try {
    const query = `
      SELECT p.id_pago, p.fecha_pago, p.nonto_pago, p.comprobante_pago,
             p.id_pers, (c.ape_cli || ' ' || c.nom_cli) AS nombre, c.cedr_cli,
             p.id_seguro, tp.nom_tip_seg,
             p.id_archivos_cliente,
             e.nom_estado
      FROM pago_cliente p
      INNER JOIN cliente c ON c.id_pers = p.id_pers
      INNER JOIN seguros s ON s.id_seguro = p.id_seguro
      INNER JOIN tipo_seguro tp ON tp.id_tip_seg = s.id_tip_seg
      INNER JOIN estado e ON e.id_estado = p.id_estado
      WHERE p.id_estado = 1;
    `;
    const result = await database.query(query);
    res.json(result);
  } catch (error) {
    console.error("Error en consulta estado=1:", error);
    res.status(500).json({ error: "Error al obtener pagos con estado 1." });
  }
});

router.get("/pago-revision-pendientes", async (req, res) => {
  try {
    const query = `SELECT pg.id_pago, pg.fecha_pago,pg.nonto_pago,pg.comprobante_pago,pg.id_archivos_cliente,
    tp.nom_tip_seg,e.nom_estado,(c.ape_cli || ' ' ||c.nom_cli)as nombre,c.cedr_cli
      FROM pago_cliente pg
      INNER JOIN seguros s ON s.id_seguro = pg.id_seguro
      INNER JOIN tipo_seguro tp ON tp.id_tip_seg = s.id_tip_seg
      INNER JOIN estado e ON e.id_estado = pg.id_estado
      INNER JOIN cliente c ON c.id_pers = pg.id_pers
      WHERE  pg.id_estado = 3`;
    const result = await database.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error en consulta estado IN (3,7):", error);
    res.status(500).json({ error: "Error al obtener pagos pendientes." });
  }
});

router.get("/pagos-revision-cliente", async (req, res) => {
  const id_pers = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id_pers) {
    return res.status(400).json({ error: "Falta el parámetro 'id_pers'." });
  }
  try {
    const query = ` SELECT pg.id_pago, pg.fecha_pago,pg.nonto_pago, 
        pg.comprobante_pago,tp.nom_tip_seg,e.nom_estado
      FROM pago_cliente pg
      INNER JOIN seguros s ON s.id_seguro = pg.id_seguro
      INNER JOIN tipo_seguro tp ON tp.id_tip_seg = s.id_tip_seg
      INNER JOIN estado e ON e.id_estado = pg.id_estado
      WHERE pg.id_pers = $1 AND pg.id_estado IN (3, 7);`;
    const values = [id_pers];
    const result = await database.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener pagos en revisión del cliente:", error);
    res.status(500).json({ error: "Error interno al obtener pagos en revisión." });
  }
});

router.get("/pagos-aprobados-cliente", async (req, res) => {
  const id_pers = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  if (!id_pers) {
    return res.status(400).json({ error: "Falta el parámetro 'id_pers'." });
  }
  try {
    const query = `
      SELECT 
        pg.id_pago, 
        pg.fecha_pago, 
        pg.nonto_pago, 
        pg.comprobante_pago, 
        tp.nom_tip_seg,
        e.nom_estado
      FROM pago_cliente pg
      INNER JOIN seguros s ON s.id_seguro = pg.id_seguro
      INNER JOIN tipo_seguro tp ON tp.id_tip_seg = s.id_tip_seg
      INNER JOIN estado e ON e.id_estado = pg.id_estado
      WHERE pg.id_pers = $1 AND pg.id_estado = 6;
    `;
    const values = [id_pers];
    const result = await database.query(query, values);
    res.json(result.rows);
  } catch (error) {
    console.error("Error al obtener pagos en revisión del cliente:", error);
    res.status(500).json({ error: "Error interno al obtener pagos en revisión." });
  }
});

router.post("/save-revision-aprovado", async (req, res) => {
  const id_estado=6
  const { descripcion_revision_pago, id_pago } = req.body;
  const fechaRevision = dayjs().format("YYYY-MM-DD");

  try {
    const result = await database.query(
      `INSERT INTO revision_pago (
        fecha_revision_pago, descripcion_revision_pago, id_pago, id_estado
      ) VALUES (
        $1, $2, $3, $4
      ) RETURNING id_revision_pago;`,
      [fechaRevision, descripcion_revision_pago, id_pago, id_estado]
    );

     await database.query(`
      UPDATE pago_cliente SET
        id_estado = $1
      WHERE id_pago = $2
    `, [
      id_estado,
      id_pago
    ]);

    res.json({
      message: " Revisión guardada exitosamente",
       success: true
    });

  } catch (error) {
    console.error(" Error al guardar pago:", error);
    res.status(500).json({ message: "Error al guardar revisión", error });
  }
});

router.post("/save-revision-rechasada", async (req, res) => {
  const id_estado=7
  const { descripcion_revision_pago, id_pago } = req.body;
  const fechaRevision = dayjs().format("YYYY-MM-DD");

  try {
    const result = await database.query(
      `INSERT INTO revision_pago (
        fecha_revision_pago, descripcion_revision_pago, id_pago, id_estado
      ) VALUES (
        $1, $2, $3, $4
      ) RETURNING id_revision_pago;`,
      [fechaRevision, descripcion_revision_pago, id_pago, id_estado]
    );

     await database.query(`
      UPDATE pago_cliente SET
        id_estado = $1
      WHERE id_pago = $2
    `, [
      id_estado,
      id_pago
    ]);

    res.json({
      message: "Revisión guardada exitosamente",
       success: true
    });

  } catch (error) {
    console.error(" Error al guardar revisión:", error);
    res.status(500).json({ message: "Error al guardar revisión", error });
  }
});
router.get("/buscar-pago-rechazado", async (req, res) => {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  try {
    const query = `SELECT r.fecha_revision_pago, r.descripcion_revision_pago
                FROM revision_pago r
                INNER JOIN pago_cliente p on p.id_pago = r.id_pago
                where p.id_pago= $1`;
    const data = await database.query(query, [id]);
    res.json(data.rows);
  } catch (error) {
    console.error("Error en consulta:", error);
    res.status(500).json({ success: false, message: "Error al obtener datos", error: error.message });
  }
});
module.exports = router;
