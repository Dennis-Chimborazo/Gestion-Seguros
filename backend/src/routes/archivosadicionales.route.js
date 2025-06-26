const { Router } = require("express");
const multer = require("multer"); 
const { DataBase } = require("../database.js");
const router = Router();
const db = new DataBase();
const database = db.getConexion();

const upload = multer({ storage: multer.memoryStorage() });

router.post('/subir-archivo', upload.single('archivo'), async (req, res) => {
  const { tipo, id_pers } = req.body;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'Archivo requerido' });

  try {
    const result = await database.query(
      `INSERT INTO archivos_cliente (
        tipo_archivos_cliente,
        archivo,
        nombre_archivo_cliente,
        mime_type_archivo_cliente,
        id_pers
      ) VALUES ($1, $2, $3, $4, $5) RETURNING id_archivos_cliente`,
      [tipo, file.buffer, file.originalname, file.mimetype, id_pers]
    );

    res.json({ message: 'Archivo guardado', id: result.rows[0].id_archivos_cliente });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar el archivo' });
  }
});

router.get('/buscar-archivo', async (req, res) => {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  try {
    const result = await database.query(
      `SELECT nombre_archivo_cliente, mime_type_archivo_cliente, archivo 
       FROM archivos_cliente 
       WHERE id_archivos_cliente = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const archivo = result.rows[0];

    res.setHeader('Content-Type', archivo.mime_type_archivo_cliente);
    res.setHeader('Content-Disposition', `inline; filename="${archivo.nombre_archivo_cliente}"`);
    res.send(archivo.archivo); // Envia el contenido binario del PDF

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al recuperar el archivo' });
  }
});

router.get('/buscar-imagen', async (req, res) => {
  const id = Array.isArray(req.query.id) ? req.query.id[0] : req.query.id;
  try {
    const result = await database.query(
      `SELECT nombre_archivo_cliente, mime_type_archivo_cliente, archivo 
       FROM archivos_cliente 
       WHERE id_pers = $1 and tipo_archivos_cliente = 'imagen'`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    const archivo = result.rows[0];

    res.setHeader('Content-Type', archivo.mime_type_archivo_cliente);
    res.setHeader('Content-Disposition', `inline; filename="${archivo.nombre_archivo_cliente}"`);
    res.send(archivo.archivo); // Envia el contenido binario del PDF

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al recuperar el archivo' });
  }
});


module.exports = router;
