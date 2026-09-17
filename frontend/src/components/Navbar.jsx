import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronRight, Globe, Menu, Shield, User, X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { language, toggleLanguage, t } = useLanguage()
  const { user } = useAuth()
  const location = useLocation()

  // Cierra el menú al navegar a otra página
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Bloquea el scroll del fondo cuando el menú móvil está abierto
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [menuOpen])

  const navLinks = [
    { to: '/', label: t.home || 'Inicio' },
    { to: '/proyectos', label: t.projects || 'Proyectos' },
    { to: '/sobre-mi', label: t.about || 'Sobre mí' },
    { to: '/contacto', label: t.contact || 'Contacto' },
  ]

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#07070a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12">
          {/* Logo PandaDev */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="relative grid h-9 w-9 place-items-center rounded-xl border border-[#8b5cf6]/60 bg-[#0d0d14] shadow-[0_0_12px_rgba(139,92,246,0.35)] transition group-hover:scale-105">
              <span className="font-black text-sm text-[#c4b5fd]">P</span>
            </div>
            <span className="text-lg font-black tracking-tight text-white">
              Panda<span className="text-[#a855f7]">Dev</span>
            </span>
          </Link>

          {/* Enlaces en Pantallas Grandes (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/10 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Acciones de Desktop (Usuario / Idioma) */}
          <div className="hidden md:flex items-center gap-3">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 text-xs font-semibold text-[#d8b4fe] hover:bg-[#8b5cf6]/20 transition"
              >
                <Shield size={14} /> Admin
              </Link>
            )}

            {user ? (
              <Link
                to="/perfil"
                className="grid h-9 w-9 place-items-center rounded-full bg-[#8b5cf6] text-white font-bold text-sm shadow-md hover:scale-105 transition"
                title={user.name || user.email}
              >
                {(user.name || user.email || 'U')[0].toUpperCase()}
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl border border-white/15 bg-white/5 text-xs font-semibold text-white hover:border-[#8b5cf6] hover:bg-white/10 transition"
              >
                Iniciar sesión
              </Link>
            )}

            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-xs font-mono text-neutral-300 hover:text-white hover:border-white/25 transition"
              title="Cambiar idioma"
            >
              <Globe size={13} />
              {language.toUpperCase()}
            </button>
          </div>

          {/* Botón Hamburguesa para Móviles */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-[#0d0d14] text-neutral-300 hover:text-white hover:border-[#8b5cf6]/50 transition"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Menú Lateral Drawer Estilo Quantum (Móviles / Pantallas Reducidas) */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 md:hidden ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Fondo oscuro traslúcido */}
        <div
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        {/* Panel lateral deslizante desde la derecha */}
        <aside
          className={`absolute right-0 top-0 bottom-0 w-full max-w-[290px] sm:max-w-xs bg-[#0b0b10] border-l border-white/10 flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
            menuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Cabecera del Drawer */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="grid h-8 w-8 place-items-center rounded-lg border border-[#8b5cf6]/60 bg-[#0d0d14]">
                <span className="font-black text-xs text-[#c4b5fd]">P</span>
              </div>
              <span className="text-base font-black text-white">
                Panda<span className="text-[#a855f7]">Dev</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="grid h-8 w-8 place-items-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
              aria-label="Cerrar menú"
            >
              <X size={19} />
            </button>
          </div>

          {/* Enlaces de Navegación Verticales */}
          <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
            {navLinks.map(({ to, label }) => {
              const isActive = location.pathname === to
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#8b5cf6]/20 to-transparent text-white border-l-2 border-[#8b5cf6] pl-3.5'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{label}</span>
                  <ChevronRight size={14} className={isActive ? 'text-[#a855f7]' : 'text-neutral-600'} />
                </Link>
              )
            })}

            {user?.role === 'admin' && (
              <div className="pt-2">
                <Link
                  to="/admin"
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold text-[#d8b4fe] bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 hover:bg-[#8b5cf6]/20 transition"
                >
                  <span className="flex items-center gap-2">
                    <Shield size={16} /> Panel Administrador
                  </span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </nav>

          {/* Pie del Drawer: Usuario e Idioma */}
          <div className="p-5 border-t border-white/10 bg-[#0d0d14]/70 space-y-3">
            <div className="flex items-center justify-between gap-3">
              {user ? (
                <Link to="/perfil" className="flex items-center gap-2.5 min-w-0">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#8b5cf6] text-white font-bold text-sm">
                    {(user.name || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-white">{user.name || 'Usuario'}</p>
                    <p className="truncate text-[11px] text-neutral-400">{user.email}</p>
                  </div>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 text-xs font-semibold text-white px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition"
                >
                  <User size={14} /> Iniciar sesión
                </Link>
              )}

              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-xs font-mono text-neutral-300 hover:text-white transition shrink-0"
              >
                <Globe size={13} />
                {language.toUpperCase()}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}