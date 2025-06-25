const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const getDynamicStorage = () =>
    multer.diskStorage({
        destination: (req, file, cb) => {
            const subfolder = req.params.subfolder?.replace(/[^a-zA-Z0-9-_]/g, '') || 'default';
            const dir = path.join('uploads/cliente/', subfolder);

            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const baseName = path.basename(file.originalname, ext).replace(/\s+/g);
            const uniqueName = `${baseName}${ext}`;
            cb(null, uniqueName);
        }
    });

const getDynamicStorageReembolso = () =>
    multer.diskStorage({
        destination: (req, file, cb) => {
            const subfolder = req.params.subfolder?.replace(/[^a-zA-Z0-9-_]/g, '') || 'default';
            const dir = path.join('uploads/reembolso/', subfolder);

            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const baseName = path.basename(file.originalname, ext).replace(/\s+/g);
            const uniqueName = `${baseName}${ext}`;
            cb(null, uniqueName);
        }
    });


const uploadFoto = multer({ storage: getDynamicStorage() });
const uploadPdf = multer({ storage: getDynamicStorage() });
const uploadReembolso = multer({ storage: getDynamicStorageReembolso() });

router.post('/foto-perfil/:subfolder', uploadFoto.single('profilePhoto'), (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'No se recibió la foto de perfil' });
    res.json({ message: 'Foto de perfil subida correctamente', filename: req.file.filename });
});

router.post('/cedula-pdf/:subfolder', uploadPdf.single('cedulaPdf'), (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'No se recibió el PDF de la cédula' });
    res.json({ message: 'PDF de cédula subido correctamente', filename: req.file.filename });
});

router.post('/reembolso-pdf/:subfolder', uploadReembolso.single('reembolsoPDF'), (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'No se recibió la foto de perfil' });
    res.json({ message: 'Foto de perfil subida correctamente', filename: req.file.filename });
});

router.get('/buscar/:subfolder', (req, res) => {
    const subfolder = req.params.subfolder?.replace(/[^a-zA-Z0-9-_]/g, '') || 'default';
    const tipo = req.query.tipo;
    const dir = path.join(process.cwd(), 'uploads', 'cliente', subfolder);

    if (!fs.existsSync(dir)) {
        console.log('No existe la carpeta');
        return res.status(404).json({ error: 'Carpeta no encontrada' });
    }

    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error('Error leyendo archivos:', err);
            return res.status(500).json({ error: 'Error leyendo archivos' });
        }
        let archivosFiltrados = files;
        if (tipo === 'imagen') {
            archivosFiltrados = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
        } else if (tipo === 'pdf') {
            archivosFiltrados = files.filter(f => /\.pdf$/i.test(f));
        }
        if (archivosFiltrados.length === 0) {
            console.log('No se encontraron archivos del tipo especificado');
            return res.status(404).json({ error: 'No se encontró archivo del tipo especificado' });
        }
        const url = `https://gestion-seguros.onrender.com/uploads/cliente/${subfolder}/${archivosFiltrados[0]}`;
        res.json({ url });
    });
});

router.get('/buscarReembolso/:subfolder', (req, res) => {
    const subfolder = req.params.subfolder?.replace(/[^a-zA-Z0-9-_]/g, '') || 'default';
    const tipo = req.query.tipo;
    const dir = path.join(process.cwd(), 'uploads', 'cliente', subfolder);

    if (!fs.existsSync(dir)) {
        console.log('No existe la carpeta');
        return res.status(404).json({ error: 'Carpeta no encontrada' });
    }

    fs.readdir(dir, (err, files) => {
        if (err) {
            console.error('Error leyendo archivos:', err);
            return res.status(500).json({ error: 'Error leyendo archivos' });
        }
        let archivosFiltrados = files;
        if (tipo === 'imagen') {
            archivosFiltrados = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
        } else if (tipo === 'pdf') {
            archivosFiltrados = files.filter(f => /\.pdf$/i.test(f));
        }
        if (archivosFiltrados.length === 0) {
            console.log('No se encontraron archivos del tipo especificado');
            return res.status(404).json({ error: 'No se encontró archivo del tipo especificado' });
        }
        const url = `https://gestion-seguros.onrender.com/uploads/reembolso/${subfolder}/${archivosFiltrados[0]}`;
        res.json({ url });
    });
});

module.exports = router;
