import { useState } from 'react'
import { Activity, ArrowUpRight, Check, Code2, Flame, GitBranch, Mail, Send, TrendingUp } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

// Correo oficial único de soporte y contacto
const supportEmail = 'support@pandadev.me'
const discordServerUrl = 'https://discord.gg/pandadev'
const githubProfileUrl = 'https://github.com/DereckVC'

const knownTechnologies = [
  ['Python', 'python'],
  ['HTML5', 'html'],
  ['CSS3', 'css'],
  ['JavaScript', 'js'],
  ['TypeScript', 'ts'],
  ['Git', 'git'],
  ['GitHub', 'github'],
  ['VS Code', 'vscode'],
  ['Cloudflare', 'cloudflare'],
  ['Discord', 'discord'],
  ['Figma', 'figma'],
  ['Luau / Roblox', 'lua'],
]

const learningTechnologies = [
  ['C', 'c'],
  ['C++', 'cpp'],
  ['C#', 'cs'],
  ['PHP', 'php'],
  ['Flutter', 'flutter'],
  ['.NET', 'dotnet'],
  ['Node.js', 'nodejs'],
  ['Docker', 'docker'],
  ['Firebase', 'firebase'],
  ['Unity', 'unity'],
]

const languages = [
  ['Luau', 34, '#8b5cf6'],
  ['Python', 24, '#3b82f6'],
  ['JavaScript', 22, '#eab308'],
  ['HTML', 12, '#f97316'],
  ['CSS', 8, '#06b6d4'],
]

const dictionary = {
  es: {
    badge: '● PERFIL TÉCNICO · PANDADEV ECOSYSTEM',
    hello: 'Hola 👋 soy',
    bio: 'Estudiante de desarrollo de sistemas enfocado en crear software y experiencias interactivas. Apasionado por transformar lógica compleja en productos web y entornos virtuales funcionales.',
    copy: 'Copiar Correo',
    copied: '¡Copiado!',
    github: 'Perfil de GitHub',
    discord: 'Servidor de Discord',
    known: 'Tecnologías Conocidas & Dominadas',
    knownText: 'Herramientas que utilizo para diseñar, desarrollar y publicar productos digitales.',
    exploring: 'Tecnologías por Conocer / En Exploración',
    exploringText: 'Nuevas áreas que estoy incorporando a mi mapa técnico.',
    metrics: 'Métricas & Entorno de Desarrollo',
    contributions: 'Contribuciones anuales',
    streak: 'Racha activa',
    completed: 'Proyectos completados',
    languages: 'Lenguajes Más Usados',
    status: '● DISPONIBLE PARA PROYECTOS Y COMISIONES',
    response: 'Respuesta en 24-48h',
  },
  en: {
    badge: '● TECHNICAL PROFILE · PANDADEV ECOSYSTEM',
    hello: 'Hello 👋 I am',
    bio: 'Systems development student focused on creating software and interactive experiences. Passionate about turning complex logic into functional web products and virtual environments.',
    copy: 'Copy Email',
    copied: 'Copied!',
    github: 'GitHub Profile',
    discord: 'Discord Server',
    known: 'Known & Practiced Technologies',
    knownText: 'Tools I use to design, build and publish digital products.',
    exploring: 'Technologies to Learn / Exploring',
    exploringText: 'New areas I am gradually adding to my technical map.',
    metrics: 'Metrics & Development Environment',
    contributions: 'Annual contributions',
    streak: 'Active streak',
    completed: 'Completed projects',
    languages: 'Most Used Languages',
    status: '● AVAILABLE FOR PROJECTS AND COMMISSIONS',
    response: 'Response in 24-48h',
  },
}

function GithubIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .08 1.53 1.02 1.53 1.02.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.02-2.68-.1-.25-.44-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 7.04c.85 0 1.7.12 2.5.36 1.9-1.29 2.74-1.02 2.74-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.59.69.49A10 10 0 0 0 12 2Z" />
    </svg>
  )
}

function DiscordIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19.5 5.2A16.5 16.5 0 0 0 15.55 4l-.5 1a14.2 14.2 0 0 0-6.1 0l-.5-1a16.5 16.5 0 0 0-3.95 1.2C2.1 9.1 1.4 12.9 1.7 16.7a16.2 16.2 0 0 0 4.85 2.45l1.18-1.62a10.3 10.3 0 0 1-1.92-.92l.47-.36a11.7 11.7 0 0 0 11.44 0l.48.36c-.62.37-1.26.68-1.93.92l1.18 1.62a16.2 16.2 0 0 0 4.85-2.45c.35-4.4-.75-8.17-2.8-11.5ZM8.4 14.7c-1.08 0-1.98-1-1.98-2.2s.88-2.2 1.98-2.2c1.1 0 2 1 1.98 2.2 0 1.2-.88 2.2-1.98 2.2Zm7.2 0c-1.08 0-1.98-1-1.98-2.2s.88-2.2 1.98-2.2c1.1 0 2 1 1.98 2.2 0 1.2-.88 2.2-1.98 2.2Z" />
    </svg>
  )
}

function TechnologyCard({ title, description, items, muted = false }) {
  return (
    <section className={`rounded-2xl bg-[#0d0d14]/90 border border-white/10 backdrop-blur-xl p-6 transition-all hover:border-[#8b5cf6]/40 ${muted ? 'opacity-90' : ''}`}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-neutral-400">{description}</p>
        </div>
        <span className="hidden sm:block w-2 h-2 mt-2 rounded-full bg-[#a855f7] shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {items.map(([name, icon]) => (
          <div className="group flex flex-col items-center justify-center gap-2 min-h-[84px] rounded-xl border border-white/10 bg-white/[0.03] px-2 py-3 text-center transition-all hover:-translate-y-1 hover:border-[#8b5cf6]/50 hover:bg-[#8b5cf6]/10" key={name}>
            <img className="w-8 h-8 transition-transform group-hover:scale-110" src={`https://skillicons.dev/icons?i=${icon}`} alt={`${name} icon`} loading="lazy" />
            <span className="text-[11px] leading-tight text-neutral-300 group-hover:text-white">{name}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function MetricCard({ icon, value, label, accent }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-all hover:-translate-y-1 hover:border-[#8b5cf6]/50 hover:bg-white/[0.05]">
      <div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ${accent}`}>{icon}</div>
      <strong className="block text-3xl font-black tracking-tight text-white">{value}</strong>
      <span className="mt-1 block text-xs text-neutral-400">{label}</span>
    </article>
  )
}

function LanguageBar({ name, percentage, color }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 text-neutral-300">
          <i className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          {name}
        </span>
        <strong className="font-mono text-xs text-neutral-400">{percentage}%</strong>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <span className="block h-full rounded-full transition-all duration-700" style={{ width: `${percentage}%`, backgroundColor: color, boxShadow: `0 0 12px ${color}` }} />
      </div>
    </div>
  )
}

export default function About() {
  const { language } = useLanguage()
  const labels = dictionary[language] || dictionary.es
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    if (!navigator.clipboard) {
      window.location.href = `mailto:${supportEmail}`
      return
    }
    await navigator.clipboard.writeText(supportEmail)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2200)
  }

  return (
    <main className="w-full max-w-6xl mx-auto px-6 lg:px-12 py-10">
      <header className="max-w-4xl">
        <span className="inline-flex items-center rounded-full border border-[#8b5cf6]/40 bg-[#8b5cf6]/[0.08] px-4 py-2 font-mono text-[10px] tracking-[0.14em] text-[#c4b5fd]">
          {labels.badge}
        </span>
        <h1 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
          {labels.hello}{' '}
          <span className="text-[#a855f7] drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">Panda158</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-neutral-300 sm:text-lg">{labels.bio}</p>
      </header>

      <nav className="my-8 flex flex-wrap items-center gap-4" aria-label="Contacto rápido">
        <button className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-[#8b5cf6] hover:bg-white/10" type="button" onClick={copyEmail}>
          {copied ? <Check className="text-emerald-400" size={17} /> : <Mail size={17} />}
          {copied ? labels.copied : labels.copy}
        </button>
        <a className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition-all hover:-translate-y-0.5 hover:border-[#8b5cf6] hover:bg-white/10" href={githubProfileUrl} target="_blank" rel="noreferrer">
          <GithubIcon size={18} />
          {labels.github}
          <ArrowUpRight size={16} />
        </a>
        <a className="flex items-center gap-2.5 rounded-xl border border-[#5865F2]/40 bg-[#5865F2]/15 px-5 py-2.5 text-sm font-medium text-[#c7cbff] transition-all hover:-translate-y-0.5 hover:border-[#5865F2] hover:bg-[#5865F2]/25" href={discordServerUrl} target="_blank" rel="noreferrer">
          <DiscordIcon size={18} />
          {labels.discord}
          <ArrowUpRight size={16} />
        </a>
      </nav>

      <div className="space-y-8 mb-12">
        <TechnologyCard title={labels.known} description={labels.knownText} items={knownTechnologies} />
        <TechnologyCard title={labels.exploring} description={labels.exploringText} items={learningTechnologies} muted />
      </div>

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{labels.metrics}</h2>
          <TrendingUp className="text-[#a855f7]" size={24} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard icon={<Activity size={19} />} value="184+" label={labels.contributions} accent="text-[#8b5cf6]" />
          <MetricCard icon={<Flame size={19} />} value="42 días" label={labels.streak} accent="text-orange-400" />
          <MetricCard icon={<Code2 size={19} />} value="10+" label={labels.completed} accent="text-[#06b6d4]" />
        </div>
        <div className="rounded-2xl bg-[#0d0d14]/90 border border-white/10 p-6 backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-white">{labels.languages}</h3>
            <GitBranch className="text-neutral-500" size={19} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {languages.map(([name, percentage, color]) => (
              <LanguageBar key={name} name={name} percentage={percentage} color={color} />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-5 py-3 text-sm text-emerald-300 sm:flex-row sm:items-center sm:justify-between">
          <strong className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.9)]" />
            {labels.status}
          </strong>
          <span className="text-emerald-300/70">{labels.response}</span>
        </div>
      </section>
    </main>
  )
}