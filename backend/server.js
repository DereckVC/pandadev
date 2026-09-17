const crypto = require('crypto');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const passport = require('passport');
require('dotenv').config();

const Project = require('./models/Project');
const Visitor = require('./models/Visitor');
const authRoutes = require('./routes/auth');
const contactRoutes = require('./routes/contact');
const adminRoutes = require('./routes/admin');
const { requireAdmin } = require('./middleware/auth');

const app = express();
const port = process.env.PORT || 5000;

// Requerido en Render para detectar la IP real del visitante detrás del proxy inverso
app.set('trust proxy', 1);

// Lista blanca flexible con soporte para apex, www, localhost y previsualizaciones de Vercel
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://pandadev.me',
  'https://www.pandadev.me',
  'https://pandadev-beta.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean).map(url => url.replace(/\/+$/, ''));

const corsOptions = {
  origin: (origin, callback) => {
    // Permite peticiones sin 'origin' (móviles, curl, Postman o Render health check)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/+$/, '');
    const isAllowed = allowedOrigins.includes(cleanOrigin) ||
      cleanOrigin.endsWith('pandadev.me') ||
      cleanOrigin.endsWith('.vercel.app');

    if (isAllowed) {
      return callback(null, true);
    }
    
    // Rechazo limpio para no detonar un Error 500 en preflight OPTIONS
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-device-id'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(passport.initialize());

// Health Check
app.get('/api/health', (req, res) => res.status(mongoose.connection.readyState === 1 ? 200 : 503).json({ 
  status: mongoose.connection.readyState === 1 ? 'ok' : 'degraded', 
  database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' 
}));

// Módulos de Rutas Principales
app.use('/api/auth', authRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// Sistema de métricas y visitas
const hashIp = (ip) => crypto.createHash('sha256').update(`${ip}:${process.env.ADMIN_TOKEN || 'pandadev'}`).digest('hex');
const isBot = (userAgent) => /bot|crawler|spider|slurp|headless|lighthouse|curl|wget/i.test(userAgent || '');
const isAssetRequest = (path) => /\.(?:js|css|map|png|jpe?g|gif|svg|ico|webp|woff2?|ttf|pdf|xml|txt)$/i.test(path);

const recordVisit = async (req, res, next) => {
  const path = typeof req.body.path === 'string' ? req.body.path.slice(0, 200) : '/';
  const userAgent = req.get('user-agent') || 'unknown';
  if (isBot(userAgent) || isAssetRequest(path)) return res.status(204).end();
  try {
    const forwardedIp = req.headers['x-forwarded-for'];
    const ip = forwardedIp ? forwardedIp.split(',')[0].trim() : req.socket.remoteAddress || 'unknown';
    const device = /mobile|android|iphone|ipad/i.test(userAgent) ? 'Mobile' : 'Desktop';
    const visit = await Visitor.create({ userAgent, ipHash: hashIp(ip), path, page: path, device });
    return res.status(201).json({ id: visit.id });
  } catch (error) { return next(error); }
};
app.post('/api/visit', recordVisit, (error, req, res, next) => res.status(500).json({ message: 'Unable to record visit' }));

// Rutas Públicas de Proyectos para el Catálogo
app.get('/api/projects', async (req, res) => {
  try { 
    return res.json(await Project.find({ isPublic: true }).sort({ order: 1, createdAt: -1 })); 
  } catch (error) { 
    return res.status(500).json({ message: 'Unable to load projects' }); 
  }
});

app.get('/api/projects/:slug', async (req, res) => {
  try {
    const project = await Project.findOne({ slug: req.params.slug, isPublic: true });
    return project ? res.json(project) : res.status(404).json({ message: 'Project not found' });
  } catch (error) { 
    return res.status(500).json({ message: 'Unable to load project' }); 
  }
});

// Sincronización con GitHub (endpoint centralizado)
app.post('/api/admin/github/sync', requireAdmin, async (req, res) => {
  try {
    const response = await fetch(`https://api.github.com/users/${process.env.GITHUB_USERNAME || 'DereckVC'}/repos?per_page=100&sort=updated`, { 
      headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'PandaDev-Admin' } 
    });
    if (!response.ok) return res.status(response.status).json({ message: 'GitHub API unavailable' });
    const repos = await response.json();
    const imported = await Promise.all(repos.filter((repo) => !repo.fork).map((repo, index) => Project.findOneAndUpdate(
      { githubId: repo.id },
      {
        githubId: repo.id,
        title: repo.name,
        slug: repo.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        shortDesc: repo.description || 'Proyecto de código abierto en GitHub.',
        longDesc: repo.description || '',
        repoUrl: repo.html_url,
        demoUrl: repo.homepage || '',
        showGithubBtn: true,
        showDemoBtn: Boolean(repo.homepage),
        tags: repo.language ? [repo.language] : [],
        order: index,
        isPublic: true,
      },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true, runValidators: true },
    )));
    return res.json({ count: imported.length, projects: imported });
  } catch (error) { 
    return res.status(502).json({ message: 'Unable to synchronize GitHub repositories' }); 
  }
});

// Conexión con MongoDB Atlas y arranque del servidor
mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(port, () => console.log(`PandaDev API listening on port ${port}`)))
  .catch((error) => { 
    console.error('MongoDB connection failed:', error.message); 
    process.exit(1); 
  });

module.exports = app;