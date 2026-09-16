const express = require('express');
const Project = require('../models/Project');
const User = require('../models/User');
const Message = require('../models/Message');
const Visitor = require('../models/Visitor');
const mongoose = require('mongoose');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
const requireAdminRole = [requireAuth, (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin role required' });
  return next();
}];

router.get('/stats', ...requireAdminRole, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const [totalVisits, uniqueVisitsToday, totalUsers, verifiedUsers, totalProjects, totalMessages, unreadMessages, mobileVisits, desktopVisits, recentUsers, recentMessages, recentVisits] = await Promise.all([
      Visitor.countDocuments(),
      Visitor.distinct('ipHash', { createdAt: { $gte: startOfDay } }),
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      Project.countDocuments(),
      Message.countDocuments(),
      Message.countDocuments({ read: false }),
      Visitor.countDocuments({ device: 'Mobile' }),
      Visitor.countDocuments({ device: 'Desktop' }),
      User.find({}, 'name email createdAt').sort({ createdAt: -1 }).limit(5).lean(),
      Message.find({}, 'name email createdAt').sort({ createdAt: -1 }).limit(5).lean(),
      Visitor.find({}, 'page path createdAt').sort({ createdAt: -1 }).limit(5).lean(),
    ]);
    const dbStarted = Date.now();
    await mongoose.connection.db.command({ ping: 1 });
    return res.json({
      totalVisits,
      uniqueVisitsToday: uniqueVisitsToday.length,
      totalUsers,
      verifiedUsers,
      totalProjects,
      totalMessages,
      unreadMessages,
      systemStatus: { status: 'ONLINE', uptime: process.uptime(), database: mongoose.connection.readyState === 1 ? 'MongoDB Atlas Connected' : 'Disconnected', latencyMs: Date.now() - dbStarted },
      traffic: { mobile: mobileVisits, desktop: desktopVisits },
      recentActivity: [
        ...recentUsers.map((item) => ({ type: 'user', label: `Nuevo registro: ${item.name || item.email}`, date: item.createdAt })),
        ...recentMessages.map((item) => ({ type: 'message', label: `Mensaje recibido de ${item.name}`, date: item.createdAt })),
        ...recentVisits.map((item) => ({ type: 'visit', label: `Visita registrada en ${item.page || item.path || '/'}`, date: item.createdAt })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load admin statistics' });
  }
});

router.get('/users', ...requireAdminRole, async (req, res) => {
  try {
    const users = await User.find({}, '_id name email role isVerified twoFactorEnabled createdAt').sort({ createdAt: -1 }).lean();
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load users' });
  }
});

router.put('/users/:id/role', ...requireAdminRole, async (req, res) => {
  if (!['user', 'admin'].includes(req.body.role)) return res.status(400).json({ message: 'Role must be user or admin' });
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true, runValidators: true }).select('_id name email role isVerified twoFactorEnabled createdAt');
    return user ? res.json(user) : res.status(404).json({ message: 'User not found' });
  } catch (error) {
    return res.status(400).json({ message: 'Invalid user id' });
  }
});

router.get('/projects', ...requireAdminRole, async (req, res) => {
  try { return res.json(await Project.find().sort({ order: 1, createdAt: -1 })); }
  catch (error) { return res.status(500).json({ message: 'Unable to load projects' }); }
});

router.post('/projects', ...requireAdminRole, async (req, res) => {
  try { return res.status(201).json(await Project.create(req.body)); }
  catch (error) { return res.status(400).json({ message: error.code === 11000 ? 'Slug already exists' : 'Invalid project data' }); }
});

router.put('/projects/:id', ...requireAdminRole, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    return project ? res.json(project) : res.status(404).json({ message: 'Project not found' });
  } catch (error) { return res.status(400).json({ message: 'Invalid project data' }); }
});

router.put('/projects/:id/toggle-github', ...requireAdminRole, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    project.githubVisible = !project.githubVisible;
    project.showGithubBtn = project.githubVisible;
    await project.save();
    return res.json(project);
  } catch (error) { return res.status(400).json({ message: 'Invalid project id' }); }
});

router.delete('/projects/:id', ...requireAdminRole, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    return project ? res.json({ message: 'Project deleted' }) : res.status(404).json({ message: 'Project not found' });
  } catch (error) { return res.status(400).json({ message: 'Invalid project id' }); }
});

router.get('/github/repos', ...requireAdminRole, async (req, res) => {
  try {
    const response = await fetch(`https://api.github.com/users/${process.env.GITHUB_USERNAME || 'DereckVC'}/repos?per_page=100&sort=updated`, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'PandaDev-Admin' } });
    if (!response.ok) return res.status(response.status).json({ message: 'GitHub API unavailable' });
    return res.json(await response.json());
  } catch (error) { return res.status(502).json({ message: 'Unable to reach GitHub' }); }
});

module.exports = router;
