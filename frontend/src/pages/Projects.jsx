import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Grid2X2, List, X } from 'lucide-react'
import ProviderIcon from '../components/ProviderIcon'
import { useLanguage } from '../contexts/LanguageContext'

const projects = [
  {
    id: 'pandacraft-tools',
    title: 'PandaCraft Tools',
    category: 'Minecraft Tools',
    types: ['Minecraft Tools', 'Webs'],
    summary: 'Herramientas visuales para diseñar estandartes, personalizar escudos y calcular encantamientos.',
    vision: 'PandaCraft Tools nació para resolver la dispersión de utilidades que los creadores de Minecraft necesitan durante una sesión de construcción. El proyecto reúne edición visual, cálculos y una experiencia rápida en una sola interfaz web, reduciendo pasos repetitivos y haciendo que cada resultado sea fácil de compartir.',
    goals: 'Crear un centro rápido para diseñar, calcular y compartir recursos de Minecraft sin cambiar de herramienta.',
    inspiration: 'La idea surgió al convertir pequeñas utilidades usadas durante sesiones de construcción en una experiencia coherente.',
    team: 'En solitario (Panda158)',
    architecture: 'Frontend interactivo / Canvas y utilidades de cálculo',
    images: [
      'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=1200&q=85',
      'https://images.unsplash.com/photo-1607513746994-51f730a7e2f8?w=1200&q=85',
      'https://images.unsplash.com/photo-1599623560574-39d485900c95?w=1200&q=85',
    ],
    tags: ['React', 'HTML5 Canvas', 'Tailwind CSS', 'Vite'],
    demoUrl: 'https://pandacraft.me',
    githubUrl: 'https://github.com/DereckVC',
    githubVisible: true,
  },
  {
    id: 'roblox-delivery-simulator',
    title: 'Roblox Delivery Simulator',
    category: 'Roblox / Luau',
    types: ['Roblox / Luau', 'Sistemas'],
    summary: 'Simulador logístico con economía persistente, vehículos mejorables y lógica Client-Server.',
    vision: 'Roblox Delivery Simulator explora cómo convertir un bucle de reparto sencillo en una experiencia con progresión. La arquitectura separa la autoridad del servidor, protege las recompensas y mantiene los prompts de proximidad ligeros para que la interacción se sienta inmediata incluso cuando la escena crece.',
    goals: 'Construir una economía persistente y segura con progresión clara para cada jugador.',
    inspiration: 'Nació de experimentar con sistemas de entrega y convertir tareas repetitivas en decisiones jugables.',
    team: 'En solitario (Panda158)',
    architecture: 'Desarrollo Client-Server / Lógica de juego en Luau',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=85',
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=85',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=85',
    ],
    tags: ['Roblox Studio', 'Luau', 'OOP', 'UI Low-Poly'],
    demoUrl: 'https://www.roblox.com/',
    githubUrl: 'https://github.com/DereckVC',
    githubVisible: false,
  },
  {
    id: 'pandadev-core-platform',
    title: 'PandaDev Core & Platform',
    category: 'Webs',
    types: ['Webs', 'Sistemas'],
    summary: 'Plataforma MERN con OAuth federado, RBAC, perfiles, proyectos y métricas operativas.',
    vision: 'PandaDev Core centraliza la identidad visual, el catálogo y las herramientas de administración de una plataforma personal. El objetivo técnico es ofrecer una base segura y mantenible: sesiones protegidas, roles explícitos, datos editables y una interfaz que pueda crecer sin convertir cada nueva sección en una excepción.',
    goals: 'Unificar portfolio, autenticación, administración y analítica en una plataforma extensible.',
    inspiration: 'La plataforma nació de la necesidad de tener un laboratorio real donde cada idea pudiera desplegarse y medirse.',
    team: 'En solitario (Panda158)',
    architecture: 'Arquitectura MERN / OAuth y control de acceso RBAC',
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=85',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=85',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=85',
    ],
    tags: ['Node.js', 'Express', 'MongoDB Atlas', 'React', 'OAuth'],
    demoUrl: 'https://pandadev.me',
    githubUrl: 'https://github.com/DereckVC/pandadev',
    githubVisible: true,
  },
  {
    id: 'community-core-bot',
    title: 'Community Core Bot',
    category: 'Bots',
    types: ['Bots', 'Sistemas'],
    summary: 'Automatización para Discord con eventos, roles dinámicos y métricas persistentes.',
    vision: 'Community Core Bot está pensado como una capa modular para comunidades que necesitan automatización sin perder control. Sus módulos coordinan eventos y roles, integran servicios REST y guardan métricas útiles para entender la actividad del servidor y mejorar la experiencia de sus miembros.',
    goals: 'Automatizar tareas de comunidad manteniendo módulos independientes y observables.',
    inspiration: 'La inspiración llegó de las necesidades diarias de moderación, eventos y soporte en servidores activos.',
    team: 'En solitario (Panda158)',
    architecture: 'Servicios Node.js / Eventos y automatización REST',
    images: [
      'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=1200&q=85',
      'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=1200&q=85',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=85',
    ],
    tags: ['Node.js', 'Discord.js', 'REST API', 'MongoDB'],
    demoUrl: '',
    githubUrl: 'https://github.com/DereckVC',
    githubVisible: true,
  },
]

const categories = ['Todos', 'Webs', 'Sistemas', 'Roblox / Luau', 'Minecraft Tools', 'Bots']

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
  return <div className="tag-list">
    {tags.map((tag) => <span key={tag}>{tag}</span>)}
  </div>
}

function ProjectCard({ project, text, onSelect }) {
  return <article className="project-card project-grid-card" role="button" tabIndex="0" onClick={() => onSelect(project)} onKeyDown={(event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(project)
    }
  }}>
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
}

function ProjectListRow({ project, text, onSelect }) {
  return <article className="project-list-row w-full p-4 rounded-2xl bg-[#0d0d14]/90 border border-white/10 hover:border-[#8b5cf6]/50 transition-all flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer" role="button" tabIndex="0" onClick={() => onSelect(project)} onKeyDown={(event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(project)
    }
  }}>
    <div className="flex w-full min-w-0 items-center gap-4">
      <img className="h-20 w-28 shrink-0 rounded-xl object-cover" src={project.images[0]} alt={`${project.title} thumbnail`} loading="lazy" />
      <div className="min-w-0">
        <span className="project-category-badge project-list-category">{categoryLabel(project.category, text)}</span>
        <h2 className="mt-2 truncate text-lg font-bold text-white">{project.title}</h2>
        <ProjectTags tags={project.tags.slice(0, 3)} />
      </div>
    </div>
    <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-[#8b5cf6] text-white text-xs font-semibold tracking-wide transition-all border border-white/10 hover:border-transparent flex items-center gap-2 shrink-0" type="button" onClick={(event) => {
      event.stopPropagation()
      onSelect(project)
    }}>{text.details} <ArrowUpRight size={15} /></button>
  </article>
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

  const hasDemo = Boolean(project.demoUrl)
  const hasGithub = (project.githubVisible ?? project.showGithubBtn) === true && Boolean(project.githubUrl)

  return <div className="project-overlay fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6" role="presentation" onClick={onClose}>
    <article className="project-modal max-w-5xl w-full bg-[#0d0d14] border border-[#8b5cf6]/40 rounded-3xl overflow-hidden shadow-2xl relative max-h-[92vh] flex flex-col" role="dialog" aria-modal="true" aria-labelledby={`project-modal-${project.id}`} onClick={(event) => event.stopPropagation()}>
      <button className="modal-close z-30 bg-black/70" type="button" onClick={onClose} aria-label={text.close}><X size={20} /></button>
      <button className="absolute left-5 top-5 z-30 rounded-xl border border-white/10 bg-black/60 px-3 py-2 text-xs font-semibold text-white transition hover:border-[#8b5cf6] hover:bg-[#8b5cf6]" type="button" onClick={onClose}>← Volver a Proyectos</button>
      <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-black">
        <img className="h-full w-full object-cover" src={project.images[currentImageIndex]} alt={`${project.title} ${currentImageIndex + 1}`} />
        {project.images.length > 1 && <>
          <button className="absolute left-4 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-[#8b5cf6] hover:bg-[#8b5cf6]" type="button" onClick={() => setCurrentImageIndex((index) => (index - 1 + project.images.length) % project.images.length)} aria-label={text.previous}><ArrowLeft size={18} /></button>
          <button className="absolute right-4 top-1/2 z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/60 text-white transition hover:border-[#8b5cf6] hover:bg-[#8b5cf6]" type="button" onClick={() => setCurrentImageIndex((index) => (index + 1) % project.images.length)} aria-label={text.next}><ArrowRight size={18} /></button>
          <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {project.images.map((image, index) => <button className={`h-2 w-2 rounded-full transition ${index === currentImageIndex ? 'bg-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.8)]' : 'bg-white/50'}`} key={image} type="button" onClick={() => setCurrentImageIndex(index)} aria-label={`Imagen ${index + 1}`} />)}
          </div>
          <div className="absolute bottom-3 left-1/2 z-20 flex max-w-[80%] -translate-x-1/2 gap-2 overflow-x-auto rounded-xl bg-black/50 p-2">
            {project.images.map((image, index) => <button key={`thumb-${image}`} type="button" onClick={() => setCurrentImageIndex(index)} className={`h-10 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${index === currentImageIndex ? 'border-[#a855f7]' : 'border-transparent opacity-70'}`}><img className="h-full w-full object-cover" src={image} alt="" /></button>)}
          </div>
        </>}
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
}

export default function Projects() {
  const { language } = useLanguage()
  const text = translations[language] || translations.es
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [viewMode, setViewMode] = useState('grid')
  const [selectedProject, setSelectedProject] = useState(null)

  const filteredProjects = useMemo(() => activeCategory === 'Todos'
    ? projects
    : projects.filter((project) => project.types.includes(activeCategory)), [activeCategory])

  return <main className="projects-page">
    <header className="w-full max-w-7xl mx-auto px-6 lg:px-12 pt-10 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div className="max-w-3xl">
        <span className="eyebrow inline-flex rounded-full border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-4 py-2 text-[#c4b5fd]">{text.badge}</span>
        <h1 className="mt-5 text-white text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight">{text.title}</h1>
        <p className="mt-4 max-w-2xl text-neutral-400 leading-relaxed">{text.subtitle}</p>
      </div>
      <div className="px-5 py-3 rounded-2xl bg-[#0d0d14]/90 border border-[#8b5cf6]/40 shadow-[0_0_20px_rgba(139,92,246,0.2)] flex items-center gap-3">
        <span className="text-emerald-400 animate-pulse">●</span>
        <span className="font-mono text-sm text-neutral-200">{projects.length} {text.published}</span>
      </div>
    </header>

    <section className="w-full max-w-7xl mx-auto px-6 lg:px-12">
      <div className="flex flex-wrap items-center justify-between gap-4 my-8">
        <div className="filter-row flex flex-wrap gap-2">
          {categories.map((category) => <button className={activeCategory === category ? 'filter active' : 'filter'} type="button" key={category} aria-pressed={activeCategory === category} onClick={() => setActiveCategory(category)}>{categoryLabel(category, text)}</button>)}
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
}
