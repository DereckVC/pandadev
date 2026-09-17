import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Lock, Mail, User } from 'lucide-react'
import ProviderIcon from '../components/ProviderIcon'
import { useAuth } from '../contexts/AuthContext'

// Resuelve la API dinámica para producción y desarrollo local
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

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [isForgot, setIsForgot] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)

    try {
      if (isForgot) {
        // Flujo de recuperación de contraseña
        const rawEmail = form.email.trim()
        if (!rawEmail) throw new Error('Ingresa tu correo electrónico')

        const res = await fetch(`${API}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: rawEmail })
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Error al enviar la solicitud')

        setNotice(data.message || 'Si el correo existe, recibirás un enlace de recuperación.')
      } else if (isRegister) {
        // Flujo de registro
        if (!form.name.trim()) throw new Error('El nombre es obligatorio')
        await register(form.name, form.email, form.password)
        navigate('/perfil')
      } else {
        // Flujo de inicio de sesión
        await login(form.email, form.password)
        navigate('/perfil')
      }
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  const oauthProviders = [
    { id: 'google', name: 'Google', endpoint: `${API}/auth/google` },
    { id: 'discord', name: 'Discord', endpoint: `${API}/auth/discord` },
    { id: 'github', name: 'GitHub', endpoint: `${API}/auth/github` },
  ]

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-transparent">
      <div className="w-full max-w-md bg-[#0d0d14]/90 backdrop-blur-xl border border-[#8b5cf6]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition">
          <ArrowLeft size={14} /> Volver al Inicio
        </Link>

        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {isForgot ? 'Recuperar Contraseña' : (isRegister ? 'Crear Cuenta' : 'Iniciar Sesión')}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {isForgot 
              ? 'Ingresa tu correo para recibir un enlace de restablecimiento' 
              : (isRegister ? 'Regístrate para gestionar tu perfil técnico' : 'Accede a tu cuenta de PandaDev')}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs leading-relaxed">
            {error}
          </div>
        )}

        {notice && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 leading-relaxed">
            <Check size={16} className="shrink-0 text-emerald-400" />
            <span>{notice}</span>
          </div>
        )}

        {/* Proveedores OAuth visibles únicamente en Login o Registro */}
        {!isForgot && (
          <>
            <div className="grid grid-cols-3 gap-2.5">
              {oauthProviders.map((p) => (
                <a
                  key={p.id}
                  href={p.endpoint}
                  className="flex items-center justify-center py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-[#8b5cf6]/50 transition"
                  title={`Acceder con ${p.name}`}
                >
                  <ProviderIcon provider={p.id} />
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <div className="h-[1px] flex-1 bg-white/10" />
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">O con tu correo</span>
              <div className="h-[1px] flex-1 bg-white/10" />
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre (Solo en Registro) */}
          {isRegister && !isForgot && (
            <div className="block text-xs text-neutral-300">
              <label htmlFor="register-name" className="block mb-1.5">Nombre Completo</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="register-name"
                  name="name"
                  autoComplete="name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-[#8b5cf6]"
                  placeholder="Tu nombre"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          {/* Correo Electrónico */}
          <div className="block text-xs text-neutral-300">
            <label htmlFor="login-email" className="block mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-[#8b5cf6]"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Contraseña (Solo en Login o Registro) */}
          {!isForgot && (
            <div className="block text-xs text-neutral-300">
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password">Contraseña</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgot(true)
                      setError('')
                      setNotice('')
                    }}
                    className="text-[11px] text-[#c4b5fd] hover:text-white transition hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-[#8b5cf6]"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>
            </div>
          )}

          {/* Botón Principal */}
          <button
            type="submit"
            disabled={loading}
            className="w-full button button-primary py-2.5 text-xs font-semibold justify-center shadow-lg shadow-[#8b5cf6]/20"
          >
            {loading 
              ? 'Procesando...' 
              : (isForgot ? 'Enviar Enlace de Recuperación' : (isRegister ? 'Registrarse' : 'Iniciar Sesión'))}
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Navegación Inferior */}
        <div className="text-center text-xs text-neutral-400">
          {isForgot ? (
            <button
              type="button"
              onClick={() => {
                setIsForgot(false)
                setError('')
                setNotice('')
              }}
              className="text-[#c4b5fd] hover:text-white transition font-semibold"
            >
              ← Volver a Iniciar Sesión
            </button>
          ) : (
            <p>
              {isRegister ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister)
                  setError('')
                  setNotice('')
                }}
                className="text-[#c4b5fd] hover:underline font-semibold ml-1"
              >
                {isRegister ? 'Inicia sesión' : 'Regístrate aquí'}
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  )
}