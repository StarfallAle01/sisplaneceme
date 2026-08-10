import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const AZUL           = '#0A1628'
const DORADO         = '#C5A028'
const MARFIL         = '#E9ECF0'
const EBANO          = '#050505'
const VERDE_MILITAR  = '#333333'

// Nuevo color para fondo en modo día: beige dorado suave
const BEIGE_DORADO   = '#F5F0E2'

export default function Login() {
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(false)  // ← Inicia en modo DÍA
  
  // Colores dinámicos según modo
  const bgGradientStart = isDark ? AZUL : BEIGE_DORADO
  const bgGradientEnd   = isDark ? '#111B2C' : '#E8DFC8'

  // Tarjeta con contraste real
  const cardBg           = isDark ? VERDE_MILITAR : AZUL

  const cardBorder       = isDark ? `${DORADO}35` : `${DORADO}50`
  const dividerColor     = isDark ? `${DORADO}20` : `${DORADO}25`
  const subtitleColor    = isDark ? `${MARFIL}60` : `${MARFIL}60`
  const copyrightColor   = isDark ? `${MARFIL}25` : `${EBANO}30`

  // Texto del título según modo
  const titleColor = MARFIL  // Siempre blanco sobre tarjeta oscura

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative"
      style={{
        background: `linear-gradient(180deg, ${bgGradientStart} 0%, ${bgGradientEnd} 100%)`,
      }}
    >
      {/* Toggle Modo Día/Noche */}
      <button
        onClick={() => setIsDark(!isDark)}
        className="absolute top-6 right-6 px-4 py-2 rounded text-lg transition-all hover:opacity-80"
        style={{
          color: DORADO,
          border: `1px solid ${DORADO}40`,
          backgroundColor: isDark ? 'transparent' : `${AZUL}06`,
        }}
        title={isDark ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
      >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isDark ? (
                  <><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>
                ) : (
                  <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>
                )}
              </svg>
      </button>

      {/* Contenedor tipo tarjeta */}
      <div
        className="w-full max-w-md rounded-xl overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${cardBorder}`,
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0,0,0,0.6)'
            : '0 20px 40px -12px rgba(27,38,59,0.25)',
        }}
      >
        {/* Header de la tarjeta */}
        <div
          className="px-8 pt-10 pb-6 text-center"
          style={{ borderBottom: `1px solid ${dividerColor}` }}
        >
          {/* Emblema / Escudo */}
          <div
            className="w-20 h-20 mx-auto mb-5 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: `${DORADO}15`,
              border: `2px solid ${DORADO}45`,
            }}
          >
            <img
              src="/logoeceme.png"
              alt="ECEME"
              className="w-full h-full object-contain p-1.5"
            />
          </div>

          <p
            className="text-xs uppercase tracking-widest font-medium mb-3"
            style={{ color: DORADO, opacity: 0.9 }}
          >
            ECEME
          </p>
          <div className="h-px w-12 mx-auto mb-4" style={{ backgroundColor: DORADO, opacity: 0.5 }} />
          <h1
            className="text-xl font-medium"
            style={{ color: titleColor }}
          >
            Seleccione su Perfil
          </h1>
          <p
            className="text-sm mt-2"
            style={{ color: subtitleColor }}
          >
            Sistema de Planificación Académica
          </p>
        </div>

        {/* Botones */}
        <div className="px-8 py-8 space-y-5">
          {/* Botón Profesor */}
          <button
            onClick={() => navigate('/login/profesor')}
            className="w-full px-6 py-4 rounded text-base font-medium transition-all text-center group"
            style={{
              backgroundColor: DORADO,
              color: AZUL,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#D4B84C'
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(197,160,89,0.35)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = DORADO
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <span className="flex items-center justify-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Ingresar como Profesor
            </span>
          </button>

          {/* Botón Administrativo */}
          <button
            onClick={() => navigate('/login/administrativo')}
            className="w-full px-6 py-4 rounded text-base font-medium transition-all text-center group"
            style={{
              backgroundColor: 'transparent',
              color: DORADO,
              border: `1px solid ${DORADO}60`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${DORADO}18`
              e.currentTarget.style.borderColor = DORADO
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(197,160,89,0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = `${DORADO}60`
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <span className="flex items-center justify-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
                <path d="M12 12v4"/>
                <path d="M9 14h6"/>
              </svg>
              Ingresar como Personal Administrativo
            </span>
          </button>
        </div>

        {/* Indicador de sistema seguro */}
        <div className="px-8 pb-4 text-center">
          <p
            className="text-xs flex items-center justify-center gap-1.5"
            style={{ color: `${DORADO}50` }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Conexión segura
          </p>
        </div>

        {/* Footer de la tarjeta */}
        <div
          className="px-8 py-5 text-center"
          style={{
            borderTop: `1px solid ${dividerColor}`,
            backgroundColor: isDark ? '#ffffff04' : '#ffffff08',
          }}
        >
          <button
            onClick={() => navigate('/')}
            className="text-sm transition-all hover:opacity-100 inline-flex items-center gap-1.5"
            style={{ color: `${MARFIL}70` }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Volver al Inicio
          </button>
        </div>
      </div>

      {/* Footer fuera de la tarjeta */}
      <p
        className="text-xs mt-8"
        style={{ color: copyrightColor }}
      >
        © 2026 ECEME — Bolivia
      </p>
    </div>
  )
}