import { useEffect, useState } from 'react'
import { 
  Activity, Check, Code2, Download, Eye, EyeOff, Inbox, 
  Mail, Pencil, Plus, RefreshCw, Send, Shield, Trash2, Upload, Users, X 
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const emptyProject = {
  title: '',
  slug: '',
  shortDesc: '',
  category: 'Web',
  tags: '',
  bannerUrl: '',
  demoUrl: '',
  repoUrl: '',
  showGithubBtn: true,
  showDemoBtn: false,
  isPublic: true
}

const replyPresets = [
  {
    title: 'Acuse y en revisión',
    subject: 'Hemos recibido tu consulta — PandaDev',
    text: 'Hola,\n\nGracias por comunicarte con PandaDev. He recibido tu mensaje y revisaré los requerimientos técnicos con atención. Me pondré en contacto contigo a la brevedad para coordinar los siguientes pasos.\n\nSaludos cordiales,\nDereckVC — PandaDev Systems'
  },
  {
    title: 'Solicitud de especificaciones',
    subject: 'Detalles técnicos de tu proyecto — PandaDev',
    text: 'Hola,\n\nPara evaluar tu proyecto y preparar una propuesta precisa, ¿podrías detallarme el alcance, las funcionalidades deseadas y si requieres integración con algún servicio externo o base de datos específica?\n\nQuedo atento a tus comentarios.\nDereckVC — PandaDev Systems'
  },
  {
    title: 'Disponibilidad inmediata',
    subject: 'Propuesta de inicio de proyecto — PandaDev',
    text: 'Hola,\n\nActualmente cuento con disponibilidad para comenzar el desarrollo de tu propuesta de inmediato. Podemos agendar una conversación breve o coordinar especificaciones directamente para empezar con la arquitectura inicial.\n\nAtentamente,\nDereckVC — PandaDev Systems'
  }
]

const categories = ['Todos', 'Web', 'Sistemas', 'Roblox / Luau', 'Minecraft Tools', 'Bots', 'Otros']

export default function Admin() {
  const { user, api } = useAuth()
  const apiBase = api?.endsWith('/api') ? api : `${(api || '/api').replace(/\/+$/, '')}/api`
  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('panda_token') || ''}`,
  })
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('overview')
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

  const [replyingMessage, setReplyingMessage] = useState(null)
  const [replySubject, setReplySubject] = useState('')
  const [replyText, setReplyText] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login', { replace: true })
      return
    }

    const loadData = async () => {
      try {
        const [statsRes, usersRes, projectsRes, messagesRes] = await Promise.all([
          fetch(`${apiBase}/admin/stats`, { credentials: 'include', headers: authHeaders() }),
          fetch(`${apiBase}/admin/users`, { credentials: 'include', headers: authHeaders() }),
          fetch(`${apiBase}/admin/projects`, { credentials: 'include', headers: authHeaders() }),
          fetch(`${apiBase}/contact`, { credentials: 'include', headers: authHeaders() })
        ])

        if (statsRes.ok) setStats(await statsRes.json())
        if (usersRes.ok) setUsers(await usersRes.json())
        if (projectsRes.ok) setProjects(await projectsRes.json())
        if (messagesRes.ok) setMessages(await messagesRes.json())
      } catch (err) {
        setError(err.message || 'Error al conectar con los servicios del panel')
      }
    }
    loadData()
  }, [apiBase, navigate, user])

  const loadProjects = async () => {
    const res = await fetch(`${apiBase}/admin/projects`, { credentials: 'include', headers: authHeaders() })
    if (res.ok) setProjects(await res.json())
  }

  const loadMessages = async () => {
    const res = await fetch(`${apiBase}/contact`, { credentials: 'include', headers: authHeaders() })
    if (res.ok) setMessages(await res.json())
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
      const cleanDesc = projectForm.shortDesc?.trim() || projectForm.title.trim()
      const payload = {
        ...projectForm,
        // Compatibilidad total con el esquema de MongoDB
        description: cleanDesc,
        shortDesc: cleanDesc,
        longDesc: cleanDesc,
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
      setModalError(err.message || 'No se pudo guardar el proyecto. Revisa los datos.')
    }
  }

  const deleteProject = async (id) => {
    if (!window.confirm('¿Eliminar definitivamente este proyecto de la base de datos?')) return
    try {
      await request(`/admin/projects/${id}`, { method: 'DELETE' })
      await loadProjects()
      setNotice('Proyecto eliminado con éxito.')
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleVisibility = async (project) => {
    const nextVal = !project.isPublic
    try {
      await request(`/admin/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ isPublic: nextVal })
      })
      await loadProjects()
      setNotice(`Proyecto ${nextVal ? 'publicado' : 'ocultado'}.`)
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleGithub = async (project) => {
    const nextVal = !(project.showGithubBtn ?? project.githubVisible)
    try {
      await request(`/admin/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ showGithubBtn: nextVal, githubVisible: nextVal })
      })
      await loadProjects()
      setNotice(`GitHub ${nextVal ? 'activado' : 'desactivado'}.`)
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleDemo = async (project) => {
    const nextVal = !(project.showDemoBtn ?? project.demoVisible)
    try {
      await request(`/admin/projects/${project._id}`, {
        method: 'PUT',
        body: JSON.stringify({ showDemoBtn: nextVal, demoVisible: nextVal })
      })
      await loadProjects()
      setNotice(`Demo ${nextVal ? 'activado' : 'desactivado'}.`)
    } catch (err) {
      setError(err.message)
    }
  }

  const toggleRole = async (account) => {
    try {
      await request(`/admin/users/${account._id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: account.role === 'admin' ? 'user' : 'admin' })
      })
      setUsers(await request('/admin/users'))
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
    downloadAnchor.setAttribute('download', `pandadev_projects_backup_${Date.now()}.json`)
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
        if (!Array.isArray(parsed)) throw new Error('El archivo JSON debe contener un arreglo de proyectos.')
        for (const item of parsed) {
          const { _id, createdAt, updatedAt, __v, ...cleanItem } = item
          await request('/admin/projects', { method: 'POST', body: JSON.stringify(cleanItem) })
        }
        await loadProjects()
        setNotice(`Se importaron ${parsed.length} proyecto(s) correctamente.`)
      } catch (err) {
        setError(`Error al importar archivo: ${err.message}`)
      }
    }
    reader.readAsText(file)
  }

  const openReplyModal = (msg) => {
    setReplyingMessage(msg)
    setReplySubject(`Re: Consulta sobre ${msg.category} — PandaDev`)
    setReplyText(replyPresets[0].text)
  }

  const sendReply = async (e) => {
    e.preventDefault()
    setSendingReply(true)
    try {
      await request(`/contact/${replyingMessage._id}/reply`, {
        method: 'POST',
        body: JSON.stringify({ subject: replySubject, replyText })
      })
      setReplyingMessage(null)
      setNotice('Respuesta enviada correctamente por correo.')
      await loadMessages()
    } catch (err) {
      setError(err.message)
    } finally {
      setSendingReply(false)
    }
  }

  if (!user || user.role !== 'admin') return null

  const tabs = [
    ['overview', '📊 Vista General'],
    ['projects', '💻 Proyectos'],
    ['messages', `📩 Mensajes (${messages.filter((m) => !m.read).length})`],
    ['users', '👥 Usuarios'],
    ['settings', '⚙️ Estado del Servidor']
  ]

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-12 bg-[#07070a]">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-4 py-1.5 text-xs font-mono tracking-wider text-[#d8b4fe]">
              ● CONTROL DE SISTEMAS · PANEL ADMINISTRADOR
            </span>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">
              PandaDev <span className="text-[#a855f7]">Command Center</span>
            </h1>
          </div>
          <span className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-mono self-start sm:self-center">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            SISTEMAS ONLINE
          </span>
        </header>

        {/* Pestañas Principales */}
        <div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-2">
          {tabs.map(([id, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                activeTab === id ? 'bg-[#8b5cf6] text-white shadow-lg' : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

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

        {/* 1. Vista General */}
        {activeTab === 'overview' && (
          <section className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={<Activity />} label="Visitas Totales" value={stats?.totalVisits ?? '—'} accent="violet" detail="TRÁFICO GLOBAL" />
              <StatCard icon={<Activity />} label="Visitantes Únicos Hoy" value={stats?.uniqueVisitsToday ?? '—'} accent="green" detail="ACTIVIDAD EN TIEMPO REAL" />
              <StatCard icon={<Users />} label="Usuarios Registrados" value={stats?.totalUsers ?? '—'} accent="cyan" detail="CUENTAS EN PLATAFORMA" />
              <StatCard icon={<Shield />} label="Cuentas Verificadas" value={stats ? `${stats.verifiedUsers} (${stats.totalUsers ? Math.round((stats.verifiedUsers / stats.totalUsers) * 100) : 0}%)` : '—'} accent="violet" />
              <StatCard icon={<Code2 />} label="Proyectos Publicados" value={stats?.totalProjects ?? projects.length} accent="violet" detail="CATÁLOGO ACTIVO" onClick={() => setActiveTab('projects')} />
              <StatCard icon={<Inbox />} label="Mensajes Totales" value={messages.length} accent="cyan" />
              <StatCard icon={<Inbox />} label="Mensajes Pendientes" value={messages.filter((m) => !m.read).length} accent="red" detail="REQUIEREN ATENCIÓN" onClick={() => setActiveTab('messages')} />
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
                  <button onClick={() => { setEditingProject(null); setProjectForm(emptyProject); setModalError(''); setModalOpen(true); }} className="button button-primary text-xs py-3 justify-center">
                    <Plus size={16} /> Crear Proyecto
                  </button>
                  <button onClick={syncGithub} disabled={syncingGithub} className="button button-outline text-xs py-3 justify-center">
                    <RefreshCw size={16} className={syncingGithub ? 'animate-spin' : ''} /> Sincronizar GitHub
                  </button>
                  <button onClick={exportProjectsJson} className="button button-outline text-xs py-3 justify-center">
                    <Download size={16} /> Exportar Backup
                  </button>
                  <button onClick={() => setActiveTab('messages')} className="button button-outline text-xs py-3 justify-center">
                    <Mail size={16} /> Ver Mensajes
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 2. Catálogo de Proyectos */}
        {activeTab === 'projects' && (
          <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0d0d14]/90 p-4 rounded-2xl border border-white/10">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setEditingProject(null); setProjectForm(emptyProject); setModalError(''); setModalOpen(true); }} className="button button-primary">
                  <Plus size={16} /> Añadir Nuevo Proyecto
                </button>
                <button onClick={syncGithub} disabled={syncingGithub} className="button button-outline">
                  <RefreshCw size={16} className={syncingGithub ? 'animate-spin' : ''} />
                  {syncingGithub ? 'Sincronizando...' : 'Sincronizar con GitHub'}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={exportProjectsJson} className="button button-outline text-xs">
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
                <EmptyState text="No hay proyectos en la base de datos. Pulsa 'Añadir Nuevo Proyecto' o 'Sincronizar con GitHub'." />
              ) : (
                projects.map((project) => (
                  <article key={project._id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-4 sm:p-5 md:flex-row md:items-center">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2.5 mb-1">
                        <h2 className="font-bold text-base sm:text-lg text-white truncate">{project.title}</h2>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${project.isPublic ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                          {project.isPublic ? 'PÚBLICO' : 'BORRADOR'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 truncate">{project.category} · Slug: <code className="text-purple-300">/{project.slug}</code></p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => toggleVisibility(project)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                          project.isPublic ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-neutral-600 bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {project.isPublic ? <Eye size={13} /> : <EyeOff size={13} />}
                        {project.isPublic ? 'Visible' : 'Oculto'}
                      </button>

                      <button
                        className={`rounded-full px-3 py-1 text-xs transition ${project.showDemoBtn ? 'bg-purple-400/15 text-purple-300' : 'bg-white/10 text-neutral-400'}`}
                        type="button"
                        onClick={() => toggleDemo(project)}
                      >
                        Demo {project.showDemoBtn ? 'On' : 'Off'}
                      </button>

                      <button
                        className={`rounded-full px-3 py-1 text-xs transition ${project.showGithubBtn ? 'bg-emerald-400/15 text-emerald-300' : 'bg-white/10 text-neutral-400'}`}
                        type="button"
                        onClick={() => toggleGithub(project)}
                      >
                        GitHub {project.showGithubBtn ? 'On' : 'Off'}
                      </button>

                      <button
                        className="button button-outline text-xs px-3 py-1.5"
                        type="button"
                        onClick={() => {
                          setEditingProject(project._id)
                          setProjectForm({
                            title: project.title || '',
                            slug: project.slug || '',
                            category: project.category || 'Web',
                            bannerUrl: project.bannerUrl || '',
                            demoUrl: project.demoUrl || '',
                            repoUrl: project.repoUrl || project.githubUrl || '',
                            shortDesc: project.shortDesc || project.description || '',
                            tags: Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || ''),
                            showGithubBtn: project.showGithubBtn ?? project.githubVisible ?? true,
                            showDemoBtn: project.showDemoBtn ?? project.demoVisible ?? false,
                            isPublic: project.isPublic ?? true,
                          })
                          setModalError('')
                          setModalOpen(true)
                        }}
                      >
                        <Pencil size={13} /> Editar
                      </button>

                      <button
                        className="button border border-red-400/30 text-red-300 hover:bg-red-400/10 text-xs px-2.5 py-1.5"
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

        {/* 3. Mensajes de Contacto con Presets */}
        {activeTab === 'messages' && (
          <section className="space-y-4">
            {messages.length === 0 ? (
              <EmptyState text="No hay mensajes de contacto registrados." />
            ) : (
              messages.map((item) => (
                <article key={item._id} className={`p-5 sm:p-6 rounded-2xl border bg-[#0d0d14]/90 ${item.read ? 'border-white/10' : 'border-[#8b5cf6]/50 shadow-[0_0_15px_rgba(139,92,246,0.15)]'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-base sm:text-lg text-white">{item.name}</h2>
                        {!item.read && <span className="bg-[#8b5cf6] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">NUEVO</span>}
                      </div>
                      <a className="text-sm text-[#c4b5fd] hover:underline" href={`mailto:${item.email}`}>{item.email}</a>
                    </div>
                    <div className="text-right text-xs text-neutral-400">
                      <span className="block font-semibold text-neutral-200">{item.category}</span>
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="bg-black/40 p-4 rounded-xl text-sm leading-relaxed text-neutral-300 mb-4 whitespace-pre-wrap">{item.message}</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => openReplyModal(item)} className="button button-primary text-xs py-2">
                      <Send size={13} /> Responder con Preset
                    </button>
                    <button onClick={() => request(`/contact/${item._id}`, { method: 'DELETE' }).then(loadMessages)} className="button border border-red-400/30 text-red-300 hover:bg-red-400/10 text-xs py-2">
                      <Trash2 size={13} /> Eliminar
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
        )}

        {/* 4. Usuarios */}
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

        {/* 5. Estado del Servidor */}
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
                  <span className="block text-xs text-neutral-500 uppercase">Correo de Soporte</span>
                  <span className="font-mono text-purple-300">support@pandadev.me</span>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <span className="block text-xs text-neutral-500 uppercase">Backend API</span>
                  <span className="font-mono text-neutral-300">{apiBase}</span>
                </div>
                <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                  <span className="block text-xs text-neutral-500 uppercase">Base de Datos</span>
                  <span className="font-mono text-emerald-400">MongoDB Atlas (Online)</span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>

      {/* Modal de Crear / Editar Proyecto (Diseño Scrollable Resistente a Resize) */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setModalOpen(false) }}
        >
          <div className="relative w-full max-w-2xl my-auto max-h-[92vh] flex flex-col rounded-3xl border border-[#8b5cf6]/40 bg-[#0d0d14] shadow-2xl overflow-hidden">
            {/* Cabecera Fija */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0 bg-[#0d0d14]">
              <h2 className="text-xl font-bold text-white">{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2>
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cuerpo del Formulario con Scroll Interno */}
            <form id="project-form" onSubmit={saveProject} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {modalError && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs leading-relaxed">
                  {modalError}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs text-neutral-300">
                  Título *
                  <input 
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" 
                    value={projectForm.title} 
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} 
                    required 
                  />
                </label>
                <label className="text-xs text-neutral-300">
                  Slug (URL)
                  <input 
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" 
                    value={projectForm.slug} 
                    onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })} 
                    placeholder="autogenerado si se deja vacío"
                  />
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
                </label>
                <label className="text-xs text-neutral-300">
                  Imagen / Banner URL
                  <input 
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" 
                    value={projectForm.bannerUrl} 
                    onChange={(e) => setProjectForm({ ...projectForm, bannerUrl: e.target.value })} 
                  />
                </label>
                <label className="text-xs text-neutral-300">
                  Demo URL
                  <input 
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" 
                    value={projectForm.demoUrl} 
                    onChange={(e) => setProjectForm({ ...projectForm, demoUrl: e.target.value })} 
                  />
                </label>
                <label className="text-xs text-neutral-300">
                  GitHub Repo URL
                  <input 
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" 
                    value={projectForm.repoUrl} 
                    onChange={(e) => setProjectForm({ ...projectForm, repoUrl: e.target.value })} 
                  />
                </label>
              </div>

              <label className="block text-xs text-neutral-300">
                Descripción Resumida *
                <textarea
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]"
                  rows="3"
                  value={projectForm.shortDesc}
                  onChange={(e) => setProjectForm({ ...projectForm, shortDesc: e.target.value })}
                  required
                />
              </label>

              <label className="block text-xs text-neutral-300">
                Tags (separados por coma)
                <input
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]"
                  value={projectForm.tags}
                  onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                  placeholder="React, Luau, Tailwind, API"
                />
              </label>

              <div className="flex flex-wrap gap-4 text-xs text-neutral-300 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(projectForm.isPublic)}
                    onChange={(e) => setProjectForm({ ...projectForm, isPublic: e.target.checked })}
                  />
                  Visible en la Web (Público)
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(projectForm.showGithubBtn)}
                    onChange={(e) => setProjectForm({ ...projectForm, showGithubBtn: e.target.checked })}
                  />
                  Botón GitHub
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(projectForm.showDemoBtn)}
                    onChange={(e) => setProjectForm({ ...projectForm, showDemoBtn: e.target.checked })}
                  />
                  Botón Demo
                </label>
              </div>
            </form>

            {/* Pie Fijo con Botón de Envío */}
            <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0d0d14] flex justify-end gap-2.5 shrink-0">
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
      )}

      {/* Modal de Respuestas Preset */}
      {replyingMessage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setReplyingMessage(null) }}
        >
          <div className="relative w-full max-w-xl my-auto max-h-[92vh] flex flex-col rounded-3xl border border-[#8b5cf6]/40 bg-[#0d0d14] shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-white">Responder a {replyingMessage.name}</h3>
              <button onClick={() => setReplyingMessage(null)} className="text-neutral-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <span className="text-xs text-neutral-400">Seleccionar Preset:</span>
                <div className="flex flex-wrap gap-2 pt-1.5">
                  {replyPresets.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => { setReplySubject(preset.subject); setReplyText(preset.text); }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#8b5cf6]/30 border border-white/10 text-xs text-purple-200 transition"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block text-xs text-neutral-300">Asunto
                <input className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" value={replySubject} onChange={(e) => setReplySubject(e.target.value)} />
              </label>
              <label className="block text-xs text-neutral-300">Mensaje (desde support@pandadev.me)
                <textarea rows="5" className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6] leading-relaxed" value={replyText} onChange={(e) => setReplyText(e.target.value)} />
              </label>
            </div>
            <div className="p-4 sm:p-5 border-t border-white/10 bg-[#0d0d14] flex justify-end gap-2.5 shrink-0">
              <button onClick={() => setReplyingMessage(null)} className="button button-outline text-xs px-4 py-2">Cancelar</button>
              <button onClick={sendReply} disabled={sendingReply} className="button button-primary text-xs px-4 py-2">
                <Send size={13} /> {sendingReply ? 'Enviando...' : 'Enviar Respuesta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
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