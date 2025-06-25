const { Router } = require("express");
const { DataBase } = require("../database.js");

const router = Router();
const db = new DataBase();
const database = db.getConexion();
const dayjs = require("dayjs"); // Requiere instalar 'dayjs' para manejo de fechas (npm install dayjs)

router.post("/save-reembolso", async (req, res) => {
  const { motivo_reemb, id_pers, id_seguro } = req.body;
  const fechaActual = dayjs().format("YYYY-MM-DD");

  try {
    const result = await database.query(`
      INSERT INTO reembolso (
        fecha_reemb, motivo_reemb, id_pers, id_seguro
      ) VALUES (
        $1, $2, $3, $4
      ) RETURNING id_reemb;
    `, [
      fechaActual,
      motivo_reemb,
      id_pers,
      id_seguro
    ]);

    res.json({
      message: "Reembolso guardado exitosamente",
      id_reemb: result.rows[0].id_reemb
    });

  } catch (error) {
    console.error("Error al guardar reembolso:", error);
    res.status(500).json({ message: "Error al guardar reembolso", error });
  }
});


module.exports = router;
