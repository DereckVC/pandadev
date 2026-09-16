import { useState } from 'react'

const CONSENT_KEY = 'panda_cookie_consent'

export default function NoticeBar() {
  const [visible, setVisible] = useState(() => {
    const stored = window.localStorage.getItem(CONSENT_KEY)
    return stored !== 'accepted'
  })
  const [closing, setClosing] = useState(false)

  const saveChoice = () => {
    window.localStorage.setItem(CONSENT_KEY, 'accepted')
    setClosing(true)
    window.setTimeout(() => setVisible(false), 220)
  }

  if (!visible) return null

  return <aside className={`cookie-banner notice-bar transition-all duration-200 ${closing ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'}`} role="status">
    <div>
      <strong>Cookies y términos de uso</strong>
      <p>Utilizamos cookies esenciales y de sesión para garantizar la autenticación segura y optimizar tu experiencia. Al navegar, aceptas nuestras políticas y términos de uso.</p>
    </div>
    <div className="cookie-actions">
      <button className="text-xs text-neutral-400 underline underline-offset-4 transition hover:text-white" type="button" onClick={() => window.alert('Usamos únicamente cookies esenciales de sesión y almacenamiento local para autenticación y preferencias.')}>Detalles</button>
      <button type="button" onClick={saveChoice}>Aceptar</button>
    </div>
  </aside>
}
