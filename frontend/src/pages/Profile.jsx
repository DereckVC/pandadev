import { useState } from 'react'
import { Check, LockKeyhole, Save, ShieldCheck, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Profile() {
  const { user, api, updateUser } = useAuth()
  const [name, setName] = useState(user?.name || '')
  const [discordTag, setDiscordTag] = useState(user?.discordTag || '')
  const [avatar, setAvatar] = useState(user?.avatar || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [twoFactorSetup, setTwoFactorSetup] = useState(null)
  const [twoFactorToken, setTwoFactorToken] = useState('')

  if (!user) return <main className="mx-auto max-w-5xl px-6 py-24 text-center"><h1 className="text-3xl font-black text-white">Inicia sesión para ver tu perfil</h1><Link className="button button-primary mt-6 inline-flex" to="/login">Ir a iniciar sesión</Link></main>

  const saveProfile = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      const response = await fetch(`${api}/auth/profile`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, discordTag }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      updateUser(data.user)
      setMessage('Cambios guardados correctamente.')
    } catch (requestError) {
      setError(requestError.message || 'No se pudieron guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  const updatePassword = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword)) throw new Error('La contraseña debe tener 8 caracteres, mayúscula, minúscula y número.')
      const response = await fetch(`${api}/auth/change-password`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currentPassword, newPassword }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      updateUser(data.user)
      setCurrentPassword('')
      setNewPassword('')
      setMessage('Contraseña actualizada correctamente.')
    } catch (requestError) {
      setError(requestError.message || 'No se pudo actualizar la contraseña.')
    } finally {
      setSaving(false)
    }

  }

  const saveAvatar = async (value) => {
    setAvatar(value)
    setError('')
    try {
      const response = await fetch(`${api}/auth/profile/avatar`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatar: value }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      updateUser(data.user)
      setMessage(value ? 'Avatar actualizado.' : 'Avatar eliminado; se mostrará tu inicial.')
    } catch (requestError) { setError(requestError.message || 'No se pudo actualizar el avatar.') }
  }

  const handleAvatarFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Selecciona una imagen válida.'); return }
    const reader = new FileReader()
    reader.onload = () => saveAvatar(String(reader.result))
    reader.readAsDataURL(file)
  }

  const generateTwoFactor = async () => {
    setError('')
    try {
      const response = await fetch(`${api}/auth/2fa/generate`, { method: 'POST', credentials: 'include' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      setTwoFactorSetup(data)
    } catch (requestError) {
      setError(requestError.message || 'No se pudo generar el código QR.')
    }
  }

  const enableTwoFactor = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const response = await fetch(`${api}/auth/2fa/enable`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: twoFactorToken, base32: twoFactorSetup.base32 }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      updateUser(data.user)
      setTwoFactorSetup(null)
      setTwoFactorToken('')
      setMessage('2FA activado correctamente.')
    } catch (requestError) {
      setError(requestError.message || 'No se pudo activar 2FA.')
    } finally {
      setSaving(false)
    }
  }

  const disableTwoFactor = async () => {
    const token = window.prompt('Introduce el código actual de Google Authenticator para desactivar 2FA.')
    if (!token) return
    setSaving(true)
    try {
      const response = await fetch(`${api}/auth/2fa/disable`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message)
      updateUser(data.user)
      setMessage('2FA desactivado.')
    } catch (requestError) {
      setError(requestError.message || 'No se pudo desactivar 2FA.')
    } finally {
      setSaving(false)
    }
  }

  return <main className="max-w-5xl mx-auto px-6 py-12">
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#0d0d14]/90 shadow-2xl">
      <div className="h-32 bg-gradient-to-r from-[#8b5cf6]/30 via-[#161221] to-[#06b6d4]/10" />
      <div className="-mt-14 flex flex-col gap-5 px-6 pb-7 sm:flex-row sm:items-end sm:px-8">
        {user.avatar ? <img className="h-28 w-28 rounded-3xl border-4 border-[#0d0d14] object-cover shadow-xl" src={user.avatar} alt="" /> : <div className="grid h-28 w-28 place-items-center rounded-3xl border-4 border-[#0d0d14] bg-[#8b5cf6] text-4xl font-black text-white shadow-xl">{(user.name || user.email).slice(0, 1).toUpperCase()}</div>}
        <div className="min-w-0 flex-1">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#c4b5fd]">PANDADEV / CUENTA</span>
          <h1 className="mt-1 truncate text-3xl font-black text-white">{user.name || 'PandaDev User'}</h1>
          <p className="mt-1 flex items-center gap-2 truncate text-sm text-neutral-400"><LockKeyhole size={14} />{user.email}</p>
        </div>
        <span className="inline-flex items-center gap-2 self-start rounded-full border border-[#8b5cf6]/40 bg-[#8b5cf6]/15 px-3 py-1.5 text-xs font-bold tracking-wider text-[#d8b4fe] sm:self-end">{user.role === 'admin' ? 'ADMIN' : 'USER'}</span>
      </div>
    </section>
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <form className="rounded-3xl border border-white/10 bg-[#0d0d14]/90 p-6 shadow-xl" onSubmit={saveProfile}>
        <div className="flex items-center gap-3"><UserRound className="text-[#a855f7]" size={20} /><div><h2 className="text-xl font-bold text-white">Datos de Perfil</h2><p className="text-sm text-neutral-400">Actualiza la información visible de tu cuenta.</p></div></div>
        <label className="mt-6 block text-sm text-neutral-300">Nombre visible<input className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]" value={name} onChange={(event) => setName(event.target.value)} maxLength="32" required /></label>
        <label className="mt-4 block text-sm text-neutral-300">Discord Tag<input className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]" placeholder="dereck#0001 o @dereck" value={discordTag} onChange={(event) => setDiscordTag(event.target.value)} maxLength="64" /></label>
        <label className="mt-4 block text-sm text-neutral-300">URL de avatar<input className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-[#8b5cf6]" value={avatar.startsWith('data:') ? '' : avatar} onChange={(event) => setAvatar(event.target.value)} onBlur={() => saveAvatar(avatar)} placeholder="https://..." /></label>
        <div className="mt-4 flex flex-wrap gap-3"><label className="button button-outline cursor-pointer">Subir imagen<input className="hidden" type="file" accept="image/*" onChange={handleAvatarFile} /></label><button className="button button-outline" type="button" onClick={() => saveAvatar('')}>Quitar foto / Usar inicial</button></div>
        <button className="button button-primary mt-6" type="submit" disabled={saving}><Save size={16} />Guardar Cambios</button>
      </form>
      <form className="rounded-3xl border border-white/10 bg-[#0d0d14]/90 p-6 shadow-xl" onSubmit={updatePassword}>
        <div className="flex items-center gap-3"><LockKeyhole className="text-[#a855f7]" size={20} /><div><h2 className="text-xl font-bold text-white">Seguridad y Contraseña</h2><p className="text-sm text-neutral-400">Mantén tu acceso protegido.</p></div></div>
        {user.provider !== 'local' ? <div className="mt-6 rounded-2xl border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 p-4 text-sm leading-relaxed text-[#ddd6fe]">Tu cuenta está protegida por tu proveedor federado.</div> : <><label className="mt-6 block text-sm text-neutral-300">Contraseña actual<input className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></label><label className="mt-4 block text-sm text-neutral-300">Nueva contraseña<input className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]" type="password" minLength="8" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label><button className="button button-outline mt-6" type="submit" disabled={saving}>Actualizar Contraseña</button></>}
      </form>
      <section className="rounded-3xl border border-white/10 bg-[#0d0d14]/90 p-6 shadow-xl lg:col-span-2">
        <div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><ShieldCheck className="mt-1 text-[#06b6d4]" size={22} /><div><h2 className="text-xl font-bold text-white">Autenticación de Dos Factores (2FA)</h2><p className="mt-2 max-w-2xl text-sm leading-relaxed text-neutral-400">Añade una capa extra de protección a tu cuenta mediante códigos temporales de autenticador.</p></div></div>{user.twoFactorEnabled && <span className="shrink-0 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[10px] font-bold tracking-wider text-emerald-300">● 2FA ACTIVADO CON GOOGLE AUTHENTICATOR</span>}</div>
        {!user.twoFactorEnabled ? <div className="mt-6"><button className="button button-primary" type="button" onClick={generateTwoFactor}>Configurar Google Authenticator</button>{twoFactorSetup && <form className="mt-6 grid gap-5 rounded-2xl border border-[#8b5cf6]/30 bg-[#8b5cf6]/10 p-5 sm:grid-cols-[auto_1fr]" onSubmit={enableTwoFactor}><img className="h-48 w-48 rounded-xl bg-white p-2" src={twoFactorSetup.qrCodeUrl} alt="Código QR para Google Authenticator" /><div><p className="text-sm text-neutral-300">Escanea este QR en Google Authenticator o introduce la clave manual:</p><code className="mt-3 block break-all rounded-lg bg-black/30 p-3 font-mono text-sm text-[#d8b4fe]">{twoFactorSetup.base32}</code><label className="mt-4 block text-sm text-neutral-300">Código de 6 dígitos<input className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-center font-mono tracking-[0.4em] text-white outline-none focus:border-[#8b5cf6]" inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={twoFactorToken} onChange={(event) => setTwoFactorToken(event.target.value)} required /></label><button className="button button-primary mt-4" type="submit" disabled={saving}>Activar 2FA</button></div></form>}</div> : <div className="mt-6"><button className="button button-outline" type="button" onClick={disableTwoFactor} disabled={saving}>Desactivar 2FA</button></div>}
      </section>
      <section className="rounded-3xl border border-white/10 bg-[#0d0d14]/90 p-6 shadow-xl lg:col-span-2">
        <h2 className="text-xl font-bold text-white">Preferencias de cuenta</h2>
        <div className="mt-4 grid gap-3 text-sm text-neutral-300 sm:grid-cols-3">
          <p>Proveedor: <strong className="text-white">{user.provider || 'local'}</strong></p>
          <p>Registro: <strong className="text-white">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'No disponible'}</strong></p>
          <p>Estado: <strong className="text-emerald-300">{user.isVerified ? 'VERIFICADO' : 'PENDIENTE'}</strong></p>
        </div>
      </section>
    </div>
    {(message || error) && <div className={`mt-6 flex items-center gap-2 rounded-2xl border p-4 text-sm ${error ? 'border-red-400/30 bg-red-400/10 text-red-200' : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'}`}>{!error && <Check size={16} />}{error || message}</div>}
  </main>
}
