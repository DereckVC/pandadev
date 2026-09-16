import { useState } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => localStorage.getItem('pandadev-cookie-consent') !== 'accepted' && localStorage.getItem('pandadev-cookie-consent') !== 'rejected')
  const save = (value) => { localStorage.setItem('pandadev-cookie-consent', value); setVisible(false) }
  if (!visible) return null
  return <aside className="cookie-banner"><div><strong>Privacidad técnica</strong><p>Usamos cookies esenciales para mantener sesiones OAuth y JWT seguras.</p></div><div className="cookie-actions"><button onClick={() => save('accepted')}>Aceptar</button><button onClick={() => save('rejected')}>Rechazar</button></div></aside>
}
