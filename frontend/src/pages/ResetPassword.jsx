import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Lock } from 'lucide-react'

// Resuelve la API dinámica para evitar fallos hacia localhost en producción
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
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    if (!passwordRegex.test(password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`${API}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'El enlace de recuperación es inválido o ya fue utilizado.')
      }

      setNotice('¡Contraseña actualizada exitosamente! Redirigiendo al inicio de sesión...')
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1500)
    } catch (err) {
      setError(err.message || 'Error al actualizar la contraseña.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-transparent">
      <div className="w-full max-w-md bg-[#0d0d14]/90 backdrop-blur-xl border border-[#8b5cf6]/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition">
          <ArrowLeft size={14} /> Volver a Iniciar Sesión
        </Link>

        <div>
          <span className="inline-flex rounded-full border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-2.5 py-0.5 text-[10px] font-mono tracking-wider text-[#d8b4fe] mb-2">
            ● SEGURIDAD · PANDADEV
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Nueva Contraseña
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Ingresa tu nueva clave de acceso para restablecer tu cuenta.
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="block text-xs text-neutral-300">
            <label htmlFor="reset-new-password" className="block mb-1.5">Nueva Contraseña</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                id="reset-new-password"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-[#8b5cf6]"
                placeholder="Mínimo 8 caracteres (A-z, 0-9)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="block text-xs text-neutral-300">
            <label htmlFor="reset-confirm-password" className="block mb-1.5">Confirmar Nueva Contraseña</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                id="reset-confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-3 py-2 text-white text-xs outline-none focus:border-[#8b5cf6]"
                placeholder="Repite tu nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full button button-primary py-2.5 text-xs font-semibold justify-center shadow-lg shadow-[#8b5cf6]/20"
          >
            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            <ArrowRight size={14} />
          </button>
        </form>
      </div>
    </main>
  )
}