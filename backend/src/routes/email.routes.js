const nodemailer = require("nodemailer");
const { Router } = require("express");
const { DataBase } = require("../database.js");

const router = Router();
const db = new DataBase();

const database = db.getConexion();

// Nueva ruta: enviar correo
router.post("/enviar-correo", async (req, res) => {
  const { to, token,pass } = req.body; // Espera un JSON: { id_pers: 1, url: "algo.com" }
  const subject = 'Validar la creacion de la cuenta'
  const text = `
        🎉 ¡Gracias por registrarte en Seguros.SA!
        Nos complace darte la bienvenida a nuestra plataforma. Tu cuenta ha sido creada con éxito y estás a un paso de comenzar a disfrutar de todos los beneficios que ofrecemos.
        🔐 Para garantizar la seguridad de tu información y asegurarnos de que tú solicitaste esta cuenta, necesitamos que confirmes tu dirección de correo electrónico.
            👉 Clave temporaal: ${pass}

        👉 Por favor, haz clic en el siguiente botón para validar tu cuenta:
        
         "http://localhost:3000/validacionEmail/${token}" 
            Validar mi cuenta
        Si tú no solicitaste esta cuenta, puedes ignorar este mensaje. No se tomará ninguna acción sin tu confirmación.
        Atentamente,<br><strong>El equipo de Seguros.SA
    `;

  //mznp sfmv ihna scjb
  if (!to || !subject || !text) {
    return res.status(400).json({ message: "Faltan datos para enviar el correo" });
  }

  // Crear transportador SMTP
  //
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "correopruebasuni@gmail.com",
      pass: "mznp sfmv ihna scjb", // Usa una contraseña de aplicación si usas Gmail
    },
  });



  const mailOptions = {
    from: '"Seguros.SA" <correopruebasuni@gmail.com>',
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Correo enviado con éxito", info });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ message: "Error al enviar el correo", error });
  }
});

router.post("/correo-Gest-contratacion", async (req, res) => {
  const { to, token } = req.body; // Espera un JSON: { id_pers: 1, url: "algo.com" }
  const subject = 'Validación de contratación de seguro en Seguros.SA';
  const text = `
      📄 Validación de Contratación de Seguro
      Estimado/a cliente,
      Recientemente se ha generado una solicitud de contratación de un nuevo seguro a tu nombre en nuestra plataforma Seguros.SA
      🔐 Para confirmar que estás de acuerdo con este contrato, es necesario que valides tu aceptación.
      👉 Haz clic en el siguiente botón para revisar los detalles y confirmar la contratación:
        "http://localhost:3000/validacionContratacion/${token}" 
      Si tú no solicitaste este contrato, puedes ignorar este mensaje. No se realizará ninguna acción sin tu confirmación
      Atentamente,
      El equipo de Seguros.SA
`;

  if (!to || !subject || !text) {
    return res.status(400).json({ message: "Faltan datos para enviar el correo" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "correopruebasuni@gmail.com",
      pass: "mznp sfmv ihna scjb", // Usa una contraseña de aplicación si usas Gmail
    },
  });

  const mailOptions = {
    from: '"Seguros.SA" <correopruebasuni@gmail.com>',
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Correo enviado:", info.response);
    res.status(200).json({ message: "Correo enviado con éxito", info });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ message: "Error al enviar el correo", error });
  }
});

router.post("/correo-agente", async (req, res) => {
  const { to, token, pass } = req.body; // Espera un JSON: { id_pers: 1, url: "algo.com" }
  const subject = 'Validación de cuenta de Agente';
  const text = `
    📄 Activación de Cuenta de Agente - Seguros.SA

    Estimado/a agente,

    Nos complace informarte que se ha creado una nueva cuenta de acceso para ti en nuestra plataforma Seguros.SA, como parte del proceso de incorporación a nuestro equipo.

    🔐 Para activar tu cuenta y comenzar a trabajar con nosotros, es necesario que valides tu acceso.

    👉 Clave temporaal: ${pass}

    👉 Haz clic en el siguiente enlace para validar tu cuenta:
    
    "http://localhost:3000/validacionAgente/${token}" 

    Si no reconoces esta acción o no solicitaste una cuenta en Seguros.SA, puedes ignorar este mensaje. Ninguna acción será realizada sin tu confirmación.

    Atentamente,  
    El equipo de Seguros.SA
    `;


  if (!to || !subject || !text) {
    return res.status(400).json({ message: "Faltan datos para enviar el correo" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "correopruebasuni@gmail.com",
      pass: "mznp sfmv ihna scjb", // Usa una contraseña de aplicación si usas Gmail
    },
  });

  const mailOptions = {
    from: '"Seguros.SA" <correopruebasuni@gmail.com>',
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Correo enviado con éxito", info });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ message: "Error al enviar el correo", error });
  }
});

module.exports = router; 