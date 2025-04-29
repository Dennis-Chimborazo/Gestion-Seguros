const { Router } = require("express");
const { DataBase } = require("../database.js");

const router = Router();
const db = new DataBase();
const database = db.getConexion();

router.get("/listar", async (req, res) => {
  try {
    const query = `SELECT * FROM cliente WHERE id_estado = $1`;
    const id_estado = '1'; // o un número si corresponde
    const data = await database.query(query, [id_estado]);
  
    res.json(data);
  } catch (error) {
    console.error("Error en consulta:", error);
    res.status(500).json({ message: "Error al obtener datos", error });
  }
  
});

router.post("/save", async (req, res) => {
  const formulario = req.body;  
  const estado='1';
  try {
    const data = await database.query(`
      INSERT INTO cliente (
        cedr_cli, tipo_cedr_cli, nacion_cli, nom_cli, ape_cli, fecha_naci_cli, 
        lugar_naci_cli, tel_pers, cel_pers, email_pers, edad_pers, sexo_cli, 
        estado_civil_pers, estatura_cli, peso_cli, parroq_cli, 
        calle_princ_pers, calle_secun_pers, id_ciud,id_estado
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 
        $7, $8, $9, $10, $11, $12, 
        $13, $14, $15, $16, $17, $18, $19, $20
      )
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
      estado
    ]);
    

    res.json({ message: "Cliente guardado exitosamente", data });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al guardar cliente", error });
  }
});

router.put("/update", async (req, res) => {
  const formulario = req.body;
  console.log(formulario);
  try {
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

    res.status(200).json({ message: "Cliente actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});


router.put("/desactivar", async (req, res) => {
  const formulario = req.body;
  const desac='2';
  try {
    const data = await database.query(`
      UPDATE cliente SET
        id_estado = $1
      WHERE id_pers = $2
    `, [
      desac,
      formulario.id_pers
    ]);

    res.status(200).json({ message: "Cliente actualizado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar cliente" });
  }
});

module.exports = router; 