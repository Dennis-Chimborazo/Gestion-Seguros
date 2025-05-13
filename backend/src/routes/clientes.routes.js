const { Router } = require("express");
const { DataBase } = require("../database.js");
const router = Router();
const db = new DataBase();
const database = db.getConexion();


const ESTADO_ACTIVO = '1';
const ESTADO_INACTIVO = '2';


router.get("/listar", async (req, res) => {
  try {

    const query = `SELECT * FROM cliente WHERE id_estado = $1`;
    const data = await database.query(query, [ESTADO_ACTIVO]);
 

    res.json(data.rows);
  } catch (error) {
    console.error("Error en consulta:", error);
    res.status(500).json({ success: false, message: "Error al obtener datos", error: error.message });
  }
});


router.post("/save", async (req, res) => {
  const formulario = req.body;  
  
  try {
     const existe = await database.query(`
      SELECT 1 FROM cliente WHERE cedr_cli = $1;
    `, [formulario.cedr_cli]);

    if (existe.rowCount > 0) {
      return res.status(400).json({ message: "El nombre del tipo de seguro ya existe" });
    }

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
      ) RETURNING id_pers, cedr_cli, nom_cli, ape_cli
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
      ESTADO_ACTIVO
    ]);
   
    res.status(201).json({ 
      success: true,
      message: "Cliente guardado exitosamente", 
      cliente: data.rows[0] 
    });
  } catch (error) {
    console.error(error);
    // Verificar si es error de duplicado
    if (error.code === '23505') { // Código PostgreSQL para violación de clave única
      return res.status(409).json({ 
        success: false, 
        message: "Ya existe un cliente con esa cédula", 
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Error al guardar cliente", 
      error: error.message 
    });
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
    
    // Verificar si se actualizó algún cliente
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

// Desactivar cliente (cambiar estado)
router.put("/desactivar", async (req, res) => {
  const formulario = req.body;
  
  try {
    // Validar que exista el ID de cliente
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
    
    // Verificar si se actualizó algún cliente
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

router.get("/buscar", async (req, res) => {
  const idCli = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  try {
    const query = "SELECT * FROM cliente WHERE cedr_cli = $1";
    const data = await database.query(query, [idCli]);

    if (data.rows.length === 0) {
      return res.status(404).json({ message: "Cliente no encontrado" });
    }
    res.json(data.rows[0]); // ← Aquí retornas un solo objeto
  } catch (error) {
    console.error("Error en consulta:", error);
    res.status(500).json({ message: "Error al obtener datos", error });
  }
});


module.exports = router; 

