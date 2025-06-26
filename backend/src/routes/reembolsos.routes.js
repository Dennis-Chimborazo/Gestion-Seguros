const { Router } = require("express");
const { DataBase } = require("../database.js");

const router = Router();
const db = new DataBase();
const database = db.getConexion();
const dayjs = require("dayjs");

router.post("/save-reembolso", async (req, res) => {
  const { motivo_reemb, id_pers, id_seguro } = req.body;
  const fechaActual = dayjs().format("YYYY-MM-DD");
  const estado = 3;
  try {
    const result = await database.query(`
      INSERT INTO reembolso (
        fecha_reemb, motivo_reemb, id_pers, id_seguro,id_estado
      ) VALUES (
        $1, $2, $3, $4, $5
      ) RETURNING id_reemb; `,
      [fechaActual, motivo_reemb, id_pers, id_seguro, estado]);

    res.json({
      message: "Reembolso guardado exitosamente",
      id_reemb: result.rows[0].id_reemb
    });

  } catch (error) {
    console.error("Error al guardar reembolso:", error);
    res.status(500).json({ message: "Error al guardar reembolso", error });
  }
});

router.get("/listar", async (req, res) => {
  try {
    const query = `SELECT r.id_reemb,r.fecha_reemb, r.motivo_reemb, r.id_pers,(c.ape_cli || ' ' ||c.nom_cli)as nombre 
                  ,c.cedr_cli,r.id_seguro,e.nom_estado,tp.nom_tip_seg
                  FROM reembolso r
                  INNER JOIN seguros s ON r.id_seguro = s.id_seguro
                  INNER JOIN tipo_seguro tp ON tp.id_tip_seg = s.id_tip_seg
                  INNER JOIN estado e ON e.id_estado = r.id_estado
                  INNER JOIN cliente c ON c.id_pers = r.id_pers; `;
    const data = await database.query(query);
    res.json(data);
  } catch (error) {
    console.error("Error en consulta:", error);
    res.status(500).json({ success: false, message: "Error al obtener datos", error: error.message });
  }
});

router.get("/buscar-reembolso-cliente", async (req, res) => {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  try {
    const query = `SELECT r.id_reemb,r.fecha_reemb, r.motivo_reemb, r.id_pers,  r.id_seguro, 
                  e.nom_estado,tp.nom_tip_seg
                  FROM reembolso r
                  INNER JOIN seguros s ON r.id_seguro = s.id_seguro
                  INNER JOIN tipo_seguro tp ON tp.id_tip_seg = s.id_tip_seg
                  INNER JOIN estado e ON e.id_estado = r.id_estado
                  WHERE r.id_pers = $1`;
    const data = await database.query(query, [id]);
    res.json(data.rows);
  } catch (error) {
    console.error("Error en consulta:", error);
    res.status(500).json({ success: false, message: "Error al obtener datos", error: error.message });
  }
});

router.post("/save-revision-aprovado", async (req, res) => {
  const id_estado=6
  const { descripcion_revision, id_reemb } = req.body;
  const fechaRevision = dayjs().format("YYYY-MM-DD");

  try {
    const result = await database.query(
      `INSERT INTO revision (
        fecha_revision, descripcion_revision, id_reemb, id_estado
      ) VALUES (
        $1, $2, $3, $4
      ) RETURNING id_revision;`,
      [fechaRevision, descripcion_revision, id_reemb, id_estado]
    );

     await database.query(`
      UPDATE reembolso SET
        id_estado = $1
      WHERE id_reemb = $2
    `, [
      id_estado,
      id_reemb
    ]);

    res.json({
      message: "✅ Revisión guardada exitosamente",
       success: true
    });

  } catch (error) {
    console.error("❌ Error al guardar revisión:", error);
    res.status(500).json({ message: "Error al guardar revisión", error });
  }
});

router.post("/save-revision-rechasada", async (req, res) => {
  const id_estado=7
  const { descripcion_revision, id_reemb } = req.body;
  const fechaRevision = dayjs().format("YYYY-MM-DD");

  try {
    const result = await database.query(
      `INSERT INTO revision (
        fecha_revision, descripcion_revision, id_reemb, id_estado
      ) VALUES (
        $1, $2, $3, $4
      ) RETURNING id_revision;`,
      [fechaRevision, descripcion_revision, id_reemb, id_estado]
    );
     await database.query(`
      UPDATE reembolso SET
        id_estado = $1
      WHERE id_reemb = $2
    `, [
      id_estado,
      id_reemb
    ]);

    res.json({
      message: "✅ Revisión guardada exitosamente",
       success: true
    });

  } catch (error) {
    console.error("❌ Error al guardar revisión:", error);
    res.status(500).json({ message: "Error al guardar revisión", error });
  }
});

router.get("/buscar-reembolso-aceptado", async (req, res) => {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  try {
    const query = `SELECT 
                r.fecha_revision,r.descripcion_revision,r.id_reemb,cb.tipo_cuent_Ban,cb.nom_cuent_Ban,cb.mun_cuent_Ban
                FROM public.revision r 
                INNER JOIN reembolso rm ON rm.id_reemb = r.id_reemb
                INNER JOIN seguros s ON s.id_seguro = rm.id_seguro
                INNER JOIN cuenta_banco cb ON cb.id_cuent_Ban = s.id_cuent_Ban 
                where rm.id_reemb=$1;`;
    const data = await database.query(query, [id]);
    res.json(data.rows);
  } catch (error) {
    console.error("Error en consulta:", error);
    res.status(500).json({ success: false, message: "Error al obtener datos", error: error.message });
  }
});

router.get("/buscar-reembolso-rechazado", async (req, res) => {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  try {
    const query = `SELECT r.fecha_revision, r.descripcion_revision
                FROM revision r
                INNER JOIN reembolso rm  on r.id_reemb = rm.id_reemb
                where rm.id_reemb= $1`;
    const data = await database.query(query, [id]);
    res.json(data.rows);
  } catch (error) {
    console.error("Error en consulta:", error);
    res.status(500).json({ success: false, message: "Error al obtener datos", error: error.message });
  }
});

module.exports = router;
