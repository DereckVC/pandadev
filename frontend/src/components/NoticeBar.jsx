import { useState } from 'react'

const CONSENT_KEY = 'pandadev_consent'

export default function NoticeBar() {
  const [visible, setVisible] = useState(() => {
    const stored = window.localStorage.getItem(CONSENT_KEY)
    return stored !== 'accepted' && stored !== 'rejected'
  })

  const saveChoice = (choice) => {
    window.localStorage.setItem(CONSENT_KEY, choice)
    setVisible(false)
  }

  if (!visible) return null

  return <aside className="cookie-banner notice-bar" role="status">
    <div>
      <strong>Aviso técnico de sesión</strong>
      <p>Usamos almacenamiento local esencial para conservar preferencias y facilitar el acceso seguro a PandaDev.</p>
    </div>
    <div className="cookie-actions">
      <button type="button" onClick={() => saveChoice('accepted')}>Aceptar</button>
      <button type="button" onClick={() => saveChoice('rejected')}>Rechazar</button>
    </div>
  </aside>
}
