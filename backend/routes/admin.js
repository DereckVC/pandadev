const express = require('express');
const router = express.Router();
const os = require('os');
const Message = require('../models/Message');
const Project = require('../models/Project');
const User = require('../models/User');
const Visitor = require('../models/Visitor');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const resendApiKey = (process.env.RESEND_API_KEY || '').trim();
const sender = 'PandaDev Security <support@pandadev.me>';

// Middleware global de seguridad administrativa
router.use(requireAuth, requireAdmin);

// Despacho directo de respuestas mediante la API HTTPS de Resend
const sendReplyMail = async ({ to, subject, html, text }) => {
  if (!resendApiKey) {
    console.warn('⚠️ [ADMIN]: RESEND_API_KEY no configurada en las variables de entorno.');
    return false;
  }
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: sender,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Error de Resend al responder mensaje:', data);
      return false;
    }

    console.log('✓ [ADMIN]: Respuesta despachada vía Resend a', to, 'ID:', data.id);
    return true;
  } catch (err) {
    console.error('❌ Excepción al enviar correo de respuesta:', err.message);
    return false;
  }
};

// Plantilla visual HTML para las respuestas oficiales con presets
const createReplyHtml = (recipientName, messageContent, originalCategory) => `
  <div style="margin:0;padding:32px 16px;background:#09090b;color:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:580px;margin:0 auto;padding:32px;background:#0d0d14;border:1px solid #8b5cf6;border-radius:16px;">
      <div style="margin-bottom:24px;font-size:26px;font-weight:800;letter-spacing:-1px;">
        <span style="color:#ffffff;">Panda</span><span style="color:#a855f7;">Dev</span>
        <span style="font-size:11px;font-family:monospace;color:#a855f7;margin-left:8px;padding:3px 8px;background:rgba(139,92,246,0.15);border-radius:6px;border:1px solid rgba(139,92,246,0.3);">
          RESPUESTA OFICIAL
        </span>
      </div>
      <h1 style="margin:0 0 16px;color:#ffffff;font-size:22px;">Respuesta a tu consulta</h1>
      <p style="margin:0 0 20px;color:#c4c4cc;font-size:14px;line-height:1.7;">
        Hola <strong style="color:#ffffff;">${recipientName || 'Estimado/a'}</strong>, Dereck de PandaDev ha respondido a tu mensaje respecto a <strong>${originalCategory || 'tu propuesta'}</strong>:
      </p>
      <div style="background:#13131f;border:1px solid rgba(139,92,246,0.25);border-radius:12px;padding:20px;margin:24px 0;color:#e4e4e7;font-size:14px;line-height:1.8;white-space:pre-line;">
${messageContent}
      </div>
      <p style="margin:0 0 12px;color:#8f8f9d;font-size:13px;line-height:1.6;">
        Puedes responder directamente a este correo electrónico si deseas continuar la conversación o coordinar especificaciones técnicas.
      </p>
      <div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1);text-align:center;">
        <a href="https://www.pandadev.me" style="display:inline-block;padding:12px 24px;border-radius:10px;background:#8b5cf6;color:#ffffff;font-weight:700;text-decoration:none;font-size:13px;">
          Visitar PandaDev Studio
        </a>
      </div>
      <p style="margin:20px 0 0;color:#52525b;font-size:11px;text-align:center;">
        © 2026 PandaDev Studio · Software & Creative Lab
      </p>
    </div>
  </div>
`;

// 1. Estadísticas globales del Command Center
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalMessages, unreadMessages, totalProjects, totalVisitors] = await Promise.all([
      User.countDocuments(),
      Message.countDocuments(),
      Message.countDocuments({ status: 'unread' }),
      Project.countDocuments(),
      Visitor ? Visitor.countDocuments().catch(() => 0) : 0,
    ]);

    return res.json({
      stats: {
        totalUsers,
        totalMessages,
        unreadMessages,
        totalProjects,
        totalVisitors,
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas del dashboard:', error.message);
    return res.status(500).json({ message: 'Error al obtener métricas del dashboard.' });
  }
});

// 2. Gestión de Mensajes Recibidos
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    return res.json({ messages });
  } catch (error) {
    return res.status(500).json({ message: 'Error al listar mensajes.' });
  }
});

// Marcar mensaje como leído
router.patch('/messages/:id/read', async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status: 'read' },
      { new: true }
    );
    if (!message) {
      return res.status(404).json({ message: 'Mensaje no encontrado.' });
    }
    return res.json({ success: true, message });
  } catch (error) {
    return res.status(500).json({ message: 'Error al actualizar estado del mensaje.' });
  }
});

// Responder mensaje con Preset (Resend HTTPS)
router.post('/messages/:id/reply', async (req, res) => {
  try {
    const replyContent = req.body.message || req.body.reply || req.body.text || '';
    const subject = req.body.subject || 'Propuesta de inicio de proyecto — PandaDev';

    if (!replyContent.trim()) {
      return res.status(400).json({ message: 'El contenido de la respuesta no puede estar vacío.' });
    }

    const messageDoc = await Message.findById(req.params.id);
    if (!messageDoc) {
      return res.status(404).json({ message: 'El mensaje seleccionado no existe.' });
    }

    // Envío del correo por HTTPS
    const sent = await sendReplyMail({
      to: messageDoc.email,
      subject,
      html: createReplyHtml(messageDoc.name, replyContent, messageDoc.category),
      text: replyContent,
    });

    if (!sent) {
      return res.status(500).json({ message: 'No se pudo despachar el correo con Resend. Verifica las variables de entorno.' });
    }

    // Actualizar registro en la base de datos
    messageDoc.status = 'replied';
    messageDoc.reply = replyContent;
    messageDoc.repliedAt = new Date();
    await messageDoc.save();

    return res.json({
      success: true,
      message: 'Respuesta enviada exitosamente.',
      data: messageDoc,
    });
  } catch (error) {
    console.error('Error al responder mensaje:', error.message);
    return res.status(500).json({ message: 'Error interno al procesar la respuesta.' });
  }
});

// Eliminar mensaje
router.delete('/messages/:id', async (req, res) => {
  try {
    const deleted = await Message.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'El mensaje no existe o ya fue eliminado.' });
    }
    return res.json({ success: true, message: 'Mensaje eliminado permanentemente.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar el mensaje.' });
  }
});

// 3. Gestión del Catálogo de Proyectos
router.get('/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ order: 1, createdAt: -1 });
    return res.json({ projects });
  } catch (error) {
    return res.status(500).json({ message: 'Error al obtener proyectos.' });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const project = await Project.create(req.body);
    return res.status(201).json({ success: true, project });
  } catch (error) {
    return res.status(400).json({ message: 'Error al registrar el proyecto.' });
  }
});

router.put('/projects/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!project) {
      return res.status(404).json({ message: 'Proyecto no encontrado.' });
    }
    return res.json({ success: true, project });
  } catch (error) {
    return res.status(400).json({ message: 'Error al actualizar el proyecto.' });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Proyecto no encontrado.' });
    }
    return res.json({ success: true, message: 'Proyecto eliminado.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar el proyecto.' });
  }
});

// 4. Gestión de Usuarios y Roles
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password -twoFactorSecret').sort({ createdAt: -1 });
    return res.json({ users });
  } catch (error) {
    return res.status(500).json({ message: 'Error al listar usuarios.' });
  }
});

router.patch('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido especificado.' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password -twoFactorSecret');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ message: 'Error al modificar el rol del usuario.' });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }
    // Evitar auto-eliminación accidental del superadmin principal
    if (user.email === 'minombrexd158@gmail.com') {
      return res.status(403).json({ message: 'No es posible eliminar al administrador principal del sistema.' });
    }
    await User.findByIdAndDelete(req.params.id);
    return res.json({ success: true, message: 'Usuario eliminado del sistema.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error al eliminar el usuario.' });
  }
});

// 5. Estado y Diagnóstico del Servidor
router.get('/system', (req, res) => {
  return res.json({
    platform: process.platform,
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMB: Math.round(process.memoryUsage().rss / (1024 * 1024)),
    totalMemoryGB: (os.totalmem() / 1024 ** 3).toFixed(2),
    freeMemoryGB: (os.freemem() / 1024 ** 3).toFixed(2),
    cpus: os.cpus().length,
  });
});

module.exports = router;