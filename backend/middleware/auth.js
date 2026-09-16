const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ADMIN_EMAIL = 'minombrexd158@gmail.com';
const ADMIN_GITHUB_USERNAME = 'DereckVC';

const getToken = (req) => req.cookies?.token || req.header('authorization')?.replace('Bearer ', '');

const requireAuth = async (req, res, next) => {
  try {
    const token = getToken(req);
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'pandadev-development-secret');
    req.user = await User.findById(payload.id);
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid session' });
  }
};

const requireAdmin = (req, res, next) => {
  if (process.env.ADMIN_TOKEN && req.header('x-admin-token') === process.env.ADMIN_TOKEN) return next();
  return requireAuth(req, res, () => {
    const isAdmin = req.user.email === ADMIN_EMAIL || req.user.githubUsername === ADMIN_GITHUB_USERNAME;
    if (!isAdmin) return res.status(403).json({ message: 'Admin role required' });
    return next();
  });
};

module.exports = { requireAuth, requireAdmin, getToken };
