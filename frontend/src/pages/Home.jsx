import { useMemo } from 'react'
import { ArrowUpRight, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

const tools = [
  ['HTML5', 'html'],
  ['CSS3', 'css'],
  ['JavaScript', 'js'],
  ['TypeScript', 'ts'],
  ['React', 'react'],
  ['Node.js', 'nodejs'],
  ['Express', 'express'],
  ['MongoDB', 'mongodb'],
  ['Python', 'python'],
  ['Java', 'java'],
  ['Discord', 'discord'],
  ['Git', 'git'],
  ['Cloudflare', 'cloudflare'],
  ['VS Code', 'vscode'],
  ['Figma', 'figma'],
]

const copy = {
  es: {
    badge: '● PORTFOLIO · DISPONIBLE PARA PROYECTOS',
    subtitle: 'Full-Stack Developer & Game Systems Creator con 1 año de experiencia construyendo herramientas web modernas, entornos interactivos en Roblox Studio (Luau) y utilidades de software.',
    projects: 'Ver Proyectos',
    contact: 'Hablemos',
    toolsTitle: 'Herramientas para construir sin límites',
    toolsSubtitle: 'Tecnologías y herramientas que integro en mis proyectos.',
    robloxBadge: 'ROBLOX STUDIO / LUAU',
    robloxTitle: 'Game Systems Lab',
    online: '● ONLINE',
    minecraftBadge: 'PANDACRAFT TOOLS',
    minecraftTitle: 'Web Utilities Suite',
    web: 'WEB',
    canvas: 'CANVAS',
  },
  en: {
    badge: '● PORTFOLIO · AVAILABLE FOR PROJECTS',
    subtitle: 'Full-Stack Developer & Game Systems Creator with one year of experience building modern web tools, interactive Roblox Studio (Luau) environments and software utilities.',
    projects: 'View Projects',
    contact: "Let's talk",
    toolsTitle: 'Tools for building without limits',
    toolsSubtitle: 'Technologies and tools I integrate into my projects.',
    robloxBadge: 'ROBLOX STUDIO / LUAU',
    robloxTitle: 'Game Systems Lab',
    online: '● ONLINE',
    minecraftBadge: 'PANDACRAFT TOOLS',
    minecraftTitle: 'Web Utilities Suite',
    web: 'WEB',
    canvas: 'CANVAS',
  },
}

function ToolChip({ name, icon }) {
  return <span className="stack-chip home-tool-chip">
    <img src={`https://skillicons.dev/icons?i=${icon}`} alt={`${name} icon`} loading="lazy" />
    <span>{name}</span>
  </span>
}

function ShowcaseCard({ type, labels }) {
  const isRoblox = type === 'roblox'
  const image = isRoblox
    ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80'
    : 'https://images.unsplash.com/photo-1627856013091-fed6e4e30025?w=600&q=80'

  return <article className={isRoblox
    ? 'visual-card visual-card-main home-showcase-roblox relative z-10 rounded-2xl p-5 border border-[#8b5cf6]/40 bg-[#0d0d14]/90 shadow-[0_0_30px_rgba(139,92,246,0.25)]'
    : 'visual-card visual-card-small absolute -bottom-6 -left-6 w-72 z-20 rounded-2xl p-4 border border-[#8b5cf6]/30 bg-[#0d0d14]/95 shadow-2xl'}>
    <img className="home-showcase-image" src={image} alt="" loading="lazy" />
    <div className="home-showcase-shade" />
    <div className="visual-card-content home-showcase-content">
      <span className="home-showcase-badge">{isRoblox ? labels.robloxBadge : labels.minecraftBadge}</span>
      <strong>{isRoblox ? labels.robloxTitle : labels.minecraftTitle}</strong>
      {isRoblox
        ? <div className="home-showcase-status"><span className="home-online-dot" style={{ color: '#06b6d4' }} /> <b style={{ color: '#06b6d4' }}>{labels.online}</b></div>
        : <div className="visual-badges"><b>{labels.web}</b><b>{labels.canvas}</b></div>}
    </div>
  </article>
}

function Home() {
  const { language } = useLanguage()
  const labels = copy[language] || copy.es
  const duplicatedTools = useMemo(() => [...tools, ...tools], [])

  return <main className="home-vfx home-page">
    <section className="hero home-hero home-hero-grid w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 min-h-[80vh] grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
      <div className="hero-copy home-hero-copy lg:col-span-7 flex flex-col justify-center items-start text-left">
        <span className="eyebrow hero-badge home-availability-badge mb-4">{labels.badge}</span>
        <h1 className="home-title text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight select-none pr-8 overflow-visible mb-5">
          <span className="hero-panda text-white font-black">Panda</span>
          <span className="hero-dev text-[#a855f7] font-black drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">Dev</span>
        </h1>
        <p className="home-hero-subtitle max-w-xl text-neutral-300 leading-relaxed mb-8">{labels.subtitle}</p>
        <div className="hero-actions flex items-center gap-4 flex-wrap">
          <Link className="button button-primary home-primary-action" to="/proyectos">
            {labels.projects}
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
          <Link className="button button-outline home-secondary-action" to="/contacto">
            {labels.contact}
            <ChevronRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="hero-visual home-showcase hidden lg:block lg:col-span-5 flex items-center justify-end relative w-full max-w-[420px] ml-auto h-[400px]">
        <ShowcaseCard type="roblox" labels={labels} />
        <ShowcaseCard type="minecraft" labels={labels} />
      </div>
    </section>

    <section className="stack-section home-tools-section">
      <div className="home-section-heading section-wrap">
        <div>
          <h2>{labels.toolsTitle}</h2>
          <p className="stack-subtitle">{labels.toolsSubtitle}</p>
        </div>
      </div>
      <div className="stack-marquee w-full relative overflow-hidden py-10">
        <div className="stack-track home-tools-track">
          {duplicatedTools.map(([name, icon], index) => <ToolChip key={`${name}-${index}`} name={name} icon={icon} />)}
        </div>
      </div>
    </section>
  </main>
}

export default Home
