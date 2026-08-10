import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import semestresData from '../data/planData'
import api from '../services/api'
import { useMalla } from '../contexts/MallaContext'
import { Loader2 } from 'lucide-react'

const NAVY_DEEP = '#0A1628'
const NAVY_MID  = '#2B4C7A'
const GOLD      = '#C5A028'
const VIOLET    = '#3D2B56'
const TEXT_LT   = '#E2E8F0'
const CODE_LT   = '#7B90A8'

export default function MallaCurricular() {
  const navigate = useNavigate()
  const { selectedMallaId } = useMalla()
  const [mallaData, setMallaData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [usandoLocal, setUsandoLocal] = useState(false)

  const fetchMallaCompleta = useCallback(async (mallaId) => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await api.get(`/mallas/${mallaId}/completa`)
      setMallaData(data)
      setLoading(false)
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor.')
      setUsandoLocal(true)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedMallaId) {
      fetchMallaCompleta(selectedMallaId)
    } else {
      // Sin mallas en el servidor: usar datos locales de respaldo.
      setUsandoLocal(true)
      setLoading(false)
    }
  }, [selectedMallaId, fetchMallaCompleta])

  const mallaMeta = mallaData || null

  const rawSemestres = mallaData?.semestres && mallaData.semestres.length > 0
    ? mallaData.semestres
    : usandoLocal ? semestresData : semestresData

  const totalHorasCalc = rawSemestres.reduce(
    (sum, s) => sum + (s.total_horas || s.totalHoras || 0), 0
  )

  const headerTitle = mallaMeta
    ? `${mallaMeta.nombre || 'Plan de Estudios'} ${mallaMeta.gestion || ''}`
    : usandoLocal
      ? 'Plan de Estudios 2026'
      : 'Malla Curricular'

  const subtitle = mallaMeta
    ? `Plan de Estudios ${mallaMeta.gestion || ''} · ${rawSemestres.length} Semestres · ${totalHorasCalc.toLocaleString()} hrs`
    : usandoLocal
      ? `Datos locales · ${rawSemestres.length} Semestres · ${totalHorasCalc.toLocaleString()} hrs`
      : `${rawSemestres.length} Semestres · ${totalHorasCalc.toLocaleString()} hrs`

  return (
    <div className="space-y-6">

      <div
        className="rounded-lg px-6 py-5"
        style={{ backgroundColor: NAVY_DEEP }}
      >
        <h1
          className="font-heading font-semibold"
          style={{ color: GOLD, fontSize: '28px' }}
        >
          Malla Curricular
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '14px', marginTop: '4px' }}>
          {subtitle}
          {usandoLocal && (
            <span className="ml-2 text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#F59E0B20', color: '#FCD34D' }}>
              Modo offline
            </span>
          )}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20" style={{ color: '#94A3B8' }}>
          <Loader2 size={32} className="mx-auto mb-3 animate-spin" />
          Cargando malla curricular desde el servidor...
        </div>
      ) : error ? (
        <div className="text-center py-20" style={{ color: '#FCA5A5' }}>
          <p>Error al cargar la malla curricular.</p>
          <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>{error}</p>
          <button
            onClick={() => { setUsandoLocal(true); setError(null) }}
            className="mt-4 text-sm underline"
            style={{ color: GOLD }}
          >
            Usar datos locales
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
            {rawSemestres.map((sem) => (
              <button
                key={sem.id}
                onClick={() => navigate(`/malla/semestre/${sem.id}`)}
                className="text-left p-5 rounded-lg transition-all"
                style={{
                  backgroundColor: NAVY_DEEP,
                  borderTop: `4px solid ${GOLD}`,
                  borderRight: `1px solid rgba(212,175,55,0.25)`,
                  borderBottom: `1px solid rgba(212,175,55,0.25)`,
                  borderLeft: `1px solid rgba(212,175,55,0.25)`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderTopColor = VIOLET
                  e.currentTarget.style.backgroundColor = NAVY_MID
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.25)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderTopColor = GOLD
                  e.currentTarget.style.backgroundColor = NAVY_DEEP
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <p
                  className="font-heading font-bold"
                  style={{ color: GOLD, fontSize: '18px' }}
                >
                  {sem.nombre}
                </p>
                {sem.nombre_corto && (
                  <p style={{ color: '#64748B', fontSize: '11px', marginTop: '2px' }}>
                    {sem.nombre_corto}
                  </p>
                )}
                <p style={{ color: '#94A3B8', fontSize: '12px', marginTop: '6px' }}>
                  {sem.total_horas != null ? `${sem.total_horas.toLocaleString()} hrs` : sem.totalHoras != null ? `${sem.totalHoras.toLocaleString()} hrs` : '— hrs'}
                  {' · '}
                  {sem.total_dias != null ? `${sem.total_dias} días` : sem.totalDias != null ? `${sem.totalDias} días` : '— días'}
                </p>
                <p style={{ color: `${GOLD}80`, fontSize: '11px', marginTop: '4px' }}>
                  Ver detalle →
                </p>
              </button>
            ))}
          </div>

          <div className="space-y-5">
            {rawSemestres.map((sem) => {
              const ejes = sem.ejes_curriculares || sem.ejesCurriculares || []

              const ejeUCs = ejes.flatMap(eje => {
                const mods = eje.modulos || []
                return mods.flatMap(mod => mod.unidades_competencia || mod.unidadesCompetencia || [])
              })

              const ejeNombre = ejes.length > 0 ? ejes.map(e => e.nombre).join(' · ') : ''

              const rawTransversales = sem.transversales
              let txList = []
              if (Array.isArray(rawTransversales)) {
                txList = rawTransversales
              } else if (rawTransversales && typeof rawTransversales === 'object') {
                txList = [rawTransversales]
              }

              const txUCs = txList.flatMap(tx =>
                tx.unidades_competencia || tx.unidadesCompetencia || []
              )

              const allUCs = [...ejeUCs, ...txUCs]

              return (
                <div
                  key={sem.id}
                  className="rounded-lg overflow-hidden"
                  style={{ border: `1px solid rgba(212,175,55,0.15)` }}
                >
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ backgroundColor: NAVY_DEEP }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-1 h-5 rounded-full shrink-0"
                        style={{ backgroundColor: sem.color || GOLD }}
                      />
                      <h2
                        className="font-heading font-semibold shrink-0"
                        style={{ color: GOLD, fontSize: '16px' }}
                      >
                        {sem.nombre}
                      </h2>
                      <span
                        className="truncate"
                        style={{ color: '#64748B', fontSize: '12px' }}
                      >
                        {ejeNombre ? `— ${ejeNombre}` : ''}
                      </span>
                    </div>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ml-3"
                      style={{ backgroundColor: `${GOLD}18`, color: GOLD }}
                    >
                      {allUCs.length} materias
                    </span>
                  </div>

                  <div style={{ backgroundColor: NAVY_DEEP }}>
                    {allUCs.map((uc, idx) => (
                      <div
                        key={uc.codigo || idx}
                        className="flex items-baseline gap-3 px-4 py-2.5"
                        style={{
                          borderBottom:
                            idx < allUCs.length - 1
                              ? '1px solid rgba(255,255,255,0.05)'
                              : 'none',
                        }}
                      >
                        <span
                          className="font-mono font-bold shrink-0"
                          style={{
                            color: GOLD,
                            fontSize: '13px',
                            minWidth: '28px',
                            textAlign: 'right',
                          }}
                        >
                          {idx + 1}.
                        </span>
                        <span
                          className="flex-1 leading-snug"
                          style={{ color: TEXT_LT, fontSize: '14px' }}
                        >
                          {uc.nombre}
                        </span>
                        <span
                          className="font-mono shrink-0"
                          style={{ color: CODE_LT, fontSize: '11px' }}
                        >
                          ({uc.codigo})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
