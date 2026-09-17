import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Activity, ArrowLeft, Bell, Check, Key, Lock, LogOut, 
  Menu, Save, Shield, User, X, Gamepad2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Componente Switch Toggle interactivo estilo Quantum
function ToggleSwitch({ checked, onChange, disabled = false }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-150 ${
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
      } ${checked ? 'bg-[#8b5cf6]' : 'bg-neutral-800'}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-150 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export default function Profile() {
  const { user, loading, updateProfile, changePassword, logout } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('dashboard')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Formulario Editar Perfil
  const [username, setUsername] = useState('')
  const [discordTag, setDiscordTag] = useState('')

  // Formulario Cambiar Contraseña
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Redirección segura dentro de useEffect
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, loading, navigate])

  // Carga inicial de datos de usuario en los formularios
  useEffect(() => {
    if (user) {
      setUsername(user.name || '')
      setDiscordTag(user.discordTag || user.discord || '')
      setTwoFactorEnabled(Boolean(user.twoFactorEnabled))
    }
  }, [user])

  // Pantalla de espera Quantum mientras verifica sesión
  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center">
        <div className="text-xs font-mono text-[#c4b5fd] tracking-widest uppercase animate-pulse">
          ● Cargando perfil de PandaDev...
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setNotice('')
    setError('')
    setSubmitting(true)
    try {
      if (updateProfile) {
        await updateProfile({ name: username, discordTag })
      }
      setNotice('Información de perfil actualizada con éxito.')
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil')
    } finally {
      setSubmitting(false)
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
    if (newPassword.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.')
      return
    }

    setSubmitting(true)
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
      setSubmitting(false)
    }
  }

  const handleDeleteAccount = () => {
    if (window.confirm('¿Estás seguro de que deseas eliminar tu cuenta permanentemente? Esta acción es irreversible.')) {
      alert('Por motivos de seguridad, contacta a support@pandadev.me para completar la baja definitiva de tus datos.')
    }
  }

  const menuSections = [
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
        { id: 'notifications', label: 'Notificaciones', icon: <Bell size={16} /> },
        { id: 'connections', label: 'Vincular Redes', icon: <Gamepad2 size={16} /> },
      ]
    }
  ]

  const sidebar = (
    <div className="flex flex-col h-full bg-[#0d0d14] border-r border-white/10 p-5 select-none">
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 mb-6">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#8b5cf6] text-white font-black text-sm shadow-md overflow-hidden">
          {user.avatar ? (
            <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            (user.name || user.email || 'U')[0].toUpperCase()
          )}
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
        {menuSections.map((sec) => (
          <div key={sec.label} className="space-y-1.5">
            <span className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500">
              {sec.label}
            </span>
            {sec.items.map((item) => {
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
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
      <aside className="hidden md:block w-72 shrink-0 sticky top-0 h-screen">
        {sidebar}
      </aside>

      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0d0d14]">
        <button
          type="button"
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

        {/* 1. TAB: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-5">
                <span className="text-[11px] font-mono text-neutral-400 uppercase">Rol Asignado</span>
                <strong className="block text-xl font-bold text-white mt-1 capitalize">{user.role || 'Miembro'}</strong>
                <span className="text-[10px] text-emerald-400 mt-2 block font-mono">● CUENTA ACTIVA</span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-5">
                <span className="text-[11px] font-mono text-neutral-400 uppercase">Método de Acceso</span>
                <strong className="block text-xl font-bold text-white mt-1 capitalize">{user.provider || 'Local / Email'}</strong>
                <span className="text-[10px] text-purple-300 mt-2 block font-mono">● SESIÓN SEGURA</span>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-5">
                <span className="text-[11px] font-mono text-neutral-400 uppercase">Membresía</span>
                <strong className="block text-xl font-bold text-white mt-1">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Septiembre 2026'}
                </strong>
                <span className="text-[10px] text-neutral-400 mt-2 block font-mono">VERIFICADO</span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-6">
              <h2 className="text-base font-bold text-white mb-4">Acciones Rápidas</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('edit')}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#8b5cf6]/40 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <User size={18} className="text-[#a855f7]" />
                    <div>
                      <p className="text-xs font-bold text-white">Editar Perfil</p>
                      <p className="text-[11px] text-neutral-400">Actualiza tu nombre y vinculaciones</p>
                    </div>
                  </div>
                  <span className="text-neutral-500">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('security')}
                  className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.06] hover:border-[#8b5cf6]/40 transition text-left"
                >
                  <div className="flex items-center gap-3">
                    <Key size={18} className="text-[#a855f7]" />
                    <div>
                      <p className="text-xs font-bold text-white">Seguridad</p>
                      <p className="text-[11px] text-neutral-400">Contraseña y autenticación 2FA</p>
                    </div>
                  </div>
                  <span className="text-neutral-500">→</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 2. TAB: EDITAR PERFIL */}
        {activeTab === 'edit' && (
          <section className="space-y-6">
            <div className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-[#0d0d14]/90">
              <div className="relative">
                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#8b5cf6] text-white font-black text-xl shadow-lg overflow-hidden">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    (user.name || user.email || 'U')[0].toUpperCase()
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-bold text-white truncate">{user.name || 'Usuario'}</h2>
                <p className="text-xs text-neutral-400 truncate">{user.email}</p>
                <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono text-neutral-300 bg-white/5 border border-white/10">
                  Miembro activo
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-6">
              <h2 className="text-base font-bold text-white mb-1">Información Personal</h2>
              <p className="text-xs text-neutral-400 mb-6">Administra los datos de tu cuenta en PandaDev.</p>

              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div className="block text-xs text-neutral-300">
                  <label htmlFor="profile-username" className="block mb-1.5">Nombre de Usuario</label>
                  <input
                    id="profile-username"
                    name="username"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white text-xs outline-none focus:border-[#8b5cf6]"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="block text-xs text-neutral-300">
                  <label htmlFor="profile-email-readonly" className="block mb-1.5">Correo Electrónico (Protegido)</label>
                  <div className="relative">
                    <Lock size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                    <input
                      id="profile-email-readonly"
                      disabled
                      className="w-full rounded-xl border border-white/5 bg-black/40 px-3.5 py-2.5 text-neutral-400 text-xs cursor-not-allowed"
                      value={user.email || ''}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-1 block">El email no se puede cambiar por seguridad.</span>
                </div>

                <div className="block text-xs text-neutral-300">
                  <label htmlFor="profile-discord-tag" className="block mb-1.5">Discord Tag (Opcional)</label>
                  <input
                    id="profile-discord-tag"
                    name="discord"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white text-xs outline-none focus:border-[#8b5cf6]"
                    placeholder="Usuario#0000 o @usuario"
                    value={discordTag}
                    onChange={(e) => setDiscordTag(e.target.value)}
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">Para recibir asistencia y notificaciones técnicas.</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="button button-primary px-5 py-2.5 text-xs font-semibold"
                >
                  <Save size={14} /> {submitting ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            </div>
          </section>
        )}

        {/* 3. TAB: SEGURIDAD (CON 2FA Y ZONA DE PELIGRO) */}
        {activeTab === 'security' && (
          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-6">
              <h2 className="text-base font-bold text-white mb-1">Cambiar Contraseña</h2>
              <p className="text-xs text-neutral-400 mb-6">Actualiza tus credenciales de acceso periódicamente.</p>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                <div className="block text-xs text-neutral-300">
                  <label htmlFor="change-current-password" className="block mb-1.5">Contraseña Actual</label>
                  <input
                    id="change-current-password"
                    type="password"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white text-xs outline-none focus:border-[#8b5cf6]"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="block text-xs text-neutral-300">
                  <label htmlFor="change-new-password" className="block mb-1.5">Nueva Contraseña</label>
                  <input
                    id="change-new-password"
                    type="password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white text-xs outline-none focus:border-[#8b5cf6]"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                  />
                </div>

                <div className="block text-xs text-neutral-300">
                  <label htmlFor="change-confirm-password" className="block mb-1.5">Confirmar Nueva Contraseña</label>
                  <input
                    id="change-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white text-xs outline-none focus:border-[#8b5cf6]"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="button button-primary px-5 py-2.5 text-xs font-semibold"
                >
                  <Key size={14} /> {submitting ? 'Actualizando...' : 'Cambiar Contraseña'}
                </button>
              </form>
            </div>

            <div className="flex items-center justify-between p-5 rounded-2xl border border-white/10 bg-[#0d0d14]/90">
              <div className="flex items-center gap-3.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-[#a855f7]">
                  <Shield size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Autenticación 2FA</h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Próximamente
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">Protege tu acceso solicitando código temporal de Google Authenticator.</p>
                </div>
              </div>

              <ToggleSwitch
                checked={twoFactorEnabled}
                onChange={setTwoFactorEnabled}
                disabled={true}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-red-500/20 bg-red-950/10">
              <div>
                <h3 className="text-sm font-bold text-red-400">Eliminar mi cuenta</h3>
                <p className="text-xs text-neutral-400 mt-0.5">Esta acción es irreversible. Se eliminarán tus datos de forma definitiva.</p>
              </div>

              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-semibold transition shrink-0"
              >
                Eliminar Cuenta
              </button>
            </div>
          </section>
        )}

        {/* 4. TAB: NOTIFICACIONES */}
        {activeTab === 'notifications' && (
          <section className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-6">
            <h2 className="text-base font-bold text-white mb-1">Preferencias de Notificación</h2>
            <p className="text-xs text-neutral-400 mb-6">Gestiona la recepción de avisos y respuestas a tu correo.</p>
            <div className="space-y-4 max-w-lg">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <p className="text-xs font-semibold text-white">Notificaciones por Correo</p>
                  <p className="text-[11px] text-neutral-400">Recibe confirmaciones de seguridad y mensajes.</p>
                </div>
                <ToggleSwitch checked={true} onChange={() => {}} />
              </div>
            </div>
          </section>
        )}

        {/* 5. TAB: VINCULACIONES */}
        {activeTab === 'connections' && (
          <section className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-6">
            <h2 className="text-base font-bold text-white mb-1">Cuentas Conectadas</h2>
            <p className="text-xs text-neutral-400 mb-6">Tus servicios externos vinculados para inicio de sesión rápido.</p>
            <div className="space-y-3 max-w-lg">
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <div>
                  <p className="text-xs font-bold text-white">Discord</p>
                  <p className="text-[11px] text-neutral-400">{user.discordTag ? 'Conectado' : 'No conectado'}</p>
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full ${user.discordTag ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-neutral-400'}`}>
                  {user.discordTag ? 'CONECTADO' : 'DESCONECTADO'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <div>
                  <p className="text-xs font-bold text-white">GitHub</p>
                  <p className="text-[11px] text-neutral-400">{user.githubUsername ? 'Conectado' : 'No conectado'}</p>
                </div>
                <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full ${user.githubUsername ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-neutral-400'}`}>
                  {user.githubUsername ? 'CONECTADO' : 'DESCONECTADO'}
                </span>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}