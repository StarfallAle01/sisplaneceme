import { useState, useRef, useEffect } from 'react'
import { GitBranch, ChevronDown, Check } from 'lucide-react'
import { useMalla } from '../contexts/MallaContext'

const GOLD = '#C5A028'

/**
 * Botón "Seleccionar Malla Curricular" disponible en la barra superior de
 * todos los módulos. Permite que cualquier usuario (profesores incluidos)
 * elija qué malla curricular desea visualizar. La selección es global y se
 * comparte mediante MallaContext.
 */
export default function SelectorMalla() {
  const { mallas, selectedMalla, selectedMallaId, setSelectedMallaId } = useMalla()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Sin mallas disponibles (offline o sin datos): no se muestra el selector.
  if (!mallas || mallas.length === 0) return null

  const etiqueta = selectedMalla
    ? `${selectedMalla.nombre} (${selectedMalla.gestion || selectedMalla.year_start || selectedMalla.año || '—'})`
    : 'Seleccionar Malla Curricular'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{ backgroundColor: '#ffffff14', color: '#fff', border: `1px solid ${GOLD}55` }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ffffff22')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff14')}
        title="Seleccionar malla curricular"
      >
        <GitBranch size={15} style={{ color: GOLD }} />
        <span className="max-w-[220px] truncate">{etiqueta}</span>
        <ChevronDown size={14} style={{ opacity: 0.7 }} />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-72 rounded-lg overflow-hidden z-50 shadow-xl"
          style={{ backgroundColor: '#0A1628', border: `1px solid ${GOLD}40` }}
        >
          <p className="px-4 py-2 text-[10px] uppercase tracking-widest" style={{ color: '#94A3B8', borderBottom: `1px solid ${GOLD}20` }}>
            Seleccionar Malla Curricular
          </p>
          <div className="max-h-72 overflow-y-auto py-1">
            {mallas.map((m) => {
              const activa = m.id === selectedMallaId
              return (
                <button
                  key={m.id}
                  onClick={() => { setSelectedMallaId(m.id); setOpen(false) }}
                  className="flex items-center justify-between w-full px-4 py-2.5 text-left text-sm transition-colors"
                  style={{ color: activa ? GOLD : '#E2E8F0', backgroundColor: activa ? `${GOLD}14` : 'transparent' }}
                  onMouseEnter={(e) => { if (!activa) e.currentTarget.style.backgroundColor = '#ffffff08' }}
                  onMouseLeave={(e) => { if (!activa) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{m.nombre}</span>
                    <span className="block text-[11px]" style={{ color: '#94A3B8' }}>
                      {(m.gestion || m.year_start || m.año || '—')} · {m.estado}
                    </span>
                  </span>
                  {activa && <Check size={15} className="shrink-0" style={{ color: GOLD }} />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
