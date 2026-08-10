import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import heroImage from '../assets/hero.png'
import { cargarPresentacion } from '../data/presentacion'

const AZUL          = '#0A1628'
const DORADO        = '#C5A028'
const MARFIL        = '#FDFDFD'
const EBANO         = '#050505'
const VERDE_MILITAR = '#333333'

function SectionTitle({ eyebrow, title, isDark, center }) {
  const accentColor = isDark ? DORADO : AZUL
  return (
    <div className={`mb-8 ${center ? 'text-center' : ''}`}>
      <p className="text-sm uppercase tracking-widest font-medium mb-2" style={{ color: accentColor }}>
        {eyebrow}
      </p>
      <h2 className="text-3xl md:text-4xl font-medium leading-tight" style={{ color: isDark ? MARFIL : EBANO }}>
        {title}
      </h2>
      <div className={`mt-4 h-px w-16 ${center ? 'mx-auto' : ''}`} style={{ backgroundColor: accentColor }} />
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [isDark, setIsDark] = useState(false)
  const [contenido] = useState(() => cargarPresentacion())
  const { header, hero, programa, pilares, vision, mision, titulaciones, footer } = contenido

  return (
    <div className="min-h-screen">

      {/* ═══════════════ HEADER ═══════════════════════════════════════════ */}
      <header className="px-6 py-3" style={{ backgroundColor: AZUL }}>
        <div className="flex items-center justify-between">

          <div>
            <p className="text-xs uppercase tracking-widest font-medium leading-tight" style={{ color: DORADO, opacity: 0.85 }}>
              {header.eyebrow}
            </p>
            <h1 className="text-sm md:text-base font-medium uppercase tracking-wide leading-tight mt-0.5" style={{ color: MARFIL }}>
              {header.institucion}
            </h1>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-1.5 rounded transition-opacity hover:opacity-80"
              style={{ color: DORADO, border: `1px solid ${DORADO}40` }}
              title={isDark ? 'Modo día' : 'Modo noche'}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {isDark ? (
                  <><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></>
                ) : (
                  <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>
                )}
              </svg>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-1.5 rounded text-sm font-medium transition-opacity hover:opacity-85"
              style={{ backgroundColor: DORADO, color: AZUL }}
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════ HERO ═════════════════════════════════════════════ */}
      <div className="relative w-full overflow-hidden" style={{ backgroundColor: AZUL }}>
        <div className="absolute inset-0 z-10" style={{
          background: 'linear-gradient(180deg, rgba(10,22,40,0.52) 0%, rgba(10,22,40,0.46) 50%, rgba(10,22,40,0.52) 100%)',
        }} />
        <img
          src={heroImage}
          alt="ECEME - Escuela de Comando y Estado Mayor del Ejército"
          className="w-full h-[520px] md:h-[640px] object-cover relative z-0"
        />

        <div className="absolute inset-0 z-20 flex items-center justify-center px-6">
          <div className="max-w-3xl text-center">
            <p className="text-4xl md:text-6xl font-bold uppercase tracking-wide mb-5" style={{ color: DORADO, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              {hero.titulo}
            </p>
            <p className="text-xl md:text-2xl font-normal uppercase tracking-wide mb-6" style={{ color: MARFIL, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
              {hero.subtitulo}
            </p>

            <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: MARFIL, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
              {hero.descripcion}
            </p>

            <div className="mt-10 mx-auto w-12 h-px" style={{ backgroundColor: `${DORADO}60` }} />

            <p className="text-sm font-semibold uppercase tracking-widest mt-6" style={{ color: DORADO, textShadow: '0 1px 6px rgba(0,0,0,0.4)' }}>
              {hero.lema}
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════ SOBRE EL PROGRAMA ════════════════════════════════ */}
      <section className="px-6 py-16" style={{ backgroundColor: isDark ? VERDE_MILITAR : '#ffffff' }}>
        <div className="max-w-7xl mx-auto">
          <SectionTitle eyebrow="Presentación" title="Sobre el Programa" isDark={isDark} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            <div className="space-y-5" style={{ color: isDark ? `${MARFIL}CC` : AZUL }}>
              {programa.parrafos.map((parrafo, i) => (
                <p key={i} style={{ lineHeight: '1.85', fontSize: '1.05rem' }}>
                  {parrafo}
                </p>
              ))}
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-widest mb-6" style={{ color: isDark ? DORADO : AZUL }}>
                Fundamentos Normativos
              </p>
              <div className="space-y-5">
                {programa.fundamentos.map((item) => (
                  <div key={item} className="flex items-start gap-4">
                    <div className="shrink-0 mt-2.5" style={{ width: '28px', height: '2px', backgroundColor: isDark ? DORADO : AZUL }} />
                    <p className="text-base leading-relaxed" style={{ color: isDark ? `${MARFIL}CC` : EBANO }}>
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ PILARES DE FORMACIÓN ═════════════════════════════ */}
      <section className="px-6 py-16" style={{ backgroundColor: isDark ? VERDE_MILITAR : AZUL }}>
        <div className="max-w-7xl mx-auto">
          <SectionTitle eyebrow="Modelo Educativo" title="Pilares de Formación" isDark={true} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pilares.map((p, i) => (
              <div
                key={i}
                className="p-7"
                style={{
                  backgroundColor: isDark ? `${VERDE_MILITAR}CC` : MARFIL,
                  border: '1.5px solid #C5A028',
                  borderRadius: '8px',
                }}
              >
                <h3
                  className="text-base font-bold uppercase tracking-wider mb-4"
                  style={{ color: DORADO }}
                >
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: isDark ? `${MARFIL}BB` : AZUL }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ VISIÓN Y MISIÓN ══════════════════════════════════ */}
      <section className="px-6 py-16" style={{ backgroundColor: isDark ? VERDE_MILITAR : '#ffffff' }}>
        <div className="max-w-7xl mx-auto">
          <SectionTitle eyebrow="Identidad Institucional" title="Visión y Misión" isDark={isDark} center />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { label: 'Visión', body: vision },
              { label: 'Misión', body: mision },
            ].map((item) => (
              <div
                key={item.label}
                className="text-center p-8 md:p-10"
                style={{
                  backgroundColor: AZUL,
                  border: '1.5px solid #C5A028',
                  borderRadius: '8px',
                }}
              >
                <p className="text-sm font-bold uppercase tracking-widest mb-5" style={{ color: DORADO }}>
                  {item.label}
                </p>
                <p className="text-base md:text-lg leading-relaxed" style={{ color: `${MARFIL}DD` }}>
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ TITULACIÓN ═══════════════════════════════════════ */}
      <section className="px-6 py-16" style={{ backgroundColor: isDark ? VERDE_MILITAR : AZUL }}>
        <div className="max-w-7xl mx-auto">
          <SectionTitle eyebrow="Modalidad de Titulación" title="Títulos" isDark={true} center />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {titulaciones.map((t, i) => (
              <div
                key={i}
                className="p-7"
                style={{
                  backgroundColor: isDark ? `${VERDE_MILITAR}CC` : MARFIL,
                  border: '1.5px solid #C5A028',
                  borderRadius: '8px',
                }}
              >
                <h3
                  className="text-lg font-semibold mb-4 pb-4"
                  style={{
                    color: isDark ? DORADO : AZUL,
                    borderBottom: `1.5px solid ${DORADO}35`,
                  }}
                >
                  {t.title}
                </h3>
                <p
                  className="text-xs font-bold uppercase tracking-wider mb-3"
                  style={{ color: isDark ? `${MARFIL}BB` : AZUL }}
                >
                  {t.req}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: isDark ? `${MARFIL}BB` : AZUL }}>
                  {t.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════════════════════════════════ */}
      <footer className="px-6 py-14" style={{ backgroundColor: AZUL }}>
        <div className="max-w-7xl mx-auto">

          <div className="text-center mb-10 pb-8" style={{ borderBottom: `1px solid ${DORADO}20` }}>
            <p className="text-xl md:text-2xl font-medium uppercase tracking-widest mb-3" style={{ color: DORADO }}>
              {footer.lemaPrincipal}
            </p>
            <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: MARFIL, opacity: 0.5 }}>
              {hero.lema}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="text-center md:text-left">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: DORADO }}>
                ECEME
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: MARFIL, opacity: 0.55 }}>
                {footer.eceme}
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: DORADO }}>
                Ubicación
              </p>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: MARFIL, opacity: 0.55 }}>
                {footer.ubicacion}
              </p>
            </div>
          </div>

          <div className="text-center pt-6" style={{ borderTop: `1px solid ${DORADO}15` }}>
            <p className="text-xs" style={{ color: MARFIL, opacity: 0.35 }}>
              © 2026 Escuela de Comando y Estado Mayor del Ejército — Bolivia.
              Sistema de Planificación Académica v1.0
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
