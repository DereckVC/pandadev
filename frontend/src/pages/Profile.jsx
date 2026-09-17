import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Activity, ArrowLeft, Bell, Check, Key, Lock, LogOut, 
  Menu, QrCode, Save, Shield, ShieldCheck, User, X, Gamepad2, ExternalLink
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Resuelve dinámicamente la URL del API para evitar fallos hacia localhost en producción
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl) {
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/+$/, '')}/api`
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://pandadev-api.onrender.com/api'
  }
  return 'http://localhost:5000/api'
}

const API = getApiUrl()

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

  // Estado 2FA y Modales
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [show2FAModal, setShow2FAModal] = useState(false)
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false)
  const [qrCodeData, setQrCodeData] = useState({ qrCodeUrl: '', base32: '' })
  const [verify2FAToken, setVerify2FAToken] = useState('')
  const [loading2FA, setLoading2FA] = useState(false)

  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Redirección segura dentro de useEffect para evitar warnings de React
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, loading, navigate])

  // Carga inicial de datos del usuario
  useEffect(() => {
    if (user) {
      setUsername(user.name || '')
      setDiscordTag(user.discordTag || user.discord || '')
      setTwoFactorEnabled(Boolean(user.twoFactorEnabled))
    }
  }, [user])

  // Helper para headers autenticados con soporte para ambos tokens
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token') || localStorage.getItem('panda_token') || ''
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }

  // 1. Abrir modal y generar secreto 2FA
  const handleToggle2FA = async (nextState) => {
    setError('')
    setNotice('')

    if (nextState) {
      // Solicitar activación de 2FA
      setLoading2FA(true)
      try {
        const res = await fetch(`${API}/auth/2fa/generate`, {
          method: 'POST',
          headers: getAuthHeaders(),
          credentials: 'include',
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Error al generar código 2FA.')
        setQrCodeData({ qrCodeUrl: data.qrCodeUrl, base32: data.base32 })
        setShow2FAModal(true)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading2FA(false)
      }
    } else {
      // Solicitar desactivación de 2FA
      setVerify2FAToken('')
      setShowDisable2FAModal(true)
    }
  }

  // 2. Confirmar activación de 2FA con el código de 6 dígitos
  const handleEnable2FA = async (e) => {
    e.preventDefault()
    setError('')
    setLoading2FA(true)

    try {
      const res = await fetch(`${API}/auth/2fa/enable`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({
          token: verify2FAToken.trim(),
          base32: qrCodeData.base32
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Código de verificación incorrecto.')

      setTwoFactorEnabled(true)
      setShow2FAModal(false)
      setVerify2FAToken('')
      setNotice('Autenticación 2FA activada con éxito. Tu cuenta ahora está protegida.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading2FA(false)
    }
  }

  // 3. Desactivar 2FA
  const handleDisable2FA = async (e) => {
    e.preventDefault()
    setError('')
    setLoading2FA(true)

    try {
      const res = await fetch(`${API}/auth/2fa/disable`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ token: verify2FAToken.trim() })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Código de seguridad inválido.')

      setTwoFactorEnabled(false)
      setShowDisable2FAModal(false)
      setVerify2FAToken('')
      setNotice('Autenticación 2FA desactivada correctamente.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading2FA(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07070a] flex items-center justify-center">
        <div className="text-xs font-mono text-[#c4b5fd] tracking-widest uppercase animate-pulse">
          ● Cargando perfil de PandaDev...
        </div>
      </div>
    )
  }

  if (!user) return null

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
    <div className="min-h-screen bg-[#07070a] flex flex-col md:flex-row select-none">
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
            <button type="button" className="ml-auto" onClick={() => setNotice('')}><X size={16} /></button>
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
                <span className="text-[11px] font-mono text-neutral-400 uppercase">Seguridad 2FA</span>
                <strong className="block text-xl font-bold text-white mt-1">
                  {twoFactorEnabled ? 'Activado' : 'Desactivado'}
                </strong>
                <span className={`text-[10px] mt-2 block font-mono ${twoFactorEnabled ? 'text-emerald-400' : 'text-neutral-500'}`}>
                  {twoFactorEnabled ? '● GOOGLE AUTHENTICATOR' : '○ NO CONFIGURADO'}
                </span>
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
                  <span className="text-[10px] text-neutral-500 mt-1 block">Para recibir asistencia y soporte técnico directo.</span>
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

            {/* SECCIÓN 2FA ACTIVA E INTERACTIVA */}
            <div className="flex items-center justify-between p-5 rounded-2xl border border-white/10 bg-[#0d0d14]/90">
              <div className="flex items-center gap-3.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#8b5cf6]/10 text-[#a855f7] border border-[#8b5cf6]/20">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Autenticación en Dos Pasos (2FA)</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                      twoFactorEnabled ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30' : 'bg-neutral-800 text-neutral-400'
                    }`}>
                      {twoFactorEnabled ? 'PROTEGIDO' : 'INACTIVO'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Solicita un código de 6 dígitos de Google Authenticator al iniciar sesión.
                  </p>
                </div>
              </div>

              <ToggleSwitch
                checked={twoFactorEnabled}
                onChange={handleToggle2FA}
                disabled={loading2FA}
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
            <p className="text-xs text-neutral-400 mb-6">Gestiona la recepción de avisos y confirmaciones de seguridad.</p>
            <div className="space-y-4 max-w-lg">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
                <div>
                  <p className="text-xs font-semibold text-white">Notificaciones por Correo</p>
                  <p className="text-[11px] text-neutral-400">Recibe confirmaciones de cambios de clave y soporte.</p>
                </div>
                <ToggleSwitch checked={true} onChange={() => {}} />
              </div>
            </div>
          </section>
        )}

        {/* 5. TAB: VINCULACIONES (BOTONES REALES OAUTH) */}
        {activeTab === 'connections' && (
          <section className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-6">
            <h2 className="text-base font-bold text-white mb-1">Cuentas Conectadas</h2>
            <p className="text-xs text-neutral-400 mb-6">Vincula tus proveedores externos para acceder con un solo clic.</p>
            
            <div className="space-y-3.5 max-w-lg">
              {/* DISCORD */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#5865F2]/10 text-[#5865F2]">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Discord</p>
                    <p className="text-[11px] text-neutral-400">{user.discordTag ? user.discordTag : 'No vinculado'}</p>
                  </div>
                </div>

                {user.discordTag ? (
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ● CONECTADO
                  </span>
                ) : (
                  <a
                    href={`${API}/auth/discord`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#5865F2]/40 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#8ea1e1] text-xs font-semibold transition"
                  >
                    Vincular <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* GITHUB */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-white">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">GitHub</p>
                    <p className="text-[11px] text-neutral-400">{user.githubUsername ? `@${user.githubUsername}` : 'No vinculado'}</p>
                  </div>
                </div>

                {user.githubUsername ? (
                  <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ● CONECTADO
                  </span>
                ) : (
                  <a
                    href={`${API}/auth/github`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition"
                  >
                    Vincular <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODAL ACTIVAR 2FA */}
      {show2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl border border-[#8b5cf6]/40 bg-[#0d0d14] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode size={18} className="text-[#a855f7]" />
                <h3 className="text-sm font-bold text-white">Vincular Authenticator</h3>
              </div>
              <button
                type="button"
                onClick={() => setShow2FAModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Escanea este código con <strong>Google Authenticator</strong> o ingresa la clave manualmente:
            </p>

            {qrCodeData.qrCodeUrl && (
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl">
                <img src={qrCodeData.qrCodeUrl} alt="2FA QR Code" className="w-44 h-44" />
              </div>
            )}

            {/* CAJA DE CLAVE MANUAL CON BREAK-ALL */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center overflow-hidden">
              <span className="text-[10px] font-mono text-neutral-400 block mb-1">CLAVE SECRETA:</span>
              <code className="text-xs font-mono font-bold text-[#c4b5fd] select-all break-all block leading-relaxed tracking-wider">
                {qrCodeData.base32}
              </code>
            </div>

            <form onSubmit={handleEnable2FA} className="space-y-3">
              <div className="block text-xs text-neutral-300">
                <label htmlFor="modal-2fa-token" className="block mb-1">Código de 6 Dígitos:</label>
                <input
                  id="modal-2fa-token"
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="000000"
                  required
                  className="w-full text-center tracking-[0.3em] font-mono text-base rounded-xl border border-white/10 bg-white/5 py-2 text-white outline-none focus:border-[#8b5cf6]"
                  value={verify2FAToken}
                  onChange={(e) => setVerify2FAToken(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <button
                type="submit"
                disabled={loading2FA || verify2FAToken.length < 6}
                className="w-full button button-primary py-2.5 text-xs font-semibold justify-center"
              >
                {loading2FA ? 'Verificando...' : 'Confirmar y Activar 2FA'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DESACTIVAR 2FA */}
      {showDisable2FAModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl border border-red-500/40 bg-[#0d0d14] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-red-400">Desactivar Autenticación 2FA</h3>
              <button
                type="button"
                onClick={() => setShowDisable2FAModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-neutral-300 leading-relaxed">
              Por seguridad, ingresa el código actual de tu aplicación autenticadora para confirmar la desactivación:
            </p>

            <form onSubmit={handleDisable2FA} className="space-y-3">
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                placeholder="000000"
                required
                className="w-full text-center tracking-[0.3em] font-mono text-base rounded-xl border border-white/10 bg-white/5 py-2 text-white outline-none focus:border-red-500"
                value={verify2FAToken}
                onChange={(e) => setVerify2FAToken(e.target.value.replace(/\D/g, ''))}
              />

              <button
                type="submit"
                disabled={loading2FA || verify2FAToken.length < 6}
                className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-500/20 hover:bg-red-500/30 text-red-200 text-xs font-semibold transition"
              >
                {loading2FA ? 'Confirmando...' : 'Confirmar y Desactivar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}