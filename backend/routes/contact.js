const express = require('express');
const Message = require('../models/Message');
const { requireAuth } = require('../middleware/auth');
const { sendOTPEmail } = require('../utils/mailer');
const nodemailer = require('nodemailer');

const router = express.Router();

const requireAdminRole = [requireAuth, (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin role required' });
  return next();
}];

// Helper para enviar correos desde support@pandadev.me usando el transporter existente
const sendSupportEmail = async (to, subject, text) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('SMTP credentials not configured, skipped email to:', to);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 465,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"PandaDev Support" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  });
};

// Crear y registrar mensaje del formulario público
router.post('/', async (req, res) => {
  const { name, email, category, message } = req.body || {};
  const normalizedEmail = typeof email === 'string' ? email.trim() : '';
  const fields = [name, normalizedEmail, category, message];
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  if (fields.some((field) => typeof field !== 'string' || !field.trim())) {
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
  }
  if (!validEmail) {
    return res.status(400).json({ success: false, message: 'El correo electrónico no es válido' });
  }

  try {
    const saved = await Message.create({ 
      name: name.trim(), 
      email: normalizedEmail, 
      category: category.trim(), 
      message: message.trim() 
    });
    console.log('📩 [NUEVO MENSAJE]:', name.trim(), normalizedEmail);

    // Envío silencioso de acuse de recibo automático al visitante
    try {
      await sendSupportEmail(
        normalizedEmail,
        'PandaDev — Hemos recibido tu mensaje',
        `Hola ${name.trim()},\n\nGracias por comunicarte con PandaDev. Hemos recibido tu mensaje referente a "${category.trim()}".\n\nRevisaré los detalles técnicos y me pondré en contacto contigo en un lapso de 24 a 48 horas.\n\nCopia de tu consulta:\n"${message.trim()}"\n\nAtentamente,\nDereckVC — PandaDev Systems\nsupport@pandadev.me`
      );
    } catch (mailErr) {
      console.warn('No se pudo enviar el correo de confirmación automático:', mailErr.message);
    }

    return res.status(201).json({ success: true, message: 'Mensaje recibido y guardado.', id: saved._id });
  } catch (error) {
    console.error('Unable to save contact message:', error.message);
    return res.status(500).json({ success: false, message: 'No se pudo guardar el mensaje' });
  }
});

// Listar todos los mensajes (Admin)
router.get('/', ...requireAdminRole, async (req, res) => {
  try {
    return res.json(await Message.find().sort({ createdAt: -1 }));
  } catch (error) {
    return res.status(500).json({ success: false, message: 'No se pudieron cargar los mensajes' });
  }
});

// Marcar mensaje como leído (Admin)
router.put('/:id/read', ...requireAdminRole, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id, 
      { read: true }, 
      { returnDocument: 'after' }
    );
    return message ? res.json(message) : res.status(404).json({ message: 'Message not found' });
  } catch (error) { 
    return res.status(400).json({ message: 'Invalid message id' }); 
  }
});

// Responder mensaje con plantilla o texto personalizado desde el panel (Admin)
router.post('/:id/reply', ...requireAdminRole, async (req, res) => {
  try {
    const { subject, replyText } = req.body || {};
    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ message: 'El cuerpo de la respuesta es obligatorio' });
    }

    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    await sendSupportEmail(
      message.email,
      subject || `Re: Consulta sobre ${message.category} — PandaDev`,
      `${replyText.trim()}\n\n---\nMensaje original enviado por ${message.name}:\n"${message.message}"\n\nPandaDev Support | support@pandadev.me`
    );

    message.read = true;
    await message.save();

    return res.json({ success: true, message: 'Respuesta despachada con éxito' });
  } catch (error) {
    console.error('Unable to send reply email:', error.message);
    return res.status(500).json({ message: 'No se pudo enviar el correo de respuesta' });
  }
});

// Eliminar mensaje (Admin)
router.delete('/:id', ...requireAdminRole, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    return message ? res.json({ message: 'Project deleted' }) : res.status(404).json({ message: 'Message not found' });
  } catch (error) { 
    return res.status(400).json({ message: 'Invalid message id' }); 
  }
});

module.exports = router;