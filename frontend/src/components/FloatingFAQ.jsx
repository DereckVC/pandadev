import { useEffect, useRef, useState } from 'react'
import { HelpCircle, X, ChevronDown } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

const faq = {
  es: [['¿Qué stack utilizas?', 'Trabajo principalmente con React, Node.js, Express, MongoDB, Cloudflare y Luau.'], ['¿Qué tipo de proyectos construyes?', 'Herramientas web, APIs, sistemas para comunidades y experiencias interactivas en Roblox.'], ['¿Cómo contacto contigo?', 'Puedes escribir a support@pandadev.me o entrar al servidor de Discord.']],
  en: [['What stack do you use?', 'I mainly work with React, Node.js, Express, MongoDB, Cloudflare and Luau.'], ['What do you build?', 'Web tools, APIs, community systems and interactive Roblox experiences.'], ['How can I contact you?', 'Write to support@pandadev.me or join the Discord server.']],
}

export default function FloatingFAQ() {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(null)
  const panelRef = useRef(null)
  const { language } = useLanguage()

  useEffect(() => {
    if (!open) return undefined
    const handleOutsideClick = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [open])

  return <div ref={panelRef}>
    <button className="faq-float" onClick={() => setOpen((value) => !value)} aria-label="Preguntas frecuentes" aria-expanded={open}>
      {open ? <X size={21} /> : <HelpCircle size={21} />}
    </button>
    {open && <aside className="faq-panel glass">
      <div className="faq-panel-header">
        <div><span className="eyebrow">SUPPORT / FAQ</span><h2>{language === 'es' ? 'Preguntas técnicas' : 'Technical FAQ'}</h2></div>
        <button onClick={() => setOpen(false)} aria-label="Cerrar"><X size={16} /></button>
      </div>
      <div className="faq-list">
        {faq[language].map(([question, answer], index) => <div className={`faq-item ${active === index ? 'active' : ''}`} key={question}>
          <button onClick={() => setActive(active === index ? null : index)}>{question}<ChevronDown size={16} /></button>
          {active === index && <p>{answer}</p>}
        </div>)}
      </div>
    </aside>}
  </div>
}
