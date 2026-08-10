import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import { ChevronLeft, Loader2, AlertCircle, ArrowRight, Calendar } from 'lucide-react'

const NAVY    = '#0A1628'
const GOLD    = '#C5A028'
const TEXT_LT = '#E2E8F0'
const DIM_LT  = '#94A3B8'

export default function DetalleMalla() {
  const { mallaId } = useParams()
  const navigate = useNavigate()

  const [malla, setMalla]         = useState(null)
  const [semestres, setSemestres] = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [{ data: m }, { data: s }] = await Promise.all([
        api.get(`/mallas/${mallaId}`),
        api.get(`/mallas/${mallaId}/semestres`),
      ])
      setMalla(m)
      setSemestres(Array.isArray(s) ? s : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [mallaId])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) {
    return (
      <div className="text-center py-20" style={{ color: DIM_LT }}>
        <Loader2 size={32} className="mx-auto mb-3 animate-spin" />
        Cargando...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm" style={{ backgroundColor: '#7F1D1D20', color: '#FCA5A5' }}>
        <AlertCircle size={16} /> {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/admin/mallas')}
        className="flex items-center gap-1 text-sm font-semibold transition-colors"
        style={{ color: NAVY }}
        onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
        onMouseLeave={(e) => (e.currentTarget.style.color = NAVY)}
      >
        <ChevronLeft size={16} /> Volver a mallas
      </button>

      <div className="rounded-lg px-6 py-5" style={{ backgroundColor: NAVY }}>
        <div className="flex items-center gap-3 mb-1.5">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded"
            style={{
              backgroundColor: malla?.estado === 'activo' ? '#10B98120' : '#F59E0B20',
              color: malla?.estado === 'activo' ? '#6EE7B7' : '#FCD34D',
            }}
          >
            {malla?.estado}
          </span>
          <span style={{ color: DIM_LT, fontSize: '13px' }}>
            <Calendar size={12} className="inline mr-1" />
            {malla?.year_start} – {malla?.year_end || (malla?.year_start + 1)}
          </span>
        </div>
        <h1 className="font-heading font-semibold" style={{ color: GOLD, fontSize: '26px' }}>
          {malla?.nombre}
        </h1>
        {malla?.descripcion && (
          <p style={{ color: DIM_LT, fontSize: '13px', marginTop: '4px' }}>{malla.descripcion}</p>
        )}
      </div>

      <div>
        <h2 className="font-heading text-lg font-medium mb-3" style={{ color: TEXT_LT }}>
          Semestres
        </h2>
        {semestres.length === 0 ? (
          <div className="text-center py-12 rounded-lg" style={{ backgroundColor: NAVY }}>
            <p style={{ color: DIM_LT }}>No hay semestres registrados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {semestres.map(sem => (
              <Link
                key={sem.id}
                to={`/admin/semestres/${sem.id}/ejes`}
                state={{ mallaId, malla }}
                className="rounded-lg p-5 transition-all group"
                style={{ backgroundColor: NAVY, border: '1px solid rgba(212,175,55,0.15)' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = GOLD)}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.15)')}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider" style={{ color: DIM_LT }}>
                    {sem.ciclo || `Año ${Math.ceil(sem.numero / 2)}`}
                  </span>
                  <ArrowRight size={16} style={{ color: DIM_LT }} className="group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="font-heading text-xl font-medium mb-1" style={{ color: GOLD }}>
                  {sem.nombre_corto || `Semestre ${sem.numero}`}
                </h3>
                <p style={{ color: TEXT_LT, fontSize: '13px' }}>{sem.nombre}</p>
                <div className="mt-3 pt-3 flex gap-4 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', color: DIM_LT }}>
                  <span>{sem.total_dias || 0} días</span>
                  <span>{sem.total_horas || 0} horas</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
