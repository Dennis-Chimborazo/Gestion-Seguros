const { Router } = require("express");
const { DataBase } = require("../database.js");
const jwt = require("jsonwebtoken");

const router = Router();
const db = new DataBase();
const database = db.getConexion();

router.get("/listar", async (req, res) => {
  const idestado = 1
  try {
    const query = `SELECT s.id_seguro,s.monto_seguro, s.tiempo_seguro,c.nom_cli,c.ape_cli,c.cedr_cli,ts.nom_tip_seg,ts.pago_tip_seg FROM seguros s
	INNER JOIN cliente  c ON c.id_pers= s.id_pers
	INNER JOIN tipo_seguro ts ON ts.id_tip_seg = s.id_tip_seg 
	WHERE s.id_estado = $1`;
    const data = await database.query(query, [idestado]);
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
  const idEstado = 3
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

router.post("/generar_token_contr", async (req, res) => {

  try {
    const { id_seguro, url, id_pers } = req.body; // Espera un JSON: { id_pers: 1, url: "algo.com" }
    const payload = { id_seguro: id_seguro, id_pers: id_pers };
    const token = jwt.sign(payload, "nuevacontratacion", { expiresIn: "24h" });

    await database.query(
      "INSERT INTO validar_contratacion(url_contra, token_val_contra) VALUES ($1, $2)",
      [url, token]
    );

    res.json({ success: true, token, message: "Token creado y guardado exitosamente." });
  } catch (error) {
    console.error("Error en /generar_token_email:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
});

router.post("/validar-token-contr", async (req, res) => {
  const { url } = req.body; // Espera: { url: "URLgenerada" }

  try {
    // 1. Buscar token asociado al URL
    const result = await database.query(
      "SELECT token_val_contra,id_val_contra FROM validar_contratacion WHERE url_contra = $1",
      [url]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "URL no encontrada." });
    }

    const token = result.rows[0].token_val_contra;

    // 2. Verificar el token JWT
    let payload;
    try {
      payload = jwt.verify(token, "nuevacontratacion"); // clave secreta que usaste al generar
    } catch (err) {
      return res.status(401).json({ success: false, message: "Token inválido o expirado." });
    }
    const query = `SELECT * FROM cliente WHERE id_pers = $1`;
    const data = await database.query(query, [payload.id_pers]);
    const queryCont = `SELECT * FROM seguros WHERE id_seguro = $1`;
    const dataCont = await database.query(queryCont, [payload.id_seguro]);

    res.status(200).json({
      success: true,
      message: "Token válido.",
      data: payload,// contiene id_pers
      client: data.rows,
      contr: dataCont.rows,
      idvalid: result.rows[0].id_val_contra
    });

  } catch (error) {
    console.error("Error al validar token:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor." });
  }
});

router.put("/activar-seguro", async (req, res) => {
  const { id, idvalid } = req.body;
  console.log('---> val')
  console.log(id)
  console.log(idvalid)
  console.log('---> val')


  const estadoActivo = '1';

  if (!id || !idvalid) {
    return res.status(400).json({ error: "Faltan datos requeridos (id o idvalid)." });
  }
  try {
    const updateResult = await database.query(`
      UPDATE seguros 
      SET id_estado = $1
      WHERE id_seguro = $2
    `, [estadoActivo, id]);

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: "contratacion no encontrada no encontrado." });
    }

    await database.query(
      "DELETE FROM validar_contratacion WHERE id_val_contra = $1",
      [idvalid]
    );

    res.status(200).json({ message: "Contrato de seguro valiado correctamente." });

  } catch (error) {
    console.error("Error al validar contratacion:", error);
    res.status(500).json({ error: "Error interno al actualizar cliente." });
  }
});

router.get("/informacion-ben-categ", async (req, res) => {
  try {
    const id_tip_seg = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    if (!id_tip_seg) {
      return res.status(400).json({ message: id_tip_seg });
    }
    const query = `Select c.nom_categoria,b.nom_beneficios
                    from seguro_bedeficio sg
                    inner join beneficios b ON b.id_beneficios=sg.id_beneficios
                    inner join categoria c ON c.id_categoria=b.id_categoria
                    WHERE sg.id_tip_seg = $1`;
    const values = [id_tip_seg];
    const data = await database.query(query, values);
    res.json(data.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el empleado", error });
  }
});

router.get("/seguros-clientes", async (req, res) => {
  try {
    const id_pers = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
    if (!id_pers) {
      return res.status(400).json({ message: id_pers });
    }
    const query = `SELECT s.id_seguro,s.monto_seguro, s.tiempo_seguro,tp.nom_tip_seg, 
                  (s.dia_seguro || '/' || s.mes_seguro || '/' || s.anio_seguro) AS fecha,
                  COUNT(sf.id_tip_seg) AS numBeneficios
                  FROM public.seguros s
                  INNER JOIN tipo_seguro tp ON tp.id_tip_seg = s.id_tip_seg
                  INNER JOIN seguro_bedeficio sf ON sf.id_tip_seg = tp.id_tip_seg
                  WHERE s.id_pers = $1
                  GROUP BY s.id_seguro, tp.nom_tip_seg`;
    const values = [id_pers];
    const data = await database.query(query, values);
    res.json(data.rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el empleado", error });
  }
});

module.exports = router; 