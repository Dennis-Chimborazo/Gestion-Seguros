const { Router } = require("express");

const { DataBase } = require("../database.js");

const router = Router();
const db = new DataBase();
const database = db.getConexion();

router.get("/pais", async (req, res) => {
  try {
    const data = await database.query("SELECT * FROM pais");
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener datos", error });
  }
});

router.get("/provincia", async (req, res) => {
    try {
      const pais = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
      if (!pais) {
        return res.status(400).json({ message: "El parámetro 'pais' es requerido" });
      }
  
      const query = "SELECT * FROM provincia WHERE id_pais = $1";
      const values = [pais]; // ✅ aquí va el valor correcto
      const data = await database.query(query, values);
  
      res.json(data.rows);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener datos", error });
    }
  });

router.get("/ciudad", async (req, res) => {
    try {
      const provincia = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
      if (!provincia) {
        return res.status(400).json({ message: "El parámetro 'provincia' es requerido" });
      }
      const query = "SELECT * FROM ciudad WHERE id_provin = $1";
      const values = [provincia]; // ✅ aquí va el valor correcto
      const data = await database.query(query, values);
  
      res.json(data.rows);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener datos dd", error });
    }
  });
  
router.get("/client", async (req, res) => {
    
    try {
      const ciudad = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
      if (!ciudad) {
        return res.status(400).json({ message: "El parámetro 'ciudad' es requerido" });
      }
      const query = "SELECT c.nom_ciud,c.id_ciud,p.nom_provin,p.id_provin,a.nom_pais,a.id_pais FROM ciudad c INNER JOIN provincia p ON p.id_provin=c.id_provin INNER JOIN pais a ON p.id_pais=a.id_pais WHERE c.id_ciud=$1";
      const values = [ciudad]; 
      const data = await database.query(query, values);
  
      res.json(data.rows);
    } catch (error) {
      res.status(500).json({ message: "Error al obtener datos dd", error });
    }
  });


module.exports = router; 
