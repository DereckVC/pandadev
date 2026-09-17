const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
const sender = 'PandaDev Security <support@pandadev.me>';
const adminEmail = process.env.ADMIN_EMAIL || 'minombrexd158@gmail.com';

// Envío seguro mediante HTTPS para evitar el bloqueo de puertos SMTP en Render
const sendMail = async ({ to, subject, html, text }) => {
  if (!resendApiKey) {
    console.warn('⚠️ [CONTACT]: RESEND_API_KEY no configurada en las variables de entorno.');
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: sender,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text
      })
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('Error de Resend en contacto:', data);
    }
    return res.ok;
  } catch (err) {
    console.error('Error despachando correo con Resend:', err.message);
    return false;
  }
};

// Plantilla visual HTML para el acuse automático al remitente
const createAckHtml = (name, category, message) => `
  <div style="margin:0;padding:32px 16px;background:#09090b;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px;background:#0d0d14;border:1px solid #8b5cf6;border-radius:16px;">
      <div style="margin-bottom:28px;font-size:28px;font-weight:800;letter-spacing:-1px;">
        <span style="color:#ffffff;">Panda</span><span style="color:#a855f7;">Dev</span>
      </div>
      <h1 style="margin:0 0 16px;color:#ffffff;font-size:24px;">¡Hemos recibido tu mensaje!</h1>
      <p style="margin:0 0 20px;color:#c4c4cc;font-size:15px;line-height:1.7;">
        Hola <strong style="color:#ffffff;">${name}</strong>, gracias por comunicarte con nosotros. Tu propuesta ha sido registrada en nuestro sistema y está siendo revisada por nuestro equipo técnico.
      </p>
      <div style="background:#141420;border:1px solid rgba(139,92,246,0.25);border-radius:12px;padding:20px;margin:24px 0;">
        <p style="margin:0 0 8px;font-size:12px;font-family:monospace;color:#a855f7;text-transform:uppercase;letter-spacing:1px;">
          Categoría: ${category}
        </p>
        <p style="margin:0;font-size:14px;color:#e4e4e7;line-height:1.6;font-style:italic;">
          "${message}"
        </p>
      </div>
      <p style="margin:0 0 12px;color:#8f8f9d;font-size:13px;line-height:1.6;">
        Recibirás una respuesta personalizada directamente en esta dirección de correo en breve.
      </p>
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1);text-align:center;">
        <a href="https://www.pandadev.me" style="display:inline-block;padding:12px 24px;border-radius:10px;background:#8b5cf6;color:#ffffff;font-weight:700;text-decoration:none;font-size:13px;">
          Visitar PandaDev
        </a>
      </div>
      <p style="margin:20px 0 0;color:#52525b;font-size:11px;text-align:center;">
        © 2026 PandaDev Studio. Todos los derechos reservados.
      </p>
    </div>
  </div>
`;

// Plantilla visual HTML para notificar al administrador
const createAdminNotificationHtml = (name, email, category, message) => `
  <div style="margin:0;padding:32px 16px;background:#09090b;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:32px;background:#0d0d14;border:1px solid #8b5cf6;border-radius:16px;">
      <div style="margin-bottom:20px;font-size:24px;font-weight:800;">
        <span style="color:#ffffff;">Panda</span><span style="color:#a855f7;">Dev</span>
        <span style="font-size:12px;color:#a855f7;font-family:monospace;margin-left:8px;">[NUEVO MENSAJE]</span>
      </div>
      <h2 style="margin:0 0 16px;color:#ffffff;font-size:20px;">Nuevo contacto recibido</h2>
      <ul style="margin:0 0 20px;padding:0 0 0 18px;color:#c4c4cc;font-size:14px;line-height:1.8;">
        <li><strong>Nombre / Organización:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Categoría:</strong> ${category}</li>
      </ul>
      <div style="background:#141420;border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:18px;margin-bottom:24px;color:#ffffff;font-size:14px;line-height:1.6;">
        ${message}
      </div>
      <div style="text-align:center;">
        <a href="https://www.pandadev.me/admin" style="display:inline-block;padding:12px 24px;border-radius:10px;background:#8b5cf6;color:#ffffff;font-weight:700;text-decoration:none;font-size:13px;">
          Abrir Command Center
        </a>
      </div>
    </div>
  </div>
`;

router.post('/', async (req, res) => {
  try {
    const { name, category, message } = req.body;
    const rawEmail = req.body.email || req.body.mail;
    const email = rawEmail ? String(rawEmail).trim().toLowerCase() : '';

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Todos los campos obligatorios deben ser completados.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Por favor ingresa un correo electrónico válido.' });
    }

    // 1. Guardar mensaje en la base de datos
    const savedMessage = await Message.create({
      name: name.trim(),
      email,
      category: category || 'General',
      message: message.trim(),
      status: 'unread',
    });

    // 2. Acuse automático al remitente mediante Resend
    try {
      await sendMail({
        to: email,
        subject: 'Hemos recibido tu mensaje — PandaDev',
        html: createAckHtml(name, category || 'General', message),
        text: `Hola ${name}, hemos recibido tu mensaje con categoría ${category || 'General'}. Te responderemos pronto.`
      });
      console.log('✓ Acuse automático enviado a:', email);
    } catch (mailError) {
      console.error('No se pudo enviar el acuse automático al remitente:', mailError.message);
    }

    // 3. Notificación al administrador
    try {
      if (adminEmail) {
        await sendMail({
          to: adminEmail,
          subject: `Nuevo mensaje de contacto: ${name} (${category || 'General'})`,
          html: createAdminNotificationHtml(name, email, category || 'General', message),
          text: `Nuevo mensaje de ${name} (${email}): ${message}`
        });
        console.log('✓ Notificación de contacto enviada al administrador');
      }
    } catch (adminMailError) {
      console.error('No se pudo notificar al administrador:', adminMailError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Mensaje enviado correctamente. Recibirás un acuse en tu correo.',
      data: savedMessage,
    });
  } catch (error) {
    console.error('Error en ruta de contacto:', error.message);
    return res.status(500).json({ message: 'Error interno al registrar tu mensaje.' });
  }
});

module.exports = router;