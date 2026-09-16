import { useEffect, useMemo, useState } from 'react'
import { 
  ArrowUpRight, 
  ChevronDown, 
  Code2, 
  LockKeyhole, 
  Mail, 
  Menu, 
  MessageCircle, 
  Plus, 
  Shield, 
  Sparkles 
} from 'lucide-react'
import { BrowserRouter, Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LanguageProvider, useLanguage } from './contexts/LanguageContext'
import ProjectsPage from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import ResetPassword from './pages/ResetPassword'
import Login from './pages/Login'
import HomePage from './pages/Home'
import AboutPage from './pages/About'
import ContactPage from './pages/Contact'
import ProfilePage from './pages/Profile'
import AdminPage from './pages/Admin'
import NavbarComponent from './components/Navbar'
import FooterComponent from './components/Footer'
import FloatingFAQ from './components/FloatingFAQ'
import NoticeBar from './components/NoticeBar'
import './App.css'

// Normaliza la URL para garantizar que siempre apunte al endpoint /api
const getApiUrl = () => {
  const raw = import.meta.env.VITE_API_URL || '/api'
  return raw.endsWith('/api') ? raw : `${raw.replace(/\/+$/, '')}/api`
}
const API = getApiUrl()

const projectsFallback = [
  { 
    _id: 'pandacraft-tools', 
    slug: 'pandacraft-tools', 
    title: 'PandaCraft Tools', 
    category: 'Minecraft / Web', 
    shortDesc: { 
      es: 'Herramientas visuales para crear y administrar mundos de Minecraft desde la web.', 
      en: 'Visual tools to create and manage Minecraft worlds from the web.' 
    }, 
    longDesc: { 
      es: 'Un conjunto de utilidades rápidas para creadores y administradores de servidores Minecraft.', 
      en: 'A fast toolkit for Minecraft creators and server administrators.' 
    }, 
    tags: ['React', 'Vite', 'Canvas', 'Minecraft'], 
    showDemoBtn: false, 
    showGithubBtn: true, 
    repoUrl: 'https://github.com/DereckVC' 
  },
  { 
    _id: 'quantum-delivery-mini-games', 
    slug: 'quantum-delivery-mini-games', 
    title: 'Quantum Delivery / Mini-Games', 
    category: 'Roblox / GameDev', 
    shortDesc: { 
      es: 'Experiencias y minijuegos competitivos construidos para Roblox.', 
      en: 'Competitive experiences and mini-games built for Roblox.' 
    }, 
    longDesc: { 
      es: 'Sistemas de juego, scripting y prototipos multijugador para comunidades de Roblox.', 
      en: 'Game systems, scripting and multiplayer prototypes for Roblox communities.' 
    }, 
    tags: ['Roblox', 'Lua', 'GameDev'], 
    showDemoBtn: false, 
    showGithubBtn: true, 
    repoUrl: 'https://github.com/DereckVC' 
  },
  { 
    _id: 'pandadev-hub-api', 
    slug: 'pandadev-hub-api', 
    title: 'PandaDev Hub & API', 
    category: 'Web / API', 
    shortDesc: { 
      es: 'Hub web y API para conectar proyectos, comunidad y herramientas.', 
      en: 'Web hub and API connecting projects, community and tools.' 
    }, 
    longDesc: { 
      es: 'Una base MERN preparada para crecer con despliegues Cloudflare y servicios desacoplados.', 
      en: 'A MERN foundation ready to grow with Cloudflare deployments and decoupled services.' 
    }, 
    tags: ['MERN', 'Express', 'MongoDB', 'Cloudflare'], 
    showDemoBtn: false, 
    showGithubBtn: true, 
    repoUrl: 'https://github.com/DereckVC' 
  },
  { 
    _id: 'discord-community-bot-core', 
    slug: 'discord-community-bot-core', 
    title: 'Discord Community & Bot Core', 
    category: 'Tools / Bots', 
    shortDesc: { 
      es: 'Bots y herramientas para comunidades activas de Discord.', 
      en: 'Bots and tools for active Discord communities.' 
    }, 
    longDesc: { 
      es: 'Arquitectura modular para automatización, moderación e integraciones mediante API.', 
      en: 'Modular architecture for automation, moderation and API integrations.' 
    }, 
    tags: ['Node.js', 'Discord.js', 'API'], 
    showDemoBtn: false, 
    showGithubBtn: true, 
    repoUrl: 'https://github.com/DereckVC' 
  },
]

const copy = {
  es: { 
    home: 'Inicio', 
    projects: 'Proyectos', 
    about: 'Lab', 
    contact: 'Contacto', 
    login: 'Entrar', 
    logout: 'Salir', 
    heroSub: 'Full-Stack Developer & Game Creator con 1 año de experiencia construyendo herramientas web, mecánicas en Roblox (Luau) y utilidades interactivas.', 
    available: 'Disponible para proyectos', 
    projectsCta: 'Ver proyectos', 
    contactCta: 'Hablemos', 
    trajectory: 'Trayectoria', 
    fullstack: 'Full-stack', 
    gamedev: 'GameDev', 
    infra: 'Infraestructura', 
    faq: 'Preguntas técnicas', 
    contactHub: 'Contacto', 
    catalog: 'Portafolio de ingeniería', 
    all: 'Todos', 
    demo: 'Abrir demo', 
    github: 'Ver GitHub', 
    close: 'Cerrar', 
    forbidden: 'Acceso restringido', 
    cookie: 'Usamos cookies esenciales para recordar preferencias.', 
    accept: 'Aceptar', 
    profile: 'Perfil', 
    admin: 'Admin' 
  },
  en: { 
    home: 'Home', 
    projects: 'Projects', 
    about: 'Lab', 
    contact: 'Contact', 
    login: 'Sign in', 
    logout: 'Sign out', 
    heroSub: 'Full-Stack Developer with 1 year of experience focused on modern web architectures, interactive Roblox Studio (Luau) environments and development tools.', 
    available: 'Available for projects', 
    projectsCta: 'View projects', 
    contactCta: 'Let’s talk', 
    trajectory: 'Trajectory', 
    fullstack: 'Full-stack', 
    gamedev: 'GameDev', 
    infra: 'Infrastructure', 
    faq: 'Technical FAQ', 
    contactHub: 'Contact', 
    catalog: 'Engineering portfolio', 
    all: 'All', 
    demo: 'Open demo', 
    github: 'View GitHub', 
    close: 'Close', 
    forbidden: 'Restricted access', 
    cookie: 'We use essential cookies to remember preferences.', 
    accept: 'Accept', 
    profile: 'Profile', 
    admin: 'Admin' 
  },
}

function App() { 
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Site />
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  ) 
}

function Site() {
  const [projects, setProjects] = useState(projectsFallback)
  const location = useLocation()

  useEffect(() => { 
    fetch(`${API}/projects`)
      .then((r) => r.ok ? r.json() : [])
      .then((items) => items.length && setProjects(items))
      .catch(() => {}) 
  }, [])

  useEffect(() => { 
    fetch(`${API}/visit`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ path: location.pathname }) 
    }).catch(() => {}) 
  }, [location.pathname])

  const isLogin = location.pathname === '/login'

  return (
    <div className="app-shell">
      {!isLogin && <NavbarComponent />}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/proyectos" element={<ProjectsPage projects={projects} />} />
          <Route path="/proyectos/:slug" element={<ProjectDetail />} />
          <Route path="/sobre-mi" element={<AboutPage />} />
          <Route path="/contacto" element={<ContactPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>
      {!isLogin && <FloatingFAQ />}
      {!isLogin && <FooterComponent />}
      {!isLogin && <NoticeBar />}
    </div>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const { language, setLanguage } = useLanguage()
  const t = copy[language]

  return (
    <header className="site-header">
      <Link className="brand" to="/">
        <span className="brand-mark">P</span>
        <span className="brand-name">
          <span className="brand-panda">Panda</span>
          <span className="brand-dev">Dev</span>
        </span>
      </Link>
      <button className="menu-button" onClick={() => setOpen(!open)} aria-label="Menu">
        {open ? '×' : <Menu />}
      </button>
      <nav className={`nav-links ${open ? 'open' : ''}`}>
        {[
          ['/', t.home], 
          ['/proyectos', t.projects], 
          ['/sobre-mi', t.about], 
          ['/contacto', t.contact]
        ].map(([path, label]) => (
          <NavLink key={path} to={path} end={path === '/'} onClick={() => setOpen(false)}>
            {label}
          </NavLink>
        ))}
        <div className="nav-actions">
          {user ? (
            <details className="user-menu">
              <summary>
                {user.avatar ? <img src={user.avatar} alt="" /> : (user.name || user.email || 'U').slice(0, 1)}
              </summary>
              <div>
                <strong>{user.name || user.email}</strong>
                <Link to="/perfil">{t.profile}</Link>
                {user.role === 'admin' && <Link to="/admin">{t.admin}</Link>}
                <button onClick={logout}>{t.logout}</button>
              </div>
            </details>
          ) : (
            <Link className="nav-pill" to="/login">{t.login}</Link>
          )}
          <button 
            className="language-toggle" 
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} 
            aria-label="Cambiar idioma"
          >
            {language.toUpperCase()}
          </button>
        </div>
      </nav>
    </header>
  )
}

function Home() {
  const { language } = useLanguage()
  const t = copy[language]
  const stack = [
    ['HTML5', 'html'], ['CSS3', 'css'], ['JavaScript', 'js'], ['TypeScript', 'ts'],
    ['React', 'react'], ['Node.js', 'nodejs'], ['Express', 'express'], ['MongoDB', 'mongodb'],
    ['Python', 'py'], ['Java', 'java'], ['Discord', 'discord'], ['Git', 'git'],
    ['Cloudflare', 'cloudflare'], ['VS Code', 'vscode'], ['Figma', 'figma']
  ]

  return (
    <main className="home-vfx">
      <section className="hero section-wrap">
        <div className="hero-copy">
          <span className="eyebrow hero-badge">● PORTFOLIO · DISPONIBLE PARA PROYECTOS</span>
          <h1 className="home-title">
            <span className="hero-panda">Panda</span>
            <span className="hero-dev">Dev</span>
          </h1>
          <p>{t.heroSub}</p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/proyectos">
              {t.projectsCta} <ArrowUpRight size={16} />
            </Link>
            <Link className="button button-outline" to="/contacto">{t.contactCta}</Link>
          </div>
        </div>
        <div className="hero-visual hidden lg:block" aria-label="PandaDev creative lab">
          <article className="visual-card visual-card-main">
            <img src="https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=500&q=80" alt="" />
            <div className="visual-card-content">
              <span>MINECRAFT / PANDACRAFT</span>
              <strong>BUILD<br />YOUR WORLD</strong>
              <b>TOOLS ONLINE</b>
              <div className="visual-badges"><b>WEB</b><b>CANVAS</b></div>
            </div>
          </article>
          <article className="visual-card visual-card-small">
            <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&q=80" alt="" />
            <div className="visual-card-content">
              <span>ROBLOX / LUA</span>
              <b>ONLINE</b>
              <em>shipping v2.6</em>
            </div>
          </article>
          <div className="visual-orb" />
        </div>
      </section>
      <section className="stack-section">
        <h2>{language === 'es' ? 'Herramientas para construir sin límites.' : 'Tools for building without limits.'}</h2>
        <p className="stack-subtitle">
          {language === 'es' ? 'Tecnologías y herramientas que domino e integro en cada proyecto.' : 'Technologies and tools I master and integrate into every project.'}
        </p>
        <div className="stack-marquee" aria-label="Tecnologías utilizadas">
          <div className="stack-track">
            {[...stack, ...stack].map(([item, icon], index) => (
              <span className="stack-chip" key={`${item}-${index}`}>
                <img src={`https://skillicons.dev/icons?i=${icon}`} alt={`${item} icon`} />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function Bento({ title, number, text }) { 
  return (
    <article className="bento-card glass">
      <span className="card-number">{number}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      <ArrowUpRight size={18} />
    </article>
  ) 
}

function About() { 
  const { language } = useLanguage()
  return (
    <main className="page-intro section-wrap">
      <span className="eyebrow">THE LAB</span>
      <h1>{language === 'es' ? 'Ingeniería con intención.' : 'Engineering with intent.'}</h1>
      <p>{language === 'es' ? 'PandaDev es un laboratorio independiente de software y tecnología creativa. Sin ruido comercial: sólo productos, sistemas y experiencias digitales.' : 'PandaDev is an independent software and creative technology lab. No commercial noise: just products, systems and digital experiences.'}</p>
    </main>
  ) 
}

function Contact() { 
  const { language } = useLanguage()
  return (
    <main className="page-intro section-wrap">
      <span className="eyebrow">CONTACT / 03</span>
      <h1>{language === 'es' ? 'Conectemos.' : 'Let’s connect.'}</h1>
      <p>{language === 'es' ? 'Cuéntame qué estás construyendo y qué parte necesita claridad.' : 'Tell me what you are building and where you need clarity.'}</p>
      <a className="button button-primary" href="mailto:support@pandadev.me">
        support@pandadev.me <ArrowUpRight size={16} />
      </a>
    </main>
  ) 
}

function Profile() { 
  const { user, api, updateUser } = useAuth()
  const [tab, setTab] = useState('dashboard')
  const [form, setForm] = useState({ name: user?.name || '', discordTag: user?.discordTag || '' })

  if (!user) return <main className="page-intro section-wrap"><h1>Sign in first.</h1></main>

  const save = async (e) => { 
    e.preventDefault()
    const r = await fetch(`${api}/auth/profile`, { 
      method: 'PATCH', 
      credentials: 'include', 
      headers: { 
        'Content-Type': 'application/json', 
        Authorization: `Bearer ${localStorage.getItem('panda_token') || ''}` 
      }, 
      body: JSON.stringify({ username: form.name, discordTag: form.discordTag }) 
    })
    if (r.ok) updateUser((await r.json()).user) 
  }

  return (
    <main className="profile-shell section-wrap">
      <aside className="profile-sidebar">
        <strong>{user.name || user.email}</strong>
        {['dashboard', 'edit', 'security', 'home'].map((item) => (
          <button 
            className={tab === item ? 'active' : ''} 
            key={item} 
            onClick={() => item === 'home' ? window.location.assign('/') : setTab(item)}
          >
            {item}
          </button>
        ))}
      </aside>
      <section className="profile-content">
        <span className="eyebrow">ACCOUNT / {tab.toUpperCase()}</span>
        {tab === 'dashboard' && (
          <>
            <h1>Dashboard</h1>
            <div className="profile-stats glass">
              <strong>{user.name || 'User'}</strong>
              <span>{user.email}</span>
              <span>{user.discordTag || 'Discord tag not set'}</span>
            </div>
          </>
        )}
        {tab === 'edit' && (
          <form className="settings-form" onSubmit={save}>
            <label>Name<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Discord tag<input value={form.discordTag} onChange={(e) => setForm({ ...form, discordTag: e.target.value })} /></label>
            <label>Email<input value={user.email} readOnly /></label>
            <button className="button button-primary">Save changes</button>
          </form>
        )}
        {tab === 'security' && (
          <div className="glass profile-stats">
            <LockKeyhole /> OAuth providers and password reset are managed securely from your account.
          </div>
        )}
      </section>
    </main>
  ) 
}

function Admin() { 
  const { user, api } = useAuth()
  const [projects, setProjects] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => { 
    if (user?.role === 'admin') {
      fetch(`${api}/admin/projects`, { credentials: 'include' })
        .then((r) => r.ok ? r.json() : [])
        .then(setProjects)
        .catch(() => {}) 
    }
  }, [user, api])

  if (!user || user.role !== 'admin') {
    return (
      <main className="page-intro section-wrap">
        <Shield />
        <h1>{copy.es.forbidden}</h1>
      </main>
    )
  }

  const sync = async () => { 
    const r = await fetch(`${api}/admin/github/sync`, { method: 'POST', credentials: 'include' })
    const data = await r.json()
    setMessage(data.message || `Imported ${data.count || 0} repositories`)
    if (data.projects) setProjects(data.projects) 
  }

  return (
    <main className="admin-page section-wrap">
      <div className="admin-heading">
        <span className="eyebrow">CONTROL PLANE</span>
        <h1>Admin workspace</h1>
        <button className="button button-primary" onClick={sync}>
          <Plus size={16} /> Import GitHub
        </button>
      </div>
      {message && <p className="form-notice">{message}</p>}
      <div className="admin-grid">
        {projects.map((p) => (
          <article className="glass admin-row" key={p._id}>
            <strong>{p.title}</strong>
            <span>{p.category}</span>
            <small>{p.isPublic ? 'Public' : 'Draft'}</small>
          </article>
        ))}
      </div>
    </main>
  ) 
}

function Footer() { 
  return (
    <footer className="site-footer">
      <div className="footer-inner section-wrap">
        <div>
          <Link className="brand" to="/">
            <span className="brand-mark">P</span>
            <span className="brand-name">
              <span className="brand-panda">Panda</span>
              <span className="brand-dev">Dev</span>
            </span>
          </Link>
          <span className="footer-online"><i /> SYSTEMS ONLINE</span>
        </div>
        <small>© 2026 PandaDev. Todos los derechos reservados.</small>
        <div className="footer-links">
          <div className="media-row">
            <a className="media-discord" href="https://discord.com" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.54 5.36A16.4 16.4 0 0 0 15.5 4l-.5 1.03a14.2 14.2 0 0 0-5.99 0L8.5 4a16.4 16.4 0 0 0-4.04 1.36C1.9 9.26 1.2 13.1 1.55 16.9a16.5 16.5 0 0 0 4.96 2.53l1.2-1.65a10.2 10.2 0 0 1-1.76-.85l.43-.33c3.4 1.57 7.1 1.57 10.45 0l.44.33c-.57.34-1.16.62-1.77.85l1.2 1.65a16.5 16.5 0 0 0 4.96-2.53c.4-4.4-.68-8.2-2.12-11.54ZM8.08 14.75c-1.02 0-1.86-.94-1.86-2.1s.82-2.1 1.86-2.1 1.87.94 1.86 2.1c0 1.16-.82 2.1-1.86 2.1Zm7.84 0c-1.02 0-1.86-.94-1.86-2.1s.82-2.1 1.86-2.1 1.87.94 1.86 2.1c0 1.16-.82 2.1-1.86 2.1Z"/></svg> Discord
            </a>
            <a className="media-github" href="https://github.com/DereckVC" target="_blank" rel="noreferrer">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .08 1.53 1.02 1.53 1.02.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.02-2.68-.1-.25-.44-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 7.04c.85 0 1.7.12 2.5.36 1.9-1.29 2.74-1.02 2.74-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.59.69.49A10 10 0 0 0 12 2Z"/></svg> GitHub
            </a>
            <a className="media-email" href="mailto:support@pandadev.me">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Zm0 3.2v.2l9 5.7 9-5.7v-.2L12 13.9 3 8.2Z"/></svg> Email
            </a>
          </div>
        </div>
      </div>
    </footer>
  ) 
}

export default App