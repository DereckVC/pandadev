import { useEffect, useState } from 'react'
import { Activity, Check, Code2, Inbox, Pencil, Plus, Shield, Trash2, Users, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const emptyProject = { title: '', slug: '', shortDesc: '', category: 'Web', tags: '', bannerUrl: '', demoUrl: '', repoUrl: '', showGithubBtn: true, showDemoBtn: true, isPublic: true }

export default function Admin() {
  const { user, api } = useAuth()
  const apiBase = api.endsWith('/api') ? api : `${api.replace(/\/+$/, '')}/api`
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
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [syncingGithub, setSyncingGithub] = useState(false)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login', { replace: true })
      return
    }
    const load = async () => {
      try {
        const requests = await Promise.all(['stats', 'users'].map((path) => fetch(`${apiBase}/admin/${path}`, { credentials: 'include', headers: authHeaders() })))
        const data = await Promise.all(requests.map((response) => response.ok ? response.json() : Promise.reject(new Error('No se pudo cargar el panel'))))
        setStats(data[0])
        setUsers(data[1])
        const [projectsResponse, messagesResponse] = await Promise.all([fetch(`${apiBase}/admin/projects`, { credentials: 'include', headers: authHeaders() }), fetch(`${apiBase}/contact`, { credentials: 'include', headers: authHeaders() })])
        if (!projectsResponse.ok || !messagesResponse.ok) throw new Error('No se pudieron cargar los datos del panel')
        setProjects(await projectsResponse.json())
        setMessages(await messagesResponse.json())
      } catch (requestError) {
        setError(requestError.message)
      }
    }
    load()
  }, [apiBase, navigate, user])

  const loadProjects = async () => {
    const response = await fetch(`${apiBase}/admin/projects`, { credentials: 'include', headers: authHeaders() })
    if (!response.ok) throw new Error('No se pudieron cargar los proyectos')
    setProjects(await response.json())
  }
  const loadMessages = async () => {
    const response = await fetch(`${apiBase}/contact`, { credentials: 'include', headers: authHeaders() })
    if (!response.ok) throw new Error('No se pudieron cargar los mensajes')
    setMessages(await response.json())
  }
  const request = async (url, options = {}) => {
    const response = await fetch(`${apiBase}${url}`, { credentials: 'include', ...options, headers: { ...authHeaders(), ...(options.headers || {}) } })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'La operación no se pudo completar')
    return data
  }
  const markRead = async (id) => { try { await request(`/contact/${id}/read`, { method: 'PUT' }); await loadMessages() } catch (requestError) { setError(requestError.message) } }
  const deleteMessage = async (id) => { if (!window.confirm('¿Eliminar este mensaje?')) return; try { await request(`/contact/${id}`, { method: 'DELETE' }); await loadMessages(); setNotice('Mensaje eliminado.') } catch (requestError) { setError(requestError.message) } }
  const openProject = (project = null) => {
    setEditingProject(project?._id || null)
    setProjectForm(project ? { ...project, tags: (project.tags || []).join(', ') } : emptyProject)
    setModalOpen(true)
  }
  const saveProject = async (event) => {
    event.preventDefault()
    try {
      const payload = { ...projectForm, tags: projectForm.tags.split(',').map((tag) => tag.trim()).filter(Boolean), slug: projectForm.slug || projectForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }
      await request(editingProject ? `/admin/projects/${editingProject}` : '/admin/projects', { method: editingProject ? 'PUT' : 'POST', body: JSON.stringify(payload) })
      setModalOpen(false)
      setNotice('Proyecto guardado correctamente.')
      await loadProjects()
    } catch (requestError) { setError(requestError.message) }
  }
  const deleteProject = async (id) => { if (!window.confirm('¿Eliminar este proyecto?')) return; try { await request(`/admin/projects/${id}`, { method: 'DELETE' }); await loadProjects() } catch (requestError) { setError(requestError.message) } }
  const toggleGithub = async (project) => { try { await request(`/admin/projects/${project._id}`, { method: 'PUT', body: JSON.stringify({ showGithubBtn: !project.showGithubBtn }) }); await loadProjects() } catch (requestError) { setError(requestError.message) } }
  const toggleRole = async (account) => { try { await request(`/admin/users/${account._id}/role`, { method: 'PUT', body: JSON.stringify({ role: account.role === 'admin' ? 'user' : 'admin' }) }); setUsers(await request('/admin/users')) } catch (requestError) { setError(requestError.message) } }
  const syncGithub = async () => {
    setSyncingGithub(true)
    setError('')
    try {
      const response = await fetch(`${apiBase}/admin/github/sync`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders(),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'No se pudo sincronizar GitHub')
      await loadProjects()
      setNotice(`${data.count || 0} repositorio(s) importado(s) desde GitHub.`)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSyncingGithub(false)
    }
  }

  if (!user || user.role !== 'admin') return null
  const tabs = [['overview', '📊 Vista General'], ['messages', '📩 Mensajes de Contacto'], ['projects', '💻 Proyectos'], ['users', '👥 Usuarios']]
  return <main className="min-h-screen px-6 py-10 lg:px-12">
    <div className="mx-auto max-w-7xl">
      <header className="mb-8">
        <span className="inline-flex rounded-full border border-[#8b5cf6]/40 bg-[#8b5cf6]/10 px-4 py-2 text-xs font-mono tracking-wider text-[#d8b4fe]">● CONTROL DE SISTEMAS · PANEL ADMINISTRADOR</span>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-white sm:text-6xl">PandaDev <span className="text-[#a855f7] drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">Command Center</span></h1>
      </header>
      <div className="mb-8 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#0d0d14]/80 p-2">{tabs.map(([id, label]) => <button className={`rounded-xl px-4 py-3 text-sm transition ${activeTab === id ? 'bg-[#8b5cf6] text-white' : 'text-neutral-400 hover:bg-white/10 hover:text-white'}`} type="button" key={id} onClick={() => setActiveTab(id)}>{label}</button>)}</div>
      {notice && <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-3 text-sm text-emerald-200"><Check size={16} />{notice}<button className="ml-auto" type="button" onClick={() => setNotice('')}><X size={15} /></button></div>}
      {error && <div className="mb-5 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</div>}
      {activeTab === 'overview' && <section>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Activity />} label="Visitas Totales" value={stats?.totalVisits ?? '—'} accent="violet" detail="TRÁFICO GLOBAL" />
        <StatCard icon={<Activity />} label="Visitantes Únicos Hoy" value={stats?.uniqueVisitsToday ?? '—'} accent="green" detail="ACTIVIDAD EN TIEMPO REAL" />
        <StatCard icon={<Users />} label="Usuarios Registrados" value={stats?.totalUsers ?? '—'} accent="cyan" detail="CUENTAS EN PLATAFORMA" />
        <StatCard icon={<Shield />} label="Cuentas Verificadas" value={stats ? `${stats.verifiedUsers} (${stats.totalUsers ? Math.round(stats.verifiedUsers / stats.totalUsers * 100) : 0}%)` : '—'} accent="violet" />
        <StatCard icon={<Code2 />} label="Proyectos Publicados" value={stats?.totalProjects ?? '—'} accent="violet" detail="CATÁLOGO ACTIVO" onClick={() => setActiveTab('projects')} />
        <StatCard icon={<Inbox />} label="Mensajes Totales" value={stats?.totalMessages ?? '—'} accent="cyan" />
        <StatCard icon={<Inbox />} label="Mensajes Pendientes" value={stats?.unreadMessages ?? '—'} accent="red" detail="REQUIEREN ATENCIÓN" />
        <StatCard icon={<Activity />} label="Servidor & MongoDB" value={stats?.systemStatus?.status ?? '—'} accent="green" detail={stats?.systemStatus ? `${(stats.systemStatus.uptime / 3600).toFixed(1)}H · ${stats.systemStatus.latencyMs}MS ATLAS` : 'CARGANDO'} />
        </div>
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-5 sm:col-span-2"><h2 className="font-bold text-white">Distribución de Tráfico</h2><div className="mt-5 space-y-4"><TrafficBar label="Desktop" value={stats?.traffic?.desktop || 0} total={(stats?.traffic?.desktop || 0) + (stats?.traffic?.mobile || 0)} color="bg-[#8b5cf6]" /><TrafficBar label="Móvil" value={stats?.traffic?.mobile || 0} total={(stats?.traffic?.desktop || 0) + (stats?.traffic?.mobile || 0)} color="bg-[#06b6d4]" /></div></div>
        <div className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-5 sm:col-span-2"><h2 className="font-bold text-white">Actividad Reciente del Sistema</h2><div className="mt-4 space-y-3">{(stats?.recentActivity || []).slice(0, 5).map((event, index) => <div className="flex items-center gap-3 text-sm text-neutral-400" key={`${event.date}-${index}`}><span className="h-2 w-2 rounded-full bg-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,.8)]" /><span className="flex-1">{event.label}</span><time className="text-xs text-neutral-600">{new Date(event.date).toLocaleTimeString()}</time></div>)}</div></div>
        </div>
      </section>}
      {activeTab === 'messages' && <section className="space-y-4">{messages.length === 0 ? <EmptyState text="No hay mensajes pendientes" /> : messages.map((item) => <article className="rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-5" key={item._id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold text-white">{item.name}</h2><a className="text-sm text-[#c4b5fd] hover:underline" href={`mailto:${item.email}`}>{item.email}</a></div><div className="flex items-center gap-2 text-xs text-neutral-400"><span>{item.category}</span><span>{new Date(item.createdAt).toLocaleString()}</span></div></div><p className="mt-4 rounded-xl bg-black/30 p-4 text-sm leading-relaxed text-neutral-300">{item.message}</p><div className="mt-4 flex gap-2">{!item.read && <button className="button button-outline" type="button" onClick={() => markRead(item._id)}>Marcar como leído</button>}<button className="button border border-red-400/30 text-red-300 hover:bg-red-400/10" type="button" onClick={() => deleteMessage(item._id)}><Trash2 size={15} />Eliminar</button></div></article>)}</section>}
      {activeTab === 'projects' && <section><div className="mb-5 flex flex-wrap gap-3"><button className="button button-primary" type="button" onClick={() => openProject()}><Plus size={16} />Añadir Nuevo Proyecto</button><button className="button button-outline" type="button" onClick={syncGithub} disabled={syncingGithub}>{syncingGithub ? <Activity className="animate-spin" size={16} /> : <Code2 size={16} />}{syncingGithub ? 'Sincronizando...' : 'Sincronizar con GitHub'}</button></div><div className="grid gap-4">{projects.map((project) => <article className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-5 md:flex-row md:items-center" key={project._id}><div className="flex-1"><h2 className="font-bold text-white">{project.title}</h2><p className="mt-1 text-sm text-neutral-400">{project.category} · {(project.tags || []).join(', ')}</p></div><button className={`rounded-full px-3 py-1 text-xs ${project.showGithubBtn ? 'bg-emerald-400/10 text-emerald-300' : 'bg-white/10 text-neutral-400'}`} type="button" onClick={() => toggleGithub(project)}>GitHub {project.showGithubBtn ? 'On' : 'Off'}</button><div className="flex gap-2"><button className="button button-outline" type="button" onClick={() => openProject(project)}><Pencil size={15} />Editar</button><button className="button border border-red-400/30 text-red-300" type="button" onClick={() => deleteProject(project._id)}><Trash2 size={15} /></button></div></article>)}</div></section>}
      {activeTab === 'users' && <section className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0d0d14]/90"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase tracking-wider text-neutral-500"><tr><th className="p-4">Usuario</th><th className="p-4">Email</th><th className="p-4">Rol</th><th className="p-4">Estado OTP</th><th className="p-4">Registro</th><th className="p-4">Acción</th></tr></thead><tbody>{users.map((account) => <tr className="border-b border-white/5 text-neutral-300" key={account._id}><td className="p-4 font-medium text-white">{account.name || 'Sin nombre'}</td><td className="p-4">{account.email}</td><td className="p-4"><span className="rounded-full bg-[#8b5cf6]/15 px-2 py-1 text-xs text-[#d8b4fe]">{account.role.toUpperCase()}</span></td><td className="p-4">{account.isVerified ? 'Verificado' : 'Pendiente'}</td><td className="p-4">{new Date(account.createdAt).toLocaleDateString()}</td><td className="p-4"><button className="text-[#c4b5fd] hover:text-white" type="button" onClick={() => toggleRole(account)}>Cambiar rol</button></td></tr>)}</tbody></table></section>}
    </div>
    {modalOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4 backdrop-blur-md"><form className="w-full max-w-2xl space-y-4 rounded-3xl border border-[#8b5cf6]/40 bg-[#0d0d14] p-6 shadow-2xl" onSubmit={saveProject}><div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-white">{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h2><button type="button" onClick={() => setModalOpen(false)}><X className="text-neutral-400" /></button></div><div className="grid gap-4 sm:grid-cols-2">{[['title', 'Título'], ['slug', 'Slug'], ['category', 'Categoría'], ['bannerUrl', 'Imagen / Banner'], ['demoUrl', 'Demo URL'], ['repoUrl', 'GitHub URL']].map(([key, label]) => <label className="text-sm text-neutral-300" key={key}>{label}<input className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" value={projectForm[key]} onChange={(event) => setProjectForm({ ...projectForm, [key]: event.target.value })} /></label>)}</div><label className="block text-sm text-neutral-300">Descripción<textarea className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" rows="3" value={projectForm.shortDesc} onChange={(event) => setProjectForm({ ...projectForm, shortDesc: event.target.value })} required /></label><label className="block text-sm text-neutral-300">Tags separados por coma<input className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-[#8b5cf6]" value={projectForm.tags} onChange={(event) => setProjectForm({ ...projectForm, tags: event.target.value })} /></label><div className="flex flex-wrap gap-5 text-sm text-neutral-300"><label><input type="checkbox" checked={projectForm.showGithubBtn} onChange={(event) => setProjectForm({ ...projectForm, showGithubBtn: event.target.checked })} /> GitHub visible</label><label><input type="checkbox" checked={projectForm.showDemoBtn} onChange={(event) => setProjectForm({ ...projectForm, showDemoBtn: event.target.checked })} /> Demo visible</label></div><button className="button button-primary" type="submit">Guardar Proyecto</button></form></div>}
  </main>
}

function StatCard({ icon, label, value, accent, detail, onClick }) {
  return <article className={`rounded-2xl border border-white/10 bg-[#0d0d14]/90 p-5 transition hover:-translate-y-1 hover:border-[#8b5cf6]/50 ${onClick ? 'cursor-pointer' : ''}`} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined} onClick={onClick} onKeyDown={(event) => { if (onClick && (event.key === 'Enter' || event.key === ' ')) onClick() }}><div className={`mb-5 ${accent === 'red' ? 'text-red-300' : accent === 'cyan' ? 'text-cyan-300' : accent === 'green' ? 'text-emerald-300' : 'text-[#c4b5fd]'}`}>{icon}</div><p className="text-sm text-neutral-400">{label}</p><strong className="mt-2 block text-3xl font-black text-white">{value}</strong>{detail && <span className="mt-2 block text-[10px] tracking-wider text-emerald-300">● {detail}</span>}</article>
}
function EmptyState({ text }) { return <div className="rounded-2xl border border-dashed border-white/15 bg-[#0d0d14]/70 p-16 text-center text-neutral-400"><Inbox className="mx-auto mb-3 text-[#a855f7]" /><p>{text}</p></div> }
function TrafficBar({ label, value, total, color }) {
  const percentage = total ? Math.round(value / total * 100) : 0
  return <div><div className="mb-2 flex justify-between text-xs text-neutral-400"><span>{label}</span><span>{percentage}% · {value}</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} /></div></div>
}
