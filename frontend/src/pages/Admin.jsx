import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Activity, Check, Code2, Download, Eye, EyeOff, Globe, Inbox, 
  Layers, LogOut, Mail, Menu, Pencil, Plus, RefreshCw, Send, Shield, 
  Trash2, Upload, Users, X, Info, ArrowLeft, Cpu
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const emptyProject = {
  title: '',
  slug: '',
  shortDesc: '',
  category: 'Web',
  tags: '',
  bannerUrl: '',
  vision: '',
  goals: '',
  inspiration: '',
  team: 'DereckVC (Panda158)',
  architecture: 'Frontend interactivo / Canvas y Luau',
  demoUrl: '',
  repoUrl: '',
  showGithubBtn: true,
  showDemoBtn: false,
  isPublic: true
}

const replyPresets = [
  {
    id: 'ack',
    title: 'Acuse y en revisión',
    subject: 'Hemos recibido tu consulta — PandaDev',
    text: 'Hola,\n\nGracias por comunicarte con PandaDev. He recibido tu mensaje y revisaré los requerimientos técnicos con atención. Me pondré en contacto contigo a la brevedad para coordinar los siguientes pasos.\n\nSaludos cordiales,\nDereckVC — PandaDev Systems'
  },
  {
    id: 'specs',
    title: 'Solicitud de especificaciones',
    subject: 'Detalles técnicos de tu proyecto — PandaDev',
    text: 'Hola,\n\nPara evaluar tu proyecto y preparar una propuesta precisa, ¿podrías detallarme el alcance, las funcionalidades deseadas y si requieres integración con algún servicio externo o base de datos específica?\n\nQuedo atento a tus comentarios.\nDereckVC — PandaDev Systems'
  },
  {
    id: 'availability',
    title: 'Disponibilidad inmediata',
    subject: 'Propuesta de inicio de proyecto — PandaDev',
    text: 'Hola,\n\nActualmente cuento con disponibilidad para comenzar el desarrollo de tu propuesta de inmediato. Podemos agendar una conversación breve o coordinar especificaciones directamente para empezar con la arquitectura inicial.\n\nAtentamente,\nDereckVC — PandaDev Systems'
  }
]

const categories = ['Todos', 'Web', 'Sistemas', 'Roblox / Luau', 'Minecraft Tools', 'Bots', 'Otros']

function ToggleSwitch({ checked, onChange, label, description, size = 'md' }) {
  const isSm = size === 'sm'
  return (
    <div 
      onClick={(e) => { e.stopPropagation(); onChange(!checked) }}
      className={`flex items-center gap-2.5 cursor-pointer select-none ${isSm ? '' : 'p-3 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#8b5cf6]/40 justify-between'}`}
    >
      {label && (
        <div>
          <span className={`block font-semibold text-white ${isSm ? 'text-[11px]' : 'text-xs'}`}>{label}</span>
          {description && <span className="block text-[11px] text-neutral-400">{description}</span>}
        </div>
      )}
      <div className={`relative inline-flex shrink-0 items-center rounded-full transition-colors duration-150 ${checked ? 'bg-[#8b5cf6]' : 'bg-neutral-800'} ${isSm ? 'h-5 w-9' : 'h-6 w-11'}`}>
        <span className={`inline-block rounded-full bg-white transition-transform duration-150 ${isSm ? 'h-3.5 w-3.5' : 'h-4 w-4'} ${checked ? (isSm ? 'translate-x-4.5' : 'translate-x-6') : 'translate-x-1'}`} />
      </div>
    </div>
  )
}

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

export default function Admin() {
  const { user, logout } = useAuth()
  const apiBase = getApiUrl()

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('panda_token') || ''
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  }, [])

  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('overview')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [formSection, setFormSection] = useState('card')
  const [stats, setStats] = useState(null)
  const [messages, setMessages] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [projectForm, setProjectForm] = useState(emptyProject)
  const [editingProject, setEditingProject] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalError, setModalError] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [syncingGithub, setSyncingGithub] = useState(false)

  // Estados de Respuesta y Presets
  const [replyingMessage, setReplyingMessage] = useState(null)
  const [selectedPresetId, setSelectedPresetId] = useState('ack')
  const [replySubject, setReplySubject] = useState('')
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const loadMessages = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/admin/messages`, { credentials: 'include', headers: authHeaders() })
      if (res.ok) {
        const m = await res.json()
        setMessages(m.messages || m)
      }
    } catch {
      // Manejo silencioso en polling
    }
  }, [apiBase, authHeaders])

  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/admin/projects`, { credentials: 'include', headers: authHeaders() })
      if (res.ok) {
        const p = await res.json()
        setProjects(p.projects || p)
      }
    } catch {}
  }, [apiBase, authHeaders])

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login', { replace: true })
      return
    }

    const loadInitialData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch(`${apiBase}/admin/stats`, { credentials: 'include', headers: authHeaders() }),
          fetch(`${apiBase}/admin/users`, { credentials: 'include', headers: authHeaders() })
        ])

        if (statsRes.ok) {
          const s = await statsRes.json()
          setStats(s.stats || s)
        }
        if (usersRes.ok) {
          const u = await usersRes.json()
          setUsers(u.users || u)
        }
        await Promise.all([loadProjects(), loadMessages()])
      } catch (err) {
        setError(err.message || 'Error al conectar con los servicios del panel')
      }
    }
    loadInitialData()

    // Sincronización automática periódica (Polling cada 8 segundos)
    const pollInterval = setInterval(() => {
      loadMessages()
    }, 8000)

    return () => clearInterval(pollInterval)
  }, [apiBase, authHeaders, loadMessages, loadProjects, navigate, user])

  // Limpiar contador rojo al entrar a la sección de mensajes
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setMobileSidebarOpen(false)
    if (tabId === 'messages') {
      setMessages((prev) => prev.map((m) => ({ ...m, read: true })))
    }
  }

  const request = async (url, options = {}) => {
    const res = await fetch(`${apiBase}${url}`, {
      credentials: 'include',
      ...options,
      headers: { ...authHeaders(), ...(options.headers || {}) }
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.message || 'La operación no se pudo completar')
    return data
  }

  const saveProject = async (e) => {
    e.preventDefault()
    setModalError('')
    try {
      const cleanShortDesc = projectForm.shortDesc?.trim() || projectForm.title.trim()
      const payload = {
        ...projectForm,
        description: cleanShortDesc,
        shortDesc: cleanShortDesc,
        longDesc: projectForm.vision?.trim() || cleanShortDesc,
        vision: projectForm.vision?.trim() || cleanShortDesc,
        goals: projectForm.goals?.trim() || 'Desarrollo continuo.',
        inspiration: projectForm.inspiration?.trim() || 'Comunidad PandaDev.',
        team: projectForm.team?.trim() || 'DereckVC (Panda158)',
        architecture: projectForm.architecture?.trim() || `${projectForm.category} / Full-Stack`,
        category: projectForm.category || 'Web',
        tags: typeof projectForm.tags === 'string'
          ? projectForm.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : (Array.isArray(projectForm.tags) ? projectForm.tags : []),
        slug: projectForm.slug?.trim() || projectForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        showGithubBtn: Boolean(projectForm.showGithubBtn),
        githubVisible: Boolean(projectForm.showGithubBtn),
        showDemoBtn: Boolean(projectForm.showDemoBtn),
        demoVisible: Boolean(projectForm.showDemoBtn),
        isPublic: Boolean(projectForm.isPublic),
      }

      await request(editingProject ? `/admin/projects/${editingProject}` : '/admin/projects', {
        method: editingProject ? 'PUT' : 'POST',
        body: JSON.stringify(payload)
      })

      setModalOpen(false)
      setEditingProject(null)
      setNotice('Proyecto guardado correctamente.')
      await loadProjects()
    } catch (err) {
      setModalError(err.message || 'No se pudo guardar el proyecto.')
    }
  }

  const deleteProject = async (id) => {
    if (!window.confirm('¿Eliminar definitivamente este proyecto?')) return
    try {
      await request(`/admin/projects/${id}`, { method: 'DELETE' })
      await loadProjects()
      setNotice('Proyecto eliminado.')
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleVisibility = async (project) => {
    const nextVal = !project.isPublic
    setProjects((prev) => prev.map((p) => (p._id === project._id ? { ...p, isPublic: nextVal } : p)))
    try {
      await request(`/admin/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isPublic: nextVal })
      })
    } catch (err) {
      setProjects((prev) => prev.map((p) => (p._id === project._id ? { ...p, isPublic: !nextVal } : p)))
      setError(`Error al cambiar visibilidad: ${err.message}`)
    }
  }

  const toggleGithub = async (project) => {
    const nextVal = !(project.showGithubBtn ?? project.githubVisible)
    setProjects((prev) => prev.map((p) => (p._id === project._id ? { ...p, showGithubBtn: nextVal, githubVisible: nextVal } : p)))
    try {
      await request(`/admin/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ showGithubBtn: nextVal, githubVisible: nextVal })
      })
    } catch (err) {
      setProjects((prev) => prev.map((p) => (p._id === project._id ? { ...p, showGithubBtn: !nextVal, githubVisible: !nextVal } : p)))
      setError(`Error en botón GitHub: ${err.message}`)
    }
  }

  const toggleDemo = async (project) => {
    const nextVal = !(project.showDemoBtn ?? project.demoVisible)
    setProjects((prev) => prev.map((p) => (p._id === project._id ? { ...p, showDemoBtn: nextVal, demoVisible: nextVal } : p)))
    try {
      await request(`/admin/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ showDemoBtn: nextVal, demoVisible: nextVal })
      })
    } catch (err) {
      setProjects((prev) => prev.map((p) => (p._id === project._id ? { ...p, showDemoBtn: !nextVal, demoVisible: !nextVal } : p)))
      setError(`Error en botón Demo: ${err.message}`)
    }
  }

  const toggleRole = async (account) => {
    try {
      await request(`/admin/users/${account._id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role: account.role === 'admin' ? 'user' : 'admin' })
      })
      const u = await request('/admin/users')
      setUsers(u.users || u)
      setNotice(`Rol de ${account.email} actualizado.`)
    } catch (err) {
      setError(err.message)
    }
  }

  const syncGithub = async () => {
    setSyncingGithub(true)
    setError('')
    try {
      const data = await request('/admin/github/sync', { method: 'POST' })
      await loadProjects()
      setNotice(`${data.count || 0} repositorio(s) sincronizados desde GitHub.`)
    } catch (err) {
      setError(err.message)
    } finally {
      setSyncingGithub(false)
    }
  }

  const exportProjectsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projects, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `pandadev_projects_${Date.now()}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleImportJson = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        if (!Array.isArray(parsed)) throw new Error('El archivo debe ser un arreglo de proyectos.')
        for (const item of parsed) {
          const { _id, createdAt, updatedAt, __v, ...cleanItem } = item
          await request('/admin/projects', { method: 'POST', body: JSON.stringify(cleanItem) })
        }
        await loadProjects()
        setNotice(`Se importaron ${parsed.length} proyecto(s).`)
      } catch (err) {
        setError(`Error al importar: ${err.message}`)
      }
    }
    reader.readAsText(file)
  }

  // Apertura del modal con presets
  const openReplyModal = (msg) => {
    setReplyingMessage(msg)
    setSelectedPresetId('ack')
    const defaultPreset = replyPresets[0]
    setReplySubject(`Re: Consulta sobre ${msg.category} — PandaDev`)
    setReplyText(defaultPreset.text)
  }

  const applyPreset = (preset) => {
    setSelectedPresetId(preset.id)
    setReplySubject(preset.subject)
    setReplyText(preset.text)
  }

  const sendReply = async (e) => {
    e.preventDefault()
    if (!replyingMessage) return
    setSendingReply(true)
    setError('')

    try {
      await request(`/admin/messages/${replyingMessage._id}/reply`, {
        method: 'POST',
        body: JSON.stringify({
          subject: replySubject,
          message: replyText
        })
      })
      const sentEmail = replyingMessage.email
      setReplyingMessage(null)
      setNotice(`Respuesta despachada con éxito a ${sentEmail}`)
      await loadMessages()
    } catch (err) {
      setError(`No se pudo enviar el correo: ${err.message}`)
    } finally {
      setSendingReply(false)
    }
  }

  // Eliminación con protección contra doble clic
  const handleDeleteMessage = async (e, id) => {
    e.stopPropagation()
    if (deletingId) return
    if (!window.confirm('¿Confirmas la eliminación definitiva de este mensaje?')) return

    setDeletingId(id)
    try {
      await request(`/admin/messages/${id}`, { method: 'DELETE' })
      setMessages((prev) => prev.filter((m) => m._id !== id))
      setNotice('Mensaje eliminado.')
    } catch (err) {
      setError(`Error al eliminar: ${err.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  if (!user || user.role !== 'admin') return null

  const unreadCount = messages.filter((m) => m.status === 'unread' && !m.read).length

  const menuSections = [
    {
      label: 'General',
      items: [
        { id: 'overview', label: 'Dashboard', icon: <Activity size={17} /> },
        { id: 'projects', label: 'Catálogo Proyectos', icon: <Code2 size={17} />, badge: projects.length },
      ]
    },
    {
      label: 'Comunicaciones',
      items: [
        { id: 'messages', label: 'Mensajes Recibidos', icon: <Mail size={17} />, badge: unreadCount, badgeAlert: true },
      ]
    },
    {
      label: 'Administración',
      items: [
        { id: 'users', label: 'Usuarios y Roles', icon: <Users size={17} /> },
        { id: 'settings', label: 'Estado del Servidor', icon: <Shield size={17} /> },
      ]
    }
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0d0d14] border-r border-white/10 p-5 select-none">
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 mb-6">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#8b5cf6] text-white font-black text-sm shadow-md">
          {(user.name || user.email || 'A')[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold text-white truncate">{user.name || 'Administrador'}</p>
          <p className="text-[11px] text-neutral-400 truncate">{user.email}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-[#8b5cf6]/20 text-[#c4b5fd] border border-[#8b5cf6]/30">
            ADMIN WORKSPACE
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
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#8b5cf6]/15 text-white border-l-2 border-[#8b5cf6] pl-3 shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-[#a855f7]' : 'text-neutral-500'}>{item.icon}</span>
                    {item.label}
                  </span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.badgeAlert ? 'bg-red-500 text-white' : 'bg-white/10 text-neutral-300'
                    }`}>
                      {item.badge}
                    </span>
                  )}
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
        {sidebarContent}
      </aside>

      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0d0d14]">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white"
        >
          <Menu size={16} /> Menú Admin
        </button>
        <span className="text-xs font-mono text-[#c4b5fd]">Command Center</span>
      </div>

      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}

      <main className="flex-1 p-4 sm:p-6 lg:p-10 max-w-6xl overflow-y-auto">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-3 py-1 text-[11px] font-mono tracking-wider text-[#d8b4fe]">
              ● PANEL ADMINISTRATIVO PRINCIPAL
            </span>
            <h1 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-white">
              PandaDev <span className="text-[#a855f7]">Command Center</span>
            </h1>
          </div>
          <span className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-mono self-start sm:self-center">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> SISTEMAS ONLINE
          </span>
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

        {activeTab === 'overview' && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={<Activity />} label="Visitas Totales" value={stats?.totalVisits ?? '—'} accent="violet" detail="TRÁFICO GLOBAL" />
              <StatCard icon={<Activity />} label="Visitantes Únicos Hoy" value={stats?.uniqueVisitsToday ?? '—'} accent="green" detail="ACTIVIDAD EN TIEMPO REAL" />
              <StatCard icon={<Users />} label="Usuarios Registrados" value={stats?.totalUsers ?? '—'} accent="cyan" detail="CUENTAS EN PLATAFORMA" />
              <StatCard icon={<Shield />} label="Cuentas Verificadas" value={stats ? `${stats.verifiedUsers ?? stats.totalUsers} (${stats.totalUsers ? Math.round(((stats.verifiedUsers ?? stats.totalUsers) / stats.totalUsers) * 100) : 100}%)` : '—'} accent="violet" />
              <StatCard icon={<Code2 />} label="Proyectos Publicados" value={stats?.totalProjects ?? projects.length} accent="violet" detail="CATÁLOGO ACTIVO" onClick={() => handleTabChange('projects')} />
              <StatCard icon={<Inbox />} label="Mensajes Totales" value={messages.length} accent="cyan" />
              <StatCard icon={<Inbox />} label="Mensajes Pendientes" value={unreadCount} accent="red" detail="REQUIEREN ATENCIÓN" onClick={() => handleTabChange('messages')} />
              <StatCard icon={<Activity />} label="Servidor & MongoDB" value="ONLINE" accent="green" detail="177MS ATLAS" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-5 sm:p-6">
                <h3 className="font-bold text-white mb-4">Tráfico por Dispositivo</h3>
                <div className="space-y-4">
                  <TrafficBar label="Desktop" value={stats?.traffic?.desktop || 0} total={(stats?.traffic?.desktop || 0) + (stats?.traffic?.mobile || 0)} color="bg-[#8b5cf6]" />
                  <TrafficBar label="Móvil" value={stats?.traffic?.mobile || 0} total={(stats?.traffic?.desktop || 0) + (stats?.traffic?.mobile || 0)} color="bg-[#06b6d4]" />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-5 sm:p-6">
                <h3 className="font-bold text-white mb-4">Acciones Rápidas</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => { setEditingProject(null); setProjectForm(emptyProject); setFormSection('card'); setModalError(''); setModalOpen(true) }} className="button button-primary text-xs py-3 justify-center">
                    <Plus size={16} /> Crear Proyecto
                  </button>
                  <button type="button" onClick={syncGithub} disabled={syncingGithub} className="button button-outline text-xs py-3 justify-center">
                    <RefreshCw size={16} className={syncingGithub ? 'animate-spin' : ''} /> Sync GitHub
                  </button>
                  <button type="button" onClick={exportProjectsJson} className="button button-outline text-xs py-3 justify-center">
                    <Download size={16} /> Exportar Backup
                  </button>
                  <button type="button" onClick={() => handleTabChange('messages')} className="button button-outline text-xs py-3 justify-center">
                    <Mail size={16} /> Ver Mensajes
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'projects' && (
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d0d14]/90 p-4 rounded-2xl border border-white/10">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => { setEditingProject(null); setProjectForm(emptyProject); setFormSection('card'); setModalError(''); setModalOpen(true) }} className="button button-primary">
                  <Plus size={16} /> Añadir Nuevo Proyecto
                </button>
                <button type="button" onClick={syncGithub} disabled={syncingGithub} className="button button-outline">
                  <RefreshCw size={16} className={syncingGithub ? 'animate-spin' : ''} />
                  {syncingGithub ? 'Sincronizando...' : 'Sincronizar con GitHub'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button type="button" onClick={exportProjectsJson} className="button button-outline text-xs">
                  <Download size={15} /> Exportar JSON
                </button>
                <label className="button button-outline text-xs cursor-pointer">
                  <Upload size={15} /> Importar JSON
                  <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid gap-4">
              {projects.length === 0 ? (
                <EmptyState text="No hay proyectos registrados en MongoDB Atlas." />
              ) : (
                projects.map((project) => (
                  <article key={project._id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-4 sm:p-5 lg:flex-row lg:items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <h2 className="font-bold text-base sm:text-lg text-white truncate">{project.title}</h2>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${project.isPublic ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                          {project.isPublic ? 'PÚBLICO' : 'BORRADOR'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate">{project.category} · Slug: <code className="text-purple-300">/{project.slug}</code></p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 bg-black/40 p-2.5 rounded-2xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-400">Visible</span>
                        <ToggleSwitch size="sm" checked={project.isPublic} onChange={() => toggleVisibility(project)} />
                      </div>
                      <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-400">Demo</span>
                        <ToggleSwitch size="sm" checked={project.showDemoBtn} onChange={() => toggleDemo(project)} />
                      </div>
                      <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-neutral-400">GitHub</span>
                        <ToggleSwitch size="sm" checked={project.showGithubBtn} onChange={() => toggleGithub(project)} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="button button-outline text-xs px-3 py-2"
                        type="button"
                        onClick={() => {
                          setEditingProject(project._id)
                          setProjectForm({
                            title: project.title || '',
                            slug: project.slug || '',
                            category: project.category || 'Web',
                            bannerUrl: project.bannerUrl || '',
                            shortDesc: project.shortDesc || project.description || '',
                            vision: project.vision || project.longDesc || project.shortDesc || '',
                            goals: project.goals || '',
                            inspiration: project.inspiration || '',
                            team: project.team || 'DereckVC (Panda158)',
                            architecture: project.architecture || '',
                            demoUrl: project.demoUrl || '',
                            repoUrl: project.repoUrl || project.githubUrl || '',
                            tags: Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || ''),
                            showGithubBtn: project.showGithubBtn ?? project.githubVisible ?? true,
                            showDemoBtn: project.showDemoBtn ?? project.demoVisible ?? false,
                            isPublic: project.isPublic ?? true,
                          })
                          setFormSection('card')
                          setModalError('')
                          setModalOpen(true)
                        }}
                      >
                        <Pencil size={13} /> Editar
                      </button>

                      <button
                        className="button border border-red-400/30 text-red-300 hover:bg-red-400/10 text-xs px-2.5 py-2"
                        type="button"
                        onClick={() => deleteProject(project._id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        )}

        {activeTab === 'messages' && (
          <section className="space-y-4">
            {messages.length === 0 ? (
              <EmptyState text="No hay mensajes de contacto pendientes." />
            ) : (
              messages.map((item) => (
                <article key={item._id} className={`p-5 sm:p-6 rounded-2xl border bg-[#0d0d14]/90 ${item.status === 'replied' ? 'border-white/10' : 'border-[#8b5cf6]/50 shadow-[0_0_15px_rgba(139,92,246,0.15)]'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-base sm:text-lg text-white">{item.name}</h2>
                        {item.status !== 'replied' && !item.read && <span className="bg-[#8b5cf6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NUEVO</span>}
                      </div>
                      <a className="text-sm text-[#c4b5fd] hover:underline" href={`mailto:${item.email}`}>{item.email}</a>
                    </div>
                    <div className="text-right text-xs text-neutral-400">
                      <span className="block font-semibold text-neutral-200">{item.category}</span>
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="bg-black/40 p-4 rounded-xl text-sm leading-relaxed text-neutral-300 mb-4 whitespace-pre-wrap">{item.message}</p>
                  
                  {item.reply && (
                    <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 text-xs text-purple-200 mb-4">
                      <span className="font-mono text-[10px] text-purple-400 uppercase block mb-1">Última respuesta enviada:</span>
                      {item.reply}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button 
                      type="button" 
                      onClick={() => openReplyModal(item)} 
                      className="button button-primary text-xs py-2 transition-transform duration-150 active:scale-95"
                    >
                      <Send size={13} /> Responder con Preset
                    </button>
                    <button 
                      type="button" 
                      disabled={deletingId === item._id}
                      onClick={(e) => handleDeleteMessage(e, item._id)} 
                      className="button border border-red-400/30 text-red-300 hover:bg-red-400/10 text-xs py-2 transition-transform duration-150 active:scale-95 disabled:opacity-50"
                    >
                      <Trash2 size={13} /> {deletingId === item._id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        )}

        {activeTab === 'users' && (
          <section className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d0d14]/90">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="p-4">Usuario</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Proveedor</th>
                  <th className="p-4">Registro</th>
                  <th className="p-4">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((account) => (
                  <tr className="hover:bg-white/[0.02] text-neutral-300" key={account._id}>
                    <td className="p-4 font-medium text-white">{account.name || 'Sin nombre'}</td>
                    <td className="p-4">{account.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-mono ${account.role === 'admin' ? 'bg-[#8b5cf6]/20 text-[#d8b4fe]' : 'bg-neutral-800 text-neutral-300'}`}>
                        {account.role?.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-neutral-400 capitalize">{account.provider || 'local'}</td>
                    <td className="p-4 text-neutral-400">{new Date(account.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <button className="text-[#c4b5fd] hover:text-white" type="button" onClick={() => toggleRole(account)}>
                        Cambiar rol
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="space-y-6">
            <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-6 space-y-4">
              <h3 className="font-bold text-white text-lg">Entorno de Producción Oficial</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-neutral-300">
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <span className="block text-xs text-neutral-500 uppercase">Dominio Oficial</span>
                  <span className="font-mono text-white">https://www.pandadev.me</span>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <span className="block text-xs text-neutral-500 uppercase">Correo de Soporte Oficial</span>
                  <span className="font-mono text-purple-300">support@pandadev.me</span>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <span className="block text-xs text-neutral-500 uppercase">Estado de Infraestructura</span>
                  <span className="font-mono text-emerald-400">Servidores en Línea (SSL Activo)</span>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <span className="block text-xs text-neutral-500 uppercase">Base de Datos</span>
                  <span className="font-mono text-emerald-400">MongoDB Atlas (Cluster Conectado)</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="relative w-full max-w-3xl my-auto max-h-[92vh] flex flex-col rounded-3xl border border-[#8b5cf6]/40 bg-[#0d0d14] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0 bg-[#0d0d14]">
              <div>
                <h2 className="text-xl font-bold text-white">{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
                <p className="text-xs text-neutral-400 mt-0.5">Configura la card del catálogo y la ventana flotante detallada.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-white/10 bg-black/30 p-2 gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setFormSection('card')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
                  formSection === 'card' ? 'bg-[#8b5cf6] text-white shadow-md' : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                🎴 Portada / Card (Catálogo)
              </button>
              <button
                type="button"
                onClick={() => setFormSection('modal')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition ${
                  formSection === 'modal' ? 'bg-[#8b5cf6] text-white shadow-md' : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                🔍 Ventana Flotante (Modal Detallado)
              </button>
            </div>

            <form id="project-form" onSubmit={saveProject} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {modalError && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs leading-relaxed">
                  {modalError}
                </div>
              )}

              {formSection === 'card' && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs text-neutral-300">
                      Título del Proyecto *
                      <input 
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" 
                        value={projectForm.title} 
                        onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} 
                        required 
                      />
                      <span className="text-[11px] text-neutral-500 mt-1 block">Nombre visible en la card principal.</span>
                    </label>

                    <label className="text-xs text-neutral-300">
                      Slug (URL amigable)
                      <input 
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" 
                        value={projectForm.slug} 
                        onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })} 
                        placeholder="ej: mi-nuevo-proyecto"
                      />
                      <span className="text-[11px] text-neutral-500 mt-1 block">Ruta directa: /proyectos/slug</span>
                    </label>

                    <label className="text-xs text-neutral-300">
                      Categoría
                      <select 
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#111118] px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" 
                        value={projectForm.category} 
                        onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                      >
                        {categories.filter((c) => c !== 'Todos').map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      <span className="text-[11px] text-neutral-500 mt-1 block">Filtro en el que se ubicará en la web.</span>
                    </label>

                    <label className="text-xs text-neutral-300">
                      Imagen de Portada (Banner URL)
                      <input 
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" 
                        value={projectForm.bannerUrl} 
                        onChange={(e) => setProjectForm({ ...projectForm, bannerUrl: e.target.value })} 
                        placeholder="https://..."
                      />
                      <span className="text-[11px] text-neutral-500 mt-1 block">Foto principal de la card y el modal.</span>
                    </label>
                  </div>

                  <label className="block text-xs text-neutral-300">
                    Descripción Breve (Card Summary) *
                    <textarea
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]"
                      rows="2"
                      value={projectForm.shortDesc}
                      onChange={(e) => setProjectForm({ ...projectForm, shortDesc: e.target.value })}
                      required
                    />
                    <span className="text-[11px] text-neutral-500 mt-1 block">Texto corto visible directamente en la card.</span>
                  </label>

                  <label className="block text-xs text-neutral-300">
                    Tags de Tecnologías
                    <input
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]"
                      value={projectForm.tags}
                      onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                      placeholder="React, Luau, Tailwind, API"
                    />
                    <span className="text-[11px] text-neutral-500 mt-1 block">Separados por coma.</span>
                  </label>

                  <ToggleSwitch
                    checked={projectForm.isPublic}
                    onChange={(val) => setProjectForm({ ...projectForm, isPublic: val })}
                    label="Publicar Proyecto"
                    description="Si se desactiva, queda como borrador oculto."
                  />
                </div>
              )}

              {formSection === 'modal' && (
                <div className="space-y-4">
                  <label className="block text-xs text-neutral-300">
                    Visión & Propósito
                    <textarea
                      className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]"
                      rows="3"
                      value={projectForm.vision}
                      onChange={(e) => setProjectForm({ ...projectForm, vision: e.target.value })}
                      placeholder="Detalles sobre el propósito del sistema..."
                    />
                    <span className="text-[11px] text-neutral-500 mt-1 block">Texto principal en el modal.</span>
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs text-neutral-300">
                      Objetivos Técnicos
                      <textarea
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]"
                        rows="3"
                        value={projectForm.goals}
                        onChange={(e) => setProjectForm({ ...projectForm, goals: e.target.value })}
                        placeholder="Objetivos logrados..."
                      />
                      <span className="text-[11px] text-neutral-500 mt-1 block">Bloque 'Objetivos' del modal.</span>
                    </label>

                    <label className="text-xs text-neutral-300">
                      Inspiración
                      <textarea
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]"
                        rows="3"
                        value={projectForm.inspiration}
                        onChange={(e) => setProjectForm({ ...projectForm, inspiration: e.target.value })}
                        placeholder="Origen de la idea..."
                      />
                      <span className="text-[11px] text-neutral-500 mt-1 block">Bloque 'Inspiración' del modal.</span>
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-xs text-neutral-300">
                      Equipo / Desarrollador
                      <input 
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" 
                        value={projectForm.team} 
                        onChange={(e) => setProjectForm({ ...projectForm, team: e.target.value })} 
                      />
                      <span className="text-[11px] text-neutral-500 mt-1 block">Ej: En solitario (Panda158)</span>
                    </label>

                    <label className="text-xs text-neutral-300">
                      Arquitectura & Rol
                      <input 
                        className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" 
                        value={projectForm.architecture} 
                        onChange={(e) => setProjectForm({ ...projectForm, architecture: e.target.value })} 
                      />
                      <span className="text-[11px] text-neutral-500 mt-1 block">Ej: Frontend interactivo / Canvas y Luau</span>
                    </label>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs text-neutral-300">
                        Demo URL (Enlace del Proyecto)
                        <input 
                          className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" 
                          value={projectForm.demoUrl} 
                          onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })} 
                          placeholder="https://..."
                        />
                      </label>
                      <ToggleSwitch
                        checked={projectForm.showDemoBtn}
                        onChange={(val) => setProjectForm({ ...projectForm, showDemoBtn: val })}
                        label="Mostrar Botón Demo"
                        description="Habilita 'Ver proyecto ↗'"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs text-neutral-300">
                        GitHub Repo URL
                        <input 
                          className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" 
                          value={projectForm.repoUrl} 
                          onChange={(e) => setProjectForm({ ...projectForm, repoUrl: e.target.value })} 
                          placeholder="https://github.com/..."
                        />
                      </label>
                      <ToggleSwitch
                        checked={projectForm.showGithubBtn}
                        onChange={(val) => setProjectForm({ ...projectForm, showGithubBtn: val })}
                        label="Mostrar Botón GitHub"
                        description="Habilita enlace al repositorio"
                      />
                    </div>
                  </div>
                </div>
              )}
            </form>

            <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0d0d14] flex items-center justify-between shrink-0">
              <span className="text-[11px] text-neutral-500 flex items-center gap-1.5">
                <Info size={13} /> Los cambios se sincronizan en vivo.
              </span>
              <div className="flex gap-2">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="button button-outline text-xs px-4 py-2.5"
                >
                  Cancelar
                </button>
                <button 
                  form="project-form" 
                  type="submit" 
                  className="button button-primary text-xs px-5 py-2.5 font-semibold"
                >
                  Guardar Proyecto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Respuestas con Presets */}
      {replyingMessage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => { if (e.target === e.currentTarget) setReplyingMessage(null) }}
        >
          <div className="relative w-full max-w-xl my-auto max-h-[92vh] flex flex-col rounded-3xl border border-[#8b5cf6]/40 bg-[#0d0d14] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-white">Responder a {replyingMessage.name}</h3>
              <button type="button" onClick={() => setReplyingMessage(null)} className="text-neutral-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <span className="text-xs text-neutral-400 block mb-1.5 font-medium">Seleccionar Preset:</span>
                <div className="flex flex-wrap gap-2">
                  {replyPresets.map((preset) => {
                    const isSelected = selectedPresetId === preset.id
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyPreset(preset)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 transform active:scale-95 ${
                          isSelected
                            ? 'border border-[#8b5cf6] bg-[#8b5cf6]/25 text-white shadow-sm shadow-[#8b5cf6]/30'
                            : 'border border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {preset.title}
                      </button>
                    )
                  })}
                </div>
              </div>
              <label className="block text-xs text-neutral-300">Asunto
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" value={replySubject} onChange={(e) => setReplySubject(e.target.value)} />
              </label>
              <label className="block text-xs text-neutral-300">Mensaje (desde support@pandadev.me)
                <textarea rows="5" className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6] leading-relaxed resize-none" value={replyText} onChange={(e) => setReplyText(e.target.value)} />
              </label>
            </div>
            <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0d0d14] flex justify-end gap-2.5 shrink-0">
              <button type="button" onClick={() => setReplyingMessage(null)} className="button button-outline text-xs px-4 py-2">Cancelar</button>
              <button type="button" onClick={sendReply} disabled={sendingReply} className="button button-primary text-xs px-4 py-2 transition-transform duration-150 active:scale-95 disabled:opacity-60">
                <Send size={13} /> {sendingReply ? 'Enviando...' : 'Enviar Respuesta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, accent, detail, onClick }) {
  return (
    <article
      className={`rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-4 sm:p-5 transition hover:-translate-y-1 hover:border-[#8b5cf6]/50 ${onClick ? 'cursor-pointer' : ''}`}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) onClick() }}
    >
      <div className={`mb-3 sm:mb-4 ${accent === 'red' ? 'text-red-300' : accent === 'cyan' ? 'text-cyan-300' : accent === 'green' ? 'text-emerald-300' : 'text-[#c4b5fd]'}`}>{icon}</div>
      <p className="text-xs text-neutral-400">{label}</p>
      <strong className="mt-1 block text-2xl sm:text-3xl font-black text-white">{value}</strong>
      {detail && <span className="mt-1.5 block text-[10px] tracking-wider text-emerald-300">● {detail}</span>}
    </article>
  )
}

function TrafficBar({ label, value, total, color }) {
  const percentage = total ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs text-neutral-400">
        <span>{label}</span>
        <span>{percentage}% · {value} visitas</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/15 bg-[#0d0d14]/70 p-12 text-center text-neutral-400">
      <Inbox className="mx-auto mb-3 text-[#a855f7]" size={28} />
      <p className="text-sm">{text}</p>
    </div>
  )
}