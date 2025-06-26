const { Router } = require("express");
const { DataBase } = require("../database.js");
const router = Router();
const db = new DataBase();
const database = db.getConexion();


router.get("/informacion", async (req, res) => {
  try {
    const stats = {};

    const totalClientes = await database.query("SELECT COUNT(*) FROM cliente");
    stats.total_clientes = parseInt(totalClientes.rows[0].count);

    const totalSeguros = await database.query("SELECT COUNT(*) FROM seguros");
    stats.total_seguros = parseInt(totalSeguros.rows[0].count);

    const segurosPorTipo = await database.query(`
      SELECT ts.nom_tip_seg, COUNT(s.id_seguro) AS total
      FROM tipo_seguro ts
      LEFT JOIN seguros s ON ts.id_tip_seg = s.id_tip_seg
      GROUP BY ts.nom_tip_seg
    `);
    stats.seguros_por_tipo = segurosPorTipo.rows;

    const pagosPorEstado = await database.query(`
      SELECT e.nom_estado, COUNT(*) AS total
      FROM pago_cliente p
      JOIN estado e ON p.id_estado = e.id_estado
      GROUP BY e.nom_estado
    `);
    stats.pagos_por_estado = pagosPorEstado.rows;

    const reembolsosPorEstado = await database.query(`
      SELECT e.nom_estado, COUNT(*) AS total
      FROM reembolso r
      JOIN estado e ON r.id_estado = e.id_estado
      GROUP BY e.nom_estado
    `);
    stats.reembolsos_por_estado = reembolsosPorEstado.rows;

    res.json(stats);
  } catch (error) {
    console.error("Error al obtener datos del dashboard:", error);
    res.status(500).json({ error: "Error al obtener datos del dashboard" });
  }
});

router.get("/informacion-cliente", async (req, res) => {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  console.log(id);   

  try {
    const clienteInfo = {};

    const cliente = await database.query(`
      SELECT c.*, ci.nom_ciud, p.nom_provin, e.nom_estado
      FROM cliente c
      LEFT JOIN ciudad ci ON c.id_ciud = ci.id_ciud
      LEFT JOIN provincia p ON ci.id_provin = p.id_provin
      LEFT JOIN estado e ON c.id_estado = e.id_estado
      WHERE c.id_pers = $1
    `, [id]);

    if (cliente.rows.length === 0) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    clienteInfo.datos_personales = cliente.rows[0];

    const seguros = await database.query(`
      SELECT s.id_seguro, ts.nom_tip_seg, s.ciud_seguro, s.dia_seguro, s.mes_seguro, s.anio_seguro,
             s.monto_seguro, s.tiempo_seguro, e.nom_estado
      FROM seguros s
      JOIN tipo_seguro ts ON s.id_tip_seg = ts.id_tip_seg
      LEFT JOIN estado e ON s.id_estado = e.id_estado
      WHERE s.id_pers = $1
    `, [id]);
    clienteInfo.seguros = seguros.rows;

    const pagos = await database.query(`
      SELECT p.id_pago, p.fecha_pago, p.nonto_pago, p.comprobante_pago, e.nom_estado
      FROM pago_cliente p
      LEFT JOIN estado e ON p.id_estado = e.id_estado
      WHERE p.id_pers = $1
    `, [id]);
    clienteInfo.pagos = pagos.rows;

    const reembolsos = await database.query(`
      SELECT r.id_reemb, r.fecha_reemb, r.motivo_reemb, e.nom_estado
      FROM reembolso r
      LEFT JOIN estado e ON r.id_estado = e.id_estado
      WHERE r.id_pers = $1
    `, [id]);
    clienteInfo.reembolsos = reembolsos.rows;

    const archivos = await database.query(`
      SELECT id_archivos_cliente, tipo_archivos_cliente, nombre_archivo_cliente, mime_type_archivo_cliente
      FROM archivos_cliente
      WHERE id_pers = $1
    `, [id]);
    clienteInfo.archivos = archivos.rows;

    res.json([clienteInfo]);

  } catch (error) {
    console.error("Error al obtener información del cliente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

router.get("/informacion-agente", async (req, res) => {
  const ced = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  try {
    const agenteInfo = {};

    const agenteRes = await database.query(`
      SELECT a.*, e.nom_estado
      FROM agente a
      LEFT JOIN estado e ON a.id_estado = e.id_estado
      WHERE ced_agente = $1
    `, [ced]);

    if (agenteRes.rows.length === 0) {
      return res.status(404).json({ error: "Agente no encontrado" });
    }

    const agente = agenteRes.rows[0];
    agenteInfo.datos_personales = agente;

    // 2. Clientes que han contratado seguros gestionados por el agente
    const clientesRes = await database.query(`
      SELECT DISTINCT c.id_pers, c.nom_cli, c.ape_cli, c.email_pers, est.nom_estado AS estado_cliente
      FROM cliente c
      JOIN seguros s ON s.id_pers = c.id_pers
      JOIN estado est ON c.id_estado = est.id_estado
      WHERE s.tipo_persona = 'agente' AND s.id_persona = $1
    `, [agente.id_agente]);
    agenteInfo.clientes = clientesRes.rows;

    // 3. Número de seguros gestionados por tipo
    const segurosRes = await database.query(`
      SELECT ts.nom_tip_seg, COUNT(*) AS total
      FROM seguros s
      JOIN tipo_seguro ts ON s.id_tip_seg = ts.id_tip_seg
      WHERE s.tipo_persona = 'agente' AND s.id_persona = $1
      GROUP BY ts.nom_tip_seg
    `, [agente.id_agente]);
    agenteInfo.seguros_por_tipo = segurosRes.rows;

    // 4. Pagos realizados por los clientes del agente
    const pagosRes = await database.query(`
      SELECT p.id_pago, p.fecha_pago, p.nonto_pago, p.comprobante_pago, e.nom_estado
      FROM pago_cliente p
      JOIN seguros s ON p.id_seguro = s.id_seguro
      JOIN estado e ON p.id_estado = e.id_estado
      WHERE s.tipo_persona = 'agente' AND s.id_persona = $1
    `, [agente.id_agente]);
    agenteInfo.pagos = pagosRes.rows;

    // Envolver en array para mantener compatibilidad frontend
    res.json([agenteInfo]);

  } catch (error) {
    console.error("Error al obtener información del agente:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});


module.exports = router;
