import { LogOut, Menu, ShieldCheck, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const menuRef = useRef(null)
  const { user, logout } = useAuth()
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    if (!userOpen) return undefined
    const handleOutsideClick = (event) => {
      if (!menuRef.current?.contains(event.target)) setUserOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [userOpen])

  return <header className="app-navbar">
    <Link className="brand" to="/"><span className="brand-mark">P</span><span className="brand-name"><span className="brand-panda">Panda</span><span className="brand-dev">Dev</span></span></Link>
    <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)} aria-label="Menu">{open ? <X /> : <Menu />}</button>
    <nav className={`nav-links ${open ? 'open' : ''}`}>
      {[['/', t.home], ['/proyectos', t.projects], ['/sobre-mi', t.about], ['/contacto', language === 'es' ? 'Contacto' : 'Contact']].map(([path, label]) => <NavLink key={path} to={path} end={path === '/'} onClick={() => setOpen(false)}>{label}</NavLink>)}
      <div className="nav-actions">
        {user ? <div className="relative" ref={menuRef}>
          <button className="user-menu-trigger" type="button" onClick={() => setUserOpen((value) => !value)} aria-expanded={userOpen}>
            <div className="flex h-10 w-10 select-none items-center justify-center overflow-hidden rounded-full border-2 border-white/20 bg-gradient-to-tr from-[#8b5cf6] to-[#a855f7] text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.35)]">
              {(user?.name || user?.username || 'U').trim().charAt(0).toUpperCase()}
            </div>
          </button>
          {userOpen && <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-72 rounded-2xl border border-white/10 bg-[#0d0d14] p-3 shadow-2xl backdrop-blur-xl">
            <div className="border-b border-white/10 px-3 pb-3">
              <strong className="block text-white font-bold">{user.name || 'PandaDev User'}</strong>
              <span className="block truncate text-neutral-400 text-xs">{user.email}</span>
              <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider ${user.role === 'admin' ? 'bg-[#8b5cf6]/20 text-[#c4b5fd]' : 'bg-white/10 text-neutral-300'}`}>{user.role === 'admin' ? '⚡ ADMIN' : 'USUARIO'}</span>
            </div>
            <div className="py-2">
              <Link className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-neutral-200 transition-all hover:bg-white/10 hover:text-white" to="/perfil" onClick={() => setUserOpen(false)}><UserRound size={16} />Mi Perfil &amp; Ajustes</Link>
              {user.role === 'admin' && <Link className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-neutral-200 transition-all hover:bg-white/10 hover:text-white" to="/admin" onClick={() => setUserOpen(false)}><ShieldCheck size={16} />Panel Administrador</Link>}
            </div>
            <div className="border-t border-white/10 pt-2">
              <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-red-300 transition-all hover:bg-red-500/10 hover:text-red-200" type="button" onClick={() => { setUserOpen(false); logout() }}><LogOut size={16} />{t.logout}</button>
            </div>
          </div>}
        </div> : <Link className="nav-pill" to="/login">{t.login}</Link>}
        <button className="language-toggle" type="button" onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}>{language.toUpperCase()}</button>
      </div>
    </nav>
  </header>
}
