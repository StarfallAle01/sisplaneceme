import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../services/api'
import { ChevronLeft, Loader2, AlertCircle, ArrowRight, Lock, BookOpen, Layers } from 'lucide-react'

const NAVY    = '#0A1628'
const GOLD    = '#C5A028'
const TEXT_LT = '#E2E8F0'
const DIM_LT  = '#94A3B8'

export default function EjesPorSemestre() {
  const { semestreId } = useParams()
  const navigate = useNavigate()

  const [semestre, setSemestre] = useState(null)
  const [ejes, setEjes]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [{ data: s }, { data: e }] = await Promise.all([
        api.get(`/mallas/semestres/${semestreId}`),
        api.get(`/mallas/semestres/${semestreId}/ejes`),
      ])
      setSemestre(s)
      setEjes(Array.isArray(e) ? e : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [semestreId])

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
        onClick={() => navigate(semestre?.malla_id ? `/admin/mallas/${semestre.malla_id}` : '/admin/mallas')}
        className="flex items-center gap-1 text-sm font-semibold transition-colors"
        style={{ color: NAVY }}
        onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
        onMouseLeave={(e) => (e.currentTarget.style.color = NAVY)}
      >
        <ChevronLeft size={16} /> Volver a la malla
      </button>

      <div className="rounded-lg px-6 py-5" style={{ backgroundColor: NAVY }}>
        <span className="text-[10px] uppercase tracking-wider" style={{ color: DIM_LT }}>
          {semestre?.ciclo || 'Semestre'}
        </span>
        <h1 className="font-heading font-semibold" style={{ color: GOLD, fontSize: '26px' }}>
          {semestre?.nombre || 'Semestre'}
        </h1>
        <p style={{ color: DIM_LT, fontSize: '13px', marginTop: '4px' }}>
          Ejes curriculares de este semestre
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ejes.map(eje => {
          const esTransversal = eje.tipo === 'transversal'
          return (
            <Link
              key={eje.id}
              to={`/admin/ejes/${eje.id}/modulos`}
              state={{ eje, semestre }}
              className="rounded-lg p-5 transition-all group"
              style={{
                backgroundColor: NAVY,
                border: `1px solid ${esTransversal ? '#5A6B7C40' : 'rgba(212,175,55,0.15)'}`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = esTransversal ? '#64748B' : GOLD)}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = esTransversal ? '#5A6B7C40' : 'rgba(212,175,55,0.15)')}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-medium"
                  style={{
                    backgroundColor: esTransversal ? '#5A6B7C30' : '#C5A02820',
                    color: esTransversal ? '#94A3B8' : '#FCD34D',
                  }}
                >
                  {esTransversal ? 'Transversal' : 'Académico'}
                </span>
                {esTransversal ? (
                  <Lock size={14} style={{ color: DIM_LT }} title="Módulos fijos del sistema" />
                ) : (
                  <ArrowRight size={16} style={{ color: DIM_LT }} className="group-hover:translate-x-1 transition-transform" />
                )}
              </div>
              <div className="flex items-center gap-2 mb-2">
                {esTransversal ? <Layers size={20} style={{ color: '#94A3B8' }} /> : <BookOpen size={20} style={{ color: GOLD }} />}
                <h3 className="font-heading text-lg font-medium" style={{ color: TEXT_LT }}>
                  {eje.nombre}
                </h3>
              </div>
              <p style={{ color: DIM_LT, fontSize: '12px' }}>
                {esTransversal
                  ? 'Contiene 3 módulos fijos. Solo se pueden agregar Unidades de Competencia.'
                  : 'Eje académico, agrega aquí los módulos y sus unidades de competencia.'}
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
