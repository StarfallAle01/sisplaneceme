import { useState } from 'react'
import {
  Save, RotateCcw, CheckCircle2, ExternalLink, Megaphone, Plus, Trash2,
} from 'lucide-react'
import {
  cargarPresentacion, guardarPresentacion, restablecerPresentacion,
  PRESENTACION_DEFAULT,
} from '../../data/presentacion'

const NAVY    = '#0A1628'
const GOLD    = '#C5A028'
const TEXT_LT = '#E2E8F0'
const DIM_LT  = '#94A3B8'

const inputStyle = { backgroundColor: '#ffffff0A', color: TEXT_LT, border: `1px solid ${GOLD}30` }

function Campo({ label, value, onChange, textarea, rows = 3, placeholder }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: TEXT_LT }}>{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-lg outline-none text-sm resize-y"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = GOLD)}
          onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = GOLD)}
          onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
        />
      )}
    </div>
  )
}

function Seccion({ titulo, children }) {
  return (
    <div className="rounded-lg p-5 space-y-4" style={{ backgroundColor: NAVY, border: `1px solid ${GOLD}20` }}>
      <h2 className="font-heading text-base font-semibold" style={{ color: GOLD }}>{titulo}</h2>
      {children}
    </div>
  )
}

export default function Presentacion() {
  const [data, setData]       = useState(() => cargarPresentacion())
  const [success, setSuccess] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const flash = (msg) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(null), 4000)
  }

  // Helpers de actualización inmutable.
  const setHeader   = (k, v) => setData(d => ({ ...d, header:   { ...d.header,   [k]: v } }))
  const setHero     = (k, v) => setData(d => ({ ...d, hero:     { ...d.hero,     [k]: v } }))
  const setFooter   = (k, v) => setData(d => ({ ...d, footer:   { ...d.footer,   [k]: v } }))
  const setCampo    = (k, v) => setData(d => ({ ...d, [k]: v }))

  const setParrafo  = (i, v) => setData(d => {
    const parrafos = [...d.programa.parrafos]; parrafos[i] = v
    return { ...d, programa: { ...d.programa, parrafos } }
  })
  const setFundamento = (i, v) => setData(d => {
    const fundamentos = [...d.programa.fundamentos]; fundamentos[i] = v
    return { ...d, programa: { ...d.programa, fundamentos } }
  })
  const addFundamento = () => setData(d => ({ ...d, programa: { ...d.programa, fundamentos: [...d.programa.fundamentos, ''] } }))
  const delFundamento = (i) => setData(d => ({ ...d, programa: { ...d.programa, fundamentos: d.programa.fundamentos.filter((_, j) => j !== i) } }))

  const setPilar = (i, k, v) => setData(d => {
    const pilares = d.pilares.map((p, j) => j === i ? { ...p, [k]: v } : p)
    return { ...d, pilares }
  })
  const setTitulacion = (i, k, v) => setData(d => {
    const titulaciones = d.titulaciones.map((t, j) => j === i ? { ...t, [k]: v } : t)
    return { ...d, titulaciones }
  })

  const handleGuardar = () => {
    guardarPresentacion(data)
    setModalOpen(true)
  }

  const handleRestablecer = () => {
    if (!confirm('¿Restablecer todos los textos a los valores por defecto? Se perderán los cambios guardados.')) return
    restablecerPresentacion()
    setData(structuredClone(PRESENTACION_DEFAULT))
    flash('Contenido restablecido a los valores por defecto.')
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Cabecera */}
      <div className="rounded-lg px-6 py-5 flex items-start justify-between gap-4" style={{ backgroundColor: NAVY }}>
        <div>
          <h1 className="font-heading font-semibold flex items-center gap-2" style={{ color: GOLD, fontSize: '28px' }}>
            <Megaphone size={26} /> Presentación
          </h1>
          <p style={{ color: DIM_LT, fontSize: '14px', marginTop: '4px' }}>
            Edita los textos de la página pública (landing) sin tocar el código.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium shrink-0 transition-colors"
          style={{ color: GOLD, backgroundColor: `${GOLD}15` }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${GOLD}30`)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${GOLD}15`)}
        >
          <ExternalLink size={15} /> Ver página
        </a>
      </div>

      {success && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#05966920', border: '1px solid #05966940', color: '#6EE7B7' }}>
          <CheckCircle2 size={16} /> {success}
        </div>
      )}

      {/* Encabezado del sitio */}
      <Seccion titulo="Encabezado">
        <Campo label="Línea superior (eyebrow)" value={data.header.eyebrow} onChange={(v) => setHeader('eyebrow', v)} />
        <Campo label="Nombre de la institución" value={data.header.institucion} onChange={(v) => setHeader('institucion', v)} />
      </Seccion>

      {/* Hero */}
      <Seccion titulo="Portada (Hero)">
        <Campo label="Título principal" value={data.hero.titulo} onChange={(v) => setHero('titulo', v)} />
        <Campo label="Subtítulo" value={data.hero.subtitulo} onChange={(v) => setHero('subtitulo', v)} />
        <Campo label="Descripción" value={data.hero.descripcion} onChange={(v) => setHero('descripcion', v)} textarea />
        <Campo label="Lema" value={data.hero.lema} onChange={(v) => setHero('lema', v)} />
      </Seccion>

      {/* Sobre el programa */}
      <Seccion titulo="Sobre el Programa">
        {data.programa.parrafos.map((p, i) => (
          <Campo key={i} label={`Párrafo ${i + 1}`} value={p} onChange={(v) => setParrafo(i, v)} textarea />
        ))}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium" style={{ color: TEXT_LT }}>Fundamentos Normativos</label>
            <button onClick={addFundamento} className="flex items-center gap-1 text-xs px-2 py-1 rounded" style={{ color: GOLD, backgroundColor: `${GOLD}15` }}>
              <Plus size={12} /> Agregar
            </button>
          </div>
          <div className="space-y-2">
            {data.programa.fundamentos.map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={f}
                  onChange={(e) => setFundamento(i, e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg outline-none text-sm"
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = GOLD)}
                  onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
                />
                <button onClick={() => delFundamento(i)} className="p-2 rounded-lg transition-colors" style={{ color: DIM_LT }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#EF4444')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
                  title="Quitar">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Seccion>

      {/* Pilares */}
      <Seccion titulo="Pilares de Formación">
        {data.pilares.map((p, i) => (
          <div key={i} className="space-y-2 pb-3" style={{ borderBottom: i < data.pilares.length - 1 ? `1px solid ${GOLD}15` : 'none' }}>
            <Campo label={`Pilar ${i + 1} — Título`} value={p.title} onChange={(v) => setPilar(i, 'title', v)} />
            <Campo label="Descripción" value={p.body} onChange={(v) => setPilar(i, 'body', v)} textarea />
          </div>
        ))}
      </Seccion>

      {/* Visión y Misión */}
      <Seccion titulo="Visión y Misión">
        <Campo label="Visión" value={data.vision} onChange={(v) => setCampo('vision', v)} textarea />
        <Campo label="Misión" value={data.mision} onChange={(v) => setCampo('mision', v)} textarea />
      </Seccion>

      {/* Titulación */}
      <Seccion titulo="Títulos">
        {data.titulaciones.map((t, i) => (
          <div key={i} className="space-y-2 pb-3" style={{ borderBottom: i < data.titulaciones.length - 1 ? `1px solid ${GOLD}15` : 'none' }}>
            <Campo label={`Título ${i + 1} — Nombre`} value={t.title} onChange={(v) => setTitulacion(i, 'title', v)} />
            <Campo label="Requisito" value={t.req} onChange={(v) => setTitulacion(i, 'req', v)} />
            <Campo label="Descripción" value={t.body} onChange={(v) => setTitulacion(i, 'body', v)} textarea />
          </div>
        ))}
      </Seccion>

      {/* Pie de página */}
      <Seccion titulo="Pie de página">
        <Campo label="Lema principal" value={data.footer.lemaPrincipal} onChange={(v) => setFooter('lemaPrincipal', v)} />
        <Campo label="Texto ECEME (una línea por renglón)" value={data.footer.eceme} onChange={(v) => setFooter('eceme', v)} textarea />
        <Campo label="Ubicación (una línea por renglón)" value={data.footer.ubicacion} onChange={(v) => setFooter('ubicacion', v)} textarea />
      </Seccion>

      {/* Acciones */}
      <div className="flex items-center justify-end gap-3 sticky bottom-0 py-3" style={{ backgroundColor: '#E8ECEF' }}>
        <button
          onClick={handleRestablecer}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style={{ color: DIM_LT, border: `1px solid ${DIM_LT}40` }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#FCA5A5')}
          onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
        >
          <RotateCcw size={16} /> Restablecer
        </button>
        <button
          onClick={handleGuardar}
          className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{ backgroundColor: GOLD, color: NAVY }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#D4B84C'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = GOLD; e.currentTarget.style.transform = 'translateY(0)' }}
        >
          <Save size={16} /> Guardar cambios
        </button>
      </div>

      {/* Modal de confirmación */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-sm rounded-xl overflow-hidden text-center px-8 py-8"
              style={{ backgroundColor: NAVY, border: `1px solid ${GOLD}30` }}
            >
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#05966920' }}
              >
                <CheckCircle2 size={36} style={{ color: '#6EE7B7' }} />
              </div>
              <h2 className="font-heading text-xl font-semibold mb-2" style={{ color: GOLD }}>
                ¡Cambios realizados!
              </h2>
              <p className="text-sm mb-6" style={{ color: DIM_LT }}>
                La presentación se actualizó correctamente y ya se refleja en la página pública.
              </p>
              <button
                onClick={() => setModalOpen(false)}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{ backgroundColor: GOLD, color: NAVY }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#D4B84C')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GOLD)}
              >
                Entendido
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
