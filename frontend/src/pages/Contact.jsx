import { useState } from 'react'
import { ArrowUpRight, Check, Copy, Mail, Send } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

// Resuelve dinámicamente la URL oficial del backend con el prefijo /api
const getApiUrl = () => {
  const raw = import.meta.env.VITE_API_URL || '/api'
  return raw.endsWith('/api') ? raw : `${raw.replace(/\/+$/, '')}/api`
}
const CONTACT_API = `${getApiUrl()}/contact`

// Canal oficial único de soporte y contacto
const supportEmail = 'support@pandadev.me'
// Reemplaza este enlace por la invitación permanente a tu servidor de Discord
const discordServerUrl = 'https://discord.gg/pandadev'
const githubProfileUrl = 'https://github.com/DereckVC'

const initialForm = { name: '', email: '', category: 'Desarrollo Web MERN', message: '' }

const content = {
  es: {
    badge: '● CONTACTO & COMISIONES DIRECTAS',
    titleStart: 'Ponte en',
    titleEnd: 'Contacto',
    subtitle: '¿Tienes un proyecto en mente, buscas desarrollo en Roblox Studio o requieres una herramienta web? Conversemos por cualquiera de estos canales.',
    discordTitle: 'Discord Server & DM',
    discordText: 'Consultas técnicas rápidas, comunidad y soporte directo para tus ideas.',
    discordButton: 'Entrar al Servidor',
    githubTitle: 'GitHub Workspace',
    githubText: 'Código abierto, utilidades y proyectos que evolucionan con cada iteración.',
    githubButton: 'Ver repositorios',
    mailTitle: 'Correo Oficial',
    mailStatus: '● CANAL OFICIAL',
    mailText: 'Atención técnica, propuestas de desarrollo y comisiones.',
    sendMail: 'Mandar mensaje',
    copy: 'Copiar',
    copied: '¡Copiado!',
    formTitle: 'Envía un Mensaje Directo',
    formSubtitle: 'Completa los detalles y recibirás confirmación inmediata en tu correo.',
    name: 'Nombre / Organización',
    namePlaceholder: 'Tu nombre o empresa',
    email: 'Tu Correo Electrónico',
    emailPlaceholder: 'tu-correo@dominio.com',
    category: 'Categoría del Proyecto',
    message: 'Mensaje / Especificaciones',
    messagePlaceholder: 'Cuéntame qué quieres construir...',
    categories: ['Desarrollo Web MERN', 'Roblox Studio / Luau', 'Bot / Automatización', 'Consulta General'],
    submit: 'Enviar Mensaje Directo',
    sending: 'Enviando...',
    success: '¡Mensaje recibido! Te hemos enviado un acuse de recibo a tu correo.',
    error: 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
  },
  en: {
    badge: '● DIRECT CONTACT & COMMISSIONS',
    titleStart: 'Get in',
    titleEnd: 'Contact',
    subtitle: 'Have a project in mind, need Roblox Studio development or a web tool? Let’s talk through any of these channels.',
    discordTitle: 'Discord Server & DM',
    discordText: 'Fast technical questions, community and direct support for your ideas.',
    discordButton: 'Join Server',
    githubTitle: 'GitHub Workspace',
    githubText: 'Open source code, utilities and projects evolving with every iteration.',
    githubButton: 'View repositories',
    mailTitle: 'Official Email',
    mailStatus: '● OFFICIAL CHANNEL',
    mailText: 'Technical support, development proposals and commissions.',
    sendMail: 'Send message',
    copy: 'Copy',
    copied: 'Copied!',
    formTitle: 'Send a Direct Message',
    formSubtitle: 'Complete the details and you will receive an immediate confirmation email.',
    name: 'Name / Organization',
    namePlaceholder: 'Your name or company',
    email: 'Your Email',
    emailPlaceholder: 'your-email@domain.com',
    category: 'Project Category',
    message: 'Message / Specifications',
    messagePlaceholder: 'Tell me what you want to build...',
    categories: ['MERN Web Development', 'Roblox Studio / Luau', 'Bot / Automation', 'General Inquiry'],
    submit: 'Send Direct Message',
    sending: 'Sending...',
    success: 'Message received! An automated receipt has been sent to your email.',
    error: 'The message could not be sent. Please try again.',
  },
}

function DiscordIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M19.5 5.2A16.5 16.5 0 0 0 15.55 4l-.5 1a14.2 14.2 0 0 0-6.1 0l-.5-1a16.5 16.5 0 0 0-3.95 1.2C2.1 9.1 1.4 12.9 1.7 16.7a16.2 16.2 0 0 0 4.85 2.45l1.18-1.62a10.3 10.3 0 0 1-1.92-.92l.47-.36a11.7 11.7 0 0 0 11.44 0l.48.36c-.62.37-1.26.68-1.93.92l1.18 1.62a16.2 16.2 0 0 0 4.85-2.45c.35-4.4-.75-8.17-2.8-11.5ZM8.4 14.7c-1.08 0-1.98-1-1.98-2.2s.88-2.2 1.98-2.2c1.1 0 2 1 1.98 2.2 0 1.2-.88 2.2-1.98 2.2Zm7.2 0c-1.08 0-1.98-1-1.98-2.2s.88-2.2 1.98-2.2c1.1 0 2 1 1.98 2.2 0 1.2-.88 2.2-1.98 2.2Z" />
    </svg>
  )
}

function GithubIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 2a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.18-3.37-1.18-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .08 1.53 1.02 1.53 1.02.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.02-2.68-.1-.25-.44-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 7.04c.85 0 1.7.12 2.5.36 1.9-1.29 2.74-1.02 2.74-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.59.69.49A10 10 0 0 0 12 2Z" />
    </svg>
  )
}

export default function Contact() {
  const { language } = useLanguage()
  const text = content[language] || content.es
  const [form, setForm] = useState(initialForm)
  const [copied, setCopied] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })
  const [sending, setSending] = useState(false)

  const copyEmail = async () => {
    await navigator.clipboard.writeText(supportEmail)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2200)
  }

  const updateForm = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
    setStatus({ type: '', message: '' })
  }

  const submit = async (event) => {
    event.preventDefault()
    setSending(true)
    setStatus({ type: '', message: '' })

    try {
      const response = await fetch(CONTACT_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || text.error)
      setForm(initialForm)
      setStatus({ type: 'success', message: text.success })
    } catch (error) {
      setStatus({ type: 'error', message: error.message || text.error })
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="w-full max-w-6xl mx-auto px-6 lg:px-12 py-12">
      <header className="max-w-3xl">
        <span className="inline-flex rounded-full border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-4 py-2 font-mono text-[10px] tracking-[0.14em] text-[#c4b5fd]">{text.badge}</span>
        <h1 className="mt-6 text-5xl font-black tracking-tight text-white sm:text-7xl">
          {text.titleStart} <span className="text-[#a855f7] drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">{text.titleEnd}</span>
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-neutral-300">{text.subtitle}</p>
      </header>

      <section className="my-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14]/90 shadow-xl transition hover:-translate-y-1 hover:border-[#5865F2]/60">
          <div className="flex h-28 items-end justify-between bg-gradient-to-r from-[#5865F2]/40 to-[#4752C4]/20 p-4 text-[#c7cbff]">
            <DiscordIcon />
            <span className="rounded-full border border-[#86efac]/30 bg-black/20 px-2 py-1 text-[10px] text-emerald-300">● ONLINE</span>
          </div>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white">{text.discordTitle}</h2>
            <p className="mt-3 min-h-[48px] text-sm leading-relaxed text-neutral-400">{text.discordText}</p>
            <a className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#4752C4]" href={discordServerUrl} target="_blank" rel="noreferrer">
              <DiscordIcon />{text.discordButton}<ArrowUpRight size={16} />
            </a>
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14]/90 shadow-xl transition hover:-translate-y-1 hover:border-white/30">
          <div className="relative flex h-28 items-end bg-[#111118] p-4 text-white">
            <GithubIcon />
            <img className="absolute bottom-[-24px] right-5 h-12 w-12 rounded-full border-2 border-white/20" src="https://github.com/DereckVC.png?size=96" alt="DereckVC" />
          </div>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white">{text.githubTitle}</h2>
            <p className="mt-3 min-h-[48px] text-sm leading-relaxed text-neutral-400">{text.githubText}</p>
            <a className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/20" href={githubProfileUrl} target="_blank" rel="noreferrer">
              <GithubIcon />{text.githubButton}<ArrowUpRight size={16} />
            </a>
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d14]/90 shadow-xl transition hover:-translate-y-1 hover:border-[#a855f7]/60">
          <div className="flex h-28 items-end justify-between bg-gradient-to-r from-[#8b5cf6]/30 to-[#a855f7]/10 p-4 text-[#d8b4fe]">
            <Mail size={26} />
            <span className="rounded-full border border-[#a855f7]/40 bg-black/20 px-2 py-1 text-[10px] text-[#d8b4fe]">{text.mailStatus}</span>
          </div>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white">{text.mailTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-400">{text.mailText}</p>
            <strong className="mt-4 block truncate text-sm text-neutral-200">{supportEmail}</strong>
            <div className="mt-5 flex gap-2">
              <a className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-3 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#7c3aed]" href={`mailto:${supportEmail}`}>
                <Send size={16} />{text.sendMail}
              </a>
              <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-neutral-300 transition hover:border-[#8b5cf6] hover:text-white" type="button" onClick={copyEmail}>
                {copied ? <Check className="text-emerald-400" size={16} /> : <Copy size={16} />}{copied ? text.copied : text.copy}
              </button>
            </div>
          </div>
        </article>
      </section>

      <form className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-[#0d0d14]/90 p-8 shadow-2xl" onSubmit={submit}>
        <h2 className="text-2xl font-bold text-white sm:text-3xl">{text.formTitle}</h2>
        <p className="mt-2 text-sm text-neutral-400">{text.formSubtitle}</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <label className="grid gap-2 text-sm text-neutral-300">
            {text.name}
            <input className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]" name="name" value={form.name} onChange={updateForm} placeholder={text.namePlaceholder} required />
          </label>
          <label className="grid gap-2 text-sm text-neutral-300">
            {text.email}
            <input className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]" name="email" value={form.email} onChange={updateForm} placeholder={text.emailPlaceholder} type="email" required />
          </label>
        </div>

        <label className="mt-5 grid gap-2 text-sm text-neutral-300">
          {text.category}
          <select className="rounded-xl border border-white/10 bg-[#111118] px-4 py-3 text-white outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]" name="category" value={form.category} onChange={updateForm}>
            {text.categories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>

        <label className="mt-5 grid gap-2 text-sm text-neutral-300">
          {text.message}
          <textarea className="min-h-36 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]" name="message" value={form.message} onChange={updateForm} placeholder={text.messagePlaceholder} rows="5" required minLength="10" />
        </label>

        <button className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#8b5cf6] px-5 py-3 font-bold text-white shadow-[0_0_24px_rgba(139,92,246,0.3)] transition hover:-translate-y-0.5 hover:bg-[#7c3aed] disabled:cursor-wait disabled:opacity-70" type="submit" disabled={sending}>
          {sending ? text.sending : text.submit}
          <Send size={17} />
        </button>

        {status.message && (
          <p className={`mt-5 rounded-xl border px-4 py-3 text-sm ${status.type === 'success' ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' : 'border-red-400/30 bg-red-400/10 text-red-300'}`}>
            {status.message}
          </p>
        )}
      </form>
    </main>
  )
}