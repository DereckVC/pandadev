import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

// Resuelve la API dinámica para evitar que caiga a localhost en producción
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

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const submit = async (event) => {
    event.preventDefault()
    try {
      const response = await fetch(`${API}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await response.json()
      setMessage(data.message)
      if (response.ok) {
        setTimeout(() => navigate('/login'), 1000)
      }
    } catch {
      setMessage('Error de conexión con el servidor')
    }
  }

  return (
    <main className="admin-login">
      <form className="login-panel" onSubmit={submit}>
        <span className="section-kicker">PANDADEV / SECURITY</span>
        <h1>Nueva contraseña</h1>
        <label>
          Contraseña
          <input
            type="password"
            minLength="8"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button className="button button-primary" type="submit">
          Actualizar contraseña
        </button>
        {message && <small className="form-notice">{message}</small>}
      </form>
    </main>
  )
}