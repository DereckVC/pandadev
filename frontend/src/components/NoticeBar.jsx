import { useEffect, useState } from 'react'

const CONSENT_KEY = 'panda_cookie_consent'

export default function NoticeBar() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_KEY)
    if (!stored || stored !== 'accepted') {
      setVisible(true)
    }
  }, [])

  const saveChoice = () => {
    window.localStorage.setItem(CONSENT_KEY, 'accepted')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <aside style={{
      position: 'fixed',
      bottom: '1.25rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(100% - 2rem)',
      maxWidth: '740px',
      zIndex: 99999,
      backgroundColor: 'rgba(13, 17, 23, 0.94)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      borderRadius: '16px',
      padding: '1rem 1.4rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1.2rem',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.65)',
      color: '#e2e8f0',
      fontFamily: 'inherit'
    }} role="status">
      <div style={{ fontSize: '0.86rem', lineHeight: '1.45' }}>
        <strong style={{ display: 'block', color: '#ffffff', marginBottom: '0.2rem', fontSize: '0.92rem' }}>
          🍪 Cookies y términos de uso
        </strong>
        <span>
          Utilizamos cookies esenciales y de sesión para garantizar la autenticación segura y optimizar tu experiencia técnica. Al navegar, aceptas nuestras políticas.
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexShrink: 0 }}>
        <button
          type="button"
          onClick={saveChoice}
          style={{
            backgroundColor: '#8b5cf6',
            color: '#ffffff',
            border: 'none',
            padding: '0.6rem 1.25rem',
            borderRadius: '10px',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '0.85rem',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
        >
          Aceptar
        </button>
      </div>
    </aside>
  )
}