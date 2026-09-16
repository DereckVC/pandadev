import { createContext, useContext, useEffect, useState } from 'react'

// Asegura que siempre termine en /api sin importar cómo esté configurado VITE_API_URL
const getApiUrl = () => {
  const url = import.meta.env.VITE_API_URL || '/api'
  return url.endsWith('/api') ? url : `${url.replace(/\/+$/, '')}/api`
}
const API = getApiUrl()

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    // Lee tanto 'auth' como 'token' para máxima compatibilidad
    const token = params.get('auth') || params.get('token')

    if (token) {
      localStorage.setItem('panda_token', token)
      window.history.replaceState({}, '', window.location.pathname)
    }

    const saved = token || localStorage.getItem('panda_token')

    fetch(`${API}/auth/me`, {
      credentials: 'include',
      headers: saved ? { Authorization: `Bearer ${saved}` } : {}
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setUser(data?.user || null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const authenticate = (data) => {
    if (data.token) localStorage.setItem('panda_token', data.token)
    setUser(data.user)
  }

  const logout = async () => {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {})
    localStorage.removeItem('panda_token')
    setUser(null)
  }

  const updateUser = (next) => setUser(next)

  return (
    <AuthContext.Provider value={{ user, loading, authenticate, updateUser, logout, api: API }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)