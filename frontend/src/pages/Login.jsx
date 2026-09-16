import { useState } from 'react'
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import ProviderIcon from '../components/ProviderIcon'

export default function Login() {
  const resetToken = new URLSearchParams(window.location.search).get('reset')
  const [mode, setMode] = useState(resetToken ? 'reset' : 'login')
  const [otpEmail, setOtpEmail] = useState('')
  const [twoFactorUserId, setTwoFactorUserId] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [rememberDevice, setRememberDevice] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [confirmPassword, setConfirmPassword] = useState('')
  const { authenticate, api } = useAuth()
  const { language } = useLanguage()
  const navigate = useNavigate()
  const es = language === 'es'

  const startCooldown = () => {
    setResendCooldown(60)
    const timer = window.setInterval(() => {
      setResendCooldown((value) => {
        if (value <= 1) {
          window.clearInterval(timer)
          return 0
        }
        return value - 1
      })
    }, 1000)
  }

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')
    setSuccess('')
    const form = Object.fromEntries(new FormData(event.currentTarget))
    const endpoint = mode === 'register' ? 'register' : mode === 'otp' ? 'verify-otp' : mode === 'loginOtp' ? 'verify-login-otp' : mode === 'twoFactor' ? 'verify-2fa-login' : mode === 'forgot' ? 'forgot-password' : mode === 'reset' ? `reset-password/${resetToken}` : 'login'
    const deviceId = localStorage.getItem('trusted_device') || crypto.randomUUID()
    localStorage.setItem('trusted_device', deviceId)
    if (mode === 'reset' && (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password) || form.password !== confirmPassword)) {
      setMessage(es ? 'La contraseña debe tener 8 caracteres, mayúscula, minúscula y número; ambas deben coincidir.' : 'Use 8 characters with upper, lower and number; passwords must match.')
      setLoading(false)
      return
    }
    const body = mode === 'otp' ? { email: otpEmail, otp: form.otp, deviceId, rememberDevice } : mode === 'loginOtp' ? { email: otpEmail, otp: form.otp, deviceId, rememberDevice } : mode === 'twoFactor' ? { userId: twoFactorUserId, token: form.token, deviceId, rememberDevice } : mode === 'reset' ? { password: form.password } : mode === 'login' ? { ...form, deviceId } : form
    try {
      const response = await fetch(`${api}/auth/${endpoint}`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || (es ? 'No se pudo completar la solicitud.' : 'The request could not be completed.'))
      if (data.requireOTP) {
        setOtpEmail(data.email)
        setMode('otp')
        startCooldown()
        setSuccess(es ? 'Código enviado. Revisa tu bandeja de entrada.' : 'Code sent. Check your inbox.')
      } else if (data.require2FA) {
        setTwoFactorUserId(data.userId)
        setMode('twoFactor')
        setSuccess('')
      } else if (data.requireLoginOTP) {
        setOtpEmail(data.email)
        setMode('loginOtp')
        startCooldown()
        setSuccess(es ? 'Código de inicio de sesión enviado a tu correo.' : 'Login code sent to your email.')
      } else if (data.user) {
        authenticate(data)
        navigate('/')
      } else {
        setSuccess(data.message)
        if (mode === 'reset') window.setTimeout(() => { window.history.replaceState({}, '', '/login'); setMode('login') }, 1000)
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    if (resendCooldown > 0 || !otpEmail) return
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch(`${api}/auth/resend-otp`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: otpEmail }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      setSuccess(data.message)
      startCooldown()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setMessage('')
    setSuccess('')
  }

  const isCodeMode = mode === 'otp' || mode === 'loginOtp' || mode === 'twoFactor'
  return <main className="login-page">
    <div className="login-grid" />
    <div className="login-glow login-glow-left" />
    <div className="login-glow login-glow-right" />
    <section className="login-card">
      <header className="login-header">
        <Link className="login-brand" to="/"><span className="brand-mark">P</span><span><span className="brand-panda">Panda</span><span className="brand-dev">Dev</span></span></Link>
        <Link className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-md transition-all hover:border-[#8b5cf6] hover:bg-white/20" to="/"><ArrowLeft size={15} />{es ? 'Volver al inicio' : 'Back home'}</Link>
      </header>
      <div className="login-heading"><span className="eyebrow">PANDADEV / ACCESS</span><h1>{mode === 'otp' ? (es ? 'Verificar Correo' : 'Verify email') : mode === 'loginOtp' ? (es ? 'Código de Inicio de Sesión' : 'Login code') : mode === 'twoFactor' ? (es ? 'Autenticación de Dos Factores' : 'Two-factor authentication') : mode === 'reset' ? (es ? 'Crear Nueva Contraseña' : 'Create new password') : mode === 'register' ? (es ? 'Crear cuenta' : 'Create account') : mode === 'forgot' ? (es ? 'Recuperar acceso' : 'Recover access') : (es ? 'Bienvenido de nuevo' : 'Welcome back')}</h1></div>
      {!isCodeMode && mode !== 'reset' && <div className="login-tabs"><button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => switchMode('login')}>{es ? 'Iniciar sesión' : 'Sign in'}</button><button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => switchMode('register')}>{es ? 'Registrarse' : 'Register'}</button></div>}
      {!isCodeMode && mode !== 'forgot' && mode !== 'reset' && <div className="login-oauth"><button type="button" onClick={() => { window.location.href = 'http://localhost:5000/api/auth/github' }}><ProviderIcon provider="github" />GitHub</button><a href="http://localhost:5000/api/auth/discord"><ProviderIcon provider="discord" />Discord</a><a href="http://localhost:5000/api/auth/google"><ProviderIcon provider="google" />Google</a></div>}
      <form className="login-form" onSubmit={submit}>
        {mode === 'register' && <label>{es ? 'Nombre de usuario' : 'Username'}<input name="name" autoComplete="name" required /></label>}
        {!isCodeMode && mode !== 'reset' && <label>Email<input name="email" type="email" autoComplete="email" required /></label>}
        {(mode === 'otp' || mode === 'loginOtp') && <><p className="text-center text-sm text-neutral-400">{otpEmail}</p><label className="text-center">{es ? 'Código de 6 cifras' : '6-digit code'}<input className="text-center tracking-[0.4em] text-lg font-mono text-[#c4b5fd]" name="otp" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" autoComplete="one-time-code" required /></label></>}
        {mode === 'twoFactor' && <><p className="text-sm leading-relaxed text-neutral-400">{es ? 'Ingresa el código de 6 dígitos generado por tu aplicación Google Authenticator.' : 'Enter the 6-digit code generated by your Google Authenticator app.'}</p><label className="text-center"><input className="text-center tracking-[0.4em] text-lg font-mono text-[#c4b5fd]" name="token" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" autoComplete="one-time-code" required /></label></>}
        {(mode === 'reset' || (!isCodeMode && mode !== 'forgot')) && <><label>{mode === 'reset' ? (es ? 'Nueva Contraseña' : 'New password') : (es ? 'Contraseña' : 'Password')}<input name="password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength="8" required onChange={(event) => { if ((mode === 'reset' || mode === 'register') && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(event.target.value)) setMessage(es ? 'Usa 8 caracteres con mayúscula, minúscula y número.' : 'Use 8 characters with upper, lower and number.') }} /></label>{mode === 'reset' && <label>{es ? 'Confirmar Contraseña' : 'Confirm password'}<input name="confirmPassword" type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>}<button className="login-forgot" type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? (es ? 'Ocultar contraseña' : 'Hide password') : (es ? 'Mostrar contraseña' : 'Show password')}</button></>}
        {isCodeMode && <label className="flex items-center gap-2 text-sm text-neutral-400"><input type="checkbox" checked={rememberDevice} onChange={(event) => setRememberDevice(event.target.checked)} />Recordar este dispositivo durante 30 días</label>}
        {!isCodeMode && mode === 'forgot' && <p className="text-sm text-neutral-400">{es ? 'Te enviaremos un enlace para recuperar tu contraseña.' : 'We will send a password recovery link.'}</p>}
        <button className="login-submit" type="submit" disabled={loading}>{loading ? (es ? 'Procesando...' : 'Processing...') : mode === 'otp' ? (es ? 'Verificar Código' : 'Verify code') : mode === 'twoFactor' ? (es ? 'Validar e Iniciar Sesión' : 'Validate and sign in') : mode === 'forgot' ? (es ? 'Enviar enlace' : 'Send link') : mode === 'register' ? (es ? 'Crear cuenta' : 'Create account') : (es ? 'Iniciar sesión' : 'Sign in')}</button>
      </form>
      {(mode === 'otp' || mode === 'loginOtp') && <button className="login-forgot" type="button" onClick={resendOtp} disabled={resendCooldown > 0 || loading}>{resendCooldown > 0 ? `${es ? 'Reenviar en' : 'Resend in'} ${resendCooldown}s` : (es ? 'Reenviar código' : 'Resend code')}</button>}
      {mode === 'login' && <button className="login-forgot" type="button" onClick={() => switchMode('forgot')}>{es ? '¿Olvidaste tu contraseña?' : 'Forgot your password?'}</button>}
      {(mode === 'forgot' || isCodeMode) && <button className="login-forgot" type="button" onClick={() => switchMode('login')}>{es ? 'Volver al inicio de sesión' : 'Back to sign in'}</button>}
      {success && <p className="login-message border border-emerald-400/30 bg-emerald-400/10 text-emerald-200"><CheckCircle2 size={15} />{success}</p>}
      {message && <p className="login-message"><Mail size={14} />{message}</p>}
      {mode === 'register' && <p className="mt-4 flex items-center gap-2 text-xs text-neutral-400"><ShieldCheck size={14} />{es ? 'La activación por OTP protege tu cuenta.' : 'OTP activation protects your account.'}</p>}
    </section>
  </main>
}
