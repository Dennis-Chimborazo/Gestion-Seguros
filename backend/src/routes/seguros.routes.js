const { Router } = require("express");
const { DataBase } = require("../database.js");

const router = Router();
const db = new DataBase();
const database = db.getConexion();

router.get("/listar", async (req, res) => {
  try {
    const data = await database.query("SELECT * FROM seguros");
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener datos", error });
  }
});

router.post("/save", async (req, res) => {
    const formulario = req.body;
  
    try {
      const data = await database.query(`
        INSERT INTO seguros (
          ciud_seguro, dia_seguro, mes_seguro, anio_seguro, firma_seguro, id_pers
        ) VALUES (
          $1, $2, $3, $4, $5, $6
        )
      `, [
        formulario.ciud_seguro,
        formulario.dia_seguro,
        formulario.mes_seguro,
        formulario.anio_seguro,
        formulario.firma_seguro,
        formulario.id_pers
      ]);
  
      res.json({ message: "Seguro guardado exitosamente", data });
    } catch (error) {
      console.error("Error al guardar seguro:", error);
      res.status(500).json({ message: "Error al guardar seguro", error });
    }
  });
  
  router.post("/personafac/save", async (req, res) => {
    const formulario = req.body;
  
    try {
      const data = await database.query(`
        INSERT INTO persona_fac (
          cedr_pers_fac,
          razon_pers_fac,
          tipo_pers_fac,
          nacion_pers_fac,
          nom_pers_fac,
          ape_pers_fac,
          tel_pers_fac,
          cel_pers_fac,
          email_pers_fac,
          direc_pers_fac,
          parent_pers_fac
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING id_pers_fac
      `, [
        formulario.cedr_pers_fac,
        formulario.razon_pers_fac,
        formulario.tipo_pers_fac,
        formulario.nacion_pers_fac,
        formulario.nom_pers_fac,
        formulario.ape_pers_fac,
        formulario.tel_pers_fac,
        formulario.cel_pers_fac,
        formulario.email_pers_fac,
        formulario.direc_pers_fac,
        formulario.parent_pers_fac
      ]);
  
      res.json({
        message: "Persona factura guardada exitosamente",
        id_pers_fac: data.rows[0].id_pers_fac
      });
    } catch (error) {
      console.error("Error al guardar persona_factura:", error);
      res.status(500).json({ message: "Error al guardar persona_factura", error });
    }
  });
  
  router.post("/cuentabanco/save", async (req, res) => {
    const formulario = req.body;
  
    try {
      const data = await database.query(`
        INSERT INTO cuenta_banco (
          tipo_cuent_Ban,
          nom_cuent_Ban,
          mun_cuent_Ban
        ) VALUES (
          $1, $2, $3
        ) RETURNING id_cuent_Ban
      `, [
        formulario.tipo_cuent_Ban,
        formulario.nom_cuent_Ban,
        formulario.mun_cuent_Ban
      ]);
  
      res.json({
        message: "Cuenta bancaria guardada exitosamente",
        id_cuent_Ban: data.rows[0].id_cuent_ban
      });
    } catch (error) {
      console.error("Error al guardar cuenta bancaria:", error);
      res.status(500).json({ message: "Error al guardar cuenta bancaria", error });
    }
  });

  router.post("/saveSeguro", async (req, res) => {
    const formulario = req.body;
    console.log(formulario);
    const idEstado =3
    try {
     const data = await database.query(`
            INSERT INTO seguros (
              ciud_seguro,
              dia_seguro,
              mes_seguro,
              anio_seguro,
              monto_seguro,
              tiempo_seguro,
              id_pers,
              id_emple,
              id_tip_seg,
              id_pers_fac,
              id_cuent_Ban,
              id_estado
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
            ) RETURNING id_seguro
          `, [
            formulario.ciud_seguro,
            formulario.dia_seguro,
            formulario.mes_seguro,
            formulario.anio_seguro,
            formulario.monto_seguro,
            formulario.tiempo_seguro,
            formulario.id_pers,
            formulario.id_emple,
            formulario.id_tip_seg,
            formulario.id_pers_fac,
            formulario.id_cuent_Ban,
            idEstado
          ]);

      res.json({
        message: "Seguro guardado exitosamente",
        id_seguro: data.rows[0].id_seguro
      });
    } catch (error) {
      console.error("Error al guardar seguro:", error);
      res.status(500).json({ message: "Error al guardar seguro", error });
    }
  });

  router.post("/saveDependientes", async (req, res) => {
  const dependientes = req.body; // Se espera un array de objetos

  if (!Array.isArray(dependientes) || dependientes.length === 0) {
    return res.status(400).json({ message: "No se enviaron datos válidos." });
  }

  const values = [];
  const placeholders = dependientes.map((dep, i) => {
    const idx = i * 11;
    values.push(
      dep.cedr_depen,
      dep.tipo_cedr_depen,
      dep.nom_depen,
      dep.ape_depen,
      dep.fecha_naci_depen,
      dep.parent_depen,
      dep.discap_depen,
      dep.cond_depen,
      dep.fecha_fin_cond,
      dep.fecha_ini_cond,
      dep.id_seguro
    );
    return `($${idx + 1}, $${idx + 2}, $${idx + 3}, $${idx + 4}, $${idx + 5}, $${idx + 6}, $${idx + 7}, $${idx + 8}, $${idx + 9}, $${idx + 10}, $${idx + 11})`;
  }).join(", ");

  const query = `
    INSERT INTO dependientes (
      cedr_depen,
      tipo_cedr_depen,
      nom_depen,
      ape_depen,
      fecha_naci_depen,
      parent_depen,
      discap_depen,
      cond_depen,
      fecha_fin_cond,
      fecha_ini_cond,
      id_seguro
    ) VALUES ${placeholders};
  `;

  try {
    await database.query(query, values);
    res.json({ message: "Dependientes guardados exitosamente." });
  } catch (error) {
    console.error("Error al insertar dependientes:", error);
    res.status(500).json({ message: "Error al insertar dependientes", error });
  }
});


module.exports = router; 