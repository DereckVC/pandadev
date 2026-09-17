import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Activity, ArrowLeft, Check, Key, Lock, LogOut, 
  Mail, Menu, Save, Shield, User, X, MessageSquare, AlertTriangle 
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const { user, updateProfile, changePassword, logout } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard', 'edit', 'security'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  
  // Formulario Editar Perfil
  const [username, setUsername] = useState(user?.name || '')
  const [discordTag, setDiscordTag] = useState(user?.discord || '')
  
  // Formulario Cambiar Contraseña
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setNotice('')
    setError('')
    setLoading(true)
    try {
      if (updateProfile) {
        await updateProfile({ name: username, discord: discordTag })
      }
      setNotice('Perfil actualizado correctamente.')
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setNotice('')
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Las nuevas contraseñas no coinciden.')
      return
    }
    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      if (changePassword) {
        await changePassword(currentPassword, newPassword)
      }
      setNotice('Contraseña cambiada exitosamente.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message || 'No se pudo cambiar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    {
      label: 'General',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <Activity size={16} /> },
      ]
    },
    {
      label: 'Cuenta',
      items: [
        { id: 'edit', label: 'Editar Perfil', icon: <User size={16} /> },
        { id: 'security', label: 'Seguridad', icon: <Shield size={16} /> },
      ]
    }
  ]

  const sidebar = (
    <div className="flex flex-col h-full bg-[#0d0d14] border-r border-white/10 p-5 select-none">
      {/* Tarjeta de usuario estilo Quantum */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 mb-6">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#8b5cf6] text-white font-black text-sm shadow-md">
          {(user.name || user.email || 'U')[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate">{user.name || 'Usuario'}</p>
          <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#8b5cf6]/20 text-[#c4b5fd] border border-[#8b5cf6]/30">
            {user.role === 'admin' ? 'ADMINISTRADOR' : 'MIEMBRO OFICIAL'}
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        {menuItems.map((sec) => (
          <div key={sec.label} className="space-y-1.5">
            <span className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              {sec.label}
            </span>
            {sec.items.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#8b5cf6]/15 text-white border-l-2 border-[#8b5cf6] pl-3 shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className={isActive ? 'text-[#a855f7]' : 'text-neutral-500'}>{item.icon}</span>
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <div className="pt-4 mt-auto border-t border-white/10 space-y-2">
        <Link
          to="/"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 bg-white/5 hover:bg-white/10 hover:text-white transition border border-white/5"
        >
          <ArrowLeft size={14} /> Volver al Inicio
        </Link>
        <button
          type="button"
          onClick={() => { if (logout) logout(); navigate('/') }}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 transition"
        >
          <LogOut size={13} /> Cerrar Sesión
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#07070a] flex flex-col md:flex-row">
      {/* Sidebar Desktop estilo Quantum */}
      <aside className="hidden md:block w-72 shrink-0 sticky top-0 h-screen">
        {sidebar}
      </aside>

      {/* Header Móvil */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0d0d14]">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white"
        >
          <Menu size={16} /> Menú Cuenta
        </button>
        <span className="text-xs font-mono text-[#c4b5fd]">Mi Perfil</span>
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebar}
          </div>
        </div>
      )}

      {/* Área Principal de Contenido */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-4xl overflow-y-auto">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-3 py-1 text-[11px] font-mono tracking-wider text-[#d8b4fe]">
              ● PANEL PERSONAL · PANDADEV
            </span>
            <h1 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-white">
              ¡Bienvenido, <span className="text-[#a855f7]">{user.name || 'Panda'}</span>!
            </h1>
          </div>
          {user.role === 'admin' && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#8b5cf6]/50 bg-[#8b5cf6]/15 text-xs font-semibold text-[#d8b4fe] hover:bg-[#8b5cf6]/25 transition self-start sm:self-center"
            >
              <Shield size={14} /> Ir al Command Center
            </Link>
          )}
        </header>

        {notice && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm text-emerald-200">
            <Check size={18} /> {notice}
            <button className="ml-auto" onClick={() => setNotice('')}><X size={16} /></button>
          </div>
        )}

        {error && (
          <div className="mb-5 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {/* TAB 1: DASHBOARD USUARIO */}
        {activeTab === 'dashboard' && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-5">
                <span className="text-[11px] font-mono text-neutral-400 uppercase">Rol de Usuario</span>
                <strong className="block text-xl font-bold text-white mt-1 capitalize">{user.role || 'Miembro'}</strong>
                <span className="text-[10px] text-emerald-400 mt-2 block font-mono">● CUENTA ACTIVA</span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-5">
                <span className="text-[11px] font-mono text-neutral-400 uppercase">Proveedor de Acceso</span>
                <strong className="block text-xl font-bold text-white mt-1 capitalize">{user.provider || 'Local / Email'}</strong>
                <span className="text-[10px] text-purple-300 mt-2 block font-mono">● SESIÓN SEGURA</span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-5">
                <span className="text-[11px] font-mono text-neutral-400 uppercase">Miembro Desde</span>
                <strong className="block text-xl font-bold text-white mt-1">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '2026'}
                </strong>
                <span className="text-[10px] text-neutral-400 mt-2 block font-mono">VERIFICADO</span>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-6">
              <h2 className="text-base font-bold text-white mb-4">Acciones Rápidas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('edit')}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#8b5cf6]/40 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-[#a855f7]" />
                    <div>
                      <p className="text-xs font-bold text-white">Editar Perfil</p>
                      <p className="text-[11px] text-neutral-400">Actualiza tu nombre y datos</p>
                    </div>
                  </div>
                  <span className="text-neutral-500">→</span>
                </button>

                <button
                  onClick={() => setActiveTab('security')}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#8b5cf6]/40 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <Key size={18} className="text-[#a855f7]" />
                    <div>
                      <p className="text-xs font-bold text-white">Seguridad</p>
                      <p className="text-[11px] text-neutral-400">Cambiar clave de acceso</p>
                    </div>
                  </div>
                  <span className="text-neutral-500">→</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* TAB 2: EDITAR PERFIL */}
        {activeTab === 'edit' && (
          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-6">
              <h2 className="text-lg font-bold text-white mb-1">Información Personal</h2>
              <p className="text-xs text-neutral-400 mb-6">Administra tus datos visibles en la plataforma.</p>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <label className="block text-xs text-neutral-300">
                  Nombre de Usuario
                  <input
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white text-xs outline-none focus:border-[#8b5cf6]"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </label>

                <label className="block text-xs text-neutral-300">
                  Correo Electrónico (Protegido)
                  <div className="relative mt-1.5">
                    <Lock size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      disabled
                      className="w-full rounded-xl border border-white/5 bg-black/40 px-3.5 py-2.5 text-neutral-400 text-xs cursor-not-allowed"
                      value={user.email || ''}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 block">El email no puede ser modificado por seguridad.</span>
                </label>

                <label className="block text-xs text-neutral-300">
                  Usuario de Discord (Opcional)
                  <input
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white text-xs outline-none focus:border-[#8b5cf6]"
                    placeholder="Usuario#0000 o @usuario"
                    value={discordTag}
                    onChange={(e) => setDiscordTag(e.target.value)}
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="button button-primary px-5 py-2.5 text-xs font-semibold"
                >
                  <Save size={14} /> {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* TAB 3: SEGURIDAD */}
        {activeTab === 'security' && (
          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-6">
              <h2 className="text-lg font-bold text-white mb-1">Seguridad de la Cuenta</h2>
              <p className="text-xs text-neutral-400 mb-6">Gestiona tus credenciales de inicio de sesión.</p>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                <label className="block text-xs text-neutral-300">
                  Contraseña Actual
                  <input
                    type="password"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white text-xs outline-none focus:border-[#8b5cf6]"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </label>

                <label className="block text-xs text-neutral-300">
                  Nueva Contraseña
                  <input
                    type="password"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white text-xs outline-none focus:border-[#8b5cf6]"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </label>

                <label className="block text-xs text-neutral-300">
                  Confirmar Nueva Contraseña
                  <input
                    type="password"
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white text-xs outline-none focus:border-[#8b5cf6]"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    required
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="button button-primary px-5 py-2.5 text-xs font-semibold"
                >
                  <Key size={14} /> {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                </button>
              </form>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}