const { Router } = require("express");
const { DataBase } = require("../database.js");

const router = Router();
const db = new DataBase();
const database = db.getConexion();

router.get("/listar", async (req, res) => {
  try {
    const id = 1;
    const query = "SELECT * FROM tipo_seguro WHERE id_estado = $1";
    const values = [id];
    const data = await database.query(query, values); // ✅ solo una ejecución
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener datos", error });
  }
});

router.post("/save", async (req, res) => {
  const nuevoTipoSeguro = req.body;

  try {
    const existe = await database.query(`
      SELECT 1 FROM tipo_seguro WHERE nom_tip_seg = $1;
    `, [nuevoTipoSeguro.nom_tip_seg]);

    if (existe.rowCount > 0) {
      return res.status(400).json({ message: "El nombre del tipo de seguro ya existe" });
    }
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
      res.json(data.rows);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener datos", error });
    }
  });

router.get("/seguroBeneficio", async (req, res) => {
    try {
      const idSeguro = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
      if (!idSeguro) {
        return res.status(400).json({ message: "El parámetro 'categoria' es requerido" });
      }
  
      const query = `SELECT sb.id_beneficios, c.id_categoria
                      FROM seguro_bedeficio sb
                      INNER JOIN beneficios b ON sb.id_beneficios = b.id_beneficios
                      INNER JOIN categoria c ON b.id_categoria = c.id_categoria
                      WHERE sb.id_tip_seg = $1`;
      const values = [idSeguro]; // ✅ aquí va el valor correcto
      const data = await database.query(query, values);
      res.json(data.rows);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener datos", error });
    }
  });

router.delete("/deleteBeneficios", async (req, res) => {
  const idSeguro = req.body;
  if (!idSeguro) {us(400).json({ message: "Falta el parámetro 'id'" });
  }
  try {
    const result = await database.query(
      "DELETE FROM seguro_bedeficio WHERE id_tip_seg = $1",
      [idSeguro.id]
    );
    res.json({ message: "Beneficios eliminados correctamente", rowsAffected: result.rowCount });
  } catch (error) {
    return res.json({ message: "Error al eliminar beneficios", error });
  }
});

router.put("/updateSeguro", async (req, res) => {
  const tipoSeguro = req.body;

  if (!tipoSeguro.id_tip_seg) {
    return res.status(400).json({ message: "Falta el ID del tipo de seguro" });
  }

  try {

    const existe = await database.query(`
      SELECT 1 FROM tipo_seguro WHERE nom_tip_seg = $1;
    `, [tipoSeguro.nom_tip_seg]);

    if (existe.rowCount > 0) {
      return res.status(400).json({ message: "El nombre del tipo de seguro ya existe" });
    }
    const result = await database.query(`
      UPDATE tipo_seguro
      SET
        nom_tip_seg = $1,
        descrip_tip_seg = $2,
        pago_tip_seg = $3,
        suma_tip_seg = $4,
        id_estado = $5
      WHERE id_tip_seg = $6
      RETURNING *;
    `, [
      tipoSeguro.nom_tip_seg,
      tipoSeguro.descrip_tip_seg,
      tipoSeguro.pago_tip_seg,
      tipoSeguro.suma_tip_seg,
      tipoSeguro.id_estado,
      tipoSeguro.id_tip_seg
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Tipo de seguro no encontrado" });
    }

    res.json({ message: "Tipo de seguro actualizado correctamente", data: result.rows[0] });
  } catch (error) {
    console.error("Error al actualizar tipo de seguro:", error);
    res.status(500).json({ message: "Error al actualizar tipo de seguro", error });
  }
});

router.put("/desactivar", async (req, res) => {
  const formulario = req.body;
  const desac='2';
  try {
    const data = await database.query(`
      UPDATE tipo_seguro SET
        id_estado = $1
      WHERE id_tip_seg = $2
    `, [
      desac,
      formulario.id
    ]);

    res.status(200).json({ message: "Cliente actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});

router.get("/buscar", async (req, res) => {
  try {
    const id = 1; 
    const nombre = req.query.nombre; 

    const query = "SELECT * FROM tipo_seguro WHERE nom_tip_seg = $1 AND id_estado = $2 ";
    const values = [ nombre,id];

    const data = await database.query(query, values);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener datos", error });
  }
});


module.exports = router; 