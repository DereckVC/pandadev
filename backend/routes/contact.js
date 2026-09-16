const express = require('express');
const Message = require('../models/Message');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const requireAdminRole = [requireAuth, (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin role required' });
  return next();
}];

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
    await Message.create({ name: name.trim(), email: normalizedEmail, category: category.trim(), message: message.trim() });
    console.log('📩 [NUEVO MENSAJE]:', name.trim(), normalizedEmail);
    return res.status(201).json({ success: true, message: 'Mensaje recibido y guardado.' });
  } catch (error) {
    console.error('Unable to save contact message:', error.message);
    return res.status(500).json({ success: false, message: 'No se pudo guardar el mensaje' });
  }
});

router.get('/', ...requireAdminRole, async (req, res) => {
  try {
    return res.json(await Message.find().sort({ createdAt: -1 }));
  } catch (error) {
    return res.status(500).json({ success: false, message: 'No se pudieron cargar los mensajes' });
  }
});

router.put('/:id/read', ...requireAdminRole, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    return message ? res.json(message) : res.status(404).json({ message: 'Message not found' });
  } catch (error) { return res.status(400).json({ message: 'Invalid message id' }); }
});

router.delete('/:id', ...requireAdminRole, async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    return message ? res.json({ message: 'Message deleted' }) : res.status(404).json({ message: 'Message not found' });
  } catch (error) { return res.status(400).json({ message: 'Invalid message id' }); }
});

module.exports = router;
