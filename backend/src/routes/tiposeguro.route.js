const { Router } = require("express");
const { DataBase } = require("../database.js");

const router = Router();
const db = new DataBase();
const database = db.getConexion();

router.get("/listar", async (req, res) => {
  try {
    const data = await database.query("SELECT * FROM tipo_seguro");
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener datos", error });
  }
});

router.post("/save", async (req, res) => {
  const nuevoTipoSeguro = req.body;

  try {
    const data = await database.query(`
      INSERT INTO tipo_seguro (
        nom_tip_seg, descrip_tip_seg, pago_tip_seg, suma_tip_seg, id_estado
      ) VALUES (
        $1, $2, $3, $4, $5
      )
      RETURNING *;
    `, [
      nuevoTipoSeguro.nom_tip_seg,
      nuevoTipoSeguro.descrip_tip_seg,
      nuevoTipoSeguro.pago_tip_seg,
      nuevoTipoSeguro.suma_tip_seg,
      '1'
    ]);

    res.json({ message: "Tipo de seguro guardado exitosamente", data: data.rows[0] });
  } catch (error) {
    console.error("Error al guardar tipo de seguro:", error);
    res.status(500).json({ message: "Error al guardar tipo de seguro", error });
  }
});

router.post("/savebeneficios", async (req, res) => {
  const pares = req.body; // Se espera que sea un array de arrays

  if (!Array.isArray(pares) || pares.length === 0) {
    return res.status(400).json({ message: "No se enviaron datos válidos." });
  }

  const values = [];
  const placeholders = pares.map((pair, i) => {
    values.push(...pair); // Descompone el array [id_tip_seg, id_beneficios]
    const idx = i * 2;
    return `($${idx + 1}, $${idx + 2})`;
  }).join(", ");

  try {
    const query = `
      INSERT INTO seguro_bedeficio (id_tip_seg, id_beneficios)
      VALUES ${placeholders};
    `;
    await database.query(query, values); // Envía los valores correctamente

    res.json({ message: "Beneficios guardados exitosamente." });
  } catch (error) {
    console.error("Error al insertar beneficios:", error);
    res.status(500).json({ message: "Error al insertar beneficios", error });
  }
});



router.get("/categoria", async (req, res) => {
  try {
    const data = await database.query("SELECT * FROM categoria");
    res.json(data.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener datos", error });
  }
});

router.get("/beneficios", async (req, res) => {
    try {
      const categoria = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
      if (!categoria) {
        return res.status(400).json({ message: "El parámetro 'categoria' es requerido" });
      }
  
      const query = "SELECT * FROM beneficios WHERE id_categoria = $1";
      const values = [categoria]; // ✅ aquí va el valor correcto
      const data = await database.query(query, values);
  console.log(data.rows)
      res.json(data.rows);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener datos", error });
    }
  });

module.exports = router; 