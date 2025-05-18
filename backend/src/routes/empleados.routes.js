const { Router } = require("express");
const { DataBase } = require("../database.js");

const router = Router();
const db = new DataBase();
const database = db.getConexion();

router.get("/buscarempleado", async (req, res) => {
  try {
       const cedula = req.query.id;
    if (!cedula) {
      return res.status(400).json({ message: cedula });
    }
    const query = "SELECT * FROM empleado WHERE ced_emple = $1";
    const values = [cedula];
    const data = await database.query(query, values);
    res.json(data.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el empleado", error });
  }
});


module.exports = router; 