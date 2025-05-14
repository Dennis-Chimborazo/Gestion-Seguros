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
  
  router.post("/agencia/save", async (req, res) => {
    const formulario = req.body;
  
    try {
      const data = await database.query(`
        INSERT INTO dat_agencia (
          nom_trabj_dat_agencia,
          nom_agencia_dat_agencia,
          email_dat_agencia,
          firma_dat_agencia
        ) VALUES (
          $1, $2, $3, $4
        ) RETURNING id_dat_agencia
      `, [
        formulario.nom_trabj_dat_agencia,
        formulario.nom_agencia_dat_agencia,
        formulario.email_dat_agencia,
        formulario.firma_dat_agencia
      ]);
  
      res.json({ 
        message: "Datos de agencia guardados exitosamente",
        id_dat_agencia: data.rows[0].id_dat_agencia 
      });
    } catch (error) {
      console.error("Error al guardar datos de agencia:", error);
      res.status(500).json({ message: "Error al guardar datos de agencia", error });
    }
  });
  
  router.post("/exclisivempresa/save", async (req, res) => {
    const formulario = req.body;
  
    try {
      const data = await database.query(`
        INSERT INTO excl_empresa (
          ciud_excl_empresa,
          dia_excl_empresa,
          mes_excl_empresa,
          anio_excl_empresa,
          firma_excl_empresa,
          nombre_excl_empresa,
          cargo_excl_empresa
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7
        ) RETURNING id_excl_empresa
      `, [
        formulario.ciud_excl_empresa,
        formulario.dia_excl_empresa,
        formulario.mes_excl_empresa,
        formulario.anio_excl_empresa,
        formulario.firma_excl_empresa,
        formulario.nombre_excl_empresa,
        formulario.cargo_excl_empresa
      ]);
  
      res.json({ 
        message: "Datos de exclusión de empresa guardados exitosamente",
        id_excl_empresa: data.rows[0].id_excl_empresa 
      });
    } catch (error) {
      console.error("Error al guardar datos de exclusión de empresa:", error);
      res.status(500).json({ message: "Error al guardar datos de exclusión de empresa", error });
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
    try {
      const data = await database.query(`
        INSERT INTO seguros (
          ciud_seguro,
          dia_seguro,
          mes_seguro,
          anio_seguro,
          firma_seguro,
          id_pers,
          id_dat_agencia,
          id_excl_empresa,
          id_pers_fac,
          id_cuent_Ban
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) RETURNING id_seguro
      `, [
        formulario.ciud_seguro,
        formulario.dia_seguro,
        formulario.mes_seguro,
        formulario.anio_seguro,
        formulario.firma_seguro,
        formulario.id_pers,
        formulario.id_dat_agencia,
        formulario.id_excl_empresa,
        formulario.id_pers_fac,
        formulario.id_cuent_Ban
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
  

module.exports = router; 