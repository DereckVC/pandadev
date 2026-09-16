import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Grid2X2, List, X } from 'lucide-react'
import ProviderIcon from '../components/ProviderIcon'
import { useLanguage } from '../contexts/LanguageContext'

const fallbackProjects = [
  {
    id: 'pandacraft-tools',
    title: 'PandaCraft Tools',
    category: 'Minecraft Tools',
    types: ['Minecraft Tools', 'Webs'],
    summary: 'Herramientas visuales para diseñar estandartes, personalizar escudos y calcular encantamientos.',
    vision: 'PandaCraft Tools reúne edición visual, cálculos y utilidades rápidas para creadores de Minecraft en una sola interfaz web.',
    goals: 'Crear un centro rápido para diseñar y calcular recursos sin cambiar de herramienta.',
    inspiration: 'Surgió al convertir herramientas dispersas en una experiencia web unificada.',
    team: 'En solitario (Panda158)',
    architecture: 'Frontend interactivo / Canvas y utilidades de cálculo',
    images: ['https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=1200&q=85'],
    tags: ['React', 'Canvas', 'Tailwind CSS', 'Vite'],
    demoUrl: 'https://pandacraft.me',
    githubUrl: 'https://github.com/DereckVC',
    showDemoBtn: false,
    showGithubBtn: true,
  }
]

const categories = ['Todos', 'Webs', 'Sistemas', 'Roblox / Luau', 'Minecraft Tools', 'Bots']

const projectsApi = (() => {
  const raw = import.meta.env.VITE_API_URL || '/api'
  return raw.endsWith('/api') ? raw : `${raw.replace(/\/+$/, '')}/api`
})()

const normalizeProject = (item) => {
  const shortDesc = typeof item.shortDesc === 'object' ? (item.shortDesc.es || item.shortDesc.en || '') : (item.shortDesc || item.description || item.summary || '')
  const longDesc = typeof item.longDesc === 'object' ? (item.longDesc.es || item.longDesc.en || '') : (item.longDesc || item.vision || shortDesc)

  const showDemo = item.showDemoBtn !== undefined 
    ? Boolean(item.showDemoBtn) 
    : (item.demoVisible !== undefined ? Boolean(item.demoVisible) : Boolean(item.demoUrl))

  const showGithub = item.showGithubBtn !== undefined 
    ? Boolean(item.showGithubBtn) 
    : (item.githubVisible !== undefined ? Boolean(item.githubVisible) : Boolean(item.repoUrl || item.githubUrl))

  const imageList = item.images?.length 
    ? item.images 
    : (item.screenshots?.length 
      ? item.screenshots 
      : [item.bannerUrl || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=85'])

  return {
    id: item._id || item.slug || item.id || String(Math.random()),
    _id: item._id,
    title: item.title || 'Proyecto',
    category: item.category || 'Webs',
    types: item.types?.length ? item.types : [item.category || 'Webs'],
    summary: shortDesc,
    vision: longDesc || 'Sin descripción disponible.',
    goals: item.goals || 'Desarrollo, despliegue y mantenimiento continuo.',
    inspiration: item.inspiration || 'Optimización de flujos y herramientas para la comunidad.',
    team: item.team || 'DereckVC (Panda158)',
    architecture: item.architecture || `${item.category || 'Web'} / Full-Stack`,
    images: imageList,
    tags: Array.isArray(item.tags) ? item.tags : (typeof item.tags === 'string' ? item.tags.split(',').map((t) => t.trim()).filter(Boolean) : []),
    demoUrl: item.demoUrl || '',
    githubUrl: item.repoUrl || item.githubUrl || '',
    showDemoBtn: showDemo,
    showGithubBtn: showGithub,
  }
}

const translations = {
  es: {
    badge: '● PORTFOLIO · PROYECTOS SELECCIONADOS',
    title: 'Mis Proyectos',
    subtitle: 'Sistemas interactivos, herramientas web y arquitecturas diseñadas con enfoque en rendimiento y usabilidad.',
    published: 'Proyectos Publicados',
    details: 'Ver detalles',
    all: 'Todos',
    webs: 'Webs',
    systems: 'Sistemas',
    roblox: 'Roblox / Luau',
    minecraft: 'Minecraft Tools',
    bots: 'Bots',
    list: 'Lista',
    cards: 'Tarjetas',
    vision: 'Visión & Propósito',
    inspiration: 'Inspiración',
    team: 'Equipo',
    architecture: 'Arquitectura / Rol',
    technologies: 'Tecnologías',
    demo: 'Ver proyecto',
    github: 'Ver repositorio en GitHub',
    close: 'Cerrar proyecto',
    previous: 'Imagen anterior',
    next: 'Imagen siguiente',
    noResults: 'No hay proyectos para esta categoría.',
  },
  en: {
    badge: '● PORTFOLIO · SELECTED PROJECTS',
    title: 'My Projects',
    subtitle: 'Interactive systems, web tools and architectures designed with a focus on performance and usability.',
    published: 'Published Projects',
    details: 'View details',
    all: 'All',
    webs: 'Web',
    systems: 'Systems',
    roblox: 'Roblox / Luau',
    minecraft: 'Minecraft Tools',
    bots: 'Bots',
    list: 'List',
    cards: 'Cards',
    vision: 'Vision & Purpose',
    inspiration: 'Inspiration',
    team: 'Team',
    architecture: 'Architecture / Role',
    technologies: 'Technologies',
    demo: 'View project',
    github: 'View repository on GitHub',
    close: 'Close project',
    previous: 'Previous image',
    next: 'Next image',
    noResults: 'There are no projects in this category.',
  },
}

const categoryLabel = (category, text) => ({
  Todos: text.all,
  Webs: text.webs,
  Sistemas: text.systems,
  'Roblox / Luau': text.roblox,
  'Minecraft Tools': text.minecraft,
  Bots: text.bots,
}[category] || category)

function ProjectTags({ tags }) {
  return (
    <div className="tag-list">
      {tags.map((tag) => <span key={tag}>{tag}</span>)}
    </div>
  )
}

function ProjectCard({ project, text, onSelect }) {
  return (
    <article 
      className="project-card project-grid-card" 
      role="button" 
      tabIndex="0" 
      onClick={() => onSelect(project)} 
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(project)
        }
      }}
    >
      <div className="project-image-wrap project-card-banner">
        <img src={project.images[0]} alt={`${project.title} preview`} loading="lazy" />
        <div className="project-image-overlay" />
        <span className="project-category-badge">{categoryLabel(project.category, text)}</span>
      </div>
      <div className="project-card-body project-compact-body">
        <h2>{project.title}</h2>
        <p>{project.summary}</p>
        <ProjectTags tags={project.tags} />
      </div>
    </article>
  )
}

function ProjectListRow({ project, text, onSelect }) {
  return (
    <article 
      className="project-list-row w-full p-4 rounded-2xl bg-[#0d0d14]/90 border border-white/10 hover:border-[#8b5cf6]/50 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer" 
      role="button" 
      tabIndex="0" 
      onClick={() => onSelect(project)} 
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onSelect(project)
        }
      }}
    >
      <div className="flex w-full min-w-0 items-center gap-4">
        <img className="h-20 w-28 shrink-0 rounded-xl object-cover" src={project.images[0]} alt={`${project.title} thumbnail`} loading="lazy" />
        <div className="min-w-0">
          <span className="project-category-badge project-list-category">{categoryLabel(project.category, text)}</span>
          <h2 className="mt-2 truncate text-lg font-bold text-white">{project.title}</h2>
          <ProjectTags tags={project.tags.slice(0, 3)} />
        </div>
      </div>
      <button 
        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#8b5cf6] text-white text-xs font-semibold tracking-wide transition-all border border-white/10 hover:border-transparent flex items-center gap-2 shrink-0" 
        type="button" 
        onClick={(event) => {
          event.stopPropagation()
          onSelect(project)
        }}
      >
        {text.details} <ArrowUpRight size={15} />
      </button>
    </article>
  )
}

function ProjectModal({ project, text, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (!project) return undefined
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
      if (event.key === 'ArrowLeft') setCurrentImageIndex((index) => (index - 1 + project.images.length) % project.images.length)
      if (event.key === 'ArrowRight') setCurrentImageIndex((index) => (index + 1) % project.images.length)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [project, onClose])

  if (!project) return null

  // Condiciones estrictas que respetan la configuración del panel
  const hasDemo = Boolean(project.showDemoBtn) && Boolean(project.demoUrl)
  const hasGithub = Boolean(project.showGithubBtn) && Boolean(project.githubUrl)

  return (
    <div className="project-overlay fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6" role="presentation" onClick={onClose}>
      <article className="project-modal max-w-5xl w-full bg-[#0d0d14] border border-[#8b5cf6]/40 rounded-3xl overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col" role="dialog" aria-modal="true" aria-labelledby={`project-modal-${project.id}`} onClick={(event) => event.stopPropagation()}>
        <button className="modal-close z-30 bg-black/70" type="button" onClick={onClose} aria-label={text.close}><X size={20} /></button>
        <button className="absolute left-5 top-5 z-30 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-semibold text-white transition hover:border-[#8b5cf6] hover:bg-[#8b5cf6]" type="button" onClick={onClose}>← Volver a Proyectos</button>
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-black">
          <img className="h-full w-full object-cover" src={project.images[currentImageIndex]} alt={`${project.title} ${currentImageIndex + 1}`} />
          {project.images.length > 1 && (
            <>
              <button className="absolute left-4 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-[#8b5cf6] hover:bg-[#8b5cf6]" type="button" onClick={() => setCurrentImageIndex((index) => (index - 1 + project.images.length) % project.images.length)} aria-label={text.previous}><ArrowLeft size={18} /></button>
              <button className="absolute right-4 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-[#8b5cf6] hover:bg-[#8b5cf6]" type="button" onClick={() => setCurrentImageIndex((index) => (index + 1) % project.images.length)} aria-label={text.next}><ArrowRight size={18} /></button>
              <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                {project.images.map((image, index) => <button className={`h-2 w-2 rounded-full transition ${index === currentImageIndex ? 'bg-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'bg-white/50'}`} key={image} type="button" onClick={() => setCurrentImageIndex(index)} aria-label={`Imagen ${index + 1}`} />)}
              </div>
              <div className="absolute bottom-3 left-1/2 z-20 flex max-w-[80%] -translate-x-1/2 gap-2 overflow-x-auto rounded-xl bg-black/50 p-2">
                {project.images.map((image, index) => <button key={`thumb-${image}`} type="button" onClick={() => setCurrentImageIndex(index)} className={`h-10 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${index === currentImageIndex ? 'border-[#a855f7]' : 'border-transparent opacity-70'}`}><img className="h-full w-full object-cover" src={image} alt="" /></button>)}
              </div>
            </>
          )}
        </div>
        <div className="overflow-y-auto p-6 sm:p-8">
          <span className="project-kicker">{categoryLabel(project.category, text)}</span>
          <h2 id={`project-modal-${project.id}`} className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">{project.title}</h2>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-[#c4b5fd]">{text.vision}</h3>
            <p className="mt-3 text-sm leading-7 text-neutral-300">{project.vision}</p>
            <h3 className="mt-6 text-sm font-bold uppercase tracking-[0.12em] text-[#c4b5fd]">Objetivos</h3>
            <p className="mt-3 text-sm leading-7 text-neutral-300">{project.goals}</p>
            <h3 className="mt-6 text-sm font-bold uppercase tracking-[0.12em] text-[#c4b5fd]">{text.inspiration}</h3>
            <p className="mt-3 text-sm leading-7 text-neutral-300">{project.inspiration}</p>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-[1fr_auto]">
            <div>
              <h3 className="text-sm font-bold text-white">{text.team}</h3>
              <p className="mt-3 text-sm text-neutral-400">{project.team}</p>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{text.technologies}</h3>
              <div className="mt-3"><ProjectTags tags={project.tags} /></div>
            </div>
            <div className="md:max-w-xs">
              <h3 className="text-sm font-bold text-white">{text.architecture}</h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">{project.architecture}</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-end gap-3">
            {hasDemo && <a className="button button-primary" href={project.demoUrl} target="_blank" rel="noreferrer">{text.demo}<ArrowUpRight size={16} /></a>}
            {hasGithub && <a className="button button-outline" href={project.githubUrl} target="_blank" rel="noreferrer"><ProviderIcon provider="github" />{text.github}</a>}
          </div>
        </div>
      </article>
    </div>
  )
}

export default function Projects({ projects: initialProjects = fallbackProjects }) {
  const { language } = useLanguage()
  const text = translations[language] || translations.es
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedProject, setSelectedProject] = useState(null)
  const [catalog, setCatalog] = useState(() => initialProjects.map(normalizeProject))

  useEffect(() => {
    let isMounted = true

    // Función que sincroniza los proyectos silenciosamente
    const fetchLatestProjects = () => {
      fetch(`${projectsApi}/projects?t=${Date.now()}`)
        .then((response) => response.ok ? response.json() : Promise.reject(new Error('Projects API unavailable')))
        .then((items) => {
          if (!isMounted || !Array.isArray(items) || items.length === 0) return
          const normalized = items.map(normalizeProject)
          setCatalog(normalized)

          // Si el usuario tiene el modal de un proyecto abierto, se actualiza también en vivo
          setSelectedProject((current) => {
            if (!current) return null
            const match = normalized.find((p) => p.id === current.id || (p._id && p._id === current._id))
            return match || current
          })
        })
        .catch(() => {})
    }

    // 1. Carga inmediata al entrar
    fetchLatestProjects()

    // 2. Intervalo periódico en segundo plano (cada 8 segundos)
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchLatestProjects()
      }
    }, 8000)

    // 3. Si el usuario cambia de pestaña y regresa, actualiza al instante
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchLatestProjects()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const filteredProjects = useMemo(() => activeCategory === 'Todos'
    ? catalog
    : catalog.filter((project) => project.types.includes(activeCategory)), [activeCategory, catalog])

  return (
    <main className="projects-page">
      <header className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-3xl">
          <span className="eyebrow inline-flex rounded-full border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-4 py-2 text-[#c4b5fd]">{text.badge}</span>
          <h1 className="mt-5 text-white text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">{text.title}</h1>
          <p className="mt-4 max-w-2xl text-neutral-400 leading-relaxed">{text.subtitle}</p>
        </div>
        <div className="px-5 py-3 rounded-2xl bg-[#0d0d14]/90 border border-[#8b5cf6]/40 shadow-[0_0_20px_rgba(139,92,246,0.2)] flex items-center gap-3">
          <span className="text-emerald-400 animate-pulse">●</span>
          <span className="font-mono text-sm text-neutral-200">{catalog.length} {text.published}</span>
        </div>
      </header>

      <section className="w-full max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4 my-8">
          <div className="filter-row flex flex-wrap gap-2">
            {categories.map((category) => (
              <button 
                className={activeCategory === category ? 'filter active' : 'filter'} 
                type="button" 
                key={category} 
                aria-pressed={activeCategory === category} 
                onClick={() => setActiveCategory(category)}
              >
                {categoryLabel(category, text)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            <button className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${viewMode === 'grid' ? 'border border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-white' : 'text-neutral-400 hover:text-white'}`} type="button" onClick={() => setViewMode('grid')} aria-pressed={viewMode === 'grid'}><Grid2X2 size={15} />{text.cards}</button>
            <button className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${viewMode === 'list' ? 'border border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-white' : 'text-neutral-400 hover:text-white'}`} type="button" onClick={() => setViewMode('list')} aria-pressed={viewMode === 'list'}><List size={15} />{text.list}</button>
          </div>
        </div>
        {viewMode === 'grid'
          ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredProjects.map((project) => <ProjectCard key={project.id} project={project} text={text} onSelect={setSelectedProject} />)}</div>
          : <div className="flex w-full flex-col gap-4">{filteredProjects.map((project) => <ProjectListRow key={project.id} project={project} text={text} onSelect={setSelectedProject} />)}</div>}
        {filteredProjects.length === 0 && <div className="glass mt-6 rounded-2xl p-8 text-center text-neutral-400">{text.noResults}</div>}
      </section>
      <ProjectModal key={selectedProject?.id || 'closed'} project={selectedProject} text={text} onClose={() => setSelectedProject(null)} />
    </main>
  )
}