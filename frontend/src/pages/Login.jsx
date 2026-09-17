import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, KeyRound, Lock, Mail, ShieldCheck, User } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

// Resuelve la API dinámica evitando fallos hacia localhost en producción
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
  const { user, loading: authLoading, login } = useAuth()
  const navigate = useNavigate()

  // Estados de vista: 'login' | 'register' | 'forgot' | '2fa' | 'otp'
  const [mode, setMode] = useState('login')

  // Campos de formulario
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [otpCode, setOtpCode] = useState('')

  // Estados de control y verificación
  const [pendingUserId, setPendingUserId] = useState(null)
  const [pendingEmail, setPendingEmail] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Si ya hay sesión activa, redirigir al inicio
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/', { replace: true })
    }
  }, [user, authLoading, navigate])

  const resetMessages = () => {
    setError('')
    setNotice('')
  }

  // 1. Manejo de Inicio de Sesión
  const handleLogin = async (e) => {
    e.preventDefault()
    resetMessages()
    setSubmitting(true)

    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Correo o contraseña incorrectos.')
      }

      // Si el usuario tiene 2FA activado en su perfil
      if (data.require2FA) {
        setPendingUserId(data.userId)
        setPendingEmail(data.email || email)
        setMode('2fa')
        return
      }

      // Inicio exitoso: guardar sesión y redirigir al Inicio (/)
      if (data.token) {
        if (login) login(data.user, data.token)
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // 2. Verificación de Código 2FA Authenticator
  const handleVerify2FA = async (e) => {
    e.preventDefault()
    resetMessages()
    setSubmitting(true)

    try {
      const res = await fetch(`${API}/auth/verify-2fa-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: pendingUserId,
          token: totpCode.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Código de Google Authenticator inválido.')
      }

      if (data.token) {
        if (login) login(data.user, data.token)
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // 3. Manejo de Registro Local
  const handleRegister = async (e) => {
    e.preventDefault()
    resetMessages()

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'No fue posible crear la cuenta.')
      }

      if (data.requireOTP) {
        setPendingEmail(data.email || email)
        setMode('otp')
        setNotice('Ingresa el código de 6 dígitos que enviamos a tu correo.')
        return
      }

      if (data.token) {
        if (login) login(data.user, data.token)
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // 4. Verificación de Código OTP (Activación de Cuenta)
  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    resetMessages()
    setSubmitting(true)

    try {
      const res = await fetch(`${API}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: pendingEmail,
          otp: otpCode.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'El código es inválido o ya ha expirado.')
      }

      if (data.token) {
        if (login) login(data.user, data.token)
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // 5. Solicitud de Recuperación de Contraseña
  const handleForgotPassword = async (e) => {
    e.preventDefault()
    resetMessages()
    setSubmitting(true)

    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })

      const data = await res.json()
      setNotice(data.message || 'Si el correo existe, recibirás un enlace de recuperación.')
    } catch {
      setError('Error al solicitar el enlace de recuperación.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-transparent select-none">
      <div className="w-full max-w-md bg-[#0d0d14]/90 backdrop-blur-xl border border-[#8b5cf6]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition">
          <ArrowLeft size={14} /> Volver al Inicio
        </Link>

        {/* CABECERA SEGÚN MODO */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {mode === 'login' && 'Iniciar Sesión'}
            {mode === 'register' && 'Crear Cuenta'}
            {mode === 'forgot' && 'Recuperar Contraseña'}
            {mode === '2fa' && 'Verificación 2FA'}
            {mode === 'otp' && 'Verificar Correo'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            {mode === 'login' && 'Accede a tu cuenta de PandaDev'}
            {mode === 'register' && 'Únete a nuestra plataforma técnica'}
            {mode === 'forgot' && 'Te enviaremos un enlace seguro a tu correo'}
            {mode === '2fa' && 'Ingresa el código de 6 dígitos de Google Authenticator'}
            {mode === 'otp' && `Enviamos un código de seguridad a ${pendingEmail}`}
          </p>
        </div>

        {/* NOTIFICACIONES */}
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

        {/* BOTONES OAUTH (SOLO EN LOGIN Y REGISTRO) */}
        {(mode === 'login' || mode === 'register') && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <a
                href={`${API}/auth/google`}
                className="flex items-center justify-center p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                title="Continuar con Google"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
                </svg>
              </a>

              <a
                href={`${API}/auth/discord`}
                className="flex items-center justify-center p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                title="Continuar con Discord"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
              </a>

              <a
                href={`${API}/auth/github`}
                className="flex items-center justify-center p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
                title="Continuar con GitHub"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
            </div>

            <div className="relative flex items-center justify-center">
              <hr className="w-full border-white/10" />
              <span className="absolute bg-[#0d0d14] px-3 text-[10px] font-mono tracking-wider text-neutral-500 uppercase">
                O con tu correo
              </span>
            </div>
          </>
        )}

        {/* FORMULARIO: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="block text-xs text-neutral-300">
              <label htmlFor="login-email" className="block mb-1.5">Correo Electrónico</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="tu@correo.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-[#8b5cf6]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="block text-xs text-neutral-300">
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="login-password">Contraseña</label>
                <button
                  type="button"
                  onClick={() => { resetMessages(); setMode('forgot') }}
                  className="text-[11px] text-[#c4b5fd] hover:text-white transition"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-[#8b5cf6]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full button button-primary py-2.5 text-xs font-semibold justify-center shadow-lg shadow-[#8b5cf6]/20"
            >
              {submitting ? 'Iniciando...' : 'Iniciar Sesión'}
              <ArrowRight size={14} />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { resetMessages(); setMode('register') }}
                className="text-xs text-neutral-400 hover:text-white transition"
              >
                ¿Aún no tienes cuenta? <strong className="text-[#a855f7]">Regístrate aquí</strong>
              </button>
            </div>
          </form>
        )}

        {/* FORMULARIO: 2FA AUTHENTICATOR */}
        {mode === '2fa' && (
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center gap-3">
              <ShieldCheck size={24} className="text-[#8b5cf6] shrink-0" />
              <div className="text-[11px] text-neutral-300 leading-snug">
                Abre tu aplicación <strong className="text-white">Google Authenticator</strong> y escribe el código temporal de 6 dígitos.
              </div>
            </div>

            <div className="block text-xs text-neutral-300">
              <label htmlFor="totp-code" className="block mb-1.5">Código 2FA</label>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="totp-code"
                  name="totp"
                  type="text"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  placeholder="000000"
                  className="w-full text-center tracking-[0.4em] font-mono text-base rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-white outline-none focus:border-[#8b5cf6]"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || totpCode.length < 6}
              className="w-full button button-primary py-2.5 text-xs font-semibold justify-center shadow-lg shadow-[#8b5cf6]/20"
            >
              {submitting ? 'Verificando...' : 'Acceder al Sistema'}
              <ArrowRight size={14} />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { resetMessages(); setMode('login') }}
                className="text-xs text-neutral-400 hover:text-white transition"
              >
                Cancelar y volver
              </button>
            </div>
          </form>
        )}

        {/* FORMULARIO: REGISTRO */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div className="block text-xs text-neutral-300">
              <label htmlFor="reg-name" className="block mb-1">Nombre Completo</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="Dereck Ancel"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-[#8b5cf6]"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="block text-xs text-neutral-300">
              <label htmlFor="reg-email" className="block mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-[#8b5cf6]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="block text-xs text-neutral-300">
              <label htmlFor="reg-password" className="block mb-1">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="reg-password"
                  type="password"
                  minLength={8}
                  required
                  placeholder="Mínimo 8 caracteres"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-[#8b5cf6]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="block text-xs text-neutral-300">
              <label htmlFor="reg-confirm-password" className="block mb-1">Confirmar Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="reg-confirm-password"
                  type="password"
                  minLength={8}
                  required
                  placeholder="Repite tu contraseña"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-[#8b5cf6]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full button button-primary py-2.5 text-xs font-semibold justify-center shadow-lg shadow-[#8b5cf6]/20"
            >
              {submitting ? 'Registrando...' : 'Crear Cuenta'}
              <ArrowRight size={14} />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { resetMessages(); setMode('login') }}
                className="text-xs text-neutral-400 hover:text-white transition"
              >
                ¿Ya tienes una cuenta? <strong className="text-[#a855f7]">Inicia sesión</strong>
              </button>
            </div>
          </form>
        )}

        {/* FORMULARIO: OTP (VERIFICACIÓN DE REGISTRO) */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="block text-xs text-neutral-300">
              <label htmlFor="otp-input" className="block mb-1.5">Código OTP de Registro</label>
              <input
                id="otp-input"
                type="text"
                maxLength={6}
                inputMode="numeric"
                required
                placeholder="000000"
                className="w-full text-center tracking-[0.4em] font-mono text-base rounded-xl border border-white/10 bg-white/5 py-2.5 text-white outline-none focus:border-[#8b5cf6]"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <button
              type="submit"
              disabled={submitting || otpCode.length < 6}
              className="w-full button button-primary py-2.5 text-xs font-semibold justify-center shadow-lg shadow-[#8b5cf6]/20"
            >
              {submitting ? 'Verificando...' : 'Activar Cuenta'}
              <ArrowRight size={14} />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { resetMessages(); setMode('login') }}
                className="text-xs text-neutral-400 hover:text-white transition"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        )}

        {/* FORMULARIO: RECUPERACIÓN */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="block text-xs text-neutral-300">
              <label htmlFor="forgot-email" className="block mb-1.5">Correo Electrónico Registrado</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  id="forgot-email"
                  type="email"
                  required
                  placeholder="tu@correo.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-[#8b5cf6]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full button button-primary py-2.5 text-xs font-semibold justify-center shadow-lg shadow-[#8b5cf6]/20"
            >
              {submitting ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
              <ArrowRight size={14} />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { resetMessages(); setMode('login') }}
                className="text-xs text-neutral-400 hover:text-white transition"
              >
                ¿Recordaste tu clave? <strong className="text-[#a855f7]">Inicia sesión</strong>
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  )
}