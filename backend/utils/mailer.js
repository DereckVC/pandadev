const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const sender = `"PandaDev Security" <${emailUser}>`;
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

transporter.verify()
  .then(() => console.log('✓ [SMTP]: Conexión con Gmail verificada exitosamente'))
  .catch((error) => console.error('Error enviando email:', error.message));

const emailLayout = ({ title, intro, actionLabel, link, expiry }) => `
  <div style="margin:0;padding:32px 16px;background:#09090b;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px;background:#0d0d14;border:1px solid #8b5cf6;border-radius:16px;">
      <div style="margin-bottom:28px;font-size:28px;font-weight:800;letter-spacing:-1px;">
        <span style="color:#ffffff;">Panda</span><span style="color:#a855f7;">Dev</span>
      </div>
      <h1 style="margin:0 0 16px;color:#ffffff;font-size:24px;">${title}</h1>
      <p style="margin:0 0 24px;color:#c4c4cc;font-size:15px;line-height:1.7;">${intro}</p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${link}" style="display:inline-block;padding:14px 24px;border-radius:10px;background:#8b5cf6;color:#ffffff;font-weight:700;text-decoration:none;">${actionLabel}</a>
      </div>
      <p style="margin:0 0 12px;color:#8f8f9d;font-size:13px;">${expiry}</p>
      <p style="margin:0;color:#8f8f9d;font-size:12px;line-height:1.6;word-break:break-all;">Si el botón no funciona, copia este enlace:<br>${link}</p>
    </div>
  </div>
`;

const sendMail = async ({ to, subject, text, html }) => {
  try {
    await transporter.sendMail({
      from: sender,
      to,
      subject,
      text,
      html,
      headers: { 'X-Priority': '1', Importance: 'high', 'X-Mailer': 'PandaDev Engine' },
    });
    return true;
  } catch (error) {
    console.error('Error enviando email:', error.message);
    return false;
  }
};

async function sendPasswordResetEmail(toEmail, resetToken) {
  const link = `http://localhost:5173/login?reset=${resetToken}`;
  return sendMail({
    to: toEmail,
    subject: 'Restablece tu contraseña de PandaDev',
    text: `Restablece tu contraseña con este enlace (válido durante 1 hora): ${link}`,
    html: emailLayout({
      title: 'Restablece tu acceso',
      intro: 'Recibimos una solicitud para cambiar la contraseña de tu cuenta PandaDev.',
      actionLabel: 'Restablecer contraseña',
      link,
      expiry: 'Este enlace expira en 1 hora.',
    }),
  });
}

async function sendVerificationEmail(toEmail, verifyToken) {
  const link = `http://localhost:5173/login?verify=${verifyToken}`;
  return sendMail({
    to: toEmail,
    subject: 'Activa tu cuenta de PandaDev',
    text: `Activa tu cuenta con este enlace: ${link}`,
    html: emailLayout({
      title: 'Verifica tu cuenta',
      intro: 'Confirma tu dirección de correo para activar todas las funciones de PandaDev.',
      actionLabel: 'Verificar cuenta',
      link,
      expiry: 'El enlace de verificación es de uso único.',
    }),
  });
}

async function sendOTPEmail(toEmail, otp, purpose = 'verificación de correo') {
  const html = `
    <div style="margin:0;padding:32px 16px;background:#09090b;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:560px;margin:0 auto;padding:32px;background:#0d0d14;border:1px solid #8b5cf6;border-radius:16px;">
        <div style="margin-bottom:28px;font-size:28px;font-weight:800;">
          <span style="color:#ffffff;">Panda</span><span style="color:#a855f7;">Dev</span>
        </div>
        <h1 style="margin:0 0 16px;color:#ffffff;font-size:24px;">Código de seguridad</h1>
        <p style="color:#c4c4cc;font-size:15px;line-height:1.7;">Usa este código para completar la ${purpose} en PandaDev:</p>
        <div style="margin:28px 0;text-align:center;color:#a855f7;font-family:monospace;font-size:40px;font-weight:700;letter-spacing:.4em;">${otp}</div>
        <p style="margin:0;color:#8f8f9d;font-size:13px;">Este código expira en 10 minutos. Si no solicitaste esta acción, puedes ignorar este mensaje.</p>
        <p style="margin:20px 0 0;color:#777784;font-size:11px;">Recibes este correo porque se solicitó una acción en tu cuenta de PandaDev.</p>
      </div>
    </div>
  `;
  return sendMail({
    to: toEmail,
    subject: `Código de Verificación PandaDev: ${otp}`,
    text: `Tu código de verificación PandaDev es ${otp}. Expira en 10 minutos.`,
    html,
  });
}

module.exports = { sendPasswordResetEmail, sendVerificationEmail, sendOTPEmail };
