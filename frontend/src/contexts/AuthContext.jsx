import { createContext, useContext, useEffect, useState } from 'react'

// Resuelve dinámicamente la API: si está en producción y falta la variable, recurre directo a Render
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

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = async (overrideToken) => {
    const activeToken = overrideToken || localStorage.getItem('panda_token')
    if (!activeToken) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`${API}/auth/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeToken}`,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data?.user || data)
      } else {
        localStorage.removeItem('panda_token')
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    // Lee 'token' o 'auth' procedentes del callback OAuth de Google, Discord o GitHub
    const tokenFromUrl = params.get('token') || params.get('auth')

    if (tokenFromUrl) {
      localStorage.setItem('panda_token', tokenFromUrl)
      // Limpia la barra de direcciones sin recargar la página
      window.history.replaceState({}, document.title, window.location.pathname)
      fetchUser(tokenFromUrl)
    } else {
      fetchUser()
    }
  }, [])

  // Inicio de sesión con correo y contraseña
  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al iniciar sesión')

    if (data.token) {
      localStorage.setItem('panda_token', data.token)
    }
    setUser(data.user)
    return data
  }

  // Registro de usuario nuevo
  const register = async (name, email, password) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'Error al registrar la cuenta')

    if (data.token) {
      localStorage.setItem('panda_token', data.token)
    }
    setUser(data.user)
    return data
  }

  // Métodos originales conservados para máxima compatibilidad
  const authenticate = (data) => {
    if (data.token) localStorage.setItem('panda_token', data.token)
    setUser(data.user)
  }

  const updateUser = (next) => setUser(next)

  // Actualizar datos del perfil
  const updateProfile = async (updates) => {
    const token = localStorage.getItem('panda_token')
    const res = await fetch(`${API}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || ''}`,
      },
      credentials: 'include',
      body: JSON.stringify(updates),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'No se pudo actualizar el perfil')
    setUser(data.user || data)
    return data
  }

  // Cambiar contraseña
  const changePassword = async (currentPassword, newPassword) => {
    const token = localStorage.getItem('panda_token')
    const res = await fetch(`${API}/auth/change-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || ''}`,
      },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'No se pudo cambiar la contraseña')
    return data
  }

  const logout = async () => {
    await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {})
    localStorage.removeItem('panda_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        authenticate,
        updateUser,
        updateProfile,
        changePassword,
        logout,
        api: API,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)