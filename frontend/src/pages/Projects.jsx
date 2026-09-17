import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Grid2X2, List, X, Layers, Users, Cpu } from 'lucide-react'
import ProviderIcon from '../components/ProviderIcon'
import { useLanguage } from '../contexts/LanguageContext'

const categories = ['Todos', 'Web', 'Sistemas', 'Roblox / Luau', 'Minecraft Tools', 'Bots', 'Otros']

const projectsApi = (() => {
  const raw = import.meta.env.VITE_API_URL || '/api'
  return raw.endsWith('/api') ? raw : `${raw.replace(/\/+$/, '')}/api`
})()

const normalizeProject = (item) => {
  const shortDesc = typeof item.shortDesc === 'object' 
    ? (item.shortDesc.es || item.shortDesc.en || '') 
    : (item.shortDesc || item.description || '')
  
  const longDesc = typeof item.longDesc === 'object' 
    ? (item.longDesc.es || item.longDesc.en || '') 
    : (item.longDesc || item.vision || shortDesc)

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
    category: item.category || 'Web',
    types: item.types?.length ? item.types : [item.category || 'Web'],
    summary: shortDesc || 'Sin descripción resumida disponible.',
    vision: item.vision || longDesc || 'Sin visión detallada registrada.',
    goals: item.goals || 'Desarrollo, despliegue y mantenimiento continuo.',
    inspiration: item.inspiration || 'Optimización de flujos y herramientas para la comunidad.',
    team: item.team || 'DereckVC (Panda158)',
    architecture: item.architecture || `${item.category || 'Web'} / Full-Stack`,
    images: imageList,
    tags: Array.isArray(item.tags) 
      ? item.tags 
      : (typeof item.tags === 'string' ? item.tags.split(',').map((t) => t.trim()).filter(Boolean) : []),
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
    list: 'Lista',
    cards: 'Tarjetas',
    vision: 'Visión & Propósito',
    goals: 'Objetivos',
    inspiration: 'Inspiración',
    team: 'Equipo',
    architecture: 'Arquitectura / Rol',
    technologies: 'Tecnologías',
    demo: 'Ver proyecto',
    github: 'Ver repositorio en GitHub',
    close: 'Cerrar proyecto',
    previous: 'Imagen anterior',
    next: 'Imagen siguiente',
    noResults: 'No hay proyectos disponibles en esta categoría.',
  },
  en: {
    badge: '● PORTFOLIO · SELECTED PROJECTS',
    title: 'My Projects',
    subtitle: 'Interactive systems, web tools and architectures designed with a focus on performance and usability.',
    published: 'Published Projects',
    details: 'View details',
    all: 'All',
    list: 'List',
    cards: 'Cards',
    vision: 'Vision & Purpose',
    goals: 'Goals',
    inspiration: 'Inspiration',
    team: 'Team',
    architecture: 'Architecture / Role',
    technologies: 'Technologies',
    demo: 'View project',
    github: 'View repository on GitHub',
    close: 'Close project',
    previous: 'Previous image',
    next: 'Next image',
    noResults: 'There are no projects available in this category.',
  },
}

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
        <span className="project-category-badge">{project.category}</span>
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
          <span className="project-category-badge project-list-category">{project.category}</span>
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

  const hasDemo = Boolean(project.showDemoBtn) && Boolean(project.demoUrl)
  const hasGithub = Boolean(project.showGithubBtn) && Boolean(project.githubUrl)

  return (
    <div 
      className="fixed inset-0 z-[70] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-y-auto"
      role="presentation" 
      onClick={onClose}
    >
      <article 
        className="relative w-full max-w-5xl xl:max-w-6xl my-auto max-h-[88vh] bg-[#0d0d14] border border-[#8b5cf6]/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        role="dialog" 
        aria-modal="true" 
        onClick={(event) => event.stopPropagation()}
      >
        {/* Cabecera Flotante con Botones de Cierre */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
          <button 
            className="pointer-events-auto rounded-xl border border-white/10 bg-black/70 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white transition hover:border-[#8b5cf6] hover:bg-[#8b5cf6]" 
            type="button" 
            onClick={onClose}
          >
            ← Volver a Proyectos
          </button>
          <button 
            className="pointer-events-auto grid h-9 w-9 place-items-center rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-neutral-300 hover:text-white hover:bg-white/10 transition" 
            type="button" 
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Banner Horizontal Compacto */}
        <div className="relative h-44 sm:h-56 md:h-64 lg:h-72 w-full overflow-hidden bg-black shrink-0">
          <img className="h-full w-full object-cover" src={project.images[currentImageIndex]} alt={`${project.title} ${currentImageIndex + 1}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14] via-transparent to-black/40" />

          {project.images.length > 1 && (
            <>
              <button className="absolute left-4 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white transition hover:bg-[#8b5cf6]" type="button" onClick={() => setCurrentImageIndex((index) => (index - 1 + project.images.length) % project.images.length)}>
                <ArrowLeft size={16} />
              </button>
              <button className="absolute right-4 top-1/2 z-20 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white transition hover:bg-[#8b5cf6]" type="button" onClick={() => setCurrentImageIndex((index) => (index + 1) % project.images.length)}>
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>

        {/* Contenido en 2 Columnas Horizontales */}
        <div className="overflow-y-auto p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-[#8b5cf6]/15 text-[#c4b5fd] border border-[#8b5cf6]/30">
              {project.category}
            </span>
          </div>

          <h2 className="mt-2.5 text-2xl sm:text-4xl font-black tracking-tight text-white">{project.title}</h2>
          <div className="mt-3"><ProjectTags tags={project.tags} /></div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Columna Izquierda: Visión, Objetivos, Inspiración */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#c4b5fd] flex items-center gap-2">
                  <Layers size={15} /> {text.vision}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-neutral-300 whitespace-pre-wrap">{project.vision}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#c4b5fd]">{text.goals}</h3>
                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-neutral-300 whitespace-pre-wrap">{project.goals}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-[#c4b5fd]">{text.inspiration}</h3>
                  <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-neutral-300 whitespace-pre-wrap">{project.inspiration}</p>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Equipo, Arquitectura y Enlaces */}
            <div className="lg:col-span-5 space-y-5">
              <div className="rounded-2xl border border-white/10 bg-[#111118]/80 p-5 space-y-4">
                <div>
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users size={13} /> {text.team}
                  </span>
                  <p className="mt-1 text-sm font-semibold text-white">{project.team}</p>
                </div>

                <div className="pt-2 border-t border-white/5">
                  <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu size={13} /> {text.architecture}
                  </span>
                  <p className="mt-1 text-sm text-neutral-300 leading-relaxed">{project.architecture}</p>
                </div>
              </div>

              {(hasDemo || hasGithub) && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {hasDemo && (
                    <a className="button button-primary flex-1 justify-center py-3 text-sm font-semibold" href={project.demoUrl} target="_blank" rel="noreferrer">
                      {text.demo} <ArrowUpRight size={16} />
                    </a>
                  )}
                  {hasGithub && (
                    <a className="button button-outline flex-1 justify-center py-3 text-sm font-semibold" href={project.githubUrl} target="_blank" rel="noreferrer">
                      <ProviderIcon provider="github" /> {text.github}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}

export default function Projects() {
  const { language } = useLanguage()
  const text = translations[language] || translations.es
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedProject, setSelectedProject] = useState(null)
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const fetchLatestProjects = () => {
      fetch(`${projectsApi}/projects?t=${Date.now()}`)
        .then((response) => (response.ok ? response.json() : []))
        .then((items) => {
          if (!isMounted || !Array.isArray(items)) return
          const normalized = items.map(normalizeProject)
          setCatalog(normalized)
          setLoading(false)

          setSelectedProject((current) => {
            if (!current) return null
            const match = normalized.find((p) => p.id === current.id || (p._id && p._id === current._id))
            return match || null
          })
        })
        .catch(() => {
          if (isMounted) setLoading(false)
        })
    }

    fetchLatestProjects()
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') fetchLatestProjects()
    }, 5000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchLatestProjects()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      isMounted = false
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const filteredProjects = useMemo(() => {
    return activeCategory === 'Todos'
      ? catalog
      : catalog.filter((project) => project.types.includes(activeCategory) || project.category === activeCategory)
  }, [activeCategory, catalog])

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
                {category}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-1">
            <button className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${viewMode === 'grid' ? 'border border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-white' : 'text-neutral-400 hover:text-white'}`} type="button" onClick={() => setViewMode('grid')} aria-pressed={viewMode === 'grid'}><Grid2X2 size={15} />{text.cards}</button>
            <button className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${viewMode === 'list' ? 'border border-[#8b5cf6]/60 bg-[#8b5cf6]/20 text-white' : 'text-neutral-400 hover:text-white'}`} type="button" onClick={() => setViewMode('list')} aria-pressed={viewMode === 'list'}><List size={15} />{text.list}</button>
          </div>
        </div>

        {loading ? (
          <div className="glass mt-6 rounded-2xl p-12 text-center text-neutral-400">
            <div className="h-6 w-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Cargando proyectos en tiempo real...
          </div>
        ) : filteredProjects.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} text={text} onSelect={setSelectedProject} />
              ))}
            </div>
          ) : (
            <div className="flex w-full flex-col gap-4">
              {filteredProjects.map((project) => (
                <ProjectListRow key={project.id} project={project} text={text} onSelect={setSelectedProject} />
              ))}
            </div>
          )
        ) : (
          <div className="glass mt-6 rounded-2xl p-12 text-center text-neutral-400">
            {text.noResults}
          </div>
        )}
      </section>

      <ProjectModal key={selectedProject?.id || 'closed'} project={selectedProject} text={text} onClose={() => setSelectedProject(null)} />
    </main>
  )
}