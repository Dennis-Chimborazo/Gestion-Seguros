const nodemailer = require("nodemailer");
const { Router } = require("express");
const { DataBase } = require("../database.js");

const router = Router();
const db = new DataBase();

const database = db.getConexion();

// Nueva ruta: enviar correo
router.post("/enviar-correo", async (req, res) => {
    const { to, token } = req.body; // Espera un JSON: { id_pers: 1, url: "algo.com" }
    const subject='Validar la creacion de la cuenta'
  const text = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Gracias por registrarte en Seguros.SA!</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #333;
          margin: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
        h2 {
          color: #4CAF50;
        }
        p {
          line-height: 1.6;
        }
        .button-container {
          text-align: center;
          margin: 30px 0;
        }
        .button {
          display: inline-block;
          padding: 12px 25px;
          background-color: #4CAF50;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          font-size: 16px;
        }
        .signature {
          margin-top: 40px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>🎉 ¡Gracias por registrarte en Seguros.SA!</h2>
        <p>Nos complace darte la bienvenida a nuestra plataforma. Tu cuenta ha sido creada con éxito y estás a un paso de comenzar a disfrutar de todos los beneficios que ofrecemos.</p>
        <p>🔐 Para garantizar la seguridad de tu información y asegurarnos de que tú solicitaste esta cuenta, necesitamos que confirmes tu dirección de correo electrónico.</p>
        <p>👉 Por favor, haz clic en el siguiente botón para validar tu cuenta:</p>
        <div class="button-container">
          <a href="http://localhost:3000/validacionEmail/${token}" class="button">
            Validar mi cuenta
          </a>
        </div>
        <p>Si tú no solicitaste esta cuenta, puedes ignorar este mensaje. No se tomará ninguna acción sin tu confirmación.</p>
        <p class="signature">Atentamente,<br><strong>El equipo de Seguros.SA</strong></p>
      </div>
    </body>
    </html>
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
    console.log("Correo enviado:", info.response);
    res.status(200).json({ message: "Correo enviado con éxito", info });
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    res.status(500).json({ message: "Error al enviar el correo", error });
  }
});

router.post("/correo-Gest-contratacion", async (req, res) => {
    const { to, token } = req.body; // Espera un JSON: { id_pers: 1, url: "algo.com" }
    console.log(to);
   const subject = 'Validación de contratación de seguro en Seguros.SA';
const text = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Validación de Contratación de Seguro</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        color: #333;
        margin: 20px;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 5px;
      }
      h2 {
        color: #2E86C1;
      }
      p {
        line-height: 1.6;
      }
      .button-container {
        text-align: center;
        margin: 30px 0;
      }
      .button {
        display: inline-block;
        padding: 12px 25px;
        background-color: #2E86C1;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        font-size: 16px;
      }
      .signature {
        margin-top: 40px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>📄 Validación de Contratación de Seguro</h2>
      <p>Estimado/a cliente,</p>
      <p>Recientemente se ha generado una solicitud de contratación de un nuevo seguro a tu nombre en nuestra plataforma <strong>Seguros.SA</strong>.</p>
      <p>🔐 Para confirmar que estás de acuerdo con este contrato, es necesario que valides tu aceptación.</p>
      <p>👉 Haz clic en el siguiente botón para revisar los detalles y confirmar la contratación:</p>
      <div class="button-container">
        <a href="http://localhost:3000/validacionContratacion/${token}" class="button">
          Validar Contrato
        </a>
      </div>
      <p>Si tú no solicitaste este contrato, puedes ignorar este mensaje. No se realizará ninguna acción sin tu confirmación.</p>
      <p class="signature">Atentamente,<br><strong>El equipo de Seguros.SA</strong></p>
    </div>
  </body>
  </html>
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

module.exports = router; 