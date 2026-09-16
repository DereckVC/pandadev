import { createContext, useContext, useState } from 'react'

const base = {
  exploreLab: 'Explore the lab', startConversation: 'Start a conversation',
  delivery: 'delivery confidence', thinking: 'systems thinking', uptime: 'continuous uptime', impact: 'measurable impact',
  whatWeDo: 'WHAT WE DO / 01', digitalMatter: 'Digital matter, made useful.',
  productSystems: 'Product systems', interfaceDesign: 'Interface design', creativeTech: 'Creative technology',
  faq: 'FAQ / 02', questions: 'Questions, answered.', contactKicker: 'CONTACT / 03',
  contactTitle: 'Have a signal? Send it.', accept: 'Accept', configure: 'Configure',
  onboardingTitle: 'How would you like us to call you?', onboardingHint: 'Choose a username to complete your profile.',
  save: 'Save', username: 'Username', profileEmail: 'Email', discordTag: 'Discord tag',
  quickActions: 'Quick actions', close: 'Close',
}

const copy = {
  es: {
    ...base, home: 'Inicio', projects: 'Proyectos', about: 'Sobre mí', contact: 'Hablemos',
    login: 'Iniciar sesión', logout: 'Cerrar sesión', catalog: 'Catálogo', explore: 'Explorar proyectos',
    available: 'Disponible para proyectos', unavailable: 'No disponible actualmente', all: 'Todos',
    demo: 'Ver Demo', github: 'Ver Código en GitHub', back: 'Volver al catálogo', loading: 'Cargando proyecto…',
    notFound: 'Proyecto no encontrado', forbiddenTitle: 'Acceso restringido', forbidden: 'No tienes permisos para entrar aquí.',
    footer: 'Software y experiencias digitales con propósito.', heroTitle: 'Software que convierte ideas en experiencias.',
    heroDescription: 'PandaDev es un Software & Creative Lab: construimos productos web, herramientas para Roblox y servidores que funcionan de verdad.',
    exploreLab: 'Explorar proyectos', startConversation: 'Iniciar conversación', cookieText: 'Usamos cookies esenciales para recordar tus preferencias.',
    quantumHero: 'Software que convierte ideas en experiencias.',
    quantumDescription: 'PandaDev es un Software & Creative Lab: web, Roblox, herramientas y servidores.',
    onboardingTitle: '¿Cómo quieres que te llamemos?', onboardingHint: 'Elige un nombre para completar tu perfil.',
    username: 'Nombre', discordTag: 'Tag de Discord', quickActions: 'Acciones rápidas',
  },
  en: {
    ...base, home: 'Home', projects: 'Projects', about: 'About', contact: "Let's talk",
    login: 'Sign in', logout: 'Sign out', catalog: 'Catalog', explore: 'Explore projects',
    available: 'Available for projects', unavailable: 'Currently unavailable', all: 'All',
    demo: 'View Demo', github: 'View Code on GitHub', back: 'Back to catalog', loading: 'Loading project…',
    notFound: 'Project not found', forbiddenTitle: 'Restricted access', forbidden: 'You do not have permission to enter here.',
    footer: 'Software and digital experiences with purpose.', heroTitle: 'Software that turns ideas into experiences.',
    heroDescription: 'PandaDev is a Software & Creative Lab building web products, Roblox tools and reliable servers.',
    cookieText: 'We use essential cookies to remember your preferences.',
    quantumHero: 'Software that turns ideas into experiences.',
    quantumDescription: 'PandaDev is a Software & Creative Lab for web, Roblox, tools and servers.',
  },
}

const LanguageContext = createContext(null)
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(localStorage.getItem('pandadev-language') || 'es')
  const changeLanguage = (next) => { setLanguage(next); localStorage.setItem('pandadev-language', next) }
  return <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t: copy[language] }}>{children}</LanguageContext.Provider>
}
export const useLanguage = () => useContext(LanguageContext)
