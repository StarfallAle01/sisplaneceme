import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import {
  Search, Loader2, AlertCircle, BookOpen, Settings2, X,
} from 'lucide-react'

const NAVY    = '#0A1628'
const GOLD    = '#C5A028'
const TEXT_LT = '#E2E8F0'
const DIM_LT  = '#94A3B8'

export default function GestionUnidades() {
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const debounceRef = useRef(null)

  const cargarResultados = useCallback(async (texto) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.get('/mallas/unidades-competencia', {
        params: { search: texto || '' },
      })
      setResultados(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Carga inicial con todas las UCs (limit 100)
  useEffect(() => {
    cargarResultados('')
  }, [cargarResultados])

  // Búsqueda con debounce 300ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      cargarResultados(busqueda)
    }, 300)
    return () => debounceRef.current && clearTimeout(debounceRef.current)
  }, [busqueda, cargarResultados])

  const limpiar = () => setBusqueda('')

  return (
    <div className="space-y-6">
      <div className="rounded-lg px-6 py-5" style={{ backgroundColor: NAVY }}>
        <h1 className="font-heading font-semibold" style={{ color: GOLD, fontSize: '28px' }}>
          Unidades de Competencia
        </h1>
        <p style={{ color: DIM_LT, fontSize: '14px', marginTop: '4px' }}>
          Buscar y editar contenidos de UCs por código o nombre
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#7F1D1D20', border: '1px solid #7F1D1D40', color: '#FCA5A5' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* ─── Barra de búsqueda ─── */}
      <div className="rounded-lg p-5" style={{ backgroundColor: NAVY, border: '1px solid rgba(197,160,40,0.15)' }}>
        <label className="block text-xs font-medium uppercase tracking-wider mb-2" style={{ color: DIM_LT }}>
          Buscar Unidad de Competencia
        </label>
        <div className="relative">
          <Search size={16} style={{ color: DIM_LT, position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Escribe código o nombre..."
            className="w-full pl-10 pr-10 py-2.5 rounded-lg outline-none text-sm transition-all"
            style={{
              backgroundColor: '#ffffff0A',
              color: TEXT_LT,
              border: `1px solid ${GOLD}30`,
            }}
            onFocus={(e) => (e.target.style.borderColor = GOLD)}
            onBlur={(e) => (e.target.style.borderColor = `${GOLD}30`)}
          />
          {busqueda && (
            <button
              onClick={limpiar}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded transition-colors"
              style={{ color: DIM_LT }}
              onMouseEnter={(e) => (e.currentTarget.style.color = TEXT_LT)}
              onMouseLeave={(e) => (e.currentTarget.style.color = DIM_LT)}
              title="Limpiar búsqueda"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <p className="text-[11px] mt-2" style={{ color: DIM_LT }}>
          {loading
            ? 'Buscando...'
            : busqueda
              ? `${resultados.length} resultados para "${busqueda}"`
              : `${resultados.length} unidades`}
        </p>
      </div>

      {/* ─── Tabla de resultados ─── */}
      {loading && resultados.length === 0 ? (
        <div className="text-center py-20" style={{ color: DIM_LT }}>
          <Loader2 size={32} className="mx-auto mb-3 animate-spin" />
          Cargando unidades de competencia...
        </div>
      ) : resultados.length === 0 ? (
        <div className="text-center py-20 rounded-lg" style={{ backgroundColor: NAVY }}>
          <BookOpen size={48} className="mx-auto mb-3" style={{ color: GOLD, opacity: 0.3 }} />
          <p style={{ color: TEXT_LT }}>
            {busqueda
              ? `No se encontraron UCs que coincidan con "${busqueda}".`
              : 'No hay Unidades de Competencia registradas.'}
          </p>
          {busqueda && (
            <p style={{ color: DIM_LT, fontSize: '12px', marginTop: '8px' }}>
              Intenta con otro término o limpia la búsqueda.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(197,160,40,0.15)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ backgroundColor: `${NAVY}CC`, borderBottom: `1px solid ${GOLD}20` }}>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Código</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Nombre</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Módulo</th>
                <th className="text-center px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Horas</th>
                <th className="text-right px-4 py-3 text-xs uppercase tracking-wider" style={{ color: DIM_LT }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((uc) => (
                <tr
                  key={uc.id}
                  className="transition-colors"
                  style={{ backgroundColor: NAVY, borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#2B4C7A')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = NAVY)}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-medium" style={{ color: GOLD }}>
                      {uc.codigo || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-sm" style={{ color: TEXT_LT }}>{uc.nombre}</p>
                    {uc.competencia_general && (
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: DIM_LT }}>
                        {uc.competencia_general}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {uc.modulos ? (
                      <div>
                        <span className="font-mono text-[11px]" style={{ color: GOLD, opacity: 0.8 }}>
                          {uc.modulos.codigo}
                        </span>
                        <p className="text-xs truncate max-w-[200px]" style={{ color: DIM_LT }}>
                          {uc.modulos.nombre}
                        </p>
                      </div>
                    ) : (
                      <span style={{ color: DIM_LT, fontSize: '12px' }}>-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span style={{ color: DIM_LT, fontSize: '13px' }}>
                      {uc.horas_totales || 0}h
                    </span>
                    {uc.dias > 0 && (
                      <p className="text-[10px]" style={{ color: DIM_LT, opacity: 0.7 }}>
                        {uc.dias} días
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/unidades/${uc.id}/editar`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{ color: GOLD, backgroundColor: `${GOLD}15` }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `${GOLD}30`)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = `${GOLD}15`)}
                      title="Editar contenidos avanzados"
                    >
                      <Settings2 size={12} /> Editar contenidos
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
