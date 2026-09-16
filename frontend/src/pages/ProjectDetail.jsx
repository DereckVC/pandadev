import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

// Garantiza el prefijo /api para evitar el 404 en producción
const getApiUrl = () => {
  const raw = import.meta.env.VITE_API_URL || '/api'
  return raw.endsWith('/api') ? raw : `${raw.replace(/\/+$/, '')}/api`
}
const API = getApiUrl()

const localProjects = {
  'pandacraft-tools': { 
    title: 'PandaCraft Tools', 
    slug: 'pandacraft-tools', 
    category: 'Minecraft / Web', 
    shortDesc: { es: 'Herramientas visuales para crear y administrar mundos de Minecraft desde la web.', en: 'Visual tools to create and manage Minecraft worlds from the web.' }, 
    longDesc: { es: 'Un conjunto de utilidades rápidas para creadores y administradores de servidores Minecraft.', en: 'A fast toolkit for Minecraft creators and server administrators.' }, 
    tags: ['React', 'Vite', 'Canvas', 'Minecraft'], 
    showDemoBtn: false, 
    showGithubBtn: true, 
    repoUrl: 'https://github.com/DereckVC' 
  },
  'quantum-delivery-mini-games': { 
    title: 'Quantum Delivery / Mini-Games', 
    slug: 'quantum-delivery-mini-games', 
    category: 'Roblox / GameDev', 
    shortDesc: { es: 'Experiencias y minijuegos competitivos construidos para Roblox.', en: 'Competitive experiences and mini-games built for Roblox.' }, 
    longDesc: { es: 'Sistemas de juego, scripting y prototipos multijugador para comunidades de Roblox.', en: 'Game systems, scripting and multiplayer prototypes for Roblox communities.' }, 
    tags: ['Roblox', 'Lua', 'GameDev'], 
    showDemoBtn: false, 
    showGithubBtn: true, 
    repoUrl: 'https://github.com/DereckVC' 
  },
  'pandadev-hub-api': { 
    title: 'PandaDev Hub & API', 
    slug: 'pandadev-hub-api', 
    category: 'Web / API', 
    shortDesc: { es: 'Hub web y API para conectar proyectos, comunidad y herramientas.', en: 'Web hub and API connecting projects, community and tools.' }, 
    longDesc: { es: 'Una base MERN preparada para crecer con despliegues Cloudflare y servicios desacoplados.', en: 'A MERN foundation ready to grow with Cloudflare deployments and decoupled services.' }, 
    tags: ['MERN', 'Express', 'MongoDB', 'Cloudflare'], 
    showDemoBtn: false, 
    showGithubBtn: true, 
    repoUrl: 'https://github.com/DereckVC' 
  },
  'discord-community-bot-core': { 
    title: 'Discord Community & Bot Core', 
    slug: 'discord-community-bot-core', 
    category: 'Tools / Bots', 
    shortDesc: { es: 'Bots y herramientas para comunidades activas de Discord.', en: 'Bots and tools for active Discord communities.' }, 
    longDesc: { es: 'Arquitectura modular para automatización, moderación e integraciones mediante API.', en: 'Modular architecture for automation, moderation and API integrations.' }, 
    tags: ['Node.js', 'Discord.js', 'API'], 
    showDemoBtn: false, 
    showGithubBtn: true, 
    repoUrl: 'https://github.com/DereckVC' 
  },
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const { t, language } = useLanguage()
  const [project, setProject] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 6000)

    fetch(`${API}/projects/${slug}`, { signal: controller.signal })
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        setProject(data)
      })
      .catch(() => {
        setProject(localProjects[slug] || null)
        setFailed(true)
      })
      .finally(() => clearTimeout(timer))

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [slug])

  if (!project && !failed) {
    return <main className="section-wrap page-intro"><p>{t.loading}</p></main>
  }

  if (!project) {
    return (
      <main className="section-wrap page-intro">
        <Link className="text-link" to="/proyectos"><ArrowLeft size={16} /> {t.back}</Link>
        <h1>{t.notFound}</h1>
      </main>
    )
  }

  const pick = (value) => value && typeof value === 'object' ? (value[language] || value.es || value.en) : value
  const description = pick(language === 'en' ? (project.longDesc || project.longDescEn || project.shortDesc || project.shortDescEn) : (project.longDesc || project.shortDesc))

  return (
    <main className="section-wrap project-detail">
      <Link className="text-link" to="/proyectos"><ArrowLeft size={16} /> {t.back}</Link>
      
      <div className="detail-banner">
        {project.bannerUrl ? (
          <img src={project.bannerUrl} alt={project.title} />
        ) : (
          <span>{(project.title || 'PD').slice(0, 2).toUpperCase()}</span>
        )}
      </div>

      <span className="section-kicker">{project.category}</span>
      <h1>{project.title}</h1>
      
      <div className="tag-list">
        {(project.tags || []).map((tag) => <span key={tag}>{tag}</span>)}
      </div>

      <p className="detail-description">{description}</p>

      {/* Condicionales estrictas según lo configurado en el panel */}
      <div className="hero-actions">
        {Boolean(project.showDemoBtn) && project.demoUrl && (
          <a className="button button-primary" href={project.demoUrl} target="_blank" rel="noreferrer">
            {t.demo || 'Ver proyecto'} <ArrowUpRight size={16} />
          </a>
        )}
        {Boolean(project.showGithubBtn) && project.repoUrl && (
          <a className="button button-outline" href={project.repoUrl} target="_blank" rel="noreferrer">
            {t.github || 'Ver repositorio'} <ArrowUpRight size={16} />
          </a>
        )}
      </div>

      <div className="screenshots">
        {(project.screenshots || []).map((image) => <img key={image} src={image} alt="" />)}
      </div>
    </main>
  )
}